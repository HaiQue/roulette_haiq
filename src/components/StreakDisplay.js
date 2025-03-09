import { useTheme } from "@mui/material/styles";
import { Box, Typography, Paper } from "@mui/material";

function StreakDisplay({ currentStreak = {} }) {
  const theme = useTheme();

  // Ensure currentStreak has all required properties with default values
  const streak = {
    red: 0,
    black: 0,
    ...currentStreak,
  };
  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          flex: 1,
          bgcolor:
            streak.red > 0
              ? theme.palette.roulette?.red || "red"
              : "background.paper",
          color: streak.red > 0 ? "white" : "text.primary",
        }}
      >
        <Typography variant="h6" align="center">
          Red
        </Typography>
        <Typography variant="h4" align="center">
          {streak.red}
        </Typography>
      </Paper>

      <Paper
        elevation={2}
        sx={{
          p: 2,
          flex: 1,
          bgcolor:
            streak.black > 0
              ? theme.palette.roulette?.black || "black"
              : "background.paper",
          color: streak.black > 0 ? "white" : "text.primary",
        }}
      >
        <Typography variant="h6" align="center">
          Black
        </Typography>
        <Typography variant="h4" align="center">
          {streak.black}
        </Typography>
      </Paper>
    </Box>
  );
}

export default StreakDisplay;
