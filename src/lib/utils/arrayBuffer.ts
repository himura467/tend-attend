export const isArrayBuffer = (arg: unknown): arg is ArrayBuffer => {
  return (
    (typeof ArrayBuffer === "function" && arg instanceof ArrayBuffer) ||
    Object.prototype.toString.call(arg) === "[object ArrayBuffer]"
  );
};
