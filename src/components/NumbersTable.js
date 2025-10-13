import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";

const NumbersTable = ({ numbers, redNumbers, blackNumbers }) => {
  // Function to determine the color of a number
  const getNumberColor = (num) => {
    const number = parseInt(num, 10);
    if (redNumbers.has(number)) return "red";
    if (blackNumbers.has(number)) return "black";
    return "green"; // For zero
  };

  // Create rows for the table
  const rows = numbers
    .map((num, index) => ({
      position: index + 1,
      number: num,
      color: getNumberColor(num),
    }))
    .reverse(); // Reverse to show newest first

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Position</TableCell>
            <TableCell>Number</TableCell>
            <TableCell>Color</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.position}>
              <TableCell>{row.position}</TableCell>
              <TableCell>{row.number}</TableCell>
              <TableCell>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: row.color,
                    margin: "0 auto",
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NumbersTable;
