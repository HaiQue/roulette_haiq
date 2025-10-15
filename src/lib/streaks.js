// src/lib/streaks.js
export const fmtPct = (num, den) =>
  den ? ((num / den) * 100).toFixed(1) : "—";

export const buildStreakTransitions = (outcomes) => {
  if (outcomes.length < 2) return { win: {}, loss: {} };

  // streak length ending at index i
  const lenEnd = new Array(outcomes.length).fill(1);
  for (let i = 1; i < outcomes.length; i++) {
    lenEnd[i] = outcomes[i] === outcomes[i - 1] ? lenEnd[i - 1] + 1 : 1;
  }

  const agg = { win: new Map(), loss: new Map() };
  const bump = (type, len, nextIsWin) => {
    const m = agg[type];
    if (!m.has(len)) m.set(len, { nextWin: 0, nextLoss: 0, total: 0 });
    const row = m.get(len);
    if (nextIsWin) row.nextWin += 1;
    else row.nextLoss += 1;
    row.total += 1;
  };

  for (let i = 0; i < outcomes.length - 1; i++) {
    const cur = outcomes[i];
    const next = outcomes[i + 1];
    const len = lenEnd[i];
    if (cur) bump("win", len, next === true);
    else bump("loss", len, next === true);
  }

  const toObj = (m) => {
    const obj = {};
    [...m.entries()]
      .sort((a, b) => a[0] - b[0])
      .forEach(([k, v]) => (obj[k] = v));
    return obj;
  };

  return { win: toObj(agg.win), loss: toObj(agg.loss) };
};

export const currentStreak = (outcomes) => {
  if (!outcomes.length) return { type: null, len: 0 };
  const last = outcomes[outcomes.length - 1];
  let len = 1;
  for (let i = outcomes.length - 2; i >= 0; i--) {
    if (outcomes[i] === last) len += 1;
    else break;
  }
  return { type: last ? "win" : "loss", len };
};
