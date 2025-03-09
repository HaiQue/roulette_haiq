import React from "react";
import { Paper, Typography, Box } from "@mui/material";

const RecentNumbers = ({ numbers }) => {
  if (!numbers || numbers.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6">Recent Numbers</Typography>
        <Typography>No numbers yet. Start by adding a number.</Typography>
      </Paper>
    );
  }

  // Helper function to determine color based on number
  const getNumberColor = (number) => {
    if (number === 0) return "green";
    const redNumbers = [
      1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
    ];
    return redNumbers.includes(number) ? "red" : "black";
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Recent Numbers
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {numbers.map((number, index) => {
          const color = getNumberColor(number);
          return (
            <Box
              key={index}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                backgroundColor: color,
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
              }}
            >
              {number}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default RecentNumbers;
