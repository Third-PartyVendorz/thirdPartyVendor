/**
 * Defines a handler function type for transforming HTML content.
 * This function receives an object with the HTML to be processed.
 *
 * @param ctx - An object containing the URL and HTML content to be transformed.
 * @returns The transformed HTML as a string or a promise that resolves to the transformed HTML.
 */
type HtmlTransformHandler = (ctx: {
    url: URL;
    html: string;
}) => string | Promise<string>;
/**
 * Defines the names of available hooks for registering and triggering custom logic within the application.
 */
type HookName = keyof HooksMapping;
/**
 * Mapping of hook names to their corresponding handler types.
 */
interface HooksMapping {
    'html:transform:pre': HtmlTransformHandler;
}
/**
 * Manages a collection of hooks and provides methods to register and execute them.
 * Hooks are functions that can be invoked with specific arguments to allow modifications or enhancements.
 */
declare class Hooks {
    /**
     * A map of hook names to arrays of hook functions.
     * Each hook name can have multiple associated functions, which are executed in sequence.
     */
    private readonly store;
    /**
     * Registers a new hook function under the specified hook name.
     * This function should be a function that takes an argument of type `T` and returns a `string` or `Promise<string>`.
     *
     * @template Hook - The type of the hook name. It should be one of the keys of `HooksMapping`.
     * @param name - The name of the hook under which the function will be registered.
     * @param handler - A function to be executed when the hook is triggered. The handler will be called with an argument
     *                  that may be modified by the hook functions.
     *
     * @remarks
     * - If there are existing handlers registered under the given hook name, the new handler will be added to the list.
     * - If no handlers are registered under the given hook name, a new list will be created with the handler as its first element.
     *
     * @example
     * ```typescript
     * hooks.on('html:transform:pre', async (ctx) => {
     *   return ctx.html.replace(/foo/g, 'bar');
     * });
     * ```
     */
    on<Hook extends HookName>(name: Hook, handler: HooksMapping[Hook]): void;
    /**
     * Checks if there are any hooks registered under the specified name.
     *
     * @param name - The name of the hook to check.
     * @returns `true` if there are hooks registered under the specified name, otherwise `false`.
     */
    has(name: HookName): boolean;
}

/**
 * Options for the Angular server application engine.
 */
interface AngularAppEngineOptions {
    /**
     * A set of allowed hostnames for the server application.
     */
    allowedHosts?: readonly string[];
    /**
     * Extends the scope of trusted proxy headers (`Forwarded` or `X-Forwarded-*`).
     *
     * @remarks
     * **This is a security-sensitive option!**
     *
     * When `trustProxyHeaders` is enabled, request headers such as `Forwarded`, `X-Forwarded-Host`, and
     * `X-Forwarded-Prefix` are trusted by the server and used for routing. These
     * headers must be strictly validated and provided by a trusted client (e.g., at a reverse proxy, load
     * balancer, or API gateway) and must *not* be provided by untrusted end users.
     *
     * If a `string[]` is provided, only those proxy headers are allowed.
     * If `true`, all proxy headers are allowed.
     * If `false` or not provided, proxy headers are ignored.
     *
     * @default false
     */
    trustProxyHeaders?: boolean | readonly string[];
}
/**
 * Angular server application engine.
 * Manages Angular server applications (including localized ones), handles rendering requests,
 * and optionally transforms index HTML before rendering.
 *
 * @remarks This class should be instantiated once and used as a singleton across the server-side
 * application to ensure consistent handling of rendering requests and resource management.
 */
