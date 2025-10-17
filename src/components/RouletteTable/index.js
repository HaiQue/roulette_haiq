// src/components/RouletteTable/index.js
import { useMemo, useState, useEffect } from "react";
import {
  Grid,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SwapVertIcon from "@mui/icons-material/SwapVert";

// IMPORTANT: path assumes NumbersGrid is at src/components/NumbersGrid.js
import NumbersGrid from "../NumbersGrid";

// ---------------- colors / bet definitions ----------------
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

const betTypes = {
  Core28: { lose: new Set([0, 3, 6, 7, 10, 25, 28, 33, 36]) },
};

const getNumberColor = (n) => {
  const x = parseInt(n, 10);
  if (x === 0) return "#2e7d32";
  if (redNumbers.has(x)) return "#d32f2f";
  if (blackNumbers.has(x)) return "#000000";
  return "#2e7d32";
};

const StatChip = ({ label, value, color = "default" }) => (
  <Chip
    label={`${label}: ${value}`}
    size="small"
    color={color}
    sx={{ fontWeight: 600 }}
  />
);

const fmtPct = (num, den) => (den ? ((num / den) * 100).toFixed(1) : "—");

// ------------ helpers for streak tables ------------
const buildStreakTransitions = (outcomes) => {
  if (outcomes.length < 2) return { win: {}, loss: {} };

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

// ============================================================

export default function RouletteTable({
  numbers = [],
  historyRange = 100,
  onHistoryRangeChange,
  pendingValue = "",
  onChangePending,
  onSubmit,
  onUndo,
}) {
  const [target, setTarget] = useState(18);
  const [followMode, setFollowMode] = useState("after");
  const [betTypeKey, setBetTypeKey] = useState("Core28");
  const [localRange, setLocalRange] = useState(historyRange ?? 100);

  // quick filter toggles
  const [includeZero, setIncludeZero] = useState(true);
  const [includeRed, setIncludeRed] = useState(true);
  const [includeBlack, setIncludeBlack] = useState(true);

  // reflect parent range
  useEffect(() => {
    if (typeof historyRange === "number") setLocalRange(historyRange);
  }, [historyRange]);

  // auto-target newest entered number
  useEffect(() => {
    if (!numbers.length) return;
    const last = Number(numbers[numbers.length - 1]);
    if (Number.isFinite(last) && last >= 0 && last <= 36 && last !== target) {
      setTarget(last);
    }
  }, [numbers, target]);

  // slice by range
  const displayCount = Math.min(localRange, numbers.length);
  const slice = numbers.slice(-displayCount);

  const bet = useMemo(() => betTypes[betTypeKey], [betTypeKey]);

  // overall win/loss (whole slice)
  const overall = useMemo(() => {
    const total = slice.length;
    const losses = slice.filter((n) => bet.lose.has(parseInt(n, 10))).length;
    const wins = total - losses;
    const pct = total ? ((wins / total) * 100).toFixed(1) : "—";
    return { total, wins, losses, pct };
  }, [slice, bet]);

  // followers of target in-view (older → newer)
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

  // most-recent → older
  const followersRecentFirst = useMemo(
    () => [...followers].reverse(),
    [followers]
  );

  // apply filters
  const followersFiltered = useMemo(() => {
    return followersRecentFirst.filter((n) => {
      if (n === 0) return includeZero;
      if (redNumbers.has(n)) return includeRed;
      if (blackNumbers.has(n)) return includeBlack;
      return true;
    });
  }, [followersRecentFirst, includeZero, includeRed, includeBlack]);

  // frequency table from filtered followers
  const freq = useMemo(() => {
    const m = new Map();
    for (const v of followersFiltered) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [followersFiltered]);

  const loses = useMemo(() => [...bet.lose].sort((a, b) => a - b), [bet]);

  const winsCount = followersFiltered.filter((n) => !bet.lose.has(n)).length;
  const lossesCount = followersFiltered.length - winsCount;
  const winPct = followersFiltered.length
    ? ((winsCount / followersFiltered.length) * 100).toFixed(1)
    : "—";

  // slice outcomes for streak tables
  const outcomes = useMemo(
    () => slice.map((n) => !bet.lose.has(parseInt(n, 10))),
    [slice, bet]
  );
  const transitions = useMemo(
    () => buildStreakTransitions(outcomes),
    [outcomes]
  );
  const cur = useMemo(() => currentStreak(outcomes), [outcomes]);
  const prediction = useMemo(() => {
    if (!cur.type || !transitions[cur.type]?.[cur.len]?.total) return null;
    const r = transitions[cur.type][cur.len];
    if (r.nextWin === r.nextLoss)
      return { pick: "win", pct: fmtPct(r.nextWin, r.total) };
    const pick = r.nextWin > r.nextLoss ? "win" : "loss";
    const pct = fmtPct(Math.max(r.nextWin, r.nextLoss), r.total);
    return { pick, pct };
  }, [cur, transitions]);

  // next 1–3 after last target
  const nextAfterLastTarget = useMemo(() => {
    let idx = -1;
    for (let i = slice.length - 1; i >= 0; i--) {
      if (parseInt(slice[i], 10) === parseInt(target, 10)) {
        idx = i;
        break;
      }
    }
    if (idx === -1) return [];
    const out = [];
    for (let k = 1; k <= 3; k++) {
      const j = followMode === "after" ? idx + k : idx - k;
      if (j >= 0 && j < slice.length) out.push(parseInt(slice[j], 10));
    }
    return out;
  }, [slice, target, followMode]);

  // groups for run markers
  const followerGroups = useMemo(() => {
    const groups = [];
    let i = 0;
    while (i < followersFiltered.length) {
      const v = followersFiltered[i];
      let j = i + 1;
      while (j < followersFiltered.length && followersFiltered[j] === v) j++;
      groups.push({ value: v, count: j - i });
      i = j;
    }
    return groups;
  }, [followersFiltered]);

  const isValid = String(pendingValue ?? "").match(/^([0-9]|[12]\d|3[0-6])$/);

  // helper to render a streak table (with optional row/cell highlight)
  const renderTransTable = (
    title,
    rowsObj,
    flipColumnFirst = false,
    highlightLen = null,
    highlightPick = null // 'win' | 'loss'
  ) => {
    const fmtPct = (num, den) => (den ? ((num / den) * 100).toFixed(1) : "—");
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
        <Card elevation={2} sx={{ p: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flexWrap: "wrap",
            }}
          >
            <TextField
              label="Enter number (0–36)"
              size="small"
              value={pendingValue ?? ""}
              onChange={(e) => onChangePending?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid && onSubmit) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              sx={{ width: 220 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={onSubmit}
              disabled={!onSubmit || !isValid}
            >
              Submit
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onUndo}
              disabled={!onUndo}
            >
              Undo
            </Button>

            <Box sx={{ ml: "auto", display: "flex", gap: 1, flexWrap: "wrap" }}>
              <TextField
                label="History Range"
                size="small"
                value={localRange}
                select
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLocalRange(v);
                  onHistoryRangeChange?.(v);
                }}
                sx={{ width: 140 }}
              >
                {[50, 100, 200, 300, 400, 500, 10000].map((v) => (
                  <MenuItem key={v} value={v}>{`Last ${v}`}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Bet Type"
                size="small"
                value={betTypeKey}
                onChange={(e) => setBetTypeKey(e.target.value)}
                select
                sx={{ width: 140 }}
              >
                {Object.keys(betTypes).map((k) => (
                  <MenuItem key={k} value={k}>
                    {k}
                  </MenuItem>
                ))}
              </TextField>

              <StatChip
                label="Overall Win %"
                value={overall.pct}
                color="primary"
              />
            </Box>
          </Box>
        </Card>
      </Grid>

      {/* LEFT: recent numbers */}
      <Grid item xs={12} md={3}>
        <Card elevation={2}>
          <CardHeader
            title="Recent Numbers"
            action={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                <TextField
                  label="Number"
                  size="small"
                  value={target}
                  onChange={(e) => setTarget(parseInt(e.target.value, 10))}
                  select
                  sx={{ width: 110 }}
                >
                  {Array.from({ length: 37 }, (_, i) => (
                    <MenuItem key={i} value={i}>
                      {i}
                    </MenuItem>
                  ))}
                </TextField>
                <ToggleButtonGroup
                  size="small"
                  value={followMode}
                  exclusive
                  onChange={(_, v) => v && setFollowMode(v)}
                >
                  <ToggleButton value="before">Prev</ToggleButton>
                  <ToggleButton value="after">Next</ToggleButton>
                </ToggleButtonGroup>
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
            <NumbersGrid
              numbers={slice}
              getNumberColor={getNumberColor}
              columns={10}
              maxHeight="40vh"
            />
          </CardContent>
        </Card>
      </Grid>

      {/* RIGHT SIDE */}
      <Grid item xs={12} md={9}>
        <Card elevation={2} sx={{ height: "100%" }}>
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
            {/* lose set */}
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

            {/* QUICK FILTERS */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1.5, alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="body2" sx={{ mr: 0.5 }}>
                Filters:
              </Typography>

              <Chip
                size="small"
                label="0"
                onClick={() => setIncludeZero((v) => !v)}
                color={includeZero ? "success" : "default"}
                sx={{
                  bgcolor: includeZero ? "#2e7d32" : undefined,
                  color: "white",
                }}
              />

              <Chip
                size="small"
                label="Red"
                onClick={() => setIncludeRed((v) => !v)}
                sx={{
                  bgcolor: includeRed ? "#d32f2f" : undefined,
                  color: includeRed ? "white" : undefined,
                }}
              />

              <Chip
                size="small"
                label="Black"
                onClick={() => setIncludeBlack((v) => !v)}
                sx={{
                  bgcolor: includeBlack ? "#000" : undefined,
                  color: includeBlack ? "white" : undefined,
                }}
              />

              {/* Reset filters */}
              <Chip
                size="small"
                variant="outlined"
                label="Reset"
                onClick={() => {
                  setIncludeZero(true);
                  setIncludeRed(true);
                  setIncludeBlack(true);
                }}
                sx={{ ml: 0.5 }}
              />
            </Stack>

            {/* RECENT FOLLOWERS (most recent → older) WITH RUN MARKERS */}
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="body2" sx={{ mb: 0.5, opacity: 0.8 }}>
                Recent followers (next) — most → older
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 0.75,
                }}
              >
                {followerGroups.map((g, idx) => (
                  <Box
                    key={`${g.value}-${idx}`}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    {Array.from({ length: g.count }).map((_, i) => (
                      <Chip
                        key={i}
                        size="small"
                        label={g.value}
                        sx={{
                          bgcolor: getNumberColor(g.value),
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                    ))}

                    {idx < followerGroups.length - 1 && (
                      <Box
                        sx={{
                          width: 6,
                          height: 18,
                          borderRadius: "3px",
                          bgcolor: "divider",
                          mx: 0.25,
                        }}
                      />
                    )}
                  </Box>
                ))}

                {followerGroups.length === 0 && (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    No occurrences in this filtered view.
                  </Typography>
                )}
              </Box>
            </Box>

            {/* MICRO PANEL: next after LAST target */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                Next after the last {target}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                {nextAfterLastTarget.length === 0 && (
                  <Typography variant="body2" sx={{ opacity: 0.7 }}>
                    Not available in current range.
                  </Typography>
                )}

                {nextAfterLastTarget.map((n, i) => {
                  const isWin = !bet.lose.has(n);
                  return (
                    <Stack key={`${n}-${i}`} alignItems="center" spacing={0.5}>
                      <Chip
                        size="small"
                        label={n}
                        sx={{
                          bgcolor: getNumberColor(n),
                          color: "white",
                          fontWeight: 700,
                        }}
                      />
                      <Chip
                        size="small"
                        label={isWin ? "WIN" : "LOSS"}
                        color={isWin ? "success" : "error"}
                        variant="outlined"
                        sx={{ height: 18 }}
                      />
                    </Stack>
                  );
                })}
              </Stack>
            </Box>

            {/* STATS */}
            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
              <StatChip label="Total" value={followersFiltered.length} />
              <StatChip label="Wins" value={winsCount} color="success" />
              <StatChip label="Losses" value={lossesCount} color="error" />
              <StatChip label="Win %" value={winPct} color="primary" />
            </Stack>

            {/* FREQUENCY (filtered) */}
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
                      No occurrences in this filtered view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* STREAK TABLES */}
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
