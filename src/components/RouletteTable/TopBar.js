// src/components/RouletteTable/TopBar.js
import { useRef } from "react";

import { Card, Box, TextField, MenuItem, Button, Chip } from "@mui/material";

const StatChip = ({ label, value, color = "default" }) => (
  <Chip
    label={`${label}: ${value}`}
    size="small"
    color={color}
    sx={{ fontWeight: 600 }}
  />
);

export default function TopBar({
  pendingValue,
  onChangePending, // optional: if omitted, input is disabled
  onSubmit,
  onUndo,
  localRange,
  setLocalRange,
  onHistoryRangeChange,
  betTypeKey,
  setBetTypeKey,
  overallPct,
  dense,
}) {
  // ✅ moved here so it reads the prop
  const isValid = String(pendingValue ?? "").match(/^([0-9]|[12]\d|3[0-6])$/);

  // auto-refocus
  const inputRef = useRef(null);

  return (
    <Card elevation={2} sx={{ p: dense ? 1 : 1.5 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          flexWrap: "wrap",
        }}
      >
        {/* Left: input + buttons */}
        <TextField
          inputRef={inputRef}
          label="Enter number (0–36)"
          size="small"
          value={pendingValue ?? ""}
          onChange={(e) => onChangePending?.(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && isValid) {
              e.preventDefault();
              onSubmit?.();
              setTimeout(() => inputRef.current?.focus(), 50); // keep focus for next entry
            }
          }}
          disabled={!onChangePending}
          sx={{ width: 220 }}
        />

        <Button
          variant="contained"
          size="small"
          onClick={() => onSubmit?.()}
          disabled={!onSubmit || !isValid}
        >
          SUBMIT
        </Button>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onUndo?.()}
          disabled={!onUndo}
        >
          UNDO
        </Button>

        {/* Right controls */}
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: 1,
            flexWrap: "wrap",
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
            <MenuItem value="Core28">Core28</MenuItem>
          </TextField>

          <StatChip label="Overall Win %" value={overallPct} color="primary" />
        </Box>
      </Box>
    </Card>
  );
}
