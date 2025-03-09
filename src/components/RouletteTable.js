import React from "react";
import { Grid, Box, Typography } from "@mui/material";
import "./RouletteTable.css";
import NumbersTable from "./NumbersTable";

// Define the red and black numbers in European roulette
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);

const RouletteTable = ({ numbers }) => {
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

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom>
        Recent Numbers
      </Typography>

      {/* Display the last 10 numbers in a row */}
      <Box sx={{ display: "flex", flexWrap: "wrap", mb: 3 }}>
        {numbers
          .slice(-10)
          .reverse()
          .map((num, index) => (
            <Box
              key={index}
              className="roulette-number"
              sx={{
                ...getBackgroundColor(num),
                borderRadius: "50%",
                margin: "5px",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {num}
            </Box>
          ))}
      </Box>

      {/* Display all numbers in a table */}
      <NumbersTable
        numbers={numbers}
        redNumbers={redNumbers}
        blackNumbers={blackNumbers}
      />
    </Box>
  );
};

export default RouletteTable;
