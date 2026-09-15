import { normalizeTrustProxyHeaders, sanitizeRequestHeaders, validateRequest } from './_validation-chunk.mjs';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { ɵConsole as _Console, ApplicationRef, REQUEST, makeEnvironmentProviders, provideEnvironmentInitializer, inject, InjectionToken, ɵENABLE_ROOT_COMPONENT_BOOTSTRAP as _ENABLE_ROOT_COMPONENT_BOOTSTRAP, Compiler, createEnvironmentInjector, EnvironmentInjector, runInInjectionContext, ɵresetCompiledComponents as _resetCompiledComponents, REQUEST_CONTEXT, RESPONSE_INIT, LOCALE_ID } from '@angular/core';
import { platformServer, INITIAL_CONFIG, ɵSERVER_CONTEXT as _SERVER_CONTEXT, ɵrenderInternal as _renderInternal, provideServerRendering as provideServerRendering$1 } from '@angular/platform-server';
import { ActivatedRoute, Router, ROUTES, ɵloadChildren as _loadChildren } from '@angular/router';
import Beasties from '../third_party/beasties/index.js';

class ServerAssets {
  manifest;
  constructor(manifest) {
    this.manifest = manifest;
  }
  getServerAsset(path) {
    const asset = this.manifest.assets[path];
    if (!asset) {
      throw new Error(`Server asset '${path}' does not exist.`);
    }
    return asset;
  }
  hasServerAsset(path) {
    return !!this.manifest.assets[path];
  }
  getIndexServerHtml() {
    return this.getServerAsset('index.server.html');
  }
}

const IGNORED_LOGS = new Set(['Angular is running in development mode.']);
class Console extends _Console {
  log(message) {
    if (!IGNORED_LOGS.has(message)) {
      super.log(message);
    }
  }
}

let angularAppManifest;
function setAngularAppManifest(manifest) {
  angularAppManifest = manifest;
}
function getAngularAppManifest() {
  if (!angularAppManifest) {
    throw new Error('Angular app manifest is not set. ' + `Please ensure you are using the '@angular/build:application' builder to build your server application.`);
  }
  return angularAppManifest;
}
let angularAppEngineManifest;
function setAngularAppEngineManifest(manifest) {
  angularAppEngineManifest = manifest;
}
function getAngularAppEngineManifest() {
  if (!angularAppEngineManifest) {
    throw new Error('Angular app engine manifest is not set. ' + `Please ensure you are using the '@angular/build:application' builder to build your server application.`);
  }
  return angularAppEngineManifest;
}

function stripTrailingSlash(url) {
  return url.length > 1 && url.at(-1) === '/' ? url.slice(0, -1) : url;
}
function stripLeadingSlash(url) {
  return url.length > 1 && url[0] === '/' ? url.slice(1) : url;
}
function addLeadingSlash(url) {
  return url[0] === '/' ? url : `/${url}`;
}
function addTrailingSlash(url) {
  return url.at(-1) === '/' ? url : `${url}/`;
}
function joinUrlParts(...parts) {
  const normalizedParts = [];
  for (const part of parts) {
    if (part === '') {
      continue;
    }
    let start = 0;
    let end = part.length;
    while (start < end && part[start] === '/') {
      start++;
    }
    while (end > start && part[end - 1] === '/') {
      end--;
    }
    if (start < end) {
      normalizedParts.push(part.slice(start, end));
    }
  }
  return addLeadingSlash(normalizedParts.join('/'));
}
function stripIndexHtmlFromURL(url) {
  if (url.pathname.endsWith('/index.html')) {
    const modifiedURL = new URL(url);
    modifiedURL.pathname = modifiedURL.pathname.slice(0, -11);
    return modifiedURL;
  }
  return url;
}
function buildPathWithParams(toPath, fromPath) {
  if (toPath[0] !== '/') {
    throw new Error(`Invalid toPath: The string must start with a '/'. Received: '${toPath}'`);
  }
  if (fromPath[0] !== '/') {
    throw new Error(`Invalid fromPath: The string must start with a '/'. Received: '${fromPath}'`);
  }
  if (!toPath.includes('/*')) {
    return toPath;
  }
  const fromPathParts = fromPath.split('/');
  const toPathParts = toPath.split('/');
  const resolvedParts = toPathParts.map((part, index) => toPathParts[index] === '*' ? fromPathParts[index] : part);
  return joinUrlParts(...resolvedParts);
}
const MATRIX_PARAMS_REGEX = /;[^/]+/g;
function stripMatrixParams(pathname) {
  return pathname.includes(';') ? pathname.replace(MATRIX_PARAMS_REGEX, '') : pathname;
}

async function renderAngular(html, bootstrap, url, platformProviders, serverContext) {
  const urlToRender = stripIndexHtmlFromURL(url);
  const platformRef = platformServer([{
    provide: INITIAL_CONFIG,
    useValue: {
      url: urlToRender.href,
      document: html
    }
  }, {
    provide: _SERVER_CONTEXT,
    useValue: serverContext
  }, {
    provide: _Console,
    useFactory: () => new Console()
  }, ...platformProviders]);
  let redirectTo;
  let hasNavigationError = true;
  try {
    let applicationRef;
    if (isNgModule(bootstrap)) {
      const moduleRef = await platformRef.bootstrapModule(bootstrap);
      applicationRef = moduleRef.injector.get(ApplicationRef);
    } else {
      applicationRef = await bootstrap({
        platformRef
      });
    }
    await applicationRef.whenStable();
    if (applicationRef.destroyed) {
      return {
        hasNavigationError: true
      };
    }
    const envInjector = applicationRef.injector;
    const routerIsProvided = !!envInjector.get(ActivatedRoute, null);
    const router = envInjector.get(Router);
    const lastSuccessfulNavigation = router.lastSuccessfulNavigation();
    if (!routerIsProvided) {
      hasNavigationError = false;
    } else if (lastSuccessfulNavigation?.finalUrl) {
      hasNavigationError = false;
      const requestPrefix = envInjector.get(APP_BASE_HREF, null, {
        optional: true
      }) ?? envInjector.get(REQUEST, null, {
        optional: true
      })?.headers.get('X-Forwarded-Prefix');
      const {
        pathname,
        search,
        hash
      } = envInjector.get(PlatformLocation);
      const finalUrl = constructSerializedUrl(router, {
        pathname,
        search,
        hash
      }, requestPrefix);
      const urlToRenderString = constructSerializedUrl(router, urlToRender, requestPrefix);
      if (urlToRenderString !== finalUrl) {
        redirectTo = [pathname, search, hash].join('');
      }
    }
    return {
      destroy: () => void asyncDestroyPlatform(platformRef),
      hasNavigationError,
      redirectTo,
      content: () => new Promise((resolve, reject) => {
        setTimeout(() => {
          _renderInternal(platformRef, applicationRef).then(resolve).catch(reject).finally(() => void asyncDestroyPlatform(platformRef));
        }, 0);
      })
    };
  } catch (error) {
    await asyncDestroyPlatform(platformRef);
    throw error;
  } finally {
    if (hasNavigationError || redirectTo) {
      void asyncDestroyPlatform(platformRef);
    }
  }
}
function isNgModule(value) {
  return 'ɵmod' in value;
}
function asyncDestroyPlatform(platformRef) {
  if (platformRef.destroyed) {
    return Promise.resolve();
  }
  return new Promise(resolve => {
    setTimeout(() => {
      if (!platformRef.destroyed) {
        platformRef.destroy();
      }
      resolve();
    }, 0);
  });
}
function constructSerializedUrl(router, url, prefix) {
  const {
    pathname,
    hash,
    search
  } = url;
  const urlParts = [];
  if (prefix && !addTrailingSlash(pathname).startsWith(addTrailingSlash(prefix))) {
    urlParts.push(joinUrlParts(prefix, pathname));
  } else {
    urlParts.push(stripTrailingSlash(pathname));
  }
  urlParts.push(search, hash);
  const urlTree = router.parseUrl(urlParts.join(''));
  return router.serializeUrl(urlTree);
}

