// Mock shim for missing Node.js modules
export const Buffer = (window as any).Buffer || {};
export const process = (window as any).process || { env: {}, version: 'v20.0.0' };
export const version = 'v20.0.0';
export const Stream = {};

export default { Buffer, process, version, Stream };
