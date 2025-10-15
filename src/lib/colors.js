// src/lib/colors.js
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

export const getNumberColorHex = (n) => {
  const x = parseInt(n, 10);
  if (x === 0) return "#2e7d32";
  if (redNumbers.has(x)) return "#d32f2f";
  if (blackNumbers.has(x)) return "#000000";
  return "#2e7d32";
};

export { redNumbers, blackNumbers };
