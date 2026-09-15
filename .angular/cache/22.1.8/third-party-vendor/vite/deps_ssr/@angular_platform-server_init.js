import { t as index } from "./bundled-domino-V1wPlgIO.js";
//#region node_modules/@angular/platform-server/fesm2022/init.mjs
/**
* @license Angular v22.1.6
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
function applyShims() {
	Object.assign(globalThis, index.impl);
	globalThis["KeyboardEvent"] = index.impl.Event;
}
applyShims();
var ɵɵmoduleMarker = true;
//#endregion
export { ɵɵmoduleMarker };
