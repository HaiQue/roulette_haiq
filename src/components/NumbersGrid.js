// src/components/NumbersGrid.js
import { Box } from "@mui/material";

const NumbersGrid = ({
  numbers,
  getNumberColor,
  columns = 10,
  maxHeight = "60vh",
}) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 44px)`,
      gap: 1,
      justifyContent: "flex-start",
      alignContent: "flex-start",
      maxHeight,
      overflowY: maxHeight === "none" ? "visible" : "auto",
      pr: 1,
    }}
  >
    {[...numbers].reverse().map((n, i) => (
      <Box
        key={`${n}-${i}`}
        sx={{
          backgroundColor: getNumberColor(n),
          width: 44,
          height: 36,
          borderRadius: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: 1,
        }}
      >
        {n}
      </Box>
    ))}
  </Box>
);

export default NumbersGrid;
