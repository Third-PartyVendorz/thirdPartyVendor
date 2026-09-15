import { C as validateUrl, S as parseForwardedHeader, _ as renderApplication, b as isProxyHeaderAllowed, g as SERVER_CONTEXT, r as InlineCriticalCssProcessor, t as AngularAppEngine, v as renderModule, x as normalizeTrustProxyHeaders, y as getFirstHeaderValue } from "./ssr-voGGk5H4.js";
import * as fs from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { URL as URL$1, fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { argv } from "node:process";
//#region node_modules/@angular/ssr/fesm2022/node.mjs
function getAllowedHostsFromEnv() {
	return getArrayFromEnv("NG_ALLOWED_HOSTS");
}
function getTrustProxyHeadersFromEnv() {
	return getArrayFromEnv("NG_TRUST_PROXY_HEADERS");
}
function getArrayFromEnv(envName) {
	const envValue = process.env[envName];
	if (!envValue) return;
	const values = [];
	for (const value of envValue.split(",")) {
		const trimmed = value.trim();
		if (trimmed.length > 0) values.push(trimmed);
	}
	return values;
}
function attachNodeGlobalErrorHandlers() {
	if (typeof Zone !== "undefined") return;
	const gThis = globalThis;
	if (gThis.ngAttachNodeGlobalErrorHandlersCalled) return;
	gThis.ngAttachNodeGlobalErrorHandlersCalled = true;
	process.on("unhandledRejection", (error) => console.error("unhandledRejection", error)).on("uncaughtException", (error) => console.error("uncaughtException", error));
}
var CommonEngineInlineCriticalCssProcessor = class {
	resourceCache = /* @__PURE__ */ new Map();
	async process(html, outputPath) {
		return new InlineCriticalCssProcessor(async (path) => {
			let resourceContent = this.resourceCache.get(path);
			if (resourceContent === void 0) {
				resourceContent = await readFile(path, "utf-8");
				this.resourceCache.set(path, resourceContent);
			}
			return resourceContent;
		}, outputPath).process(html);
	}
};
var PERFORMANCE_MARK_PREFIX = "🅰️";
function printPerformanceLogs() {
	let maxWordLength = 0;
	const benchmarks = [];
	for (const { name, duration } of performance.getEntriesByType("measure")) {
		if (!name.startsWith(PERFORMANCE_MARK_PREFIX)) continue;
		const step = name.slice(4) + ":";
		if (step.length > maxWordLength) maxWordLength = step.length;
		benchmarks.push([step, `${duration.toFixed(1)}ms`]);
		performance.clearMeasures(name);
	}
	console.log("********** Performance results **********");
	for (const [step, value] of benchmarks) {
		const spaces = maxWordLength - step.length + 5;
		console.log(step + " ".repeat(spaces) + value);
	}
	console.log("*****************************************");
}
async function runMethodAndMeasurePerf(label, asyncMethod) {
	const labelName = `${PERFORMANCE_MARK_PREFIX}:${label}`;
	const startLabel = `start:${labelName}`;
	const endLabel = `end:${labelName}`;
	try {
		performance.mark(startLabel);
		return await asyncMethod();
	} finally {
		performance.mark(endLabel);
		performance.measure(labelName, startLabel, endLabel);
		performance.clearMarks(startLabel);
		performance.clearMarks(endLabel);
	}
}
function noopRunMethodAndMeasurePerf(label, asyncMethod) {
	return asyncMethod();
}
var SSG_MARKER_REGEXP = /ng-server-context=["']\w*\|?ssg\|?\w*["']/;
var CommonEngine = class {
	options;
	templateCache = /* @__PURE__ */ new Map();
	inlineCriticalCssProcessor = new CommonEngineInlineCriticalCssProcessor();
	pageIsSSG = /* @__PURE__ */ new Map();
	allowedHosts;
	constructor(options) {
		this.options = options;
		this.allowedHosts = new Set(getAllowedHostsFromEnv() ?? this.options?.allowedHosts ?? []);
		attachNodeGlobalErrorHandlers();
	}
	async render(opts) {
		const { url } = opts;
		if (url && URL$1.canParse(url)) {
			const urlObj = new URL$1(url);
			try {
				validateUrl(urlObj, this.allowedHosts);
			} catch (error) {
				console.error(`ERROR: ${error.message}Please provide a list of allowed hosts in the "allowedHosts" option in the "CommonEngine" constructor.`);
				throw error;
			}
		}
		const enablePerformanceProfiler = this.options?.enablePerformanceProfiler;
		const runMethod = enablePerformanceProfiler ? runMethodAndMeasurePerf : noopRunMethodAndMeasurePerf;
		let html = await runMethod("Retrieve SSG Page", () => this.retrieveSSGPage(opts));
		if (html === void 0) {
			html = await runMethod("Render Page", () => this.renderApplication(opts));
			if (opts.inlineCriticalCss !== false) html = await runMethod("Inline Critical CSS", () => this.inlineCriticalCss(html, opts));
		}
		if (enablePerformanceProfiler) printPerformanceLogs();
		return html;
	}
	inlineCriticalCss(html, opts) {
		const outputPath = opts.publicPath ?? (opts.documentFilePath ? dirname(opts.documentFilePath) : "");
		return this.inlineCriticalCssProcessor.process(html, outputPath);
	}
	async retrieveSSGPage(opts) {
		const { publicPath, documentFilePath, url } = opts;
		if (!publicPath || !documentFilePath || url === void 0) return;
		const { pathname } = new URL$1(url, "resolve://");
		const pagePath = join(publicPath, pathname, "index.html");
		const relativePath = relative(publicPath, pagePath);
		if (relativePath === ".." || relativePath.startsWith("../") || relativePath.startsWith("..\\") || isAbsolute(relativePath)) return;
		if (this.pageIsSSG.get(pagePath)) return fs.promises.readFile(pagePath, "utf-8");
		if (pagePath === resolve(documentFilePath) || !await exists(pagePath)) return;
		const content = await fs.promises.readFile(pagePath, "utf-8");
		if (SSG_MARKER_REGEXP.test(content)) {
			this.pageIsSSG.set(pagePath, true);
			return content;
		}
	}
	async renderApplication(opts) {
		const moduleOrFactory = this.options?.bootstrap ?? opts.bootstrap;
		if (!moduleOrFactory) throw new Error("A module or bootstrap option must be provided.");
		const extraProviders = [
			{
				provide: SERVER_CONTEXT,
				useValue: "ssr"
			},
			...opts.providers ?? [],
			...this.options?.providers ?? []
		];
		let document = opts.document;
		if (!document && opts.documentFilePath) document = await this.getDocument(opts.documentFilePath);
		const commonRenderingOptions = {
			url: opts.url,
			document,
			allowedHosts: ["*"]
		};
		return isBootstrapFn(moduleOrFactory) ? renderApplication(moduleOrFactory, {
			platformProviders: extraProviders,
			...commonRenderingOptions
		}) : renderModule(moduleOrFactory, {
			extraProviders,
			...commonRenderingOptions
		});
	}
	async getDocument(filePath) {
		let doc = this.templateCache.get(filePath);
		if (!doc) {
			doc = await fs.promises.readFile(filePath, "utf-8");
			this.templateCache.set(filePath, doc);
		}
		return doc;
	}
};
async function exists(path) {
	try {
		await fs.promises.access(path, fs.constants.F_OK);
		return true;
	} catch {
		return false;
	}
}
function isBootstrapFn(value) {
	return typeof value === "function" && !("ɵmod" in value);
}
var HTTP2_PSEUDO_HEADERS = /* @__PURE__ */ new Set([
	":method",
	":scheme",
	":authority",
	":path",
	":status"
]);
function createWebRequestFromNodeRequest(nodeRequest, trustProxyHeaders) {
	const trustProxyHeadersNormalized = normalizeTrustProxyHeaders(trustProxyHeaders);
	const { headers, method = "GET" } = nodeRequest;
	const withBody = method !== "GET" && method !== "HEAD";
	const referrer = headers.referer && URL.canParse(headers.referer) ? headers.referer : void 0;
	const controller = new AbortController();
	if (nodeRequest.aborted) controller.abort();
	else {
		const onAbort = () => controller.abort();
		nodeRequest.once("aborted", onAbort);
		nodeRequest.once("close", () => nodeRequest.off("aborted", onAbort));
	}
	return new Request(createRequestUrl(nodeRequest, trustProxyHeadersNormalized), {
		method,
		signal: controller.signal,
		headers: createRequestHeaders(headers),
		body: withBody ? nodeRequest : void 0,
		duplex: withBody ? "half" : void 0,
		referrer
	});
}
function createRequestHeaders(nodeHeaders) {
	const headers = new Headers();
	for (const [name, value] of Object.entries(nodeHeaders)) {
		if (HTTP2_PSEUDO_HEADERS.has(name)) continue;
		if (typeof value === "string") headers.append(name, value);
		else if (Array.isArray(value)) for (const item of value) headers.append(name, item);
	}
	return headers;
}
function createRequestUrl(nodeRequest, trustProxyHeaders) {
	const { headers, socket, url = "", originalUrl } = nodeRequest;
	const forwardedParams = parseForwardedHeader(getAllowedProxyHeaderValue(headers, "forwarded", trustProxyHeaders));
	const protocol = forwardedParams.proto ?? getAllowedProxyHeaderValue(headers, "x-forwarded-proto", trustProxyHeaders) ?? ("encrypted" in socket && socket.encrypted ? "https" : "http");
	const hostname = forwardedParams.host ?? getAllowedProxyHeaderValue(headers, "x-forwarded-host", trustProxyHeaders) ?? headers.host ?? headers[":authority"];
	if (Array.isArray(hostname)) throw new Error("host value cannot be an array.");
	let hostnameWithPort = hostname;
	if (!hostname?.includes(":")) {
		const port = getAllowedProxyHeaderValue(headers, "x-forwarded-port", trustProxyHeaders);
		if (port) hostnameWithPort += `:${port}`;
	}
	return new URL(`${protocol}://${hostnameWithPort}${originalUrl ?? url}`);
}
function getAllowedProxyHeaderValue(headers, headerName, trustProxyHeaders) {
	return isProxyHeaderAllowed(headerName, trustProxyHeaders) ? getFirstHeaderValue(headers[headerName]) : void 0;
}
var AngularNodeAppEngine = class {
	angularAppEngine;
	trustProxyHeaders;
	constructor(options) {
		const appEngineOptions = {
			...options,
			allowedHosts: options?.allowedHosts ?? getAllowedHostsFromEnv(),
			trustProxyHeaders: options?.trustProxyHeaders ?? getTrustProxyHeadersFromEnv()
		};
		this.angularAppEngine = new AngularAppEngine(appEngineOptions);
		this.trustProxyHeaders = appEngineOptions.trustProxyHeaders;
		attachNodeGlobalErrorHandlers();
	}
	async handle(request, requestContext) {
		const webRequest = request instanceof Request ? request : createWebRequestFromNodeRequest(request, this.trustProxyHeaders);
		return this.angularAppEngine.handle(webRequest, requestContext);
	}
};
function createNodeRequestHandler(handler) {
	handler["__ng_node_request_handler__"] = true;
	return handler;
}
function isResponseDestroyedOrClosed(destination) {
	return destination.destroyed || destination.closed || destination.writableEnded || "stream" in destination && (!destination.stream || destination.stream.destroyed || destination.stream.closed);
}
async function writeResponseToNodeResponse(source, destination) {
	if (isResponseDestroyedOrClosed(destination)) return;
	const { status, headers, body } = source;
	destination.statusCode = status;
	let cookieHeaderSet = false;
	for (const [name, value] of headers.entries()) if (name === "set-cookie") {
		if (cookieHeaderSet) continue;
		destination.setHeader(name, headers.getSetCookie());
		cookieHeaderSet = true;
	} else destination.setHeader(name, value);
	if ("flushHeaders" in destination) destination.flushHeaders();
	if (!body) {
		if (!isResponseDestroyedOrClosed(destination)) destination.end();
		return;
	}
	let isClosed = isResponseDestroyedOrClosed(destination);
	const isDestroyedOrClosed = () => isClosed || isResponseDestroyedOrClosed(destination);
	let readerCancelled = false;
	const reader = body.getReader();
	const cancelReader = (error) => {
		if (readerCancelled) return;
		readerCancelled = true;
		isClosed = true;
		destination.off("close", cancelReader);
		destination.off("error", cancelReader);
		reader.cancel(error).catch((err) => {
			console.error(`An error occurred while writing the response body for: ${destination.req.url}.`, err);
		});
	};
	destination.once("close", cancelReader);
	destination.once("error", cancelReader);
	try {
		while (true) {
			if (isDestroyedOrClosed()) {
				cancelReader();
				break;
			}
			const { done, value } = await reader.read();
			if (isDestroyedOrClosed()) {
				cancelReader();
				break;
			}
			if (done) {
				destination.end();
				break;
			}
			if (destination.write(value) === false) await new Promise((resolve) => {
				if (isDestroyedOrClosed()) {
					resolve();
					return;
				}
				const onDrain = () => {
					destination.off("close", onClose);
					destination.off("error", onClose);
					resolve();
				};
				const onClose = () => {
					destination.off("drain", onDrain);
					destination.off("close", onClose);
					destination.off("error", onClose);
					cancelReader();
					resolve();
				};
				destination.once("drain", onDrain);
				destination.once("close", onClose);
				destination.once("error", onClose);
			});
		}
	} catch {
		if (!isDestroyedOrClosed()) destination.end("Internal server error.");
	} finally {
		destination.off("close", cancelReader);
		destination.off("error", cancelReader);
	}
}
function isMainModule(url) {
	return url.startsWith("file:") && argv[1] === fileURLToPath(url);
}
//#endregion
export { AngularNodeAppEngine, CommonEngine, createNodeRequestHandler, createWebRequestFromNodeRequest, isMainModule, writeResponseToNodeResponse };
