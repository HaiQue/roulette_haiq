// RouletteTable.js
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
import NumbersGrid from "./NumbersGrid";

const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

const betTypes = {
  Core28: { lose: new Set([0, 3, 6, 7, 10, 25, 28, 33, 36]) },
};

const StatChip = ({ label, value, color = "default" }) => (
  <Chip
    label={`${label}: ${value}`}
    size="small"
    color={color}
    sx={{ fontWeight: 600 }}
  />
);

// ✅ add these props with defaults
const RouletteTable = ({
  numbers,
  historyRange,
  onHistoryRangeChange,
  pendingValue = "",
  onSubmit = undefined,
  onUndo = undefined,
}) => {
  const [target, setTarget] = useState(18);
  const [followMode, setFollowMode] = useState("after");
  const [betTypeKey, setBetTypeKey] = useState("Core28");

  // local history range control
  const [localRange, setLocalRange] = useState(historyRange ?? 100);
  useEffect(() => {
    if (typeof historyRange === "number" && historyRange !== localRange) {
      setLocalRange(historyRange);
    }
  }, [historyRange]); // eslint-disable-line react-hooks/exhaustive-deps

  // auto-select newest entered number
  useEffect(() => {
    if (!numbers?.length) return;
    const last = Number(numbers[numbers.length - 1]);
    if (Number.isFinite(last) && last >= 0 && last <= 36 && last !== target) {
      setTarget(last);
    }
  }, [numbers]); // eslint-disable-line react-hooks/exhaustive-deps

  const getNumberColor = (n) => {
    const x = parseInt(n, 10);
    if (x === 0) return "#2e7d32";
    if (redNumbers.has(x)) return "#d32f2f";
    if (blackNumbers.has(x)) return "#000000";
    return "#2e7d32";
  };

  // use localRange for slicing
  const displayCount = Math.min(localRange, numbers.length);
  const slice = numbers.slice(-displayCount);

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

  const freq = useMemo(() => {
    const m = new Map();
    for (const v of followers) m.set(v, (m.get(v) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [followers]);

  const bet = betTypes[betTypeKey];
  const loses = [...bet.lose].sort((a, b) => a - b);
  const winsCount = followers.filter((n) => !bet.lose.has(n)).length;
  const lossesCount = followers.length - winsCount;
  const winPct = followers.length
    ? ((winsCount / followers.length) * 100).toFixed(1)
    : "—";

  return (
    <Grid container spacing={2} sx={{ width: "100%", mx: 0 }}>
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
            {/* These are optional; they only do something if parent passes handlers */}
            <TextField
              label="Enter number (0–36)"
              size="small"
              value={pendingValue}
              onChange={() => {}}
              disabled
              sx={{ width: 220 }}
            />
            <Button
              variant="contained"
              size="small"
              onClick={onSubmit}
              disabled={!onSubmit}
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

            <Box sx={{ flex: 1 }} />
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
              {[100, 200, 300, 400, 500].map((v) => (
                <MenuItem key={v} value={v}>{`Last ${v}`}</MenuItem>
              ))}
            </TextField>
          </Box>
        </Card>
      </Grid>

      <Grid item xs={12} md={7}>
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
              maxHeight="52vh"
            />
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={5}>
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
            action={
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
            <Stack
              direction="row"
              spacing={1}
              sx={{ mb: 1.5, alignItems: "center", flexWrap: "wrap" }}
            >
              <Typography variant="body2" sx={{ mr: 0.5 }}>
                Lose on
              </Typography>
              {[...bet.lose]
                .sort((a, b) => a - b)
                .map((n) => (
                  <Chip
                    key={n}
                    label={n}
                    size="small"
                    sx={{ bgcolor: getNumberColor(n), color: "white" }}
                  />
                ))}
            </Stack>

            <NumbersGrid
              numbers={followers}
              getNumberColor={getNumberColor}
              columns={10}
              maxHeight="none"
            />

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", mb: 1 }}>
              <StatChip label="Total" value={followers.length} />
              <StatChip label="Wins" value={winsCount} color="success" />
              <StatChip label="Losses" value={lossesCount} color="error" />
              <StatChip label="Win %" value={winPct} color="primary" />
            </Stack>

            <Table size="small" sx={{ mt: 1 }}>
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
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RouletteTable;
