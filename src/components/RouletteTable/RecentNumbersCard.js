import {
  Card,
  CardHeader,
  CardContent,
  Box,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";

function NumberPill({ n, color, size }) {
  return (
    <Box
      sx={{
        width: size,
        aspectRatio: "1 / 1",
        borderRadius: 1.25,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size < 28 ? 12 : 14,
        color: "white",
        bgcolor: color,
        boxShadow: "0 1px 2px rgba(0,0,0,.25)",
        border: "1px solid rgba(255,255,255,.18)",
        userSelect: "none",
      }}
    >
      {n}
    </Box>
  );
}

export default function RecentNumbersCard({
  slice,
  target,
  setTarget,
  followMode,
  setFollowMode,
  getNumberColor,
  dense = false,
}) {
  // base size for a square chip; we’ll compute columns from available width
  const BASE = dense ? 26 : 32;
  const GAP = dense ? 0.5 : 0.75;

  const containerRef = useRef(null);
  const [cols, setCols] = useState(8);
  const [size, setSize] = useState(BASE);

  // Dynamically compute how many columns we can fit based on container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width || el.clientWidth || 260;
      const chipWithGap = BASE + 8; // px (including grid gap + borders)
      const computedCols = Math.max(4, Math.floor(w / chipWithGap));
      setCols(computedCols);

      // adjust the actual chip size to use the full width nicely
      const computedSize = Math.floor(
        (w - (computedCols - 1) * 8) / computedCols
      );
      setSize(Math.max(22, Math.min(computedSize, dense ? 28 : 34)));
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, [dense, BASE]);

  const gridItems = useMemo(
    () =>
      [...slice]
        .reverse()
        .map((n, i) => (
          <NumberPill
            key={`${n}-${i}`}
            n={n}
            color={getNumberColor(n)}
            size={size}
          />
        )),
    [slice, getNumberColor, size]
  );

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderRadius: 3,
      }}
    >
      <CardHeader
        title="Recent Numbers"
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TextField
              label="Number"
              size="small"
              value={target}
              onChange={(e) => setTarget(parseInt(e.target.value, 10))}
              select
              sx={{ width: dense ? 88 : 110 }}
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
          py: dense ? 0.75 : 1,
        }}
      />
      <CardContent sx={{ pt: dense ? 1 : 1.5 }}>
        <Box
          ref={containerRef}
          className="thin-scrollbar"
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${size}px)`,
            gap: GAP,
            maxHeight: dense ? 380 : 460,
            overflowY: "auto",
            pr: 0.5,
          }}
        >
          {gridItems}
        </Box>
      </CardContent>
    </Card>
  );
}
