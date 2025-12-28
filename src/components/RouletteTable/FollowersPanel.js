// src/components/RouletteTable/FollowersPanel.js
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Chip,
  Stack,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Grid,
  Typography,
} from "@mui/material";
import NumbersGrid from "../NumbersGrid";
import StreakTable from "./StreakTable";

const StatChip = ({ label, value, color = "default" }) => (
  <Chip
    label={`${label}: ${value}`}
    size="small"
    color={color}
    sx={{ fontWeight: 600 }}
  />
);

const FollowersPanel = ({
  target,
  followMode, // 'after' | 'before'
  loses, // sorted array of losing numbers
  followers, // numbers following target under mode
  getNumberColor,
  winsCount,
  lossesCount,
  winPct,
  freq, // [[n,count],...]
  transitions, // { win:{}, loss:{} }
  current, // { type:'win'|'loss'|null, len:number }
  prediction, // { pick:'win'|'loss', pct:string } | null
}) => {
  return (
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

        {/* Mini prediction */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
        >
          <Chip
            size="small"
            color={
              current.type === "win"
                ? "success"
                : current.type === "loss"
                ? "error"
                : "default"
            }
            label={
              current.type
                ? `Current streak: ${current.type.toUpperCase()} × ${
                    current.len
                  }`
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

        {/* Frequency table */}
        {/* By frequency – compact chips */}
        <Box sx={{ mt: 1, mb: 2 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.secondary", mb: 0.5 }}
          >
            By frequency
          </Typography>

          {freq.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No occurrences in this range.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap" }}>
              {freq.map(([n, c]) => (
                <Box
                  key={n}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    mb: 0.5,
                  }}
                >
                  <Chip
                    label={n}
                    size="small"
                    sx={{
                      bgcolor: getNumberColor(n),
                      color: "white",
                      fontWeight: 600,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    ×{c}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>


        {/* Side-by-side streak tables */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <StreakTable
              title="Next outcome after a WIN streak"
              rowsObj={transitions.win}
              flipColumnFirst
              highlightLen={current.type === "win" ? current.len : null}
              highlightPick={
                current.type === "win" ? prediction?.pick ?? null : null
              }
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <StreakTable
              title="Next outcome after a LOSS streak"
              rowsObj={transitions.loss}
              flipColumnFirst={false}
              highlightLen={current.type === "loss" ? current.len : null}
              highlightPick={
                current.type === "loss" ? prediction?.pick ?? null : null
              }
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default FollowersPanel;
