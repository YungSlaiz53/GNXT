// Mock shim for missing Node.js modules
export const Buffer = window.Buffer || {};
export const process = window.process || { env: {}, version: 'v20.0.0' };
export const version = 'v20.0.0';
export const Stream = {};

export default { Buffer, process, version, Stream };
