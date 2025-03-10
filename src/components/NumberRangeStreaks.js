import { Box, Typography, Paper, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";

const StreakBox = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  backgroundColor: color,
  color: color === "#006400" ? "white" : "black", // Dark green text needs white color
  fontWeight: "bold",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
}));

const NumberRangeStreaks = ({ currentStreak }) => {
  return (
    <Box sx={{ flexGrow: 1, mb: 3, textAlign: "center" }}>
      <Typography variant="h6" gutterBottom align="center">
        Number Range Streaks
      </Typography>
      <Grid
        container
        spacing={2}
        justifyContent="center"
        sx={{ maxWidth: "1000px", margin: "0 auto" }}
      >
        <Grid item xs={6} sm={3} md={2.5}>
          <StreakBox color="#FFD700">
            {" "}
            {/* Gold color for first dozen */}
            <Typography variant="subtitle1">First (1-12)</Typography>
            <Typography variant="h4">{currentStreak.first}</Typography>
          </StreakBox>
        </Grid>
        <Grid item xs={6} sm={3} md={2.5}>
          <StreakBox color="#87CEEB">
            {" "}
            {/* Sky Blue for second dozen */}
            <Typography variant="subtitle1">Second (13-24)</Typography>
            <Typography variant="h4">{currentStreak.second}</Typography>
          </StreakBox>
        </Grid>
        <Grid item xs={6} sm={3} md={2.5}>
          <StreakBox color="#006400">
            {" "}
            {/* Dark Green for third dozen */}
            <Typography variant="subtitle1">Third (25-36)</Typography>
            <Typography variant="h4">{currentStreak.third}</Typography>
          </StreakBox>
        </Grid>
        <Grid item xs={6} sm={3} md={2.5}>
          <StreakBox color="#32CD32">
            {" "}
            {/* Lime Green for zero */}
            <Typography variant="subtitle1">Zero (0)</Typography>
            <Typography variant="h4">{currentStreak.zero}</Typography>
          </StreakBox>
        </Grid>
      </Grid>
    </Box>
  );
};

export default NumberRangeStreaks;