function promiseWithAbort(promise, signal, errorMessagePrefix) {
  return new Promise((resolve, reject) => {
    const abortHandler = () => {
      reject(new DOMException(`${errorMessagePrefix} was aborted.\n${signal.reason}`, 'AbortError'));
    };
    if (signal.aborted) {
      abortHandler();
      return;
    }
    signal.addEventListener('abort', abortHandler, {
      once: true
    });
    promise.then(resolve).catch(reject).finally(() => {
      signal.removeEventListener('abort', abortHandler);
    });
  });
}

const VALID_REDIRECT_RESPONSE_CODES = new Set([301, 302, 303, 307, 308]);
function isValidRedirectResponseCode(code) {
  return VALID_REDIRECT_RESPONSE_CODES.has(code);
}
function createRedirectResponse(location, status = 302, headers) {
  if (ngDevMode && !isValidRedirectResponseCode(status)) {
    throw new Error(`Invalid redirect status code: ${status}. ` + `Please use one of the following redirect response codes: ${[...VALID_REDIRECT_RESPONSE_CODES.values()].join(', ')}.`);
  }
  const resHeaders = headers instanceof Headers ? headers : new Headers(headers);
  if (ngDevMode && resHeaders.has('location')) {
    console.warn(`Location header "${resHeaders.get('location')}" will be ignored and set to "${location}".`);
  }
  const varyArray = resHeaders.get('Vary')?.split(',') ?? [];
  const varySet = new Set(['X-Forwarded-Prefix']);
  for (const vary of varyArray) {
    const value = vary.trim();
    if (value) {
      varySet.add(value);
    }
  }
  resHeaders.set('Vary', [...varySet].join(', '));
  resHeaders.set('Location', location);
  return new Response(null, {
    status,
    headers: resHeaders
  });
}

const APP_SHELL_ROUTE = 'ng-app-shell';
var ServerRenderingFeatureKind;
(function (ServerRenderingFeatureKind) {
  ServerRenderingFeatureKind[ServerRenderingFeatureKind["AppShell"] = 0] = "AppShell";
  ServerRenderingFeatureKind[ServerRenderingFeatureKind["ServerRoutes"] = 1] = "ServerRoutes";
})(ServerRenderingFeatureKind || (ServerRenderingFeatureKind = {}));
var RenderMode;
(function (RenderMode) {
  RenderMode[RenderMode["Server"] = 0] = "Server";
  RenderMode[RenderMode["Client"] = 1] = "Client";
  RenderMode[RenderMode["Prerender"] = 2] = "Prerender";
})(RenderMode || (RenderMode = {}));
var PrerenderFallback;
(function (PrerenderFallback) {
  PrerenderFallback[PrerenderFallback["Server"] = 0] = "Server";
  PrerenderFallback[PrerenderFallback["Client"] = 1] = "Client";
  PrerenderFallback[PrerenderFallback["None"] = 2] = "None";
})(PrerenderFallback || (PrerenderFallback = {}));
const SERVER_ROUTES_CONFIG = new InjectionToken('SERVER_ROUTES_CONFIG');
function withRoutes(routes) {
  const config = {
    routes
  };
  return {
    ɵkind: ServerRenderingFeatureKind.ServerRoutes,
    ɵproviders: [{
      provide: SERVER_ROUTES_CONFIG,
      useValue: config
    }]
  };
}
function withAppShell(component) {
  const routeConfig = {
    path: APP_SHELL_ROUTE
  };
  if ('ɵcmp' in component) {
    routeConfig.component = component;
  } else {
    routeConfig.loadComponent = component;
  }
  return {
    ɵkind: ServerRenderingFeatureKind.AppShell,
    ɵproviders: [{
      provide: ROUTES,
      useValue: routeConfig,
      multi: true
    }, provideEnvironmentInitializer(() => {
      const config = inject(SERVER_ROUTES_CONFIG);
      config.appShellRoute = APP_SHELL_ROUTE;
    })]
  };
}
function provideServerRendering(...args) {
  let options;
  let features;
  if (hasOptions(args)) {
    const [first, ...rest] = args;
    options = first;
    features = rest;
  } else {
    features = args;
  }
  const providers = [provideServerRendering$1(options)];
  let hasAppShell = false;
  let hasServerRoutes = false;
  for (const {
    ɵkind,
    ɵproviders
  } of features) {
    hasAppShell ||= ɵkind === ServerRenderingFeatureKind.AppShell;
    hasServerRoutes ||= ɵkind === ServerRenderingFeatureKind.ServerRoutes;
    providers.push(...ɵproviders);
  }
  if (!hasServerRoutes && hasAppShell) {
    throw new Error(`Configuration error: found 'withAppShell()' without 'withRoutes()' in the same call to 'provideServerRendering()'.` + `The 'withAppShell()' function requires 'withRoutes()' to be used.`);
  }
  return makeEnvironmentProviders(providers);
}
function hasOptions(args) {
  const value = args[0];
  return !!value && typeof value === 'object' && !('ɵkind' in value);
}

