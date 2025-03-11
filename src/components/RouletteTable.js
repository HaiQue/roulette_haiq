import { Grid, Box, Typography, Paper } from "@mui/material";
import NumbersTable from "./NumbersTable";
import ColorStreaks from "./ColorStreaks";

// Define the red and black numbers sets
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

const RouletteTable = ({ numbers, historyRange, currentStreak }) => {
  // Function to determine the color of a number
  const getNumberColor = (num) => {
    const number = parseInt(num, 10);
    if (number === 0) return "green";
    if (redNumbers.has(number)) return "red";
    if (blackNumbers.has(number)) return "black";
    return "green"; // Default fallback
  };

  // Function to get the background color style
  const getBackgroundColor = (num) => {
    const color = getNumberColor(num);
    return { backgroundColor: color };
  };

  // Calculate how many numbers to display in the recent numbers column
  const displayCount = Math.min(historyRange, 20); // Display max 20 numbers to avoid overcrowding

  return (
    <Grid container spacing={2}>
      {/* Main content area - Three columns layout */}
      <Grid container item xs={12} spacing={2}>
        {/* Left column - Numbers Table */}
        <Grid item xs={12} md={5}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <NumbersTable
              numbers={numbers}
              redNumbers={redNumbers}
              blackNumbers={blackNumbers}
              historyRange={historyRange}
            />
          </Paper>
        </Grid>

        {/* Middle column - Recent Numbers */}
        <Grid item xs={12} md={3}>
          <Paper elevation={3} sx={{ p: 2, height: "100%" }}>
            <Typography variant="h6" gutterBottom align="center">
              Recent Numbers
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 1,
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              {numbers
                .slice(-displayCount)
                .reverse()
                .map((num, index) => (
                  <Box
                    key={index}
                    className="roulette-number"
                    sx={{
                      ...getBackgroundColor(num),
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      color: "white", // Make text white for better visibility
                      fontWeight: "bold",
                    }}
                  >
                    {num}
                  </Box>
                ))}
            </Box>
          </Paper>
        </Grid>

        {/* Right column - Stats */}
        <Grid item xs={12} md={4}>
          <Grid container direction="column" spacing={2}>
            {/* Color Streaks */}
            <Grid item>
              <ColorStreaks currentStreak={currentStreak} />
            </Grid>

            {/* Number Range Streaks */}
            <Grid item>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom align="center">
                  Number Range Streaks
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Box
                      sx={{
                        bgcolor: "#FFD700", // Gold/Yellow
                        p: 2,
                        textAlign: "center",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">First (1-12)</Typography>
                      <Typography variant="h4">
                        {currentStreak?.first || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box
                      sx={{
                        bgcolor: "#87CEEB", // Sky Blue
                        p: 2,
                        textAlign: "center",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">
                        Second (13-24)
                      </Typography>
                      <Typography variant="h4">
                        {currentStreak?.second || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box
                      sx={{
                        bgcolor: "#006400", // Dark Green
                        p: 2,
                        textAlign: "center",
                        color: "white",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Third (25-36)</Typography>
                      <Typography variant="h4">
                        {currentStreak?.third || 0}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={3}>
                    <Box
                      sx={{
                        bgcolor: "#32CD32", // Lime Green
                        p: 2,
                        textAlign: "center",
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="subtitle2">Zero (0)</Typography>
                      <Typography variant="h4">
                        {currentStreak?.zero || 0}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default RouletteTable;
