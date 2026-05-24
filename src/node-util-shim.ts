// Shim for Node.js features needed by Lucid/Cardano libs in the browser
export const promisify = (fn: any) => (...args: any[]) => {
  return new Promise((resolve, reject) => {
    fn(...args, (err: any, res: any) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
};

export const types = {
  isUint8Array: (a: any) => a instanceof Uint8Array,
};

export const deprecate = (fn: any) => fn;

export default { promisify, types, deprecate };
