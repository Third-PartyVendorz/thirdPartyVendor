import { r as __toESM } from "./rolldown-runtime-C7HZzL1F.js";
import { Bn as LOCALE_ID, Dc as InjectionToken, Dl as ɵɵdefineInjectable, E as annotateForHydration, Ec as INTERNAL_APPLICATION_ERROR_HANDLER, F as createPlatformFactory, Fn as Injectable, Kc as TransferState, Ki as setDocument, Li as resetCompiledComponents, Mn as IS_HYDRATION_DOM_REUSE_ENABLED, Oc as Injector, Ol as ɵɵdefineInjector, Pn as Inject, Rc as PLATFORM_ID, Rl as require_cjs, Wc as RuntimeError, Wi as setClassMetadata, b as REQUEST_CONTEXT, bl as runInInjectionContext, cl as inject, cr as SSR_CONTENT_INTEGRITY_MARKER, dc as APP_ID, fn as Console$1, hc as DOCUMENT, ht as stopMeasuring, ir as Renderer2, jl as ɵɵinject, ml as makeEnvironmentProviders, mr as TESTABILITY, mt as startMeasuring, on as Compiler, ot as platformCore, pc as CSP_NONCE, qn as NgModule, qr as createEnvironmentInjector, ro as ɵɵdefineNgModule, s as ENABLE_ROOT_COMPONENT_BOOTSTRAP, tn as ApplicationRef, vl as provideEnvironmentInitializer, x as RESPONSE_INIT, y as REQUEST, yc as EnvironmentInjector, yr as Testability, zc as PLATFORM_INITIALIZER } from "./core-DAuPG1Te.js";
import { A as EVENT_MANAGER_PLUGINS, B as XhrFactory, L as NullViewportScroller, M as EventManagerPlugin, R as PLATFORM_SERVER_ID, S as BrowserModule, W as APP_BASE_HREF, X as getDOM, Y as PlatformLocation, Z as setRootDomAdapter, b as BrowserDomAdapter, v as HTTP_FETCH_MAX_RESPONSE_SIZE, y as HTTP_ROOT_INTERCEPTOR_FNS, z as ViewportScroller } from "./platform-browser-Cma3dpy9.js";
import { t as index } from "./bundled-domino-V1wPlgIO.js";
import { Dt as loadChildren, ct as Router, j as ActivatedRoute, tt as ROUTES } from "./router-JMItweE0.js";
//#region node_modules/@angular/ssr/fesm2022/_validation-chunk.mjs
var TRUST_ALL_PROXY_HEADERS = "*";
var HOST_HEADERS_TO_VALIDATE = ["host", "x-forwarded-host"];
var VALID_PORT_REGEX = /^\d+$/;
var VALID_PROTO_REGEX = /^https?$/i;
var VALID_PREFIX_REGEX = /^\/([a-z0-9_-]+\/)*[a-z0-9_-]*$/i;
function getFirstHeaderValue(value) {
	return value?.toString().split(",", 1)[0]?.trim();
}
function validateRequest(request, allowedHosts, disableHostCheck) {
	validateHeaders(request, allowedHosts, disableHostCheck);
	if (!disableHostCheck) validateUrl(new URL(request.url), allowedHosts);
}
function validateUrl(url, allowedHosts) {
	const { hostname } = url;
	if (!isHostAllowed$1(hostname, allowedHosts)) throw new Error(`URL with hostname "${hostname}" is not allowed.`);
}
function sanitizeRequestHeaders(request, trustProxyHeaders) {
	let headersDeleted = false;
	const headers = new Headers();
	for (const [key, value] of request.headers) {
		const lowerKey = key.toLowerCase();
		if ((lowerKey === "forwarded" || lowerKey.startsWith("x-forwarded-")) && !isProxyHeaderAllowed(lowerKey, trustProxyHeaders)) {
			console.warn(`Received "${key}" header but "trustProxyHeaders" was not set up to allow it.\nFor more information, see https://angular.dev/best-practices/security#configuring-trusted-proxy-headers`);
			headersDeleted = true;
		} else headers.set(key, value);
	}
	return headersDeleted ? new Request(request, { headers }) : request;
}
function verifyHostAllowed(headerName, headerValue, allowedHosts) {
	const url = `http://${headerValue}`;
	if (!URL.canParse(url)) throw new Error(`Header "${headerName}" contains an invalid value and cannot be parsed.`);
	const { hostname, pathname, search, hash, username, password } = new URL(url);
	if (pathname !== "/" || search || hash || username || password) throw new Error(`Header "${headerName}" with value "${headerValue}" contains characters that are not allowed.`);
	if (!isHostAllowed$1(hostname, allowedHosts)) throw new Error(`Header "${headerName}" with value "${headerValue}" is not allowed.`);
}
function isHostAllowed$1(hostname, allowedHosts) {
	if (allowedHosts.has("*") || allowedHosts.has(hostname)) return true;
	for (const allowedHost of allowedHosts) {
		if (!allowedHost.startsWith("*.")) continue;
		const domain = allowedHost.slice(1);
		if (hostname.endsWith(domain)) return true;
	}
	return false;
}
function validateHeaders(request, allowedHosts, disableHostCheck) {
	const headers = request.headers;
	for (const headerName of HOST_HEADERS_TO_VALIDATE) {
		const headerValue = getFirstHeaderValue(headers.get(headerName));
		if (headerValue && !disableHostCheck) verifyHostAllowed(headerName, headerValue, allowedHosts);
	}
	const forwarded = headers.get("forwarded");
	if (forwarded) {
		const forwardedParams = parseForwardedHeader(forwarded);
		if (forwardedParams.host && !disableHostCheck) verifyHostAllowed("Forwarded \"host\"", forwardedParams.host, allowedHosts);
		if (forwardedParams.proto && !VALID_PROTO_REGEX.test(forwardedParams.proto)) throw new Error("Header \"forwarded\" proto parameter must be either \"http\" or \"https\".");
	}
	const xForwardedPort = getFirstHeaderValue(headers.get("x-forwarded-port"));
	if (xForwardedPort && !VALID_PORT_REGEX.test(xForwardedPort)) throw new Error("Header \"x-forwarded-port\" must be a numeric value.");
	const xForwardedProto = getFirstHeaderValue(headers.get("x-forwarded-proto"));
	if (xForwardedProto && !VALID_PROTO_REGEX.test(xForwardedProto)) throw new Error("Header \"x-forwarded-proto\" must be either \"http\" or \"https\".");
	const xForwardedPrefix = getFirstHeaderValue(headers.get("x-forwarded-prefix"));
	if (xForwardedPrefix && !VALID_PREFIX_REGEX.test(xForwardedPrefix)) throw new Error("Header \"x-forwarded-prefix\" is invalid. It must start with a \"/\" and contain only alphanumeric characters, hyphens, and underscores, separated by single slashes.");
}
function isProxyHeaderAllowed(headerName, trustProxyHeaders) {
	return trustProxyHeaders.has(TRUST_ALL_PROXY_HEADERS) || trustProxyHeaders.has(headerName.toLowerCase());
}
function normalizeTrustProxyHeaders(trustProxyHeaders) {
	if (!trustProxyHeaders) return /* @__PURE__ */ new Set();
	if (trustProxyHeaders === true) return /* @__PURE__ */ new Set([TRUST_ALL_PROXY_HEADERS]);
	const normalizedTrustedProxyHeaders = /* @__PURE__ */ new Set();
	for (const header of trustProxyHeaders) {
		const lowerHeader = header.toLowerCase();
		if (lowerHeader === TRUST_ALL_PROXY_HEADERS) throw new Error(`"${TRUST_ALL_PROXY_HEADERS}" is not allowed as a value for the "trustProxyHeaders" option.`);
		if (!(lowerHeader === "forwarded" || lowerHeader.startsWith("x-forwarded-"))) throw new Error(`"${header}" is not a valid proxy header. Trusted proxy headers must be "forwarded" or start with "x-forwarded-".`);
		normalizedTrustedProxyHeaders.add(lowerHeader);
	}
	return normalizedTrustedProxyHeaders;
}
function parseForwardedHeader(headerValue) {
	if (!headerValue) return {};
	const params = {};
	let inQuotes = false;
	let escaped = false;
	let currentKey = "";
	let currentValue = "";
	let isParsingValue = false;
	let isKeyEnded = false;
	let isParsingValueEnded = false;
	for (const char of headerValue) {
		if (escaped) {
			escaped = false;
			if (isParsingValue) currentValue += char;
			else currentKey += char;
			continue;
		}
		if (char === "\\") {
			if (inQuotes) escaped = true;
			else if (isParsingValue) currentValue += char;
			else currentKey += char;
			continue;
		}
		if (char === "\"") {
			inQuotes = !inQuotes;
			continue;
		}
		if (inQuotes) {
			if (isParsingValue) currentValue += char;
			else currentKey += char;
			continue;
		}
		if (char === ",") {
			addParam(currentKey, currentValue, isParsingValue, params);
			break;
		}
		if (char === ";") {
			addParam(currentKey, currentValue, isParsingValue, params);
			currentKey = "";
			currentValue = "";
			isParsingValue = false;
			isKeyEnded = false;
			isParsingValueEnded = false;
			continue;
		}
		if (char === "=") {
			if (!isParsingValue) isParsingValue = true;
			else currentValue += char;
			continue;
		}
		if (char === " " || char === "	") {
			if (isParsingValue) {
				if (currentValue.length > 0) isParsingValueEnded = true;
			} else if (currentKey.length > 0) isKeyEnded = true;
			continue;
		}
		if (isParsingValue) {
			if (!isParsingValueEnded) currentValue += char;
		} else if (isKeyEnded) {
			currentKey = char;
			isKeyEnded = false;
		} else currentKey += char;
	}
	if (currentKey || currentValue || isParsingValue) addParam(currentKey, currentValue, isParsingValue, params);
	return params;
}
function addParam(key, value, hasValue, params) {
	if (!hasValue) return;
	const trimmedKey = key.trim().toLowerCase();
	if (trimmedKey) params[trimmedKey] = value;
}
//#endregion
//#region node_modules/@angular/platform-server/fesm2022/_server-chunk.mjs
/**
* @license Angular v22.1.6
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
var import_cjs = require_cjs();
function setDomTypes() {
	Object.assign(globalThis, index.impl);
	globalThis["KeyboardEvent"] = index.impl.Event;
}
function parseDocument$1(html, url = "/") {
	return index.createWindow(html, url).document;
}
function serializeDocument$1(doc) {
	return doc.serialize();
}
var DominoAdapter = class DominoAdapter extends BrowserDomAdapter {
	static makeCurrent() {
		setDomTypes();
		setRootDomAdapter(new DominoAdapter());
	}
	supportsDOMEvents = false;
	static defaultDoc;
	createHtmlDocument() {
		return parseDocument$1("<html><head><title>fakeTitle</title></head><body></body></html>");
	}
	getDefaultDocument() {
		if (!DominoAdapter.defaultDoc) DominoAdapter.defaultDoc = index.createDocument();
		return DominoAdapter.defaultDoc;
	}
	isElementNode(node) {
		return node ? node.nodeType === DominoAdapter.defaultDoc.ELEMENT_NODE : false;
	}
	isShadowRoot(node) {
		return node.shadowRoot == node;
	}
	getGlobalEventTarget(doc, target) {
		if (target === "window") return doc.defaultView;
		if (target === "document") return doc;
		if (target === "body") return doc.body;
		return null;
	}
	getBaseHref(doc) {
		const length = doc.head.children.length;
		for (let i = 0; i < length; i++) {
			const child = doc.head.children[i];
			if (child.tagName === "BASE") return child.getAttribute("href") || "";
		}
		return "";
	}
	dispatchEvent(el, evt) {
		el.dispatchEvent(evt);
		const win = (el.ownerDocument || el).defaultView;
		if (win) win.dispatchEvent(evt);
	}
	getUserAgent() {
		return "Fake user agent";
	}
	getCookie(name) {
		throw new RuntimeError(5700, (typeof ngDevMode === "undefined" || ngDevMode) && "getCookie has not been implemented");
	}
};
var INITIAL_CONFIG = new InjectionToken("Server.INITIAL_CONFIG");
var BEFORE_APP_SERIALIZED = new InjectionToken("Server.RENDER_MODULE_HOOK");
var ENABLE_DOM_EMULATION = new InjectionToken("ENABLE_DOM_EMULATION");
var PlatformState = class PlatformState {
	_doc;
	_enableDomEmulation = enableDomEmulation(inject(Injector));
	constructor(_doc) {
		this._doc = _doc;
	}
	renderToString() {
		if (ngDevMode && !this._enableDomEmulation && !window?.document) throw new RuntimeError(5704, (typeof ngDevMode === "undefined" || ngDevMode) && "Disabled DOM emulation should only run in browser environments");
		const measuringLabel = "renderToString";
		startMeasuring(measuringLabel);
		const rendered = this._enableDomEmulation ? serializeDocument$1(this._doc) : this._doc.documentElement.outerHTML;
		stopMeasuring(measuringLabel);
		return rendered;
	}
	getDocument() {
		return this._doc;
	}
	static ɵfac = function PlatformState_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || PlatformState)(ɵɵinject(DOCUMENT));
	};
	static ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({
		token: PlatformState,
		factory: PlatformState.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformState, [{ type: Injectable }], () => [{
		type: void 0,
		decorators: [{
			type: Inject,
			args: [DOCUMENT]
		}]
	}], null);
})();
function enableDomEmulation(injector) {
	return injector.get(ENABLE_DOM_EMULATION, true);
}
var HTTP_OR_HTTPS_PROTOCOL_REGEXP = /^https?:/i;
var HTTP_OR_HTTPS_NO_AUTHORITY_REGEXP = /^https?:(?![/\\]{2})/i;
function resolveUrl(urlStr, origin, options = {}) {
	const originUrl = typeof origin === "string" ? new URL("/", origin) : origin;
	if (!urlStr) return originUrl || null;
	let resolved;
	if (!originUrl || !HTTP_OR_HTTPS_NO_AUTHORITY_REGEXP.test(urlStr)) try {
		resolved = new URL(urlStr);
	} catch {}
	const { allowProtocolRelative = false, allowOriginChange = true } = options;
	if (resolved) {
		if (originUrl && !isSafeOriginChange(resolved, originUrl, urlStr, allowOriginChange)) throwSuspiciousUrlError(urlStr);
		return resolved;
	}
	if (!URL.canParse(urlStr, "http://fake")) throw new RuntimeError(5701, typeof ngDevMode === "undefined" || ngDevMode ? `Invalid URL: ${urlStr}` : urlStr);
	if (!originUrl) return null;
	if (urlStr.startsWith("//")) {
		if (!allowProtocolRelative) throw new RuntimeError(5702, typeof ngDevMode === "undefined" || ngDevMode ? `Protocol relative URLs are not allowed in this context. URL: ${urlStr}` : urlStr);
		return new URL(urlStr, origin);
	}
	resolved = new URL(urlStr, origin);
	if (!isSafeOriginChange(resolved, originUrl, urlStr, allowOriginChange)) throwSuspiciousUrlError(urlStr);
	return resolved;
}
function throwSuspiciousUrlError(urlStr) {
	throw new RuntimeError(-5703, typeof ngDevMode === "undefined" || ngDevMode ? `URL ${urlStr} changed origin unexpectedly. This is suspicious and may indicate a security bypass attempt.` : urlStr);
}
function isSafeOriginChange(resolved, origin, urlStr, allowOriginChange) {
	if (origin.origin === resolved.origin) return true;
	if (!allowOriginChange) return false;
	return HTTP_OR_HTTPS_PROTOCOL_REGEXP.test(urlStr) && !HTTP_OR_HTTPS_NO_AUTHORITY_REGEXP.test(urlStr);
}
var ServerXhr = class ServerXhr {
	xhrImpl;
	async ɵloadImpl() {
		if (!this.xhrImpl) {
			if (typeof ngDevMode === "undefined" || ngDevMode) console.warn("XHR support in `@angular/platform-server` is deprecated and will be removed in Angular 23. It has known security and performance issues in server environments, such as forwarding `Authorization` headers on cross-origin redirects and susceptibility to denial-of-service (DoS) via redirect loops. Please use the HttpClient fetch backend instead, which is the default since Angular 22.");
			const { default: xhr } = await import("./xhr2-BpIBBfsG.js").then((m) => /* @__PURE__ */ __toESM(m.default, 1));
			this.xhrImpl = xhr;
		}
	}
	build() {
		const impl = this.xhrImpl;
		if (!impl) throw new RuntimeError(5705, (typeof ngDevMode === "undefined" || ngDevMode) && "Unexpected state in ServerXhr: XHR implementation is not loaded.");
		return new impl.XMLHttpRequest();
	}
	static ɵfac = function ServerXhr_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ServerXhr)();
	};
	static ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({
		token: ServerXhr,
		factory: ServerXhr.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerXhr, [{ type: Injectable }], null, null);
})();
var URL_SCHEMA_REGEXP = /^(?:[a-zA-Z][a-zA-Z0-9+\-.]*:)/;
function relativeUrlsTransformerInterceptorFn(request, next) {
	const trimmedUrl = request.url.trim();
	if (URL_SCHEMA_REGEXP.test(trimmedUrl) && !HTTP_OR_HTTPS_NO_AUTHORITY_REGEXP.test(trimmedUrl)) return next(request);
	const platformLocation = inject(PlatformLocation);
	const { href, protocol, hostname, port } = platformLocation;
	if (!protocol.startsWith("http")) return next(request);
	let urlPrefix = `${protocol}//${hostname}`;
	if (port) urlPrefix += `:${port}`;
	const baseHref = platformLocation.getBaseHrefFromDOM() || href;
	const baseUrl = new URL(baseHref, urlPrefix);
	const parsedUrl = resolveUrl(request.url, baseUrl, { allowProtocolRelative: true });
	return next(request.clone({ url: parsedUrl.toString() }));
}
var SERVER_HTTP_PROVIDERS = [{
	provide: XhrFactory,
	useClass: ServerXhr
}, {
	provide: HTTP_ROOT_INTERCEPTOR_FNS,
	useValue: relativeUrlsTransformerInterceptorFn,
	multi: true
}];
var ServerPlatformLocation = class ServerPlatformLocation {
	href = "/";
	hostname = "/";
	protocol = "/";
	port = "/";
	pathname = "/";
	search = "";
	hash = "";
	_hashUpdate = new import_cjs.Subject();
	_doc = inject(DOCUMENT);
	origin = this._doc.location.origin;
	constructor() {
		const config = inject(INITIAL_CONFIG, { optional: true });
		if (!config) return;
		if (config.url) {
			const { protocol, hostname, port, pathname, search, hash, href, origin } = resolveUrl(config.url, this.origin);
			this.protocol = protocol;
			this.hostname = hostname;
			this.port = port;
			this.pathname = pathname;
			this.search = search;
			this.hash = hash;
			this.href = href;
			this.origin = origin;
		}
	}
	getBaseHrefFromDOM() {
		return getDOM().getBaseHref(this._doc);
	}
	onPopState(fn) {
		return () => {};
	}
	onHashChange(fn) {
		const subscription = this._hashUpdate.subscribe(fn);
		return () => subscription.unsubscribe();
	}
	get url() {
		return `${this.pathname}${this.search}${this.hash}`;
	}
	setHash(value, oldUrl) {
		if (this.hash === value) return;
		this.hash = value;
		const newUrl = this.url;
		queueMicrotask(() => this._hashUpdate.next({
			type: "hashchange",
			state: null,
			oldUrl,
			newUrl
		}));
	}
	replaceState(state, title, newUrl) {
		const oldUrl = this.url;
		const { pathname, search, hash, href, protocol } = resolveUrl(newUrl, this.origin, { allowOriginChange: false });
		const writableThis = this;
		writableThis.pathname = pathname;
		writableThis.search = search;
		writableThis.href = href;
		writableThis.protocol = protocol;
		this.setHash(hash, oldUrl);
	}
	pushState(state, title, newUrl) {
		this.replaceState(state, title, newUrl);
	}
	forward() {
		throw new Error("Not implemented");
	}
	back() {
		throw new Error("Not implemented");
	}
	getState() {}
	static ɵfac = function ServerPlatformLocation_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ServerPlatformLocation)();
	};
	static ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({
		token: ServerPlatformLocation,
		factory: ServerPlatformLocation.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerPlatformLocation, [{ type: Injectable }], () => [], null);
})();
var ServerEventManagerPlugin = class ServerEventManagerPlugin extends EventManagerPlugin {
	doc;
	constructor(doc) {
		super(doc);
		this.doc = doc;
	}
	supports(eventName) {
		return true;
	}
	addEventListener(element, eventName, handler, options) {
		return getDOM().onAndCancel(element, eventName, handler, options);
	}
	static ɵfac = function ServerEventManagerPlugin_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ServerEventManagerPlugin)(ɵɵinject(DOCUMENT));
	};
	static ɵprov = /* @__PURE__ */ ɵɵdefineInjectable({
		token: ServerEventManagerPlugin,
		factory: ServerEventManagerPlugin.ɵfac
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerEventManagerPlugin, [{ type: Injectable }], () => [{
		type: void 0,
		decorators: [{
			type: Inject,
			args: [DOCUMENT]
		}]
	}], null);
})();
var TRANSFER_STATE_STATUS = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "TRANSFER_STATE_STATUS" : "", { factory: () => ({ serialized: false }) });
var TRANSFER_STATE_SERIALIZATION_PROVIDERS = [{
	provide: BEFORE_APP_SERIALIZED,
	useFactory: serializeTransferStateFactory,
	multi: true
}];
function createScript(doc, textContent, nonce) {
	const script = doc.createElement("script");
	script.textContent = textContent;
	if (nonce) script.setAttribute("nonce", nonce);
	return script;
}
function warnIfStateTransferHappened(injector) {
	const transferStateStatus = injector.get(TRANSFER_STATE_STATUS);
	if (transferStateStatus.serialized) console.warn("Angular detected an incompatible configuration, which causes duplicate serialization of the server-side application state.\n\nThis can happen if the server providers have been provided more than once using different mechanisms. For example:\n\n  imports: [ServerModule], // Registers server providers\n  providers: [provideServerRendering()] // Also registers server providers\n\nTo fix this, ensure that the `provideServerRendering()` function is the only provider used and remove the other(s).");
	transferStateStatus.serialized = true;
}
function serializeTransferStateFactory() {
	const doc = inject(DOCUMENT);
	const appId = inject(APP_ID);
	const transferStore = inject(TransferState);
	const injector = inject(Injector);
	return () => {
		const measuringLabel = "serializeTransferStateFactory";
		startMeasuring(measuringLabel);
		const content = transferStore.toJson();
		if (transferStore.isEmpty) return;
		if (typeof ngDevMode !== "undefined" && ngDevMode) warnIfStateTransferHappened(injector);
		const script = createScript(doc, content, null);
		script.id = appId + "-state";
		script.setAttribute("type", "application/json");
		doc.body.appendChild(script);
		stopMeasuring(measuringLabel);
	};
}
var INTERNAL_SERVER_PLATFORM_PROVIDERS = [
	{
		provide: DOCUMENT,
		useFactory: _document
	},
	{
		provide: PLATFORM_ID,
		useValue: PLATFORM_SERVER_ID
	},
	{
		provide: PLATFORM_INITIALIZER,
		useFactory: initDominoAdapter,
		multi: true
	},
	{
		provide: PlatformLocation,
		useClass: ServerPlatformLocation,
		deps: []
	},
	{
		provide: PlatformState,
		deps: [DOCUMENT]
	}
];
function initDominoAdapter() {
	const _enableDomEmulation = enableDomEmulation(inject(Injector));
	return () => {
		if (_enableDomEmulation) DominoAdapter.makeCurrent();
		else BrowserDomAdapter.makeCurrent();
	};
}
var PLATFORM_SERVER_PROVIDERS = [
	TRANSFER_STATE_SERIALIZATION_PROVIDERS,
	[{
		provide: EVENT_MANAGER_PLUGINS,
		multi: true,
		useClass: ServerEventManagerPlugin
	}],
	SERVER_HTTP_PROVIDERS,
	{
		provide: Testability,
		useValue: null
	},
	{
		provide: TESTABILITY,
		useValue: null
	},
	{
		provide: ViewportScroller,
		useClass: NullViewportScroller
	}
];
var ServerModule = class ServerModule {
	static ɵfac = function ServerModule_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || ServerModule)();
	};
	static ɵmod = /* @__PURE__ */ ɵɵdefineNgModule({
		type: ServerModule,
		exports: [BrowserModule]
	});
	static ɵinj = /* @__PURE__ */ ɵɵdefineInjector({
		providers: PLATFORM_SERVER_PROVIDERS,
		imports: [BrowserModule]
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ServerModule, [{
		type: NgModule,
		args: [{
			exports: [BrowserModule],
			providers: PLATFORM_SERVER_PROVIDERS
		}]
	}], null, null);
})();
function _document() {
	const injector = inject(Injector);
	const config = injector.get(INITIAL_CONFIG, null);
	const _enableDomEmulation = enableDomEmulation(injector);
	let document;
	if (config && config.document) document = typeof config.document === "string" ? _enableDomEmulation ? parseDocument$1(config.document, config.url !== void 0 ? resolveUrl(config.url, "http://localhost").href : void 0) : window.document : config.document;
	else document = getDOM().createHtmlDocument();
	setDocument(document);
	return document;
}
function platformServer(extraProviders) {
	return createPlatformFactory(platformCore, "server", INTERNAL_SERVER_PLATFORM_PROVIDERS)(extraProviders);
}
//#endregion
//#region node_modules/@angular/platform-server/fesm2022/platform-server.mjs
/**
* @license Angular v22.1.6
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
function provideServerRendering$1(options) {
	const providers = [...PLATFORM_SERVER_PROVIDERS];
	if (options?.maxResponseBodySize) providers.push({
		provide: HTTP_FETCH_MAX_RESPONSE_SIZE,
		useValue: options.maxResponseBodySize
	});
	return makeEnvironmentProviders(providers);
}
var EVENT_DISPATCH_SCRIPT_ID = "ng-event-dispatch-contract";
function createServerPlatform(options) {
	const extraProviders = options.platformProviders ?? [];
	const measuringLabel = "createServerPlatform";
	startMeasuring(measuringLabel);
	const { document, url } = options;
	const platform = platformServer([{
		provide: INITIAL_CONFIG,
		useValue: {
			document,
			url
		}
	}, extraProviders]);
	stopMeasuring(measuringLabel);
	return platform;
}
function findEventDispatchScript(doc) {
	return doc.getElementById(EVENT_DISPATCH_SCRIPT_ID);
}
function removeEventDispatchScript(doc) {
	findEventDispatchScript(doc)?.remove();
}
function prepareForHydration(platformState, applicationRef) {
	const measuringLabel = "prepareForHydration";
	startMeasuring(measuringLabel);
	const environmentInjector = applicationRef.injector;
	const doc = platformState.getDocument();
	if (!environmentInjector.get(IS_HYDRATION_DOM_REUSE_ENABLED, false)) {
		removeEventDispatchScript(doc);
		return;
	}
	appendSsrContentIntegrityMarker(doc);
	const eventTypesToReplay = annotateForHydration(applicationRef, doc);
	if (eventTypesToReplay.regular.size || eventTypesToReplay.capture.size) insertEventRecordScript(environmentInjector.get(APP_ID), doc, eventTypesToReplay, environmentInjector.get(CSP_NONCE, null));
	else removeEventDispatchScript(doc);
	stopMeasuring(measuringLabel);
}
function appendSsrContentIntegrityMarker(doc) {
	const comment = doc.createComment(SSR_CONTENT_INTEGRITY_MARKER);
	doc.body.firstChild ? doc.body.insertBefore(comment, doc.body.firstChild) : doc.body.append(comment);
}
function appendServerContextInfo(applicationRef) {
	const injector = applicationRef.injector;
	let serverContext = sanitizeServerContext(injector.get(SERVER_CONTEXT, DEFAULT_SERVER_CONTEXT));
	applicationRef.components.forEach((componentRef) => {
		const renderer = componentRef.injector.get(Renderer2);
		const element = componentRef.location.nativeElement;
		if (element) renderer.setAttribute(element, "ng-server-context", serverContext);
	});
}
function insertEventRecordScript(appId, doc, eventTypesToReplay, nonce) {
	const measuringLabel = "insertEventRecordScript";
	startMeasuring(measuringLabel);
	const { regular, capture } = eventTypesToReplay;
	const eventDispatchScript = findEventDispatchScript(doc);
	if (eventDispatchScript) {
		const replayScript = createScript(doc, `window.__jsaction_bootstrap(document.body,"${appId}",${JSON.stringify(Array.from(regular))},${JSON.stringify(Array.from(capture))});`, nonce);
		eventDispatchScript.after(replayScript);
	}
	stopMeasuring(measuringLabel);
}
async function renderInternal(platformRef, applicationRef) {
	const platformState = platformRef.injector.get(PlatformState);
	prepareForHydration(platformState, applicationRef);
	appendServerContextInfo(applicationRef);
	const environmentInjector = applicationRef.injector;
	const errorHandler = environmentInjector.get(INTERNAL_APPLICATION_ERROR_HANDLER);
	const callbacks = environmentInjector.get(BEFORE_APP_SERIALIZED, null);
	if (callbacks) {
		const asyncCallbacks = [];
		for (const callback of callbacks) try {
			const callbackResult = callback();
			if (callbackResult) asyncCallbacks.push(callbackResult);
		} catch (e) {
			errorHandler(e);
		}
		if (asyncCallbacks.length) {
			for (const result of await Promise.allSettled(asyncCallbacks)) if (result.status === "rejected") errorHandler(result.reason);
		}
	}
	return platformState.renderToString();
}
function asyncDestroyPlatform$1(platformRef) {
	return new Promise((resolve) => {
		setTimeout(() => {
			platformRef.destroy();
			resolve();
		}, 0);
	});
}
var DEFAULT_SERVER_CONTEXT = "other";
var SERVER_CONTEXT = new InjectionToken("SERVER_CONTEXT");
function sanitizeServerContext(serverContext) {
	const context = serverContext.replace(/[^a-zA-Z0-9\-]/g, "");
	return context.length > 0 ? context : DEFAULT_SERVER_CONTEXT;
}
async function renderModule(moduleType, options) {
	const { document, url, extraProviders: platformProviders, allowedHosts } = options;
	validateAllowedHosts(url, allowedHosts);
	const platformRef = createServerPlatform({
		document,
		url,
		platformProviders
	});
	try {
		const applicationRef = (await platformRef.bootstrapModule(moduleType)).injector.get(ApplicationRef);
		const measuringLabel = "whenStable";
		startMeasuring(measuringLabel);
		await applicationRef.whenStable();
		stopMeasuring(measuringLabel);
		return await renderInternal(platformRef, applicationRef);
	} finally {
		await asyncDestroyPlatform$1(platformRef);
	}
}
async function renderApplication(bootstrap, options) {
	const renderAppLabel = "renderApplication";
	const bootstrapLabel = "bootstrap";
	const _renderLabel = "_render";
	const { url, allowedHosts } = options;
	validateAllowedHosts(url, allowedHosts);
	startMeasuring(renderAppLabel);
	const platformRef = createServerPlatform(options);
	try {
		startMeasuring(bootstrapLabel);
		const applicationRef = await bootstrap({ platformRef });
		stopMeasuring(bootstrapLabel);
		startMeasuring(_renderLabel);
		const measuringLabel = "whenStable";
		startMeasuring(measuringLabel);
		await applicationRef.whenStable();
		stopMeasuring(measuringLabel);
		const rendered = await renderInternal(platformRef, applicationRef);
		stopMeasuring(_renderLabel);
		return rendered;
	} finally {
		await asyncDestroyPlatform$1(platformRef);
		stopMeasuring(renderAppLabel);
	}
}
function validateAllowedHosts(url, allowedHosts) {
	if (typeof url === "string") {
		const parsedUrl = resolveUrl(url);
		if (parsedUrl !== null) {
			const hostname = parsedUrl.hostname;
			if (!isHostAllowed(hostname, new Set(allowedHosts))) throw new RuntimeError(5706, typeof ngDevMode === "undefined" || ngDevMode ? `Host ${url} is not allowed. You can configure \`allowedHosts\` option.` : url);
		}
	}
}
function isHostAllowed(hostname, allowedHosts) {
	if (allowedHosts.has("*") || allowedHosts.has(hostname)) return true;
	for (const allowedHost of allowedHosts) {
		if (!allowedHost.startsWith("*.")) continue;
		const domain = allowedHost.slice(1);
		if (hostname.endsWith(domain)) return true;
	}
	return false;
}
//#endregion
//#region node_modules/@angular/ssr/third_party/beasties/index.js
function createNotImplementedError(name) {
	throw new Error(`[unenv] ${name} is not implemented yet!`);
}
function notImplemented(name) {
	const fn = () => {
		throw createNotImplementedError(name);
	};
	return Object.assign(fn, { __unenv__: true });
}
var access = notImplemented("fs.access");
var copyFile = notImplemented("fs.copyFile");
var cp = notImplemented("fs.cp");
var open = notImplemented("fs.open");
var opendir = notImplemented("fs.opendir");
var rename = notImplemented("fs.rename");
var truncate = notImplemented("fs.truncate");
var rm = notImplemented("fs.rm");
var rmdir = notImplemented("fs.rmdir");
var mkdir = notImplemented("fs.mkdir");
var readdir = notImplemented("fs.readdir");
var readlink = notImplemented("fs.readlink");
var symlink = notImplemented("fs.symlink");
var lstat = notImplemented("fs.lstat");
var stat = notImplemented("fs.stat");
var link = notImplemented("fs.link");
var unlink = notImplemented("fs.unlink");
var chmod = notImplemented("fs.chmod");
var lchmod = notImplemented("fs.lchmod");
var lchown = notImplemented("fs.lchown");
var chown = notImplemented("fs.chown");
var utimes = notImplemented("fs.utimes");
var lutimes = notImplemented("fs.lutimes");
var realpath = notImplemented("fs.realpath");
var mkdtemp = notImplemented("fs.mkdtemp");
var writeFile$1 = notImplemented("fs.writeFile");
var appendFile = notImplemented("fs.appendFile");
var readFile$1 = notImplemented("fs.readFile");
notImplemented("fs.watch");
var statfs = notImplemented("fs.statfs");
function notImplementedAsync(name) {
	const fn = notImplemented(name);
	fn.__promisify__ = () => notImplemented(name + ".__promisify__");
	fn.native = fn;
	return fn;
}
function callbackify(fn) {
	const fnc = function(...args) {
		const cb = args.pop();
		fn().catch((error) => cb(error)).then((val) => cb(void 0, val));
	};
	fnc.__promisify__ = fn;
	fnc.native = fnc;
	return fnc;
}
callbackify(access);
callbackify(appendFile);
callbackify(chown);
callbackify(chmod);
callbackify(copyFile);
callbackify(cp);
callbackify(lchown);
callbackify(lchmod);
callbackify(link);
callbackify(lstat);
callbackify(lutimes);
callbackify(mkdir);
callbackify(mkdtemp);
callbackify(realpath);
callbackify(open);
callbackify(opendir);
callbackify(readdir);
var readFile = callbackify(readFile$1);
callbackify(readlink);
callbackify(rename);
callbackify(rm);
callbackify(rmdir);
callbackify(stat);
callbackify(symlink);
callbackify(truncate);
callbackify(unlink);
callbackify(utimes);
var writeFile = callbackify(writeFile$1);
callbackify(statfs);
notImplementedAsync("fs.close");
notImplementedAsync("fs.createReadStream");
notImplementedAsync("fs.createWriteStream");
notImplementedAsync("fs.exists");
notImplementedAsync("fs.fchown");
notImplementedAsync("fs.fchmod");
notImplementedAsync("fs.fdatasync");
notImplementedAsync("fs.fstat");
notImplementedAsync("fs.fsync");
notImplementedAsync("fs.ftruncate");
notImplementedAsync("fs.futimes");
notImplementedAsync("fs.lstatSync");
notImplementedAsync("fs.read");
notImplementedAsync("fs.readv");
notImplementedAsync("fs.realpathSync");
notImplementedAsync("fs.statSync");
notImplementedAsync("fs.unwatchFile");
notImplementedAsync("fs.watch");
notImplementedAsync("fs.watchFile");
notImplementedAsync("fs.write");
notImplementedAsync("fs.writev");
notImplementedAsync("fs._toUnixTimestamp");
notImplementedAsync("fs.openAsBlob");
notImplemented("fs.appendFileSync");
notImplemented("fs.accessSync");
notImplemented("fs.chownSync");
notImplemented("fs.chmodSync");
notImplemented("fs.closeSync");
notImplemented("fs.copyFileSync");
notImplemented("fs.cpSync");
notImplemented("fs.fchownSync");
notImplemented("fs.fchmodSync");
notImplemented("fs.fdatasyncSync");
notImplemented("fs.fstatSync");
notImplemented("fs.fsyncSync");
notImplemented("fs.ftruncateSync");
notImplemented("fs.futimesSync");
notImplemented("fs.lchownSync");
notImplemented("fs.lchmodSync");
notImplemented("fs.linkSync");
notImplemented("fs.lutimesSync");
notImplemented("fs.mkdirSync");
notImplemented("fs.mkdtempSync");
notImplemented("fs.openSync");
notImplemented("fs.opendirSync");
notImplemented("fs.readdirSync");
notImplemented("fs.readSync");
notImplemented("fs.readvSync");
notImplemented("fs.readFileSync");
notImplemented("fs.readlinkSync");
notImplemented("fs.renameSync");
notImplemented("fs.rmSync");
notImplemented("fs.rmdirSync");
notImplemented("fs.symlinkSync");
notImplemented("fs.truncateSync");
notImplemented("fs.unlinkSync");
notImplemented("fs.utimesSync");
notImplemented("fs.writeFileSync");
notImplemented("fs.writeSync");
notImplemented("fs.writevSync");
notImplemented("fs.statfsSync");
var _DRIVE_LETTER_START_RE = /^[A-Za-z]:\//;
function normalizeWindowsPath(input = "") {
	if (!input) return input;
	return input.replace(/\\/g, "/").replace(_DRIVE_LETTER_START_RE, (r) => r.toUpperCase());
}
var _UNC_REGEX = /^[/\\]{2}/;
var _IS_ABSOLUTE_RE = /^[/\\](?![/\\])|^[/\\]{2}(?!\.)|^[A-Za-z]:[/\\]/;
var _DRIVE_LETTER_RE = /^[A-Za-z]:$/;
var _ROOT_FOLDER_RE = /^\/([A-Za-z]:)?$/;
var sep = "/";
var delimiter = ":";
var normalize = function(path) {
	if (path.length === 0) return ".";
	path = normalizeWindowsPath(path);
	const isUNCPath = path.match(_UNC_REGEX);
	const isPathAbsolute = isAbsolute(path);
	const trailingSeparator = path[path.length - 1] === "/";
	path = normalizeString(path, !isPathAbsolute);
	if (path.length === 0) {
		if (isPathAbsolute) return "/";
		return trailingSeparator ? "./" : ".";
	}
	if (trailingSeparator) path += "/";
	if (_DRIVE_LETTER_RE.test(path)) path += "/";
	if (isUNCPath) {
		if (!isPathAbsolute) return `//./${path}`;
		return `//${path}`;
	}
	return isPathAbsolute && !isAbsolute(path) ? `/${path}` : path;
};
var join = function(...arguments_) {
	if (arguments_.length === 0) return ".";
	let joined;
	for (const argument of arguments_) if (argument && argument.length > 0) if (joined === void 0) joined = argument;
	else joined += `/${argument}`;
	if (joined === void 0) return ".";
	return normalize(joined.replace(/\/\/+/g, "/"));
};
function cwd() {
	if (typeof process !== "undefined" && typeof process.cwd === "function") return process.cwd().replace(/\\/g, "/");
	return "/";
}
var resolve = function(...arguments_) {
	arguments_ = arguments_.map((argument) => normalizeWindowsPath(argument));
	let resolvedPath = "";
	let resolvedAbsolute = false;
	for (let index = arguments_.length - 1; index >= -1 && !resolvedAbsolute; index--) {
		const path = index >= 0 ? arguments_[index] : cwd();
		if (!path || path.length === 0) continue;
		resolvedPath = `${path}/${resolvedPath}`;
		resolvedAbsolute = isAbsolute(path);
	}
	resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
	if (resolvedAbsolute && !isAbsolute(resolvedPath)) return `/${resolvedPath}`;
	return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path, allowAboveRoot) {
	let res = "";
	let lastSegmentLength = 0;
	let lastSlash = -1;
	let dots = 0;
	let char = null;
	for (let index = 0; index <= path.length; ++index) {
		if (index < path.length) char = path[index];
		else if (char === "/") break;
		else char = "/";
		if (char === "/") {
			if (lastSlash === index - 1 || dots === 1);
			else if (dots === 2) {
				if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
					if (res.length > 2) {
						const lastSlashIndex = res.lastIndexOf("/");
						if (lastSlashIndex === -1) {
							res = "";
							lastSegmentLength = 0;
						} else {
							res = res.slice(0, lastSlashIndex);
							lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
						}
						lastSlash = index;
						dots = 0;
						continue;
					} else if (res.length > 0) {
						res = "";
						lastSegmentLength = 0;
						lastSlash = index;
						dots = 0;
						continue;
					}
				}
				if (allowAboveRoot) {
					res += res.length > 0 ? "/.." : "..";
					lastSegmentLength = 2;
				}
			} else {
				if (res.length > 0) res += `/${path.slice(lastSlash + 1, index)}`;
				else res = path.slice(lastSlash + 1, index);
				lastSegmentLength = index - lastSlash - 1;
			}
			lastSlash = index;
			dots = 0;
		} else if (char === "." && dots !== -1) ++dots;
		else dots = -1;
	}
	return res;
}
var isAbsolute = function(p) {
	return _IS_ABSOLUTE_RE.test(p);
};
var toNamespacedPath = function(p) {
	return normalizeWindowsPath(p);
};
var _EXTNAME_RE = /.(\.[^./]+)$/;
var extname = function(p) {
	const match = _EXTNAME_RE.exec(normalizeWindowsPath(p));
	return match && match[1] || "";
};
var relative = function(from, to) {
	const _from = resolve(from).replace(_ROOT_FOLDER_RE, "$1").split("/");
	const _to = resolve(to).replace(_ROOT_FOLDER_RE, "$1").split("/");
	if (_to[0][1] === ":" && _from[0][1] === ":" && _from[0] !== _to[0]) return _to.join("/");
	const _fromCopy = [..._from];
	for (const segment of _fromCopy) {
		if (_to[0] !== segment) break;
		_from.shift();
		_to.shift();
	}
	return [..._from.map(() => ".."), ..._to].join("/");
};
var dirname = function(p) {
	const segments = normalizeWindowsPath(p).replace(/\/$/, "").split("/").slice(0, -1);
	if (segments.length === 1 && _DRIVE_LETTER_RE.test(segments[0])) segments[0] += "/";
	return segments.join("/") || (isAbsolute(p) ? "/" : ".");
};
var format = function(p) {
	const segments = [
		p.root,
		p.dir,
		p.base ?? p.name + p.ext
	].filter(Boolean);
	return normalizeWindowsPath(p.root ? resolve(...segments) : segments.join("/"));
};
var basename = function(p, extension) {
	const lastSegment = normalizeWindowsPath(p).split("/").pop();
	return extension && lastSegment.endsWith(extension) ? lastSegment.slice(0, -extension.length) : lastSegment;
};
var parse$3 = function(p) {
	const root = normalizeWindowsPath(p).split("/").shift() || "/";
	const base = basename(p);
	const extension = extname(base);
	return {
		root,
		dir: dirname(p),
		base,
		ext: extension,
		name: base.slice(0, base.length - extension.length)
	};
};
var _pathModule = {
	.../* @__PURE__ */ Object.freeze({
		__proto__: null,
		basename,
		default: {
			__proto__: null,
			basename,
			delimiter,
			dirname,
			extname,
			format,
			isAbsolute,
			join,
			normalize,
			normalizeString,
			parse: parse$3,
			relative,
			resolve,
			sep,
			toNamespacedPath
		},
		delimiter,
		dirname,
		extname,
		format,
		isAbsolute,
		join,
		normalize,
		normalizeString,
		parse: parse$3,
		relative,
		resolve,
		sep,
		toNamespacedPath
	}),
	platform: "posix",
	posix: void 0,
	win32: void 0
};
_pathModule.posix = _pathModule;
_pathModule.win32 = _pathModule;
function getDefaultExportFromCjs(x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
function getAugmentedNamespace(n) {
	if (Object.prototype.hasOwnProperty.call(n, "__esModule")) return n;
	var f = n.default;
	if (typeof f == "function") {
		var a = function a() {
			var isInstance = false;
			try {
				isInstance = this instanceof a;
			} catch (e) {}
			if (isInstance) return Reflect.construct(f, arguments, this.constructor);
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
	} else a = {};
	Object.defineProperty(a, "__esModule", { value: true });
	Object.keys(n).forEach(function(k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function() {
				return n[k];
			}
		});
	});
	return a;
}
var picocolors_browser = { exports: {} };
var hasRequiredPicocolors_browser;
function requirePicocolors_browser() {
	if (hasRequiredPicocolors_browser) return picocolors_browser.exports;
	hasRequiredPicocolors_browser = 1;
	var x = String;
	var create = function() {
		return {
			isColorSupported: false,
			reset: x,
			bold: x,
			dim: x,
			italic: x,
			underline: x,
			inverse: x,
			hidden: x,
			strikethrough: x,
			black: x,
			red: x,
			green: x,
			yellow: x,
			blue: x,
			magenta: x,
			cyan: x,
			white: x,
			gray: x,
			bgBlack: x,
			bgRed: x,
			bgGreen: x,
			bgYellow: x,
			bgBlue: x,
			bgMagenta: x,
			bgCyan: x,
			bgWhite: x,
			blackBright: x,
			redBright: x,
			greenBright: x,
			yellowBright: x,
			blueBright: x,
			magentaBright: x,
			cyanBright: x,
			whiteBright: x,
			bgBlackBright: x,
			bgRedBright: x,
			bgGreenBright: x,
			bgYellowBright: x,
			bgBlueBright: x,
			bgMagentaBright: x,
			bgCyanBright: x,
			bgWhiteBright: x
		};
	};
	picocolors_browser.exports = create();
	picocolors_browser.exports.createColors = create;
	return picocolors_browser.exports;
}
var require$$2 = /*@__PURE__*/ getAugmentedNamespace(/* @__PURE__ */ Object.freeze({
	__proto__: null,
	default: {}
}));
var cssSyntaxError;
var hasRequiredCssSyntaxError;
function requireCssSyntaxError() {
	if (hasRequiredCssSyntaxError) return cssSyntaxError;
	hasRequiredCssSyntaxError = 1;
	let pico = /*@__PURE__*/ requirePicocolors_browser();
	let terminalHighlight = require$$2;
	class CssSyntaxError extends Error {
		constructor(message, line, column, source, file, plugin) {
			super(message);
			this.name = "CssSyntaxError";
			this.reason = message;
			if (file) this.file = file;
			if (source) this.source = source;
			if (plugin) this.plugin = plugin;
			if (typeof line !== "undefined" && typeof column !== "undefined") if (typeof line === "number") {
				this.line = line;
				this.column = column;
			} else {
				this.line = line.line;
				this.column = line.column;
				this.endLine = column.line;
				this.endColumn = column.column;
			}
			this.setMessage();
			if (Error.captureStackTrace) Error.captureStackTrace(this, CssSyntaxError);
		}
		setMessage() {
			this.message = this.plugin ? this.plugin + ": " : "";
			this.message += this.file ? this.file : "<css input>";
			if (typeof this.line !== "undefined") this.message += ":" + this.line + ":" + this.column;
			this.message += ": " + this.reason;
		}
		showSourceCode(color) {
			if (!this.source) return "";
			let css = this.source;
			if (color == null) color = pico.isColorSupported;
			let aside = (text) => text;
			let mark = (text) => text;
			let highlight = (text) => text;
			if (color) {
				let { bold, gray, red } = pico.createColors(true);
				mark = (text) => bold(red(text));
				aside = (text) => gray(text);
				if (terminalHighlight) highlight = (text) => terminalHighlight(text);
			}
			let lines = css.split(/\r?\n/);
			let start = Math.max(this.line - 3, 0);
			let end = Math.min(this.line + 2, lines.length);
			let maxWidth = String(end).length;
			return lines.slice(start, end).map((line, index) => {
				let number = start + 1 + index;
				let gutter = " " + (" " + number).slice(-maxWidth) + " | ";
				if (number === this.line) {
					if (line.length > 160) {
						let padding = 20;
						let subLineStart = Math.max(0, this.column - padding);
						let subLineEnd = Math.max(this.column + padding, this.endColumn + padding);
						let subLine = line.slice(subLineStart, subLineEnd);
						let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, Math.min(this.column - 1, padding - 1)).replace(/[^\t]/g, " ");
						return mark(">") + aside(gutter) + highlight(subLine) + "\n " + spacing + mark("^");
					}
					let spacing = aside(gutter.replace(/\d/g, " ")) + line.slice(0, this.column - 1).replace(/[^\t]/g, " ");
					return mark(">") + aside(gutter) + highlight(line) + "\n " + spacing + mark("^");
				}
				return " " + aside(gutter) + highlight(line);
			}).join("\n");
		}
		toString() {
			let code = this.showSourceCode();
			if (code) code = "\n\n" + code + "\n";
			return this.name + ": " + this.message + code;
		}
	}
	cssSyntaxError = CssSyntaxError;
	CssSyntaxError.default = CssSyntaxError;
	return cssSyntaxError;
}
var stringifier;
var hasRequiredStringifier;
function requireStringifier() {
	if (hasRequiredStringifier) return stringifier;
	hasRequiredStringifier = 1;
	const STYLE_TAG = /(<)(\/?style\b)/gi;
	const COMMENT_OPEN = /(<)(!--)/g;
	const AT_NAME_END = /[\t\n\f\r "#'()/;[\\\]{}]/;
	function escapeHTMLInCSS(str) {
		if (typeof str !== "string") return str;
		if (!str.includes("<")) return str;
		return str.replace(STYLE_TAG, "\\3c $2").replace(COMMENT_OPEN, "\\3c $2");
	}
	const DEFAULT_RAW = {
		after: "\n",
		beforeClose: "\n",
		beforeComment: "\n",
		beforeDecl: "\n",
		beforeOpen: " ",
		beforeRule: "\n",
		colon: ": ",
		commentLeft: " ",
		commentRight: " ",
		emptyBody: "",
		indent: "    ",
		semicolon: false
	};
	function capitalize(str) {
		return str[0].toUpperCase() + str.slice(1);
	}
	function atruleStart(str, node) {
		let name = "@" + node.name;
		let params = node.params ? str.rawValue(node, "params") : "";
		let afterName = node.raws.afterName;
		if (typeof afterName === "undefined") afterName = params ? " " : "";
		else if (afterName === "" && params && !AT_NAME_END.test(params[0])) afterName = " ";
		return name + afterName + params;
	}
	function pushBody(str, stack, node) {
		let nodes = node.nodes;
		let last = nodes.length - 1;
		while (last > 0) {
			if (nodes[last].type !== "comment") break;
			last -= 1;
		}
		let semicolon = str.raw(node, "semicolon");
		let isDocument = node.type === "document";
		for (let i = nodes.length - 1; i >= 0; i--) {
			let child = nodes[i];
			let childSemicolon = last !== i || semicolon;
			if (!childSemicolon && i < nodes.length - 1 && (child.type === "atrule" && !child.nodes || child.type === "decl" && child.prop.startsWith("--"))) childSemicolon = true;
			stack.push({
				document: isDocument,
				node: child,
				semicolon: childSemicolon
			});
		}
	}
	function pushBlock(str, stack, node, start) {
		let between = str.raw(node, "between", "beforeOpen");
		str.builder(escapeHTMLInCSS(start + between) + "{", node, "start");
		let hasNodes = node.nodes && node.nodes.length;
		let close = () => {
			let after = hasNodes ? str.raw(node, "after") : str.raw(node, "after", "emptyBody");
			if (after) str.builder(escapeHTMLInCSS(after));
			str.builder("}", node, "end");
			if (node.type === "rule" && node.raws.ownSemicolon) str.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, "end");
		};
		if (hasNodes) {
			stack.push(close);
			pushBody(str, stack, node);
		} else close();
	}
	class Stringifier {
		constructor(builder) {
			this.builder = builder;
		}
		atrule(node, semicolon) {
			let start = atruleStart(this, node);
			if (node.nodes) this.block(node, start);
			else {
				let end = (node.raws.between || "") + (semicolon ? ";" : "");
				this.builder(escapeHTMLInCSS(start + end), node);
			}
		}
		beforeAfter(node, detect) {
			let value;
			if (node.type === "decl") value = this.raw(node, null, "beforeDecl");
			else if (node.type === "comment") value = this.raw(node, null, "beforeComment");
			else if (detect === "before") value = this.raw(node, null, "beforeRule");
			else value = this.raw(node, null, "beforeClose");
			let buf = node.parent;
			let depth = 0;
			while (buf && buf.type !== "root") {
				depth += 1;
				buf = buf.parent;
			}
			if (value.includes("\n")) {
				let indent = this.raw(node, null, "indent");
				if (indent.length) for (let step = 0; step < depth; step++) value += indent;
			}
			return value;
		}
		block(node, start) {
			let between = this.raw(node, "between", "beforeOpen");
			this.builder(escapeHTMLInCSS(start + between) + "{", node, "start");
			let after;
			if (node.nodes && node.nodes.length) {
				this.body(node);
				after = this.raw(node, "after");
			} else after = this.raw(node, "after", "emptyBody");
			if (after) this.builder(escapeHTMLInCSS(after));
			this.builder("}", node, "end");
		}
		body(node) {
			let proto = Stringifier.prototype;
			let expandable = [
				"atrule",
				"block",
				"body",
				"rule",
				"stringify"
			].every((method) => this[method] === proto[method]);
			let stack = [];
			pushBody(this, stack, node);
			while (stack.length > 0) {
				let entry = stack.pop();
				if (typeof entry === "function") {
					entry();
					continue;
				}
				let child = entry.node;
				let before = this.raw(child, "before");
				if (before) this.builder(entry.document ? before : escapeHTMLInCSS(before));
				if (expandable && child.type === "rule") pushBlock(this, stack, child, this.rawValue(child, "selector"));
				else if (expandable && child.type === "atrule" && child.nodes) pushBlock(this, stack, child, atruleStart(this, child));
				else this.stringify(child, entry.semicolon);
			}
		}
		comment(node) {
			let left = this.raw(node, "left", "commentLeft");
			let right = this.raw(node, "right", "commentRight");
			this.builder(escapeHTMLInCSS("/*" + left + node.text + right + "*/"), node);
		}
		decl(node, semicolon) {
			let raws = node.raws;
			let between = this.raw(node, "between", "colon");
			let string = node.prop + between + this.rawValue(node, "value");
			if (node.important) string += raws.important || " !important";
			if (semicolon) string += ";";
			this.builder(escapeHTMLInCSS(string), node);
		}
		document(node) {
			this.body(node);
		}
		raw(node, own, detect) {
			let value;
			if (!detect) detect = own;
			if (own) {
				value = node.raws[own];
				if (typeof value !== "undefined") return value;
			}
			let parent = node.parent;
			if (detect === "before") {
				if (!parent || parent.type === "root" && parent.first === node) return "";
				if (parent && parent.type === "document") return "";
			}
			if (!parent) return DEFAULT_RAW[detect];
			let root = node.root();
			let cache = root.rawCache || (root.rawCache = {});
			if (typeof cache[detect] !== "undefined") return cache[detect];
			if (detect === "before" || detect === "after") return this.beforeAfter(node, detect);
			else {
				let method = "raw" + capitalize(detect);
				if (this[method]) value = this[method](root, node);
				else root.walk((i) => {
					value = i.raws[own];
					if (typeof value !== "undefined") return false;
				});
			}
			if (typeof value === "undefined") value = DEFAULT_RAW[detect];
			cache[detect] = value;
			return value;
		}
		rawBeforeClose(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && i.nodes.length > 0) {
					if (typeof i.raws.after !== "undefined") {
						value = i.raws.after;
						if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
						return false;
					}
				}
			});
			if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawBeforeComment(root, node) {
			let value;
			root.walkComments((i) => {
				if (typeof i.raws.before !== "undefined") {
					value = i.raws.before;
					if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
					return false;
				}
			});
			if (typeof value === "undefined") value = this.raw(node, null, "beforeDecl");
			else if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawBeforeDecl(root, node) {
			let value;
			root.walkDecls((i) => {
				if (typeof i.raws.before !== "undefined") {
					value = i.raws.before;
					if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
					return false;
				}
			});
			if (typeof value === "undefined") value = this.raw(node, null, "beforeRule");
			else if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawBeforeOpen(root) {
			let value;
			root.walk((i) => {
				if (i.type !== "decl") {
					value = i.raws.between;
					if (typeof value !== "undefined") return false;
				}
			});
			return value;
		}
		rawBeforeRule(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && (i.parent !== root || root.first !== i)) {
					if (typeof i.raws.before !== "undefined") {
						value = i.raws.before;
						if (value.includes("\n")) value = value.replace(/[^\n]+$/, "");
						return false;
					}
				}
			});
			if (value) value = value.replace(/\S/g, "");
			return value;
		}
		rawColon(root) {
			let value;
			root.walkDecls((i) => {
				if (typeof i.raws.between !== "undefined") {
					value = i.raws.between.replace(/[^\s:]/g, "");
					return false;
				}
			});
			return value;
		}
		rawEmptyBody(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && i.nodes.length === 0) {
					value = i.raws.after;
					if (typeof value !== "undefined") return false;
				}
			});
			return value;
		}
		rawIndent(root) {
			if (root.raws.indent) return root.raws.indent;
			let value;
			root.walk((i) => {
				let p = i.parent;
				if (p && p !== root && p.parent && p.parent === root) {
					if (typeof i.raws.before !== "undefined") {
						let parts = i.raws.before.split("\n");
						value = parts[parts.length - 1];
						value = value.replace(/\S/g, "");
						return false;
					}
				}
			});
			return value;
		}
		rawSemicolon(root) {
			let value;
			root.walk((i) => {
				if (i.nodes && i.nodes.length && i.last.type === "decl") {
					value = i.raws.semicolon;
					if (typeof value !== "undefined") return false;
				}
			});
			return value;
		}
		rawValue(node, prop) {
			let value = node[prop];
			let raw = node.raws[prop];
			if (raw && raw.value === value) return raw.raw;
			return value;
		}
		root(node) {
			if (node.source && node.source.input.hasBOM) this.builder("﻿", node, "start");
			this.body(node);
			if (node.raws.after) {
				let after = node.raws.after;
				let isDocument = node.parent && node.parent.type === "document";
				this.builder(isDocument ? after : escapeHTMLInCSS(after));
			}
		}
		rule(node) {
			this.block(node, this.rawValue(node, "selector"));
			if (node.raws.ownSemicolon) this.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, "end");
		}
		stringify(node, semicolon) {
			/* c8 ignore start */
			if (!this[node.type]) throw new Error("Unknown AST node type " + node.type + ". Maybe you need to change PostCSS stringifier.");
			/* c8 ignore stop */
			this[node.type](node, semicolon);
		}
	}
	stringifier = Stringifier;
	Stringifier.default = Stringifier;
	return stringifier;
}
var stringify_1;
var hasRequiredStringify;
function requireStringify() {
	if (hasRequiredStringify) return stringify_1;
	hasRequiredStringify = 1;
	let Stringifier = requireStringifier();
	function stringify(node, builder) {
		new Stringifier(builder).stringify(node);
	}
	stringify_1 = stringify;
	stringify.default = stringify;
	return stringify_1;
}
var symbols = {};
var hasRequiredSymbols;
function requireSymbols() {
	if (hasRequiredSymbols) return symbols;
	hasRequiredSymbols = 1;
	symbols.isClean = Symbol("isClean");
	symbols.my = Symbol("my");
	return symbols;
}
var node;
var hasRequiredNode$1;
function requireNode$1() {
	if (hasRequiredNode$1) return node;
	hasRequiredNode$1 = 1;
	let CssSyntaxError = requireCssSyntaxError();
	let Stringifier = requireStringifier();
	let stringify = requireStringify();
	let { isClean, my } = requireSymbols();
	function cloneNode(obj, parent) {
		let cloned = new obj.constructor();
		let stack = [[
			obj,
			cloned,
			parent
		]];
		while (stack.length > 0) {
			let [source, target, targetParent] = stack.pop();
			for (let i in source) {
				if (!Object.prototype.hasOwnProperty.call(source, i))
 /* c8 ignore next 2 */
				continue;
				if (i === "proxyCache") continue;
				let value = source[i];
				let type = typeof value;
				if (i === "parent" && type === "object") {
					if (targetParent) target[i] = targetParent;
				} else if (i === "source") target[i] = value;
				else if (Array.isArray(value)) {
					let children = [];
					target[i] = children;
					for (let j of value) {
						let childClone = new j.constructor();
						children.push(childClone);
						stack.push([
							j,
							childClone,
							target
						]);
					}
				} else {
					if (type === "object" && value !== null) {
						let valueClone = new value.constructor();
						stack.push([
							value,
							valueClone,
							void 0
						]);
						value = valueClone;
					}
					target[i] = value;
				}
			}
		}
		return cloned;
	}
	function sourceOffset(inputCSS, position) {
		if (position && typeof position.offset !== "undefined") return position.offset;
		let column = 1;
		let line = 1;
		let offset = 0;
		for (let i = 0; i < inputCSS.length; i++) {
			if (line === position.line && column === position.column) {
				offset = i;
				break;
			}
			if (inputCSS[i] === "\n") {
				column = 1;
				line += 1;
			} else column += 1;
		}
		return offset;
	}
	class Node {
		get proxyOf() {
			return this;
		}
		constructor(defaults = {}) {
			this.raws = {};
			this[isClean] = false;
			this[my] = true;
			for (let name of Object.keys(defaults)) {
				if (name === "__proto__") continue;
				if (name === "nodes") {
					this.nodes = [];
					for (let node of defaults[name]) if (typeof node.clone === "function" && node.parent) this.append(node.clone());
					else this.append(node);
				} else this[name] = defaults[name];
			}
		}
		addToError(error) {
			error.postcssNode = this;
			if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
				let s = this.source;
				error.stack = error.stack.replace(/\n\s{4}at /, `$&${s.input.from}:${s.start.line}:${s.start.column}$&`);
			}
			return error;
		}
		after(add) {
			this.parent.insertAfter(this, add);
			return this;
		}
		assign(overrides = {}) {
			for (let name in overrides) this[name] = overrides[name];
			return this;
		}
		before(add) {
			this.parent.insertBefore(this, add);
			return this;
		}
		cleanRaws(keepBetween) {
			delete this.raws.before;
			delete this.raws.after;
			if (!keepBetween) delete this.raws.between;
		}
		clone(overrides = {}) {
			let cloned = cloneNode(this);
			for (let name in overrides) cloned[name] = overrides[name];
			return cloned;
		}
		cloneAfter(overrides = {}) {
			let cloned = this.clone(overrides);
			this.parent.insertAfter(this, cloned);
			return cloned;
		}
		cloneBefore(overrides = {}) {
			let cloned = this.clone(overrides);
			this.parent.insertBefore(this, cloned);
			return cloned;
		}
		error(message, opts = {}) {
			if (this.source) {
				let { end, start } = this.rangeBy(opts);
				return this.source.input.error(message, {
					column: start.column,
					line: start.line
				}, {
					column: end.column,
					line: end.line
				}, opts);
			}
			return new CssSyntaxError(message);
		}
		getProxyProcessor() {
			return {
				get(node, prop) {
					if (prop === "proxyOf") return node;
					else if (prop === "root") return () => node.root().toProxy();
					else return node[prop];
				},
				set(node, prop, value) {
					if (node[prop] === value) return true;
					node[prop] = value;
					if (prop === "prop" || prop === "value" || prop === "name" || prop === "params" || prop === "important" || prop === "text") node.markDirty();
					return true;
				}
			};
		}
		/* c8 ignore next 3 */
		markClean() {
			this[isClean] = true;
		}
		markDirty() {
			if (this[isClean]) {
				this[isClean] = false;
				let next = this;
				while (next = next.parent) next[isClean] = false;
			}
		}
		next() {
			if (!this.parent) return void 0;
			let index = this.parent.index(this);
			return this.parent.nodes[index + 1];
		}
		positionBy(opts = {}) {
			let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
			let pos = {
				column: this.source.start.column,
				line: this.source.start.line,
				offset: sourceOffset(inputString, this.source.start)
			};
			if (opts.index) pos = this.positionInside(opts.index);
			else if (opts.word) {
				let index = inputString.slice(sourceOffset(inputString, this.source.start), sourceOffset(inputString, this.source.end)).indexOf(opts.word);
				if (index !== -1) pos = this.positionInside(index);
			}
			return pos;
		}
		positionInside(index) {
			let column = this.source.start.column;
			let line = this.source.start.line;
			let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
			let offset = sourceOffset(inputString, this.source.start);
			let end = offset + index;
			for (let i = offset; i < end; i++) if (inputString[i] === "\n") {
				column = 1;
				line += 1;
			} else column += 1;
			return {
				column,
				line,
				offset: end
			};
		}
		prev() {
			if (!this.parent) return void 0;
			let index = this.parent.index(this);
			return this.parent.nodes[index - 1];
		}
		rangeBy(opts = {}) {
			let inputString = "document" in this.source.input ? this.source.input.document : this.source.input.css;
			let start = {
				column: this.source.start.column,
				line: this.source.start.line,
				offset: sourceOffset(inputString, this.source.start)
			};
			let end = this.source.end ? {
				column: this.source.end.column + 1,
				line: this.source.end.line,
				offset: typeof this.source.end.offset === "number" ? this.source.end.offset : sourceOffset(inputString, this.source.end) + 1
			} : {
				column: start.column + 1,
				line: start.line,
				offset: start.offset + 1
			};
			if (opts.word) {
				let index = inputString.slice(sourceOffset(inputString, this.source.start), sourceOffset(inputString, this.source.end)).indexOf(opts.word);
				if (index !== -1) {
					start = this.positionInside(index);
					end = this.positionInside(index + opts.word.length);
				}
			} else {
				if (opts.start) start = {
					column: opts.start.column,
					line: opts.start.line,
					offset: sourceOffset(inputString, opts.start)
				};
				else if (typeof opts.index === "number") start = this.positionInside(opts.index);
				if (opts.end) end = {
					column: opts.end.column,
					line: opts.end.line,
					offset: sourceOffset(inputString, opts.end)
				};
				else if (typeof opts.endIndex === "number") end = this.positionInside(opts.endIndex);
				else if (typeof opts.index === "number") end = this.positionInside(opts.index + 1);
			}
			if (end.line < start.line || end.line === start.line && end.column <= start.column) end = {
				column: start.column + 1,
				line: start.line,
				offset: start.offset + 1
			};
			return {
				end,
				start
			};
		}
		raw(prop, defaultType) {
			return new Stringifier().raw(this, prop, defaultType);
		}
		remove() {
			if (this.parent) this.parent.removeChild(this);
			this.parent = void 0;
			return this;
		}
		replaceWith(...nodes) {
			if (this.parent) {
				let bookmark = this;
				let foundSelf = false;
				for (let node of nodes) if (node === this) foundSelf = true;
				else if (foundSelf) {
					this.parent.insertAfter(bookmark, node);
					bookmark = node;
				} else this.parent.insertBefore(bookmark, node);
				if (!foundSelf) this.remove();
			}
			return this;
		}
		root() {
			let result = this;
			while (result.parent && result.parent.type !== "document") result = result.parent;
			return result;
		}
		toJSON(_, inputs) {
			let emitInputs = inputs == null;
			inputs = inputs || /* @__PURE__ */ new Map();
			let holderOfRoot = [];
			let queue = [[
				this,
				holderOfRoot,
				0
			]];
			for (let step = 0; step < queue.length; step++) {
				let [node, holder, key] = queue[step];
				let fixed = {};
				holder[key] = fixed;
				for (let name in node) {
					if (!Object.prototype.hasOwnProperty.call(node, name))
 /* c8 ignore next 2 */
					continue;
					if (name === "parent" || name === "proxyCache") continue;
					let value = node[name];
					if (Array.isArray(value)) {
						let fixedArray = [];
						fixed[name] = fixedArray;
						for (let i = 0; i < value.length; i++) {
							let item = value[i];
							if (typeof item === "object" && item.toJSON) if (item.toJSON === Node.prototype.toJSON) queue.push([
								item,
								fixedArray,
								i
							]);
							else fixedArray[i] = item.toJSON(null, inputs);
							else fixedArray[i] = item;
						}
					} else if (typeof value === "object" && value.toJSON) if (value.toJSON === Node.prototype.toJSON) queue.push([
						value,
						fixed,
						name
					]);
					else fixed[name] = value.toJSON(null, inputs);
					else if (name === "source") {
						if (value == null) continue;
						let inputId = inputs.get(value.input);
						if (inputId == null) {
							inputId = inputs.size;
							inputs.set(value.input, inputId);
						}
						fixed[name] = {
							end: value.end,
							inputId,
							start: value.start
						};
					} else fixed[name] = value;
				}
			}
			let fixed = holderOfRoot[0];
			if (emitInputs) fixed.inputs = [...inputs.keys()].map((input) => input.toJSON());
			return fixed;
		}
		toProxy() {
			if (!this.proxyCache) this.proxyCache = new Proxy(this, this.getProxyProcessor());
			return this.proxyCache;
		}
		toString(stringifier = stringify) {
			if (stringifier.stringify) stringifier = stringifier.stringify;
			let result = "";
			stringifier(this, (i) => {
				result += i;
			});
			return result;
		}
		warn(result, text, opts = {}) {
			let data = { node: this };
			for (let i in opts) data[i] = opts[i];
			return result.warn(text, data);
		}
	}
	node = Node;
	Node.default = Node;
	return node;
}
var comment;
var hasRequiredComment;
function requireComment() {
	if (hasRequiredComment) return comment;
	hasRequiredComment = 1;
	let Node = requireNode$1();
	class Comment extends Node {
		constructor(defaults) {
			super(defaults);
			this.type = "comment";
		}
	}
	comment = Comment;
	Comment.default = Comment;
	return comment;
}
var declaration;
var hasRequiredDeclaration;
function requireDeclaration() {
	if (hasRequiredDeclaration) return declaration;
	hasRequiredDeclaration = 1;
	let Node = requireNode$1();
	class Declaration extends Node {
		get variable() {
			return this.prop.startsWith("--") || this.prop[0] === "$";
		}
		constructor(defaults) {
			if (defaults && typeof defaults.value !== "undefined" && typeof defaults.value !== "string") defaults = {
				...defaults,
				value: String(defaults.value)
			};
			super(defaults);
			this.type = "decl";
		}
	}
	declaration = Declaration;
	Declaration.default = Declaration;
	return declaration;
}
var container;
var hasRequiredContainer$1;
function requireContainer$1() {
	if (hasRequiredContainer$1) return container;
	hasRequiredContainer$1 = 1;
	let Comment = requireComment();
	let Declaration = requireDeclaration();
	let Node = requireNode$1();
	let { isClean, my } = requireSymbols();
	let AtRule, parse, Root, Rule;
	function cleanSource(nodes) {
		let stack = nodes.slice();
		while (stack.length > 0) {
			let node = stack.pop();
			delete node.source;
			if (node.nodes) {
				node.nodes = node.nodes.slice();
				for (let i of node.nodes) stack.push(i);
			}
		}
		return nodes.slice();
	}
	function markTreeDirty(node) {
		let stack = [node];
		while (stack.length > 0) {
			let next = stack.pop();
			next[isClean] = false;
			if (next.proxyOf.nodes) for (let i of next.proxyOf.nodes) stack.push(i);
		}
	}
	class Container extends Node {
		get first() {
			if (!this.proxyOf.nodes) return void 0;
			return this.proxyOf.nodes[0];
		}
		get last() {
			if (!this.proxyOf.nodes) return void 0;
			return this.proxyOf.nodes[this.proxyOf.nodes.length - 1];
		}
		append(...children) {
			for (let child of children) {
				let nodes = this.normalize(child, this.last);
				for (let node of nodes) this.proxyOf.nodes.push(node);
			}
			this.markDirty();
			return this;
		}
		cleanRaws(keepBetween) {
			let stack = [this];
			while (stack.length > 0) {
				let node = stack.pop();
				if (node !== this && node.cleanRaws !== Container.prototype.cleanRaws) {
					node.cleanRaws(keepBetween);
					continue;
				}
				Node.prototype.cleanRaws.call(node, keepBetween);
				if (node.nodes) for (let child of node.nodes) stack.push(child);
			}
		}
		each(callback) {
			if (!this.proxyOf.nodes) return void 0;
			let iterator = this.getIterator();
			let index, result;
			while (this.indexes[iterator] < this.proxyOf.nodes.length) {
				index = this.indexes[iterator];
				result = callback(this.proxyOf.nodes[index], index);
				if (result === false) break;
				this.indexes[iterator] += 1;
			}
			delete this.indexes[iterator];
			return result;
		}
		every(condition) {
			return this.nodes.every(condition);
		}
		getIterator() {
			if (!this.lastEach) this.lastEach = 0;
			if (!this.indexes) this.indexes = {};
			this.lastEach += 1;
			let iterator = this.lastEach;
			this.indexes[iterator] = 0;
			return iterator;
		}
		getProxyProcessor() {
			return {
				get(node, prop) {
					if (prop === "proxyOf") return node;
					else if (!node[prop]) return node[prop];
					else if (prop === "each" || typeof prop === "string" && prop.startsWith("walk")) return (...args) => {
						return node[prop](...args.map((i) => {
							if (typeof i === "function") return (child, index) => i(child.toProxy(), index);
							else return i;
						}));
					};
					else if (prop === "every" || prop === "some") return (cb) => {
						return node[prop]((child, ...other) => cb(child.toProxy(), ...other));
					};
					else if (prop === "root") return () => node.root().toProxy();
					else if (prop === "nodes") return node.nodes.map((i) => i.toProxy());
					else if (prop === "first" || prop === "last") return node[prop].toProxy();
					else return node[prop];
				},
				set(node, prop, value) {
					if (node[prop] === value) return true;
					node[prop] = value;
					if (prop === "name" || prop === "params" || prop === "selector") node.markDirty();
					return true;
				}
			};
		}
		index(child) {
			if (typeof child === "number") return child;
			if (child.proxyOf) child = child.proxyOf;
			return this.proxyOf.nodes.indexOf(child);
		}
		insertAfter(exist, add) {
			let existIndex = this.index(exist);
			let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse();
			existIndex = this.index(exist);
			for (let node of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node);
			let index;
			for (let id in this.indexes) {
				index = this.indexes[id];
				if (existIndex < index) this.indexes[id] = index + nodes.length;
			}
			this.markDirty();
			return this;
		}
		insertBefore(exist, add) {
			let existIndex = this.index(exist);
			let type = existIndex === 0 ? "prepend" : false;
			let nodes = this.normalize(add, this.proxyOf.nodes[existIndex], type).reverse();
			existIndex = this.index(exist);
			for (let node of nodes) this.proxyOf.nodes.splice(existIndex, 0, node);
			let index;
			for (let id in this.indexes) {
				index = this.indexes[id];
				if (existIndex <= index) this.indexes[id] = index + nodes.length;
			}
			this.markDirty();
			return this;
		}
		normalize(nodes, sample) {
			if (typeof nodes === "string") nodes = cleanSource(parse(nodes).nodes);
			else if (typeof nodes === "undefined") nodes = [];
			else if (Array.isArray(nodes)) {
				nodes = nodes.slice(0);
				for (let i of nodes) if (i.parent) i.parent.removeChild(i, "ignore");
			} else if (nodes.type === "root" && this.type !== "document") {
				nodes = nodes.nodes.slice(0);
				for (let i of nodes) if (i.parent) i.parent.removeChild(i, "ignore");
			} else if (nodes.type) nodes = [nodes];
			else if (nodes.prop) {
				if (typeof nodes.value === "undefined") throw new Error("Value field is missed in node creation");
				else if (typeof nodes.value !== "string") nodes.value = String(nodes.value);
				nodes = [new Declaration(nodes)];
			} else if (nodes.selector || nodes.selectors) nodes = [new Rule(nodes)];
			else if (nodes.name) nodes = [new AtRule(nodes)];
			else if (nodes.text) nodes = [new Comment(nodes)];
			else throw new Error("Unknown node type in node creation");
			return nodes.map((i) => {
				/* c8 ignore next */
				if (!i[my]) Container.rebuild(i);
				i = i.proxyOf;
				if (i.parent) i.parent.removeChild(i);
				if (i[isClean]) markTreeDirty(i);
				if (!i.raws) i.raws = {};
				if (typeof i.raws.before === "undefined") {
					if (sample && typeof sample.raws.before !== "undefined") i.raws.before = sample.raws.before.replace(/\S/g, "");
				}
				i.parent = this.proxyOf;
				return i;
			});
		}
		prepend(...children) {
			children = children.reverse();
			for (let child of children) {
				let nodes = this.normalize(child, this.first, "prepend").reverse();
				for (let node of nodes) this.proxyOf.nodes.unshift(node);
				for (let id in this.indexes) this.indexes[id] = this.indexes[id] + nodes.length;
			}
			this.markDirty();
			return this;
		}
		push(child) {
			child.parent = this;
			this.proxyOf.nodes.push(child);
			return this;
		}
		removeAll() {
			for (let node of this.proxyOf.nodes) node.parent = void 0;
			this.proxyOf.nodes = [];
			this.markDirty();
			return this;
		}
		removeChild(child) {
			child = this.index(child);
			this.proxyOf.nodes[child].parent = void 0;
			this.proxyOf.nodes.splice(child, 1);
			let index;
			for (let id in this.indexes) {
				index = this.indexes[id];
				if (index >= child) this.indexes[id] = index - 1;
			}
			this.markDirty();
			return this;
		}
		replaceValues(pattern, opts, callback) {
			if (!callback) {
				callback = opts;
				opts = {};
			}
			this.walkDecls((decl) => {
				if (opts.props && !opts.props.includes(decl.prop)) return;
				if (opts.fast && !decl.value.includes(opts.fast)) return;
				decl.value = decl.value.replace(pattern, callback);
			});
			this.markDirty();
			return this;
		}
		some(condition) {
			return this.nodes.some(condition);
		}
		walk(callback) {
			if (!this.proxyOf.nodes) return void 0;
			let stack = [{
				iterator: this.getIterator(),
				node: this.proxyOf
			}];
			while (stack.length > 0) {
				let { iterator, node } = stack[stack.length - 1];
				let index = node.indexes[iterator];
				if (index >= node.proxyOf.nodes.length) {
					delete node.indexes[iterator];
					stack.pop();
					let parent = stack[stack.length - 1];
					if (parent) parent.node.indexes[parent.iterator] += 1;
					continue;
				}
				let child = node.proxyOf.nodes[index];
				let result;
				try {
					result = callback(child, index);
				} catch (e) {
					throw child.addToError(e);
				}
				if (result === false) {
					for (let opened of stack) delete opened.node.indexes[opened.iterator];
					return false;
				}
				if (child.walk && child.proxyOf.nodes) stack.push({
					iterator: child.getIterator(),
					node: child
				});
				else node.indexes[iterator] += 1;
			}
		}
		walkAtRules(name, callback) {
			if (!callback) {
				callback = name;
				return this.walk((child, i) => {
					if (child.type === "atrule") return callback(child, i);
				});
			}
			if (name instanceof RegExp) return this.walk((child, i) => {
				if (child.type === "atrule" && name.test(child.name)) return callback(child, i);
			});
			return this.walk((child, i) => {
				if (child.type === "atrule" && child.name === name) return callback(child, i);
			});
		}
		walkComments(callback) {
			return this.walk((child, i) => {
				if (child.type === "comment") return callback(child, i);
			});
		}
		walkDecls(prop, callback) {
			if (!callback) {
				callback = prop;
				return this.walk((child, i) => {
					if (child.type === "decl") return callback(child, i);
				});
			}
			if (prop instanceof RegExp) return this.walk((child, i) => {
				if (child.type === "decl" && prop.test(child.prop)) return callback(child, i);
			});
			return this.walk((child, i) => {
				if (child.type === "decl" && child.prop === prop) return callback(child, i);
			});
		}
		walkRules(selector, callback) {
			if (!callback) {
				callback = selector;
				return this.walk((child, i) => {
					if (child.type === "rule") return callback(child, i);
				});
			}
			if (selector instanceof RegExp) return this.walk((child, i) => {
				if (child.type === "rule" && selector.test(child.selector)) return callback(child, i);
			});
			return this.walk((child, i) => {
				if (child.type === "rule" && child.selector === selector) return callback(child, i);
			});
		}
	}
	Container.registerParse = (dependant) => {
		parse = dependant;
	};
	Container.registerRule = (dependant) => {
		Rule = dependant;
	};
	Container.registerAtRule = (dependant) => {
		AtRule = dependant;
	};
	Container.registerRoot = (dependant) => {
		Root = dependant;
	};
	container = Container;
	Container.default = Container;
	/* c8 ignore start */
	Container.rebuild = (node) => {
		let stack = [node];
		while (stack.length > 0) {
			let next = stack.pop();
			if (next.type === "atrule") Object.setPrototypeOf(next, AtRule.prototype);
			else if (next.type === "rule") Object.setPrototypeOf(next, Rule.prototype);
			else if (next.type === "decl") Object.setPrototypeOf(next, Declaration.prototype);
			else if (next.type === "comment") Object.setPrototypeOf(next, Comment.prototype);
			else if (next.type === "root") Object.setPrototypeOf(next, Root.prototype);
			next[my] = true;
			if (next.nodes) for (let child of next.nodes) stack.push(child);
		}
	};
	/* c8 ignore stop */
	return container;
}
var atRule;
var hasRequiredAtRule;
function requireAtRule() {
	if (hasRequiredAtRule) return atRule;
	hasRequiredAtRule = 1;
	let Container = requireContainer$1();
	class AtRule extends Container {
		constructor(defaults) {
			super(defaults);
			this.type = "atrule";
		}
		append(...children) {
			if (!this.proxyOf.nodes) this.nodes = [];
			return super.append(...children);
		}
		prepend(...children) {
			if (!this.proxyOf.nodes) this.nodes = [];
			return super.prepend(...children);
		}
	}
	atRule = AtRule;
	AtRule.default = AtRule;
	Container.registerAtRule(AtRule);
	return atRule;
}
var document;
var hasRequiredDocument;
function requireDocument() {
	if (hasRequiredDocument) return document;
	hasRequiredDocument = 1;
	let Container = requireContainer$1();
	let LazyResult, Processor;
	class Document extends Container {
		constructor(defaults) {
			super({
				type: "document",
				...defaults
			});
			if (!this.nodes) this.nodes = [];
		}
		toResult(opts = {}) {
			return new LazyResult(new Processor(), this, opts).stringify();
		}
	}
	Document.registerLazyResult = (dependant) => {
		LazyResult = dependant;
	};
	Document.registerProcessor = (dependant) => {
		Processor = dependant;
	};
	document = Document;
	Document.default = Document;
	return document;
}
var nonSecure;
var hasRequiredNonSecure;
function requireNonSecure() {
	if (hasRequiredNonSecure) return nonSecure;
	hasRequiredNonSecure = 1;
	let urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
	let customAlphabet = (alphabet, defaultSize = 21) => {
		return (size = defaultSize) => {
			let id = "";
			let i = size | 0;
			while (i-- > 0) id += alphabet[Math.random() * alphabet.length | 0];
			return id;
		};
	};
	let nanoid = (size = 21) => {
		let id = "";
		let i = size | 0;
		while (i-- > 0) id += urlAlphabet[Math.random() * 64 | 0];
		return id;
	};
	nonSecure = {
		nanoid,
		customAlphabet
	};
	return nonSecure;
}
var previousMap;
var hasRequiredPreviousMap;
function requirePreviousMap() {
	if (hasRequiredPreviousMap) return previousMap;
	hasRequiredPreviousMap = 1;
	let { existsSync, readFileSync } = require$$2;
	let { dirname, isAbsolute, join, relative, sep } = require$$2;
	let { SourceMapConsumer, SourceMapGenerator } = require$$2;
	function fromBase64(str) {
		if (Buffer) return Buffer.from(str, "base64").toString();
		else
 /* c8 ignore next 2 */
		return window.atob(str);
	}
	class PreviousMap {
		constructor(css, opts) {
			if (opts.map === false) return;
			if (opts.unsafeMap) this.unsafeMap = true;
			this.loadAnnotation(css);
			this.inline = this.startWith(this.annotation, "data:");
			let prev = opts.map ? opts.map.prev : void 0;
			let text = this.loadMap(opts.from, prev);
			if (!this.mapFile && opts.from) this.mapFile = opts.from;
			if (this.mapFile) this.root = dirname(this.mapFile);
			if (text) this.text = text;
		}
		consumer() {
			if (!this.consumerCache) this.consumerCache = new SourceMapConsumer(this.json || this.text);
			return this.consumerCache;
		}
		decodeInline(text) {
			let baseCharsetUri = /^data:application\/json;charset=utf-?8;base64,/;
			let baseUri = /^data:application\/json;base64,/;
			let uriMatch = text.match(/^data:application\/json;charset=utf-?8,/) || text.match(/^data:application\/json,/);
			if (uriMatch) return decodeURIComponent(text.substr(uriMatch[0].length));
			let baseUriMatch = text.match(baseCharsetUri) || text.match(baseUri);
			if (baseUriMatch) return fromBase64(text.substr(baseUriMatch[0].length));
			let encoding = text.slice(22);
			encoding = encoding.slice(0, encoding.indexOf(","));
			throw new Error("Unsupported source map encoding " + encoding);
		}
		getAnnotationURL(sourceMapString) {
			return sourceMapString.replace(/^\/\*\s*# sourceMappingURL=/, "").trim();
		}
		isMap(map) {
			if (typeof map !== "object") return false;
			return typeof map.mappings === "string" || typeof map._mappings === "string" || Array.isArray(map.sections);
		}
		loadAnnotation(css) {
			let comments = css.match(/\/\*\s*# sourceMappingURL=/g);
			if (!comments) return;
			let start = css.lastIndexOf(comments.pop());
			let end = css.indexOf("*/", start);
			if (start > -1 && end > -1) this.annotation = this.getAnnotationURL(css.substring(start, end));
		}
		loadFile(path, cssFile, trusted) {
			if (!trusted && !this.unsafeMap) {
				if (!/\.map$/i.test(path)) return void 0;
				if (!cssFile) return void 0;
				let rel = relative(dirname(cssFile), path);
				if (rel === ".." || rel.startsWith(".." + sep) || isAbsolute(rel)) return;
			}
			this.root = dirname(path);
			if (existsSync(path)) {
				this.mapFile = path;
				return readFileSync(path, "utf-8").toString().trim();
			}
		}
		loadMap(file, prev) {
			if (prev === false) return false;
			if (prev) if (typeof prev === "string") return prev;
			else if (typeof prev === "function") {
				let prevPath = prev(file);
				if (prevPath) {
					let map = this.loadFile(prevPath, file, true);
					if (!map) throw new Error("Unable to load previous source map: " + prevPath.toString());
					return map;
				}
			} else if (prev instanceof SourceMapConsumer) return SourceMapGenerator.fromSourceMap(prev).toString();
			else if (prev instanceof SourceMapGenerator) return prev.toString();
			else if (this.isMap(prev)) return JSON.stringify(prev);
			else throw new Error("Unsupported previous source map format: " + prev.toString());
			else if (this.inline) return this.decodeInline(this.annotation);
			else if (this.annotation) {
				let map = this.annotation;
				if (file) map = join(dirname(file), map);
				let unknown = this.loadFile(map, file, false);
				if (unknown) try {
					/* c8 ignore next 4 */
					this.json = JSON.parse(unknown.replace(/^\)]}'[^\n]*\n/, ""));
				} catch {
					return;
				}
				return unknown;
			}
		}
		startWith(string, start) {
			if (!string) return false;
			return string.substr(0, start.length) === start;
		}
		withContent() {
			return !!(this.consumer().sourcesContent && this.consumer().sourcesContent.length > 0);
		}
	}
	previousMap = PreviousMap;
	PreviousMap.default = PreviousMap;
	return previousMap;
}
var input;
var hasRequiredInput;
function requireInput() {
	if (hasRequiredInput) return input;
	hasRequiredInput = 1;
	let { nanoid } = /*@__PURE__*/ requireNonSecure();
	let { isAbsolute, resolve } = require$$2;
	let { SourceMapConsumer, SourceMapGenerator } = require$$2;
	let { fileURLToPath, pathToFileURL } = require$$2;
	let CssSyntaxError = requireCssSyntaxError();
	let PreviousMap = requirePreviousMap();
	let terminalHighlight = require$$2;
	let lineToIndexCache = Symbol("lineToIndexCache");
	let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
	let pathAvailable = Boolean(resolve && isAbsolute);
	function getLineToIndex(input) {
		if (input[lineToIndexCache]) return input[lineToIndexCache];
		let lines = input.css.split("\n");
		let lineToIndex = new Array(lines.length);
		let prevIndex = 0;
		for (let i = 0, l = lines.length; i < l; i++) {
			lineToIndex[i] = prevIndex;
			prevIndex += lines[i].length + 1;
		}
		input[lineToIndexCache] = lineToIndex;
		return lineToIndex;
	}
	class Input {
		get from() {
			return this.file || this.id;
		}
		constructor(css, opts = {}) {
			if (css === null || typeof css === "undefined" || typeof css === "object" && !css.toString) throw new Error(`PostCSS received ${css} instead of CSS string`);
			this.css = css.toString();
			if (this.css[0] === "﻿" || this.css[0] === "￾") {
				this.hasBOM = true;
				this.css = this.css.slice(1);
			} else this.hasBOM = false;
			this.document = this.css;
			if (opts.document) this.document = opts.document.toString();
			if (opts.from) if (!pathAvailable || /^\w+:\/\//.test(opts.from) || isAbsolute(opts.from)) this.file = opts.from;
			else this.file = resolve(opts.from);
			if (pathAvailable && sourceMapAvailable) {
				let map = new PreviousMap(this.css, opts);
				if (map.text) {
					this.map = map;
					let file = map.consumer().file;
					if (!this.file && file) this.file = this.mapResolve(file);
				}
			}
			if (!this.file) this.id = "<input css " + nanoid(6) + ">";
			if (this.map) this.map.file = this.from;
		}
		error(message, line, column, opts = {}) {
			let endColumn, endLine, endOffset, offset, result;
			if (line && typeof line === "object") {
				let start = line;
				let end = column;
				if (typeof start.offset === "number") {
					offset = start.offset;
					let pos = this.fromOffset(offset);
					line = pos.line;
					column = pos.col;
				} else {
					line = start.line;
					column = start.column;
					offset = this.fromLineAndColumn(line, column);
				}
				if (typeof end.offset === "number") {
					endOffset = end.offset;
					let pos = this.fromOffset(endOffset);
					endLine = pos.line;
					endColumn = pos.col;
				} else {
					endLine = end.line;
					endColumn = end.column;
					endOffset = this.fromLineAndColumn(end.line, end.column);
				}
			} else if (!column) {
				offset = line;
				let pos = this.fromOffset(offset);
				line = pos.line;
				column = pos.col;
			} else offset = this.fromLineAndColumn(line, column);
			let origin = this.origin(line, column, endLine, endColumn);
			if (origin) result = new CssSyntaxError(message, origin.endLine === void 0 ? origin.line : {
				column: origin.column,
				line: origin.line
			}, origin.endLine === void 0 ? origin.column : {
				column: origin.endColumn,
				line: origin.endLine
			}, origin.source, origin.file, opts.plugin);
			else result = new CssSyntaxError(message, endLine === void 0 ? line : {
				column,
				line
			}, endLine === void 0 ? column : {
				column: endColumn,
				line: endLine
			}, this.css, this.file, opts.plugin);
			result.input = {
				column,
				endColumn,
				endLine,
				endOffset,
				line,
				offset,
				source: this.css
			};
			if (this.file) {
				if (pathToFileURL) result.input.url = pathToFileURL(this.file).toString();
				result.input.file = this.file;
			}
			return result;
		}
		fromLineAndColumn(line, column) {
			return getLineToIndex(this)[line - 1] + column - 1;
		}
		fromOffset(offset) {
			let lineToIndex = getLineToIndex(this);
			let lastLine = lineToIndex[lineToIndex.length - 1];
			let min = 0;
			if (offset >= lastLine) min = lineToIndex.length - 1;
			else {
				let max = lineToIndex.length - 2;
				let mid;
				while (min < max) {
					mid = min + (max - min >> 1);
					if (offset < lineToIndex[mid]) max = mid - 1;
					else if (offset >= lineToIndex[mid + 1]) min = mid + 1;
					else {
						min = mid;
						break;
					}
				}
			}
			return {
				col: offset - lineToIndex[min] + 1,
				line: min + 1
			};
		}
		mapResolve(file) {
			if (/^\w+:\/\//.test(file)) return file;
			return resolve(this.map.consumer().sourceRoot || this.map.root || ".", file);
		}
		origin(line, column, endLine, endColumn) {
			if (!this.map) return false;
			let consumer = this.map.consumer();
			let from = consumer.originalPositionFor({
				column: column - 1,
				line
			});
			if (!from.source) return false;
			let to;
			if (typeof endLine === "number") {
				let toPosition = consumer.originalPositionFor({
					column: endColumn - 1,
					line: endLine
				});
				if (toPosition.source) to = toPosition;
			}
			let fromUrl;
			if (isAbsolute(from.source)) fromUrl = pathToFileURL(from.source);
			else fromUrl = new URL(from.source, this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile));
			let result = {
				column: from.column + 1,
				endColumn: to && to.column + 1,
				endLine: to && to.line,
				line: from.line,
				url: fromUrl.toString()
			};
			if (fromUrl.protocol === "file:") if (fileURLToPath) result.file = fileURLToPath(fromUrl);
			else
 /* c8 ignore next 2 */
			throw new Error(`file: protocol is not available in this PostCSS build`);
			let source = consumer.sourceContentFor(from.source);
			if (source) result.source = source;
			return result;
		}
		toJSON() {
			let json = {};
			for (let name of [
				"hasBOM",
				"css",
				"file",
				"id"
			]) if (this[name] != null) json[name] = this[name];
			if (this.map) {
				json.map = { ...this.map };
				if (json.map.consumerCache) json.map.consumerCache = void 0;
			}
			return json;
		}
	}
	input = Input;
	Input.default = Input;
	if (terminalHighlight && terminalHighlight.registerInput) terminalHighlight.registerInput(Input);
	return input;
}
var root;
var hasRequiredRoot;
function requireRoot() {
	if (hasRequiredRoot) return root;
	hasRequiredRoot = 1;
	let Container = requireContainer$1();
	let LazyResult, Processor;
	class Root extends Container {
		constructor(defaults) {
			super(defaults);
			this.type = "root";
			if (!this.nodes) this.nodes = [];
		}
		normalize(child, sample, type) {
			let keepBefore = /* @__PURE__ */ new Set();
			for (let node of Array.isArray(child) ? child : [child]) if (node && typeof node === "object" && !node.parent && node.raws && typeof node.raws.before !== "undefined") keepBefore.add(node.raws);
			let nodes = super.normalize(child);
			if (sample) {
				if (type === "prepend") if (this.nodes.length > 1) sample.raws.before = this.nodes[1].raws.before;
				else delete sample.raws.before;
				else if (this.first !== sample) {
					for (let node of nodes) if (!keepBefore.has(node.raws)) node.raws.before = sample.raws.before;
				}
			}
			return nodes;
		}
		removeChild(child, ignore) {
			let index = this.index(child);
			if (!ignore && index === 0 && this.nodes.length > 1) this.nodes[1].raws.before = this.nodes[index].raws.before;
			return super.removeChild(child);
		}
		toResult(opts = {}) {
			return new LazyResult(new Processor(), this, opts).stringify();
		}
	}
	Root.registerLazyResult = (dependant) => {
		LazyResult = dependant;
	};
	Root.registerProcessor = (dependant) => {
		Processor = dependant;
	};
	root = Root;
	Root.default = Root;
	Container.registerRoot(Root);
	return root;
}
var list_1;
var hasRequiredList;
function requireList() {
	if (hasRequiredList) return list_1;
	hasRequiredList = 1;
	let list = {
		comma(string) {
			return list.split(string, [","], true);
		},
		space(string) {
			return list.split(string, [
				" ",
				"\n",
				"	"
			]);
		},
		split(string, separators, last) {
			if (!string) return [];
			let array = [];
			let current = "";
			let split = false;
			let func = 0;
			let inQuote = false;
			let prevQuote = "";
			let escape = false;
			for (let letter of string) {
				if (escape) escape = false;
				else if (letter === "\\") escape = true;
				else if (inQuote) {
					if (letter === prevQuote) inQuote = false;
				} else if (letter === "\"" || letter === "'") {
					inQuote = true;
					prevQuote = letter;
				} else if (letter === "(") func += 1;
				else if (letter === ")") {
					if (func > 0) func -= 1;
				} else if (func === 0) {
					if (separators.includes(letter)) split = true;
				}
				if (split) {
					if (current !== "") array.push(current.trim());
					current = "";
					split = false;
				} else current += letter;
			}
			if (last || current !== "") array.push(current.trim());
			return array;
		}
	};
	list_1 = list;
	list.default = list;
	return list_1;
}
var rule;
var hasRequiredRule;
function requireRule() {
	if (hasRequiredRule) return rule;
	hasRequiredRule = 1;
	let Container = requireContainer$1();
	let list = requireList();
	class Rule extends Container {
		get selectors() {
			return list.comma(this.selector);
		}
		set selectors(values) {
			let match = this.selector ? this.selector.match(/,\s*/) : null;
			let sep = match ? match[0] : "," + this.raw("between", "beforeOpen");
			this.selector = values.join(sep);
		}
		constructor(defaults) {
			super(defaults);
			this.type = "rule";
			if (!this.nodes) this.nodes = [];
		}
	}
	rule = Rule;
	Rule.default = Rule;
	Container.registerRule(Rule);
	return rule;
}
var fromJSON_1;
var hasRequiredFromJSON;
function requireFromJSON() {
	if (hasRequiredFromJSON) return fromJSON_1;
	hasRequiredFromJSON = 1;
	let AtRule = requireAtRule();
	let Comment = requireComment();
	let Declaration = requireDeclaration();
	let Input = requireInput();
	let PreviousMap = requirePreviousMap();
	let Root = requireRoot();
	let Rule = requireRule();
	function hydrateInputs(json, inputs) {
		if (!json.inputs) return inputs;
		return json.inputs.map((input) => {
			let inputHydrated = {
				...input,
				__proto__: Input.prototype
			};
			if (inputHydrated.map) inputHydrated.map = {
				...inputHydrated.map,
				__proto__: PreviousMap.prototype
			};
			return inputHydrated;
		});
	}
	function constructNode(json, inputs, children) {
		let defaults = { ...json };
		delete defaults.inputs;
		delete defaults.nodes;
		if (defaults.source) {
			let { inputId, ...source } = defaults.source;
			defaults.source = source;
			if (inputId != null) defaults.source.input = inputs[inputId];
		}
		let node;
		if (defaults.type === "root") node = new Root(defaults);
		else if (defaults.type === "decl") node = new Declaration(defaults);
		else if (defaults.type === "rule") node = new Rule(defaults);
		else if (defaults.type === "comment") node = new Comment(defaults);
		else if (defaults.type === "atrule") node = new AtRule(defaults);
		else throw new Error("Unknown node type: " + json.type);
		if (children) {
			node.nodes = children;
			for (let child of children) child.parent = node;
		}
		return node;
	}
	function fromJSON(json, inputs) {
		if (Array.isArray(json)) return json.map((n) => fromJSON(n));
		let result;
		let stack = [{
			childIndex: 0,
			children: [],
			inputs: hydrateInputs(json, inputs),
			json
		}];
		while (stack.length > 0) {
			let frame = stack[stack.length - 1];
			let jsonNodes = frame.json.nodes;
			if (jsonNodes && frame.childIndex < jsonNodes.length) {
				let childJson = jsonNodes[frame.childIndex];
				frame.childIndex += 1;
				stack.push({
					childIndex: 0,
					children: [],
					inputs: hydrateInputs(childJson, frame.inputs),
					json: childJson
				});
				continue;
			}
			stack.pop();
			let node = constructNode(frame.json, frame.inputs, jsonNodes ? frame.children : void 0);
			if (stack.length > 0) stack[stack.length - 1].children.push(node);
			else result = node;
		}
		return result;
	}
	fromJSON_1 = fromJSON;
	fromJSON.default = fromJSON;
	return fromJSON_1;
}
var mapGenerator;
var hasRequiredMapGenerator;
function requireMapGenerator() {
	if (hasRequiredMapGenerator) return mapGenerator;
	hasRequiredMapGenerator = 1;
	let { dirname, relative, resolve, sep } = require$$2;
	let { SourceMapConsumer, SourceMapGenerator } = require$$2;
	let { pathToFileURL } = require$$2;
	let Input = requireInput();
	let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator);
	let pathAvailable = Boolean(dirname && resolve && relative && sep);
	class MapGenerator {
		constructor(stringify, root, opts, cssString) {
			this.stringify = stringify;
			this.mapOpts = opts.map || {};
			this.root = root;
			this.opts = opts;
			this.css = cssString;
			this.originalCSS = cssString;
			this.usesFileUrls = !this.mapOpts.from && this.mapOpts.absolute;
			this.memoizedFileURLs = /* @__PURE__ */ new Map();
			this.memoizedPaths = /* @__PURE__ */ new Map();
			this.memoizedURLs = /* @__PURE__ */ new Map();
		}
		addAnnotation() {
			let content;
			if (this.isInline()) content = "data:application/json;base64," + this.toBase64(this.map.toString());
			else if (typeof this.mapOpts.annotation === "string") content = this.mapOpts.annotation;
			else if (typeof this.mapOpts.annotation === "function") content = this.mapOpts.annotation(this.opts.to, this.root);
			else content = this.outputFile() + ".map";
			let eol = "\n";
			if (this.css.includes("\r\n")) eol = "\r\n";
			this.css += eol + "/*# sourceMappingURL=" + content + " */";
		}
		applyPrevMaps() {
			for (let prev of this.previous()) {
				let from = this.toUrl(this.path(prev.file));
				let root = prev.root || dirname(prev.file);
				let map;
				if (this.mapOpts.sourcesContent === false) {
					map = new SourceMapConsumer(prev.text);
					if (map.sourcesContent) map.sourcesContent = null;
				} else map = prev.consumer();
				this.map.applySourceMap(map, from, this.toUrl(this.path(root)));
			}
		}
		clearAnnotation() {
			if (this.mapOpts.annotation === false) return;
			if (this.root) {
				let node;
				for (let i = this.root.nodes.length - 1; i >= 0; i--) {
					node = this.root.nodes[i];
					if (node.type !== "comment") continue;
					if (node.text.startsWith("# sourceMappingURL=")) this.root.removeChild(i);
				}
			} else if (this.css) {
				let startIndex;
				while ((startIndex = this.css.lastIndexOf("/*#")) !== -1) {
					let endIndex = this.css.indexOf("*/", startIndex + 3);
					if (endIndex === -1) break;
					while (startIndex > 0 && this.css[startIndex - 1] === "\n") startIndex--;
					this.css = this.css.slice(0, startIndex) + this.css.slice(endIndex + 2);
				}
			}
		}
		generate() {
			this.clearAnnotation();
			if (pathAvailable && sourceMapAvailable && this.isMap()) return this.generateMap();
			else {
				let result = "";
				this.stringify(this.root, (i) => {
					result += i;
				});
				return [result];
			}
		}
		generateMap() {
			if (this.root) this.generateString();
			else if (this.previous().length === 1) {
				let prev = this.previous()[0].consumer();
				prev.file = this.outputFile();
				this.map = SourceMapGenerator.fromSourceMap(prev, { ignoreInvalidMapping: true });
			} else {
				this.map = new SourceMapGenerator({
					file: this.outputFile(),
					ignoreInvalidMapping: true
				});
				this.map.addMapping({
					generated: {
						column: 0,
						line: 1
					},
					original: {
						column: 0,
						line: 1
					},
					source: this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>"
				});
			}
			if (this.isSourcesContent()) this.setSourcesContent();
			if (this.root && this.previous().length > 0) this.applyPrevMaps();
			if (this.isAnnotation()) this.addAnnotation();
			if (this.isInline()) return [this.css];
			else return [this.css, this.map];
		}
		generateString() {
			this.css = "";
			this.map = new SourceMapGenerator({
				file: this.outputFile(),
				ignoreInvalidMapping: true
			});
			let line = 1;
			let column = 1;
			let noSource = "<no source>";
			let mapping = {
				generated: {
					column: 0,
					line: 0
				},
				original: {
					column: 0,
					line: 0
				},
				source: ""
			};
			let last, lines;
			this.stringify(this.root, (str, node, type) => {
				this.css += str;
				if (node && type !== "end") {
					mapping.generated.line = line;
					mapping.generated.column = column - 1;
					if (node.source && node.source.start) {
						mapping.source = this.sourcePath(node);
						mapping.original.line = node.source.start.line;
						mapping.original.column = node.source.start.column - 1;
						this.map.addMapping(mapping);
					} else {
						mapping.source = noSource;
						mapping.original.line = 1;
						mapping.original.column = 0;
						this.map.addMapping(mapping);
					}
				}
				lines = str.match(/\n/g);
				if (lines) {
					line += lines.length;
					last = str.lastIndexOf("\n");
					column = str.length - last;
				} else column += str.length;
				if (node && type !== "start") {
					let p = node.parent || { raws: {} };
					if (!(node.type === "decl" || node.type === "atrule" && !node.nodes) || node !== p.last || p.raws.semicolon) if (node.source && node.source.end) {
						mapping.source = this.sourcePath(node);
						mapping.original.line = node.source.end.line;
						mapping.original.column = node.source.end.column - 1;
						mapping.generated.line = line;
						mapping.generated.column = column - 2;
						this.map.addMapping(mapping);
					} else {
						mapping.source = noSource;
						mapping.original.line = 1;
						mapping.original.column = 0;
						mapping.generated.line = line;
						mapping.generated.column = column - 1;
						this.map.addMapping(mapping);
					}
				}
			});
		}
		isAnnotation() {
			if (this.isInline()) return true;
			if (typeof this.mapOpts.annotation !== "undefined") return this.mapOpts.annotation;
			if (this.previous().length) return this.previous().some((i) => i.annotation);
			return true;
		}
		isInline() {
			if (typeof this.mapOpts.inline !== "undefined") return this.mapOpts.inline;
			let annotation = this.mapOpts.annotation;
			if (typeof annotation !== "undefined" && annotation !== true) return false;
			if (this.previous().length) return this.previous().some((i) => i.inline);
			return true;
		}
		isMap() {
			if (typeof this.opts.map !== "undefined") return !!this.opts.map;
			return this.previous().length > 0;
		}
		isSourcesContent() {
			if (typeof this.mapOpts.sourcesContent !== "undefined") return this.mapOpts.sourcesContent;
			if (this.previous().length) return this.previous().some((i) => i.withContent());
			return true;
		}
		outputFile() {
			if (this.opts.to) return this.path(this.opts.to);
			else if (this.opts.from) return this.path(this.opts.from);
			else return "to.css";
		}
		path(file) {
			if (this.mapOpts.absolute) return file;
			if (file.charCodeAt(0) === 60) return file;
			if (/^\w+:\/\//.test(file)) return file;
			let cached = this.memoizedPaths.get(file);
			if (cached) return cached;
			let from = this.opts.to ? dirname(this.opts.to) : ".";
			if (typeof this.mapOpts.annotation === "string") from = dirname(resolve(from, this.mapOpts.annotation));
			let path = relative(from, file);
			this.memoizedPaths.set(file, path);
			return path;
		}
		previous() {
			if (!this.previousMaps) {
				this.previousMaps = [];
				if (this.root) this.root.walk((node) => {
					if (node.source && node.source.input.map) {
						let map = node.source.input.map;
						if (!this.previousMaps.includes(map)) this.previousMaps.push(map);
					}
				});
				else {
					let input = new Input(this.originalCSS, this.opts);
					if (input.map) this.previousMaps.push(input.map);
				}
			}
			return this.previousMaps;
		}
		setSourcesContent() {
			let already = {};
			if (this.root) this.root.walk((node) => {
				if (node.source) {
					let from = node.source.input.from;
					if (from && !already[from]) {
						already[from] = true;
						let fromUrl = this.usesFileUrls ? this.toFileUrl(from) : this.toUrl(this.path(from));
						this.map.setSourceContent(fromUrl, node.source.input.css);
					}
				}
			});
			else if (this.css) {
				let from = this.opts.from ? this.toUrl(this.path(this.opts.from)) : "<no source>";
				this.map.setSourceContent(from, this.css);
			}
		}
		sourcePath(node) {
			if (this.mapOpts.from) return this.toUrl(this.mapOpts.from);
			else if (this.usesFileUrls) return this.toFileUrl(node.source.input.from);
			else return this.toUrl(this.path(node.source.input.from));
		}
		toBase64(str) {
			if (Buffer) return Buffer.from(str).toString("base64");
			else return window.btoa(unescape(encodeURIComponent(str)));
		}
		toFileUrl(path) {
			let cached = this.memoizedFileURLs.get(path);
			if (cached) return cached;
			if (pathToFileURL) {
				let fileURL = pathToFileURL(path).toString();
				this.memoizedFileURLs.set(path, fileURL);
				return fileURL;
			} else throw new Error("`map.absolute` option is not available in this PostCSS build");
		}
		toUrl(path) {
			let cached = this.memoizedURLs.get(path);
			if (cached) return cached;
			if (sep === "\\") path = path.replace(/\\/g, "/");
			let url = encodeURI(path).replace(/[#?]/g, encodeURIComponent);
			this.memoizedURLs.set(path, url);
			return url;
		}
	}
	mapGenerator = MapGenerator;
	return mapGenerator;
}
var tokenize;
var hasRequiredTokenize;
function requireTokenize() {
	if (hasRequiredTokenize) return tokenize;
	hasRequiredTokenize = 1;
	const SINGLE_QUOTE = "'".charCodeAt(0);
	const DOUBLE_QUOTE = "\"".charCodeAt(0);
	const BACKSLASH = "\\".charCodeAt(0);
	const SLASH = "/".charCodeAt(0);
	const NEWLINE = "\n".charCodeAt(0);
	const SPACE = " ".charCodeAt(0);
	const FEED = "\f".charCodeAt(0);
	const TAB = "	".charCodeAt(0);
	const CR = "\r".charCodeAt(0);
	const OPEN_SQUARE = "[".charCodeAt(0);
	const CLOSE_SQUARE = "]".charCodeAt(0);
	const OPEN_PARENTHESES = "(".charCodeAt(0);
	const CLOSE_PARENTHESES = ")".charCodeAt(0);
	const OPEN_CURLY = "{".charCodeAt(0);
	const CLOSE_CURLY = "}".charCodeAt(0);
	const SEMICOLON = ";".charCodeAt(0);
	const ASTERISK = "*".charCodeAt(0);
	const COLON = ":".charCodeAt(0);
	const AT = "@".charCodeAt(0);
	const RE_AT_END = /[\t\n\f\r "#'()/;[\\\]{}]/g;
	const RE_WORD_END = /[\t\n\f\r !"#'():;@[\\\]{}]|\/(?=\*)/g;
	const RE_BAD_BRACKET = /.[\r\n"'(/\\]/;
	const RE_HEX_ESCAPE = /[\da-f]/i;
	tokenize = function tokenizer(input, options = {}) {
		let css = input.css.valueOf();
		let ignore = options.ignoreErrors;
		let code, content, escape, next, quote;
		let currentToken, escaped, escapePos, n, prev;
		let length = css.length;
		let pos = 0;
		let buffer = [];
		let returned = [];
		let lastBadParen = -1;
		function position() {
			return pos;
		}
		function unclosed(what) {
			throw input.error("Unclosed " + what, pos);
		}
		function endOfFile() {
			return returned.length === 0 && pos >= length;
		}
		function nextToken(opts) {
			if (returned.length) return returned.pop();
			if (pos >= length) return;
			let ignoreUnclosed = opts ? opts.ignoreUnclosed : false;
			code = css.charCodeAt(pos);
			switch (code) {
				case NEWLINE:
				case SPACE:
				case TAB:
				case CR:
				case FEED:
					next = pos;
					do {
						next += 1;
						code = css.charCodeAt(next);
					} while (code === SPACE || code === NEWLINE || code === TAB || code === CR || code === FEED);
					currentToken = ["space", css.slice(pos, next)];
					pos = next - 1;
					break;
				case OPEN_SQUARE:
				case CLOSE_SQUARE:
				case OPEN_CURLY:
				case CLOSE_CURLY:
				case COLON:
				case SEMICOLON:
				case CLOSE_PARENTHESES: {
					let controlChar = String.fromCharCode(code);
					currentToken = [
						controlChar,
						controlChar,
						pos
					];
					break;
				}
				case OPEN_PARENTHESES:
					prev = buffer.length ? buffer.pop()[1] : "";
					n = css.charCodeAt(pos + 1);
					if (prev === "url" && n !== SINGLE_QUOTE && n !== DOUBLE_QUOTE && n !== SPACE && n !== NEWLINE && n !== TAB && n !== FEED && n !== CR) {
						next = pos;
						do {
							escaped = false;
							next = css.indexOf(")", next + 1);
							if (next === -1) if (ignore || ignoreUnclosed) {
								next = pos;
								break;
							} else unclosed("bracket");
							escapePos = next;
							while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
								escapePos -= 1;
								escaped = !escaped;
							}
						} while (escaped);
						currentToken = [
							"brackets",
							css.slice(pos, next + 1),
							pos,
							next
						];
						pos = next;
					} else if (pos <= lastBadParen) currentToken = [
						"(",
						"(",
						pos
					];
					else {
						next = css.indexOf(")", pos + 1);
						content = css.slice(pos, next + 1);
						if (next === -1 || RE_BAD_BRACKET.test(content)) {
							lastBadParen = next === -1 ? length : next;
							currentToken = [
								"(",
								"(",
								pos
							];
						} else {
							currentToken = [
								"brackets",
								content,
								pos,
								next
							];
							pos = next;
						}
					}
					break;
				case SINGLE_QUOTE:
				case DOUBLE_QUOTE:
					quote = code === SINGLE_QUOTE ? "'" : "\"";
					next = pos;
					do {
						escaped = false;
						next = css.indexOf(quote, next + 1);
						if (next === -1) if (ignore || ignoreUnclosed) {
							next = pos + 1;
							break;
						} else unclosed("string");
						escapePos = next;
						while (css.charCodeAt(escapePos - 1) === BACKSLASH) {
							escapePos -= 1;
							escaped = !escaped;
						}
					} while (escaped);
					currentToken = [
						"string",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
					break;
				case AT:
					RE_AT_END.lastIndex = pos + 1;
					RE_AT_END.test(css);
					if (RE_AT_END.lastIndex === 0) next = css.length - 1;
					else next = RE_AT_END.lastIndex - 2;
					currentToken = [
						"at-word",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
					break;
				case BACKSLASH:
					next = pos;
					escape = true;
					while (css.charCodeAt(next + 1) === BACKSLASH) {
						next += 1;
						escape = !escape;
					}
					code = css.charCodeAt(next + 1);
					if (escape && code !== SLASH && code !== SPACE && code !== NEWLINE && code !== TAB && code !== CR && code !== FEED) {
						next += 1;
						if (RE_HEX_ESCAPE.test(css.charAt(next))) {
							while (RE_HEX_ESCAPE.test(css.charAt(next + 1))) next += 1;
							if (css.charCodeAt(next + 1) === SPACE) next += 1;
						}
					}
					currentToken = [
						"word",
						css.slice(pos, next + 1),
						pos,
						next
					];
					pos = next;
					break;
				default:
					if (code === SLASH && css.charCodeAt(pos + 1) === ASTERISK) {
						next = css.indexOf("*/", pos + 2) + 1;
						if (next === 0) if (ignore || ignoreUnclosed) next = css.length;
						else unclosed("comment");
						currentToken = [
							"comment",
							css.slice(pos, next + 1),
							pos,
							next
						];
						pos = next;
					} else {
						RE_WORD_END.lastIndex = pos + 1;
						RE_WORD_END.test(css);
						if (RE_WORD_END.lastIndex === 0) next = css.length - 1;
						else next = RE_WORD_END.lastIndex - 2;
						currentToken = [
							"word",
							css.slice(pos, next + 1),
							pos,
							next
						];
						buffer.push(currentToken);
						pos = next;
					}
					break;
			}
			pos++;
			return currentToken;
		}
		function back(token) {
			returned.push(token);
		}
		return {
			back,
			endOfFile,
			nextToken,
			position
		};
	};
	return tokenize;
}
var parser;
var hasRequiredParser;
function requireParser() {
	if (hasRequiredParser) return parser;
	hasRequiredParser = 1;
	let AtRule = requireAtRule();
	let Comment = requireComment();
	let Declaration = requireDeclaration();
	let Root = requireRoot();
	let Rule = requireRule();
	let tokenizer = requireTokenize();
	const SAFE_COMMENT_NEIGHBOR = {
		empty: true,
		space: true
	};
	function findLastWithPosition(tokens) {
		for (let i = tokens.length - 1; i >= 0; i--) {
			let token = tokens[i];
			let pos = token[3] || token[2];
			if (pos) return pos;
		}
	}
	function tokensToString(tokens, from, to) {
		let result = "";
		for (let i = from; i < to; i++) result += tokens[i][1];
		return result;
	}
	class Parser {
		constructor(input) {
			this.input = input;
			this.root = new Root();
			this.current = this.root;
			this.spaces = "";
			this.semicolon = false;
			this.createTokenizer();
			this.root.source = {
				input,
				start: {
					column: 1,
					line: 1,
					offset: 0
				}
			};
		}
		atrule(token) {
			let node = new AtRule();
			node.name = token[1].slice(1);
			if (node.name === "") this.unnamedAtrule(node, token);
			this.init(node, token[2]);
			let type;
			let prev;
			let shift;
			let last = false;
			let open = false;
			let params = [];
			let brackets = [];
			while (!this.tokenizer.endOfFile()) {
				token = this.tokenizer.nextToken();
				type = token[0];
				if (type === "(" || type === "[") brackets.push(type === "(" ? ")" : "]");
				else if (type === "{" && brackets.length > 0) brackets.push("}");
				else if (type === brackets[brackets.length - 1]) brackets.pop();
				if (brackets.length === 0) if (type === ";") {
					node.source.end = this.getPosition(token[2]);
					node.source.end.offset++;
					this.semicolon = true;
					break;
				} else if (type === "{") {
					open = true;
					break;
				} else if (type === "}") {
					if (params.length > 0) {
						shift = params.length - 1;
						prev = params[shift];
						while (prev && prev[0] === "space") prev = params[--shift];
						if (prev) {
							node.source.end = this.getPosition(prev[3] || prev[2]);
							node.source.end.offset++;
						}
					}
					this.end(token);
					break;
				} else params.push(token);
				else params.push(token);
				if (this.tokenizer.endOfFile()) {
					last = true;
					break;
				}
			}
			node.raws.between = this.spacesAndCommentsFromEnd(params);
			if (params.length) {
				node.raws.afterName = this.spacesAndCommentsFromStart(params);
				this.raw(node, "params", params);
				if (last) {
					token = params[params.length - 1];
					node.source.end = this.getPosition(token[3] || token[2]);
					node.source.end.offset++;
					this.spaces = node.raws.between;
					node.raws.between = "";
				}
			} else {
				node.raws.afterName = "";
				node.params = "";
			}
			if (open) {
				node.nodes = [];
				this.current = node;
			}
		}
		checkMissedSemicolon(tokens) {
			let colon = this.colon(tokens);
			if (colon === false) return;
			let founded = 0;
			let token;
			for (let j = colon - 1; j >= 0; j--) {
				token = tokens[j];
				if (token[0] !== "space") {
					founded += 1;
					if (founded === 2) break;
				}
			}
			throw this.input.error("Missed semicolon", token[0] === "word" ? token[3] + 1 : token[2]);
		}
		colon(tokens) {
			let brackets = 0;
			let prev, token, type;
			for (let [i, element] of tokens.entries()) {
				token = element;
				type = token[0];
				if (type === "(") brackets += 1;
				if (type === ")") brackets -= 1;
				if (brackets === 0 && type === ":") if (!prev) this.doubleColon(token);
				else if (prev[0] === "word" && prev[1] === "progid") continue;
				else return i;
				prev = token;
			}
			return false;
		}
		comment(token) {
			let node = new Comment();
			this.init(node, token[2]);
			node.source.end = this.getPosition(token[3] || token[2]);
			node.source.end.offset++;
			let text = token[1].slice(2, -2);
			if (!text.trim()) {
				node.text = "";
				node.raws.left = text;
				node.raws.right = "";
			} else {
				let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
				node.text = match[2];
				node.raws.left = match[1];
				node.raws.right = match[3];
			}
		}
		createTokenizer() {
			this.tokenizer = tokenizer(this.input);
		}
		decl(tokens, customProperty) {
			let node = new Declaration();
			this.init(node, tokens[0][2]);
			let last = tokens[tokens.length - 1];
			if (last[0] === ";") {
				this.semicolon = true;
				tokens.pop();
			}
			node.source.end = this.getPosition(last[3] || last[2] || findLastWithPosition(tokens));
			node.source.end.offset++;
			let start = 0;
			while (tokens[start][0] !== "word") {
				if (start === tokens.length - 1) this.unknownWord([tokens[start]]);
				start++;
			}
			node.raws.before += tokensToString(tokens, 0, start);
			node.source.start = this.getPosition(tokens[start][2]);
			let propStart = start;
			while (start < tokens.length) {
				let type = tokens[start][0];
				if (type === ":" || type === "space" || type === "comment") break;
				start++;
			}
			node.prop = tokensToString(tokens, propStart, start);
			let betweenStart = start;
			let token;
			while (start < tokens.length) {
				token = tokens[start];
				start++;
				if (token[0] === ":") break;
				if (token[0] === "word" && /\w/.test(token[1])) this.unknownWord([token]);
			}
			node.raws.between = tokensToString(tokens, betweenStart, start);
			if (node.prop[0] === "_" || node.prop[0] === "*") {
				node.raws.before += node.prop[0];
				node.prop = node.prop.slice(1);
			}
			let firstSpacesStart = start;
			while (start < tokens.length) {
				let next = tokens[start][0];
				if (next !== "space" && next !== "comment") break;
				start++;
			}
			let firstSpaces = tokens.slice(firstSpacesStart, start);
			tokens = tokens.slice(start);
			this.precheckMissedSemicolon(tokens);
			for (let i = tokens.length - 1; i >= 0; i--) {
				token = tokens[i];
				if (token[1].toLowerCase() === "!important") {
					node.important = true;
					let string = this.stringFrom(tokens, i);
					string = this.spacesFromEnd(tokens) + string;
					if (string !== " !important") node.raws.important = string;
					break;
				} else if (token[1].toLowerCase() === "important") {
					let cache = tokens.slice(0);
					let str = "";
					for (let j = i; j > 0; j--) {
						let type = cache[j][0];
						if (str.trim().startsWith("!") && type !== "space") break;
						str = cache.pop()[1] + str;
					}
					if (str.trim().startsWith("!")) {
						node.important = true;
						node.raws.important = str;
						tokens = cache;
					}
				}
				if (token[0] !== "space" && token[0] !== "comment") break;
			}
			if (tokens.some((i) => i[0] !== "space" && i[0] !== "comment")) {
				node.raws.between += firstSpaces.map((i) => i[1]).join("");
				firstSpaces = [];
			}
			this.raw(node, "value", firstSpaces.concat(tokens), customProperty);
			if (node.value.includes(":") && !customProperty) this.checkMissedSemicolon(tokens);
		}
		doubleColon(token) {
			throw this.input.error("Double colon", { offset: token[2] }, { offset: token[2] + token[1].length });
		}
		emptyRule(token) {
			let node = new Rule();
			this.init(node, token[2]);
			node.selector = "";
			node.raws.between = "";
			this.current = node;
		}
		end(token) {
			if (this.current.nodes && this.current.nodes.length) this.current.raws.semicolon = this.semicolon;
			this.semicolon = false;
			this.current.raws.after = (this.current.raws.after || "") + this.spaces;
			this.spaces = "";
			if (this.current.parent) {
				this.current.source.end = this.getPosition(token[2]);
				this.current.source.end.offset++;
				this.current = this.current.parent;
			} else this.unexpectedClose(token);
		}
		endFile() {
			if (this.current.parent) this.unclosedBlock();
			if (this.current.nodes && this.current.nodes.length) this.current.raws.semicolon = this.semicolon;
			this.current.raws.after = (this.current.raws.after || "") + this.spaces;
			this.root.source.end = this.getPosition(this.tokenizer.position());
		}
		freeSemicolon(token) {
			this.spaces += token[1];
			if (this.current.nodes) {
				let prev = this.current.nodes[this.current.nodes.length - 1];
				if (prev && prev.type === "rule" && !prev.raws.ownSemicolon) {
					prev.raws.ownSemicolon = this.spaces;
					this.spaces = "";
					prev.source.end = this.getPosition(token[2]);
					prev.source.end.offset += prev.raws.ownSemicolon.length;
				}
			}
		}
		getPosition(offset) {
			let pos = this.input.fromOffset(offset);
			return {
				column: pos.col,
				line: pos.line,
				offset
			};
		}
		init(node, offset) {
			this.current.push(node);
			node.source = {
				input: this.input,
				start: this.getPosition(offset)
			};
			node.raws.before = this.spaces;
			this.spaces = "";
			if (node.type !== "comment") this.semicolon = false;
		}
		other(start) {
			let end = false;
			let type = null;
			let colon = false;
			let bracket = null;
			let brackets = [];
			let customProperty = start[1].startsWith("--");
			let tokens = [];
			let token = start;
			while (token) {
				type = token[0];
				tokens.push(token);
				if (type === "(" || type === "[") {
					if (!bracket) bracket = token;
					brackets.push(type === "(" ? ")" : "]");
				} else if (customProperty && colon && type === "{") {
					if (!bracket) bracket = token;
					brackets.push("}");
				} else if (brackets.length === 0) {
					if (type === ";") if (colon) {
						this.decl(tokens, customProperty);
						return;
					} else break;
					else if (type === "{") {
						this.rule(tokens);
						return;
					} else if (type === "}") {
						this.tokenizer.back(tokens.pop());
						end = true;
						break;
					} else if (type === ":") colon = true;
				} else if (type === brackets[brackets.length - 1]) {
					brackets.pop();
					if (brackets.length === 0) bracket = null;
				}
				token = this.tokenizer.nextToken();
			}
			if (this.tokenizer.endOfFile()) end = true;
			if (brackets.length > 0) this.unclosedBracket(bracket);
			if (end && colon) {
				if (!customProperty) while (tokens.length) {
					token = tokens[tokens.length - 1][0];
					if (token !== "space" && token !== "comment") break;
					this.tokenizer.back(tokens.pop());
				}
				this.decl(tokens, customProperty);
			} else this.unknownWord(tokens);
		}
		parse() {
			let token;
			while (!this.tokenizer.endOfFile()) {
				token = this.tokenizer.nextToken();
				switch (token[0]) {
					case "space":
						this.spaces += token[1];
						break;
					case ";":
						this.freeSemicolon(token);
						break;
					case "}":
						this.end(token);
						break;
					case "comment":
						this.comment(token);
						break;
					case "at-word":
						this.atrule(token);
						break;
					case "{":
						this.emptyRule(token);
						break;
					default:
						this.other(token);
						break;
				}
			}
			this.endFile();
		}
		precheckMissedSemicolon() {}
		raw(node, prop, tokens, customProperty) {
			let token, type;
			let length = tokens.length;
			let value = "";
			let clean = true;
			let next, prev;
			for (let i = 0; i < length; i += 1) {
				token = tokens[i];
				type = token[0];
				if (type === "space" && i === length - 1 && !customProperty) clean = false;
				else if (type === "comment") {
					prev = tokens[i - 1] ? tokens[i - 1][0] : "empty";
					next = tokens[i + 1] ? tokens[i + 1][0] : "empty";
					if (!SAFE_COMMENT_NEIGHBOR[prev] && !SAFE_COMMENT_NEIGHBOR[next]) if (value.slice(-1) === ",") clean = false;
					else value += token[1];
					else clean = false;
				} else value += token[1];
			}
			if (!clean) {
				let raw = tokens.reduce((all, i) => all + i[1], "");
				node.raws[prop] = {
					raw,
					value
				};
			}
			node[prop] = value;
		}
		rule(tokens) {
			tokens.pop();
			let node = new Rule();
			this.init(node, tokens[0][2]);
			node.raws.between = this.spacesAndCommentsFromEnd(tokens);
			this.raw(node, "selector", tokens);
			this.current = node;
		}
		spacesAndCommentsFromEnd(tokens) {
			let lastTokenType;
			let spaces = "";
			while (tokens.length) {
				lastTokenType = tokens[tokens.length - 1][0];
				if (lastTokenType !== "space" && lastTokenType !== "comment") break;
				spaces = tokens.pop()[1] + spaces;
			}
			return spaces;
		}
		spacesAndCommentsFromStart(tokens) {
			let next;
			let spaces = "";
			while (tokens.length) {
				next = tokens[0][0];
				if (next !== "space" && next !== "comment") break;
				spaces += tokens.shift()[1];
			}
			return spaces;
		}
		spacesFromEnd(tokens) {
			let lastTokenType;
			let spaces = "";
			while (tokens.length) {
				lastTokenType = tokens[tokens.length - 1][0];
				if (lastTokenType !== "space") break;
				spaces = tokens.pop()[1] + spaces;
			}
			return spaces;
		}
		stringFrom(tokens, from) {
			let result = "";
			for (let i = from; i < tokens.length; i++) result += tokens[i][1];
			tokens.splice(from, tokens.length - from);
			return result;
		}
		unclosedBlock() {
			let pos = this.current.source.start;
			throw this.input.error("Unclosed block", pos.line, pos.column);
		}
		unclosedBracket(bracket) {
			throw this.input.error("Unclosed bracket", { offset: bracket[2] }, { offset: bracket[2] + 1 });
		}
		unexpectedClose(token) {
			throw this.input.error("Unexpected }", { offset: token[2] }, { offset: token[2] + 1 });
		}
		unknownWord(tokens) {
			throw this.input.error("Unknown word " + tokens[0][1], { offset: tokens[0][2] }, { offset: tokens[0][2] + tokens[0][1].length });
		}
		unnamedAtrule(node, token) {
			throw this.input.error("At-rule without name", { offset: token[2] }, { offset: token[2] + token[1].length });
		}
	}
	parser = Parser;
	return parser;
}
var parse_1;
var hasRequiredParse;
function requireParse() {
	if (hasRequiredParse) return parse_1;
	hasRequiredParse = 1;
	let Container = requireContainer$1();
	let Input = requireInput();
	let Parser = requireParser();
	function parse(css, opts) {
		let input = new Input(css, opts);
		let parser = new Parser(input);
		try {
			parser.parse();
		} catch (e) {
			if (process.env.NODE_ENV !== "production") {
				if (e.name === "CssSyntaxError" && opts && opts.from) {
					if (/\.scss$/i.test(opts.from)) e.message += "\nYou tried to parse SCSS with the standard CSS parser; try again with the postcss-scss parser";
					else if (/\.sass/i.test(opts.from)) e.message += "\nYou tried to parse Sass with the standard CSS parser; try again with the postcss-sass parser";
					else if (/\.less$/i.test(opts.from)) e.message += "\nYou tried to parse Less with the standard CSS parser; try again with the postcss-less parser";
				}
			}
			throw e;
		}
		return parser.root;
	}
	parse_1 = parse;
	parse.default = parse;
	Container.registerParse(parse);
	return parse_1;
}
var warning;
var hasRequiredWarning;
function requireWarning() {
	if (hasRequiredWarning) return warning;
	hasRequiredWarning = 1;
	let Container = requireContainer$1();
	let { my } = requireSymbols();
	class Warning {
		constructor(text, opts = {}) {
			this.type = "warning";
			this.text = text;
			if (opts.node && opts.node.source) {
				if (!opts.node[my]) Container.rebuild(opts.node);
				let range = opts.node.rangeBy(opts);
				this.line = range.start.line;
				this.column = range.start.column;
				this.endLine = range.end.line;
				this.endColumn = range.end.column;
			}
			for (let opt in opts) this[opt] = opts[opt];
		}
		toString() {
			if (this.node) return this.node.error(this.text, {
				index: this.index,
				plugin: this.plugin,
				word: this.word
			}).message;
			if (this.plugin) return this.plugin + ": " + this.text;
			return this.text;
		}
	}
	warning = Warning;
	Warning.default = Warning;
	return warning;
}
var result;
var hasRequiredResult;
function requireResult() {
	if (hasRequiredResult) return result;
	hasRequiredResult = 1;
	let Warning = requireWarning();
	class Result {
		get content() {
			return this.css;
		}
		constructor(processor, root, opts) {
			this.processor = processor;
			this.messages = [];
			this.root = root;
			this.opts = opts;
			this.css = "";
			this.map = void 0;
		}
		toString() {
			return this.css;
		}
		warn(text, opts = {}) {
			if (!opts.plugin) {
				if (this.lastPlugin && this.lastPlugin.postcssPlugin) opts.plugin = this.lastPlugin.postcssPlugin;
			}
			let warning = new Warning(text, opts);
			this.messages.push(warning);
			return warning;
		}
		warnings() {
			return this.messages.filter((i) => i.type === "warning");
		}
	}
	result = Result;
	Result.default = Result;
	return result;
}
var warnOnce;
var hasRequiredWarnOnce;
function requireWarnOnce() {
	if (hasRequiredWarnOnce) return warnOnce;
	hasRequiredWarnOnce = 1;
	let printed = {};
	warnOnce = function warnOnce(message) {
		if (printed[message]) return;
		printed[message] = true;
		if (typeof console !== "undefined" && console.warn) console.warn(message);
	};
	return warnOnce;
}
var lazyResult;
var hasRequiredLazyResult;
function requireLazyResult() {
	if (hasRequiredLazyResult) return lazyResult;
	hasRequiredLazyResult = 1;
	let Container = requireContainer$1();
	let Document = requireDocument();
	let MapGenerator = requireMapGenerator();
	let parse = requireParse();
	let Result = requireResult();
	let Root = requireRoot();
	let stringify = requireStringify();
	let { isClean, my } = requireSymbols();
	let warnOnce = requireWarnOnce();
	const TYPE_TO_CLASS_NAME = {
		atrule: "AtRule",
		comment: "Comment",
		decl: "Declaration",
		document: "Document",
		root: "Root",
		rule: "Rule"
	};
	const PLUGIN_PROPS = {
		AtRule: true,
		AtRuleExit: true,
		Comment: true,
		CommentExit: true,
		Declaration: true,
		DeclarationExit: true,
		Document: true,
		DocumentExit: true,
		Once: true,
		OnceExit: true,
		postcssPlugin: true,
		prepare: true,
		Root: true,
		RootExit: true,
		Rule: true,
		RuleExit: true
	};
	const NOT_VISITORS = {
		Once: true,
		postcssPlugin: true,
		prepare: true
	};
	const CHILDREN = 0;
	function isPromise(obj) {
		return typeof obj === "object" && typeof obj.then === "function";
	}
	function getEvents(node) {
		let key = false;
		let type = TYPE_TO_CLASS_NAME[node.type];
		if (node.type === "decl") key = node.prop.toLowerCase();
		else if (node.type === "atrule") key = node.name.toLowerCase();
		if (key && node.append) return [
			type,
			type + "-" + key,
			CHILDREN,
			type + "Exit",
			type + "Exit-" + key
		];
		else if (key) return [
			type,
			type + "-" + key,
			type + "Exit",
			type + "Exit-" + key
		];
		else if (node.append) return [
			type,
			CHILDREN,
			type + "Exit"
		];
		else return [type, type + "Exit"];
	}
	function toStack(node) {
		let events;
		if (node.type === "document") events = [
			"Document",
			CHILDREN,
			"DocumentExit"
		];
		else if (node.type === "root") events = [
			"Root",
			CHILDREN,
			"RootExit"
		];
		else events = getEvents(node);
		return {
			eventIndex: 0,
			events,
			iterator: 0,
			node,
			visitorIndex: 0,
			visitors: []
		};
	}
	function cleanMarks(node) {
		let stack = [node];
		while (stack.length > 0) {
			let next = stack.pop();
			next[isClean] = false;
			if (next.nodes) for (let i of next.nodes) stack.push(i);
		}
		return node;
	}
	let postcss = {};
	class LazyResult {
		get content() {
			return this.stringify().content;
		}
		get css() {
			return this.stringify().css;
		}
		get map() {
			return this.stringify().map;
		}
		get messages() {
			return this.sync().messages;
		}
		get opts() {
			return this.result.opts;
		}
		get processor() {
			return this.result.processor;
		}
		get root() {
			return this.sync().root;
		}
		get [Symbol.toStringTag]() {
			return "LazyResult";
		}
		constructor(processor, css, opts) {
			this.stringified = false;
			this.processed = false;
			let root;
			if (typeof css === "object" && css !== null && (css.type === "root" || css.type === "document")) root = cleanMarks(css);
			else if (css instanceof LazyResult || css instanceof Result) {
				root = cleanMarks(css.root);
				if (css.map) {
					if (typeof opts.map === "undefined") opts.map = {};
					if (!opts.map.inline) opts.map.inline = false;
					opts.map.prev = css.map;
				}
			} else {
				let parser = parse;
				if (opts.syntax) parser = opts.syntax.parse;
				if (opts.parser) parser = opts.parser;
				if (parser.parse) parser = parser.parse;
				try {
					root = parser(css, opts);
				} catch (error) {
					this.processed = true;
					this.error = error;
				}
				if (root && !root[my])
 /* c8 ignore next 2 */
				Container.rebuild(root);
			}
			this.result = new Result(processor, root, opts);
			this.helpers = {
				...postcss,
				postcss,
				result: this.result
			};
			this.plugins = this.processor.plugins.map((plugin) => {
				if (typeof plugin === "object" && plugin.prepare) return {
					...plugin,
					...plugin.prepare(this.result)
				};
				else return plugin;
			});
		}
		async() {
			if (this.error) return Promise.reject(this.error);
			if (this.processed) return Promise.resolve(this.result);
			if (!this.processing) this.processing = this.runAsync();
			return this.processing;
		}
		catch(onRejected) {
			return this.async().catch(onRejected);
		}
		finally(onFinally) {
			return this.async().then(onFinally, onFinally);
		}
		getAsyncError() {
			throw new Error("Use process(css).then(cb) to work with async plugins");
		}
		handleError(error, node) {
			let plugin = this.result.lastPlugin;
			try {
				if (node) node.addToError(error);
				this.error = error;
				if (error.name === "CssSyntaxError" && !error.plugin) {
					error.plugin = plugin.postcssPlugin;
					error.setMessage();
				} else if (plugin.postcssVersion) {
					if (process.env.NODE_ENV !== "production") {
						let pluginName = plugin.postcssPlugin;
						let pluginVer = plugin.postcssVersion;
						let runtimeVer = this.result.processor.version;
						let a = pluginVer.split(".");
						let b = runtimeVer.split(".");
						if (a[0] !== b[0] || parseInt(a[1]) > parseInt(b[1])) console.error("Unknown error from PostCSS plugin. Your current PostCSS version is " + runtimeVer + ", but " + pluginName + " uses " + pluginVer + ". Perhaps this is the source of the error below.");
					}
				}
			} catch (err) {
				/* c8 ignore next 3 */
				if (console && console.error) console.error(err);
			}
			return error;
		}
		prepareVisitors() {
			this.listeners = {};
			let add = (plugin, type, cb) => {
				if (!this.listeners[type]) this.listeners[type] = [];
				this.listeners[type].push([plugin, cb]);
			};
			for (let plugin of this.plugins) if (typeof plugin === "object") for (let event in plugin) {
				if (!PLUGIN_PROPS[event] && /^[A-Z]/.test(event)) throw new Error(`Unknown event ${event} in ${plugin.postcssPlugin}. Try to update PostCSS (${this.processor.version} now).`);
				if (!NOT_VISITORS[event]) {
					if (typeof plugin[event] === "object") for (let filter in plugin[event]) if (filter === "*") add(plugin, event, plugin[event][filter]);
					else add(plugin, event + "-" + filter.toLowerCase(), plugin[event][filter]);
					else if (typeof plugin[event] === "function") add(plugin, event, plugin[event]);
				}
			}
			this.hasListener = Object.keys(this.listeners).length > 0;
		}
		async runAsync() {
			this.plugin = 0;
			for (let i = 0; i < this.plugins.length; i++) {
				let plugin = this.plugins[i];
				let promise = this.runOnRoot(plugin);
				if (isPromise(promise)) try {
					await promise;
				} catch (error) {
					throw this.handleError(error);
				}
			}
			this.prepareVisitors();
			if (this.hasListener) {
				let root = this.result.root;
				while (!root[isClean]) {
					root[isClean] = true;
					let stack = [toStack(root)];
					while (stack.length > 0) {
						let promise = this.visitTick(stack);
						if (isPromise(promise)) try {
							await promise;
						} catch (e) {
							let node = stack[stack.length - 1].node;
							throw this.handleError(e, node);
						}
					}
				}
				if (this.listeners.OnceExit) for (let [plugin, visitor] of this.listeners.OnceExit) {
					this.result.lastPlugin = plugin;
					try {
						if (root.type === "document") {
							let roots = root.nodes.map((subRoot) => visitor(subRoot, this.helpers));
							await Promise.all(roots);
						} else await visitor(root, this.helpers);
					} catch (e) {
						throw this.handleError(e);
					}
				}
			}
			this.processed = true;
			return this.stringify();
		}
		runOnRoot(plugin) {
			this.result.lastPlugin = plugin;
			try {
				if (typeof plugin === "object" && plugin.Once) {
					if (this.result.root.type === "document") {
						let roots = this.result.root.nodes.map((root) => plugin.Once(root, this.helpers));
						if (isPromise(roots[0])) return Promise.all(roots);
						return roots;
					}
					return plugin.Once(this.result.root, this.helpers);
				} else if (typeof plugin === "function") return plugin(this.result.root, this.result);
			} catch (error) {
				throw this.handleError(error);
			}
		}
		stringify() {
			if (this.error) throw this.error;
			if (this.stringified) return this.result;
			this.stringified = true;
			this.sync();
			let opts = this.result.opts;
			let str = stringify;
			if (opts.syntax) str = opts.syntax.stringify;
			if (opts.stringifier) str = opts.stringifier;
			if (str.stringify) str = str.stringify;
			let rootSource = this.result.root.source;
			if (opts.map === void 0 && !(rootSource && rootSource.input && rootSource.input.map)) {
				let result = "";
				str(this.result.root, (i) => {
					result += i;
				});
				this.result.css = result;
				return this.result;
			}
			let data = new MapGenerator(str, this.result.root, this.result.opts).generate();
			this.result.css = data[0];
			this.result.map = data[1];
			return this.result;
		}
		sync() {
			if (this.error) throw this.error;
			if (this.processed) return this.result;
			this.processed = true;
			if (this.processing) throw this.getAsyncError();
			for (let plugin of this.plugins) if (isPromise(this.runOnRoot(plugin))) throw this.getAsyncError();
			this.prepareVisitors();
			if (this.hasListener) {
				let root = this.result.root;
				while (!root[isClean]) {
					root[isClean] = true;
					this.walkSync(root);
				}
				if (this.listeners.OnceExit) if (root.type === "document") for (let subRoot of root.nodes) this.visitSync(this.listeners.OnceExit, subRoot);
				else this.visitSync(this.listeners.OnceExit, root);
			}
			return this.result;
		}
		then(onFulfilled, onRejected) {
			if (process.env.NODE_ENV !== "production") {
				if (!("from" in this.opts)) warnOnce("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
			}
			return this.async().then(onFulfilled, onRejected);
		}
		toString() {
			return this.css;
		}
		visitSync(visitors, node) {
			for (let [plugin, visitor] of visitors) {
				this.result.lastPlugin = plugin;
				let promise;
				try {
					promise = visitor(node, this.helpers);
				} catch (e) {
					throw this.handleError(e, node.proxyOf);
				}
				if (node.type !== "root" && node.type !== "document" && !node.parent) return true;
				if (isPromise(promise)) throw this.getAsyncError();
			}
		}
		visitTick(stack) {
			let visit = stack[stack.length - 1];
			let { node, visitors } = visit;
			if (node.type !== "root" && node.type !== "document" && !node.parent) {
				stack.pop();
				return;
			}
			if (visitors.length > 0 && visit.visitorIndex < visitors.length) {
				let [plugin, visitor] = visitors[visit.visitorIndex];
				visit.visitorIndex += 1;
				if (visit.visitorIndex === visitors.length) {
					visit.visitors = [];
					visit.visitorIndex = 0;
				}
				this.result.lastPlugin = plugin;
				try {
					return visitor(node.toProxy(), this.helpers);
				} catch (e) {
					throw this.handleError(e, node);
				}
			}
			if (visit.iterator !== 0) {
				let iterator = visit.iterator;
				if (visit.descending) {
					visit.descending = false;
					node.indexes[iterator] += 1;
				}
				let child;
				while (child = node.nodes[node.indexes[iterator]]) {
					if (!child[isClean]) {
						child[isClean] = true;
						visit.descending = true;
						stack.push(toStack(child));
						return;
					}
					node.indexes[iterator] += 1;
				}
				visit.iterator = 0;
				delete node.indexes[iterator];
			}
			let events = visit.events;
			while (visit.eventIndex < events.length) {
				let event = events[visit.eventIndex];
				visit.eventIndex += 1;
				if (event === CHILDREN) {
					if (node.nodes && node.nodes.length) {
						node[isClean] = true;
						visit.iterator = node.getIterator();
					}
					return;
				} else if (this.listeners[event]) {
					visit.visitors = this.listeners[event];
					return;
				}
			}
			stack.pop();
		}
		walkSync(node) {
			node[isClean] = true;
			let stack = [{
				eventIndex: 0,
				events: getEvents(node),
				iterator: 0,
				node
			}];
			while (stack.length > 0) {
				let visit = stack[stack.length - 1];
				let visitNode = visit.node;
				if (visit.iterator !== 0) {
					let iterator = visit.iterator;
					if (visit.descending) {
						visit.descending = false;
						visitNode.indexes[iterator] += 1;
					}
					let child;
					let descended = false;
					while (child = visitNode.nodes[visitNode.indexes[iterator]]) {
						if (!child[isClean]) {
							child[isClean] = true;
							visit.descending = true;
							stack.push({
								eventIndex: 0,
								events: getEvents(child),
								iterator: 0,
								node: child
							});
							descended = true;
							break;
						}
						visitNode.indexes[iterator] += 1;
					}
					if (descended) continue;
					visit.iterator = 0;
					delete visitNode.indexes[iterator];
				}
				if (visit.eventIndex < visit.events.length) {
					let event = visit.events[visit.eventIndex];
					visit.eventIndex += 1;
					if (event === CHILDREN) {
						if (visitNode.nodes && visitNode.nodes.length) visit.iterator = visitNode.getIterator();
					} else {
						let visitors = this.listeners[event];
						if (visitors) {
							if (this.visitSync(visitors, visitNode.toProxy())) stack.pop();
						}
					}
					continue;
				}
				stack.pop();
			}
		}
		warnings() {
			return this.sync().warnings();
		}
	}
	LazyResult.registerPostcss = (dependant) => {
		postcss = dependant;
	};
	lazyResult = LazyResult;
	LazyResult.default = LazyResult;
	Root.registerLazyResult(LazyResult);
	Document.registerLazyResult(LazyResult);
	return lazyResult;
}
var noWorkResult;
var hasRequiredNoWorkResult;
function requireNoWorkResult() {
	if (hasRequiredNoWorkResult) return noWorkResult;
	hasRequiredNoWorkResult = 1;
	let MapGenerator = requireMapGenerator();
	let parse = requireParse();
	let Result = requireResult();
	let stringify = requireStringify();
	let warnOnce = requireWarnOnce();
	class NoWorkResult {
		get content() {
			return this.result.css;
		}
		get css() {
			return this.result.css;
		}
		get map() {
			return this.result.map;
		}
		get messages() {
			return [];
		}
		get opts() {
			return this.result.opts;
		}
		get processor() {
			return this.result.processor;
		}
		get root() {
			if (this._root) return this._root;
			let root;
			let parser = parse;
			try {
				root = parser(this._css, this._opts);
			} catch (error) {
				this.error = error;
			}
			if (this.error) throw this.error;
			else {
				this._root = root;
				return root;
			}
		}
		get [Symbol.toStringTag]() {
			return "NoWorkResult";
		}
		constructor(processor, css, opts) {
			css = css.toString();
			this.stringified = false;
			this._processor = processor;
			this._css = css;
			this._opts = opts;
			this._map = void 0;
			let str = stringify;
			this.result = new Result(this._processor, void 0, this._opts);
			this.result.css = css;
			let self = this;
			Object.defineProperty(this.result, "root", { get() {
				return self.root;
			} });
			let map = new MapGenerator(str, void 0, this._opts, css);
			if (map.isMap()) {
				let [generatedCSS, generatedMap] = map.generate();
				if (generatedCSS) this.result.css = generatedCSS;
				if (generatedMap) this.result.map = generatedMap;
			} else {
				map.clearAnnotation();
				this.result.css = map.css;
			}
		}
		async() {
			if (this.error) return Promise.reject(this.error);
			return Promise.resolve(this.result);
		}
		catch(onRejected) {
			return this.async().catch(onRejected);
		}
		finally(onFinally) {
			return this.async().then(onFinally, onFinally);
		}
		sync() {
			if (this.error) throw this.error;
			return this.result;
		}
		then(onFulfilled, onRejected) {
			if (process.env.NODE_ENV !== "production") {
				if (!("from" in this._opts)) warnOnce("Without `from` option PostCSS could generate wrong source map and will not find Browserslist config. Set it to CSS file path or to `undefined` to prevent this warning.");
			}
			return this.async().then(onFulfilled, onRejected);
		}
		toString() {
			return this._css;
		}
		warnings() {
			return [];
		}
	}
	noWorkResult = NoWorkResult;
	NoWorkResult.default = NoWorkResult;
	return noWorkResult;
}
var processor;
var hasRequiredProcessor;
function requireProcessor() {
	if (hasRequiredProcessor) return processor;
	hasRequiredProcessor = 1;
	let Document = requireDocument();
	let LazyResult = requireLazyResult();
	let NoWorkResult = requireNoWorkResult();
	let Root = requireRoot();
	class Processor {
		constructor(plugins = []) {
			this.version = "8.5.25";
			this.plugins = this.normalize(plugins);
		}
		normalize(plugins) {
			let normalized = [];
			for (let i of plugins) {
				if (i.postcss === true) i = i();
				else if (i.postcss) i = i.postcss;
				if (typeof i === "object" && Array.isArray(i.plugins)) normalized = normalized.concat(i.plugins);
				else if (typeof i === "object" && i.postcssPlugin) normalized.push(i);
				else if (typeof i === "function") normalized.push(i);
				else if (typeof i === "object" && (i.parse || i.stringify)) {
					if (process.env.NODE_ENV !== "production") throw new Error("PostCSS syntaxes cannot be used as plugins. Instead, please use one of the syntax/parser/stringifier options as outlined in your PostCSS runner documentation.");
				} else throw new Error(i + " is not a PostCSS plugin");
			}
			return normalized;
		}
		process(css, opts = {}) {
			if (!this.plugins.length && !opts.parser && !opts.stringifier && !opts.syntax) return new NoWorkResult(this, css, opts);
			else return new LazyResult(this, css, opts);
		}
		use(plugin) {
			this.plugins = this.plugins.concat(this.normalize([plugin]));
			return this;
		}
	}
	processor = Processor;
	Processor.default = Processor;
	Root.registerProcessor(Processor);
	Document.registerProcessor(Processor);
	return processor;
}
var postcss_1;
var hasRequiredPostcss;
function requirePostcss() {
	if (hasRequiredPostcss) return postcss_1;
	hasRequiredPostcss = 1;
	let AtRule = requireAtRule();
	let Comment = requireComment();
	let Container = requireContainer$1();
	let CssSyntaxError = requireCssSyntaxError();
	let Declaration = requireDeclaration();
	let Document = requireDocument();
	let fromJSON = requireFromJSON();
	let Input = requireInput();
	let LazyResult = requireLazyResult();
	let list = requireList();
	let Node = requireNode$1();
	let parse = requireParse();
	let Processor = requireProcessor();
	let Result = requireResult();
	let Root = requireRoot();
	let Rule = requireRule();
	let stringify = requireStringify();
	let Warning = requireWarning();
	function postcss(...plugins) {
		if (plugins.length === 1 && Array.isArray(plugins[0])) plugins = plugins[0];
		return new Processor(plugins);
	}
	postcss.plugin = function plugin(name, initializer) {
		let warningPrinted = false;
		function creator(...args) {
			if (console && console.warn && !warningPrinted) {
				warningPrinted = true;
				console.warn(name + ": postcss.plugin was deprecated. Migration guide:\nhttps://evilmartians.com/chronicles/postcss-8-plugin-migration");
				if (process.env.LANG && process.env.LANG.startsWith("cn"))
 /* c8 ignore next 7 */
				console.warn(name + ": 里面 postcss.plugin 被弃用. 迁移指南:\nhttps://www.w3ctech.com/topic/2226");
			}
			let transformer = initializer(...args);
			transformer.postcssPlugin = name;
			transformer.postcssVersion = new Processor().version;
			return transformer;
		}
		let cache;
		Object.defineProperty(creator, "postcss", { get() {
			if (!cache) cache = creator();
			return cache;
		} });
		creator.process = function(css, processOpts, pluginOpts) {
			return postcss([creator(pluginOpts)]).process(css, processOpts);
		};
		return creator;
	};
	postcss.stringify = stringify;
	postcss.parse = parse;
	postcss.fromJSON = fromJSON;
	postcss.list = list;
	postcss.comment = (defaults) => new Comment(defaults);
	postcss.atRule = (defaults) => new AtRule(defaults);
	postcss.decl = (defaults) => new Declaration(defaults);
	postcss.rule = (defaults) => new Rule(defaults);
	postcss.root = (defaults) => new Root(defaults);
	postcss.document = (defaults) => new Document(defaults);
	postcss.CssSyntaxError = CssSyntaxError;
	postcss.Declaration = Declaration;
	postcss.Container = Container;
	postcss.Processor = Processor;
	postcss.Document = Document;
	postcss.Comment = Comment;
	postcss.Warning = Warning;
	postcss.AtRule = AtRule;
	postcss.Result = Result;
	postcss.Input = Input;
	postcss.Rule = Rule;
	postcss.Root = Root;
	postcss.Node = Node;
	LazyResult.registerPostcss(postcss);
	postcss_1 = postcss;
	postcss.default = postcss;
	return postcss_1;
}
var postcss = /*@__PURE__*/ getDefaultExportFromCjs(requirePostcss());
var stringify = postcss.stringify;
postcss.fromJSON;
postcss.plugin;
var parse$2 = postcss.parse;
postcss.list;
postcss.document;
postcss.comment;
postcss.atRule;
postcss.rule;
postcss.decl;
postcss.root;
postcss.CssSyntaxError;
postcss.Declaration;
postcss.Container;
postcss.Processor;
postcss.Document;
postcss.Comment;
postcss.Warning;
postcss.AtRule;
postcss.Result;
postcss.Input;
postcss.Rule;
postcss.Root;
postcss.Node;
var dist = {};
var Container = {};
var Node$1 = {};
var hasRequiredNode;
function requireNode() {
	if (hasRequiredNode) return Node$1;
	hasRequiredNode = 1;
	Object.defineProperty(Node$1, "__esModule", { value: true });
	/**
	* A very generic node. Pretty much any element of a media query
	*/
	function Node(opts) {
		this.after = opts.after;
		this.before = opts.before;
		this.type = opts.type;
		this.value = opts.value;
		this.sourceIndex = opts.sourceIndex;
	}
	Node$1.default = Node;
	return Node$1;
}
var hasRequiredContainer;
function requireContainer() {
	if (hasRequiredContainer) return Container;
	hasRequiredContainer = 1;
	Object.defineProperty(Container, "__esModule", { value: true });
	var _Node2 = _interopRequireDefault(requireNode());
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	function Container$1(opts) {
		var _this = this;
		this.constructor(opts);
		this.nodes = opts.nodes;
		if (this.after === void 0) this.after = this.nodes.length > 0 ? this.nodes[this.nodes.length - 1].after : "";
		if (this.before === void 0) this.before = this.nodes.length > 0 ? this.nodes[0].before : "";
		if (this.sourceIndex === void 0) this.sourceIndex = this.before.length;
		this.nodes.forEach(function(node) {
			node.parent = _this;
		});
	}
	Container$1.prototype = Object.create(_Node2.default.prototype);
	Container$1.constructor = _Node2.default;
	/**
	* Iterate over descendant nodes of the node
	*
	* @param {RegExp|string} filter - Optional. Only nodes with node.type that
	*    satisfies the filter will be traversed over
	* @param {function} cb - callback to call on each node. Takes theese params:
	*    node - the node being processed, i - it's index, nodes - the array
	*    of all nodes
	*    If false is returned, the iteration breaks
	*
	* @return (boolean) false, if the iteration was broken
	*/
	Container$1.prototype.walk = function walk(filter, cb) {
		var hasFilter = typeof filter === "string" || filter instanceof RegExp;
		var callback = hasFilter ? cb : filter;
		var filterReg = typeof filter === "string" ? new RegExp(filter) : filter;
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			if ((hasFilter ? filterReg.test(node.type) : true) && callback && callback(node, i, this.nodes) === false) return false;
			if (node.nodes && node.walk(filter, cb) === false) return false;
		}
		return true;
	};
	/**
	* Iterate over immediate children of the node
	*
	* @param {function} cb - callback to call on each node. Takes theese params:
	*    node - the node being processed, i - it's index, nodes - the array
	*    of all nodes
	*    If false is returned, the iteration breaks
	*
	* @return (boolean) false, if the iteration was broken
	*/
	Container$1.prototype.each = function each() {
		var cb = arguments.length <= 0 || arguments[0] === void 0 ? function() {} : arguments[0];
		for (var i = 0; i < this.nodes.length; i++) {
			var node = this.nodes[i];
			if (cb(node, i, this.nodes) === false) return false;
		}
		return true;
	};
	Container.default = Container$1;
	return Container;
}
var parsers = {};
var hasRequiredParsers;
function requireParsers() {
	if (hasRequiredParsers) return parsers;
	hasRequiredParsers = 1;
	Object.defineProperty(parsers, "__esModule", { value: true });
	parsers.parseMediaFeature = parseMediaFeature;
	parsers.parseMediaQuery = parseMediaQuery;
	parsers.parseMediaList = parseMediaList;
	var _Node2 = _interopRequireDefault(requireNode());
	var _Container2 = _interopRequireDefault(requireContainer());
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	/**
	* Parses a media feature expression, e.g. `max-width: 10px`, `(color)`
	*
	* @param {string} string - the source expression string, can be inside parens
	* @param {Number} index - the index of `string` in the overall input
	*
	* @return {Array} an array of Nodes, the first element being a media feature,
	*    the secont - its value (may be missing)
	*/
	function parseMediaFeature(string) {
		var index = arguments.length <= 1 || arguments[1] === void 0 ? 0 : arguments[1];
		var modesEntered = [{
			mode: "normal",
			character: null
		}];
		var result = [];
		var lastModeIndex = 0;
		var mediaFeature = "";
		var colon = null;
		var mediaFeatureValue = null;
		var indexLocal = index;
		var stringNormalized = string;
		if (string[0] === "(" && string[string.length - 1] === ")") {
			stringNormalized = string.substring(1, string.length - 1);
			indexLocal++;
		}
		for (var i = 0; i < stringNormalized.length; i++) {
			var character = stringNormalized[i];
			if (character === "'" || character === "\"") {
				if (modesEntered[lastModeIndex].isCalculationEnabled === true) {
					modesEntered.push({
						mode: "string",
						isCalculationEnabled: false,
						character
					});
					lastModeIndex++;
				} else if (modesEntered[lastModeIndex].mode === "string" && modesEntered[lastModeIndex].character === character && stringNormalized[i - 1] !== "\\") {
					modesEntered.pop();
					lastModeIndex--;
				}
			}
			if (character === "{") {
				modesEntered.push({
					mode: "interpolation",
					isCalculationEnabled: true
				});
				lastModeIndex++;
			} else if (character === "}") {
				modesEntered.pop();
				lastModeIndex--;
			}
			if (modesEntered[lastModeIndex].mode === "normal" && character === ":") {
				var mediaFeatureValueStr = stringNormalized.substring(i + 1);
				mediaFeatureValue = {
					type: "value",
					before: /^(\s*)/.exec(mediaFeatureValueStr)[1],
					after: /(\s*)$/.exec(mediaFeatureValueStr)[1],
					value: mediaFeatureValueStr.trim()
				};
				mediaFeatureValue.sourceIndex = mediaFeatureValue.before.length + i + 1 + indexLocal;
				colon = {
					type: "colon",
					sourceIndex: i + indexLocal,
					after: mediaFeatureValue.before,
					value: ":"
				};
				break;
			}
			mediaFeature += character;
		}
		mediaFeature = {
			type: "media-feature",
			before: /^(\s*)/.exec(mediaFeature)[1],
			after: /(\s*)$/.exec(mediaFeature)[1],
			value: mediaFeature.trim()
		};
		mediaFeature.sourceIndex = mediaFeature.before.length + indexLocal;
		result.push(mediaFeature);
		if (colon !== null) {
			colon.before = mediaFeature.after;
			result.push(colon);
		}
		if (mediaFeatureValue !== null) result.push(mediaFeatureValue);
		return result;
	}
	/**
	* Parses a media query, e.g. `screen and (color)`, `only tv`
	*
	* @param {string} string - the source media query string
	* @param {Number} index - the index of `string` in the overall input
	*
	* @return {Array} an array of Nodes and Containers
	*/
	function parseMediaQuery(string) {
		var index = arguments.length <= 1 || arguments[1] === void 0 ? 0 : arguments[1];
		var result = [];
		var localLevel = 0;
		var insideSomeValue = false;
		var node = void 0;
		function resetNode() {
			return {
				before: "",
				after: "",
				value: ""
			};
		}
		node = resetNode();
		for (var i = 0; i < string.length; i++) {
			var character = string[i];
			if (!insideSomeValue) if (character.search(/\s/) !== -1) node.before += character;
			else {
				if (character === "(") {
					node.type = "media-feature-expression";
					localLevel++;
				}
				node.value = character;
				node.sourceIndex = index + i;
				insideSomeValue = true;
			}
			else {
				node.value += character;
				if (character === "{" || character === "(") localLevel++;
				if (character === ")" || character === "}") localLevel--;
			}
			if (insideSomeValue && localLevel === 0 && (character === ")" || i === string.length - 1 || string[i + 1].search(/\s/) !== -1)) {
				if ([
					"not",
					"only",
					"and"
				].indexOf(node.value) !== -1) node.type = "keyword";
				if (node.type === "media-feature-expression") node.nodes = parseMediaFeature(node.value, node.sourceIndex);
				result.push(Array.isArray(node.nodes) ? new _Container2.default(node) : new _Node2.default(node));
				node = resetNode();
				insideSomeValue = false;
			}
		}
		for (var _i = 0; _i < result.length; _i++) {
			node = result[_i];
			if (_i > 0) result[_i - 1].after = node.before;
			if (node.type === void 0) {
				if (_i > 0) {
					if (result[_i - 1].type === "media-feature-expression") {
						node.type = "keyword";
						continue;
					}
					if (result[_i - 1].value === "not" || result[_i - 1].value === "only") {
						node.type = "media-type";
						continue;
					}
					if (result[_i - 1].value === "and") {
						node.type = "media-feature-expression";
						continue;
					}
					if (result[_i - 1].type === "media-type") if (!result[_i + 1]) node.type = "media-feature-expression";
					else node.type = result[_i + 1].type === "media-feature-expression" ? "keyword" : "media-feature-expression";
				}
				if (_i === 0) {
					if (!result[_i + 1]) {
						node.type = "media-type";
						continue;
					}
					if (result[_i + 1] && (result[_i + 1].type === "media-feature-expression" || result[_i + 1].type === "keyword")) {
						node.type = "media-type";
						continue;
					}
					if (result[_i + 2]) {
						if (result[_i + 2].type === "media-feature-expression") {
							node.type = "media-type";
							result[_i + 1].type = "keyword";
							continue;
						}
						if (result[_i + 2].type === "keyword") {
							node.type = "keyword";
							result[_i + 1].type = "media-type";
							continue;
						}
					}
					if (result[_i + 3]) {
						if (result[_i + 3].type === "media-feature-expression") {
							node.type = "keyword";
							result[_i + 1].type = "media-type";
							result[_i + 2].type = "keyword";
							continue;
						}
					}
				}
			}
		}
		return result;
	}
	/**
	* Parses a media query list. Takes a possible `url()` at the start into
	* account, and divides the list into media queries that are parsed separately
	*
	* @param {string} string - the source media query list string
	*
	* @return {Array} an array of Nodes/Containers
	*/
	function parseMediaList(string) {
		var result = [];
		var interimIndex = 0;
		var levelLocal = 0;
		var doesHaveUrl = /^(\s*)url\s*\(/.exec(string);
		if (doesHaveUrl !== null) {
			var i = doesHaveUrl[0].length;
			var parenthesesLv = 1;
			while (parenthesesLv > 0) {
				var character = string[i];
				if (character === "(") parenthesesLv++;
				if (character === ")") parenthesesLv--;
				i++;
			}
			result.unshift(new _Node2.default({
				type: "url",
				value: string.substring(0, i).trim(),
				sourceIndex: doesHaveUrl[1].length,
				before: doesHaveUrl[1],
				after: /^(\s*)/.exec(string.substring(i))[1]
			}));
			interimIndex = i;
		}
		for (var _i2 = interimIndex; _i2 < string.length; _i2++) {
			var _character = string[_i2];
			if (_character === "(") levelLocal++;
			if (_character === ")") levelLocal--;
			if (levelLocal === 0 && _character === ",") {
				var _mediaQueryString = string.substring(interimIndex, _i2);
				var _spaceBefore = /^(\s*)/.exec(_mediaQueryString)[1];
				result.push(new _Container2.default({
					type: "media-query",
					value: _mediaQueryString.trim(),
					sourceIndex: interimIndex + _spaceBefore.length,
					nodes: parseMediaQuery(_mediaQueryString, interimIndex),
					before: _spaceBefore,
					after: /(\s*)$/.exec(_mediaQueryString)[1]
				}));
				interimIndex = _i2 + 1;
			}
		}
		var mediaQueryString = string.substring(interimIndex);
		var spaceBefore = /^(\s*)/.exec(mediaQueryString)[1];
		result.push(new _Container2.default({
			type: "media-query",
			value: mediaQueryString.trim(),
			sourceIndex: interimIndex + spaceBefore.length,
			nodes: parseMediaQuery(mediaQueryString, interimIndex),
			before: spaceBefore,
			after: /(\s*)$/.exec(mediaQueryString)[1]
		}));
		return result;
	}
	return parsers;
}
var hasRequiredDist;
function requireDist() {
	if (hasRequiredDist) return dist;
	hasRequiredDist = 1;
	Object.defineProperty(dist, "__esModule", { value: true });
	dist.default = parseMedia;
	var _Container2 = _interopRequireDefault(requireContainer());
	var _parsers = requireParsers();
	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : { default: obj };
	}
	/**
	* Parses a media query list into an array of nodes. A typical node signature:
	*  {string} node.type -- one of: 'media-query', 'media-type', 'keyword',
	*    'media-feature-expression', 'media-feature', 'colon', 'value'
	*  {string} node.value -- the contents of a particular element, trimmed
	*    e.g.: `screen`, `max-width`, `1024px`
	*  {string} node.after -- whitespaces that follow the element
	*  {string} node.before -- whitespaces that precede the element
	*  {string} node.sourceIndex -- the index of the element in a source media
	*    query list, 0-based
	*  {object} node.parent -- a link to the parent node (a container)
	*
	* Some nodes (media queries, media feature expressions) contain other nodes.
	* They additionally have:
	*  {array} node.nodes -- an array of nodes of the type described here
	*  {funciton} node.each -- traverses direct children of the node, calling
	*    a callback for each one
	*  {funciton} node.walk -- traverses ALL descendants of the node, calling
	*    a callback for each one
	*/
	function parseMedia(value) {
		return new _Container2.default({
			nodes: (0, _parsers.parseMediaList)(value),
			type: "media-query-list",
			value: value.trim()
		});
	}
	return dist;
}
var mediaParser = /*@__PURE__*/ getDefaultExportFromCjs(requireDist());
var safeParser$1;
var hasRequiredSafeParser;
function requireSafeParser() {
	if (hasRequiredSafeParser) return safeParser$1;
	hasRequiredSafeParser = 1;
	let Comment = requireComment();
	let Parser = requireParser();
	let tokenizer = requireTokenize();
	class SafeParser extends Parser {
		checkMissedSemicolon() {}
		comment(token) {
			let node = new Comment();
			this.init(node, token[2]);
			let pos = this.input.fromOffset(token[3]) || this.input.fromOffset(this.input.css.length - 1);
			node.source.end = {
				column: pos.col,
				line: pos.line,
				offset: token[3] + 1
			};
			let text = token[1].slice(2);
			if (text.slice(-2) === "*/") text = text.slice(0, -2);
			if (/^\s*$/.test(text)) {
				node.text = "";
				node.raws.left = text;
				node.raws.right = "";
			} else {
				let match = text.match(/^(\s*)([^]*\S)(\s*)$/);
				node.text = match[2];
				node.raws.left = match[1];
				node.raws.right = match[3];
			}
		}
		createTokenizer() {
			this.tokenizer = tokenizer(this.input, { ignoreErrors: true });
		}
		decl(tokens) {
			if (tokens.length > 1 && tokens.some((i) => i[0] === "word")) super.decl(tokens);
		}
		doubleColon() {}
		endFile() {
			if (this.current.nodes && this.current.nodes.length) this.current.raws.semicolon = this.semicolon;
			this.current.raws.after = (this.current.raws.after || "") + this.spaces;
			while (this.current.parent) {
				this.current = this.current.parent;
				this.current.raws.after = "";
			}
			this.root.source.end = this.getPosition(this.tokenizer.position());
		}
		precheckMissedSemicolon(tokens) {
			let colon = this.colon(tokens);
			if (colon === false) return;
			let nextStart, prevEnd;
			for (nextStart = colon - 1; nextStart >= 0; nextStart--) if (tokens[nextStart][0] === "word") break;
			if (nextStart <= 0) return;
			for (prevEnd = nextStart - 1; prevEnd >= 0; prevEnd--) if (tokens[prevEnd][0] !== "space") {
				prevEnd += 1;
				break;
			}
			let other = tokens.slice(nextStart);
			let spaces = tokens.slice(prevEnd, nextStart);
			tokens.splice(prevEnd, tokens.length - prevEnd);
			this.spaces = spaces.map((i) => i[1]).join("");
			this.decl(other);
		}
		unclosedBracket() {}
		unexpectedClose() {
			this.current.raws.after += "}";
		}
		unknownWord(tokens) {
			this.spaces += tokens.map((i) => i[1]).join("");
		}
		unnamedAtrule(node) {
			node.name = "";
		}
	}
	safeParser$1 = SafeParser;
	return safeParser$1;
}
var safeParse;
var hasRequiredSafeParse;
function requireSafeParse() {
	if (hasRequiredSafeParse) return safeParse;
	hasRequiredSafeParse = 1;
	let { Input } = requirePostcss();
	let SafeParser = requireSafeParser();
	safeParse = function safeParse(css, opts) {
		let input = new Input(css, opts);
		let parser = new SafeParser(input);
		parser.parse();
		return parser.root;
	};
	return safeParse;
}
var safeParser = /*@__PURE__*/ getDefaultExportFromCjs(requireSafeParse());
var boolbase$1;
var hasRequiredBoolbase;
function requireBoolbase() {
	if (hasRequiredBoolbase) return boolbase$1;
	hasRequiredBoolbase = 1;
	boolbase$1 = {
		trueFunc: function trueFunc() {
			return true;
		},
		falseFunc: function falseFunc() {
			return false;
		}
	};
	return boolbase$1;
}
var boolbaseExports = requireBoolbase();
var boolbase = /*@__PURE__*/ getDefaultExportFromCjs(boolbaseExports);
var SelectorType;
(function(SelectorType) {
	SelectorType["Attribute"] = "attribute";
	SelectorType["Pseudo"] = "pseudo";
	SelectorType["PseudoElement"] = "pseudo-element";
	SelectorType["Tag"] = "tag";
	SelectorType["Universal"] = "universal";
	SelectorType["Adjacent"] = "adjacent";
	SelectorType["Child"] = "child";
	SelectorType["Descendant"] = "descendant";
	SelectorType["Parent"] = "parent";
	SelectorType["Sibling"] = "sibling";
	SelectorType["ColumnCombinator"] = "column-combinator";
})(SelectorType || (SelectorType = {}));
var AttributeAction;
(function(AttributeAction) {
	AttributeAction["Any"] = "any";
	AttributeAction["Element"] = "element";
	AttributeAction["End"] = "end";
	AttributeAction["Equals"] = "equals";
	AttributeAction["Exists"] = "exists";
	AttributeAction["Hyphen"] = "hyphen";
	AttributeAction["Not"] = "not";
	AttributeAction["Start"] = "start";
})(AttributeAction || (AttributeAction = {}));
var reName = /^[^#\\]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\u00B0-\uFFFF-])+/;
var reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
var CharCode;
(function(CharCode) {
	CharCode[CharCode["LeftParenthesis"] = 40] = "LeftParenthesis";
	CharCode[CharCode["RightParenthesis"] = 41] = "RightParenthesis";
	CharCode[CharCode["LeftSquareBracket"] = 91] = "LeftSquareBracket";
	CharCode[CharCode["RightSquareBracket"] = 93] = "RightSquareBracket";
	CharCode[CharCode["Comma"] = 44] = "Comma";
	CharCode[CharCode["Period"] = 46] = "Period";
	CharCode[CharCode["Colon"] = 58] = "Colon";
	CharCode[CharCode["SingleQuote"] = 39] = "SingleQuote";
	CharCode[CharCode["DoubleQuote"] = 34] = "DoubleQuote";
	CharCode[CharCode["Plus"] = 43] = "Plus";
	CharCode[CharCode["Tilde"] = 126] = "Tilde";
	CharCode[CharCode["QuestionMark"] = 63] = "QuestionMark";
	CharCode[CharCode["ExclamationMark"] = 33] = "ExclamationMark";
	CharCode[CharCode["Slash"] = 47] = "Slash";
	CharCode[CharCode["Equal"] = 61] = "Equal";
	CharCode[CharCode["Dollar"] = 36] = "Dollar";
	CharCode[CharCode["Pipe"] = 124] = "Pipe";
	CharCode[CharCode["Circumflex"] = 94] = "Circumflex";
	CharCode[CharCode["Asterisk"] = 42] = "Asterisk";
	CharCode[CharCode["GreaterThan"] = 62] = "GreaterThan";
	CharCode[CharCode["LessThan"] = 60] = "LessThan";
	CharCode[CharCode["Hash"] = 35] = "Hash";
	CharCode[CharCode["LowerI"] = 105] = "LowerI";
	CharCode[CharCode["LowerS"] = 115] = "LowerS";
	CharCode[CharCode["BackSlash"] = 92] = "BackSlash";
	CharCode[CharCode["Space"] = 32] = "Space";
	CharCode[CharCode["Tab"] = 9] = "Tab";
	CharCode[CharCode["NewLine"] = 10] = "NewLine";
	CharCode[CharCode["FormFeed"] = 12] = "FormFeed";
	CharCode[CharCode["CarriageReturn"] = 13] = "CarriageReturn";
})(CharCode || (CharCode = {}));
var actionTypes = /* @__PURE__ */ new Map([
	[CharCode.Tilde, AttributeAction.Element],
	[CharCode.Circumflex, AttributeAction.Start],
	[CharCode.Dollar, AttributeAction.End],
	[CharCode.Asterisk, AttributeAction.Any],
	[CharCode.ExclamationMark, AttributeAction.Not],
	[CharCode.Pipe, AttributeAction.Hyphen]
]);
var unpackPseudos = /* @__PURE__ */ new Set([
	"has",
	"not",
	"matches",
	"is",
	"where",
	"host",
	"host-context"
]);
/**
* Pseudo elements defined in CSS Level 1 and CSS Level 2 can be written with
* a single colon; eg. :before will turn into ::before.
*
* @see {@link https://www.w3.org/TR/2018/WD-selectors-4-20181121/#pseudo-element-syntax}
*/
var pseudosToPseudoElements = /* @__PURE__ */ new Set([
	"before",
	"after",
	"first-line",
	"first-letter"
]);
/**
* Checks whether a specific selector is a traversal.
* This is useful eg. in swapping the order of elements that
* are not traversals.
*
* @param selector Selector to check.
*/
function isTraversal$1(selector) {
	switch (selector.type) {
		case SelectorType.Adjacent:
		case SelectorType.Child:
		case SelectorType.Descendant:
		case SelectorType.Parent:
		case SelectorType.Sibling:
		case SelectorType.ColumnCombinator: return true;
		default: return false;
	}
}
var stripQuotesFromPseudos = /* @__PURE__ */ new Set(["contains", "icontains"]);
function funescape(_, escaped, escapedWhitespace) {
	const high = Number.parseInt(escaped, 16) - 65536;
	return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
}
function unescapeCSS(cssString) {
	return cssString.replace(reEscape, funescape);
}
function isQuote(c) {
	return c === CharCode.SingleQuote || c === CharCode.DoubleQuote;
}
function isWhitespace$1(c) {
	return c === CharCode.Space || c === CharCode.Tab || c === CharCode.NewLine || c === CharCode.FormFeed || c === CharCode.CarriageReturn;
}
/**
* Parses `selector`.
*
* @param selector Selector to parse.
* @returns Returns a two-dimensional array.
* The first dimension represents selectors separated by commas (eg. `sub1, sub2`),
* the second contains the relevant tokens for that selector.
*/
function parse$1(selector) {
	const subselects = [];
	const endIndex = parseSelector(subselects, `${selector}`, 0);
	if (endIndex < selector.length) throw new Error(`Unmatched selector: ${selector.slice(endIndex)}`);
	return subselects;
}
function parseSelector(subselects, selector, selectorIndex) {
	let tokens = [];
	function getName(offset) {
		const match = selector.slice(selectorIndex + offset).match(reName);
		if (!match) throw new Error(`Expected name, found ${selector.slice(selectorIndex)}`);
		const [name] = match;
		selectorIndex += offset + name.length;
		return unescapeCSS(name);
	}
	function stripWhitespace(offset) {
		selectorIndex += offset;
		while (selectorIndex < selector.length && isWhitespace$1(selector.charCodeAt(selectorIndex))) selectorIndex++;
	}
	function readValueWithParenthesis() {
		selectorIndex += 1;
		const start = selectorIndex;
		for (let counter = 1; selectorIndex < selector.length; selectorIndex++) switch (selector.charCodeAt(selectorIndex)) {
			case CharCode.BackSlash:
				selectorIndex += 1;
				break;
			case CharCode.LeftParenthesis:
				counter += 1;
				break;
			case CharCode.RightParenthesis:
				counter -= 1;
				if (counter === 0) return unescapeCSS(selector.slice(start, selectorIndex++));
				break;
		}
		throw new Error("Parenthesis not matched");
	}
	function ensureNotTraversal() {
		if (tokens.length > 0 && isTraversal$1(tokens[tokens.length - 1])) throw new Error("Did not expect successive traversals.");
	}
	function addTraversal(type) {
		if (tokens.length > 0 && tokens[tokens.length - 1].type === SelectorType.Descendant) {
			tokens[tokens.length - 1].type = type;
			return;
		}
		ensureNotTraversal();
		tokens.push({ type });
	}
	function addSpecialAttribute(name, action) {
		tokens.push({
			type: SelectorType.Attribute,
			name,
			action,
			value: getName(1),
			namespace: null,
			ignoreCase: "quirks"
		});
	}
	/**
	* We have finished parsing the current part of the selector.
	*
	* Remove descendant tokens at the end if they exist,
	* and return the last index, so that parsing can be
	* picked up from here.
	*/
	function finalizeSubselector() {
		if (tokens.length > 0 && tokens[tokens.length - 1].type === SelectorType.Descendant) tokens.pop();
		if (tokens.length === 0) throw new Error("Empty sub-selector");
		subselects.push(tokens);
	}
	stripWhitespace(0);
	if (selector.length === selectorIndex) return selectorIndex;
	loop: while (selectorIndex < selector.length) {
		const firstChar = selector.charCodeAt(selectorIndex);
		switch (firstChar) {
			case CharCode.Space:
			case CharCode.Tab:
			case CharCode.NewLine:
			case CharCode.FormFeed:
			case CharCode.CarriageReturn:
				if (tokens.length === 0 || tokens[0].type !== SelectorType.Descendant) {
					ensureNotTraversal();
					tokens.push({ type: SelectorType.Descendant });
				}
				stripWhitespace(1);
				break;
			case CharCode.GreaterThan:
				addTraversal(SelectorType.Child);
				stripWhitespace(1);
				break;
			case CharCode.LessThan:
				addTraversal(SelectorType.Parent);
				stripWhitespace(1);
				break;
			case CharCode.Tilde:
				addTraversal(SelectorType.Sibling);
				stripWhitespace(1);
				break;
			case CharCode.Plus:
				addTraversal(SelectorType.Adjacent);
				stripWhitespace(1);
				break;
			case CharCode.Period:
				addSpecialAttribute("class", AttributeAction.Element);
				break;
			case CharCode.Hash:
				addSpecialAttribute("id", AttributeAction.Equals);
				break;
			case CharCode.LeftSquareBracket: {
				stripWhitespace(1);
				let name;
				let namespace = null;
				if (selector.charCodeAt(selectorIndex) === CharCode.Pipe) name = getName(1);
				else if (selector.startsWith("*|", selectorIndex)) {
					namespace = "*";
					name = getName(2);
				} else {
					name = getName(0);
					if (selector.charCodeAt(selectorIndex) === CharCode.Pipe && selector.charCodeAt(selectorIndex + 1) !== CharCode.Equal) {
						namespace = name;
						name = getName(1);
					}
				}
				stripWhitespace(0);
				let action = AttributeAction.Exists;
				const possibleAction = actionTypes.get(selector.charCodeAt(selectorIndex));
				if (possibleAction) {
					action = possibleAction;
					if (selector.charCodeAt(selectorIndex + 1) !== CharCode.Equal) throw new Error("Expected `=`");
					stripWhitespace(2);
				} else if (selector.charCodeAt(selectorIndex) === CharCode.Equal) {
					action = AttributeAction.Equals;
					stripWhitespace(1);
				}
				let value = "";
				let ignoreCase = null;
				if (action !== "exists") {
					if (isQuote(selector.charCodeAt(selectorIndex))) {
						const quote = selector.charCodeAt(selectorIndex);
						selectorIndex += 1;
						const sectionStart = selectorIndex;
						while (selectorIndex < selector.length && selector.charCodeAt(selectorIndex) !== quote) selectorIndex += selector.charCodeAt(selectorIndex) === CharCode.BackSlash ? 2 : 1;
						if (selector.charCodeAt(selectorIndex) !== quote) throw new Error("Attribute value didn't end");
						value = unescapeCSS(selector.slice(sectionStart, selectorIndex));
						selectorIndex += 1;
					} else {
						const valueStart = selectorIndex;
						while (selectorIndex < selector.length && !isWhitespace$1(selector.charCodeAt(selectorIndex)) && selector.charCodeAt(selectorIndex) !== CharCode.RightSquareBracket) selectorIndex += selector.charCodeAt(selectorIndex) === CharCode.BackSlash ? 2 : 1;
						value = unescapeCSS(selector.slice(valueStart, selectorIndex));
					}
					stripWhitespace(0);
					switch (selector.charCodeAt(selectorIndex) | 32) {
						case CharCode.LowerI:
							ignoreCase = true;
							stripWhitespace(1);
							break;
						case CharCode.LowerS:
							ignoreCase = false;
							stripWhitespace(1);
							break;
					}
				}
				if (selector.charCodeAt(selectorIndex) !== CharCode.RightSquareBracket) throw new Error("Attribute selector didn't terminate");
				selectorIndex += 1;
				const attributeSelector = {
					type: SelectorType.Attribute,
					name,
					action,
					value,
					namespace,
					ignoreCase
				};
				tokens.push(attributeSelector);
				break;
			}
			case CharCode.Colon: {
				if (selector.charCodeAt(selectorIndex + 1) === CharCode.Colon) {
					tokens.push({
						type: SelectorType.PseudoElement,
						name: getName(2).toLowerCase(),
						data: selector.charCodeAt(selectorIndex) === CharCode.LeftParenthesis ? readValueWithParenthesis() : null
					});
					break;
				}
				const name = getName(1).toLowerCase();
				if (pseudosToPseudoElements.has(name)) {
					tokens.push({
						type: SelectorType.PseudoElement,
						name,
						data: null
					});
					break;
				}
				let data = null;
				if (selector.charCodeAt(selectorIndex) === CharCode.LeftParenthesis) if (unpackPseudos.has(name)) {
					if (isQuote(selector.charCodeAt(selectorIndex + 1))) throw new Error(`Pseudo-selector ${name} cannot be quoted`);
					data = [];
					selectorIndex = parseSelector(data, selector, selectorIndex + 1);
					if (selector.charCodeAt(selectorIndex) !== CharCode.RightParenthesis) throw new Error(`Missing closing parenthesis in :${name} (${selector})`);
					selectorIndex += 1;
				} else {
					data = readValueWithParenthesis();
					if (stripQuotesFromPseudos.has(name)) {
						const quot = data.charCodeAt(0);
						if (quot === data.charCodeAt(data.length - 1) && isQuote(quot)) data = data.slice(1, -1);
					}
					data = unescapeCSS(data);
				}
				tokens.push({
					type: SelectorType.Pseudo,
					name,
					data
				});
				break;
			}
			case CharCode.Comma:
				finalizeSubselector();
				tokens = [];
				stripWhitespace(1);
				break;
			default: {
				if (selector.startsWith("/*", selectorIndex)) {
					const endIndex = selector.indexOf("*/", selectorIndex + 2);
					if (endIndex < 0) throw new Error("Comment was not terminated");
					selectorIndex = endIndex + 2;
					if (tokens.length === 0) stripWhitespace(0);
					break;
				}
				let namespace = null;
				let name;
				if (firstChar === CharCode.Asterisk) {
					selectorIndex += 1;
					name = "*";
				} else if (firstChar === CharCode.Pipe) {
					name = "";
					if (selector.charCodeAt(selectorIndex + 1) === CharCode.Pipe) {
						addTraversal(SelectorType.ColumnCombinator);
						stripWhitespace(2);
						break;
					}
				} else if (reName.test(selector.slice(selectorIndex))) name = getName(0);
				else break loop;
				if (selector.charCodeAt(selectorIndex) === CharCode.Pipe && selector.charCodeAt(selectorIndex + 1) !== CharCode.Pipe) {
					namespace = name;
					if (selector.charCodeAt(selectorIndex + 1) === CharCode.Asterisk) {
						name = "*";
						selectorIndex += 2;
					} else name = getName(1);
				}
				tokens.push(name === "*" ? {
					type: SelectorType.Universal,
					namespace
				} : {
					type: SelectorType.Tag,
					name,
					namespace
				});
			}
		}
	}
	finalizeSubselector();
	return selectorIndex;
}
/** Types of elements found in htmlparser2's DOM */
var ElementType;
(function(ElementType) {
	/** Type for the root element of a document */
	ElementType["Root"] = "root";
	/** Type for Text */
	ElementType["Text"] = "text";
	/** Type for <? ... ?> */
	ElementType["Directive"] = "directive";
	/** Type for <!-- ... --> */
	ElementType["Comment"] = "comment";
	/** Type for <script> tags */
	ElementType["Script"] = "script";
	/** Type for <style> tags */
	ElementType["Style"] = "style";
	/** Type for Any tag */
	ElementType["Tag"] = "tag";
	/** Type for <![CDATA[ ... ]]> */
	ElementType["CDATA"] = "cdata";
	/** Type for <!doctype ...> */
	ElementType["Doctype"] = "doctype";
})(ElementType || (ElementType = {}));
/**
* Tests whether an element is a tag or not.
*
* @param elem Element to test
*/
function isTag$1(elem) {
	return elem.type === ElementType.Tag || elem.type === ElementType.Script || elem.type === ElementType.Style;
}
/** Type for the root element of a document */
var Root = ElementType.Root;
/** Type for Text */
var Text$1 = ElementType.Text;
/** Type for <? ... ?> */
var Directive = ElementType.Directive;
/** Type for <!-- ... --> */
var Comment$1 = ElementType.Comment;
/** Type for <script> tags */
var Script = ElementType.Script;
/** Type for <style> tags */
var Style = ElementType.Style;
/** Type for Any tag */
var Tag = ElementType.Tag;
/** Type for <![CDATA[ ... ]]> */
var CDATA$1 = ElementType.CDATA;
/** Type for <!doctype ...> */
var Doctype = ElementType.Doctype;
/**
* This object will be used as the prototype for Nodes when creating a
* DOM-Level-1-compliant structure.
*/
var Node = class {
	constructor() {
		/** Parent of the node */
		this.parent = null;
		/** Previous sibling */
		this.prev = null;
		/** Next sibling */
		this.next = null;
		/** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
		this.startIndex = null;
		/** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
		this.endIndex = null;
	}
	/**
	* Same as {@link parent}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get parentNode() {
		return this.parent;
	}
	set parentNode(parent) {
		this.parent = parent;
	}
	/**
	* Same as {@link prev}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get previousSibling() {
		return this.prev;
	}
	set previousSibling(prev) {
		this.prev = prev;
	}
	/**
	* Same as {@link next}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get nextSibling() {
		return this.next;
	}
	set nextSibling(next) {
		this.next = next;
	}
	/**
	* Clone this node, and optionally its children.
	*
	* @param recursive Clone child nodes as well.
	* @returns A clone of the node.
	*/
	cloneNode(recursive = false) {
		return cloneNode(this, recursive);
	}
};
/**
* A node that contains some data.
*/
var DataNode = class extends Node {
	/**
	* @param data The content of the data node
	*/
	constructor(data) {
		super();
		this.data = data;
	}
	/**
	* Same as {@link data}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get nodeValue() {
		return this.data;
	}
	set nodeValue(data) {
		this.data = data;
	}
};
/**
* Text within the document.
*/
var Text = class extends DataNode {
	constructor() {
		super(...arguments);
		this.type = ElementType.Text;
	}
	get nodeType() {
		return 3;
	}
};
/**
* Comments within the document.
*/
var Comment = class extends DataNode {
	constructor() {
		super(...arguments);
		this.type = ElementType.Comment;
	}
	get nodeType() {
		return 8;
	}
};
/**
* Processing instructions, including doc types.
*/
var ProcessingInstruction = class extends DataNode {
	constructor(name, data) {
		super(data);
		this.name = name;
		this.type = ElementType.Directive;
	}
	get nodeType() {
		return 1;
	}
};
/**
* A `Node` that can have children.
*/
var NodeWithChildren = class extends Node {
	/**
	* @param children Children of the node. Only certain node types can have children.
	*/
	constructor(children) {
		super();
		this.children = children;
	}
	/** First child of the node. */
	get firstChild() {
		var _a;
		return (_a = this.children[0]) !== null && _a !== void 0 ? _a : null;
	}
	/** Last child of the node. */
	get lastChild() {
		return this.children.length > 0 ? this.children[this.children.length - 1] : null;
	}
	/**
	* Same as {@link children}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get childNodes() {
		return this.children;
	}
	set childNodes(children) {
		this.children = children;
	}
};
var CDATA = class extends NodeWithChildren {
	constructor() {
		super(...arguments);
		this.type = ElementType.CDATA;
	}
	get nodeType() {
		return 4;
	}
};
/**
* The root node of the document.
*/
var Document = class extends NodeWithChildren {
	constructor() {
		super(...arguments);
		this.type = ElementType.Root;
	}
	get nodeType() {
		return 9;
	}
};
/**
* An element within the DOM.
*/
var Element = class extends NodeWithChildren {
	/**
	* @param name Name of the tag, eg. `div`, `span`.
	* @param attribs Object mapping attribute names to attribute values.
	* @param children Children of the node.
	*/
	constructor(name, attribs, children = [], type = name === "script" ? ElementType.Script : name === "style" ? ElementType.Style : ElementType.Tag) {
		super(children);
		this.name = name;
		this.attribs = attribs;
		this.type = type;
	}
	get nodeType() {
		return 1;
	}
	/**
	* Same as {@link name}.
	* [DOM spec](https://dom.spec.whatwg.org)-compatible alias.
	*/
	get tagName() {
		return this.name;
	}
	set tagName(name) {
		this.name = name;
	}
	get attributes() {
		return Object.keys(this.attribs).map((name) => {
			var _a, _b;
			return {
				name,
				value: this.attribs[name],
				namespace: (_a = this["x-attribsNamespace"]) === null || _a === void 0 ? void 0 : _a[name],
				prefix: (_b = this["x-attribsPrefix"]) === null || _b === void 0 ? void 0 : _b[name]
			};
		});
	}
};
/**
* @param node Node to check.
* @returns `true` if the node is a `Element`, `false` otherwise.
*/
function isTag(node) {
	return isTag$1(node);
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `CDATA`, `false` otherwise.
*/
function isCDATA(node) {
	return node.type === ElementType.CDATA;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `Text`, `false` otherwise.
*/
function isText(node) {
	return node.type === ElementType.Text;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `Comment`, `false` otherwise.
*/
function isComment(node) {
	return node.type === ElementType.Comment;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
*/
function isDirective(node) {
	return node.type === ElementType.Directive;
}
/**
* @param node Node to check.
* @returns `true` if the node has the type `ProcessingInstruction`, `false` otherwise.
*/
function isDocument(node) {
	return node.type === ElementType.Root;
}
/**
* @param node Node to check.
* @returns `true` if the node has children, `false` otherwise.
*/
function hasChildren(node) {
	return Object.prototype.hasOwnProperty.call(node, "children");
}
/**
* Clone a node, and optionally its children.
*
* @param recursive Clone child nodes as well.
* @returns A clone of the node.
*/
function cloneNode(node, recursive = false) {
	let result;
	if (isText(node)) result = new Text(node.data);
	else if (isComment(node)) result = new Comment(node.data);
	else if (isTag(node)) {
		const children = recursive ? cloneChildren(node.children) : [];
		const clone = new Element(node.name, { ...node.attribs }, children);
		children.forEach((child) => child.parent = clone);
		if (node.namespace != null) clone.namespace = node.namespace;
		if (node["x-attribsNamespace"]) clone["x-attribsNamespace"] = { ...node["x-attribsNamespace"] };
		if (node["x-attribsPrefix"]) clone["x-attribsPrefix"] = { ...node["x-attribsPrefix"] };
		result = clone;
	} else if (isCDATA(node)) {
		const children = recursive ? cloneChildren(node.children) : [];
		const clone = new CDATA(children);
		children.forEach((child) => child.parent = clone);
		result = clone;
	} else if (isDocument(node)) {
		const children = recursive ? cloneChildren(node.children) : [];
		const clone = new Document(children);
		children.forEach((child) => child.parent = clone);
		if (node["x-mode"]) clone["x-mode"] = node["x-mode"];
		result = clone;
	} else if (isDirective(node)) {
		const instruction = new ProcessingInstruction(node.name, node.data);
		if (node["x-name"] != null) {
			instruction["x-name"] = node["x-name"];
			instruction["x-publicId"] = node["x-publicId"];
			instruction["x-systemId"] = node["x-systemId"];
		}
		result = instruction;
	} else throw new Error(`Not implemented yet: ${node.type}`);
	result.startIndex = node.startIndex;
	result.endIndex = node.endIndex;
	if (node.sourceCodeLocation != null) result.sourceCodeLocation = node.sourceCodeLocation;
	return result;
}
function cloneChildren(childs) {
	const children = childs.map((child) => cloneNode(child, true));
	for (let i = 1; i < children.length; i++) {
		children[i].prev = children[i - 1];
		children[i - 1].next = children[i];
	}
	return children;
}
var defaultOpts = {
	withStartIndices: false,
	withEndIndices: false,
	xmlMode: false
};
var DomHandler = class {
	/**
	* @param callback Called once parsing has completed.
	* @param options Settings for the handler.
	* @param elementCB Callback whenever a tag is closed.
	*/
	constructor(callback, options, elementCB) {
		/** The elements of the DOM */
		this.dom = [];
		/** The root element for the DOM */
		this.root = new Document(this.dom);
		/** Indicated whether parsing has been completed. */
		this.done = false;
		/** Stack of open tags. */
		this.tagStack = [this.root];
		/** A data node that is still being written to. */
		this.lastNode = null;
		/** Reference to the parser instance. Used for location information. */
		this.parser = null;
		if (typeof options === "function") {
			elementCB = options;
			options = defaultOpts;
		}
		if (typeof callback === "object") {
			options = callback;
			callback = void 0;
		}
		this.callback = callback !== null && callback !== void 0 ? callback : null;
		this.options = options !== null && options !== void 0 ? options : defaultOpts;
		this.elementCB = elementCB !== null && elementCB !== void 0 ? elementCB : null;
	}
	onparserinit(parser) {
		this.parser = parser;
	}
	onreset() {
		this.dom = [];
		this.root = new Document(this.dom);
		this.done = false;
		this.tagStack = [this.root];
		this.lastNode = null;
		this.parser = null;
	}
	onend() {
		if (this.done) return;
		this.done = true;
		this.parser = null;
		this.handleCallback(null);
	}
	onerror(error) {
		this.handleCallback(error);
	}
	onclosetag() {
		this.lastNode = null;
		const elem = this.tagStack.pop();
		if (this.options.withEndIndices) elem.endIndex = this.parser.endIndex;
		if (this.elementCB) this.elementCB(elem);
	}
	onopentag(name, attribs) {
		const element = new Element(name, attribs, void 0, this.options.xmlMode ? ElementType.Tag : void 0);
		this.addNode(element);
		this.tagStack.push(element);
	}
	ontext(data) {
		const { lastNode } = this;
		if (lastNode && lastNode.type === ElementType.Text) {
			lastNode.data += data;
			if (this.options.withEndIndices) lastNode.endIndex = this.parser.endIndex;
		} else {
			const node = new Text(data);
			this.addNode(node);
			this.lastNode = node;
		}
	}
	oncomment(data) {
		if (this.lastNode && this.lastNode.type === ElementType.Comment) {
			this.lastNode.data += data;
			return;
		}
		const node = new Comment(data);
		this.addNode(node);
		this.lastNode = node;
	}
	oncommentend() {
		this.lastNode = null;
	}
	oncdatastart() {
		const text = new Text("");
		const node = new CDATA([text]);
		this.addNode(node);
		text.parent = node;
		this.lastNode = text;
	}
	oncdataend() {
		this.lastNode = null;
	}
	onprocessinginstruction(name, data) {
		const node = new ProcessingInstruction(name, data);
		this.addNode(node);
	}
	handleCallback(error) {
		if (typeof this.callback === "function") this.callback(error, this.dom);
		else if (error) throw error;
	}
	addNode(node) {
		const parent = this.tagStack[this.tagStack.length - 1];
		const previousSibling = parent.children[parent.children.length - 1];
		if (this.options.withStartIndices) node.startIndex = this.parser.startIndex;
		if (this.options.withEndIndices) node.endIndex = this.parser.endIndex;
		parent.children.push(node);
		if (previousSibling) {
			node.prev = previousSibling;
			previousSibling.next = node;
		}
		node.parent = parent;
		this.lastNode = null;
	}
};
var xmlReplacer = /["&'<>$\x80-\uFFFF]/g;
var xmlCodeMap = /* @__PURE__ */ new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[39, "&apos;"],
	[60, "&lt;"],
	[62, "&gt;"]
]);
var getCodePoint = String.prototype.codePointAt != null ? (str, index) => str.codePointAt(index) : (c, index) => (c.charCodeAt(index) & 64512) === 55296 ? (c.charCodeAt(index) - 55296) * 1024 + c.charCodeAt(index + 1) - 56320 + 65536 : c.charCodeAt(index);
/**
* Encodes all non-ASCII characters, as well as characters not valid in XML
* documents using XML entities.
*
* If a character has no equivalent entity, a
* numeric hexadecimal reference (eg. `&#xfc;`) will be used.
*/
function encodeXML(str) {
	let ret = "";
	let lastIdx = 0;
	let match;
	while ((match = xmlReplacer.exec(str)) !== null) {
		const i = match.index;
		const char = str.charCodeAt(i);
		const next = xmlCodeMap.get(char);
		if (next !== void 0) {
			ret += str.substring(lastIdx, i) + next;
			lastIdx = i + 1;
		} else {
			ret += `${str.substring(lastIdx, i)}&#x${getCodePoint(str, i).toString(16)};`;
			lastIdx = xmlReplacer.lastIndex += Number((char & 64512) === 55296);
		}
	}
	return ret + str.substr(lastIdx);
}
/**
* Creates a function that escapes all characters matched by the given regular
* expression using the given map of characters to escape to their entities.
*
* @param regex Regular expression to match characters to escape.
* @param map Map of characters to escape to their entities.
*
* @returns Function that escapes all characters matched by the given regular
* expression using the given map of characters to escape to their entities.
*/
function getEscaper(regex, map) {
	return function escape(data) {
		let match;
		let lastIdx = 0;
		let result = "";
		while (match = regex.exec(data)) {
			if (lastIdx !== match.index) result += data.substring(lastIdx, match.index);
			result += map.get(match[0].charCodeAt(0));
			lastIdx = match.index + 1;
		}
		return result + data.substring(lastIdx);
	};
}
/**
* Encodes all characters that have to be escaped in HTML attributes,
* following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
*
* @param data String to escape.
*/
var escapeAttribute = getEscaper(/["&\u00A0]/g, /* @__PURE__ */ new Map([
	[34, "&quot;"],
	[38, "&amp;"],
	[160, "&nbsp;"]
]));
/**
* Encodes all characters that have to be escaped in HTML text,
* following {@link https://html.spec.whatwg.org/multipage/parsing.html#escapingString}.
*
* @param data String to escape.
*/
var escapeText = getEscaper(/[&<>\u00A0]/g, /* @__PURE__ */ new Map([
	[38, "&amp;"],
	[60, "&lt;"],
	[62, "&gt;"],
	[160, "&nbsp;"]
]));
var elementNames = new Map([
	"altGlyph",
	"altGlyphDef",
	"altGlyphItem",
	"animateColor",
	"animateMotion",
	"animateTransform",
	"clipPath",
	"feBlend",
	"feColorMatrix",
	"feComponentTransfer",
	"feComposite",
	"feConvolveMatrix",
	"feDiffuseLighting",
	"feDisplacementMap",
	"feDistantLight",
	"feDropShadow",
	"feFlood",
	"feFuncA",
	"feFuncB",
	"feFuncG",
	"feFuncR",
	"feGaussianBlur",
	"feImage",
	"feMerge",
	"feMergeNode",
	"feMorphology",
	"feOffset",
	"fePointLight",
	"feSpecularLighting",
	"feSpotLight",
	"feTile",
	"feTurbulence",
	"foreignObject",
	"glyphRef",
	"linearGradient",
	"radialGradient",
	"textPath"
].map((val) => [val.toLowerCase(), val]));
var attributeNames = new Map([
	"definitionURL",
	"attributeName",
	"attributeType",
	"baseFrequency",
	"baseProfile",
	"calcMode",
	"clipPathUnits",
	"diffuseConstant",
	"edgeMode",
	"filterUnits",
	"glyphRef",
	"gradientTransform",
	"gradientUnits",
	"kernelMatrix",
	"kernelUnitLength",
	"keyPoints",
	"keySplines",
	"keyTimes",
	"lengthAdjust",
	"limitingConeAngle",
	"markerHeight",
	"markerUnits",
	"markerWidth",
	"maskContentUnits",
	"maskUnits",
	"numOctaves",
	"pathLength",
	"patternContentUnits",
	"patternTransform",
	"patternUnits",
	"pointsAtX",
	"pointsAtY",
	"pointsAtZ",
	"preserveAlpha",
	"preserveAspectRatio",
	"primitiveUnits",
	"refX",
	"refY",
	"repeatCount",
	"repeatDur",
	"requiredExtensions",
	"requiredFeatures",
	"specularConstant",
	"specularExponent",
	"spreadMethod",
	"startOffset",
	"stdDeviation",
	"stitchTiles",
	"surfaceScale",
	"systemLanguage",
	"tableValues",
	"targetX",
	"targetY",
	"textLength",
	"viewBox",
	"viewTarget",
	"xChannelSelector",
	"yChannelSelector",
	"zoomAndPan"
].map((val) => [val.toLowerCase(), val]));
var unencodedElements = /* @__PURE__ */ new Set([
	"style",
	"script",
	"xmp",
	"iframe",
	"noembed",
	"noframes",
	"plaintext",
	"noscript"
]);
function replaceQuotes(value) {
	return value.replace(/"/g, "&quot;");
}
/**
* Format attributes
*/
function formatAttributes(attributes, opts) {
	var _a;
	if (!attributes) return;
	const encode = ((_a = opts.encodeEntities) !== null && _a !== void 0 ? _a : opts.decodeEntities) === false ? replaceQuotes : opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML : escapeAttribute;
	return Object.keys(attributes).map((key) => {
		var _a, _b;
		const value = (_a = attributes[key]) !== null && _a !== void 0 ? _a : "";
		if (opts.xmlMode === "foreign") key = (_b = attributeNames.get(key)) !== null && _b !== void 0 ? _b : key;
		if (!opts.emptyAttrs && !opts.xmlMode && value === "") return key;
		return `${key}="${encode(value)}"`;
	}).join(" ");
}
/**
* Self-enclosing tags
*/
var singleTag = /* @__PURE__ */ new Set([
	"area",
	"base",
	"basefont",
	"br",
	"col",
	"command",
	"embed",
	"frame",
	"hr",
	"img",
	"input",
	"isindex",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
/**
* Renders a DOM node or an array of DOM nodes to a string.
*
* Can be thought of as the equivalent of the `outerHTML` of the passed node(s).
*
* @param node Node to be rendered.
* @param options Changes serialization behavior
*/
function render(node, options = {}) {
	const nodes = "length" in node ? node : [node];
	let output = "";
	for (let i = 0; i < nodes.length; i++) output += renderNode(nodes[i], options);
	return output;
}
function renderNode(node, options) {
	switch (node.type) {
		case Root: return render(node.children, options);
		case Doctype:
		case Directive: return renderDirective(node);
		case Comment$1: return renderComment(node);
		case CDATA$1: return renderCdata(node);
		case Script:
		case Style:
		case Tag: return renderTag(node, options);
		case Text$1: return renderText(node, options);
	}
}
var foreignModeIntegrationPoints = /* @__PURE__ */ new Set([
	"mi",
	"mo",
	"mn",
	"ms",
	"mtext",
	"annotation-xml",
	"foreignObject",
	"desc",
	"title"
]);
var foreignElements = /* @__PURE__ */ new Set(["svg", "math"]);
function renderTag(elem, opts) {
	var _a;
	if (opts.xmlMode === "foreign") {
		elem.name = (_a = elementNames.get(elem.name)) !== null && _a !== void 0 ? _a : elem.name;
		if (elem.parent && foreignModeIntegrationPoints.has(elem.parent.name)) opts = {
			...opts,
			xmlMode: false
		};
	}
	if (!opts.xmlMode && foreignElements.has(elem.name)) opts = {
		...opts,
		xmlMode: "foreign"
	};
	let tag = `<${elem.name}`;
	const attribs = formatAttributes(elem.attribs, opts);
	if (attribs) tag += ` ${attribs}`;
	if (elem.children.length === 0 && (opts.xmlMode ? opts.selfClosingTags !== false : opts.selfClosingTags && singleTag.has(elem.name))) {
		if (!opts.xmlMode) tag += " ";
		tag += "/>";
	} else {
		tag += ">";
		if (elem.children.length > 0) tag += render(elem.children, opts);
		if (opts.xmlMode || !singleTag.has(elem.name)) tag += `</${elem.name}>`;
	}
	return tag;
}
function renderDirective(elem) {
	return `<${elem.data}>`;
}
function renderText(elem, opts) {
	var _a;
	let data = elem.data || "";
	if (((_a = opts.encodeEntities) !== null && _a !== void 0 ? _a : opts.decodeEntities) !== false && !(!opts.xmlMode && elem.parent && unencodedElements.has(elem.parent.name))) data = opts.xmlMode || opts.encodeEntities !== "utf8" ? encodeXML(data) : escapeText(data);
	return data;
}
function renderCdata(elem) {
	return `<![CDATA[${elem.children[0].data}]]>`;
}
function renderComment(elem) {
	return `<!--${elem.data}-->`;
}
/**
* @category Stringify
* @deprecated Use the `dom-serializer` module directly.
* @param node Node to get the outer HTML of.
* @param options Options for serialization.
* @returns `node`'s outer HTML.
*/
function getOuterHTML(node, options) {
	return render(node, options);
}
/**
* @category Stringify
* @deprecated Use the `dom-serializer` module directly.
* @param node Node to get the inner HTML of.
* @param options Options for serialization.
* @returns `node`'s inner HTML.
*/
function getInnerHTML(node, options) {
	return hasChildren(node) ? node.children.map((node) => getOuterHTML(node, options)).join("") : "";
}
/**
* Get a node's inner text. Same as `textContent`, but inserts newlines for `<br>` tags. Ignores comments.
*
* @category Stringify
* @deprecated Use `textContent` instead.
* @param node Node to get the inner text of.
* @returns `node`'s inner text.
*/
function getText(node) {
	if (Array.isArray(node)) return node.map(getText).join("");
	if (isTag(node)) return node.name === "br" ? "\n" : getText(node.children);
	if (isCDATA(node)) return getText(node.children);
	if (isText(node)) return node.data;
	return "";
}
/**
* Get a node's text content. Ignores comments.
*
* @category Stringify
* @param node Node to get the text content of.
* @returns `node`'s text content.
* @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent}
*/
function textContent(node) {
	if (Array.isArray(node)) return node.map(textContent).join("");
	if (hasChildren(node) && !isComment(node)) return textContent(node.children);
	if (isText(node)) return node.data;
	return "";
}
/**
* Get a node's inner text, ignoring `<script>` and `<style>` tags. Ignores comments.
*
* @category Stringify
* @param node Node to get the inner text of.
* @returns `node`'s inner text.
* @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Node/innerText}
*/
function innerText(node) {
	if (Array.isArray(node)) return node.map(innerText).join("");
	if (hasChildren(node) && (node.type === ElementType.Tag || isCDATA(node))) return innerText(node.children);
	if (isText(node)) return node.data;
	return "";
}
/**
* Get a node's children.
*
* @category Traversal
* @param elem Node to get the children of.
* @returns `elem`'s children, or an empty array.
*/
function getChildren(elem) {
	return hasChildren(elem) ? elem.children : [];
}
/**
* Get a node's parent.
*
* @category Traversal
* @param elem Node to get the parent of.
* @returns `elem`'s parent node, or `null` if `elem` is a root node.
*/
function getParent(elem) {
	return elem.parent || null;
}
/**
* Gets an elements siblings, including the element itself.
*
* Attempts to get the children through the element's parent first. If we don't
* have a parent (the element is a root node), we walk the element's `prev` &
* `next` to get all remaining nodes.
*
* @category Traversal
* @param elem Element to get the siblings of.
* @returns `elem`'s siblings, including `elem`.
*/
function getSiblings(elem) {
	const parent = getParent(elem);
	if (parent != null) return getChildren(parent);
	const siblings = [elem];
	let { prev, next } = elem;
	while (prev != null) {
		siblings.unshift(prev);
		({prev} = prev);
	}
	while (next != null) {
		siblings.push(next);
		({next} = next);
	}
	return siblings;
}
/**
* Gets an attribute from an element.
*
* @category Traversal
* @param elem Element to check.
* @param name Attribute name to retrieve.
* @returns The element's attribute value, or `undefined`.
*/
function getAttributeValue(elem, name) {
	var _a;
	return (_a = elem.attribs) === null || _a === void 0 ? void 0 : _a[name];
}
/**
* Checks whether an element has an attribute.
*
* @category Traversal
* @param elem Element to check.
* @param name Attribute name to look for.
* @returns Returns whether `elem` has the attribute `name`.
*/
function hasAttrib(elem, name) {
	return elem.attribs != null && Object.prototype.hasOwnProperty.call(elem.attribs, name) && elem.attribs[name] != null;
}
/**
* Get the tag name of an element.
*
* @category Traversal
* @param elem The element to get the name for.
* @returns The tag name of `elem`.
*/
function getName(elem) {
	return elem.name;
}
/**
* Returns the next element sibling of a node.
*
* @category Traversal
* @param elem The element to get the next sibling of.
* @returns `elem`'s next sibling that is a tag, or `null` if there is no next
* sibling.
*/
function nextElementSibling(elem) {
	let { next } = elem;
	while (next !== null && !isTag(next)) ({next} = next);
	return next;
}
/**
* Returns the previous element sibling of a node.
*
* @category Traversal
* @param elem The element to get the previous sibling of.
* @returns `elem`'s previous sibling that is a tag, or `null` if there is no
* previous sibling.
*/
function prevElementSibling(elem) {
	let { prev } = elem;
	while (prev !== null && !isTag(prev)) ({prev} = prev);
	return prev;
}
/**
* Remove an element from the dom
*
* @category Manipulation
* @param elem The element to be removed
*/
function removeElement(elem) {
	if (elem.prev) elem.prev.next = elem.next;
	if (elem.next) elem.next.prev = elem.prev;
	if (elem.parent) {
		const childs = elem.parent.children;
		const childsIndex = childs.lastIndexOf(elem);
		if (childsIndex >= 0) childs.splice(childsIndex, 1);
	}
	elem.next = null;
	elem.prev = null;
	elem.parent = null;
}
/**
* Replace an element in the dom
*
* @category Manipulation
* @param elem The element to be replaced
* @param replacement The element to be added
*/
function replaceElement(elem, replacement) {
	const prev = replacement.prev = elem.prev;
	if (prev) prev.next = replacement;
	const next = replacement.next = elem.next;
	if (next) next.prev = replacement;
	const parent = replacement.parent = elem.parent;
	if (parent) {
		const childs = parent.children;
		childs[childs.lastIndexOf(elem)] = replacement;
		elem.parent = null;
	}
}
/**
* Append a child to an element.
*
* @category Manipulation
* @param parent The element to append to.
* @param child The element to be added as a child.
*/
function appendChild(parent, child) {
	removeElement(child);
	child.next = null;
	child.parent = parent;
	if (parent.children.push(child) > 1) {
		const sibling = parent.children[parent.children.length - 2];
		sibling.next = child;
		child.prev = sibling;
	} else child.prev = null;
}
/**
* Append an element after another.
*
* @category Manipulation
* @param elem The element to append after.
* @param next The element be added.
*/
function append(elem, next) {
	removeElement(next);
	const { parent } = elem;
	const currNext = elem.next;
	next.next = currNext;
	next.prev = elem;
	elem.next = next;
	next.parent = parent;
	if (currNext) {
		currNext.prev = next;
		if (parent) {
			const childs = parent.children;
			childs.splice(childs.lastIndexOf(currNext), 0, next);
		}
	} else if (parent) parent.children.push(next);
}
/**
* Prepend a child to an element.
*
* @category Manipulation
* @param parent The element to prepend before.
* @param child The element to be added as a child.
*/
function prependChild(parent, child) {
	removeElement(child);
	child.parent = parent;
	child.prev = null;
	if (parent.children.unshift(child) !== 1) {
		const sibling = parent.children[1];
		sibling.prev = child;
		child.next = sibling;
	} else child.next = null;
}
/**
* Prepend an element before another.
*
* @category Manipulation
* @param elem The element to prepend before.
* @param prev The element be added.
*/
function prepend(elem, prev) {
	removeElement(prev);
	const { parent } = elem;
	if (parent) {
		const childs = parent.children;
		childs.splice(childs.indexOf(elem), 0, prev);
	}
	if (elem.prev) elem.prev.next = prev;
	prev.parent = parent;
	prev.prev = elem.prev;
	prev.next = elem;
	elem.prev = prev;
}
/**
* Search a node and its children for nodes passing a test function. If `node` is not an array, it will be wrapped in one.
*
* @category Querying
* @param test Function to test nodes on.
* @param node Node to search. Will be included in the result set if it matches.
* @param recurse Also consider child nodes.
* @param limit Maximum number of nodes to return.
* @returns All nodes passing `test`.
*/
function filter(test, node, recurse = true, limit = Infinity) {
	return find(test, Array.isArray(node) ? node : [node], recurse, limit);
}
/**
* Search an array of nodes and their children for nodes passing a test function.
*
* @category Querying
* @param test Function to test nodes on.
* @param nodes Array of nodes to search.
* @param recurse Also consider child nodes.
* @param limit Maximum number of nodes to return.
* @returns All nodes passing `test`.
*/
function find(test, nodes, recurse, limit) {
	const result = [];
	/** Stack of the arrays we are looking at. */
	const nodeStack = [Array.isArray(nodes) ? nodes : [nodes]];
	/** Stack of the indices within the arrays. */
	const indexStack = [0];
	for (;;) {
		if (indexStack[0] >= nodeStack[0].length) {
			if (indexStack.length === 1) return result;
			nodeStack.shift();
			indexStack.shift();
			continue;
		}
		const elem = nodeStack[0][indexStack[0]++];
		if (test(elem)) {
			result.push(elem);
			if (--limit <= 0) return result;
		}
		if (recurse && hasChildren(elem) && elem.children.length > 0) {
			indexStack.unshift(0);
			nodeStack.unshift(elem.children);
		}
	}
}
/**
* Finds the first element inside of an array that matches a test function. This is an alias for `Array.prototype.find`.
*
* @category Querying
* @param test Function to test nodes on.
* @param nodes Array of nodes to search.
* @returns The first node in the array that passes `test`.
* @deprecated Use `Array.prototype.find` directly.
*/
function findOneChild(test, nodes) {
	return nodes.find(test);
}
/**
* Finds one element in a tree that passes a test.
*
* @category Querying
* @param test Function to test nodes on.
* @param nodes Node or array of nodes to search.
* @param recurse Also consider child nodes.
* @returns The first node that passes `test`.
*/
function findOne$1(test, nodes, recurse = true) {
	const searchedNodes = Array.isArray(nodes) ? nodes : [nodes];
	for (let i = 0; i < searchedNodes.length; i++) {
		const node = searchedNodes[i];
		if (isTag(node) && test(node)) return node;
		if (recurse && hasChildren(node) && node.children.length > 0) {
			const found = findOne$1(test, node.children, true);
			if (found) return found;
		}
	}
	return null;
}
/**
* Checks if a tree of nodes contains at least one node passing a test.
*
* @category Querying
* @param test Function to test nodes on.
* @param nodes Array of nodes to search.
* @returns Whether a tree of nodes contains at least one node passing the test.
*/
function existsOne(test, nodes) {
	return (Array.isArray(nodes) ? nodes : [nodes]).some((node) => isTag(node) && test(node) || hasChildren(node) && existsOne(test, node.children));
}
/**
* Search an array of nodes and their children for elements passing a test function.
*
* Same as `find`, but limited to elements and with less options, leading to reduced complexity.
*
* @category Querying
* @param test Function to test nodes on.
* @param nodes Array of nodes to search.
* @returns All nodes passing `test`.
*/
function findAll$1(test, nodes) {
	const result = [];
	const nodeStack = [Array.isArray(nodes) ? nodes : [nodes]];
	const indexStack = [0];
	for (;;) {
		if (indexStack[0] >= nodeStack[0].length) {
			if (nodeStack.length === 1) return result;
			nodeStack.shift();
			indexStack.shift();
			continue;
		}
		const elem = nodeStack[0][indexStack[0]++];
		if (isTag(elem) && test(elem)) result.push(elem);
		if (hasChildren(elem) && elem.children.length > 0) {
			indexStack.unshift(0);
			nodeStack.unshift(elem.children);
		}
	}
}
/**
* A map of functions to check nodes against.
*/
var Checks = {
	tag_name(name) {
		if (typeof name === "function") return (elem) => isTag(elem) && name(elem.name);
		else if (name === "*") return isTag;
		return (elem) => isTag(elem) && elem.name === name;
	},
	tag_type(type) {
		if (typeof type === "function") return (elem) => type(elem.type);
		return (elem) => elem.type === type;
	},
	tag_contains(data) {
		if (typeof data === "function") return (elem) => isText(elem) && data(elem.data);
		return (elem) => isText(elem) && elem.data === data;
	}
};
/**
* Returns a function to check whether a node has an attribute with a particular
* value.
*
* @param attrib Attribute to check.
* @param value Attribute value to look for.
* @returns A function to check whether the a node has an attribute with a
*   particular value.
*/
function getAttribCheck(attrib, value) {
	if (typeof value === "function") return (elem) => isTag(elem) && value(elem.attribs[attrib]);
	return (elem) => isTag(elem) && elem.attribs[attrib] === value;
}
/**
* Returns a function that returns `true` if either of the input functions
* returns `true` for a node.
*
* @param a First function to combine.
* @param b Second function to combine.
* @returns A function taking a node and returning `true` if either of the input
*   functions returns `true` for the node.
*/
function combineFuncs(a, b) {
	return (elem) => a(elem) || b(elem);
}
/**
* Returns a function that executes all checks in `options` and returns `true`
* if any of them match a node.
*
* @param options An object describing nodes to look for.
* @returns A function that executes all checks in `options` and returns `true`
*   if any of them match a node.
*/
function compileTest(options) {
	const funcs = Object.keys(options).map((key) => {
		const value = options[key];
		return Object.prototype.hasOwnProperty.call(Checks, key) ? Checks[key](value) : getAttribCheck(key, value);
	});
	return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
}
/**
* Checks whether a node matches the description in `options`.
*
* @category Legacy Query Functions
* @param options An object describing nodes to look for.
* @param node The element to test.
* @returns Whether the element matches the description in `options`.
*/
function testElement(options, node) {
	const test = compileTest(options);
	return test ? test(node) : true;
}
/**
* Returns all nodes that match `options`.
*
* @category Legacy Query Functions
* @param options An object describing nodes to look for.
* @param nodes Nodes to search through.
* @param recurse Also consider child nodes.
* @param limit Maximum number of nodes to return.
* @returns All nodes that match `options`.
*/
function getElements(options, nodes, recurse, limit = Infinity) {
	const test = compileTest(options);
	return test ? filter(test, nodes, recurse, limit) : [];
}
/**
* Returns the node with the supplied ID.
*
* @category Legacy Query Functions
* @param id The unique ID attribute value to look for.
* @param nodes Nodes to search through.
* @param recurse Also consider child nodes.
* @returns The node with the supplied ID.
*/
function getElementById(id, nodes, recurse = true) {
	if (!Array.isArray(nodes)) nodes = [nodes];
	return findOne$1(getAttribCheck("id", id), nodes, recurse);
}
/**
* Returns all nodes with the supplied `tagName`.
*
* @category Legacy Query Functions
* @param tagName Tag name to search for.
* @param nodes Nodes to search through.
* @param recurse Also consider child nodes.
* @param limit Maximum number of nodes to return.
* @returns All nodes with the supplied `tagName`.
*/
function getElementsByTagName(tagName, nodes, recurse = true, limit = Infinity) {
	return filter(Checks["tag_name"](tagName), nodes, recurse, limit);
}
/**
* Returns all nodes with the supplied `className`.
*
* @category Legacy Query Functions
* @param className Class name to search for.
* @param nodes Nodes to search through.
* @param recurse Also consider child nodes.
* @param limit Maximum number of nodes to return.
* @returns All nodes with the supplied `className`.
*/
function getElementsByClassName(className, nodes, recurse = true, limit = Infinity) {
	return filter(getAttribCheck("class", className), nodes, recurse, limit);
}
/**
* Returns all nodes with the supplied `type`.
*
* @category Legacy Query Functions
* @param type Element type to look for.
* @param nodes Nodes to search through.
* @param recurse Also consider child nodes.
* @param limit Maximum number of nodes to return.
* @returns All nodes with the supplied `type`.
*/
function getElementsByTagType(type, nodes, recurse = true, limit = Infinity) {
	return filter(Checks["tag_type"](type), nodes, recurse, limit);
}
/**
* Given an array of nodes, remove any member that is contained by another
* member.
*
* @category Helpers
* @param nodes Nodes to filter.
* @returns Remaining nodes that aren't contained by other nodes.
*/
function removeSubsets(nodes) {
	let idx = nodes.length;
	while (--idx >= 0) {
		const node = nodes[idx];
		if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
			nodes.splice(idx, 1);
			continue;
		}
		for (let ancestor = node.parent; ancestor; ancestor = ancestor.parent) if (nodes.includes(ancestor)) {
			nodes.splice(idx, 1);
			break;
		}
	}
	return nodes;
}
/**
* @category Helpers
* @see {@link http://dom.spec.whatwg.org/#dom-node-comparedocumentposition}
*/
var DocumentPosition;
(function(DocumentPosition) {
	DocumentPosition[DocumentPosition["DISCONNECTED"] = 1] = "DISCONNECTED";
	DocumentPosition[DocumentPosition["PRECEDING"] = 2] = "PRECEDING";
	DocumentPosition[DocumentPosition["FOLLOWING"] = 4] = "FOLLOWING";
	DocumentPosition[DocumentPosition["CONTAINS"] = 8] = "CONTAINS";
	DocumentPosition[DocumentPosition["CONTAINED_BY"] = 16] = "CONTAINED_BY";
})(DocumentPosition || (DocumentPosition = {}));
/**
* Compare the position of one node against another node in any other document,
* returning a bitmask with the values from {@link DocumentPosition}.
*
* Document order:
* > There is an ordering, document order, defined on all the nodes in the
* > document corresponding to the order in which the first character of the
* > XML representation of each node occurs in the XML representation of the
* > document after expansion of general entities. Thus, the document element
* > node will be the first node. Element nodes occur before their children.
* > Thus, document order orders element nodes in order of the occurrence of
* > their start-tag in the XML (after expansion of entities). The attribute
* > nodes of an element occur after the element and before its children. The
* > relative order of attribute nodes is implementation-dependent.
*
* Source:
* http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
*
* @category Helpers
* @param nodeA The first node to use in the comparison
* @param nodeB The second node to use in the comparison
* @returns A bitmask describing the input nodes' relative position.
*
* See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
* a description of these values.
*/
function compareDocumentPosition(nodeA, nodeB) {
	const aParents = [];
	const bParents = [];
	if (nodeA === nodeB) return 0;
	let current = hasChildren(nodeA) ? nodeA : nodeA.parent;
	while (current) {
		aParents.unshift(current);
		current = current.parent;
	}
	current = hasChildren(nodeB) ? nodeB : nodeB.parent;
	while (current) {
		bParents.unshift(current);
		current = current.parent;
	}
	const maxIdx = Math.min(aParents.length, bParents.length);
	let idx = 0;
	while (idx < maxIdx && aParents[idx] === bParents[idx]) idx++;
	if (idx === 0) return DocumentPosition.DISCONNECTED;
	const sharedParent = aParents[idx - 1];
	const siblings = sharedParent.children;
	const aSibling = aParents[idx];
	const bSibling = bParents[idx];
	if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
		if (sharedParent === nodeB) return DocumentPosition.FOLLOWING | DocumentPosition.CONTAINED_BY;
		return DocumentPosition.FOLLOWING;
	}
	if (sharedParent === nodeA) return DocumentPosition.PRECEDING | DocumentPosition.CONTAINS;
	return DocumentPosition.PRECEDING;
}
/**
* Sort an array of nodes based on their relative position in the document,
* removing any duplicate nodes. If the array contains nodes that do not belong
* to the same document, sort order is unspecified.
*
* @category Helpers
* @param nodes Array of DOM nodes.
* @returns Collection of unique nodes, sorted in document order.
*/
function uniqueSort(nodes) {
	nodes = nodes.filter((node, i, arr) => !arr.includes(node, i + 1));
	nodes.sort((a, b) => {
		const relative = compareDocumentPosition(a, b);
		if (relative & DocumentPosition.PRECEDING) return -1;
		else if (relative & DocumentPosition.FOLLOWING) return 1;
		return 0;
	});
	return nodes;
}
/**
* Get the feed object from the root of a DOM tree.
*
* @category Feeds
* @param doc - The DOM to to extract the feed from.
* @returns The feed.
*/
function getFeed(doc) {
	const feedRoot = getOneElement(isValidFeed, doc);
	return !feedRoot ? null : feedRoot.name === "feed" ? getAtomFeed(feedRoot) : getRssFeed(feedRoot);
}
/**
* Parse an Atom feed.
*
* @param feedRoot The root of the feed.
* @returns The parsed feed.
*/
function getAtomFeed(feedRoot) {
	var _a;
	const childs = feedRoot.children;
	const feed = {
		type: "atom",
		items: getElementsByTagName("entry", childs).map((item) => {
			var _a;
			const { children } = item;
			const entry = { media: getMediaElements(children) };
			addConditionally(entry, "id", "id", children);
			addConditionally(entry, "title", "title", children);
			const href = (_a = getOneElement("link", children)) === null || _a === void 0 ? void 0 : _a.attribs["href"];
			if (href) entry.link = href;
			const description = fetch$1("summary", children) || fetch$1("content", children);
			if (description) entry.description = description;
			const pubDate = fetch$1("updated", children);
			if (pubDate) entry.pubDate = new Date(pubDate);
			return entry;
		})
	};
	addConditionally(feed, "id", "id", childs);
	addConditionally(feed, "title", "title", childs);
	const href = (_a = getOneElement("link", childs)) === null || _a === void 0 ? void 0 : _a.attribs["href"];
	if (href) feed.link = href;
	addConditionally(feed, "description", "subtitle", childs);
	const updated = fetch$1("updated", childs);
	if (updated) feed.updated = new Date(updated);
	addConditionally(feed, "author", "email", childs, true);
	return feed;
}
/**
* Parse a RSS feed.
*
* @param feedRoot The root of the feed.
* @returns The parsed feed.
*/
function getRssFeed(feedRoot) {
	var _a, _b;
	const childs = (_b = (_a = getOneElement("channel", feedRoot.children)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : [];
	const feed = {
		type: feedRoot.name.substr(0, 3),
		id: "",
		items: getElementsByTagName("item", feedRoot.children).map((item) => {
			const { children } = item;
			const entry = { media: getMediaElements(children) };
			addConditionally(entry, "id", "guid", children);
			addConditionally(entry, "title", "title", children);
			addConditionally(entry, "link", "link", children);
			addConditionally(entry, "description", "description", children);
			const pubDate = fetch$1("pubDate", children) || fetch$1("dc:date", children);
			if (pubDate) entry.pubDate = new Date(pubDate);
			return entry;
		})
	};
	addConditionally(feed, "title", "title", childs);
	addConditionally(feed, "link", "link", childs);
	addConditionally(feed, "description", "description", childs);
	const updated = fetch$1("lastBuildDate", childs);
	if (updated) feed.updated = new Date(updated);
	addConditionally(feed, "author", "managingEditor", childs, true);
	return feed;
}
var MEDIA_KEYS_STRING = [
	"url",
	"type",
	"lang"
];
var MEDIA_KEYS_INT = [
	"fileSize",
	"bitrate",
	"framerate",
	"samplingrate",
	"channels",
	"duration",
	"height",
	"width"
];
/**
* Get all media elements of a feed item.
*
* @param where Nodes to search in.
* @returns Media elements.
*/
function getMediaElements(where) {
	return getElementsByTagName("media:content", where).map((elem) => {
		const { attribs } = elem;
		const media = {
			medium: attribs["medium"],
			isDefault: !!attribs["isDefault"]
		};
		for (const attrib of MEDIA_KEYS_STRING) if (attribs[attrib]) media[attrib] = attribs[attrib];
		for (const attrib of MEDIA_KEYS_INT) if (attribs[attrib]) media[attrib] = parseInt(attribs[attrib], 10);
		if (attribs["expression"]) media.expression = attribs["expression"];
		return media;
	});
}
/**
* Get one element by tag name.
*
* @param tagName Tag name to look for
* @param node Node to search in
* @returns The element or null
*/
function getOneElement(tagName, node) {
	return getElementsByTagName(tagName, node, true, 1)[0];
}
/**
* Get the text content of an element with a certain tag name.
*
* @param tagName Tag name to look for.
* @param where Node to search in.
* @param recurse Whether to recurse into child nodes.
* @returns The text content of the element.
*/
function fetch$1(tagName, where, recurse = false) {
	return textContent(getElementsByTagName(tagName, where, recurse, 1)).trim();
}
/**
* Adds a property to an object if it has a value.
*
* @param obj Object to be extended
* @param prop Property name
* @param tagName Tag name that contains the conditionally added property
* @param where Element to search for the property
* @param recurse Whether to recurse into child nodes.
*/
function addConditionally(obj, prop, tagName, where, recurse = false) {
	const val = fetch$1(tagName, where, recurse);
	if (val) obj[prop] = val;
}
/**
* Checks if an element is a feed root node.
*
* @param value The name of the element to check.
* @returns Whether an element is a feed root node.
*/
function isValidFeed(value) {
	return value === "rss" || value === "feed" || value === "rdf:RDF";
}
var DomUtils = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	get DocumentPosition() {
		return DocumentPosition;
	},
	append,
	appendChild,
	compareDocumentPosition,
	existsOne,
	filter,
	find,
	findAll: findAll$1,
	findOne: findOne$1,
	findOneChild,
	getAttributeValue,
	getChildren,
	getElementById,
	getElements,
	getElementsByClassName,
	getElementsByTagName,
	getElementsByTagType,
	getFeed,
	getInnerHTML,
	getName,
	getOuterHTML,
	getParent,
	getSiblings,
	getText,
	hasAttrib,
	hasChildren,
	innerText,
	isCDATA,
	isComment,
	isDocument,
	isTag,
	isText,
	nextElementSibling,
	prepend,
	prependChild,
	prevElementSibling,
	removeElement,
	removeSubsets,
	replaceElement,
	testElement,
	textContent,
	uniqueSort
});
/**
* All reserved characters in a regex, used for escaping.
*
* Taken from XRegExp, (c) 2007-2020 Steven Levithan under the MIT license
* https://github.com/slevithan/xregexp/blob/95eeebeb8fac8754d54eafe2b4743661ac1cf028/src/xregexp.js#L794
*/
var reChars = /[-[\]{}()*+?.,\\^$|#\s]/g;
function escapeRegex(value) {
	return value.replace(reChars, "\\$&");
}
/**
* Attributes that are case-insensitive in HTML.
*
* @private
* @see https://html.spec.whatwg.org/multipage/semantics-other.html#case-sensitivity-of-selectors
*/
var caseInsensitiveAttributes = /* @__PURE__ */ new Set([
	"accept",
	"accept-charset",
	"align",
	"alink",
	"axis",
	"bgcolor",
	"charset",
	"checked",
	"clear",
	"codetype",
	"color",
	"compact",
	"declare",
	"defer",
	"dir",
	"direction",
	"disabled",
	"enctype",
	"face",
	"frame",
	"hreflang",
	"http-equiv",
	"lang",
	"language",
	"link",
	"media",
	"method",
	"multiple",
	"nohref",
	"noresize",
	"noshade",
	"nowrap",
	"readonly",
	"rel",
	"rev",
	"rules",
	"scope",
	"scrolling",
	"selected",
	"shape",
	"target",
	"text",
	"type",
	"valign",
	"valuetype",
	"vlink"
]);
function shouldIgnoreCase(selector, options) {
	return typeof selector.ignoreCase === "boolean" ? selector.ignoreCase : selector.ignoreCase === "quirks" ? !!options.quirksMode : !options.xmlMode && caseInsensitiveAttributes.has(selector.name);
}
/**
* Attribute selectors
*/
var attributeRules = {
	equals(next, data, options) {
		const { adapter } = options;
		const { name } = data;
		let { value } = data;
		if (shouldIgnoreCase(data, options)) {
			value = value.toLowerCase();
			return (elem) => {
				const attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.length === value.length && attr.toLowerCase() === value && next(elem);
			};
		}
		return (elem) => adapter.getAttributeValue(elem, name) === value && next(elem);
	},
	hyphen(next, data, options) {
		const { adapter } = options;
		const { name } = data;
		let { value } = data;
		const len = value.length;
		if (shouldIgnoreCase(data, options)) {
			value = value.toLowerCase();
			return function hyphenIC(elem) {
				const attr = adapter.getAttributeValue(elem, name);
				return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len).toLowerCase() === value && next(elem);
			};
		}
		return function hyphen(elem) {
			const attr = adapter.getAttributeValue(elem, name);
			return attr != null && (attr.length === len || attr.charAt(len) === "-") && attr.substr(0, len) === value && next(elem);
		};
	},
	element(next, data, options) {
		const { adapter } = options;
		const { name, value } = data;
		if (/\s/.test(value)) return boolbaseExports.falseFunc;
		const regex = new RegExp(`(?:^|\\s)${escapeRegex(value)}(?:$|\\s)`, shouldIgnoreCase(data, options) ? "i" : "");
		return function element(elem) {
			const attr = adapter.getAttributeValue(elem, name);
			return attr != null && attr.length >= value.length && regex.test(attr) && next(elem);
		};
	},
	exists(next, { name }, { adapter }) {
		return (elem) => adapter.hasAttrib(elem, name) && next(elem);
	},
	start(next, data, options) {
		const { adapter } = options;
		const { name } = data;
		let { value } = data;
		const len = value.length;
		if (len === 0) return boolbaseExports.falseFunc;
		if (shouldIgnoreCase(data, options)) {
			value = value.toLowerCase();
			return (elem) => {
				const attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.length >= len && attr.substr(0, len).toLowerCase() === value && next(elem);
			};
		}
		return (elem) => !!adapter.getAttributeValue(elem, name)?.startsWith(value) && next(elem);
	},
	end(next, data, options) {
		const { adapter } = options;
		const { name } = data;
		let { value } = data;
		const len = -value.length;
		if (len === 0) return boolbaseExports.falseFunc;
		if (shouldIgnoreCase(data, options)) {
			value = value.toLowerCase();
			return (elem) => adapter.getAttributeValue(elem, name)?.substr(len).toLowerCase() === value && next(elem);
		}
		return (elem) => !!adapter.getAttributeValue(elem, name)?.endsWith(value) && next(elem);
	},
	any(next, data, options) {
		const { adapter } = options;
		const { name, value } = data;
		if (value === "") return boolbaseExports.falseFunc;
		if (shouldIgnoreCase(data, options)) {
			const regex = new RegExp(escapeRegex(value), "i");
			return function anyIC(elem) {
				const attr = adapter.getAttributeValue(elem, name);
				return attr != null && attr.length >= value.length && regex.test(attr) && next(elem);
			};
		}
		return (elem) => !!adapter.getAttributeValue(elem, name)?.includes(value) && next(elem);
	},
	not(next, data, options) {
		const { adapter } = options;
		const { name } = data;
		let { value } = data;
		if (value === "") return (elem) => !!adapter.getAttributeValue(elem, name) && next(elem);
		if (shouldIgnoreCase(data, options)) {
			value = value.toLowerCase();
			return (elem) => {
				const attr = adapter.getAttributeValue(elem, name);
				return (attr == null || attr.length !== value.length || attr.toLowerCase() !== value) && next(elem);
			};
		}
		return (elem) => adapter.getAttributeValue(elem, name) !== value && next(elem);
	}
};
/**
* Find all elements matching the query. If not in XML mode, the query will ignore
* the contents of `<template>` elements.
*
* @param query - Function that returns true if the element matches the query.
* @param elems - Nodes to query. If a node is an element, its children will be queried.
* @param options - Options for querying the document.
* @returns All matching elements.
*/
function findAll(query, elems, options) {
	const { adapter, xmlMode = false } = options;
	const result = [];
	/** Stack of the arrays we are looking at. */
	const nodeStack = [elems];
	/** Stack of the indices within the arrays. */
	const indexStack = [0];
	for (;;) {
		if (indexStack[0] >= nodeStack[0].length) {
			if (nodeStack.length === 1) return result;
			nodeStack.shift();
			indexStack.shift();
			continue;
		}
		const elem = nodeStack[0][indexStack[0]++];
		if (!adapter.isTag(elem)) continue;
		if (query(elem)) result.push(elem);
		if (xmlMode || adapter.getName(elem) !== "template") {
			const children = adapter.getChildren(elem);
			if (children.length > 0) {
				nodeStack.unshift(children);
				indexStack.unshift(0);
			}
		}
	}
}
/**
* Find the first element matching the query. If not in XML mode, the query will ignore
* the contents of `<template>` elements.
*
* @param query - Function that returns true if the element matches the query.
* @param elems - Nodes to query. If a node is an element, its children will be queried.
* @param options - Options for querying the document.
* @returns The first matching element, or null if there was no match.
*/
function findOne(query, elems, options) {
	const { adapter, xmlMode = false } = options;
	/** Stack of the arrays we are looking at. */
	const nodeStack = [elems];
	/** Stack of the indices within the arrays. */
	const indexStack = [0];
	for (;;) {
		if (indexStack[0] >= nodeStack[0].length) {
			if (nodeStack.length === 1) return null;
			nodeStack.shift();
			indexStack.shift();
			continue;
		}
		const elem = nodeStack[0][indexStack[0]++];
		if (!adapter.isTag(elem)) continue;
		if (query(elem)) return elem;
		if (xmlMode || adapter.getName(elem) !== "template") {
			const children = adapter.getChildren(elem);
			if (children.length > 0) {
				nodeStack.unshift(children);
				indexStack.unshift(0);
			}
		}
	}
}
function getNextSiblings(elem, adapter) {
	const siblings = adapter.getSiblings(elem);
	if (siblings.length <= 1) return [];
	const elemIndex = siblings.indexOf(elem);
	if (elemIndex < 0 || elemIndex === siblings.length - 1) return [];
	return siblings.slice(elemIndex + 1).filter(adapter.isTag);
}
function getElementParent(node, adapter) {
	const parent = adapter.getParent(node);
	return parent != null && adapter.isTag(parent) ? parent : null;
}
/**
* Only text controls can be made read-only, since for other controls (such
* as checkboxes and buttons) there is no useful distinction between being
* read-only and being disabled.
*
* @see {@link https://html.spec.whatwg.org/multipage/input.html#attr-input-readonly}
*/
var textControl = "input:is([type=text i],[type=search i],[type=url i],[type=tel i],[type=email i],[type=password i],[type=date i],[type=month i],[type=week i],[type=time i],[type=datetime-local i],[type=number i])";
/**
* Aliases are pseudos that are expressed as selectors.
*/
var aliases = {
	"any-link": ":is(a, area, link)[href]",
	link: ":any-link:not(:visited)",
	disabled: `:is(
        :is(button, input, select, textarea, optgroup, option)[disabled],
        optgroup[disabled] > option,
        fieldset[disabled]:not(fieldset[disabled] legend:first-of-type *)
    )`,
	enabled: ":not(:disabled)",
	checked: ":is(:is(input[type=radio], input[type=checkbox])[checked], :selected)",
	required: ":is(input, select, textarea)[required]",
	optional: ":is(input, select, textarea):not([required])",
	"read-only": `[readonly]:is(textarea, ${textControl})`,
	"read-write": `:not([readonly]):is(textarea, ${textControl})`,
	/**
	* `:selected` matches option elements that have the `selected` attribute,
	* or are the first option element in a select element that does not have
	* the `multiple` attribute and does not have any option elements with the
	* `selected` attribute.
	*
	* @see https://html.spec.whatwg.org/multipage/form-elements.html#concept-option-selectedness
	*/
	selected: "option:is([selected], select:not([multiple]):not(:has(> option[selected])) > :first-of-type)",
	checkbox: "[type=checkbox]",
	file: "[type=file]",
	password: "[type=password]",
	radio: "[type=radio]",
	reset: "[type=reset]",
	image: "[type=image]",
	submit: "[type=submit]",
	parent: ":not(:empty)",
	header: ":is(h1, h2, h3, h4, h5, h6)",
	button: ":is(button, input[type=button])",
	input: ":is(input, textarea, select, button)",
	text: "input:is(:not([type!='']), [type=text])"
};
var whitespace = /* @__PURE__ */ new Set([
	9,
	10,
	12,
	13,
	32
]);
var ZERO = "0".charCodeAt(0);
var NINE = "9".charCodeAt(0);
/**
* Parses an expression.
*
* @throws An `Error` if parsing fails.
* @returns An array containing the integer step size and the integer offset of the nth rule.
* @example nthCheck.parse("2n+3"); // returns [2, 3]
*/
function parse(formula) {
	formula = formula.trim().toLowerCase();
	if (formula === "even") return [2, 0];
	else if (formula === "odd") return [2, 1];
	let idx = 0;
	let a = 0;
	let sign = readSign();
	let number = readNumber();
	if (idx < formula.length && formula.charAt(idx) === "n") {
		idx++;
		a = sign * (number !== null && number !== void 0 ? number : 1);
		skipWhitespace();
		if (idx < formula.length) {
			sign = readSign();
			skipWhitespace();
			number = readNumber();
		} else sign = number = 0;
	}
	if (number === null || idx < formula.length) throw new Error(`n-th rule couldn't be parsed ('${formula}')`);
	return [a, sign * number];
	function readSign() {
		if (formula.charAt(idx) === "-") {
			idx++;
			return -1;
		}
		if (formula.charAt(idx) === "+") idx++;
		return 1;
	}
	function readNumber() {
		const start = idx;
		let value = 0;
		while (idx < formula.length && formula.charCodeAt(idx) >= ZERO && formula.charCodeAt(idx) <= NINE) {
			value = value * 10 + (formula.charCodeAt(idx) - ZERO);
			idx++;
		}
		return idx === start ? null : value;
	}
	function skipWhitespace() {
		while (idx < formula.length && whitespace.has(formula.charCodeAt(idx))) idx++;
	}
}
/**
* Returns a function that checks if an elements index matches the given rule
* highly optimized to return the fastest solution.
*
* @param parsed A tuple [a, b], as returned by `parse`.
* @returns A highly optimized function that returns whether an index matches the nth-check.
* @example
*
* ```js
* const check = nthCheck.compile([2, 3]);
*
* check(0); // `false`
* check(1); // `false`
* check(2); // `true`
* check(3); // `false`
* check(4); // `true`
* check(5); // `false`
* check(6); // `true`
* ```
*/
function compile(parsed) {
	const a = parsed[0];
	const b = parsed[1] - 1;
	if (b < 0 && a <= 0) return boolbase.falseFunc;
	if (a === -1) return (index) => index <= b;
	if (a === 0) return (index) => index === b;
	if (a === 1) return b < 0 ? boolbase.trueFunc : (index) => index >= b;
	const absA = Math.abs(a);
	const bMod = (b % absA + absA) % absA;
	return a > 1 ? (index) => index >= b && index % absA === bMod : (index) => index <= b && index % absA === bMod;
}
/**
* Parses and compiles a formula to a highly optimized function.
* Combination of {@link parse} and {@link compile}.
*
* If the formula doesn't match any elements,
* it returns [`boolbase`](https://github.com/fb55/boolbase)'s `falseFunc`.
* Otherwise, a function accepting an _index_ is returned, which returns
* whether or not the passed _index_ matches the formula.
*
* Note: The nth-rule starts counting at `1`, the returned function at `0`.
*
* @param formula The formula to compile.
* @example
* const check = nthCheck("2n+3");
*
* check(0); // `false`
* check(1); // `false`
* check(2); // `true`
* check(3); // `false`
* check(4); // `true`
* check(5); // `false`
* check(6); // `true`
*/
function nthCheck(formula) {
	return compile(parse(formula));
}
/**
* Some selectors such as `:contains` and (non-relative) `:has` will only be
* able to match elements if their parents match the selector (as they contain
* a subset of the elements that the parent contains).
*
* This function wraps the given `matches` function in a function that caches
* the results of the parent elements, so that the `matches` function only
* needs to be called once for each subtree.
*/
function cacheParentResults(next, { adapter, cacheResults }, matches) {
	if (cacheResults === false || typeof WeakMap === "undefined") return (elem) => next(elem) && matches(elem);
	const resultCache = /* @__PURE__ */ new WeakMap();
	function addResultToCache(elem) {
		const result = matches(elem);
		resultCache.set(elem, result);
		return result;
	}
	return function cachedMatcher(elem) {
		if (!next(elem)) return false;
		if (resultCache.has(elem)) return resultCache.get(elem);
		let node = elem;
		do {
			const parent = getElementParent(node, adapter);
			if (parent === null) return addResultToCache(elem);
			node = parent;
		} while (!resultCache.has(node));
		return resultCache.get(node) && addResultToCache(elem);
	};
}
var filters = {
	contains(next, text, options) {
		const { getText } = options.adapter;
		return cacheParentResults(next, options, (elem) => getText(elem).includes(text));
	},
	icontains(next, text, options) {
		const itext = text.toLowerCase();
		const { getText } = options.adapter;
		return cacheParentResults(next, options, (elem) => getText(elem).toLowerCase().includes(itext));
	},
	"nth-child"(next, rule, { adapter, equals }) {
		const func = nthCheck(rule);
		if (func === boolbaseExports.falseFunc) return boolbaseExports.falseFunc;
		if (func === boolbaseExports.trueFunc) return (elem) => getElementParent(elem, adapter) !== null && next(elem);
		return function nthChild(elem) {
			const siblings = adapter.getSiblings(elem);
			let pos = 0;
			for (let i = 0; i < siblings.length; i++) {
				if (equals(elem, siblings[i])) break;
				if (adapter.isTag(siblings[i])) pos++;
			}
			return func(pos) && next(elem);
		};
	},
	"nth-last-child"(next, rule, { adapter, equals }) {
		const func = nthCheck(rule);
		if (func === boolbaseExports.falseFunc) return boolbaseExports.falseFunc;
		if (func === boolbaseExports.trueFunc) return (elem) => getElementParent(elem, adapter) !== null && next(elem);
		return function nthLastChild(elem) {
			const siblings = adapter.getSiblings(elem);
			let pos = 0;
			for (let i = siblings.length - 1; i >= 0; i--) {
				if (equals(elem, siblings[i])) break;
				if (adapter.isTag(siblings[i])) pos++;
			}
			return func(pos) && next(elem);
		};
	},
	"nth-of-type"(next, rule, { adapter, equals }) {
		const func = nthCheck(rule);
		if (func === boolbaseExports.falseFunc) return boolbaseExports.falseFunc;
		if (func === boolbaseExports.trueFunc) return (elem) => getElementParent(elem, adapter) !== null && next(elem);
		return function nthOfType(elem) {
			const siblings = adapter.getSiblings(elem);
			let pos = 0;
			for (let i = 0; i < siblings.length; i++) {
				const currentSibling = siblings[i];
				if (equals(elem, currentSibling)) break;
				if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === adapter.getName(elem)) pos++;
			}
			return func(pos) && next(elem);
		};
	},
	"nth-last-of-type"(next, rule, { adapter, equals }) {
		const func = nthCheck(rule);
		if (func === boolbaseExports.falseFunc) return boolbaseExports.falseFunc;
		if (func === boolbaseExports.trueFunc) return (elem) => getElementParent(elem, adapter) !== null && next(elem);
		return function nthLastOfType(elem) {
			const siblings = adapter.getSiblings(elem);
			let pos = 0;
			for (let i = siblings.length - 1; i >= 0; i--) {
				const currentSibling = siblings[i];
				if (equals(elem, currentSibling)) break;
				if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === adapter.getName(elem)) pos++;
			}
			return func(pos) && next(elem);
		};
	},
	root(next, _rule, { adapter }) {
		return (elem) => getElementParent(elem, adapter) === null && next(elem);
	},
	scope(next, rule, options, context) {
		const { equals } = options;
		if (!context || context.length === 0) return filters["root"](next, rule, options);
		if (context.length === 1) return (elem) => equals(context[0], elem) && next(elem);
		return (elem) => context.includes(elem) && next(elem);
	},
	hover: dynamicStatePseudo("isHovered"),
	visited: dynamicStatePseudo("isVisited"),
	active: dynamicStatePseudo("isActive")
};
/**
* Dynamic state pseudos. These depend on optional Adapter methods.
*
* @param name The name of the adapter method to call.
* @returns Pseudo for the `filters` object.
*/
function dynamicStatePseudo(name) {
	return function dynamicPseudo(next, _rule, { adapter }) {
		const func = adapter[name];
		if (typeof func !== "function") return boolbaseExports.falseFunc;
		return function active(elem) {
			return func(elem) && next(elem);
		};
	};
}
/**
* CSS limits the characters considered as whitespace to space, tab & line
* feed. We add carriage returns as htmlparser2 doesn't normalize them to
* line feeds.
*
* @see {@link https://www.w3.org/TR/css-text-3/#white-space}
*/
var isDocumentWhiteSpace = /^[ \t\r\n]*$/;
var pseudos = {
	empty(elem, { adapter }) {
		const children = adapter.getChildren(elem);
		return children.every((elem) => !adapter.isTag(elem)) && children.every((elem) => isDocumentWhiteSpace.test(adapter.getText(elem)));
	},
	"first-child"(elem, { adapter, equals }) {
		if (adapter.prevElementSibling) return adapter.prevElementSibling(elem) == null;
		const firstChild = adapter.getSiblings(elem).find((elem) => adapter.isTag(elem));
		return firstChild != null && equals(elem, firstChild);
	},
	"last-child"(elem, { adapter, equals }) {
		const siblings = adapter.getSiblings(elem);
		for (let i = siblings.length - 1; i >= 0; i--) {
			if (equals(elem, siblings[i])) return true;
			if (adapter.isTag(siblings[i])) break;
		}
		return false;
	},
	"first-of-type"(elem, { adapter, equals }) {
		const siblings = adapter.getSiblings(elem);
		const elemName = adapter.getName(elem);
		for (let i = 0; i < siblings.length; i++) {
			const currentSibling = siblings[i];
			if (equals(elem, currentSibling)) return true;
			if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === elemName) break;
		}
		return false;
	},
	"last-of-type"(elem, { adapter, equals }) {
		const siblings = adapter.getSiblings(elem);
		const elemName = adapter.getName(elem);
		for (let i = siblings.length - 1; i >= 0; i--) {
			const currentSibling = siblings[i];
			if (equals(elem, currentSibling)) return true;
			if (adapter.isTag(currentSibling) && adapter.getName(currentSibling) === elemName) break;
		}
		return false;
	},
	"only-of-type"(elem, { adapter, equals }) {
		const elemName = adapter.getName(elem);
		return adapter.getSiblings(elem).every((sibling) => equals(elem, sibling) || !adapter.isTag(sibling) || adapter.getName(sibling) !== elemName);
	},
	"only-child"(elem, { adapter, equals }) {
		return adapter.getSiblings(elem).every((sibling) => equals(elem, sibling) || !adapter.isTag(sibling));
	}
};
function verifyPseudoArgs(func, name, subselect, argIndex) {
	if (subselect === null) {
		if (func.length > argIndex) throw new Error(`Pseudo-class :${name} requires an argument`);
	} else if (func.length === argIndex) throw new Error(`Pseudo-class :${name} doesn't have any arguments`);
}
function isTraversal(token) {
	return token.type === "_flexibleDescendant" || isTraversal$1(token);
}
/**
* Sort the parts of the passed selector, as there is potential for
* optimization (some types of selectors are faster than others).
*
* @param arr Selector to sort
*/
function sortRules(arr) {
	const ratings = arr.map(getQuality);
	for (let i = 1; i < arr.length; i++) {
		const procNew = ratings[i];
		if (procNew < 0) continue;
		for (let j = i; j > 0 && procNew < ratings[j - 1]; j--) {
			const token = arr[j];
			arr[j] = arr[j - 1];
			arr[j - 1] = token;
			ratings[j] = ratings[j - 1];
			ratings[j - 1] = procNew;
		}
	}
}
function getAttributeQuality(token) {
	switch (token.action) {
		case AttributeAction.Exists: return 10;
		case AttributeAction.Equals: return token.name === "id" ? 9 : 8;
		case AttributeAction.Not: return 7;
		case AttributeAction.Start: return 6;
		case AttributeAction.End: return 6;
		case AttributeAction.Any: return 5;
		case AttributeAction.Hyphen: return 4;
		case AttributeAction.Element: return 3;
	}
}
/**
* Determine the quality of the passed token. The higher the number, the
* faster the token is to execute.
*
* @param token Token to get the quality of.
* @returns The token's quality.
*/
function getQuality(token) {
	switch (token.type) {
		case SelectorType.Universal: return 50;
		case SelectorType.Tag: return 30;
		case SelectorType.Attribute: return Math.floor(getAttributeQuality(token) / (token.ignoreCase ? 2 : 1));
		case SelectorType.Pseudo: return !token.data ? 3 : token.name === "has" || token.name === "contains" || token.name === "icontains" ? 0 : Array.isArray(token.data) ? Math.max(0, Math.min(...token.data.map((d) => Math.min(...d.map(getQuality))))) : 2;
		default: return -1;
	}
}
function includesScopePseudo(t) {
	return t.type === SelectorType.Pseudo && (t.name === "scope" || Array.isArray(t.data) && t.data.some((data) => data.some(includesScopePseudo)));
}
/** Used as a placeholder for :has. Will be replaced with the actual element. */
var PLACEHOLDER_ELEMENT = {};
/**
* Check if the selector has any properties that rely on the current element.
* If not, we can cache the result of the selector.
*
* We can't cache selectors that start with a traversal (e.g. `>`, `+`, `~`),
* or include a `:scope`.
*
* @param selector - The selector to check.
* @returns Whether the selector has any properties that rely on the current element.
*/
function hasDependsOnCurrentElement(selector) {
	return selector.some((sel) => sel.length > 0 && (isTraversal(sel[0]) || sel.some(includesScopePseudo)));
}
function copyOptions(options) {
	return {
		xmlMode: !!options.xmlMode,
		lowerCaseAttributeNames: !!options.lowerCaseAttributeNames,
		lowerCaseTags: !!options.lowerCaseTags,
		quirksMode: !!options.quirksMode,
		cacheResults: !!options.cacheResults,
		pseudos: options.pseudos,
		adapter: options.adapter,
		equals: options.equals
	};
}
var is = (next, token, options, context, compileToken) => {
	const func = compileToken(token, copyOptions(options), context);
	return func === boolbaseExports.trueFunc ? next : func === boolbaseExports.falseFunc ? boolbaseExports.falseFunc : (elem) => func(elem) && next(elem);
};
var subselects = {
	is,
	/**
	* `:matches` and `:where` are aliases for `:is`.
	*/
	matches: is,
	where: is,
	not(next, token, options, context, compileToken) {
		const func = compileToken(token, copyOptions(options), context);
		return func === boolbaseExports.falseFunc ? next : func === boolbaseExports.trueFunc ? boolbaseExports.falseFunc : (elem) => !func(elem) && next(elem);
	},
	has(next, subselect, options, _context, compileToken) {
		const { adapter } = options;
		const opts = copyOptions(options);
		opts.relativeSelector = true;
		const context = subselect.some((s) => s.some(isTraversal)) ? [PLACEHOLDER_ELEMENT] : void 0;
		const skipCache = hasDependsOnCurrentElement(subselect);
		const compiled = compileToken(subselect, opts, context);
		if (compiled === boolbaseExports.falseFunc) return boolbaseExports.falseFunc;
		if (context && compiled !== boolbaseExports.trueFunc) return skipCache ? (elem) => {
			if (!next(elem)) return false;
			context[0] = elem;
			const childs = adapter.getChildren(elem);
			return findOne(compiled, compiled.shouldTestNextSiblings ? [...childs, ...getNextSiblings(elem, adapter)] : childs, options) !== null;
		} : cacheParentResults(next, options, (elem) => {
			context[0] = elem;
			return findOne(compiled, adapter.getChildren(elem), options) !== null;
		});
		const hasOne = (elem) => findOne(compiled, adapter.getChildren(elem), options) !== null;
		return skipCache ? (elem) => next(elem) && hasOne(elem) : cacheParentResults(next, options, hasOne);
	}
};
function compilePseudoSelector(next, selector, options, context, compileToken) {
	const { name, data } = selector;
	if (Array.isArray(data)) {
		if (!(name in subselects)) throw new Error(`Unknown pseudo-class :${name}(${data})`);
		return subselects[name](next, data, options, context, compileToken);
	}
	const userPseudo = options.pseudos?.[name];
	const stringPseudo = typeof userPseudo === "string" ? userPseudo : aliases[name];
	if (typeof stringPseudo === "string") {
		if (data != null) throw new Error(`Pseudo ${name} doesn't have any arguments`);
		const alias = parse$1(stringPseudo);
		return subselects["is"](next, alias, options, context, compileToken);
	}
	if (typeof userPseudo === "function") {
		verifyPseudoArgs(userPseudo, name, data, 1);
		return (elem) => userPseudo(elem, data) && next(elem);
	}
	if (name in filters) return filters[name](next, data, options, context);
	if (name in pseudos) {
		const pseudo = pseudos[name];
		verifyPseudoArgs(pseudo, name, data, 2);
		return (elem) => pseudo(elem, options, data) && next(elem);
	}
	throw new Error(`Unknown pseudo-class :${name}`);
}
function compileGeneralSelector(next, selector, options, context, compileToken, hasExpensiveSubselector) {
	const { adapter, equals, cacheResults } = options;
	switch (selector.type) {
		case SelectorType.PseudoElement: throw new Error("Pseudo-elements are not supported by css-select");
		case SelectorType.ColumnCombinator: throw new Error("Column combinators are not yet supported by css-select");
		case SelectorType.Attribute:
			if (selector.namespace != null) throw new Error("Namespaced attributes are not yet supported by css-select");
			if (!options.xmlMode || options.lowerCaseAttributeNames) selector.name = selector.name.toLowerCase();
			return attributeRules[selector.action](next, selector, options);
		case SelectorType.Pseudo: return compilePseudoSelector(next, selector, options, context, compileToken);
		case SelectorType.Tag: {
			if (selector.namespace != null) throw new Error("Namespaced tag names are not yet supported by css-select");
			let { name } = selector;
			if (!options.xmlMode || options.lowerCaseTags) name = name.toLowerCase();
			return function tag(elem) {
				return adapter.getName(elem) === name && next(elem);
			};
		}
		case SelectorType.Descendant: {
			if (!hasExpensiveSubselector || cacheResults === false || typeof WeakMap === "undefined") return function descendant(elem) {
				let current = elem;
				while (current = getElementParent(current, adapter)) if (next(current)) return true;
				return false;
			};
			const resultCache = /* @__PURE__ */ new WeakMap();
			return function cachedDescendant(elem) {
				let current = elem;
				let result;
				while (current = getElementParent(current, adapter)) {
					const cached = resultCache.get(current);
					if (cached === void 0) {
						result ?? (result = { matches: false });
						result.matches = next(current);
						resultCache.set(current, result);
						if (result.matches) return true;
					} else {
						if (result) result.matches = cached.matches;
						return cached.matches;
					}
				}
				return false;
			};
		}
		case "_flexibleDescendant": return function flexibleDescendant(elem) {
			let current = elem;
			do {
				if (next(current)) return true;
				current = getElementParent(current, adapter);
			} while (current);
			return false;
		};
		case SelectorType.Parent: return function parent(elem) {
			return adapter.getChildren(elem).some((elem) => adapter.isTag(elem) && next(elem));
		};
		case SelectorType.Child: return function child(elem) {
			const parent = getElementParent(elem, adapter);
			return parent !== null && next(parent);
		};
		case SelectorType.Sibling: return function sibling(elem) {
			const siblings = adapter.getSiblings(elem);
			for (let i = 0; i < siblings.length; i++) {
				const currentSibling = siblings[i];
				if (equals(elem, currentSibling)) break;
				if (adapter.isTag(currentSibling) && next(currentSibling)) return true;
			}
			return false;
		};
		case SelectorType.Adjacent:
			if (adapter.prevElementSibling) return function adjacent(elem) {
				const previous = adapter.prevElementSibling(elem);
				return previous != null && next(previous);
			};
			return function adjacent(elem) {
				const siblings = adapter.getSiblings(elem);
				let lastElement;
				for (let i = 0; i < siblings.length; i++) {
					const currentSibling = siblings[i];
					if (equals(elem, currentSibling)) break;
					if (adapter.isTag(currentSibling)) lastElement = currentSibling;
				}
				return !!lastElement && next(lastElement);
			};
		case SelectorType.Universal:
			if (selector.namespace != null && selector.namespace !== "*") throw new Error("Namespaced universal selectors are not yet supported by css-select");
			return next;
	}
}
var DESCENDANT_TOKEN = { type: SelectorType.Descendant };
var FLEXIBLE_DESCENDANT_TOKEN = { type: "_flexibleDescendant" };
var SCOPE_TOKEN = {
	type: SelectorType.Pseudo,
	name: "scope",
	data: null
};
function absolutize(token, { adapter }, context) {
	const hasContext = !!context?.every((e) => e === PLACEHOLDER_ELEMENT || adapter.isTag(e) && getElementParent(e, adapter) !== null);
	for (const t of token) {
		if (t.length > 0 && isTraversal(t[0]) && t[0].type !== SelectorType.Descendant);
		else if (hasContext && !t.some(includesScopePseudo)) t.unshift(DESCENDANT_TOKEN);
		else continue;
		t.unshift(SCOPE_TOKEN);
	}
}
function compileToken(token, options, ctx) {
	token.forEach(sortRules);
	const { context = ctx, rootFunc = boolbaseExports.trueFunc } = options;
	const isArrayContext = Array.isArray(context);
	const finalContext = context && (Array.isArray(context) ? context : [context]);
	if (options.relativeSelector !== false) absolutize(token, options, finalContext);
	else if (token.some((t) => t.length > 0 && isTraversal(t[0]))) throw new Error("Relative selectors are not allowed when the `relativeSelector` option is disabled");
	let shouldTestNextSiblings = false;
	let query = boolbaseExports.falseFunc;
	combineLoop: for (const rules of token) {
		if (rules.length >= 2) {
			const [first, second] = rules;
			if (first.type !== SelectorType.Pseudo || first.name !== "scope");
			else if (isArrayContext && second.type === SelectorType.Descendant) rules[1] = FLEXIBLE_DESCENDANT_TOKEN;
			else if (second.type === SelectorType.Adjacent || second.type === SelectorType.Sibling) shouldTestNextSiblings = true;
		}
		let next = rootFunc;
		let hasExpensiveSubselector = false;
		for (const rule of rules) {
			next = compileGeneralSelector(next, rule, options, finalContext, compileToken, hasExpensiveSubselector);
			if (getQuality(rule) === 0) hasExpensiveSubselector = true;
			if (next === boolbaseExports.falseFunc) continue combineLoop;
		}
		if (next === rootFunc) return rootFunc;
		query = query === boolbaseExports.falseFunc ? next : or(query, next);
	}
	query.shouldTestNextSiblings = shouldTestNextSiblings;
	return query;
}
function or(a, b) {
	return (elem) => a(elem) || b(elem);
}
var defaultEquals = (a, b) => a === b;
var defaultOptions = {
	adapter: DomUtils,
	equals: defaultEquals
};
function convertOptionFormats(options) {
	const opts = options ?? defaultOptions;
	opts.adapter ?? (opts.adapter = DomUtils);
	opts.equals ?? (opts.equals = opts.adapter?.equals ?? defaultEquals);
	return opts;
}
/**
* Like `compile`, but does not add a check if elements are tags.
*/
function _compileUnsafe(selector, options, context) {
	return _compileToken(typeof selector === "string" ? parse$1(selector) : selector, options, context);
}
/**
* @deprecated Use `_compileUnsafe` instead.
*/
function _compileToken(selector, options, context) {
	return compileToken(selector, convertOptionFormats(options), context);
}
function getSelectorFunc(searchFunc) {
	return function select(query, elements, options) {
		const opts = convertOptionFormats(options);
		if (typeof query !== "function") query = _compileUnsafe(query, opts, elements);
		const filteredElements = prepareContext(elements, opts.adapter, query.shouldTestNextSiblings);
		return searchFunc(query, filteredElements, opts);
	};
}
function prepareContext(elems, adapter, shouldTestNextSiblings = false) {
	if (shouldTestNextSiblings) elems = appendNextSiblings(elems, adapter);
	return Array.isArray(elems) ? adapter.removeSubsets(elems) : adapter.getChildren(elems);
}
function appendNextSiblings(elem, adapter) {
	const elems = Array.isArray(elem) ? elem.slice(0) : [elem];
	const elemsLength = elems.length;
	for (let i = 0; i < elemsLength; i++) {
		const nextSiblings = getNextSiblings(elems[i], adapter);
		elems.push(...nextSiblings);
	}
	return elems;
}
/**
* @template Node The generic Node type for the DOM adapter being used.
* @template ElementNode The Node type for elements for the DOM adapter being used.
* @param elems Elements to query. If it is an element, its children will be queried.
* @param query can be either a CSS selector string or a compiled query function.
* @param [options] options for querying the document.
* @see compile for supported selector queries.
* @returns All matching elements.
*
*/
var selectAll = getSelectorFunc((query, elems, options) => query === boolbaseExports.falseFunc || !elems || elems.length === 0 ? [] : findAll(query, elems, options));
/**
* @template Node The generic Node type for the DOM adapter being used.
* @template ElementNode The Node type for elements for the DOM adapter being used.
* @param elems Elements to query. If it is an element, its children will be queried.
* @param query can be either a CSS selector string or a compiled query function.
* @param [options] options for querying the document.
* @see compile for supported selector queries.
* @returns the first match, or null if there was no match.
*/
var selectOne = getSelectorFunc((query, elems, options) => query === boolbaseExports.falseFunc || !elems || elems.length === 0 ? null : findOne(query, elems, options));
var _a;
var decodeMap = /* @__PURE__ */ new Map([
	[0, 65533],
	[128, 8364],
	[130, 8218],
	[131, 402],
	[132, 8222],
	[133, 8230],
	[134, 8224],
	[135, 8225],
	[136, 710],
	[137, 8240],
	[138, 352],
	[139, 8249],
	[140, 338],
	[142, 381],
	[145, 8216],
	[146, 8217],
	[147, 8220],
	[148, 8221],
	[149, 8226],
	[150, 8211],
	[151, 8212],
	[152, 732],
	[153, 8482],
	[154, 353],
	[155, 8250],
	[156, 339],
	[158, 382],
	[159, 376]
]);
/**
* Polyfill for `String.fromCodePoint`. It is used to create a string from a Unicode code point.
*/
var fromCodePoint = (_a = String.fromCodePoint) !== null && _a !== void 0 ? _a : ((codePoint) => {
	let output = "";
	if (codePoint > 65535) {
		codePoint -= 65536;
		output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
		codePoint = 56320 | codePoint & 1023;
	}
	output += String.fromCharCode(codePoint);
	return output;
});
/**
* Replace the given code point with a replacement character if it is a
* surrogate or is outside the valid range. Otherwise return the code
* point unchanged.
*/
function replaceCodePoint(codePoint) {
	var _a;
	if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) return 65533;
	return (_a = decodeMap.get(codePoint)) !== null && _a !== void 0 ? _a : codePoint;
}
function decodeBase64(input) {
	const binary = typeof atob === "function" ? atob(input) : typeof Buffer.from === "function" ? Buffer.from(input, "base64").toString("binary") : new Buffer(input, "base64").toString("binary");
	const evenLength = binary.length & -2;
	const out = new Uint16Array(evenLength / 2);
	for (let index = 0, outIndex = 0; index < evenLength; index += 2) {
		const lo = binary.charCodeAt(index);
		const hi = binary.charCodeAt(index + 1);
		out[outIndex++] = lo | hi << 8;
	}
	return out;
}
var htmlDecodeTree = /* #__PURE__ */ decodeBase64("QR08ALkAAgH6AYsDNQR2BO0EPgXZBQEGLAbdBxMISQrvCmQLfQurDKQNLw4fD4YPpA+6D/IPAAAAAAAAAAAAAAAAKhBMEY8TmxUWF2EYLBkxGuAa3RsJHDscWR8YIC8jSCSIJcMl6ie3Ku8rEC0CLjoupS7kLgAIRU1hYmNmZ2xtbm9wcnN0dVQAWgBeAGUAaQBzAHcAfgCBAIQAhwCSAJoAoACsALMAbABpAGcAO4DGAMZAUAA7gCYAJkBjAHUAdABlADuAwQDBQHIiZXZlAAJhAAFpeW0AcgByAGMAO4DCAMJAEGRyAADgNdgE3XIAYQB2AGUAO4DAAMBA8CFoYZFj4SFjcgBhZAAAoFMqAAFncIsAjgBvAG4ABGFmAADgNdg43fAlbHlGdW5jdGlvbgCgYSBpAG4AZwA7gMUAxUAAAWNzpACoAHIAAOA12Jzc6SFnbgCgVCJpAGwAZABlADuAwwDDQG0AbAA7gMQAxEAABGFjZWZvcnN1xQDYANoA7QDxAPYA+QD8AAABY3LJAM8AayNzbGFzaAAAoBYidgHTANUAAKDnKmUAZAAAoAYjeQARZIABY3J0AOAA5QDrAGEidXNlAACgNSLuI291bGxpcwCgLCFhAJJjcgAA4DXYBd1wAGYAAOA12Dnd5SF2ZdhiYwDyAOoAbSJwZXEAAKBOIgAHSE9hY2RlZmhpbG9yc3UXARoBHwE6AVIBVQFiAWQBZgGCAakB6QHtAfIBYwB5ACdkUABZADuAqQCpQIABY3B5ACUBKAE1AfUhdGUGYWmg0iJ0KGFsRGlmZmVyZW50aWFsRAAAoEUhbCJleXMAAKAtIQACYWVpb0EBRAFKAU0B8iFvbgxhZABpAGwAO4DHAMdAcgBjAAhhbiJpbnQAAKAwIm8AdAAKYQABZG5ZAV0BaSJsbGEAuGB0I2VyRG90ALdg8gA5AWkAp2NyImNsZQAAAkRNUFRwAXQBeQF9AW8AdAAAoJkiaSJudXMAAKCWIuwhdXMAoJUiaSJtZXMAAKCXIm8AAAFjc4cBlAFrKndpc2VDb250b3VySW50ZWdyYWwAAKAyImUjQ3VybHkAAAFEUZwBpAFvJXVibGVRdW90ZQAAoB0gdSJvdGUAAKAZIAACbG5wdbABtgHNAdgBbwBuAGWgNyIAoHQqgAFnaXQAvAHBAcUB8iJ1ZW50AKBhIm4AdAAAoC8i7yV1ckludGVncmFsAKAuIgABZnLRAdMBAKACIe8iZHVjdACgECJuLnRlckNsb2Nrd2lzZUNvbnRvdXJJbnRlZ3JhbAAAoDMi7yFzcwCgLypjAHIAAOA12J7ccABDoNMiYQBwAACgTSKABURKU1phY2VmaW9zAAsCEgIVAhgCGwIsAjQCOQI9AnMCfwNvoEUh9CJyYWhkAKARKWMAeQACZGMAeQAFZGMAeQAPZIABZ3JzACECJQIoAuchZXIAoCEgcgAAoKEhaAB2AACg5CoAAWF5MAIzAvIhb24OYRRkbAB0oAciYQCUY3IAAOA12AfdAAFhZkECawIAAWNtRQJnAvIjaXRpY2FsAAJBREdUUAJUAl8CYwJjInV0ZQC0YG8AdAFZAloC2WJiJGxlQWN1dGUA3WJyImF2ZQBgYGkibGRlANxi7yFuZACgxCJmJWVyZW50aWFsRAAAoEYhcAR9AgAAAAAAAIECjgIAABoDZgAA4DXYO91EoagAhQKJAm8AdAAAoNwgcSJ1YWwAAKBQIuIhbGUAA0NETFJVVpkCqAK1Au8C/wIRA28AbgB0AG8AdQByAEkAbgB0AGUAZwByAGEA7ADEAW8AdAKvAgAAAACwAqhgbiNBcnJvdwAAoNMhAAFlb7kC0AJmAHQAgAFBUlQAwQLGAs0CciJyb3cAAKDQIekkZ2h0QXJyb3cAoNQhZQDlACsCbgBnAAABTFLWAugC5SFmdAABQVLcAuECciJyb3cAAKD4J+kkZ2h0QXJyb3cAoPon6SRnaHRBcnJvdwCg+SdpImdodAAAAUFU9gL7AnIicm93AACg0iFlAGUAAKCoInAAQQIGAwAAAAALA3Iicm93AACg0SFvJHduQXJyb3cAAKDVIWUlcnRpY2FsQmFyAACgJSJuAAADQUJMUlRhJAM2AzoDWgNxA3oDciJyb3cAAKGTIUJVLAMwA2EAcgAAoBMpcCNBcnJvdwAAoPUhciJldmUAEWPlIWZ00gJDAwAASwMAAFIDaSVnaHRWZWN0b3IAAKBQKWUkZVZlY3RvcgAAoF4p5SJjdG9yQqC9IWEAcgAAoFYpaSJnaHQA1AFiAwAAaQNlJGVWZWN0b3IAAKBfKeUiY3RvckKgwSFhAHIAAKBXKWUAZQBBoKQiciJyb3cAAKCnIXIAcgBvAPcAtAIAAWN0gwOHA3IA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YwAAoN8i4SFycnCgtiEAoD0pgKIqImJjZG9zACsVMBU6FT4VQRVyImNhcAAAoEgqAAFhdTQVNxVwAACgRipwAACgSipvAHQAAKCNInIAAKBFKgDgKiIA/gACYWxydksVURVuFXMVcgByAG2gtyEAoDwpeQCAAWV2dwBYFWUVaRVxAHACXxUAAAAAYxVyAGUA4wAXFXUA4wAZFWUAZQAAoM4iZSJkZ2UAAKDPImUAbgA7gKQApEBlI2Fycm93AAABbHJ7FX8V5SFmdACgtiFpImdodAAAoLchZQDkAG0VAAFjaYsVkRVvAG4AaQBuAPQAkwFuAHQAAKAxImwiY3R5AACgLSOACUFIYWJjZGVmaGlqbG9yc3R1d3oAuBW7Fb8V1RXgFegV+RUKFhUWHxZUFlcWZRbFFtsW7xb7FgUXChdyAPIAtAJhAHIAAKBlKQACZ2xyc8YVyhXOFdAV5yFlcgCgICDlIXRoAKA4IfIA9QxoAHagECAAoKMiawHZFd4VYSJyb3cAAKAPKWEA4wBfAgABYXnkFecV8iFvbg9hNGQAoUYhYW/tFfQVAAFnciEC8RVyAACgyiF0InNlcQAAoHcqgAFnbG0A/xUCFgUWO4CwALBAdABhALRjcCJ0eXYAAKCxKQABaXIOFhIW8yFodACgfykA4DXYId1hAHIAAAFschsWHRYAoMMhAKDCIYACYWVnc3YAKBauAjYWOhY+Fm0AAKHEIm9zLhY0Fm4AZABzoMQi9SFpdACgZiZhIm1tYQDdY2kAbgAAoPIiAKH3AGlvQxZRFmQAZQAAgfcAO29KFksW90BuI3RpbWVzAACgxyJuAPgAUBZjAHkAUmRjAG8CXhYAAAAAYhZyAG4AAKAeI28AcAAAoA0jgAJscHR1dwBuFnEWdRaSFp4W7CFhciRgZgAA4DXYVd0AotkCZW1wc30WhBaJFo0WcQBkoFAibwB0AACgUSJpIm51cwAAoDgi7CF1cwCgFCLxInVhcmUAoKEiYgBsAGUAYgBhAHIAdwBlAGQAZwDlANcAbgCAAWFkaAClFqoWtBZyAHIAbwD3APUMbwB3AG4AYQByAHIAbwB3APMA8xVhI3Jwb29uAAABbHK8FsAWZQBmAPQAHBZpAGcAaAD0AB4WYgHJFs8WawBhAHIAbwD3AJILbwLUFgAAAADYFnIAbgAAoB8jbwBwAACgDCOAAWNvdADhFukW7BYAAXJ55RboFgDgNdi53FVkbAAAoPYp8iFvaxFhAAFkcvMW9xZvAHQAAKDxImkA5qC/JVsSAAFhaP8WAhdyAPIANQNhAPIA1wvhIm5nbGUAoKYpAAFjaQ4XEBd5AF9k5yJyYXJyAKD/JwAJRGFjZGVmZ2xtbm9wcXJzdHV4MRc4F0YXWxcyBF4XaRd5F40XrBe0F78X2RcVGCEYLRg1GEAYAAFEbzUXgRZvAPQA+BUAAWNzPBdCF3UAdABlADuA6QDpQPQhZXIAoG4qAAJhaW95TRdQF1YXWhfyIW9uG2FyAGOgViI7gOoA6kDsIW9uAKBVIk1kbwB0ABdhAAFEcmIXZhdvAHQAAKBSIgDgNdgi3XKhmipuF3QXYQB2AGUAO4DoAOhAZKCWKm8AdAAAoJgqgKGZKmlscwCAF4UXhxfuInRlcnMAoOcjAKATIWSglSpvAHQAAKCXKoABYXBzAJMXlheiF2MAcgATYXQAeQBzogUinxcAAAAAoRdlAHQAAKAFInAAMaADIDMBqRerFwCgBCAAoAUgAAFnc7AXsRdLYXAAAKACIAABZ3C4F7sXbwBuABlhZgAA4DXYVt2AAWFscwDFF8sXzxdyAHOg1SJsAACg4yl1AHMAAKBxKmkAAKG1A2x21RfYF28AbgC1Y/VjAAJjc3V24BfoF/0XEBgAAWlv5BdWF3IAYwAAoFYiaQLuFwAAAADwF+0ADQThIW50AAFnbPUX+Rd0AHIAAKCWKuUhc3MAoJUqgAFhZWkAAxgGGAoYbABzAD1gcwB0AACgXyJ2AESgYSJEAACgeCrwImFyc2wAoOUpAAFEYRkYHRhvAHQAAKBTInIAcgAAoHEpgAFjZGkAJxgqGO0XcgAAoC8hbwD0AIwCAAFhaDEYMhi3YzuA8ADwQAABbXI5GD0YbAA7gOsA60BvAACgrCCAAWNpcABGGEgYSxhsACFgcwD0ACwEAAFlb08YVxhjAHQAYQB0AGkAbwDuABoEbgBlAG4AdABpAGEAbADlADME4Ql1GAAAgRgAAIMYiBgAAAAAoRilGAAAqhgAALsYvhjRGAAA1xgnGWwAbABpAG4AZwBkAG8AdABzAGUA8QBlF3kARGRtImFsZQAAoEAmgAFpbHIAjRiRGJ0Y7CFpZwCgA/tpApcYAAAAAJoYZwAAoAD7aQBnAACgBPsA4DXYI93sIWlnAKAB++whaWcA4GYAagCAAWFsdACvGLIYthh0AACgbSZpAGcAAKAC+24AcwAAoLElbwBmAJJh8AHCGAAAxhhmAADgNdhX3QABYWvJGMwYbADsAGsEdqDUIgCg2SphI3J0aW50AACgDSoAAWFv2hgiGQABY3PeGB8ZsQPnGP0YBRkSGRUZAAAdGbID7xjyGPQY9xj5GAAA+xg7gL0AvUAAoFMhO4C8ALxAAKBVIQCgWSEAoFshswEBGQAAAxkAoFQhAKBWIbQCCxkOGQAAAAAQGTuAvgC+QACgVyEAoFwhNQAAoFghtgEZGQAAGxkAoFohAKBdITgAAKBeIWwAAKBEIHcAbgAAoCIjYwByAADgNdi73IAIRWFiY2RlZmdpamxub3JzdHYARhlKGVoZXhlmGWkZkhmWGZkZnRmgGa0ZxhnLGc8Z4BkjGmygZyIAoIwqgAFjbXAAUBlTGVgZ9SF0ZfVhbQBhAOSgswM6FgCghipyImV2ZQAfYQABaXliGWUZcgBjAB1hM2RvAHQAIWGAoWUibHFzAMYEcBl6GfGhZSLOBAAAdhlsAGEAbgD0AN8EgKF+KmNkbACBGYQZjBljAACgqSpvAHQAb6CAKmyggioAoIQqZeDbIgD+cwAAoJQqcgAA4DXYJN3noGsirATtIWVsAKA3IWMAeQBTZIChdyJFYWoApxmpGasZAKCSKgCgpSoAoKQqAAJFYWVztBm2Gb0ZwhkAoGkicABwoIoq8iFveACgiipxoIgq8aCIKrUZaQBtAACg5yJwAGYAAOA12FjdYQB2AOUAYwIAAWNp0xnWGXIAAKAKIW0AAKFzImVs3BneGQCgjioAoJAqAIM+ADtjZGxxco0E6xn0GfgZ/BkBGgABY2nvGfEZAKCnKnIAAKB6Km8AdAAAoNci0CFhcgCglSl1ImVzdAAAoHwqgAJhZGVscwAKGvQZFhrVBCAa8AEPGgAAFBpwAHIAbwD4AFkZcgAAoHgpcQAAAWxxxAQbGmwAZQBzAPMASRlpAO0A5AQAAWVuJxouGnIjdG5lcXEAAOBpIgD+xQAsGgAFQWFiY2Vma29zeUAaQxpmGmoabRqDGocalhrCGtMacgDyAMwCAAJpbG1yShpOGlAaVBpyAHMA8ABxD2YAvWBpAGwA9AASBQABZHJYGlsaYwB5AEpkAKGUIWN3YBpkGmkAcgAAoEgpAKCtIWEAcgAAoA8h6SFyYyVhgAFhbHIAcxp7Gn8a8iF0c3WgZSZpAHQAAKBlJuwhaXAAoCYg4yFvbgCguSJyAADgNdgl3XMAAAFld4wakRphInJvdwAAoCUpYSJyb3cAAKAmKYACYW1vcHIAnxqjGqcauhq+GnIAcgAAoP8h9CFodACgOyJrAAABbHKsGrMaZSRmdGFycm93AACgqSHpJGdodGFycm93AKCqIWYAAOA12Fnd4iFhcgCgFSCAAWNsdADIGswa0BpyAADgNdi93GEAcwDoAGka8iFvaydhAAFicNca2xr1IWxsAKBDIOghZW4AoBAg4Qr2GgAA/RoAAAgbExsaGwAAIRs7GwAAAAA+G2IbmRuVG6sbAACyG80b0htjAHUAdABlADuA7QDtQAChYyBpeQEbBhtyAGMAO4DuAO5AOGQAAWN4CxsNG3kANWRjAGwAO4ChAKFAAAFmcssCFhsA4DXYJt1yAGEAdgBlADuA7ADsQIChSCFpbm8AJxsyGzYbAAFpbisbLxtuAHQAAKAMKnQAAKAtIuYhaW4AoNwpdABhAACgKSHsIWlnM2GAAWFvcABDG1sbXhuAAWNndABJG0sbWRtyACthgAFlbHAAcQVRG1UbaQBuAOUAyAVhAHIA9AByBWgAMWFmAACgtyJlAGQAtWEAoggiY2ZvdGkbbRt1G3kb4SFyZQCgBSFpAG4AdKAeImkAZQAAoN0pZABvAPQAWxsAoisiY2VscIEbhRuPG5QbYQBsAACguiIAAWdyiRuNG2UAcgDzACMQ4wCCG2EicmhrAACgFyryIW9kAKA8KgACY2dwdJ8boRukG6gbeQBRZG8AbgAvYWYAAOA12FrdYQC5Y3UAZQBzAHQAO4C/AL9AAAFjabUbuRtyAADgNdi+3G4AAKIIIkVkc3bCG8QbyBvQAwCg+SJvAHQAAKD1Inag9CIAoPMiaaBiIOwhZGUpYesB1hsAANkbYwB5AFZkbAA7gO8A70AAA2NmbW9zdeYb7hvyG/Ub+hsFHAABaXnqG+0bcgBjADVhOWRyAADgNdgn3eEhdGg3YnAAZgAA4DXYW93jAf8bAAADHHIAAOA12L/c8iFjeVhk6yFjeVRkAARhY2ZnaGpvcxUcGhwiHCYcKhwtHDAcNRzwIXBhdqC6A/BjAAFleR4cIRzkIWls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ZmdobG1vcHJzdHV3CiwNLBEsHSwnLDEsQCxLLFIsYix6LIQsjyzLLOgs7Sz/LAotcgDyAAkDYQByAACgYykAAWNyFSwbLHUAdABlADuA+gD6QPIACQ1yAOMBIywAACUseQBeZHYAZQBtYQABaXkrLDAscgBjADuA+wD7QENkgAFhYmgANyw6LD0scgDyANEO7CFhY3FhYQDyAOAOAAFpckQsSCzzIWh0AKB+KQDgNdgy3XIAYQB2AGUAO4D5APlAYQFWLF8scgAAAWxyWixcLACgvyEAoL4hbABrAACggCUAAWN0Zix2LG8CbCwAAAAAcyxyAG4AZaAcI3IAAKAcI28AcAAAoA8jcgBpAACg+CUAAWFsfiyBLGMAcgBrYTuAqACoQAABZ3CILIssbwBuAHNhZgAA4DXYZt0AA2FkaGxzdZksniynLLgsuyzFLHIAcgBvAPcACQ1vAHcAbgBhAHIAcgBvAPcA2A5hI3Jwb29uAAABbHKvLLMsZQBmAPQAWyxpAGcAaAD0AF0sdQDzAKYOaQAAocUDaGzBLMIs0mNvAG4AxWPwI2Fycm93cwCgyCGAAWNpdADRLOEs5CxvAtcsAAAAAN4scgBuAGWgHSNyAACgHSNvAHAAAKAOI24AZwBvYXIAaQAAoPklYwByAADgNdjK3IABZGlyAPMs9yz6LG8AdAAAoPAi7CFkZWlhaQBmoLUlAKC0JQABYW0DLQYtcgDyAMosbAA7gPwA/EDhIm5nbGUAoKcpgAdBQkRhY2RlZmxub3Byc3oAJy0qLTAtNC2bLZ0toS2/LcMtxy3TLdgt3C3gLfwtcgDyABADYQByAHag6CoAoOkqYQBzAOgA/gIAAW5yOC08LechcnQAoJwpgANla25wcnN0AJkpSC1NLVQtXi1iLYItYQBwAHAA4QAaHG8AdABoAGkAbgDnAKEXgAFoaXIAoSmzJFotbwBwAPQAdCVooJUh7wD4JgABaXVmLWotZwBtAOEAuygAAWJwbi14LXMjZXRuZXEAceCKIgD+AODLKgD+cyNldG5lcQBx4IsiAP4A4MwqAP4AAWhyhi2KLWUAdADhABIraSNhbmdsZQAAAWxyki2WLeUhZnQAoLIiaSJnaHQAAKCzInkAMmThIXNoAKCiIoABZWxyAKcttC24LWKiKCKuLQAAAACyLWEAcgAAoLsicQAAoFoi7CFpcACg7iIAAWJ0vC1eD2EA8gBfD3IAAOA12DPddAByAOkAlS1zAHUAAAFicM0t0C0A4IIi0iAA4IMi0iBwAGYAAOA12GfdcgBvAPAAWQt0AHIA6QCaLQABY3XkLegtcgAA4DXYy9wAAWJw7C30LW4AAAFFZXUt8S0A4IoiAP5uAAABRWV/LfktAOCLIgD+6SJnemFnAKCaKYADY2Vmb3BycwANLhAuJS4pLiMuLi40LukhcmN1YQABZGkULiEuAAFiZxguHC5hAHIAAKBfKmUAcaAnIgCgWSLlIXJwAKAYIXIAAOA12DTdcABmAADgNdho3WWgQCJhAHQA6ABqD2MAcgAA4DXYzNzjCuQRUC4AAFQuAABYLmIuAAAAAGMubS5wLnQuAAAAAIguki4AAJouJxIqEnQAcgDpAB0ScgAA4DXYNd0AAUFhWy5eLnIA8gDnAnIA8gCTB75jAAFBYWYuaS5yAPIA4AJyAPIAjAdhAPAAeh5pAHMAAKD7IoABZHB0APgReS6DLgABZmx9LoAuAOA12GnddQDzAP8RaQBtAOUABBIAAUFhiy6OLnIA8gDuAnIA8gCaBwABY3GVLgoScgAA4DXYzdwAAXB0nS6hLmwAdQDzACUScgDpACASAARhY2VmaW9zdbEuvC7ELsguzC7PLtQu2S5jAAABdXm2LrsudABlADuA/QD9QE9kAAFpecAuwy5yAGMAd2FLZG4AO4ClAKVAcgAA4DXYNt1jAHkAV2RwAGYAAOA12GrdYwByAADgNdjO3AABY23dLt8ueQBOZGwAO4D/AP9AAAVhY2RlZmhpb3N38y73Lv8uAi8MLxAvEy8YLx0vIi9jInV0ZQB6YQABYXn7Lv4u8iFvbn5hN2RvAHQAfGEAAWV0Bi8KL3QAcgDmAB8QYQC2Y3IAAOA12DfdYwB5ADZk5yJyYXJyAKDdIXAAZgAA4DXYa91jAHIAAOA12M/cAAFqbiYvKC8AoA0gagAAoAwg");
var xmlDecodeTree = /* #__PURE__ */ decodeBase64("AAJhZ2xxBwARABMAFQBtAg0AAAAAAA8AcAAmYG8AcwAnYHQAPmB0ADxg9SFvdCJg");
/**
* Bit flags & masks for the binary trie encoding used for entity decoding.
*
* Bit layout (16 bits total):
* 15..14 VALUE_LENGTH   (+1 encoding; 0 => no value)
* 13     FLAG13.        If valueLength>0: semicolon required flag (implicit ';').
*                       If valueLength==0: compact run flag.
* 12..7  BRANCH_LENGTH  Branch length (0 => single branch in 6..0 if jumpOffset==char) OR run length (when compact run)
* 6..0   JUMP_TABLE     Jump offset (jump table) OR single-branch char code OR first run char
*/
var BinTrieFlags;
(function(BinTrieFlags) {
	BinTrieFlags[BinTrieFlags["VALUE_LENGTH"] = 49152] = "VALUE_LENGTH";
	BinTrieFlags[BinTrieFlags["FLAG13"] = 8192] = "FLAG13";
	BinTrieFlags[BinTrieFlags["BRANCH_LENGTH"] = 8064] = "BRANCH_LENGTH";
	BinTrieFlags[BinTrieFlags["JUMP_TABLE"] = 127] = "JUMP_TABLE";
})(BinTrieFlags || (BinTrieFlags = {}));
var CharCodes$1;
(function(CharCodes) {
	CharCodes[CharCodes["NUM"] = 35] = "NUM";
	CharCodes[CharCodes["SEMI"] = 59] = "SEMI";
	CharCodes[CharCodes["EQUALS"] = 61] = "EQUALS";
	CharCodes[CharCodes["ZERO"] = 48] = "ZERO";
	CharCodes[CharCodes["NINE"] = 57] = "NINE";
	CharCodes[CharCodes["LOWER_A"] = 97] = "LOWER_A";
	CharCodes[CharCodes["LOWER_F"] = 102] = "LOWER_F";
	CharCodes[CharCodes["LOWER_X"] = 120] = "LOWER_X";
	CharCodes[CharCodes["LOWER_Z"] = 122] = "LOWER_Z";
	CharCodes[CharCodes["UPPER_A"] = 65] = "UPPER_A";
	CharCodes[CharCodes["UPPER_F"] = 70] = "UPPER_F";
	CharCodes[CharCodes["UPPER_Z"] = 90] = "UPPER_Z";
})(CharCodes$1 || (CharCodes$1 = {}));
/** Bit that needs to be set to convert an upper case ASCII character to lower case */
var TO_LOWER_BIT = 32;
function isNumber(code) {
	return code >= CharCodes$1.ZERO && code <= CharCodes$1.NINE;
}
function isHexadecimalCharacter(code) {
	return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_F || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_F;
}
function isAsciiAlphaNumeric(code) {
	return code >= CharCodes$1.UPPER_A && code <= CharCodes$1.UPPER_Z || code >= CharCodes$1.LOWER_A && code <= CharCodes$1.LOWER_Z || isNumber(code);
}
/**
* Checks if the given character is a valid end character for an entity in an attribute.
*
* Attribute values that aren't terminated properly aren't parsed, and shouldn't lead to a parser error.
* See the example in https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
*/
function isEntityInAttributeInvalidEnd(code) {
	return code === CharCodes$1.EQUALS || isAsciiAlphaNumeric(code);
}
var EntityDecoderState;
(function(EntityDecoderState) {
	EntityDecoderState[EntityDecoderState["EntityStart"] = 0] = "EntityStart";
	EntityDecoderState[EntityDecoderState["NumericStart"] = 1] = "NumericStart";
	EntityDecoderState[EntityDecoderState["NumericDecimal"] = 2] = "NumericDecimal";
	EntityDecoderState[EntityDecoderState["NumericHex"] = 3] = "NumericHex";
	EntityDecoderState[EntityDecoderState["NamedEntity"] = 4] = "NamedEntity";
})(EntityDecoderState || (EntityDecoderState = {}));
var DecodingMode;
(function(DecodingMode) {
	/** Entities in text nodes that can end with any character. */
	DecodingMode[DecodingMode["Legacy"] = 0] = "Legacy";
	/** Only allow entities terminated with a semicolon. */
	DecodingMode[DecodingMode["Strict"] = 1] = "Strict";
	/** Entities in attributes have limitations on ending characters. */
	DecodingMode[DecodingMode["Attribute"] = 2] = "Attribute";
})(DecodingMode || (DecodingMode = {}));
/**
* Token decoder with support of writing partial entities.
*/
var EntityDecoder = class {
	constructor(decodeTree, emitCodePoint, errors) {
		this.decodeTree = decodeTree;
		this.emitCodePoint = emitCodePoint;
		this.errors = errors;
		/** The current state of the decoder. */
		this.state = EntityDecoderState.EntityStart;
		/** Characters that were consumed while parsing an entity. */
		this.consumed = 1;
		/**
		* The result of the entity.
		*
		* Either the result index of a numeric entity, or the codepoint of a
		* numeric entity.
		*/
		this.result = 0;
		/** The current index in the decode tree. */
		this.treeIndex = 0;
		/** The number of characters that were consumed in excess. */
		this.excess = 1;
		/** The mode in which the decoder is operating. */
		this.decodeMode = DecodingMode.Strict;
		/** The number of characters that have been consumed in the current run. */
		this.runConsumed = 0;
	}
	/** Resets the instance to make it reusable. */
	startEntity(decodeMode) {
		this.decodeMode = decodeMode;
		this.state = EntityDecoderState.EntityStart;
		this.result = 0;
		this.treeIndex = 0;
		this.excess = 1;
		this.consumed = 1;
		this.runConsumed = 0;
	}
	/**
	* Write an entity to the decoder. This can be called multiple times with partial entities.
	* If the entity is incomplete, the decoder will return -1.
	*
	* Mirrors the implementation of `getDecoder`, but with the ability to stop decoding if the
	* entity is incomplete, and resume when the next string is written.
	*
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The offset at which the entity begins. Should be 0 if this is not the first call.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	write(input, offset) {
		switch (this.state) {
			case EntityDecoderState.EntityStart:
				if (input.charCodeAt(offset) === CharCodes$1.NUM) {
					this.state = EntityDecoderState.NumericStart;
					this.consumed += 1;
					return this.stateNumericStart(input, offset + 1);
				}
				this.state = EntityDecoderState.NamedEntity;
				return this.stateNamedEntity(input, offset);
			case EntityDecoderState.NumericStart: return this.stateNumericStart(input, offset);
			case EntityDecoderState.NumericDecimal: return this.stateNumericDecimal(input, offset);
			case EntityDecoderState.NumericHex: return this.stateNumericHex(input, offset);
			case EntityDecoderState.NamedEntity: return this.stateNamedEntity(input, offset);
		}
	}
	/**
	* Switches between the numeric decimal and hexadecimal states.
	*
	* Equivalent to the `Numeric character reference state` in the HTML spec.
	*
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericStart(input, offset) {
		if (offset >= input.length) return -1;
		if ((input.charCodeAt(offset) | TO_LOWER_BIT) === CharCodes$1.LOWER_X) {
			this.state = EntityDecoderState.NumericHex;
			this.consumed += 1;
			return this.stateNumericHex(input, offset + 1);
		}
		this.state = EntityDecoderState.NumericDecimal;
		return this.stateNumericDecimal(input, offset);
	}
	/**
	* Parses a hexadecimal numeric entity.
	*
	* Equivalent to the `Hexademical character reference state` in the HTML spec.
	*
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericHex(input, offset) {
		while (offset < input.length) {
			const char = input.charCodeAt(offset);
			if (isNumber(char) || isHexadecimalCharacter(char)) {
				const digit = char <= CharCodes$1.NINE ? char - CharCodes$1.ZERO : (char | TO_LOWER_BIT) - CharCodes$1.LOWER_A + 10;
				this.result = this.result * 16 + digit;
				this.consumed++;
				offset++;
			} else return this.emitNumericEntity(char, 3);
		}
		return -1;
	}
	/**
	* Parses a decimal numeric entity.
	*
	* Equivalent to the `Decimal character reference state` in the HTML spec.
	*
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNumericDecimal(input, offset) {
		while (offset < input.length) {
			const char = input.charCodeAt(offset);
			if (isNumber(char)) {
				this.result = this.result * 10 + (char - CharCodes$1.ZERO);
				this.consumed++;
				offset++;
			} else return this.emitNumericEntity(char, 2);
		}
		return -1;
	}
	/**
	* Validate and emit a numeric entity.
	*
	* Implements the logic from the `Hexademical character reference start
	* state` and `Numeric character reference end state` in the HTML spec.
	*
	* @param lastCp The last code point of the entity. Used to see if the
	*               entity was terminated with a semicolon.
	* @param expectedLength The minimum number of characters that should be
	*                       consumed. Used to validate that at least one digit
	*                       was consumed.
	* @returns The number of characters that were consumed.
	*/
	emitNumericEntity(lastCp, expectedLength) {
		var _a;
		if (this.consumed <= expectedLength) {
			(_a = this.errors) === null || _a === void 0 || _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
			return 0;
		}
		if (lastCp === CharCodes$1.SEMI) this.consumed += 1;
		else if (this.decodeMode === DecodingMode.Strict) return 0;
		this.emitCodePoint(replaceCodePoint(this.result), this.consumed);
		if (this.errors) {
			if (lastCp !== CharCodes$1.SEMI) this.errors.missingSemicolonAfterCharacterReference();
			this.errors.validateNumericCharacterReference(this.result);
		}
		return this.consumed;
	}
	/**
	* Parses a named entity.
	*
	* Equivalent to the `Named character reference state` in the HTML spec.
	*
	* @param input The string containing the entity (or a continuation of the entity).
	* @param offset The current offset.
	* @returns The number of characters that were consumed, or -1 if the entity is incomplete.
	*/
	stateNamedEntity(input, offset) {
		const { decodeTree } = this;
		let current = decodeTree[this.treeIndex];
		let valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
		while (offset < input.length) {
			if (valueLength === 0 && (current & BinTrieFlags.FLAG13) !== 0) {
				const runLength = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
				if (this.runConsumed === 0) {
					const firstChar = current & BinTrieFlags.JUMP_TABLE;
					if (input.charCodeAt(offset) !== firstChar) return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
					offset++;
					this.excess++;
					this.runConsumed++;
				}
				while (this.runConsumed < runLength) {
					if (offset >= input.length) return -1;
					const charIndexInPacked = this.runConsumed - 1;
					const packedWord = decodeTree[this.treeIndex + 1 + (charIndexInPacked >> 1)];
					const expectedChar = charIndexInPacked % 2 === 0 ? packedWord & 255 : packedWord >> 8 & 255;
					if (input.charCodeAt(offset) !== expectedChar) {
						this.runConsumed = 0;
						return this.result === 0 ? 0 : this.emitNotTerminatedNamedEntity();
					}
					offset++;
					this.excess++;
					this.runConsumed++;
				}
				this.runConsumed = 0;
				this.treeIndex += 1 + (runLength >> 1);
				current = decodeTree[this.treeIndex];
				valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
			}
			if (offset >= input.length) break;
			const char = input.charCodeAt(offset);
			if (char === CharCodes$1.SEMI && valueLength !== 0 && (current & BinTrieFlags.FLAG13) !== 0) return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
			this.treeIndex = determineBranch(decodeTree, current, this.treeIndex + Math.max(1, valueLength), char);
			if (this.treeIndex < 0) return this.result === 0 || this.decodeMode === DecodingMode.Attribute && (valueLength === 0 || isEntityInAttributeInvalidEnd(char)) ? 0 : this.emitNotTerminatedNamedEntity();
			current = decodeTree[this.treeIndex];
			valueLength = (current & BinTrieFlags.VALUE_LENGTH) >> 14;
			if (valueLength !== 0) {
				if (char === CharCodes$1.SEMI) return this.emitNamedEntityData(this.treeIndex, valueLength, this.consumed + this.excess);
				if (this.decodeMode !== DecodingMode.Strict && (current & BinTrieFlags.FLAG13) === 0) {
					this.result = this.treeIndex;
					this.consumed += this.excess;
					this.excess = 0;
				}
			}
			offset++;
			this.excess++;
		}
		return -1;
	}
	/**
	* Emit a named entity that was not terminated with a semicolon.
	*
	* @returns The number of characters consumed.
	*/
	emitNotTerminatedNamedEntity() {
		var _a;
		const { result, decodeTree } = this;
		const valueLength = (decodeTree[result] & BinTrieFlags.VALUE_LENGTH) >> 14;
		this.emitNamedEntityData(result, valueLength, this.consumed);
		(_a = this.errors) === null || _a === void 0 || _a.missingSemicolonAfterCharacterReference();
		return this.consumed;
	}
	/**
	* Emit a named entity.
	*
	* @param result The index of the entity in the decode tree.
	* @param valueLength The number of bytes in the entity.
	* @param consumed The number of characters consumed.
	*
	* @returns The number of characters consumed.
	*/
	emitNamedEntityData(result, valueLength, consumed) {
		const { decodeTree } = this;
		this.emitCodePoint(valueLength === 1 ? decodeTree[result] & ~(BinTrieFlags.VALUE_LENGTH | BinTrieFlags.FLAG13) : decodeTree[result + 1], consumed);
		if (valueLength === 3) this.emitCodePoint(decodeTree[result + 2], consumed);
		return consumed;
	}
	/**
	* Signal to the parser that the end of the input was reached.
	*
	* Remaining data will be emitted and relevant errors will be produced.
	*
	* @returns The number of characters consumed.
	*/
	end() {
		var _a;
		switch (this.state) {
			case EntityDecoderState.NamedEntity: return this.result !== 0 && (this.decodeMode !== DecodingMode.Attribute || this.result === this.treeIndex) ? this.emitNotTerminatedNamedEntity() : 0;
			case EntityDecoderState.NumericDecimal: return this.emitNumericEntity(0, 2);
			case EntityDecoderState.NumericHex: return this.emitNumericEntity(0, 3);
			case EntityDecoderState.NumericStart:
				(_a = this.errors) === null || _a === void 0 || _a.absenceOfDigitsInNumericCharacterReference(this.consumed);
				return 0;
			case EntityDecoderState.EntityStart: return 0;
		}
	}
};
/**
* Determines the branch of the current node that is taken given the current
* character. This function is used to traverse the trie.
*
* @param decodeTree The trie.
* @param current The current node.
* @param nodeIdx The index right after the current node and its value.
* @param char The current character.
* @returns The index of the next node, or -1 if no branch is taken.
*/
function determineBranch(decodeTree, current, nodeIndex, char) {
	const branchCount = (current & BinTrieFlags.BRANCH_LENGTH) >> 7;
	const jumpOffset = current & BinTrieFlags.JUMP_TABLE;
	if (branchCount === 0) return jumpOffset !== 0 && char === jumpOffset ? nodeIndex : -1;
	if (jumpOffset) {
		const value = char - jumpOffset;
		return value < 0 || value >= branchCount ? -1 : decodeTree[nodeIndex + value] - 1;
	}
	const packedKeySlots = branchCount + 1 >> 1;
	let lo = 0;
	let hi = branchCount - 1;
	while (lo <= hi) {
		const mid = lo + hi >>> 1;
		const midKey = decodeTree[nodeIndex + (mid >> 1)] >> (mid & 1) * 8 & 255;
		if (midKey < char) lo = mid + 1;
		else if (midKey > char) hi = mid - 1;
		else return decodeTree[nodeIndex + packedKeySlots + mid];
	}
	return -1;
}
var CharCodes;
(function(CharCodes) {
	CharCodes[CharCodes["Tab"] = 9] = "Tab";
	CharCodes[CharCodes["NewLine"] = 10] = "NewLine";
	CharCodes[CharCodes["FormFeed"] = 12] = "FormFeed";
	CharCodes[CharCodes["CarriageReturn"] = 13] = "CarriageReturn";
	CharCodes[CharCodes["Space"] = 32] = "Space";
	CharCodes[CharCodes["ExclamationMark"] = 33] = "ExclamationMark";
	CharCodes[CharCodes["Number"] = 35] = "Number";
	CharCodes[CharCodes["Amp"] = 38] = "Amp";
	CharCodes[CharCodes["SingleQuote"] = 39] = "SingleQuote";
	CharCodes[CharCodes["DoubleQuote"] = 34] = "DoubleQuote";
	CharCodes[CharCodes["Dash"] = 45] = "Dash";
	CharCodes[CharCodes["Slash"] = 47] = "Slash";
	CharCodes[CharCodes["Zero"] = 48] = "Zero";
	CharCodes[CharCodes["Nine"] = 57] = "Nine";
	CharCodes[CharCodes["Semi"] = 59] = "Semi";
	CharCodes[CharCodes["Lt"] = 60] = "Lt";
	CharCodes[CharCodes["Eq"] = 61] = "Eq";
	CharCodes[CharCodes["Gt"] = 62] = "Gt";
	CharCodes[CharCodes["Questionmark"] = 63] = "Questionmark";
	CharCodes[CharCodes["UpperA"] = 65] = "UpperA";
	CharCodes[CharCodes["LowerA"] = 97] = "LowerA";
	CharCodes[CharCodes["UpperF"] = 70] = "UpperF";
	CharCodes[CharCodes["LowerF"] = 102] = "LowerF";
	CharCodes[CharCodes["UpperZ"] = 90] = "UpperZ";
	CharCodes[CharCodes["LowerZ"] = 122] = "LowerZ";
	CharCodes[CharCodes["LowerX"] = 120] = "LowerX";
	CharCodes[CharCodes["OpeningSquareBracket"] = 91] = "OpeningSquareBracket";
})(CharCodes || (CharCodes = {}));
/** All the states the tokenizer can be in. */
var State;
(function(State) {
	State[State["Text"] = 1] = "Text";
	State[State["BeforeTagName"] = 2] = "BeforeTagName";
	State[State["InTagName"] = 3] = "InTagName";
	State[State["InSelfClosingTag"] = 4] = "InSelfClosingTag";
	State[State["BeforeClosingTagName"] = 5] = "BeforeClosingTagName";
	State[State["InClosingTagName"] = 6] = "InClosingTagName";
	State[State["AfterClosingTagName"] = 7] = "AfterClosingTagName";
	State[State["BeforeAttributeName"] = 8] = "BeforeAttributeName";
	State[State["InAttributeName"] = 9] = "InAttributeName";
	State[State["AfterAttributeName"] = 10] = "AfterAttributeName";
	State[State["BeforeAttributeValue"] = 11] = "BeforeAttributeValue";
	State[State["InAttributeValueDq"] = 12] = "InAttributeValueDq";
	State[State["InAttributeValueSq"] = 13] = "InAttributeValueSq";
	State[State["InAttributeValueNq"] = 14] = "InAttributeValueNq";
	State[State["BeforeDeclaration"] = 15] = "BeforeDeclaration";
	State[State["InDeclaration"] = 16] = "InDeclaration";
	State[State["InProcessingInstruction"] = 17] = "InProcessingInstruction";
	State[State["BeforeComment"] = 18] = "BeforeComment";
	State[State["CDATASequence"] = 19] = "CDATASequence";
	State[State["InSpecialComment"] = 20] = "InSpecialComment";
	State[State["InCommentLike"] = 21] = "InCommentLike";
	State[State["BeforeSpecialS"] = 22] = "BeforeSpecialS";
	State[State["BeforeSpecialT"] = 23] = "BeforeSpecialT";
	State[State["SpecialStartSequence"] = 24] = "SpecialStartSequence";
	State[State["InSpecialTag"] = 25] = "InSpecialTag";
	State[State["InEntity"] = 26] = "InEntity";
})(State || (State = {}));
function isWhitespace(c) {
	return c === CharCodes.Space || c === CharCodes.NewLine || c === CharCodes.Tab || c === CharCodes.FormFeed || c === CharCodes.CarriageReturn;
}
function isEndOfTagSection(c) {
	return c === CharCodes.Slash || c === CharCodes.Gt || isWhitespace(c);
}
function isASCIIAlpha(c) {
	return c >= CharCodes.LowerA && c <= CharCodes.LowerZ || c >= CharCodes.UpperA && c <= CharCodes.UpperZ;
}
var QuoteType;
(function(QuoteType) {
	QuoteType[QuoteType["NoValue"] = 0] = "NoValue";
	QuoteType[QuoteType["Unquoted"] = 1] = "Unquoted";
	QuoteType[QuoteType["Single"] = 2] = "Single";
	QuoteType[QuoteType["Double"] = 3] = "Double";
})(QuoteType || (QuoteType = {}));
/**
* Sequences used to match longer strings.
*
* We don't have `Script`, `Style`, or `Title` here. Instead, we re-use the *End
* sequences with an increased offset.
*/
var Sequences = {
	Cdata: new Uint8Array([
		67,
		68,
		65,
		84,
		65,
		91
	]),
	CdataEnd: new Uint8Array([
		93,
		93,
		62
	]),
	CommentEnd: new Uint8Array([
		45,
		45,
		62
	]),
	ScriptEnd: new Uint8Array([
		60,
		47,
		115,
		99,
		114,
		105,
		112,
		116
	]),
	StyleEnd: new Uint8Array([
		60,
		47,
		115,
		116,
		121,
		108,
		101
	]),
	TitleEnd: new Uint8Array([
		60,
		47,
		116,
		105,
		116,
		108,
		101
	]),
	TextareaEnd: new Uint8Array([
		60,
		47,
		116,
		101,
		120,
		116,
		97,
		114,
		101,
		97
	]),
	XmpEnd: new Uint8Array([
		60,
		47,
		120,
		109,
		112
	])
};
var Tokenizer = class {
	constructor({ xmlMode = false, decodeEntities = true }, cbs) {
		this.cbs = cbs;
		/** The current state the tokenizer is in. */
		this.state = State.Text;
		/** The read buffer. */
		this.buffer = "";
		/** The beginning of the section that is currently being read. */
		this.sectionStart = 0;
		/** The index within the buffer that we are currently looking at. */
		this.index = 0;
		/** The start of the last entity. */
		this.entityStart = 0;
		/** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */
		this.baseState = State.Text;
		/** For special parsing behavior inside of script and style tags. */
		this.isSpecial = false;
		/** Indicates whether the tokenizer has been paused. */
		this.running = true;
		/** The offset of the current buffer. */
		this.offset = 0;
		this.currentSequence = void 0;
		this.sequenceIndex = 0;
		this.xmlMode = xmlMode;
		this.decodeEntities = decodeEntities;
		this.entityDecoder = new EntityDecoder(xmlMode ? xmlDecodeTree : htmlDecodeTree, (cp, consumed) => this.emitCodePoint(cp, consumed));
	}
	reset() {
		this.state = State.Text;
		this.buffer = "";
		this.sectionStart = 0;
		this.index = 0;
		this.baseState = State.Text;
		this.currentSequence = void 0;
		this.running = true;
		this.offset = 0;
	}
	write(chunk) {
		this.offset += this.buffer.length;
		this.buffer = chunk;
		this.parse();
	}
	end() {
		if (this.running) this.finish();
	}
	pause() {
		this.running = false;
	}
	resume() {
		this.running = true;
		if (this.index < this.buffer.length + this.offset) this.parse();
	}
	stateText(c) {
		if (c === CharCodes.Lt || !this.decodeEntities && this.fastForwardTo(CharCodes.Lt)) {
			if (this.index > this.sectionStart) this.cbs.ontext(this.sectionStart, this.index);
			this.state = State.BeforeTagName;
			this.sectionStart = this.index;
		} else if (this.decodeEntities && c === CharCodes.Amp) this.startEntity();
	}
	stateSpecialStartSequence(c) {
		const isEnd = this.sequenceIndex === this.currentSequence.length;
		if (!(isEnd ? isEndOfTagSection(c) : (c | 32) === this.currentSequence[this.sequenceIndex])) this.isSpecial = false;
		else if (!isEnd) {
			this.sequenceIndex++;
			return;
		}
		this.sequenceIndex = 0;
		this.state = State.InTagName;
		this.stateInTagName(c);
	}
	/** Look for an end tag. For <title> tags, also decode entities. */
	stateInSpecialTag(c) {
		if (this.sequenceIndex === this.currentSequence.length) {
			if (c === CharCodes.Gt || isWhitespace(c)) {
				const endOfText = this.index - this.currentSequence.length;
				if (this.sectionStart < endOfText) {
					const actualIndex = this.index;
					this.index = endOfText;
					this.cbs.ontext(this.sectionStart, endOfText);
					this.index = actualIndex;
				}
				this.isSpecial = false;
				this.sectionStart = endOfText + 2;
				this.stateInClosingTagName(c);
				return;
			}
			this.sequenceIndex = 0;
		}
		if ((c | 32) === this.currentSequence[this.sequenceIndex]) this.sequenceIndex += 1;
		else if (this.sequenceIndex === 0) {
			if (this.currentSequence === Sequences.TitleEnd) {
				if (this.decodeEntities && c === CharCodes.Amp) this.startEntity();
			} else if (this.fastForwardTo(CharCodes.Lt)) this.sequenceIndex = 1;
		} else this.sequenceIndex = Number(c === CharCodes.Lt);
	}
	stateCDATASequence(c) {
		if (c === Sequences.Cdata[this.sequenceIndex]) {
			if (++this.sequenceIndex === Sequences.Cdata.length) {
				this.state = State.InCommentLike;
				this.currentSequence = Sequences.CdataEnd;
				this.sequenceIndex = 0;
				this.sectionStart = this.index + 1;
			}
		} else {
			this.sequenceIndex = 0;
			this.state = State.InDeclaration;
			this.stateInDeclaration(c);
		}
	}
	/**
	* When we wait for one specific character, we can speed things up
	* by skipping through the buffer until we find it.
	*
	* @returns Whether the character was found.
	*/
	fastForwardTo(c) {
		while (++this.index < this.buffer.length + this.offset) if (this.buffer.charCodeAt(this.index - this.offset) === c) return true;
		this.index = this.buffer.length + this.offset - 1;
		return false;
	}
	/**
	* Comments and CDATA end with `-->` and `]]>`.
	*
	* Their common qualities are:
	* - Their end sequences have a distinct character they start with.
	* - That character is then repeated, so we have to check multiple repeats.
	* - All characters but the start character of the sequence can be skipped.
	*/
	stateInCommentLike(c) {
		if (c === this.currentSequence[this.sequenceIndex]) {
			if (++this.sequenceIndex === this.currentSequence.length) {
				if (this.currentSequence === Sequences.CdataEnd) this.cbs.oncdata(this.sectionStart, this.index, 2);
				else this.cbs.oncomment(this.sectionStart, this.index, 2);
				this.sequenceIndex = 0;
				this.sectionStart = this.index + 1;
				this.state = State.Text;
			}
		} else if (this.sequenceIndex === 0) {
			if (this.fastForwardTo(this.currentSequence[0])) this.sequenceIndex = 1;
		} else if (c !== this.currentSequence[this.sequenceIndex - 1]) this.sequenceIndex = 0;
	}
	/**
	* HTML only allows ASCII alpha characters (a-z and A-Z) at the beginning of a tag name.
	*
	* XML allows a lot more characters here (@see https://www.w3.org/TR/REC-xml/#NT-NameStartChar).
	* We allow anything that wouldn't end the tag.
	*/
	isTagStartChar(c) {
		return this.xmlMode ? !isEndOfTagSection(c) : isASCIIAlpha(c);
	}
	startSpecial(sequence, offset) {
		this.isSpecial = true;
		this.currentSequence = sequence;
		this.sequenceIndex = offset;
		this.state = State.SpecialStartSequence;
	}
	stateBeforeTagName(c) {
		if (c === CharCodes.ExclamationMark) {
			this.state = State.BeforeDeclaration;
			this.sectionStart = this.index + 1;
		} else if (c === CharCodes.Questionmark) {
			this.state = State.InProcessingInstruction;
			this.sectionStart = this.index + 1;
		} else if (this.isTagStartChar(c)) {
			const lower = c | 32;
			this.sectionStart = this.index;
			if (this.xmlMode) this.state = State.InTagName;
			else if (lower === Sequences.ScriptEnd[2]) this.state = State.BeforeSpecialS;
			else if (lower === Sequences.TitleEnd[2] || lower === Sequences.XmpEnd[2]) this.state = State.BeforeSpecialT;
			else this.state = State.InTagName;
		} else if (c === CharCodes.Slash) this.state = State.BeforeClosingTagName;
		else {
			this.state = State.Text;
			this.stateText(c);
		}
	}
	stateInTagName(c) {
		if (isEndOfTagSection(c)) {
			this.cbs.onopentagname(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		}
	}
	stateBeforeClosingTagName(c) {
		if (isWhitespace(c));
		else if (c === CharCodes.Gt) this.state = State.Text;
		else {
			this.state = this.isTagStartChar(c) ? State.InClosingTagName : State.InSpecialComment;
			this.sectionStart = this.index;
		}
	}
	stateInClosingTagName(c) {
		if (c === CharCodes.Gt || isWhitespace(c)) {
			this.cbs.onclosetag(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.state = State.AfterClosingTagName;
			this.stateAfterClosingTagName(c);
		}
	}
	stateAfterClosingTagName(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateBeforeAttributeName(c) {
		if (c === CharCodes.Gt) {
			this.cbs.onopentagend(this.index);
			if (this.isSpecial) {
				this.state = State.InSpecialTag;
				this.sequenceIndex = 0;
			} else this.state = State.Text;
			this.sectionStart = this.index + 1;
		} else if (c === CharCodes.Slash) this.state = State.InSelfClosingTag;
		else if (!isWhitespace(c)) {
			this.state = State.InAttributeName;
			this.sectionStart = this.index;
		}
	}
	stateInSelfClosingTag(c) {
		if (c === CharCodes.Gt) {
			this.cbs.onselfclosingtag(this.index);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
			this.isSpecial = false;
		} else if (!isWhitespace(c)) {
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		}
	}
	stateInAttributeName(c) {
		if (c === CharCodes.Eq || isEndOfTagSection(c)) {
			this.cbs.onattribname(this.sectionStart, this.index);
			this.sectionStart = this.index;
			this.state = State.AfterAttributeName;
			this.stateAfterAttributeName(c);
		}
	}
	stateAfterAttributeName(c) {
		if (c === CharCodes.Eq) this.state = State.BeforeAttributeValue;
		else if (c === CharCodes.Slash || c === CharCodes.Gt) {
			this.cbs.onattribend(QuoteType.NoValue, this.sectionStart);
			this.sectionStart = -1;
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		} else if (!isWhitespace(c)) {
			this.cbs.onattribend(QuoteType.NoValue, this.sectionStart);
			this.state = State.InAttributeName;
			this.sectionStart = this.index;
		}
	}
	stateBeforeAttributeValue(c) {
		if (c === CharCodes.DoubleQuote) {
			this.state = State.InAttributeValueDq;
			this.sectionStart = this.index + 1;
		} else if (c === CharCodes.SingleQuote) {
			this.state = State.InAttributeValueSq;
			this.sectionStart = this.index + 1;
		} else if (!isWhitespace(c)) {
			this.sectionStart = this.index;
			this.state = State.InAttributeValueNq;
			this.stateInAttributeValueNoQuotes(c);
		}
	}
	handleInAttributeValue(c, quote) {
		if (c === quote || !this.decodeEntities && this.fastForwardTo(quote)) {
			this.cbs.onattribdata(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.cbs.onattribend(quote === CharCodes.DoubleQuote ? QuoteType.Double : QuoteType.Single, this.index + 1);
			this.state = State.BeforeAttributeName;
		} else if (this.decodeEntities && c === CharCodes.Amp) this.startEntity();
	}
	stateInAttributeValueDoubleQuotes(c) {
		this.handleInAttributeValue(c, CharCodes.DoubleQuote);
	}
	stateInAttributeValueSingleQuotes(c) {
		this.handleInAttributeValue(c, CharCodes.SingleQuote);
	}
	stateInAttributeValueNoQuotes(c) {
		if (isWhitespace(c) || c === CharCodes.Gt) {
			this.cbs.onattribdata(this.sectionStart, this.index);
			this.sectionStart = -1;
			this.cbs.onattribend(QuoteType.Unquoted, this.index);
			this.state = State.BeforeAttributeName;
			this.stateBeforeAttributeName(c);
		} else if (this.decodeEntities && c === CharCodes.Amp) this.startEntity();
	}
	stateBeforeDeclaration(c) {
		if (c === CharCodes.OpeningSquareBracket) {
			this.state = State.CDATASequence;
			this.sequenceIndex = 0;
		} else this.state = c === CharCodes.Dash ? State.BeforeComment : State.InDeclaration;
	}
	stateInDeclaration(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.cbs.ondeclaration(this.sectionStart, this.index);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateInProcessingInstruction(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.cbs.onprocessinginstruction(this.sectionStart, this.index);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateBeforeComment(c) {
		if (c === CharCodes.Dash) {
			this.state = State.InCommentLike;
			this.currentSequence = Sequences.CommentEnd;
			this.sequenceIndex = 2;
			this.sectionStart = this.index + 1;
		} else this.state = State.InDeclaration;
	}
	stateInSpecialComment(c) {
		if (c === CharCodes.Gt || this.fastForwardTo(CharCodes.Gt)) {
			this.cbs.oncomment(this.sectionStart, this.index, 0);
			this.state = State.Text;
			this.sectionStart = this.index + 1;
		}
	}
	stateBeforeSpecialS(c) {
		const lower = c | 32;
		if (lower === Sequences.ScriptEnd[3]) this.startSpecial(Sequences.ScriptEnd, 4);
		else if (lower === Sequences.StyleEnd[3]) this.startSpecial(Sequences.StyleEnd, 4);
		else {
			this.state = State.InTagName;
			this.stateInTagName(c);
		}
	}
	stateBeforeSpecialT(c) {
		switch (c | 32) {
			case Sequences.TitleEnd[3]:
				this.startSpecial(Sequences.TitleEnd, 4);
				break;
			case Sequences.TextareaEnd[3]:
				this.startSpecial(Sequences.TextareaEnd, 4);
				break;
			case Sequences.XmpEnd[3]:
				this.startSpecial(Sequences.XmpEnd, 4);
				break;
			default:
				this.state = State.InTagName;
				this.stateInTagName(c);
		}
	}
	startEntity() {
		this.baseState = this.state;
		this.state = State.InEntity;
		this.entityStart = this.index;
		this.entityDecoder.startEntity(this.xmlMode ? DecodingMode.Strict : this.baseState === State.Text || this.baseState === State.InSpecialTag ? DecodingMode.Legacy : DecodingMode.Attribute);
	}
	stateInEntity() {
		const indexInBuffer = this.index - this.offset;
		const length = this.entityDecoder.write(this.buffer, indexInBuffer);
		if (length >= 0) {
			this.state = this.baseState;
			if (length === 0) this.index -= 1;
		} else {
			if (indexInBuffer < this.buffer.length && this.buffer.charCodeAt(indexInBuffer) === CharCodes.Amp) {
				this.state = this.baseState;
				this.index -= 1;
				return;
			}
			this.index = this.offset + this.buffer.length - 1;
		}
	}
	/**
	* Remove data that has already been consumed from the buffer.
	*/
	cleanup() {
		if (this.running && this.sectionStart !== this.index) {
			if (this.state === State.Text || this.state === State.InSpecialTag && this.sequenceIndex === 0) {
				this.cbs.ontext(this.sectionStart, this.index);
				this.sectionStart = this.index;
			} else if (this.state === State.InAttributeValueDq || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueNq) {
				this.cbs.onattribdata(this.sectionStart, this.index);
				this.sectionStart = this.index;
			}
		}
	}
	shouldContinue() {
		return this.index < this.buffer.length + this.offset && this.running;
	}
	/**
	* Iterates through the buffer, calling the function corresponding to the current state.
	*
	* States that are more likely to be hit are higher up, as a performance improvement.
	*/
	parse() {
		while (this.shouldContinue()) {
			const c = this.buffer.charCodeAt(this.index - this.offset);
			switch (this.state) {
				case State.Text:
					this.stateText(c);
					break;
				case State.SpecialStartSequence:
					this.stateSpecialStartSequence(c);
					break;
				case State.InSpecialTag:
					this.stateInSpecialTag(c);
					break;
				case State.CDATASequence:
					this.stateCDATASequence(c);
					break;
				case State.InAttributeValueDq:
					this.stateInAttributeValueDoubleQuotes(c);
					break;
				case State.InAttributeName:
					this.stateInAttributeName(c);
					break;
				case State.InCommentLike:
					this.stateInCommentLike(c);
					break;
				case State.InSpecialComment:
					this.stateInSpecialComment(c);
					break;
				case State.BeforeAttributeName:
					this.stateBeforeAttributeName(c);
					break;
				case State.InTagName:
					this.stateInTagName(c);
					break;
				case State.InClosingTagName:
					this.stateInClosingTagName(c);
					break;
				case State.BeforeTagName:
					this.stateBeforeTagName(c);
					break;
				case State.AfterAttributeName:
					this.stateAfterAttributeName(c);
					break;
				case State.InAttributeValueSq:
					this.stateInAttributeValueSingleQuotes(c);
					break;
				case State.BeforeAttributeValue:
					this.stateBeforeAttributeValue(c);
					break;
				case State.BeforeClosingTagName:
					this.stateBeforeClosingTagName(c);
					break;
				case State.AfterClosingTagName:
					this.stateAfterClosingTagName(c);
					break;
				case State.BeforeSpecialS:
					this.stateBeforeSpecialS(c);
					break;
				case State.BeforeSpecialT:
					this.stateBeforeSpecialT(c);
					break;
				case State.InAttributeValueNq:
					this.stateInAttributeValueNoQuotes(c);
					break;
				case State.InSelfClosingTag:
					this.stateInSelfClosingTag(c);
					break;
				case State.InDeclaration:
					this.stateInDeclaration(c);
					break;
				case State.BeforeDeclaration:
					this.stateBeforeDeclaration(c);
					break;
				case State.BeforeComment:
					this.stateBeforeComment(c);
					break;
				case State.InProcessingInstruction:
					this.stateInProcessingInstruction(c);
					break;
				case State.InEntity:
					this.stateInEntity();
					break;
			}
			this.index++;
		}
		this.cleanup();
	}
	finish() {
		if (this.state === State.InEntity) {
			this.entityDecoder.end();
			this.state = this.baseState;
		}
		this.handleTrailingData();
		this.cbs.onend();
	}
	/** Handle any trailing data. */
	handleTrailingData() {
		const endIndex = this.buffer.length + this.offset;
		if (this.sectionStart >= endIndex) return;
		if (this.state === State.InCommentLike) if (this.currentSequence === Sequences.CdataEnd) this.cbs.oncdata(this.sectionStart, endIndex, 0);
		else this.cbs.oncomment(this.sectionStart, endIndex, 0);
		else if (this.state === State.InTagName || this.state === State.BeforeAttributeName || this.state === State.BeforeAttributeValue || this.state === State.AfterAttributeName || this.state === State.InAttributeName || this.state === State.InAttributeValueSq || this.state === State.InAttributeValueDq || this.state === State.InAttributeValueNq || this.state === State.InClosingTagName);
		else this.cbs.ontext(this.sectionStart, endIndex);
	}
	emitCodePoint(cp, consumed) {
		if (this.baseState !== State.Text && this.baseState !== State.InSpecialTag) {
			if (this.sectionStart < this.entityStart) this.cbs.onattribdata(this.sectionStart, this.entityStart);
			this.sectionStart = this.entityStart + consumed;
			this.index = this.sectionStart - 1;
			this.cbs.onattribentity(cp);
		} else {
			if (this.sectionStart < this.entityStart) this.cbs.ontext(this.sectionStart, this.entityStart);
			this.sectionStart = this.entityStart + consumed;
			this.index = this.sectionStart - 1;
			this.cbs.ontextentity(cp, this.sectionStart);
		}
	}
};
var formTags = /* @__PURE__ */ new Set([
	"input",
	"option",
	"optgroup",
	"select",
	"button",
	"datalist",
	"textarea"
]);
var pTag = /* @__PURE__ */ new Set(["p"]);
var tableSectionTags = /* @__PURE__ */ new Set(["thead", "tbody"]);
var ddtTags = /* @__PURE__ */ new Set(["dd", "dt"]);
var rtpTags = /* @__PURE__ */ new Set(["rt", "rp"]);
var openImpliesClose = /* @__PURE__ */ new Map([
	["tr", /* @__PURE__ */ new Set([
		"tr",
		"th",
		"td"
	])],
	["th", /* @__PURE__ */ new Set(["th"])],
	["td", /* @__PURE__ */ new Set([
		"thead",
		"th",
		"td"
	])],
	["body", /* @__PURE__ */ new Set([
		"head",
		"link",
		"script"
	])],
	["li", /* @__PURE__ */ new Set(["li"])],
	["p", pTag],
	["h1", pTag],
	["h2", pTag],
	["h3", pTag],
	["h4", pTag],
	["h5", pTag],
	["h6", pTag],
	["select", formTags],
	["input", formTags],
	["output", formTags],
	["button", formTags],
	["datalist", formTags],
	["textarea", formTags],
	["option", /* @__PURE__ */ new Set(["option"])],
	["optgroup", /* @__PURE__ */ new Set(["optgroup", "option"])],
	["dd", ddtTags],
	["dt", ddtTags],
	["address", pTag],
	["article", pTag],
	["aside", pTag],
	["blockquote", pTag],
	["details", pTag],
	["div", pTag],
	["dl", pTag],
	["fieldset", pTag],
	["figcaption", pTag],
	["figure", pTag],
	["footer", pTag],
	["form", pTag],
	["header", pTag],
	["hr", pTag],
	["main", pTag],
	["nav", pTag],
	["ol", pTag],
	["pre", pTag],
	["section", pTag],
	["table", pTag],
	["ul", pTag],
	["rt", rtpTags],
	["rp", rtpTags],
	["tbody", tableSectionTags],
	["tfoot", tableSectionTags]
]);
var voidElements = /* @__PURE__ */ new Set([
	"area",
	"base",
	"basefont",
	"br",
	"col",
	"command",
	"embed",
	"frame",
	"hr",
	"img",
	"input",
	"isindex",
	"keygen",
	"link",
	"meta",
	"param",
	"source",
	"track",
	"wbr"
]);
var foreignContextElements = /* @__PURE__ */ new Set(["math", "svg"]);
var htmlIntegrationElements = /* @__PURE__ */ new Set([
	"mi",
	"mo",
	"mn",
	"ms",
	"mtext",
	"annotation-xml",
	"foreignobject",
	"desc",
	"title"
]);
var reNameEnd = /\s|\//;
var Parser = class {
	constructor(cbs, options = {}) {
		var _a, _b, _c, _d, _e, _f;
		this.options = options;
		/** The start index of the last event. */
		this.startIndex = 0;
		/** The end index of the last event. */
		this.endIndex = 0;
		/**
		* Store the start index of the current open tag,
		* so we can update the start index for attributes.
		*/
		this.openTagStart = 0;
		this.tagname = "";
		this.attribname = "";
		this.attribvalue = "";
		this.attribs = null;
		this.stack = [];
		this.buffers = [];
		this.bufferOffset = 0;
		/** The index of the last written buffer. Used when resuming after a `pause()`. */
		this.writeIndex = 0;
		/** Indicates whether the parser has finished running / `.end` has been called. */
		this.ended = false;
		this.cbs = cbs !== null && cbs !== void 0 ? cbs : {};
		this.htmlMode = !this.options.xmlMode;
		this.lowerCaseTagNames = (_a = options.lowerCaseTags) !== null && _a !== void 0 ? _a : this.htmlMode;
		this.lowerCaseAttributeNames = (_b = options.lowerCaseAttributeNames) !== null && _b !== void 0 ? _b : this.htmlMode;
		this.recognizeSelfClosing = (_c = options.recognizeSelfClosing) !== null && _c !== void 0 ? _c : !this.htmlMode;
		this.tokenizer = new ((_d = options.Tokenizer) !== null && _d !== void 0 ? _d : Tokenizer)(this.options, this);
		this.foreignContext = [!this.htmlMode];
		(_f = (_e = this.cbs).onparserinit) === null || _f === void 0 || _f.call(_e, this);
	}
	/** @internal */
	ontext(start, endIndex) {
		var _a, _b;
		const data = this.getSlice(start, endIndex);
		this.endIndex = endIndex - 1;
		(_b = (_a = this.cbs).ontext) === null || _b === void 0 || _b.call(_a, data);
		this.startIndex = endIndex;
	}
	/** @internal */
	ontextentity(cp, endIndex) {
		var _a, _b;
		this.endIndex = endIndex - 1;
		(_b = (_a = this.cbs).ontext) === null || _b === void 0 || _b.call(_a, fromCodePoint(cp));
		this.startIndex = endIndex;
	}
	/**
	* Checks if the current tag is a void element. Override this if you want
	* to specify your own additional void elements.
	*/
	isVoidElement(name) {
		return this.htmlMode && voidElements.has(name);
	}
	/** @internal */
	onopentagname(start, endIndex) {
		this.endIndex = endIndex;
		let name = this.getSlice(start, endIndex);
		if (this.lowerCaseTagNames) name = name.toLowerCase();
		this.emitOpenTag(name);
	}
	emitOpenTag(name) {
		var _a, _b, _c, _d;
		this.openTagStart = this.startIndex;
		this.tagname = name;
		const impliesClose = this.htmlMode && openImpliesClose.get(name);
		if (impliesClose) while (this.stack.length > 0 && impliesClose.has(this.stack[0])) {
			const element = this.stack.shift();
			(_b = (_a = this.cbs).onclosetag) === null || _b === void 0 || _b.call(_a, element, true);
		}
		if (!this.isVoidElement(name)) {
			this.stack.unshift(name);
			if (this.htmlMode) {
				if (foreignContextElements.has(name)) this.foreignContext.unshift(true);
				else if (htmlIntegrationElements.has(name)) this.foreignContext.unshift(false);
			}
		}
		(_d = (_c = this.cbs).onopentagname) === null || _d === void 0 || _d.call(_c, name);
		if (this.cbs.onopentag) this.attribs = {};
	}
	endOpenTag(isImplied) {
		var _a, _b;
		this.startIndex = this.openTagStart;
		if (this.attribs) {
			(_b = (_a = this.cbs).onopentag) === null || _b === void 0 || _b.call(_a, this.tagname, this.attribs, isImplied);
			this.attribs = null;
		}
		if (this.cbs.onclosetag && this.isVoidElement(this.tagname)) this.cbs.onclosetag(this.tagname, true);
		this.tagname = "";
	}
	/** @internal */
	onopentagend(endIndex) {
		this.endIndex = endIndex;
		this.endOpenTag(false);
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onclosetag(start, endIndex) {
		var _a, _b, _c, _d, _e, _f, _g, _h;
		this.endIndex = endIndex;
		let name = this.getSlice(start, endIndex);
		if (this.lowerCaseTagNames) name = name.toLowerCase();
		if (this.htmlMode && (foreignContextElements.has(name) || htmlIntegrationElements.has(name))) this.foreignContext.shift();
		if (!this.isVoidElement(name)) {
			const pos = this.stack.indexOf(name);
			if (pos !== -1) for (let index = 0; index <= pos; index++) {
				const element = this.stack.shift();
				(_b = (_a = this.cbs).onclosetag) === null || _b === void 0 || _b.call(_a, element, index !== pos);
			}
			else if (this.htmlMode && name === "p") {
				this.emitOpenTag("p");
				this.closeCurrentTag(true);
			}
		} else if (this.htmlMode && name === "br") {
			(_d = (_c = this.cbs).onopentagname) === null || _d === void 0 || _d.call(_c, "br");
			(_f = (_e = this.cbs).onopentag) === null || _f === void 0 || _f.call(_e, "br", {}, true);
			(_h = (_g = this.cbs).onclosetag) === null || _h === void 0 || _h.call(_g, "br", false);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onselfclosingtag(endIndex) {
		this.endIndex = endIndex;
		if (this.recognizeSelfClosing || this.foreignContext[0]) {
			this.closeCurrentTag(false);
			this.startIndex = endIndex + 1;
		} else this.onopentagend(endIndex);
	}
	closeCurrentTag(isOpenImplied) {
		var _a, _b;
		const name = this.tagname;
		this.endOpenTag(isOpenImplied);
		if (this.stack[0] === name) {
			(_b = (_a = this.cbs).onclosetag) === null || _b === void 0 || _b.call(_a, name, !isOpenImplied);
			this.stack.shift();
		}
	}
	/** @internal */
	onattribname(start, endIndex) {
		this.startIndex = start;
		const name = this.getSlice(start, endIndex);
		this.attribname = this.lowerCaseAttributeNames ? name.toLowerCase() : name;
	}
	/** @internal */
	onattribdata(start, endIndex) {
		this.attribvalue += this.getSlice(start, endIndex);
	}
	/** @internal */
	onattribentity(cp) {
		this.attribvalue += fromCodePoint(cp);
	}
	/** @internal */
	onattribend(quote, endIndex) {
		var _a, _b;
		this.endIndex = endIndex;
		(_b = (_a = this.cbs).onattribute) === null || _b === void 0 || _b.call(_a, this.attribname, this.attribvalue, quote === QuoteType.Double ? "\"" : quote === QuoteType.Single ? "'" : quote === QuoteType.NoValue ? void 0 : null);
		if (this.attribs && !Object.prototype.hasOwnProperty.call(this.attribs, this.attribname)) this.attribs[this.attribname] = this.attribvalue;
		this.attribvalue = "";
	}
	getInstructionName(value) {
		const index = value.search(reNameEnd);
		let name = index < 0 ? value : value.substr(0, index);
		if (this.lowerCaseTagNames) name = name.toLowerCase();
		return name;
	}
	/** @internal */
	ondeclaration(start, endIndex) {
		this.endIndex = endIndex;
		const value = this.getSlice(start, endIndex);
		if (this.cbs.onprocessinginstruction) {
			const name = this.getInstructionName(value);
			this.cbs.onprocessinginstruction(`!${name}`, `!${value}`);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onprocessinginstruction(start, endIndex) {
		this.endIndex = endIndex;
		const value = this.getSlice(start, endIndex);
		if (this.cbs.onprocessinginstruction) {
			const name = this.getInstructionName(value);
			this.cbs.onprocessinginstruction(`?${name}`, `?${value}`);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	oncomment(start, endIndex, offset) {
		var _a, _b, _c, _d;
		this.endIndex = endIndex;
		(_b = (_a = this.cbs).oncomment) === null || _b === void 0 || _b.call(_a, this.getSlice(start, endIndex - offset));
		(_d = (_c = this.cbs).oncommentend) === null || _d === void 0 || _d.call(_c);
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	oncdata(start, endIndex, offset) {
		var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
		this.endIndex = endIndex;
		const value = this.getSlice(start, endIndex - offset);
		if (!this.htmlMode || this.options.recognizeCDATA) {
			(_b = (_a = this.cbs).oncdatastart) === null || _b === void 0 || _b.call(_a);
			(_d = (_c = this.cbs).ontext) === null || _d === void 0 || _d.call(_c, value);
			(_f = (_e = this.cbs).oncdataend) === null || _f === void 0 || _f.call(_e);
		} else {
			(_h = (_g = this.cbs).oncomment) === null || _h === void 0 || _h.call(_g, `[CDATA[${value}]]`);
			(_k = (_j = this.cbs).oncommentend) === null || _k === void 0 || _k.call(_j);
		}
		this.startIndex = endIndex + 1;
	}
	/** @internal */
	onend() {
		var _a, _b;
		if (this.cbs.onclosetag) {
			this.endIndex = this.startIndex;
			for (let index = 0; index < this.stack.length; index++) this.cbs.onclosetag(this.stack[index], true);
		}
		(_b = (_a = this.cbs).onend) === null || _b === void 0 || _b.call(_a);
	}
	/**
	* Resets the parser to a blank state, ready to parse a new HTML document
	*/
	reset() {
		var _a, _b, _c, _d;
		(_b = (_a = this.cbs).onreset) === null || _b === void 0 || _b.call(_a);
		this.tokenizer.reset();
		this.tagname = "";
		this.attribname = "";
		this.attribs = null;
		this.stack.length = 0;
		this.startIndex = 0;
		this.endIndex = 0;
		(_d = (_c = this.cbs).onparserinit) === null || _d === void 0 || _d.call(_c, this);
		this.buffers.length = 0;
		this.foreignContext.length = 0;
		this.foreignContext.unshift(!this.htmlMode);
		this.bufferOffset = 0;
		this.writeIndex = 0;
		this.ended = false;
	}
	/**
	* Resets the parser, then parses a complete document and
	* pushes it to the handler.
	*
	* @param data Document to parse.
	*/
	parseComplete(data) {
		this.reset();
		this.end(data);
	}
	getSlice(start, end) {
		while (start - this.bufferOffset >= this.buffers[0].length) this.shiftBuffer();
		let slice = this.buffers[0].slice(start - this.bufferOffset, end - this.bufferOffset);
		while (end - this.bufferOffset > this.buffers[0].length) {
			this.shiftBuffer();
			slice += this.buffers[0].slice(0, end - this.bufferOffset);
		}
		return slice;
	}
	shiftBuffer() {
		this.bufferOffset += this.buffers[0].length;
		this.writeIndex--;
		this.buffers.shift();
	}
	/**
	* Parses a chunk of data and calls the corresponding callbacks.
	*
	* @param chunk Chunk to parse.
	*/
	write(chunk) {
		var _a, _b;
		if (this.ended) {
			(_b = (_a = this.cbs).onerror) === null || _b === void 0 || _b.call(_a, /* @__PURE__ */ new Error(".write() after done!"));
			return;
		}
		this.buffers.push(chunk);
		if (this.tokenizer.running) {
			this.tokenizer.write(chunk);
			this.writeIndex++;
		}
	}
	/**
	* Parses the end of the buffer and clears the stack, calls onend.
	*
	* @param chunk Optional final chunk to parse.
	*/
	end(chunk) {
		var _a, _b;
		if (this.ended) {
			(_b = (_a = this.cbs).onerror) === null || _b === void 0 || _b.call(_a, /* @__PURE__ */ new Error(".end() after done!"));
			return;
		}
		if (chunk) this.write(chunk);
		this.ended = true;
		this.tokenizer.end();
	}
	/**
	* Pauses parsing. The parser won't emit events until `resume` is called.
	*/
	pause() {
		this.tokenizer.pause();
	}
	/**
	* Resumes parsing after `pause` was called.
	*/
	resume() {
		this.tokenizer.resume();
		while (this.tokenizer.running && this.writeIndex < this.buffers.length) this.tokenizer.write(this.buffers[this.writeIndex++]);
		if (this.ended) this.tokenizer.end();
	}
	/**
	* Alias of `write`, for backwards compatibility.
	*
	* @param chunk Chunk to parse.
	* @deprecated
	*/
	parseChunk(chunk) {
		this.write(chunk);
	}
	/**
	* Alias of `end`, for backwards compatibility.
	*
	* @param chunk Optional final chunk to parse.
	* @deprecated
	*/
	done(chunk) {
		this.end(chunk);
	}
};
/**
* Parses the data, returns the resulting document.
*
* @param data The data that should be parsed.
* @param options Optional options for the parser and DOM handler.
*/
function parseDocument(data, options) {
	const handler = new DomHandler(void 0, options);
	new Parser(handler, options).end(data);
	return handler.root;
}
var pc = /*@__PURE__*/ getDefaultExportFromCjs(/* @__PURE__ */ requirePicocolors_browser());
function parseStylesheet(stylesheet, options) {
	if (options?.safeParser) return safeParser(stylesheet);
	return parse$2(stylesheet);
}
function serializeStylesheet(ast, options) {
	const cssParts = [];
	stringify(ast, (result, node, type) => {
		if (node?.type === "decl" && node.value.includes("</style>")) return;
		if (!options.compress) {
			cssParts.push(result);
			return;
		}
		if (node?.type === "comment") return;
		if (node?.type === "decl") {
			const prefix = node.prop + node.raws.between;
			cssParts.push(result.replace(prefix, prefix.trim()));
			return;
		}
		if (type === "start") {
			if (node?.type === "rule" && node.selectors) if (node.selectors.length === 1) cssParts.push(node.selectors[0] ?? "", "{");
			else cssParts.push(node.selectors.join(","), "{");
			else cssParts.push(result.trim());
			return;
		}
		if (type === "end" && result === "}" && node?.raws?.semicolon && (node.type === "rule" || node.type === "atrule")) {
			const lastChild = node.nodes?.[node.nodes.length - 1];
			const lastItemIdx = cssParts.length - 2;
			if (lastChild?.type === "decl" && lastItemIdx >= 0 && cssParts[lastItemIdx]) cssParts[lastItemIdx] = cssParts[lastItemIdx].slice(0, -1);
		}
		cssParts.push(result.trim());
	});
	return cssParts.join("");
}
function markOnly(predicate) {
	return (rule) => {
		const sel = "selectors" in rule ? rule.selectors : void 0;
		if (predicate(rule) === false) rule.$$remove = true;
		if ("selectors" in rule) {
			rule.$$markedSelectors = rule.selectors;
			rule.selectors = sel;
		}
		if (rule._other) rule._other.$$markedSelectors = rule._other.selectors;
	};
}
function applyMarkedSelectors(rule) {
	if (rule.$$markedSelectors) rule.selectors = rule.$$markedSelectors;
	if (rule._other) applyMarkedSelectors(rule._other);
}
function walkStyleRules(node, iterator) {
	if (!("nodes" in node)) return;
	node.nodes = node.nodes?.filter((rule) => {
		if (hasNestedRules(rule)) walkStyleRules(rule, iterator);
		rule._other = void 0;
		rule.filterSelectors = filterSelectors;
		return iterator(rule) !== false;
	});
}
function walkStyleRulesWithReverseMirror(node, node2, iterator) {
	if (!node2) return walkStyleRules(node, iterator);
	[node.nodes, node2.nodes] = splitFilter(node.nodes, node2.nodes, (rule, index, _rules, rules2) => {
		const rule2 = rules2?.[index];
		if (hasNestedRules(rule)) {
			walkStyleRulesWithReverseMirror(rule, rule2, iterator);
			if ("nodes" in rule && rule.nodes?.length === 0 && isRemovableIfEmpty(rule)) return false;
		}
		rule._other = rule2;
		rule.filterSelectors = filterSelectors;
		return iterator(rule) !== false;
	});
	if (node2.nodes) node2.nodes = node2.nodes.filter((rule) => {
		if ("nodes" in rule && rule.nodes?.length === 0 && isRemovableIfEmpty(rule)) return false;
		return true;
	});
}
function hasNestedRules(rule) {
	return "nodes" in rule && !!rule.nodes?.length && (!("name" in rule) || rule.name !== "keyframes" && rule.name !== "-webkit-keyframes") && rule.nodes.some((n) => n.type === "rule" || n.type === "atrule");
}
function isRemovableIfEmpty(rule) {
	if (!("name" in rule) || rule.type !== "atrule") return false;
	return rule.name === "media" || rule.name === "supports";
}
function splitFilter(a, b, predicate) {
	const aOut = [];
	const bOut = [];
	for (let index = 0; index < a.length; index++) {
		const item = a[index];
		if (predicate(item, index, a, b)) aOut.push(item);
		else bOut.push(b?.[index] ?? item);
	}
	return [aOut, bOut];
}
function filterSelectors(predicate) {
	if (this._other) {
		const [a, b] = splitFilter(this.selectors, this._other.selectors, predicate);
		this.selectors = a;
		this._other.selectors = b;
	} else this.selectors = this.selectors.filter(predicate);
}
var MEDIA_TYPES = /* @__PURE__ */ new Set([
	"all",
	"print",
	"screen",
	"speech"
]);
var MEDIA_KEYWORDS = /* @__PURE__ */ new Set([
	"and",
	"not",
	","
]);
var MEDIA_FEATURES = new Set([
	"width",
	"aspect-ratio",
	"color",
	"color-index",
	"grid",
	"height",
	"monochrome",
	"orientation",
	"resolution",
	"scan"
].flatMap((feature) => [
	feature,
	`min-${feature}`,
	`max-${feature}`
]));
function validateMediaType(node) {
	const { type: nodeType, value: nodeValue } = node;
	if (nodeType === "media-type") return MEDIA_TYPES.has(nodeValue);
	else if (nodeType === "keyword") return MEDIA_KEYWORDS.has(nodeValue);
	else if (nodeType === "media-feature") return MEDIA_FEATURES.has(nodeValue);
}
function validateMediaQuery(query) {
	const mediaTree = ("default" in mediaParser ? mediaParser.default : mediaParser)(query);
	const nodeTypes = /* @__PURE__ */ new Set([
		"media-type",
		"keyword",
		"media-feature"
	]);
	const stack = [mediaTree];
	while (stack.length > 0) {
		const node = stack.pop();
		if (nodeTypes.has(node.type) && !validateMediaType(node)) return false;
		if (node.nodes) stack.push(...node.nodes);
	}
	return true;
}
function buildCache(container) {
	container._classCache = /* @__PURE__ */ new Set();
	container._idCache = /* @__PURE__ */ new Set();
	const queue = [container];
	while (queue.length) {
		const node = queue.shift();
		if (node.hasAttribute?.("class")) node.getAttribute("class").trim().split(" ").forEach((cls) => {
			container._classCache.add(cls);
		});
		if (node.hasAttribute?.("id")) {
			const id = node.getAttribute("id").trim();
			container._idCache.add(id);
		}
		if ("children" in node) queue.push(...node.children.filter((child) => child.type === "tag"));
	}
}
function createDocument(html) {
	const document = parseDocument(html, { decodeEntities: false });
	extendDocument(document);
	extendElement(Element.prototype);
	let beastiesContainers = document.querySelectorAll("[data-beasties-container]");
	if (!beastiesContainers.length) {
		document.documentElement?.setAttribute("data-beasties-container", "");
		beastiesContainers = [document.documentElement || document];
	}
	document.beastiesContainers = beastiesContainers;
	for (const container of beastiesContainers) buildCache(container);
	return document;
}
function serializeDocument(document) {
	return render(document, { decodeEntities: false });
}
var extended = false;
function extendElement(element) {
	if (extended) return;
	extended = true;
	Object.defineProperties(element, {
		nodeName: { get() {
			return this.tagName.toUpperCase();
		} },
		id: {
			get() {
				return this.getAttribute("id");
			},
			set(value) {
				this.setAttribute("id", value);
			}
		},
		className: {
			get() {
				return this.getAttribute("class");
			},
			set(value) {
				this.setAttribute("class", value);
			}
		},
		insertBefore: { value(child, referenceNode) {
			if (!referenceNode) return this.appendChild(child);
			prepend(referenceNode, child);
			return child;
		} },
		appendChild: { value(child) {
			appendChild(this, child);
			return child;
		} },
		removeChild: { value(child) {
			removeElement(child);
		} },
		remove: { value() {
			removeElement(this);
		} },
		textContent: {
			get() {
				return getText(this);
			},
			set(text) {
				this.children = [];
				appendChild(this, new Text(text));
			}
		},
		setAttribute: { value(name, value) {
			this.attribs ??= {};
			value ??= "";
			this.attribs[name] = value;
		} },
		removeAttribute: { value(name) {
			if (this.attribs != null) delete this.attribs[name];
		} },
		getAttribute: { value(name) {
			return this.attribs != null && this.attribs[name];
		} },
		hasAttribute: { value(name) {
			return this.attribs != null && this.attribs[name] != null;
		} },
		getAttributeNode: { value(name) {
			const value = this.getAttribute(name);
			if (value != null) return {
				specified: true,
				value
			};
		} },
		exists: { value(sel) {
			return cachedQuerySelector(sel, this);
		} },
		querySelector: { value(sel) {
			return selectOne(sel, this);
		} },
		querySelectorAll: { value(sel) {
			return selectAll(sel, this);
		} }
	});
}
function extendDocument(document) {
	Object.defineProperties(document, {
		nodeType: { get() {
			return 9;
		} },
		contentType: { get() {
			return "text/html";
		} },
		nodeName: { get() {
			return "#document";
		} },
		documentElement: { get() {
			return this.children.find((child) => "tagName" in child && String(child.tagName).toLowerCase() === "html");
		} },
		head: { get() {
			return this.querySelector("head");
		} },
		body: { get() {
			return this.querySelector("body");
		} },
		createElement: { value(name) {
			return new Element(name, {});
		} },
		createTextNode: { value(text) {
			return new Text(text);
		} },
		exists: { value(sel) {
			return cachedQuerySelector(sel, this);
		} },
		querySelector: { value(sel) {
			return selectOne(sel, this);
		} },
		querySelectorAll: { value(sel) {
			if (sel === ":root") return this;
			return selectAll(sel, this);
		} },
		beastiesContainer: { get() {
			return this.beastiesContainers?.[0];
		} }
	});
}
var selectorTokensCache = /* @__PURE__ */ new Map();
function cachedQuerySelector(sel, node) {
	let selectorTokens = selectorTokensCache.get(sel);
	if (selectorTokens === void 0) {
		selectorTokens = parseRelevantSelectors(sel);
		selectorTokensCache.set(sel, selectorTokens);
	}
	if (selectorTokens && node._classCache && node._idCache) {
		for (const token of selectorTokens) {
			if (token.name === "class" && !node._classCache.has(token.value)) return false;
			if (token.name === "id" && !node._idCache.has(token.value)) return false;
		}
		return true;
	}
	return !!selectOne(sel, node);
}
function parseRelevantSelectors(sel) {
	const tokens = parse$1(sel);
	const relevantTokens = [];
	for (let i = 0; i < tokens.length; i++) {
		const tokenGroup = tokens[i];
		if (tokenGroup?.length !== 1) return null;
		const token = tokenGroup[0];
		if (token?.type === "attribute" && (token.name === "class" || token.name === "id")) relevantTokens.push(token);
	}
	return relevantTokens.length > 0 ? relevantTokens : null;
}
var LOG_LEVELS = [
	"trace",
	"debug",
	"info",
	"warn",
	"error",
	"silent"
];
var defaultLogger = {
	trace(msg) {
		console.trace(msg);
	},
	debug(msg) {
		console.debug(msg);
	},
	warn(msg) {
		console.warn(pc.yellow(msg));
	},
	error(msg) {
		console.error(pc.bold(pc.red(msg)));
	},
	info(msg) {
		console.info(pc.bold(pc.blue(msg)));
	},
	silent() {}
};
function createLogger(logLevel) {
	const logLevelIdx = LOG_LEVELS.indexOf(logLevel);
	return LOG_LEVELS.reduce((logger, type, index) => {
		if (index >= logLevelIdx) logger[type] = defaultLogger[type];
		else logger[type] = defaultLogger.silent;
		return logger;
	}, {});
}
function isSubpath(basePath, currentPath) {
	return !_pathModule.relative(basePath, currentPath).startsWith("..");
}
var removePseudoClassesAndElementsPattern = /(?<!\\)::?[a-z-]+(?:\(.+\))?/gi;
var implicitUniversalPattern = /([>+~])\s*(?!\1)([>+~])/g;
var emptyCombinatorPattern = /([>+~])\s*(?=\1|$)/g;
var removeTrailingCommasPattern = /\(\s*,|,\s*\)/g;
var LEADING_SLASH_OR_QUERY_RE = /^\/(?!\/)|[?#].*$/g;
var PUBLIC_PATH_RE = /(^\/(?!\/)|\/$)/g;
var REMOTE_URL_RE = /^https?:\/\//;
var BEFORE_AFTER_PSEUDO_RE = /^::?(?:before|after)$/;
var FONT_FAMILY_RE = /\bfont(?:-family)?\b/i;
var BEASTIES_COMMENT_RE = /^(?<!! )beasties:(.*)/;
var LEADING_SLASH_RE = /^\//;
var WHITESPACE_RE = /\s+/;
var URL_RE = /url\s*\(\s*(['"]?)(.+?)\1\s*\)/;
var Beasties = class Beasties {
	#selectorCache = /* @__PURE__ */ new Map();
	options;
	logger;
	fs;
	constructor(options = {}) {
		this.options = Object.assign({
			logLevel: "info",
			path: "",
			publicPath: "",
			reduceInlineStyles: true,
			pruneSource: false,
			additionalStylesheets: [],
			allowRules: []
		}, options);
		this.logger = this.options.logger || createLogger(this.options.logLevel);
	}
	/**
	* Read the contents of a file from the specified filesystem or disk
	*/
	readFile(filename) {
		const fs = this.fs;
		return new Promise((resolve, reject) => {
			const callback = (err, data) => {
				if (err) reject(err);
				else resolve(data.toString());
			};
			if (fs && fs.readFile) fs.readFile(filename, callback);
			else readFile(filename, "utf-8", callback);
		});
	}
	/**
	* Write content to a file
	*/
	writeFile(filename, data) {
		const fs = this.fs;
		return new Promise((resolve, reject) => {
			const callback = (err) => {
				if (err) reject(err);
				else resolve();
			};
			if (fs && fs.writeFile) fs.writeFile(filename, data, callback);
			else writeFile(filename, data, callback);
		});
	}
	/**
	* Apply critical CSS processing to the html
	*/
	async process(html) {
		const start = Date.now();
		const document = createDocument(html);
		if (this.options.additionalStylesheets.length > 0) await this.embedAdditionalStylesheet(document);
		if (this.options.external !== false) {
			const externalSheets = [...document.querySelectorAll("link[rel=\"stylesheet\"]")];
			if (this.embedLinkedStylesheet !== Beasties.prototype.embedLinkedStylesheet) for (const link of externalSheets) await this.embedLinkedStylesheet(link, document);
			else {
				const sheets = await Promise.all(externalSheets.map((link) => this.fetchStylesheet(link, document)));
				for (const sheet of sheets) if (sheet) this.embedFetchedStylesheet(sheet, document);
			}
		}
		const styles = this.getAffectedStyleTags(document);
		for (const style of styles) this.processStyle(style, document);
		if (this.options.mergeStylesheets !== false && styles.length !== 0) this.mergeStylesheets(document);
		const output = serializeDocument(document);
		const end = Date.now();
		this.logger.info?.(`Time ${end - start}ms`);
		return output;
	}
	/**
	* Get the style tags that need processing
	*/
	getAffectedStyleTags(document) {
		const styles = [...document.querySelectorAll("style")];
		if (this.options.reduceInlineStyles === false) return styles.filter((style) => style.$$external);
		return styles;
	}
	mergeStylesheets(document) {
		const styles = this.getAffectedStyleTags(document);
		if (styles.length === 0) {
			this.logger.warn?.("Merging inline stylesheets into a single <style> tag skipped, no inline stylesheets to merge");
			return;
		}
		const first = styles[0];
		let sheet = first.textContent;
		for (let i = 1; i < styles.length; i++) {
			const node = styles[i];
			sheet += node.textContent;
			node.remove();
		}
		first.textContent = sheet;
	}
	/**
	* Given href, find the corresponding CSS asset
	*/
	async getCssAsset(href, _style) {
		const outputPath = this.options.path;
		const publicPath = this.options.publicPath;
		let normalizedPath = href.replace(LEADING_SLASH_OR_QUERY_RE, "");
		const pathPrefix = `${(publicPath || "").replace(PUBLIC_PATH_RE, "")}/`;
		if (normalizedPath.startsWith(pathPrefix) && !(pathPrefix === "/" && normalizedPath.startsWith("//"))) normalizedPath = normalizedPath.substring(pathPrefix.length).replace(LEADING_SLASH_RE, "");
		if (REMOTE_URL_RE.test(normalizedPath) || normalizedPath.startsWith("//")) {
			if (this.options.remote === true) try {
				const absoluteUrl = href.startsWith("//") ? `https:${href}` : href;
				const response = await fetch(absoluteUrl);
				if (!response.ok) {
					this.logger.warn?.(`Failed to fetch ${absoluteUrl} (${response.status})`);
					return;
				}
				return await response.text();
			} catch (error) {
				this.logger.warn?.(`Error fetching ${href}: ${error.message}`);
				return;
			}
			return;
		}
		const filename = _pathModule.resolve(outputPath, normalizedPath);
		if (!isSubpath(outputPath, filename)) return;
		let sheet;
		try {
			sheet = await this.readFile(filename);
		} catch {
			this.logger.warn?.(`Unable to locate stylesheet: ${filename}`);
		}
		return sheet;
	}
	checkInlineThreshold(link, style, sheet) {
		if (this.options.inlineThreshold && sheet.length < this.options.inlineThreshold) {
			const href = style.$$name;
			style.$$reduce = false;
			this.logger.info?.(`\x1B[32mInlined all of ${href} (${sheet.length} was below the threshold of ${this.options.inlineThreshold})\x1B[39m`);
			link.remove();
			return true;
		}
		return false;
	}
	/**
	* Inline the stylesheets from options.additionalStylesheets (assuming it passes `options.filter`)
	*/
	async embedAdditionalStylesheet(document) {
		const styleSheetsIncluded = [];
		const sources = await Promise.all(this.options.additionalStylesheets.map((cssFile) => {
			if (styleSheetsIncluded.includes(cssFile)) return [];
			styleSheetsIncluded.push(cssFile);
			const style = document.createElement("style");
			style.$$external = true;
			style.$$name = cssFile;
			return this.getCssAsset(cssFile, style).then((sheet) => [sheet, style]);
		}));
		for (const [sheet, style] of sources) if (sheet) {
			style.textContent = sheet;
			document.head.appendChild(style);
		}
	}
	/**
	* Fetch CSS content for a linked stylesheet
	*/
	async fetchStylesheet(link, document) {
		if (link.hasAttribute("data-beasties-skip")) return;
		const href = link.getAttribute("href");
		if (!(href?.split("?")[0]?.split("#")[0])?.endsWith(".css")) return;
		const style = document.createElement("style");
		style.$$external = true;
		const sheet = await this.getCssAsset(href, style);
		if (!sheet) return;
		return {
			link,
			href,
			sheet,
			style
		};
	}
	/**
	* Embed a fetched stylesheet into the document
	*/
	embedFetchedStylesheet(data, document) {
		const { link, href, sheet, style } = data;
		style.textContent = sheet;
		style.$$name = href;
		style.$$links = [link];
		link.parentNode?.insertBefore(style, link);
		if (this.checkInlineThreshold(link, style, sheet)) return;
		let media = link.getAttribute("media");
		if (media && !validateMediaQuery(media)) media = void 0;
		const preloadMode = this.options.preload;
		let cssLoaderPreamble = "function $loadcss(u,m,l){(l=document.createElement('link')).rel='stylesheet';l.href=u;document.head.appendChild(l)}";
		if (preloadMode === "js-lazy") cssLoaderPreamble = cssLoaderPreamble.replace("l.href", "l.media='print';l.onload=function(){l.media=m};l.href");
		if (preloadMode === false) return;
		let noscriptFallback = false;
		let updateLinkToPreload = false;
		const noscriptLink = link.cloneNode(false);
		if (preloadMode === "body") document.body.appendChild(link);
		else if (preloadMode === "js" || preloadMode === "js-lazy") {
			const script = document.createElement("script");
			script.setAttribute("data-href", href);
			script.setAttribute("data-media", media || "all");
			script.textContent = `${cssLoaderPreamble}$loadcss(document.currentScript.dataset.href,document.currentScript.dataset.media)`;
			link.parentNode.insertBefore(script, link.nextSibling);
			style.$$links.push(script);
			cssLoaderPreamble = "";
			noscriptFallback = true;
			updateLinkToPreload = true;
		} else if (preloadMode === "media") {
			link.setAttribute("media", "print");
			link.setAttribute("onload", `this.media='${media || "all"}'`);
			noscriptFallback = true;
		} else if (preloadMode === "swap-high") {
			link.setAttribute("rel", "alternate stylesheet preload");
			link.setAttribute("title", "styles");
			link.setAttribute("as", "style");
			link.setAttribute("onload", `this.title='';this.rel='stylesheet'`);
			noscriptFallback = true;
		} else if (preloadMode === "swap-low") {
			link.setAttribute("rel", "alternate stylesheet");
			link.setAttribute("title", "styles");
			link.setAttribute("onload", `this.title='';this.rel='stylesheet'`);
			noscriptFallback = true;
		} else if (preloadMode === "swap") {
			link.setAttribute("onload", "this.rel='stylesheet'");
			updateLinkToPreload = true;
			noscriptFallback = true;
		} else {
			const bodyLink = link.cloneNode(false);
			bodyLink.removeAttribute("id");
			document.body.appendChild(bodyLink);
			style.$$links.push(bodyLink);
			updateLinkToPreload = true;
		}
		if (this.options.noscriptFallback !== false && noscriptFallback && !href.includes("</noscript>")) {
			const noscript = document.createElement("noscript");
			noscriptLink.removeAttribute("id");
			noscript.appendChild(noscriptLink);
			link.parentNode.insertBefore(noscript, link.nextSibling);
			style.$$links.push(noscript);
		}
		if (updateLinkToPreload) {
			link.setAttribute("rel", "preload");
			link.setAttribute("as", "style");
		}
	}
	/**
	* Inline the target stylesheet referred to by a <link rel="stylesheet"> (assuming it passes `options.filter`)
	*/
	async embedLinkedStylesheet(link, document) {
		const sheet = await this.fetchStylesheet(link, document);
		if (sheet) this.embedFetchedStylesheet(sheet, document);
	}
	/**
	* Prune the source CSS files
	*/
	pruneSource(style, before, sheetInverse) {
		const minSize = this.options.minimumExternalSize;
		const name = style.$$name;
		const shouldInline = minSize && sheetInverse.length < minSize;
		if (shouldInline) this.logger.info?.(`\x1B[32mInlined all of ${name} (non-critical external stylesheet would have been ${sheetInverse.length}b, which was below the threshold of ${minSize})\x1B[39m`);
		if (shouldInline || !sheetInverse) {
			style.textContent = before;
			if (style.$$links) for (const link of style.$$links) link.parentNode?.removeChild(link);
		}
		return !!shouldInline;
	}
	/**
	* Parse the stylesheet within a <style> element, then reduce it to contain only rules used by the document.
	*/
	processStyle(style, document) {
		if (style.$$reduce === false) return;
		const name = style.$$name ? style.$$name.replace(LEADING_SLASH_RE, "") : "inline CSS";
		const options = this.options;
		const beastiesContainers = document.beastiesContainers;
		let keyframesMode = options.keyframes ?? "critical";
		if (keyframesMode === true) keyframesMode = "all";
		if (keyframesMode === false) keyframesMode = "none";
		let sheet = style.textContent;
		const before = sheet;
		if (!sheet) return;
		const ast = parseStylesheet(sheet, { safeParser: this.options.safeParser !== false });
		const astInverse = options.pruneSource ? parseStylesheet(sheet, { safeParser: this.options.safeParser !== false }) : null;
		let criticalFonts = "";
		const failedSelectors = [];
		const criticalKeyframeNames = /* @__PURE__ */ new Set();
		let includeNext = false;
		let includeAll = false;
		let excludeNext = false;
		let excludeAll = false;
		const shouldPreloadFonts = options.fonts === true || options.preloadFonts === true;
		const shouldInlineFonts = options.fonts !== false && options.inlineFonts === true;
		walkStyleRules(ast, markOnly((rule) => {
			if (rule.type === "comment") {
				const beastiesComment = rule.text.match(BEASTIES_COMMENT_RE);
				const command = beastiesComment && beastiesComment[1];
				if (command) switch (command) {
					case "include":
						includeNext = true;
						break;
					case "exclude":
						excludeNext = true;
						break;
					case "include start":
						includeAll = true;
						break;
					case "include end":
						includeAll = false;
						break;
					case "exclude start":
						excludeAll = true;
						break;
					case "exclude end":
						excludeAll = false;
						break;
				}
			}
			if (rule.type === "rule") {
				if (includeNext) {
					includeNext = false;
					return true;
				}
				if (excludeNext) {
					excludeNext = false;
					return false;
				}
				if (includeAll) return true;
				if (excludeAll) return false;
				rule.filterSelectors?.((sel) => {
					if (options.allowRules.some((exp) => {
						if (exp instanceof RegExp) return exp.test(sel);
						return exp === sel;
					})) return true;
					if (sel === ":root" || sel === "html" || sel === "body" || sel[0] === ":" && BEFORE_AFTER_PSEUDO_RE.test(sel)) return true;
					sel = this.normalizeCssSelector(sel);
					if (!sel) return false;
					try {
						return beastiesContainers.some((container) => container.exists(sel));
					} catch (e) {
						failedSelectors.push(`${sel} -> ${e.message || e.toString()}`);
						return false;
					}
				});
				if (!rule.selector) return false;
				if (rule.nodes) for (const decl of rule.nodes) {
					if (!("prop" in decl)) continue;
					if (shouldInlineFonts && FONT_FAMILY_RE.test(decl.prop)) criticalFonts += ` ${decl.value}`;
					if (decl.prop === "animation" || decl.prop === "animation-name") for (const name2 of decl.value.split(WHITESPACE_RE)) {
						const nameTrimmed = name2.trim();
						if (nameTrimmed) criticalKeyframeNames.add(nameTrimmed);
					}
				}
			}
			if (rule.type === "atrule" && (rule.name === "font-face" || rule.name === "layer")) return;
			return ("nodes" in rule && rule.nodes?.some((rule2) => !rule2.$$remove)) ?? true;
		}));
		if (failedSelectors.length !== 0) this.logger.warn?.(`${failedSelectors.length} rules skipped due to selector errors:
  ${failedSelectors.join("\n  ")}`);
		const preloadedFonts = /* @__PURE__ */ new Set();
		walkStyleRulesWithReverseMirror(ast, astInverse, (rule) => {
			if (rule.$$remove === true) return false;
			if ("selectors" in rule) applyMarkedSelectors(rule);
			if (rule.type === "atrule" && rule.name === "keyframes") {
				if (keyframesMode === "none") return false;
				if (keyframesMode === "all") return true;
				return criticalKeyframeNames.has(rule.params);
			}
			if (rule.type === "atrule" && rule.name === "font-face") {
				let family, src;
				if (rule.nodes) {
					for (const decl of rule.nodes) {
						if (!("prop" in decl)) continue;
						if (decl.prop === "src") src = (decl.value.match(URL_RE) || [])[2];
						else if (decl.prop === "font-family") family = decl.value;
					}
					if (src && shouldPreloadFonts && !preloadedFonts.has(src)) {
						preloadedFonts.add(src);
						const preload = document.createElement("link");
						preload.setAttribute("rel", "preload");
						preload.setAttribute("as", "font");
						preload.setAttribute("crossorigin", "anonymous");
						preload.setAttribute("href", src.trim());
						document.head.appendChild(preload);
					}
				}
				if (!shouldInlineFonts || !family || !src || !criticalFonts.includes(family)) return false;
			}
		});
		sheet = serializeStylesheet(ast, { compress: this.options.compress !== false });
		if (sheet.trim().length === 0) {
			if (style.parentNode) style.remove();
			return;
		}
		let afterText = "";
		let styleInlinedCompletely = false;
		if (options.pruneSource) {
			const sheetInverse = serializeStylesheet(astInverse, { compress: this.options.compress !== false });
			styleInlinedCompletely = this.pruneSource(style, before, sheetInverse);
			if (styleInlinedCompletely) afterText = `, reducing non-inlined size ${sheetInverse.length / before.length * 100 | 0}% to ${formatSize(sheetInverse.length)}`;
			const cssFilePath = _pathModule.resolve(this.options.path, name);
			this.writeFile(cssFilePath, sheetInverse).then(() => this.logger.info?.(`${name} was successfully updated`)).catch((err) => this.logger.error?.(err));
		}
		if (!styleInlinedCompletely) style.textContent = sheet;
		const percent = sheet.length / before.length * 100 | 0;
		this.logger.info?.(`\x1B[32mInlined ${formatSize(sheet.length)} (${percent}% of original ${formatSize(before.length)}) of ${name}${afterText}.\x1B[39m`);
	}
	normalizeCssSelector(sel) {
		let normalizedSelector = this.#selectorCache.get(sel);
		if (normalizedSelector !== void 0) return normalizedSelector;
		normalizedSelector = sel.replace(removePseudoClassesAndElementsPattern, "").replace(removeTrailingCommasPattern, (match) => match.includes("(") ? "(" : ")").replace(implicitUniversalPattern, "$1 * $2").replace(emptyCombinatorPattern, "$1 *").trim();
		this.#selectorCache.set(sel, normalizedSelector);
		return normalizedSelector;
	}
};
function formatSize(size) {
	if (size <= 0) return "0 bytes";
	const abbreviations = [
		"bytes",
		"kB",
		"MB",
		"GB"
	];
	const index = Math.floor(Math.log(size) / Math.log(1024));
	const roundedSize = size / 1024 ** index;
	const fractionDigits = index === 0 ? 0 : 2;
	return `${roundedSize.toFixed(fractionDigits)} ${abbreviations[index]}`;
}
//#endregion
//#region node_modules/@angular/ssr/fesm2022/ssr.mjs
var ServerAssets = class {
	manifest;
	constructor(manifest) {
		this.manifest = manifest;
	}
	getServerAsset(path) {
		const asset = this.manifest.assets[path];
		if (!asset) throw new Error(`Server asset '${path}' does not exist.`);
		return asset;
	}
	hasServerAsset(path) {
		return !!this.manifest.assets[path];
	}
	getIndexServerHtml() {
		return this.getServerAsset("index.server.html");
	}
};
var IGNORED_LOGS = /* @__PURE__ */ new Set(["Angular is running in development mode."]);
var Console = class extends Console$1 {
	log(message) {
		if (!IGNORED_LOGS.has(message)) super.log(message);
	}
};
var angularAppManifest;
function setAngularAppManifest(manifest) {
	angularAppManifest = manifest;
}
function getAngularAppManifest() {
	if (!angularAppManifest) throw new Error("Angular app manifest is not set. Please ensure you are using the '@angular/build:application' builder to build your server application.");
	return angularAppManifest;
}
var angularAppEngineManifest;
function setAngularAppEngineManifest(manifest) {
	angularAppEngineManifest = manifest;
}
function getAngularAppEngineManifest() {
	if (!angularAppEngineManifest) throw new Error("Angular app engine manifest is not set. Please ensure you are using the '@angular/build:application' builder to build your server application.");
	return angularAppEngineManifest;
}
function stripTrailingSlash(url) {
	return url.length > 1 && url.at(-1) === "/" ? url.slice(0, -1) : url;
}
function stripLeadingSlash(url) {
	return url.length > 1 && url[0] === "/" ? url.slice(1) : url;
}
function addLeadingSlash(url) {
	return url[0] === "/" ? url : `/${url}`;
}
function addTrailingSlash(url) {
	return url.at(-1) === "/" ? url : `${url}/`;
}
function joinUrlParts(...parts) {
	const normalizedParts = [];
	for (const part of parts) {
		if (part === "") continue;
		let start = 0;
		let end = part.length;
		while (start < end && part[start] === "/") start++;
		while (end > start && part[end - 1] === "/") end--;
		if (start < end) normalizedParts.push(part.slice(start, end));
	}
	return addLeadingSlash(normalizedParts.join("/"));
}
function stripIndexHtmlFromURL(url) {
	if (url.pathname.endsWith("/index.html")) {
		const modifiedURL = new URL(url);
		modifiedURL.pathname = modifiedURL.pathname.slice(0, -11);
		return modifiedURL;
	}
	return url;
}
function buildPathWithParams(toPath, fromPath) {
	if (toPath[0] !== "/") throw new Error(`Invalid toPath: The string must start with a '/'. Received: '${toPath}'`);
	if (fromPath[0] !== "/") throw new Error(`Invalid fromPath: The string must start with a '/'. Received: '${fromPath}'`);
	if (!toPath.includes("/*")) return toPath;
	const fromPathParts = fromPath.split("/");
	const toPathParts = toPath.split("/");
	return joinUrlParts(...toPathParts.map((part, index) => toPathParts[index] === "*" ? fromPathParts[index] : part));
}
var MATRIX_PARAMS_REGEX = /;[^/]+/g;
function stripMatrixParams(pathname) {
	return pathname.includes(";") ? pathname.replace(MATRIX_PARAMS_REGEX, "") : pathname;
}
async function renderAngular(html, bootstrap, url, platformProviders, serverContext) {
	const urlToRender = stripIndexHtmlFromURL(url);
	const platformRef = platformServer([
		{
			provide: INITIAL_CONFIG,
			useValue: {
				url: urlToRender.href,
				document: html
			}
		},
		{
			provide: SERVER_CONTEXT,
			useValue: serverContext
		},
		{
			provide: Console$1,
			useFactory: () => new Console()
		},
		...platformProviders
	]);
	let redirectTo;
	let hasNavigationError = true;
	try {
		let applicationRef;
		if (isNgModule(bootstrap)) applicationRef = (await platformRef.bootstrapModule(bootstrap)).injector.get(ApplicationRef);
		else applicationRef = await bootstrap({ platformRef });
		await applicationRef.whenStable();
		if (applicationRef.destroyed) return { hasNavigationError: true };
		const envInjector = applicationRef.injector;
		const routerIsProvided = !!envInjector.get(ActivatedRoute, null);
		const router = envInjector.get(Router);
		const lastSuccessfulNavigation = router.lastSuccessfulNavigation();
		if (!routerIsProvided) hasNavigationError = false;
		else if (lastSuccessfulNavigation?.finalUrl) {
			hasNavigationError = false;
			const requestPrefix = envInjector.get(APP_BASE_HREF, null, { optional: true }) ?? envInjector.get(REQUEST, null, { optional: true })?.headers.get("X-Forwarded-Prefix");
			const { pathname, search, hash } = envInjector.get(PlatformLocation);
			const finalUrl = constructSerializedUrl(router, {
				pathname,
				search,
				hash
			}, requestPrefix);
			if (constructSerializedUrl(router, urlToRender, requestPrefix) !== finalUrl) redirectTo = [
				pathname,
				search,
				hash
			].join("");
		}
		return {
			destroy: () => void asyncDestroyPlatform(platformRef),
			hasNavigationError,
			redirectTo,
			content: () => new Promise((resolve, reject) => {
				setTimeout(() => {
					renderInternal(platformRef, applicationRef).then(resolve).catch(reject).finally(() => void asyncDestroyPlatform(platformRef));
				}, 0);
			})
		};
	} catch (error) {
		await asyncDestroyPlatform(platformRef);
		throw error;
	} finally {
		if (hasNavigationError || redirectTo) asyncDestroyPlatform(platformRef);
	}
}
function isNgModule(value) {
	return "ɵmod" in value;
}
function asyncDestroyPlatform(platformRef) {
	if (platformRef.destroyed) return Promise.resolve();
	return new Promise((resolve) => {
		setTimeout(() => {
			if (!platformRef.destroyed) platformRef.destroy();
			resolve();
		}, 0);
	});
}
function constructSerializedUrl(router, url, prefix) {
	const { pathname, hash, search } = url;
	const urlParts = [];
	if (prefix && !addTrailingSlash(pathname).startsWith(addTrailingSlash(prefix))) urlParts.push(joinUrlParts(prefix, pathname));
	else urlParts.push(stripTrailingSlash(pathname));
	urlParts.push(search, hash);
	const urlTree = router.parseUrl(urlParts.join(""));
	return router.serializeUrl(urlTree);
}
function promiseWithAbort(promise, signal, errorMessagePrefix) {
	return new Promise((resolve, reject) => {
		const abortHandler = () => {
			reject(new DOMException(`${errorMessagePrefix} was aborted.\n${signal.reason}`, "AbortError"));
		};
		if (signal.aborted) {
			abortHandler();
			return;
		}
		signal.addEventListener("abort", abortHandler, { once: true });
		promise.then(resolve).catch(reject).finally(() => {
			signal.removeEventListener("abort", abortHandler);
		});
	});
}
var VALID_REDIRECT_RESPONSE_CODES = /* @__PURE__ */ new Set([
	301,
	302,
	303,
	307,
	308
]);
function isValidRedirectResponseCode(code) {
	return VALID_REDIRECT_RESPONSE_CODES.has(code);
}
function createRedirectResponse(location, status = 302, headers) {
	if (ngDevMode && !isValidRedirectResponseCode(status)) throw new Error(`Invalid redirect status code: ${status}. Please use one of the following redirect response codes: ${[...VALID_REDIRECT_RESPONSE_CODES.values()].join(", ")}.`);
	const resHeaders = headers instanceof Headers ? headers : new Headers(headers);
	if (ngDevMode && resHeaders.has("location")) console.warn(`Location header "${resHeaders.get("location")}" will be ignored and set to "${location}".`);
	const varyArray = resHeaders.get("Vary")?.split(",") ?? [];
	const varySet = /* @__PURE__ */ new Set(["X-Forwarded-Prefix"]);
	for (const vary of varyArray) {
		const value = vary.trim();
		if (value) varySet.add(value);
	}
	resHeaders.set("Vary", [...varySet].join(", "));
	resHeaders.set("Location", location);
	return new Response(null, {
		status,
		headers: resHeaders
	});
}
var APP_SHELL_ROUTE = "ng-app-shell";
var ServerRenderingFeatureKind;
(function(ServerRenderingFeatureKind) {
	ServerRenderingFeatureKind[ServerRenderingFeatureKind["AppShell"] = 0] = "AppShell";
	ServerRenderingFeatureKind[ServerRenderingFeatureKind["ServerRoutes"] = 1] = "ServerRoutes";
})(ServerRenderingFeatureKind || (ServerRenderingFeatureKind = {}));
var RenderMode;
(function(RenderMode) {
	RenderMode[RenderMode["Server"] = 0] = "Server";
	RenderMode[RenderMode["Client"] = 1] = "Client";
	RenderMode[RenderMode["Prerender"] = 2] = "Prerender";
})(RenderMode || (RenderMode = {}));
var PrerenderFallback;
(function(PrerenderFallback) {
	PrerenderFallback[PrerenderFallback["Server"] = 0] = "Server";
	PrerenderFallback[PrerenderFallback["Client"] = 1] = "Client";
	PrerenderFallback[PrerenderFallback["None"] = 2] = "None";
})(PrerenderFallback || (PrerenderFallback = {}));
var SERVER_ROUTES_CONFIG = new InjectionToken("SERVER_ROUTES_CONFIG");
function withRoutes(routes) {
	const config = { routes };
	return {
		ɵkind: ServerRenderingFeatureKind.ServerRoutes,
		ɵproviders: [{
			provide: SERVER_ROUTES_CONFIG,
			useValue: config
		}]
	};
}
function withAppShell(component) {
	const routeConfig = { path: APP_SHELL_ROUTE };
	if ("ɵcmp" in component) routeConfig.component = component;
	else routeConfig.loadComponent = component;
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
	} else features = args;
	const providers = [provideServerRendering$1(options)];
	let hasAppShell = false;
	let hasServerRoutes = false;
	for (const { ɵkind, ɵproviders } of features) {
		hasAppShell ||= ɵkind === ServerRenderingFeatureKind.AppShell;
		hasServerRoutes ||= ɵkind === ServerRenderingFeatureKind.ServerRoutes;
		providers.push(...ɵproviders);
	}
	if (!hasServerRoutes && hasAppShell) throw new Error("Configuration error: found 'withAppShell()' without 'withRoutes()' in the same call to 'provideServerRendering()'.The 'withAppShell()' function requires 'withRoutes()' to be used.");
	return makeEnvironmentProviders(providers);
}
function hasOptions(args) {
	const value = args[0];
	return !!value && typeof value === "object" && !("ɵkind" in value);
}
var RouteTree = class RouteTree {
	root = this.createEmptyRouteTreeNode();
	insert(route, metadata) {
		let node = this.root;
		const segments = this.getPathSegments(route);
		const normalizedSegments = [];
		for (const segment of segments) {
			const normalizedSegment = segment[0] === ":" ? "*" : segment;
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
			route: addLeadingSlash(normalizedSegments.join("/"))
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
		for (const { route, ...metadata } of value) tree.insert(route, metadata);
		return tree;
	}
	*traverse(node = this.root) {
		if (node.metadata) yield node.metadata;
		for (const childNode of node.children.values()) yield* this.traverse(childNode);
	}
	getPathSegments(route) {
		return route.split("/").filter(Boolean).map(decodeURIComponent);
	}
	traverseBySegments(segments, node = this.root, currentIndex = 0) {
		if (currentIndex >= segments.length) return node.metadata ? node : node.children.get("**");
		if (!node.children.size) return;
		const segment = segments[currentIndex];
		const exactMatch = node.children.get(segment);
		if (exactMatch) {
			const match = this.traverseBySegments(segments, exactMatch, currentIndex + 1);
			if (match) return match;
		}
		const wildcardMatch = node.children.get("*");
		if (wildcardMatch) {
			const match = this.traverseBySegments(segments, wildcardMatch, currentIndex + 1);
			if (match) return match;
		}
		return node.children.get("**");
	}
	createEmptyRouteTreeNode() {
		return { children: /* @__PURE__ */ new Map() };
	}
};
var IS_DISCOVERING_ROUTES = new InjectionToken(typeof ngDevMode === "undefined" || ngDevMode ? "IS_DISCOVERING_ROUTES" : "", {
	providedIn: "platform",
	factory: () => false
});
var MODULE_PRELOAD_MAX = 10;
var CATCH_ALL_REGEXP = /\/(\*\*)$/;
var URL_PARAMETER_REGEXP = /(?<!\\):([^/]+)/;
var URL_PARAMETER_GLOBAL_REGEXP = new RegExp(URL_PARAMETER_REGEXP, "g");
async function* handleRoute(options) {
	try {
		const { metadata, currentRoutePath, route, compiler, parentInjector, serverConfigRouteTree, entryPointToBrowserMapping, invokeGetPrerenderParams, includePrerenderFallbackRoutes } = options;
		const { redirectTo, loadChildren: loadChildren$1, loadComponent, children, ɵentryName } = route;
		if (ɵentryName && loadComponent) appendPreloadToMetadata(ɵentryName, entryPointToBrowserMapping, metadata);
		if (metadata.renderMode === RenderMode.Prerender) yield* handleSSGRoute(serverConfigRouteTree, typeof redirectTo === "string" ? redirectTo : void 0, metadata, parentInjector, invokeGetPrerenderParams, includePrerenderFallbackRoutes);
		else if (redirectTo !== void 0) if (metadata.status && !isValidRedirectResponseCode(metadata.status)) yield { error: `The '${metadata.status}' status code is not a valid redirect response code. Please use one of the following redirect response codes: ${[...VALID_REDIRECT_RESPONSE_CODES.values()].join(", ")}.` };
		else if (typeof redirectTo === "string") yield {
			...metadata,
			redirectTo: resolveRedirectTo(metadata.route, redirectTo)
		};
		else yield metadata;
		else yield metadata;
		if (children?.length) yield* traverseRoutesConfig({
			...options,
			routes: children,
			parentRoute: currentRoutePath,
			parentPreloads: metadata.preload
		});
		if (loadChildren$1) {
			if (ɵentryName) appendPreloadToMetadata(ɵentryName, entryPointToBrowserMapping, metadata);
			const routeInjector = route.providers ? createEnvironmentInjector(route.providers, parentInjector.get(EnvironmentInjector), `Route: ${route.path}`) : parentInjector;
			const loadedChildRoutes = await loadChildren(route, compiler, routeInjector);
			if (loadedChildRoutes) {
				const { routes: childRoutes, injector = routeInjector } = loadedChildRoutes;
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
		yield { error: `Error in handleRoute for '${options.currentRoutePath}': ${error.message}` };
	}
}
async function* traverseRoutesConfig(options) {
	const { routes: routeConfigs, parentPreloads, parentRoute, serverConfigRouteTree } = options;
	for (const route of routeConfigs) {
		const { matcher, path = matcher ? "**" : "" } = route;
		const currentRoutePath = joinUrlParts(parentRoute, path);
		if (matcher && serverConfigRouteTree) {
			const matches = [];
			for (const matchedMetaData of serverConfigRouteTree.traverse()) if (matchedMetaData.route.startsWith(currentRoutePath)) matches.push(matchedMetaData);
			if (!matches.length) {
				const matchedMetaData = serverConfigRouteTree.match(currentRoutePath);
				if (matchedMetaData) matches.push(matchedMetaData);
			}
			for (const matchedMetaData of matches) {
				matchedMetaData.presentInClientRouter = true;
				if (matchedMetaData.renderMode === RenderMode.Prerender) {
					yield { error: `The route '${stripLeadingSlash(currentRoutePath)}' is set for prerendering but has a defined matcher. Routes with matchers cannot use prerendering. Please specify a different 'renderMode'.` };
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
						presentInClientRouter: void 0
					}
				});
			}
			if (!matches.length) yield { error: `The route '${stripLeadingSlash(currentRoutePath)}' has a defined matcher but does not match any route in the server routing configuration. Please ensure this route is added to the server routing configuration.` };
			continue;
		}
		let matchedMetaData;
		if (serverConfigRouteTree) {
			matchedMetaData = serverConfigRouteTree.match(currentRoutePath);
			if (!matchedMetaData) {
				yield { error: `The '${stripLeadingSlash(currentRoutePath)}' route does not match any route defined in the server routing configuration. Please ensure this route is added to the server routing configuration.` };
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
				route: path === "" ? addTrailingSlash(currentRoutePath) : currentRoutePath,
				presentInClientRouter: void 0
			},
			currentRoutePath,
			route
		});
	}
}
function appendPreloadToMetadata(entryName, entryPointToBrowserMapping, metadata) {
	const existingPreloads = metadata.preload ?? [];
	if (!entryPointToBrowserMapping || existingPreloads.length >= MODULE_PRELOAD_MAX) return;
	const preload = entryPointToBrowserMapping[entryName];
	if (!preload?.length) return;
	const combinedPreloads = new Set(existingPreloads);
	for (const href of preload) {
		combinedPreloads.add(href);
		if (combinedPreloads.size === MODULE_PRELOAD_MAX) break;
	}
	metadata.preload = Array.from(combinedPreloads);
}
async function* handleSSGRoute(serverConfigRouteTree, redirectTo, metadata, parentInjector, invokeGetPrerenderParams, includePrerenderFallbackRoutes) {
	if (metadata.renderMode !== RenderMode.Prerender) throw new Error(`'handleSSGRoute' was called for a route which rendering mode is not prerender.`);
	const { route: currentRoutePath, fallback, ...meta } = metadata;
	const getPrerenderParams = "getPrerenderParams" in meta ? meta.getPrerenderParams : void 0;
	if ("getPrerenderParams" in meta) delete meta["getPrerenderParams"];
	if (redirectTo !== void 0) meta.redirectTo = resolveRedirectTo(currentRoutePath, redirectTo);
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
			yield { error: `The '${stripLeadingSlash(currentRoutePath)}' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration or specify a different 'renderMode'.` };
			return;
		}
		if (serverConfigRouteTree) {
			const catchAllRoutePath = isCatchAllRoute ? currentRoutePath : joinUrlParts(currentRoutePath, "**");
			const match = serverConfigRouteTree.match(catchAllRoutePath);
			if (match && match.renderMode === RenderMode.Prerender && !("getPrerenderParams" in match)) serverConfigRouteTree.insert(catchAllRoutePath, {
				...match,
				presentInClientRouter: true,
				getPrerenderParams
			});
		}
		const parameters = await runInInjectionContext(parentInjector, () => getPrerenderParams());
		try {
			for (const params of parameters) {
				const replacer = handlePrerenderParamsReplacement(params, currentRoutePath);
				const routeWithResolvedParams = currentRoutePath.replace(URL_PARAMETER_GLOBAL_REGEXP, replacer).replace(CATCH_ALL_REGEXP, replacer);
				yield {
					...meta,
					route: routeWithResolvedParams,
					redirectTo: redirectTo === void 0 ? void 0 : resolveRedirectTo(routeWithResolvedParams, redirectTo)
				};
			}
		} catch (error) {
			yield { error: `${error.message}` };
			return;
		}
	}
	if (includePrerenderFallbackRoutes && (fallback !== PrerenderFallback.None || !invokeGetPrerenderParams)) yield {
		...meta,
		route: currentRoutePath,
		renderMode: fallback === PrerenderFallback.Client ? RenderMode.Client : RenderMode.Server
	};
}
function handlePrerenderParamsReplacement(params, currentRoutePath) {
	return (match) => {
		const parameterName = match.slice(1);
		const value = params[parameterName];
		if (typeof value !== "string") throw new Error(`The 'getPrerenderParams' function defined for the '${stripLeadingSlash(currentRoutePath)}' route returned a non-string value for parameter '${parameterName}'. Please make sure the 'getPrerenderParams' function returns values for all parameters specified in this route.`);
		return parameterName === "**" ? `/${value}` : value;
	};
}
function resolveRedirectTo(routePath, redirectTo) {
	if (redirectTo[0] === "/") return redirectTo;
	const segments = routePath.replace(URL_PARAMETER_GLOBAL_REGEXP, "*").split("/");
	segments.pop();
	return joinUrlParts(...segments, redirectTo);
}
function buildServerConfigRouteTree({ routes, appShellRoute }) {
	const serverRoutes = [...routes];
	if (appShellRoute !== void 0) serverRoutes.unshift({
		path: appShellRoute,
		renderMode: RenderMode.Prerender
	});
	const serverConfigRouteTree = new RouteTree();
	const errors = [];
	for (const { path, ...metadata } of serverRoutes) {
		if (path[0] === "/") {
			errors.push(`Invalid '${path}' route configuration: the path cannot start with a slash.`);
			continue;
		}
		if ("getPrerenderParams" in metadata && (path.includes("/*/") || path.endsWith("/*"))) {
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
async function getRoutesFromAngularRouterConfig(bootstrap, document, url, invokeGetPrerenderParams = false, includePrerenderFallbackRoutes = true, entryPointToBrowserMapping = void 0) {
	const { protocol, host } = url;
	const platformRef = platformServer([
		{
			provide: INITIAL_CONFIG,
			useValue: {
				document,
				url: `${protocol}//${host}/`
			}
		},
		{
			provide: Console$1,
			useFactory: () => new Console()
		},
		{
			provide: ENABLE_ROOT_COMPONENT_BOOTSTRAP,
			useValue: false
		},
		{
			provide: IS_DISCOVERING_ROUTES,
			useValue: true
		}
	]);
	try {
		let applicationRef;
		if (isNgModule(bootstrap)) applicationRef = (await platformRef.bootstrapModule(bootstrap)).injector.get(ApplicationRef);
		else applicationRef = await bootstrap({ platformRef });
		const injector = applicationRef.injector;
		const router = injector.get(Router);
		router.navigationTransitions.afterPreactivation()?.next?.();
		await applicationRef.whenStable();
		const errors = [];
		const rawBaseHref = injector.get(APP_BASE_HREF, null, { optional: true }) ?? injector.get(PlatformLocation).getBaseHrefFromDOM();
		const { pathname: baseHref } = new URL(rawBaseHref, "http://localhost");
		const compiler = injector.get(Compiler);
		const serverRoutesConfig = injector.get(SERVER_ROUTES_CONFIG, null, { optional: true });
		let serverConfigRouteTree;
		if (serverRoutesConfig) {
			const result = buildServerConfigRouteTree(serverRoutesConfig);
			serverConfigRouteTree = result.serverConfigRouteTree;
			errors.push(...result.errors);
		}
		if (errors.length) return {
			baseHref,
			routes: [],
			errors
		};
		const routesResults = [];
		if (router.config.length) {
			const traverseRoutes = traverseRoutesConfig({
				routes: router.config,
				compiler,
				parentInjector: injector,
				parentRoute: "",
				serverConfigRouteTree,
				invokeGetPrerenderParams,
				includePrerenderFallbackRoutes,
				entryPointToBrowserMapping
			});
			const seenRoutes = /* @__PURE__ */ new Set();
			for await (const routeMetadata of traverseRoutes) {
				if ("error" in routeMetadata) {
					errors.push(routeMetadata.error);
					continue;
				}
				const routePath = routeMetadata.route;
				if (!seenRoutes.has(routePath)) {
					routesResults.push(routeMetadata);
					seenRoutes.add(routePath);
				}
			}
			await new Promise((resolve) => setTimeout(resolve, 0));
			if (serverConfigRouteTree) for (const { route, presentInClientRouter } of serverConfigRouteTree.traverse()) {
				if (presentInClientRouter || route.endsWith("/**")) continue;
				errors.push(`The '${stripLeadingSlash(route)}' server route does not match any routes defined in the Angular routing configuration (typically provided as a part of the 'provideRouter' call). Please make sure that the mentioned server route is present in the Angular routing configuration.`);
			}
		} else {
			const rootRouteMetadata = serverConfigRouteTree?.match("") ?? {
				route: "",
				renderMode: RenderMode.Prerender
			};
			routesResults.push({
				...rootRouteMetadata,
				route: ""
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
	const { url, manifest = getAngularAppManifest(), invokeGetPrerenderParams = false, includePrerenderFallbackRoutes = true, signal } = options;
	async function extract() {
		const routeTree = new RouteTree();
		const document = await new ServerAssets(manifest).getIndexServerHtml().text();
		const { baseHref, appShellRoute, routes, errors } = await getRoutesFromAngularRouterConfig(await manifest.bootstrap(), document, url, invokeGetPrerenderParams, includePrerenderFallbackRoutes, manifest.entryPointToBrowserMapping);
		for (const { route, ...metadata } of routes) {
			if (metadata.redirectTo !== void 0) metadata.redirectTo = joinUrlParts(baseHref, metadata.redirectTo);
			for (const [key, value] of Object.entries(metadata)) if (value === void 0) delete metadata[key];
			const fullRoute = joinUrlParts(baseHref, route);
			routeTree.insert(fullRoute, metadata);
		}
		return {
			appShellRoute,
			routeTree,
			errors
		};
	}
	return signal ? promiseWithAbort(extract(), signal, "Routes extraction") : extract();
}
var Hooks = class {
	store = /* @__PURE__ */ new Map();
	async run(name, context) {
		const hooks = this.store.get(name);
		switch (name) {
			case "html:transform:pre": {
				if (!hooks) return context.html;
				const ctx = { ...context };
				for (const hook of hooks) ctx.html = await hook(ctx);
				return ctx.html;
			}
			default: throw new Error(`Running hook "${name}" is not supported.`);
		}
	}
	on(name, handler) {
		const hooks = this.store.get(name);
		if (hooks) hooks.push(handler);
		else this.store.set(name, [handler]);
	}
	has(name) {
		return !!this.store.get(name)?.length;
	}
};
var ServerRouter = class ServerRouter {
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
		}).then(({ routeTree, errors }) => {
			if (errors.length > 0) throw new Error("Error(s) occurred while extracting routes:\n" + errors.map((error) => `- ${error}`).join("\n"));
			return new ServerRouter(routeTree);
		}).finally(() => {
			ServerRouter.#extractionPromise = void 0;
		});
		return ServerRouter.#extractionPromise;
	}
	match(url) {
		let { pathname } = stripIndexHtmlFromURL(url);
		pathname = stripMatrixParams(pathname);
		return this.routeTree.match(pathname);
	}
};
async function sha256(data) {
	const encodedData = new TextEncoder().encode(data);
	const hashBuffer = await crypto.subtle.digest("SHA-256", encodedData);
	const hashParts = [];
	for (const h of new Uint8Array(hashBuffer)) hashParts.push(h.toString(16).padStart(2, "0"));
	return hashParts.join("");
}
var MEDIA_SET_HANDLER_PATTERN = /^this\.media=["'](.*)["'];?$/;
var CSP_MEDIA_ATTR = "ngCspMedia";
var LINK_LOAD_SCRIPT_CONTENT = /* @__PURE__ */ (() => `(() => {
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
var BeastiesBase = class extends Beasties {};
var InlineCriticalCssProcessor = class extends BeastiesBase {
	readFile;
	outputPath;
	addedCspScriptsDocuments = /* @__PURE__ */ new WeakSet();
	documentNonces = /* @__PURE__ */ new WeakMap();
	constructor(readFile, outputPath) {
		super({
			logger: {
				warn: (s) => console.warn(s),
				error: (s) => console.error(s),
				info: () => {}
			},
			logLevel: "warn",
			path: outputPath,
			publicPath: void 0,
			compress: false,
			pruneSource: false,
			reduceInlineStyles: false,
			mergeStylesheets: false,
			preload: "media",
			noscriptFallback: true,
			inlineFonts: true
		});
		this.readFile = readFile;
		this.outputPath = outputPath;
	}
	async embedLinkedStylesheet(link, document) {
		if (link.getAttribute("media") === "print" && link.next?.name === "noscript") {
			const media = link.getAttribute("onload")?.match(MEDIA_SET_HANDLER_PATTERN);
			if (media) {
				link.removeAttribute("onload");
				link.setAttribute("media", media[1]);
				link?.next?.remove();
			}
		}
		const returnValue = await super.embedLinkedStylesheet(link, document);
		const cspNonce = this.findCspNonce(document);
		if (cspNonce) {
			const beastiesMedia = link.getAttribute("onload")?.match(MEDIA_SET_HANDLER_PATTERN);
			if (beastiesMedia) {
				link.removeAttribute("onload");
				link.setAttribute(CSP_MEDIA_ATTR, beastiesMedia[1]);
				this.conditionallyInsertCspLoadingScript(document, cspNonce, link);
			}
			document.head.children.forEach((child) => {
				if (child.tagName === "style" && !child.hasAttribute("nonce")) child.setAttribute("nonce", cspNonce);
			});
		}
		return returnValue;
	}
	findCspNonce(document) {
		if (this.documentNonces.has(document)) return this.documentNonces.get(document);
		const nonceElement = document.querySelector("[ngCspNonce], [ngcspnonce]");
		const cspNonce = nonceElement?.getAttribute("ngCspNonce") || nonceElement?.getAttribute("ngcspnonce") || null;
		this.documentNonces.set(document, cspNonce);
		return cspNonce;
	}
	conditionallyInsertCspLoadingScript(document, nonce, link) {
		if (this.addedCspScriptsDocuments.has(document)) return;
		if (document.head.textContent.includes(LINK_LOAD_SCRIPT_CONTENT)) {
			this.addedCspScriptsDocuments.add(document);
			return;
		}
		const script = document.createElement("script");
		script.setAttribute("nonce", nonce);
		script.textContent = LINK_LOAD_SCRIPT_CONTENT;
		document.head.insertBefore(script, link);
		this.addedCspScriptsDocuments.add(document);
	}
};
var LRUCache = class {
	capacity;
	cache = /* @__PURE__ */ new Map();
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
			prev: void 0,
			next: void 0
		};
		this.cache.set(key, newNode);
		this.addToHead(newNode);
		if (this.cache.size > this.capacity) {
			const tail = this.removeTail();
			if (tail) this.cache.delete(tail.key);
		}
	}
	addToHead(node) {
		node.next = this.head;
		node.prev = void 0;
		if (this.head) this.head.prev = node;
		this.head = node;
		if (!this.tail) this.tail = node;
	}
	removeNode(node) {
		if (node.prev) node.prev.next = node.next;
		else this.head = node.next;
		if (node.next) node.next.prev = node.prev;
		else this.tail = node.prev;
	}
	moveToHead(node) {
		this.removeNode(node);
		this.addToHead(node);
	}
	removeTail() {
		const node = this.tail;
		if (node) this.removeNode(node);
		return node;
	}
};
var WELL_KNOWN_NON_ANGULAR_URLS = /* @__PURE__ */ new Set(["/favicon.ico", "/.well-known/appspecific/com.chrome.devtools.json"]);
var MAX_INLINE_CSS_CACHE_ENTRIES = 50;
var SERVER_CONTEXT_VALUE = {
	[RenderMode.Prerender]: "ssg",
	[RenderMode.Server]: "ssr",
	[RenderMode.Client]: ""
};
var AngularServerApp = class {
	options;
	allowStaticRouteRender;
	hooks;
	constructor(options = {}) {
		this.options = options;
		this.allowStaticRouteRender = this.options.allowStaticRouteRender ?? false;
		this.hooks = options.hooks ?? new Hooks();
		if (this.manifest.inlineCriticalCss) this.inlineCriticalCssProcessor = new InlineCriticalCssProcessor((path) => {
			const fileName = path.split("/").pop() ?? path;
			return this.assets.getServerAsset(fileName).text();
		});
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
		if (WELL_KNOWN_NON_ANGULAR_URLS.has(url.pathname)) return null;
		this.router ??= await ServerRouter.from(this.manifest, url);
		const matchedRoute = this.router.match(url);
		if (!matchedRoute) return null;
		const { redirectTo, status, renderMode, headers } = matchedRoute;
		if (redirectTo !== void 0) return createRedirectResponse(joinUrlParts(request.headers.get("X-Forwarded-Prefix") ?? "", buildPathWithParams(redirectTo, url.pathname)), status, headers);
		if (renderMode === RenderMode.Prerender) {
			const response = await this.handleServe(request, matchedRoute);
			if (response) return response;
		}
		return promiseWithAbort(this.handleRendering(request, matchedRoute, requestContext), request.signal, `Request for: ${request.url}`);
	}
	async handleServe(request, matchedRoute) {
		const { headers, renderMode } = matchedRoute;
		if (renderMode !== RenderMode.Prerender) return null;
		const { method } = request;
		if (method !== "GET" && method !== "HEAD") return null;
		const assetPath = this.buildServerAssetPathFromRequest(request);
		const { manifest: { locale }, assets } = this;
		if (!assets.hasServerAsset(assetPath)) return null;
		const { text, hash, size } = assets.getServerAsset(assetPath);
		const etag = `"${hash}"`;
		return request.headers.get("if-none-match") === etag ? new Response(void 0, {
			status: 304,
			statusText: "Not Modified"
		}) : new Response(await text(), { headers: {
			"Content-Length": size.toString(),
			"ETag": etag,
			"Content-Type": "text/html;charset=UTF-8",
			...locale !== void 0 ? { "Content-Language": locale } : {},
			...headers
		} });
	}
	async handleRendering(request, matchedRoute, requestContext) {
		const { renderMode, headers, status, preload } = matchedRoute;
		if (!this.allowStaticRouteRender && renderMode === RenderMode.Prerender) return null;
		const url = new URL(request.url);
		const platformProviders = [];
		const { manifest: { bootstrap, locale }, assets } = this;
		const responseInit = {
			status,
			headers: new Headers({
				"Content-Type": "text/html;charset=UTF-8",
				...locale !== void 0 ? { "Content-Language": locale } : {},
				...headers
			})
		};
		if (renderMode === RenderMode.Server) platformProviders.push({
			provide: REQUEST,
			useValue: request
		}, {
			provide: REQUEST_CONTEXT,
			useValue: requestContext
		}, {
			provide: RESPONSE_INIT,
			useValue: responseInit
		});
		else if (renderMode === RenderMode.Client) {
			let html = await this.assets.getServerAsset("index.csr.html").text();
			html = await this.runTransformsOnHtml(html, url, preload);
			return new Response(html, responseInit);
		}
		if (locale !== void 0) platformProviders.push({
			provide: LOCALE_ID,
			useValue: locale
		});
		this.boostrap ??= await bootstrap();
		let html = await assets.getIndexServerHtml().text();
		html = await this.runTransformsOnHtml(html, url, preload);
		const result = await renderAngular(html, this.boostrap, url, platformProviders, SERVER_CONTEXT_VALUE[renderMode]);
		if (result.hasNavigationError) return null;
		if (result.redirectTo) return createRedirectResponse(result.redirectTo, responseInit.status, responseInit.headers);
		if (renderMode === RenderMode.Prerender) {
			const renderedHtml = await result.content();
			const finalHtml = await this.inlineCriticalCss(renderedHtml, url);
			return new Response(finalHtml, responseInit);
		}
		const stream = new ReadableStream({
			start: async (controller) => {
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
		const { inlineCriticalCssProcessor } = this;
		if (!inlineCriticalCssProcessor) return html;
		try {
			return await inlineCriticalCssProcessor.process(html);
		} catch (error) {
			console.error(`An error occurred while inlining critical CSS for: ${url}.`, error);
			return html;
		}
	}
	async inlineCriticalCssWithCache(html, url) {
		const { inlineCriticalCssProcessor, criticalCssLRUCache, textDecoder } = this;
		if (!inlineCriticalCssProcessor) return textDecoder.encode(html);
		const cacheKey = url.toString();
		const cached = criticalCssLRUCache.get(cacheKey);
		const shaOfContentPreInlinedCss = await sha256(html);
		if (cached?.shaOfContentPreInlinedCss === shaOfContentPreInlinedCss) return cached.contentWithCriticialCSS;
		const processedHtml = await this.inlineCriticalCss(html, url);
		const finalHtml = textDecoder.encode(processedHtml);
		criticalCssLRUCache.put(cacheKey, {
			shaOfContentPreInlinedCss,
			contentWithCriticialCSS: finalHtml
		});
		return finalHtml;
	}
	buildServerAssetPathFromRequest(request) {
		let { pathname: assetPath } = new URL(request.url);
		try {
			assetPath = decodeURIComponent(assetPath);
		} catch {}
		if (!assetPath.endsWith("/index.html")) assetPath = joinUrlParts(assetPath, "index.html");
		const { baseHref } = this.manifest;
		if (baseHref.length > 1 && assetPath.startsWith(baseHref)) assetPath = assetPath.slice(baseHref.length);
		return stripLeadingSlash(assetPath);
	}
	async runTransformsOnHtml(html, url, preload) {
		if (this.hooks.has("html:transform:pre")) html = await this.hooks.run("html:transform:pre", {
			html,
			url
		});
		if (preload?.length) html = appendPreloadHintsToHtml(html, preload);
		return html;
	}
};
var angularServerApp;
function getOrCreateAngularServerApp(options) {
	return angularServerApp ??= new AngularServerApp(options);
}
function destroyAngularServerApp() {
	if (typeof ngDevMode === "undefined" || ngDevMode) resetCompiledComponents();
	angularServerApp = void 0;
}
function appendPreloadHintsToHtml(html, preload) {
	const bodyCloseIdx = html.lastIndexOf("</body>");
	if (bodyCloseIdx === -1) return html;
	return [
		html.slice(0, bodyCloseIdx),
		...preload.map((val) => `<link rel="modulepreload" href="${val}">`),
		html.slice(bodyCloseIdx)
	].join("\n");
}
function getPotentialLocaleIdFromUrl(url, basePath) {
	const { pathname } = url;
	let start = basePath.length;
	if (pathname[start] === "/") start++;
	let end = pathname.indexOf("/", start);
	if (end === -1) end = pathname.length;
	return pathname.slice(start, end);
}
function parseLanguageHeader(header) {
	if (header === "*") return /* @__PURE__ */ new Map([["*", 1]]);
	const parsedValues = header.split(",").map((item) => {
		const [locale, qualityValue] = item.split(";", 2).map((v) => v.trim());
		let quality = qualityValue?.startsWith("q=") ? parseFloat(qualityValue.slice(2)) : void 0;
		if (typeof quality !== "number" || isNaN(quality) || quality < 0 || quality > 1) quality = 1;
		return [locale, quality];
	}).sort(([_localeA, qualityA], [_localeB, qualityB]) => qualityB - qualityA);
	return new Map(parsedValues);
}
function getPreferredLocale(header, supportedLocales) {
	if (supportedLocales.length < 2) return supportedLocales[0];
	const parsedLocales = parseLanguageHeader(header);
	if (parsedLocales.size === 0 || parsedLocales.size === 1 && parsedLocales.has("*")) return supportedLocales[0];
	const normalizedSupportedLocales = /* @__PURE__ */ new Map();
	for (const locale of supportedLocales) normalizedSupportedLocales.set(normalizeLocale(locale), locale);
	let bestMatch;
	const qualityZeroNormalizedLocales = /* @__PURE__ */ new Set();
	for (const [locale, quality] of parsedLocales) {
		const normalizedLocale = normalizeLocale(locale);
		if (quality === 0) {
			qualityZeroNormalizedLocales.add(normalizedLocale);
			continue;
		}
		if (normalizedSupportedLocales.has(normalizedLocale)) return normalizedSupportedLocales.get(normalizedLocale);
		if (bestMatch !== void 0) continue;
		const [languagePrefix] = normalizedLocale.split("-", 1);
		for (const supportedLocale of normalizedSupportedLocales.keys()) if (supportedLocale.startsWith(languagePrefix)) {
			bestMatch = normalizedSupportedLocales.get(supportedLocale);
			break;
		}
	}
	if (bestMatch !== void 0) return bestMatch;
	for (const [normalizedLocale, locale] of normalizedSupportedLocales) if (!qualityZeroNormalizedLocales.has(normalizedLocale)) return locale;
}
function normalizeLocale(locale) {
	return locale.toLowerCase();
}
var AngularAppEngine = class AngularAppEngine {
	static ɵallowStaticRouteRender = false;
	static ɵdisableAllowedHostsCheck = false;
	static ɵhooks = new Hooks();
	manifest = getAngularAppEngineManifest();
	allowedHosts;
	supportedLocales = Object.keys(this.manifest.supportedLocales);
	trustProxyHeaders;
	entryPointsCache = /* @__PURE__ */ new Map();
	constructor(options) {
		this.allowedHosts = this.getAllowedHosts(options);
		this.trustProxyHeaders = normalizeTrustProxyHeaders(options?.trustProxyHeaders);
	}
	getAllowedHosts(options) {
		const allowedHosts = /* @__PURE__ */ new Set([...options?.allowedHosts ?? [], ...this.manifest.allowedHosts]);
		if (allowedHosts.has("*")) console.warn("Allowing all hosts via \"*\" is a security risk. This configuration should only be used when validation for \"Host\" and \"X-Forwarded-Host\" headers is performed in another layer, such as a load balancer or reverse proxy. For more information see: https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf");
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
		if (serverApp) return serverApp.handle(securedRequest, requestContext);
		if (this.supportedLocales.length > 1) return this.redirectBasedOnAcceptLanguage(securedRequest);
		return null;
	}
	redirectBasedOnAcceptLanguage(request) {
		const { basePath, supportedLocales } = this.manifest;
		const { pathname } = new URL(request.url);
		if (pathname !== basePath) return null;
		const preferredLocale = getPreferredLocale(request.headers.get("Accept-Language") || "*", this.supportedLocales);
		if (preferredLocale) {
			const subPath = supportedLocales[preferredLocale];
			if (subPath !== void 0) return createRedirectResponse(joinUrlParts(request.headers.get("X-Forwarded-Prefix") ?? "", pathname, subPath), 302, { "Vary": "Accept-Language" });
		}
		return null;
	}
	async getAngularServerAppForRequest(request) {
		const url = new URL(request.url);
		const entryPoint = await this.getEntryPointExportsForUrl(url);
		if (!entryPoint) return null;
		const ɵgetOrCreateAngularServerApp = entryPoint.ɵgetOrCreateAngularServerApp;
		return ɵgetOrCreateAngularServerApp({
			allowStaticRouteRender: AngularAppEngine.ɵallowStaticRouteRender,
			hooks: AngularAppEngine.ɵhooks
		});
	}
	getEntryPointExports(potentialLocale) {
		const cachedEntryPoint = this.entryPointsCache.get(potentialLocale);
		if (cachedEntryPoint) return cachedEntryPoint;
		const { entryPoints } = this.manifest;
		const entryPoint = entryPoints[potentialLocale];
		if (!entryPoint) return;
		const entryPointExports = entryPoint();
		this.entryPointsCache.set(potentialLocale, entryPointExports);
		return entryPointExports;
	}
	getEntryPointExportsForUrl(url) {
		const { basePath, supportedLocales } = this.manifest;
		if (this.supportedLocales.length === 1) return this.getEntryPointExports(supportedLocales[this.supportedLocales[0]]);
		const potentialLocale = getPotentialLocaleIdFromUrl(url, basePath);
		return this.getEntryPointExports(potentialLocale) ?? this.getEntryPointExports("");
	}
	handleValidationError(url, error) {
		const errorMessage = error.message;
		console.error(`ERROR: Bad Request ("${url}").\n` + errorMessage + "\n\nFor more information, see https://angular.dev/best-practices/security#preventing-server-side-request-forgery-ssrf");
		return new Response(errorMessage, {
			status: 400,
			statusText: "Bad Request",
			headers: { "Content-Type": "text/plain" }
		});
	}
};
function createRequestHandler(handler) {
	handler["__ng_request_handler__"] = true;
	return handler;
}
//#endregion
export { validateUrl as C, parseForwardedHeader as S, renderApplication as _, RenderMode as a, isProxyHeaderAllowed as b, extractRoutesAndCreateRouteTree as c, provideServerRendering as d, setAngularAppEngineManifest as f, SERVER_CONTEXT as g, withRoutes as h, PrerenderFallback as i, getOrCreateAngularServerApp as l, withAppShell as m, IS_DISCOVERING_ROUTES as n, createRequestHandler as o, setAngularAppManifest as p, InlineCriticalCssProcessor as r, destroyAngularServerApp as s, AngularAppEngine as t, getRoutesFromAngularRouterConfig as u, renderModule as v, normalizeTrustProxyHeaders as x, getFirstHeaderValue as y };
