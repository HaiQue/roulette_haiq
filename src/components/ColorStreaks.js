import React from "react";
import { Box, Typography, Paper, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

const StreakBox = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  backgroundColor: color,
  color: color === "green" ? "white" : color === "black" ? "white" : "black",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const ColorStreaks = ({ currentStreak }) => {
  // Check if currentStreak is still loading or undefined
  if (!currentStreak) {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom align="center">
          Color Streaks
        </Typography>
        <Typography align="center">Loading streaks data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" gutterBottom align="center">
        Color Streaks
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <StreakBox color="red">
            <Typography variant="h6">Red</Typography>
            <Typography variant="h4">
              {typeof currentStreak.red === "object"
                ? currentStreak.red.current
                : currentStreak.red}
            </Typography>
          </StreakBox>
        </Grid>
        <Grid item xs={4}>
          <StreakBox color="black">
            <Typography variant="h6">Black</Typography>
            <Typography variant="h4">
              {typeof currentStreak.black === "object"
                ? currentStreak.black.current
                : currentStreak.black}
            </Typography>
          </StreakBox>
        </Grid>
        <Grid item xs={4}>
          <StreakBox color="green">
            <Typography variant="h6">Green</Typography>
            <Typography variant="h4">
              {typeof currentStreak.green === "object"
                ? currentStreak.green.current
                : currentStreak.green}
            </Typography>
          </StreakBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ColorStreaks;
