// bridge file to prevent polyfills from attempting to overwrite window.fetch
// while providing necessary objects to libraries that expect them.
const globalObj = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : {});

export const fetch = globalObj.fetch;
export const FormData = globalObj.FormData;
export const Request = globalObj.Request;
export const Response = globalObj.Response;
export const Headers = globalObj.Headers;

export default fetch;
