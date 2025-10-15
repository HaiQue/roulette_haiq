// src/lib/bets.js
export const betTypes = {
  Core28: { lose: new Set([0, 3, 6, 7, 10, 25, 28, 33, 36]) },
};

export const betTypeKeys = Object.keys(betTypes);