declare class AngularAppEngine {
    /**
     * A flag to enable or disable the rendering of prerendered routes.
     *
     * Typically used during development to avoid prerendering all routes ahead of time,
     * allowing them to be rendered on the fly as requested.
     *
     * @private
     */
    static ɵallowStaticRouteRender: boolean;
    /**
     * A flag to enable or disable the allowed hosts check.
     *
     * Typically used during development to avoid the allowed hosts check.
     *
     * @private
     */
    static ɵdisableAllowedHostsCheck: boolean;
    /**
     * Hooks for extending or modifying the behavior of the server application.
     * These hooks are used by the Angular CLI when running the development server and
     * provide extensibility points for the application lifecycle.
     *
     * @private
     */
    static ɵhooks: Hooks;
    /**
     * The manifest for the server application.
     */
    private readonly manifest;
    /**
     * A set of allowed hostnames for the server application.
     */
    private readonly allowedHosts;
    /**
     * A map of supported locales from the server application's manifest.
     */
    private readonly supportedLocales;
    /**
     * The normalized allowed proxy headers.
     */
    private readonly trustProxyHeaders;
    /**
     * A cache that holds entry points, keyed by their potential locale string.
     */
    private readonly entryPointsCache;
    /**
     * Creates a new instance of the Angular server application engine.
     * @param options Options for the Angular server application engine.
     */
    constructor(options?: AngularAppEngineOptions);
    private getAllowedHosts;
    /**
     * Handles an incoming HTTP request by serving prerendered content, performing server-side rendering,
     * or delivering a static file for client-side rendered routes based on the `RenderMode` setting.
     *
     * @param request - The HTTP request to handle.
     * @param requestContext - Optional context for rendering, such as metadata associated with the request.
     * @returns A promise that resolves to the resulting HTTP response object, or `null` if no matching Angular route is found.
     *
     * @remarks A request to `https://www.example.com/page/index.html` will serve or render the Angular route
     * corresponding to `https://www.example.com/page`.
     *
     * @remarks
     * To prevent potential Server-Side Request Forgery (SSRF), this function verifies the hostname
     * of the `request.url` against a list of authorized hosts.
     * If the hostname is not recognized a 400 Bad Request is returned.
     *
     * Resolution:
     * Authorize your hostname by configuring `allowedHosts` in `angular.json` in:
     * `projects.[project-name].architect.build.options.security.allowedHosts`.
     * Alternatively, you pass it directly through the configuration options of `AngularAppEngine`.
     *
     * For more information see: https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf
     */
    handle(request: Request, requestContext?: unknown): Promise<Response | null>;
    /**
     * Handles requests for the base path when i18n is enabled.
     * Redirects the user to a locale-specific path based on the `Accept-Language` header.
     *
     * @param request The incoming request.
     * @returns A `Response` object with a 302 redirect, or `null` if i18n is not enabled
     *          or the request is not for the base path.
     */
    private redirectBasedOnAcceptLanguage;
    /**
     * Retrieves the Angular server application instance for a given request.
     *
     * This method checks if the request URL corresponds to an Angular application entry point.
     * If so, it initializes or retrieves an instance of the Angular server application for that entry point.
     * Requests that resemble file requests (except for `/index.html`) are skipped.
     *
     * @param request - The incoming HTTP request object.
     * @returns A promise that resolves to an `AngularServerApp` instance if a valid entry point is found,
     * or `null` if no entry point matches the request URL.
     */
    private getAngularServerAppForRequest;
    /**
     * Retrieves the exports for a specific entry point, caching the result.
     *
     * @param potentialLocale - The locale string used to find the corresponding entry point.
     * @returns A promise that resolves to the entry point exports or `undefined` if not found.
     */
    private getEntryPointExports;
    /**
     * Retrieves the entry point for a given URL by determining the locale and mapping it to
     * the appropriate application bundle.
     *
     * This method determines the appropriate entry point and locale for rendering the application by examining the URL.
     * If there is only one entry point available, it is returned regardless of the URL.
     * Otherwise, the method extracts a potential locale identifier from the URL and looks up the corresponding entry point.
     *
     * @param url - The URL of the request.
     * @returns A promise that resolves to the entry point exports or `undefined` if not found.
     */
    private getEntryPointExportsForUrl;
    /**
     * Handles validation errors by logging the error and returning an appropriate response.
     *
     * @param url - The URL of the request.
     * @param error - The validation error to handle.
     * @returns A `Response` object with a 400 status code.
     */
    private handleValidationError;
}

export { AngularAppEngine, Hooks };
export type { AngularAppEngineOptions };