class RouteTree {
  root = this.createEmptyRouteTreeNode();
  insert(route, metadata) {
    let node = this.root;
    const segments = this.getPathSegments(route);
    const normalizedSegments = [];
    for (const segment of segments) {
      const normalizedSegment = segment[0] === ':' ? '*' : segment;
      let childNode = node.children.get(normalizedSegment);
      if (!childNode) {
        childNode = this.createEmptyRouteTreeNode();
        node.children.set(normalizedSegment, childNode);
      }
      node = childNode;
      normalizedSegments.push(normalizedSegment);
    }
    node.metadata = {
      ...metadata,
      route: addLeadingSlash(normalizedSegments.join('/'))
    };
  }
  match(route) {
    const segments = this.getPathSegments(route);
    return this.traverseBySegments(segments)?.metadata;
  }
  toObject() {
    return Array.from(this.traverse());
  }
  static fromObject(value) {
    const tree = new RouteTree();
    for (const {
      route,
      ...metadata
    } of value) {
      tree.insert(route, metadata);
    }
    return tree;
  }
  *traverse(node = this.root) {
    if (node.metadata) {
      yield node.metadata;
    }
    for (const childNode of node.children.values()) {
      yield* this.traverse(childNode);
    }
  }
  getPathSegments(route) {
    return route.split('/').filter(Boolean).map(decodeURIComponent);
  }
  traverseBySegments(segments, node = this.root, currentIndex = 0) {
    if (currentIndex >= segments.length) {
      return node.metadata ? node : node.children.get('**');
    }
    if (!node.children.size) {
      return undefined;
    }
    const segment = segments[currentIndex];
    const exactMatch = node.children.get(segment);
    if (exactMatch) {
      const match = this.traverseBySegments(segments, exactMatch, currentIndex + 1);
      if (match) {
        return match;
      }
    }
    const wildcardMatch = node.children.get('*');
    if (wildcardMatch) {
      const match = this.traverseBySegments(segments, wildcardMatch, currentIndex + 1);
      if (match) {
        return match;
      }
    }
    return node.children.get('**');
  }
  createEmptyRouteTreeNode() {
    return {
      children: new Map()
    };
  }
}

