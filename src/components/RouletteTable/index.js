// src/components/RouletteTable/index.js
import { useEffect, useMemo, useState } from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Chip,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import TopBar from "./TopBar";
import RecentNumbersCard from "./RecentNumbersCard";

/* ----------------------------- helpers / config ---------------------------- */

// roulette colors
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

// one bet type for now
const betTypes = {
  Core28: { lose: new Set([0, 3, 6, 7, 10, 25, 28, 33, 36]) },
};

const fmtPct = (num, den) => (den ? ((num / den) * 100).toFixed(1) : "—");

const getNumberColor = (n) => {
  const x = parseInt(n, 10);
  if (x === 0) return "#2e7d32";
  if (redNumbers.has(x)) return "#d32f2f";
  if (blackNumbers.has(x)) return "#000000";
  return "#2e7d32";
};

// build next-outcome (win/loss) transitions per streak length
const buildStreakTransitions = (outcomes) => {
  if (outcomes.length < 2) return { win: {}, loss: {} };

  // streak length at each index (ending at i)
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

const currentStreak = (outcomes) => {
  if (!outcomes.length) return { type: null, len: 0 };
  const last = outcomes[outcomes.length - 1];
  let len = 1;
  for (let i = outcomes.length - 2; i >= 0; i--) {
    if (outcomes[i] === last) len += 1;
    else break;
  }
  return { type: last ? "win" : "loss", len };
};

/* --------------------------------- component -------------------------------- */

export default function RouletteTable({
  numbers = [],
  historyRange = 100,
  onHistoryRangeChange,
  pendingValue = "",
  onChangePending, // optional: to make the input editable
  onSubmit, // (value) => void
  onUndo,
}) {
  // responsive density tweaks
  const theme = useTheme();
  const dense = useMediaQuery(theme.breakpoints.down("md"));

  const [target, setTarget] = useState(18);
  const [followMode, setFollowMode] = useState("after"); // "after" | "before"
  const [betTypeKey, setBetTypeKey] = useState("Core28");
  const [localRange, setLocalRange] = useState(historyRange ?? 100);

  // keep internal range synced when parent changes the prop
  useEffect(() => {
    if (typeof historyRange === "number") setLocalRange(historyRange);
  }, [historyRange]);

  // auto-target the newest entered number
  useEffect(() => {
    if (!numbers.length) return;
    const last = Number(numbers[numbers.length - 1]);
    if (Number.isFinite(last) && last >= 0 && last <= 36 && last !== target) {
      setTarget(last);
    }
  }, [numbers, target]);

  // Slice by range
  const displayCount = Math.min(localRange, numbers.length);
  const slice = numbers.slice(-displayCount);

  // Current bet
  const bet = useMemo(() => betTypes[betTypeKey], [betTypeKey]);

  // Overall win/loss in the slice (independent of target/follow)
  const overall = useMemo(() => {
    const total = slice.length;
    const losses = slice.filter((n) => bet.lose.has(parseInt(n, 10))).length;
    const wins = total - losses;
    const pct = total ? ((wins / total) * 100).toFixed(1) : "—";
    return { total, wins, losses, pct };
  }, [slice, bet]);

  // Followers of selected target number
  const followers = useMemo(() => {
    const out = [];
    for (let i = 0; i < slice.length; i++) {
      if (parseInt(slice[i], 10) === parseInt(target, 10)) {
        const j = followMode === "after" ? i + 1 : i - 1;
        if (j >= 0 && j < slice.length) out.push(parseInt(slice[j], 10));
      }
    }
    return out;
  }, [slice, target, followMode]);

  // frequency of followers
  const freq = useMemo(() => {
    const m = new Map();
    for (const v of followers) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [followers]);

  // lose set display & win% on followers
  const loses = useMemo(() => [...bet.lose].sort((a, b) => a - b), [bet]);
  const winsCount = followers.filter((n) => !bet.lose.has(n)).length;
  const lossesCount = followers.length - winsCount;
  const winPct = followers.length
    ? ((winsCount / followers.length) * 100).toFixed(1)
    : "—";

  // Streak transitions (for the whole slice, based on current bet)
  const outcomes = useMemo(
    () => slice.map((n) => !bet.lose.has(parseInt(n, 10))),
    [slice, bet]
  );
  const transitions = useMemo(
    () => buildStreakTransitions(outcomes),
    [outcomes]
  );

  // Current streak + mini prediction from transitions
  const cur = useMemo(() => currentStreak(outcomes), [outcomes]);
  const prediction = useMemo(() => {
    if (!cur.type || !transitions[cur.type]?.[cur.len]?.total) return null;
    const r = transitions[cur.type][cur.len];
    if (r.nextWin === r.nextLoss)
      return { pick: "win", pct: fmtPct(r.nextWin, r.total) }; // tie -> win
    const pick = r.nextWin > r.nextLoss ? "win" : "loss";
    const pct = fmtPct(Math.max(r.nextWin, r.nextLoss), r.total);
    return { pick, pct };
  }, [cur, transitions]);

  // Render streak table with optional highlighting
  const renderTransTable = (
    title,
    rowsObj,
    flipColumnFirst = false,
    highlightLen = null,
    highlightPick = null // 'win' | 'loss'
  ) => {
    const lengths = Object.keys(rowsObj)
      .map((k) => parseInt(k, 10))
      .sort((a, b) => a - b);

    return (
      <Card elevation={2}>
        <CardHeader
          title={title}
          sx={{ py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
        />
        <CardContent sx={{ pt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Streak</TableCell>
                {flipColumnFirst ? (
                  <>
                    <TableCell align="right">Next is Loss %</TableCell>
                    <TableCell align="right">Next is Win %</TableCell>
                    <TableCell align="right">Switch %</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell align="right">Next is Win %</TableCell>
                    <TableCell align="right">Next is Loss %</TableCell>
                    <TableCell align="right">Switch %</TableCell>
                  </>
                )}
                <TableCell align="right">Samples</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lengths.map((len) => {
                const { nextWin, nextLoss, total } = rowsObj[len];
                const winp = fmtPct(nextWin, total);
                const lossp = fmtPct(nextLoss, total);
                const switchp = flipColumnFirst ? winp : lossp;

                const isHL = highlightLen === len;
                const hlRowSx = isHL
                  ? {
                      backgroundColor: "action.hover",
                      borderLeft: "3px solid #1976d2",
                    }
                  : undefined;

                const emphasizeWin =
                  isHL &&
                  highlightPick === "win" &&
                  total > 0 &&
                  nextWin >= nextLoss;
                const emphasizeLoss =
                  isHL &&
                  highlightPick === "loss" &&
                  total > 0 &&
                  nextLoss > nextWin;

                const winCellSx = emphasizeWin
                  ? { fontWeight: 700, bgcolor: "rgba(76,175,80,0.18)" }
                  : undefined;
                const lossCellSx = emphasizeLoss
                  ? { fontWeight: 700, bgcolor: "rgba(244,67,54,0.18)" }
                  : undefined;

                return (
                  <TableRow key={len} sx={hlRowSx}>
                    <TableCell>{len}</TableCell>

                    {flipColumnFirst ? (
                      <>
                        <TableCell align="right" sx={lossCellSx}>
                          {lossp}
                        </TableCell>
                        <TableCell align="right" sx={winCellSx}>
                          {winp}
                        </TableCell>
                        <TableCell align="right">{switchp}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="right" sx={winCellSx}>
                          {winp}
                        </TableCell>
                        <TableCell align="right" sx={lossCellSx}>
                          {lossp}
                        </TableCell>
                        <TableCell align="right">{switchp}</TableCell>
                      </>
                    )}

                    <TableCell align="right">{total}</TableCell>
                  </TableRow>
                );
              })}
              {lengths.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    Not enough data in this range.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container spacing={2} sx={{ width: "100%", mx: 0 }}>
      {/* TOP BAR */}
      <Grid item xs={12}>
        <TopBar
          pendingValue={pendingValue}
          onChangePending={onChangePending}
          onSubmit={onSubmit}
          onUndo={onUndo}
          localRange={localRange}
          setLocalRange={setLocalRange}
          onHistoryRangeChange={onHistoryRangeChange}
          betTypeKey={betTypeKey}
          setBetTypeKey={setBetTypeKey}
          overallPct={overall.pct}
          dense={dense}
        />
      </Grid>

      {/* LEFT: Recent numbers (slim, auto-fit grid) */}
      <Grid item xs={12} md={3} lg={3}>
        <RecentNumbersCard
          slice={slice}
          target={target}
          setTarget={setTarget}
          followMode={followMode}
          setFollowMode={setFollowMode}
          getNumberColor={getNumberColor}
          dense={dense}
        />
      </Grid>

      {/* RIGHT: followers + stats + streak tables */}
      <Grid item xs={12} md={9} lg={9}>
        <Card elevation={2} sx={{ height: "100%" }}>
          <CardHeader
            title={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  flexWrap: "wrap",
                }}
              >
                <Typography variant="subtitle1">Follows {target}</Typography>
                <Chip
                  size="small"
                  label={
                    followMode === "before"
                      ? "Previous spin in view"
                      : "Next spin in view"
                  }
                />
              </Box>
            }
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              bgcolor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              py: 1.25,
            }}
          />
          <CardContent sx={{ pt: 2 }}>
            {/* Lose set */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1.5, alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="body2" sx={{ mr: 0.5 }}>
                Lose on
              </Typography>
              {loses.map((n) => (
                <Chip
                  key={n}
                  label={n}
                  size="small"
                  sx={{ bgcolor: getNumberColor(n), color: "white" }}
                />
              ))}
            </Stack>

            {/* Followers frequency list */}
            <Table size="small" sx={{ mt: 1, mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Number</TableCell>
                  <TableCell align="right">Count</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {freq.map(([n, c]) => (
                  <TableRow key={n}>
                    <TableCell>
                      <Chip
                        label={n}
                        size="small"
                        sx={{ bgcolor: getNumberColor(n), color: "white" }}
                      />
                    </TableCell>
                    <TableCell align="right">{c}</TableCell>
                  </TableRow>
                ))}
                {freq.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      No occurrences in this range.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Summary chips incl. mini prediction */}
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 2 }}>
              <Chip size="small" label={`Total: ${followers.length}`} />
              <Chip size="small" color="success" label={`Wins: ${winsCount}`} />
              <Chip
                size="small"
                color="error"
                label={`Losses: ${lossesCount}`}
              />
              <Chip size="small" color="primary" label={`Win %: ${winPct}`} />
              <Chip
                size="small"
                color={
                  cur.type === "win"
                    ? "success"
                    : cur.type === "loss"
                    ? "error"
                    : "default"
                }
                label={
                  cur.type
                    ? `Current streak: ${cur.type.toUpperCase()} × ${cur.len}`
                    : "Current streak: —"
                }
              />
              <Chip
                size="small"
                color={
                  prediction?.pick === "win"
                    ? "success"
                    : prediction?.pick === "loss"
                    ? "error"
                    : "default"
                }
                label={
                  prediction
                    ? `Likely next: ${prediction.pick.toUpperCase()} (${
                        prediction.pct
                      }%)`
                    : "Likely next: —"
                }
              />
            </Stack>

            <Divider sx={{ my: 2 }} />

            {/* Side-by-side streak tables, highlighting current streak row & preferred next cell */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderTransTable(
                  "Next outcome after a WIN streak",
                  transitions.win,
                  true,
                  cur.type === "win" ? cur.len : null,
                  cur.type === "win" ? prediction?.pick ?? null : null
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderTransTable(
                  "Next outcome after a LOSS streak",
                  transitions.loss,
                  false,
                  cur.type === "loss" ? cur.len : null,
                  cur.type === "loss" ? prediction?.pick ?? null : null
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
