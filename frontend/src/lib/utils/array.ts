export const areEqual = <T>(
  a: T[],
  b: T[],
  options: {
    strict?: boolean;
    compareOrder?: boolean;
  } = {
    strict: true,
    compareOrder: true,
  },
): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return a === b;
  if (a.length !== b.length) return false;

  const compareValues = (value: T, otherValue: T): boolean => {
    if (Array.isArray(value) && Array.isArray(otherValue)) {
      return areEqual(value, otherValue, options);
    }
    if (typeof value === "object" && typeof otherValue === "object" && value !== null && otherValue !== null) {
      return JSON.stringify(value) === JSON.stringify(otherValue);
    }
    return options.strict ? value === otherValue : value == otherValue;
  };

  if (options.compareOrder) {
    return a.every((value, index) => compareValues(value, b[index]));
  }
  return a.every((value) => b.some((otherValue) => compareValues(value, otherValue)));
};

export const areEqualByRegExps = (a: string[], b: RegExp[]): boolean => {
  if (a.length !== b.length) return false;

  return a.every((value, index) => {
    const regExp = b[index];
    return regExp.test(value);
  });
};