const IS_DISCOVERING_ROUTES = new InjectionToken(typeof ngDevMode === 'undefined' || ngDevMode ? 'IS_DISCOVERING_ROUTES' : '', {
  providedIn: 'platform',
  factory: () => false
});
const MODULE_PRELOAD_MAX = 10;
const CATCH_ALL_REGEXP = /\/(\*\*)$/;
const URL_PARAMETER_REGEXP = /(?<!\\):([^/]+)/;
const URL_PARAMETER_GLOBAL_REGEXP = new RegExp(URL_PARAMETER_REGEXP, 'g');
async function* handleRoute(options) {
  try {
    const {
      metadata,
      currentRoutePath,
      route,
      compiler,
      parentInjector,
      serverConfigRouteTree,
      entryPointToBrowserMapping,
      invokeGetPrerenderParams,
      includePrerenderFallbackRoutes
    } = options;
    const {
      redirectTo,
      loadChildren,
      loadComponent,
      children,
      ɵentryName
    } = route;
    if (ɵentryName && loadComponent) {
      appendPreloadToMetadata(ɵentryName, entryPointToBrowserMapping, metadata);
    }
    if (metadata.renderMode === RenderMode.Prerender) {
      yield* handleSSGRoute(serverConfigRouteTree, typeof redirectTo === 'string' ? redirectTo : undefined, metadata, parentInjector, invokeGetPrerenderParams, includePrerenderFallbackRoutes);
    } else if (redirectTo !== undefined) {
      if (metadata.status && !isValidRedirectResponseCode(metadata.status)) {
        yield {
          error: `The '${metadata.status}' status code is not a valid redirect response code. ` + `Please use one of the following redirect response codes: ${[...VALID_REDIRECT_RESPONSE_CODES.values()].join(', ')}.`
        };
      } else if (typeof redirectTo === 'string') {
        yield {
          ...metadata,
          redirectTo: resolveRedirectTo(metadata.route, redirectTo)
        };
      } else {
        yield metadata;
      }
    } else {
      yield metadata;
    }
    if (children?.length) {
      yield* traverseRoutesConfig({
        ...options,
        routes: children,
        parentRoute: currentRoutePath,
        parentPreloads: metadata.preload
      });
    }
    if (loadChildren) {
      if (ɵentryName) {
        appendPreloadToMetadata(ɵentryName, entryPointToBrowserMapping, metadata);
      }
      const routeInjector = route.providers ? createEnvironmentInjector(route.providers, parentInjector.get(EnvironmentInjector), `Route: ${route.path}`) : parentInjector;
      const loadedChildRoutes = await _loadChildren(route, compiler, routeInjector);
      if (loadedChildRoutes) {
        const {
          routes: childRoutes,
          injector = routeInjector
        } = loadedChildRoutes;
        yield* traverseRoutesConfig({
          ...options,
          routes: childRoutes,
          parentInjector: injector,
          parentRoute: currentRoutePath,
          parentPreloads: metadata.preload
        });
      }
    }
  } catch (error) {
    yield {
      error: `Error in handleRoute for '${options.currentRoutePath}': ${error.message}`
    };
  }
}
async function* traverseRoutesConfig(options) {
  const {
    routes: routeConfigs,
    parentPreloads,
    parentRoute,
    serverConfigRouteTree
  } = options;
  for (const route of routeConfigs) {
    const {
      matcher,
      path = matcher ? '**' : ''
    } = route;
    const currentRoutePath = joinUrlParts(parentRoute, path);
    if (matcher && serverConfigRouteTree) {
      const matches = [];
      for (const matchedMetaData of serverConfigRouteTree.traverse()) {
        if (matchedMetaData.route.startsWith(currentRoutePath)) {
          matches.push(matchedMetaData);
        }
      }
      if (!matches.length) {
        const matchedMetaData = serverConfigRouteTree.match(currentRoutePath);
        if (matchedMetaData) {
          matches.push(matchedMetaData);
        }
      }
      for (const matchedMetaData of matches) {
        matchedMetaData.presentInClientRouter = true;
        if (matchedMetaData.renderMode === RenderMode.Prerender) {
          yield {
            error: `The route '${stripLeadingSlash(currentRoutePath)}' is set for prerendering but has a defined matcher. ` + `Routes with matchers cannot use prerendering. Please specify a different 'renderMode'.`
          };
          continue;
        }
        yield* handleRoute({
          ...options,
          currentRoutePath,
          route,
          metadata: {
            ...matchedMetaData,
            preload: parentPreloads,
            route: matchedMetaData.route,
            presentInClientRouter: undefined
          }
        });
      }
      if (!matches.length) {
        yield {
          error: `The route '${stripLeadingSlash(currentRoutePath)}' has a defined matcher but does not ` + 'match any route in the server routing configuration. Please ensure this route is added to the server routing configuration.'
        };
      }
      continue;
    }
    let matchedMetaData;
    if (serverConfigRouteTree) {
      matchedMetaData = serverConfigRouteTree.match(currentRoutePath);
      if (!matchedMetaData) {
        yield {
          error: `The '${stripLeadingSlash(currentRoutePath)}' route does not match any route defined in the server routing configuration. ` + 'Please ensure this route is added to the server routing configuration.'
        };
        continue;
      }
      matchedMetaData.presentInClientRouter = true;
    }
    yield* handleRoute({
      ...options,
      metadata: {
        renderMode: RenderMode.Prerender,
        ...matchedMetaData,
        preload: parentPreloads,
        route: path === '' ? addTrailingSlash(currentRoutePath) : currentRoutePath,
        presentInClientRouter: undefined
      },
      currentRoutePath,
      route
    });
  }
}
function appendPreloadToMetadata(entryName, entryPointToBrowserMapping, metadata) {
  const existingPreloads = metadata.preload ?? [];
  if (!entryPointToBrowserMapping || existingPreloads.length >= MODULE_PRELOAD_MAX) {
    return;
  }
  const preload = entryPointToBrowserMapping[entryName];
  if (!preload?.length) {
    return;
  }
  const combinedPreloads = new Set(existingPreloads);
  for (const href of preload) {
    combinedPreloads.add(href);
    if (combinedPreloads.size === MODULE_PRELOAD_MAX) {
      break;
    }
  }
  metadata.preload = Array.from(combinedPreloads);
}
async function* handleSSGRoute(serverConfigRouteTree, redirectTo, metadata, parentInjector, invokeGetPrerenderParams, includePrerenderFallbackRoutes) {
  if (metadata.renderMode !== RenderMode.Prerender) {
    throw new Error(`'handleSSGRoute' was called for a route which rendering mode is not prerender.`);
  }
  const {
    route: currentRoutePath,
    fallback,
    ...meta
  } = metadata;
  const getPrerenderParams = 'getPrerenderParams' in meta ? meta.getPrerenderParams : undefined;
  if ('getPrerenderParams' in meta) {
    delete meta['getPrerenderParams'];
  }
  if (redirectTo !== undefined) {
    meta.redirectTo = resolveRedirectTo(currentRoutePath, redirectTo);
  }
  const isCatchAllRoute = CATCH_ALL_REGEXP.test(currentRoutePath);
  if (isCatchAllRoute && !getPrerenderParams || !isCatchAllRoute && !URL_PARAMETER_REGEXP.test(currentRoutePath)) {
    yield {
      ...meta,
      route: currentRoutePath
    };
    return;
  }
  if (invokeGetPrerenderParams) {
    if (!getPrerenderParams) {
      yield {
        error: `The '${stripLeadingSlash(currentRoutePath)}' route uses prerendering and includes parameters, but 'getPrerenderParams' ` + `is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration ` + `or specify a different 'renderMode'.`
      };
      return;
    }
    if (serverConfigRouteTree) {
      const catchAllRoutePath = isCatchAllRoute ? currentRoutePath : joinUrlParts(currentRoutePath, '**');
      const match = serverConfigRouteTree.match(catchAllRoutePath);
      if (match && match.renderMode === RenderMode.Prerender && !('getPrerenderParams' in match)) {
        serverConfigRouteTree.insert(catchAllRoutePath, {
          ...match,
          presentInClientRouter: true,
          getPrerenderParams
        });
      }
    }
    const parameters = await runInInjectionContext(parentInjector, () => getPrerenderParams());
    try {
      for (const params of parameters) {
        const replacer = handlePrerenderParamsReplacement(params, currentRoutePath);
        const routeWithResolvedParams = currentRoutePath.replace(URL_PARAMETER_GLOBAL_REGEXP, replacer).replace(CATCH_ALL_REGEXP, replacer);
        yield {
          ...meta,
          route: routeWithResolvedParams,
          redirectTo: redirectTo === undefined ? undefined : resolveRedirectTo(routeWithResolvedParams, redirectTo)
        };
      }
    } catch (error) {
      yield {
        error: `${error.message}`
      };
      return;
    }
  }
  if (includePrerenderFallbackRoutes && (fallback !== PrerenderFallback.None || !invokeGetPrerenderParams)) {
    yield {
      ...meta,
      route: currentRoutePath,
      renderMode: fallback === PrerenderFallback.Client ? RenderMode.Client : RenderMode.Server
    };
  }
}
function handlePrerenderParamsReplacement(params, currentRoutePath) {
  return match => {
    const parameterName = match.slice(1);
    const value = params[parameterName];
    if (typeof value !== 'string') {
      throw new Error(`The 'getPrerenderParams' function defined for the '${stripLeadingSlash(currentRoutePath)}' route ` + `returned a non-string value for parameter '${parameterName}'. ` + `Please make sure the 'getPrerenderParams' function returns values for all parameters ` + 'specified in this route.');
    }
    return parameterName === '**' ? `/${value}` : value;
  };
}
function resolveRedirectTo(routePath, redirectTo) {
  if (redirectTo[0] === '/') {
    return redirectTo;
  }
  const segments = routePath.replace(URL_PARAMETER_GLOBAL_REGEXP, '*').split('/');
  segments.pop();
  return joinUrlParts(...segments, redirectTo);
}
function buildServerConfigRouteTree({
  routes,
  appShellRoute
}) {
  const serverRoutes = [...routes];
  if (appShellRoute !== undefined) {
    serverRoutes.unshift({
      path: appShellRoute,
      renderMode: RenderMode.Prerender
    });
  }
  const serverConfigRouteTree = new RouteTree();
  const errors = [];
  for (const {
    path,
    ...metadata
  } of serverRoutes) {
    if (path[0] === '/') {
      errors.push(`Invalid '${path}' route configuration: the path cannot start with a slash.`);
      continue;
    }
    if ('getPrerenderParams' in metadata && (path.includes('/*/') || path.endsWith('/*'))) {
      errors.push(`Invalid '${path}' route configuration: 'getPrerenderParams' cannot be used with a '*' route.`);
      continue;
    }
    serverConfigRouteTree.insert(path, metadata);
  }
  return {
    serverConfigRouteTree,
    errors
  };
}
async function getRoutesFromAngularRouterConfig(bootstrap, document, url, invokeGetPrerenderParams = false, includePrerenderFallbackRoutes = true, entryPointToBrowserMapping = undefined) {
  const {
    protocol,
    host
  } = url;
  const platformRef = platformServer([{
    provide: INITIAL_CONFIG,
    useValue: {
      document,
      url: `${protocol}//${host}/`
    }
  }, {
    provide: _Console,
    useFactory: () => new Console()
  }, {
    provide: _ENABLE_ROOT_COMPONENT_BOOTSTRAP,
    useValue: false
  }, {
    provide: IS_DISCOVERING_ROUTES,
    useValue: true
  }]);
  try {
    let applicationRef;
    if (isNgModule(bootstrap)) {
      const moduleRef = await platformRef.bootstrapModule(bootstrap);
      applicationRef = moduleRef.injector.get(ApplicationRef);
    } else {
      applicationRef = await bootstrap({
        platformRef
      });
    }
    const injector = applicationRef.injector;
    const router = injector.get(Router);
    router.navigationTransitions.afterPreactivation()?.next?.();
    await applicationRef.whenStable();
    const errors = [];
    const rawBaseHref = injector.get(APP_BASE_HREF, null, {
      optional: true
    }) ?? injector.get(PlatformLocation).getBaseHrefFromDOM();
    const {
      pathname: baseHref
    } = new URL(rawBaseHref, 'http://localhost');
    const compiler = injector.get(Compiler);
    const serverRoutesConfig = injector.get(SERVER_ROUTES_CONFIG, null, {
      optional: true
    });
    let serverConfigRouteTree;
    if (serverRoutesConfig) {
      const result = buildServerConfigRouteTree(serverRoutesConfig);
      serverConfigRouteTree = result.serverConfigRouteTree;
      errors.push(...result.errors);
    }
    if (errors.length) {
      return {
        baseHref,
        routes: [],
        errors
      };
    }
    const routesResults = [];
    if (router.config.length) {
      const traverseRoutes = traverseRoutesConfig({
        routes: router.config,
        compiler,
        parentInjector: injector,
        parentRoute: '',
        serverConfigRouteTree,
        invokeGetPrerenderParams,
        includePrerenderFallbackRoutes,
        entryPointToBrowserMapping
      });
      const seenRoutes = new Set();
      for await (const routeMetadata of traverseRoutes) {
        if ('error' in routeMetadata) {
          errors.push(routeMetadata.error);
          continue;
        }
        const routePath = routeMetadata.route;
        if (!seenRoutes.has(routePath)) {
          routesResults.push(routeMetadata);
          seenRoutes.add(routePath);
        }
      }
      await new Promise(resolve => setTimeout(resolve, 0));
      if (serverConfigRouteTree) {
        for (const {
          route,
          presentInClientRouter
        } of serverConfigRouteTree.traverse()) {
          if (presentInClientRouter || route.endsWith('/**')) {
            continue;
          }
          errors.push(`The '${stripLeadingSlash(route)}' server route does not match any routes defined in the Angular ` + `routing configuration (typically provided as a part of the 'provideRouter' call). ` + 'Please make sure that the mentioned server route is present in the Angular routing configuration.');
        }
      }
    } else {
      const rootRouteMetadata = serverConfigRouteTree?.match('') ?? {
        route: '',
        renderMode: RenderMode.Prerender
      };
      routesResults.push({
        ...rootRouteMetadata,
        route: ''
      });
    }
    return {
      baseHref,
      routes: routesResults,
      errors,
      appShellRoute: serverRoutesConfig?.appShellRoute
    };
  } finally {
    platformRef.destroy();
  }
}
function extractRoutesAndCreateRouteTree(options) {
  const {
    url,
    manifest = getAngularAppManifest(),
    invokeGetPrerenderParams = false,
    includePrerenderFallbackRoutes = true,
    signal
  } = options;
  async function extract() {
    const routeTree = new RouteTree();
    const document = await new ServerAssets(manifest).getIndexServerHtml().text();
    const bootstrap = await manifest.bootstrap();
    const {
      baseHref,
      appShellRoute,
      routes,
      errors
    } = await getRoutesFromAngularRouterConfig(bootstrap, document, url, invokeGetPrerenderParams, includePrerenderFallbackRoutes, manifest.entryPointToBrowserMapping);
    for (const {
      route,
      ...metadata
    } of routes) {
      if (metadata.redirectTo !== undefined) {
        metadata.redirectTo = joinUrlParts(baseHref, metadata.redirectTo);
      }
      for (const [key, value] of Object.entries(metadata)) {
        if (value === undefined) {
          delete metadata[key];
        }
      }
      const fullRoute = joinUrlParts(baseHref, route);
      routeTree.insert(fullRoute, metadata);
    }
    return {
      appShellRoute,
      routeTree,
      errors
    };
  }
  return signal ? promiseWithAbort(extract(), signal, 'Routes extraction') : extract();
}

