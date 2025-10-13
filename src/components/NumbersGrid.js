import { Box } from "@mui/material";

const NumbersGrid = ({
  numbers,
  getNumberColor,
  columns = 10,
  maxHeight = "52vh",
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
          borderRadius: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        {n}
      </Box>
    ))}
  </Box>
);

export default NumbersGrid;
