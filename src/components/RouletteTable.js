import { Grid, Box, Typography, Paper } from "@mui/material";

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
  const displayCount = Math.min(historyRange, 50); // Display max 20 numbers to avoid overcrowding

  return (
    <Grid container spacing={2}>
      {/* Main content area - Three columns layout */}

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
    </Grid>
  );
};

export default RouletteTable;
