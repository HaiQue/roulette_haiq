// src/components/RouletteTable/index.js
import { useMemo, useState, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  CardHeader,
  CardContent,
  Box,
  Stack,
  Chip,
  TextField,
  MenuItem,
  Divider,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// -------------------- constants / helper data --------------------
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

const EDGE7 = new Set([0,1,2,3,34,35,36]); // fix later (is this needed conclude logic later)

const betTypes = {
  Core28: { lose: new Set([0, 3, 6, 7, 10, 25, 28, 33, 36]) },
  Core30: { lose: EDGE7 }
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

// Build “next outcome after streak” tables from boolean outcomes (true=win, false=loss)
const buildStreakTransitions = (outcomes) => {
  if (outcomes.length < 2) return { win: {}, loss: {} };

  // length of current streak at each index (ending at i)
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

// Compute current streak: type ('win' | 'loss') + length
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

// -------------------- component --------------------
export default function RouletteTable({
  numbers = [],
  historyRange = 100,
  onHistoryRangeChange,
  pendingValue = "",
  onChangePending,
  onSubmit,
  onUndo,
}) {
  const [betTypeKey, setBetTypeKey] = useState("Core28");
  const [localRange, setLocalRange] = useState(historyRange ?? 18);
  const [target, setTarget] = useState(18);
  const [historyCollapsed, setHistoryCollapsed] = useState(true);

  // expander for “next after every {target}”
  const AFTER_EACH_PREVIEW = 30;
  const [showAllAfterEach, setShowAllAfterEach] = useState(false);

  const inputRef = useRef(null);

  // -------------------- derived data --------------------
  const getNumberColor = (n) => {
    const x = parseInt(n, 10);
    if (x === 0) return "#2e7d32";
    if (redNumbers.has(x)) return "#d32f2f";
    if (blackNumbers.has(x)) return "#000000";
    return "#2e7d32";
  };

  // Slice by selected range
  const displayCount = Math.min(localRange, numbers.length);
  const slice = numbers.slice(-displayCount);

  // Current bet rules
  const bet = useMemo(() => betTypes[betTypeKey], [betTypeKey]);

  // Overall win/loss over the slice
  const overall = useMemo(() => {
    const total = slice.length;
    const losses = slice.filter((n) => bet.lose.has(parseInt(n, 10))).length;
    const wins = total - losses;
    const pct = total ? ((wins / total) * 100).toFixed(1) : "—";
    return { total, wins, losses, pct };
  }, [slice, bet]);

  // Win/Loss outcomes over the slice for current bet
  const outcomes = useMemo(
    () => slice.map((n) => !bet.lose.has(parseInt(n, 10))),
    [slice, bet]
  );
  const transitions = useMemo(
    () => buildStreakTransitions(outcomes),
    [outcomes]
  );

  // Current streak + rough “next” pick from transitions
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

  // Followers of the target (recent → older)
  const followersRecentFirst = useMemo(() => {
    const out = [];
    for (let i = slice.length - 1; i >= 0; i--) {
      if (parseInt(slice[i], 10) === parseInt(target, 10)) {
        const j = i + 1;
        if (j < slice.length) out.push(parseInt(slice[j], 10));
      }
    }
    return out; // already most-recent → older
  }, [slice, target]);

  // Frequency for follower counts
  const freq = useMemo(() => {
    const m = new Map();
    for (const v of followersRecentFirst) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [followersRecentFirst]);

  const loses = useMemo(() => [...bet.lose].sort((a, b) => a - b), [bet]);
  const winsCount = followersRecentFirst.filter((n) => !bet.lose.has(n)).length;
  const lossesCount = followersRecentFirst.length - winsCount;
  const winPct = followersRecentFirst.length
    ? ((winsCount / followersRecentFirst.length) * 100).toFixed(1)
    : "—";

  // Recent raw history (most recent first) for the top bar
  const recentHistoryFull = useMemo(() => [...slice].reverse(), [slice]);
  const recentHistory = useMemo(
    () =>
      historyCollapsed ? recentHistoryFull.slice(0, 10) : recentHistoryFull,
    [recentHistoryFull, historyCollapsed]
  );

  // -------------------- controls / effects --------------------
  const handlePrev = () => setTarget((t) => (t - 1 + 37) % 37);
  const handleNext = () => setTarget((t) => (t + 1) % 37);
  const handleTargetChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 0 && val <= 36) setTarget(val);
  };

  // auto-target last entered number
  useEffect(() => {
    if (!numbers.length) return;
    const last = Number(numbers[numbers.length - 1]);
    if (Number.isFinite(last) && last >= 0 && last <= 36) {
      setTarget(last);
    }
  }, [numbers]);

  // Enter key submits and re-focuses the input (fast entry)
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  // -------------------- render helpers --------------------
  const renderTransTable = (
    title,
    rowsObj,
    flip = false,
    highlightLen = null
  ) => {
    const lengths = Object.keys(rowsObj)
      .map(Number)
      .sort((a, b) => a - b);

    return (
      <Card elevation={2} sx={{ height: "100%" }}>
        <CardHeader title={title} />
        <CardContent sx={{ pt: 1 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Streak</TableCell>
                {flip ? (
                  <>
                    <TableCell align="right">Next Loss %</TableCell>
                    <TableCell align="right">Next Win %</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell align="right">Next Win %</TableCell>
                    <TableCell align="right">Next Loss %</TableCell>
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
                const rowSx =
                  highlightLen === len
                    ? {
                        backgroundColor: "action.hover",
                        borderLeft: "3px solid #1976d2",
                      }
                    : undefined;
                return (
                  <TableRow key={len} sx={rowSx}>
                    <TableCell>{len}</TableCell>
                    {flip ? (
                      <>
                        <TableCell align="right">{lossp}</TableCell>
                        <TableCell align="right">{winp}</TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell align="right">{winp}</TableCell>
                        <TableCell align="right">{lossp}</TableCell>
                      </>
                    )}
                    <TableCell align="right">{total}</TableCell>
                  </TableRow>
                );
              })}
              {lengths.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4}>
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

  const renderNextAfterEvery = () => {
    const total = followersRecentFirst.length;

    if (!total) {
      return (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          No occurrences of {target} in this range.
        </Typography>
      );
    }

    const display = showAllAfterEach
      ? followersRecentFirst
      : followersRecentFirst.slice(0, AFTER_EACH_PREVIEW);

    const hasMore = total > AFTER_EACH_PREVIEW;

    return (
      <Box sx={{ mt: 0.75 }}>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          {display.map((n, i) => {
            const isWin = !bet.lose.has(n);
            return (
              <Chip
                key={`${n}-${i}`}
                label={n}
                size="small"
                color={isWin ? "success" : "error"}
                sx={{ fontWeight: 600 }}
              />
            );
          })}

          {hasMore && !showAllAfterEach && (
            <Chip
              size="small"
              variant="outlined"
              label={`+${total - AFTER_EACH_PREVIEW} more`}
              onClick={() => setShowAllAfterEach(true)}
              sx={{ cursor: "pointer" }}
            />
          )}
        </Stack>

        {hasMore && showAllAfterEach && (
          <Button
            size="small"
            onClick={() => setShowAllAfterEach(false)}
            sx={{ mt: 0.5, textTransform: "none" }}
          >
            Show first {AFTER_EACH_PREVIEW}
          </Button>
        )}
      </Box>
    );
  };

  // -------------------- JSX --------------------
  return (
    <Grid container spacing={2}>
      {/* TOP BAR */}
      <Grid item xs={12}>
        <Card elevation={2} sx={{ p: 1.5 }}>
          {/* Row 1: input + submit/undo + recent history */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              flexWrap: "wrap",
            }}
          >
            <TextField
              inputRef={inputRef}
              label="Enter number (0–36)"
              size="small"
              value={pendingValue ?? ""}
              onChange={(e) => onChangePending?.(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{ width: 240 }}
            />
            <Button variant="contained" size="small" onClick={onSubmit}>
              SUBMIT
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={onUndo}
            >
              UNDO
            </Button>

            {/* Recent history chips (collapse/expand) */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(10, minmax(28px, auto))",
                gap: "4px",
                ml: 1,
                flex: 1,
                maxWidth: "100%",
              }}
            >
              {recentHistory.map((n, i) => (
                <Chip
                  key={`${n}-${i}`}
                  label={n}
                  size="small"
                  sx={{
                    bgcolor: getNumberColor(n),
                    color: "white",
                    fontWeight: 700,
                  }}
                />
              ))}
            </Box>

            <IconButton
              size="small"
              onClick={() => setHistoryCollapsed((v) => !v)}
              title={historyCollapsed ? "Show more" : "Show less"}
            >
              {historyCollapsed ? (
                <ExpandMoreIcon fontSize="small" />
              ) : (
                <ExpandLessIcon fontSize="small" />
              )}
            </IconButton>
          </Box>

          <Divider sx={{ my: 1 }} />

          {/* Row 2: right cluster */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
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
              {[18, 24, 38, 50, 100, 200, 300, 400, 500, 1000].map((v) => (
                <MenuItem key={v} value={v}>
                  Last {v}
                </MenuItem>
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

            {/* Manual editable Number field */}
            <TextField
              label="Number"
              size="small"
              type="number"
              value={target}
              onChange={handleTargetChange}
              inputProps={{ min: 0, max: 36 }}
              sx={{ width: 100 }}
            />
            <Button variant="outlined" size="small" onClick={handlePrev}>
              PREV
            </Button>
            <Button variant="outlined" size="small" onClick={handleNext}>
              NEXT
            </Button>

            <StatChip
              label="Overall Win %"
              value={overall.pct}
              color="primary"
            />
          </Box>
        </Card>
      </Grid>

      {/* BODY */}
      <Grid item xs={12}>
        <Card elevation={2}>
          <CardHeader
            title={`Follows ${followersRecentFirst.length}`}
            subheader="Next spin in view"
          />
          <CardContent>
            {/* Lose-on row */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1.5, flexWrap: "wrap" }}
            >
              <Typography variant="body2">Lose on</Typography>
              {loses.map((n) => (
                <Chip
                  key={n}
                  label={n}
                  size="small"
                  sx={{ bgcolor: getNumberColor(n), color: "white" }}
                />
              ))}
            </Stack>

            {/* Mini stats */}
            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: "wrap" }}>
              <StatChip label="Total" value={followersRecentFirst.length} />
              <StatChip label="Wins" value={winsCount} color="success" />
              <StatChip label="Losses" value={lossesCount} color="error" />
              <StatChip label="Win %" value={winPct} color="primary" />
            </Stack>

            {/* Current streak + simple next pick */}
            <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
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

            {/* Next after EVERY <target> */}
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, color: "text.secondary", mb: 0.25 }}
              >
                Next after every {target} ({followersRecentFirst.length}) — most
                → older
              </Typography>
              {renderNextAfterEvery()}
            </Box>

            {/* Frequency table */}
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

            {/* Streak tables */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                {renderTransTable(
                  "Next outcome after a WIN streak",
                  transitions.win,
                  true,
                  cur.type === "win" ? cur.len : null
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                {renderTransTable(
                  "Next outcome after a LOSS streak",
                  transitions.loss,
                  false,
                  cur.type === "loss" ? cur.len : null
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
