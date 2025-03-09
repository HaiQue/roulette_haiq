import React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { Container, Box, Typography } from "@mui/material";
import RouletteView from "./views/RouletteView";
import "./App.css";

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <RouletteView />
        </Box>
      </Container>
    </div>
  );
}

export default App;