class Hooks {
  store = new Map();
  async run(name, context) {
    const hooks = this.store.get(name);
    switch (name) {
      case 'html:transform:pre':
        {
          if (!hooks) {
            return context.html;
          }
          const ctx = {
            ...context
          };
          for (const hook of hooks) {
            ctx.html = await hook(ctx);
          }
          return ctx.html;
        }
      default:
        throw new Error(`Running hook "${name}" is not supported.`);
    }
  }
  on(name, handler) {
    const hooks = this.store.get(name);
    if (hooks) {
      hooks.push(handler);
    } else {
      this.store.set(name, [handler]);
    }
  }
  has(name) {
    return !!this.store.get(name)?.length;
  }
}

class ServerRouter {
  routeTree;
  constructor(routeTree) {
    this.routeTree = routeTree;
  }
  static #extractionPromise;
  static from(manifest, url) {
    if (manifest.routes) {
      const routeTree = RouteTree.fromObject(manifest.routes);
      return Promise.resolve(new ServerRouter(routeTree));
    }
    ServerRouter.#extractionPromise ??= extractRoutesAndCreateRouteTree({
      url,
      manifest
    }).then(({
      routeTree,
      errors
    }) => {
      if (errors.length > 0) {
        throw new Error('Error(s) occurred while extracting routes:\n' + errors.map(error => `- ${error}`).join('\n'));
      }
      return new ServerRouter(routeTree);
    }).finally(() => {
      ServerRouter.#extractionPromise = undefined;
    });
    return ServerRouter.#extractionPromise;
  }
  match(url) {
    let {
      pathname
    } = stripIndexHtmlFromURL(url);
    pathname = stripMatrixParams(pathname);
    return this.routeTree.match(pathname);
  }
}

async function sha256(data) {
  const encodedData = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
  const hashParts = [];
  for (const h of new Uint8Array(hashBuffer)) {
    hashParts.push(h.toString(16).padStart(2, '0'));
  }
  return hashParts.join('');
}

