// Empty dummy file to prevent polyfills from attempting to overwrite window.fetch
// but preserving FormData if it's needed by other libraries.
export const FormData = typeof globalThis !== 'undefined' ? globalThis.FormData : undefined;
export default FormData;