const MEDIA_SET_HANDLER_PATTERN = /^this\.media=["'](.*)["'];?$/;
const CSP_MEDIA_ATTR = 'ngCspMedia';
const LINK_LOAD_SCRIPT_CONTENT = /* @__PURE__ */(() => `(() => {
  const CSP_MEDIA_ATTR = '${CSP_MEDIA_ATTR}';
  const documentElement = document.documentElement;

  // Listener for load events on link tags.
  const listener = (e) => {
    const target = e.target;
    if (
      !target ||
      target.tagName !== 'LINK' ||
      !target.hasAttribute(CSP_MEDIA_ATTR)
    ) {
      return;
    }

    target.media = target.getAttribute(CSP_MEDIA_ATTR);
    target.removeAttribute(CSP_MEDIA_ATTR);

    if (!document.head.querySelector(\`link[\${CSP_MEDIA_ATTR}]\`)) {
      documentElement.removeEventListener('load', listener);
    }
  };

  documentElement.addEventListener('load', listener, true);
})();`)();
class BeastiesBase extends Beasties {}
class InlineCriticalCssProcessor extends BeastiesBase {
  readFile;
  outputPath;
  addedCspScriptsDocuments = new WeakSet();
  documentNonces = new WeakMap();
  constructor(readFile, outputPath) {
    super({
      logger: {
        warn: s => console.warn(s),
        error: s => console.error(s),
        info: () => {}
      },
      logLevel: 'warn',
      path: outputPath,
      publicPath: undefined,
      compress: false,
      pruneSource: false,
      reduceInlineStyles: false,
      mergeStylesheets: false,
      preload: 'media',
      noscriptFallback: true,
      inlineFonts: true
    });
    this.readFile = readFile;
    this.outputPath = outputPath;
  }
  async embedLinkedStylesheet(link, document) {
    if (link.getAttribute('media') === 'print' && link.next?.name === 'noscript') {
      const media = link.getAttribute('onload')?.match(MEDIA_SET_HANDLER_PATTERN);
      if (media) {
        link.removeAttribute('onload');
        link.setAttribute('media', media[1]);
        link?.next?.remove();
      }
    }
    const returnValue = await super.embedLinkedStylesheet(link, document);
    const cspNonce = this.findCspNonce(document);
    if (cspNonce) {
      const beastiesMedia = link.getAttribute('onload')?.match(MEDIA_SET_HANDLER_PATTERN);
      if (beastiesMedia) {
        link.removeAttribute('onload');
        link.setAttribute(CSP_MEDIA_ATTR, beastiesMedia[1]);
        this.conditionallyInsertCspLoadingScript(document, cspNonce, link);
      }
      document.head.children.forEach(child => {
        if (child.tagName === 'style' && !child.hasAttribute('nonce')) {
          child.setAttribute('nonce', cspNonce);
        }
      });
    }
    return returnValue;
  }
  findCspNonce(document) {
    if (this.documentNonces.has(document)) {
      return this.documentNonces.get(document);
    }
    const nonceElement = document.querySelector('[ngCspNonce], [ngcspnonce]');
    const cspNonce = nonceElement?.getAttribute('ngCspNonce') || nonceElement?.getAttribute('ngcspnonce') || null;
    this.documentNonces.set(document, cspNonce);
    return cspNonce;
  }
  conditionallyInsertCspLoadingScript(document, nonce, link) {
    if (this.addedCspScriptsDocuments.has(document)) {
      return;
    }
    if (document.head.textContent.includes(LINK_LOAD_SCRIPT_CONTENT)) {
      this.addedCspScriptsDocuments.add(document);
      return;
    }
    const script = document.createElement('script');
    script.setAttribute('nonce', nonce);
    script.textContent = LINK_LOAD_SCRIPT_CONTENT;
    document.head.insertBefore(script, link);
    this.addedCspScriptsDocuments.add(document);
  }
}

class LRUCache {
  capacity;
  cache = new Map();
  head;
  tail;
  constructor(capacity) {
    this.capacity = capacity;
  }
  get(key) {
    const node = this.cache.get(key);
    if (node) {
      this.moveToHead(node);
      return node.value;
    }
    return undefined;
  }
  put(key, value) {
    const cachedNode = this.cache.get(key);
    if (cachedNode) {
      cachedNode.value = value;
      this.moveToHead(cachedNode);
      return;
    }
    const newNode = {
      key,
      value,
      prev: undefined,
      next: undefined
    };
    this.cache.set(key, newNode);
    this.addToHead(newNode);
    if (this.cache.size > this.capacity) {
      const tail = this.removeTail();
      if (tail) {
        this.cache.delete(tail.key);
      }
    }
  }
  addToHead(node) {
    node.next = this.head;
    node.prev = undefined;
    if (this.head) {
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
  }
  removeNode(node) {
    if (node.prev) {
      node.prev.next = node.next;
    } else {
      this.head = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    } else {
      this.tail = node.prev;
    }
  }
  moveToHead(node) {
    this.removeNode(node);
    this.addToHead(node);
  }
  removeTail() {
    const node = this.tail;
    if (node) {
      this.removeNode(node);
    }
    return node;
  }
}

const WELL_KNOWN_NON_ANGULAR_URLS = new Set(['/favicon.ico', '/.well-known/appspecific/com.chrome.devtools.json']);
const MAX_INLINE_CSS_CACHE_ENTRIES = 50;
const SERVER_CONTEXT_VALUE = {
  [RenderMode.Prerender]: 'ssg',
  [RenderMode.Server]: 'ssr',
  [RenderMode.Client]: ''
};
class AngularServerApp {
  options;
  allowStaticRouteRender;
  hooks;
  constructor(options = {}) {
    this.options = options;
    this.allowStaticRouteRender = this.options.allowStaticRouteRender ?? false;
    this.hooks = options.hooks ?? new Hooks();
    if (this.manifest.inlineCriticalCss) {
      this.inlineCriticalCssProcessor = new InlineCriticalCssProcessor(path => {
        const fileName = path.split('/').pop() ?? path;
        return this.assets.getServerAsset(fileName).text();
      });
    }
  }
  manifest = getAngularAppManifest();
  assets = new ServerAssets(this.manifest);
  router;
  inlineCriticalCssProcessor;
  boostrap;
  textDecoder = new TextEncoder();
  criticalCssLRUCache = new LRUCache(MAX_INLINE_CSS_CACHE_ENTRIES);
  async handle(request, requestContext) {
    const url = new URL(request.url);
    if (WELL_KNOWN_NON_ANGULAR_URLS.has(url.pathname)) {
      return null;
    }
    this.router ??= await ServerRouter.from(this.manifest, url);
    const matchedRoute = this.router.match(url);
    if (!matchedRoute) {
      return null;
    }
    const {
      redirectTo,
      status,
      renderMode,
      headers
    } = matchedRoute;
    if (redirectTo !== undefined) {
      return createRedirectResponse(joinUrlParts(request.headers.get('X-Forwarded-Prefix') ?? '', buildPathWithParams(redirectTo, url.pathname)), status, headers);
    }
    if (renderMode === RenderMode.Prerender) {
      const response = await this.handleServe(request, matchedRoute);
      if (response) {
        return response;
      }
    }
    return promiseWithAbort(this.handleRendering(request, matchedRoute, requestContext), request.signal, `Request for: ${request.url}`);
  }
  async handleServe(request, matchedRoute) {
    const {
      headers,
      renderMode
    } = matchedRoute;
    if (renderMode !== RenderMode.Prerender) {
      return null;
    }
    const {
      method
    } = request;
    if (method !== 'GET' && method !== 'HEAD') {
      return null;
    }
    const assetPath = this.buildServerAssetPathFromRequest(request);
    const {
      manifest: {
        locale
      },
      assets
    } = this;
    if (!assets.hasServerAsset(assetPath)) {
      return null;
    }
    const {
      text,
      hash,
      size
    } = assets.getServerAsset(assetPath);
    const etag = `"${hash}"`;
    return request.headers.get('if-none-match') === etag ? new Response(undefined, {
      status: 304,
      statusText: 'Not Modified'
    }) : new Response(await text(), {
      headers: {
        'Content-Length': size.toString(),
        'ETag': etag,
        'Content-Type': 'text/html;charset=UTF-8',
        ...(locale !== undefined ? {
          'Content-Language': locale
        } : {}),
        ...headers
      }
    });
  }
  async handleRendering(request, matchedRoute, requestContext) {
    const {
      renderMode,
      headers,
      status,
      preload
    } = matchedRoute;
    if (!this.allowStaticRouteRender && renderMode === RenderMode.Prerender) {
      return null;
    }
    const url = new URL(request.url);
    const platformProviders = [];
    const {
      manifest: {
        bootstrap,
        locale
      },
      assets
    } = this;
    const responseInit = {
      status,
      headers: new Headers({
        'Content-Type': 'text/html;charset=UTF-8',
        ...(locale !== undefined ? {
          'Content-Language': locale
        } : {}),
        ...headers
      })
    };
    if (renderMode === RenderMode.Server) {
      platformProviders.push({
        provide: REQUEST,
        useValue: request
      }, {
        provide: REQUEST_CONTEXT,
        useValue: requestContext
      }, {
        provide: RESPONSE_INIT,
        useValue: responseInit
      });
    } else if (renderMode === RenderMode.Client) {
      let html = await this.assets.getServerAsset('index.csr.html').text();
      html = await this.runTransformsOnHtml(html, url, preload);
      return new Response(html, responseInit);
    }
    if (locale !== undefined) {
      platformProviders.push({
        provide: LOCALE_ID,
        useValue: locale
      });
    }
    this.boostrap ??= await bootstrap();
    let html = await assets.getIndexServerHtml().text();
    html = await this.runTransformsOnHtml(html, url, preload);
    const result = await renderAngular(html, this.boostrap, url, platformProviders, SERVER_CONTEXT_VALUE[renderMode]);
    if (result.hasNavigationError) {
      return null;
    }
    if (result.redirectTo) {
      return createRedirectResponse(result.redirectTo, responseInit.status, responseInit.headers);
    }
    if (renderMode === RenderMode.Prerender) {
      const renderedHtml = await result.content();
      const finalHtml = await this.inlineCriticalCss(renderedHtml, url);
      return new Response(finalHtml, responseInit);
    }
    const stream = new ReadableStream({
      start: async controller => {
        try {
          const renderedHtml = await result.content();
          const finalHtml = await this.inlineCriticalCssWithCache(renderedHtml, url);
          controller.enqueue(finalHtml);
          controller.close();
        } catch (error) {
          result.destroy();
          controller.error(error);
        }
      },
      cancel: () => {
        result.destroy();
      }
    });
    return new Response(stream, responseInit);
  }
  async inlineCriticalCss(html, url) {
    const {
      inlineCriticalCssProcessor
    } = this;
    if (!inlineCriticalCssProcessor) {
      return html;
    }
    try {
      return await inlineCriticalCssProcessor.process(html);
    } catch (error) {
      console.error(`An error occurred while inlining critical CSS for: ${url}.`, error);
      return html;
    }
  }
  async inlineCriticalCssWithCache(html, url) {
    const {
      inlineCriticalCssProcessor,
      criticalCssLRUCache,
      textDecoder
    } = this;
    if (!inlineCriticalCssProcessor) {
      return textDecoder.encode(html);
    }
    const cacheKey = url.toString();
    const cached = criticalCssLRUCache.get(cacheKey);
    const shaOfContentPreInlinedCss = await sha256(html);
    if (cached?.shaOfContentPreInlinedCss === shaOfContentPreInlinedCss) {
      return cached.contentWithCriticialCSS;
    }
    const processedHtml = await this.inlineCriticalCss(html, url);
    const finalHtml = textDecoder.encode(processedHtml);
    criticalCssLRUCache.put(cacheKey, {
      shaOfContentPreInlinedCss,
      contentWithCriticialCSS: finalHtml
    });
    return finalHtml;
  }
  buildServerAssetPathFromRequest(request) {
    let {
      pathname: assetPath
    } = new URL(request.url);
    try {
      assetPath = decodeURIComponent(assetPath);
    } catch {}
    if (!assetPath.endsWith('/index.html')) {
      assetPath = joinUrlParts(assetPath, 'index.html');
    }
    const {
      baseHref
    } = this.manifest;
    if (baseHref.length > 1 && assetPath.startsWith(baseHref)) {
      assetPath = assetPath.slice(baseHref.length);
    }
    return stripLeadingSlash(assetPath);
  }
  async runTransformsOnHtml(html, url, preload) {
    if (this.hooks.has('html:transform:pre')) {
      html = await this.hooks.run('html:transform:pre', {
        html,
        url
      });
    }
    if (preload?.length) {
      html = appendPreloadHintsToHtml(html, preload);
    }
    return html;
  }
}
let angularServerApp;
function getOrCreateAngularServerApp(options) {
  return angularServerApp ??= new AngularServerApp(options);
}
function destroyAngularServerApp() {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    _resetCompiledComponents();
  }
  angularServerApp = undefined;
}
function appendPreloadHintsToHtml(html, preload) {
  const bodyCloseIdx = html.lastIndexOf('</body>');
  if (bodyCloseIdx === -1) {
    return html;
  }
  return [html.slice(0, bodyCloseIdx), ...preload.map(val => `<link rel="modulepreload" href="${val}">`), html.slice(bodyCloseIdx)].join('\n');
}

function getPotentialLocaleIdFromUrl(url, basePath) {
  const {
    pathname
  } = url;
  let start = basePath.length;
  if (pathname[start] === '/') {
    start++;
  }
  let end = pathname.indexOf('/', start);
  if (end === -1) {
    end = pathname.length;
  }
  return pathname.slice(start, end);
}
function parseLanguageHeader(header) {
  if (header === '*') {
    return new Map([['*', 1]]);
  }
  const parsedValues = header.split(',').map(item => {
    const [locale, qualityValue] = item.split(';', 2).map(v => v.trim());
    let quality = qualityValue?.startsWith('q=') ? parseFloat(qualityValue.slice(2)) : undefined;
    if (typeof quality !== 'number' || isNaN(quality) || quality < 0 || quality > 1) {
      quality = 1;
    }
    return [locale, quality];
  }).sort(([_localeA, qualityA], [_localeB, qualityB]) => qualityB - qualityA);
  return new Map(parsedValues);
}
function getPreferredLocale(header, supportedLocales) {
  if (supportedLocales.length < 2) {
    return supportedLocales[0];
  }
  const parsedLocales = parseLanguageHeader(header);
  if (parsedLocales.size === 0 || parsedLocales.size === 1 && parsedLocales.has('*')) {
    return supportedLocales[0];
  }
  const normalizedSupportedLocales = new Map();
  for (const locale of supportedLocales) {
    normalizedSupportedLocales.set(normalizeLocale(locale), locale);
  }
  let bestMatch;
  const qualityZeroNormalizedLocales = new Set();
  for (const [locale, quality] of parsedLocales) {
    const normalizedLocale = normalizeLocale(locale);
    if (quality === 0) {
      qualityZeroNormalizedLocales.add(normalizedLocale);
      continue;
    }
    if (normalizedSupportedLocales.has(normalizedLocale)) {
      return normalizedSupportedLocales.get(normalizedLocale);
    }
    if (bestMatch !== undefined) {
      continue;
    }
    const [languagePrefix] = normalizedLocale.split('-', 1);
    for (const supportedLocale of normalizedSupportedLocales.keys()) {
      if (supportedLocale.startsWith(languagePrefix)) {
        bestMatch = normalizedSupportedLocales.get(supportedLocale);
        break;
      }
    }
  }
  if (bestMatch !== undefined) {
    return bestMatch;
  }
  for (const [normalizedLocale, locale] of normalizedSupportedLocales) {
    if (!qualityZeroNormalizedLocales.has(normalizedLocale)) {
      return locale;
    }
  }
}
function normalizeLocale(locale) {
  return locale.toLowerCase();
}

class AngularAppEngine {
  static ɵallowStaticRouteRender = false;
  static ɵdisableAllowedHostsCheck = false;
  static ɵhooks = new Hooks();
  manifest = getAngularAppEngineManifest();
  allowedHosts;
  supportedLocales = Object.keys(this.manifest.supportedLocales);
  trustProxyHeaders;
  entryPointsCache = new Map();
  constructor(options) {
    this.allowedHosts = this.getAllowedHosts(options);
    this.trustProxyHeaders = normalizeTrustProxyHeaders(options?.trustProxyHeaders);
  }
  getAllowedHosts(options) {
    const allowedHosts = new Set([...(options?.allowedHosts ?? []), ...this.manifest.allowedHosts]);
    if (allowedHosts.has('*')) {
      console.warn('Allowing all hosts via "*" is a security risk. This configuration should only be used when ' + 'validation for "Host" and "X-Forwarded-Host" headers is performed in another layer, such as a load balancer or reverse proxy. ' + 'For more information see: https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf');
    }
    return allowedHosts;
  }
  async handle(request, requestContext) {
    const allowedHost = this.allowedHosts;
    const securedRequest = sanitizeRequestHeaders(request, this.trustProxyHeaders);
    try {
      validateRequest(securedRequest, allowedHost, AngularAppEngine.ɵdisableAllowedHostsCheck);
    } catch (error) {
      return this.handleValidationError(securedRequest.url, error);
    }
    const serverApp = await this.getAngularServerAppForRequest(securedRequest);
    if (serverApp) {
      return serverApp.handle(securedRequest, requestContext);
    }
    if (this.supportedLocales.length > 1) {
      return this.redirectBasedOnAcceptLanguage(securedRequest);
    }
    return null;
  }
  redirectBasedOnAcceptLanguage(request) {
    const {
      basePath,
      supportedLocales
    } = this.manifest;
    const {
      pathname
    } = new URL(request.url);
    if (pathname !== basePath) {
      return null;
    }
    const preferredLocale = getPreferredLocale(request.headers.get('Accept-Language') || '*', this.supportedLocales);
    if (preferredLocale) {
      const subPath = supportedLocales[preferredLocale];
      if (subPath !== undefined) {
        const prefix = request.headers.get('X-Forwarded-Prefix') ?? '';
        return createRedirectResponse(joinUrlParts(prefix, pathname, subPath), 302, {
          'Vary': 'Accept-Language'
        });
      }
    }
    return null;
  }
  async getAngularServerAppForRequest(request) {
    const url = new URL(request.url);
    const entryPoint = await this.getEntryPointExportsForUrl(url);
    if (!entryPoint) {
      return null;
    }
    const ɵgetOrCreateAngularServerApp = entryPoint.ɵgetOrCreateAngularServerApp;
    const serverApp = ɵgetOrCreateAngularServerApp({
      allowStaticRouteRender: AngularAppEngine.ɵallowStaticRouteRender,
      hooks: AngularAppEngine.ɵhooks
    });
    return serverApp;
  }
  getEntryPointExports(potentialLocale) {
    const cachedEntryPoint = this.entryPointsCache.get(potentialLocale);
    if (cachedEntryPoint) {
      return cachedEntryPoint;
    }
    const {
      entryPoints
    } = this.manifest;
    const entryPoint = entryPoints[potentialLocale];
    if (!entryPoint) {
      return undefined;
    }
    const entryPointExports = entryPoint();
    this.entryPointsCache.set(potentialLocale, entryPointExports);
    return entryPointExports;
  }
  getEntryPointExportsForUrl(url) {
    const {
      basePath,
      supportedLocales
    } = this.manifest;
    if (this.supportedLocales.length === 1) {
      return this.getEntryPointExports(supportedLocales[this.supportedLocales[0]]);
    }
    const potentialLocale = getPotentialLocaleIdFromUrl(url, basePath);
    return this.getEntryPointExports(potentialLocale) ?? this.getEntryPointExports('');
  }
  handleValidationError(url, error) {
    const errorMessage = error.message;
    console.error(`ERROR: Bad Request ("${url}").\n` + errorMessage + '\n\nFor more information, see https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf');
    return new Response(errorMessage, {
      status: 400,
      statusText: 'Bad Request',
      headers: {
        'Content-Type': 'text/plain'
      }
    });
  }
}

function createRequestHandler(handler) {
  handler['__ng_request_handler__'] = true;
  return handler;
}

export { AngularAppEngine, IS_DISCOVERING_ROUTES, PrerenderFallback, RenderMode, createRequestHandler, provideServerRendering, withAppShell, withRoutes, InlineCriticalCssProcessor as ɵInlineCriticalCssProcessor, destroyAngularServerApp as ɵdestroyAngularServerApp, extractRoutesAndCreateRouteTree as ɵextractRoutesAndCreateRouteTree, getOrCreateAngularServerApp as ɵgetOrCreateAngularServerApp, getRoutesFromAngularRouterConfig as ɵgetRoutesFromAngularRouterConfig, setAngularAppEngineManifest as ɵsetAngularAppEngineManifest, setAngularAppManifest as ɵsetAngularAppManifest };
//# sourceMappingURL=ssr.mjs.map
