import React, { useState } from "react";
import { useRouletteData } from "../hooks/useRouletteData";
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import NumberRangeStreaks from "../components/NumberRangeStreaks";
import NumberInput from "../components/NumberInput";
import Message from "../components/Message";
import RouletteTable from "../components/RouletteTable";

function RouletteView() {
  const {
    number,
    setNumber,
    message,
    messageType,
    currentStreaks,
    numbers,
    handleSubmit,
    handleUndo,
  } = useRouletteData();

  // Add state for history range
  const [historyRange, setHistoryRange] = useState(100);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <NumberInput
          value={number}
          onChange={setNumber}
          onSubmit={handleSubmit}
          onUndo={handleUndo}
        />

        {message && <Message message={message} type={messageType} />}
        <NumberRangeStreaks currentStreak={currentStreaks} />

        {/* Add history range selector */}
        {/* <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}> */}
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="history-range-label">History Range</InputLabel>
          <Select
            labelId="history-range-label"
            id="history-range"
            value={historyRange}
            onChange={(e) => setHistoryRange(e.target.value)}
            label="History Range"
          >
            <MenuItem value={10}>Last 10</MenuItem>
            <MenuItem value={20}>Last 20</MenuItem>
            <MenuItem value={50}>Last 50</MenuItem>
            <MenuItem value={100}>Last 100</MenuItem>
            <MenuItem value={200}>Last 200</MenuItem>
            <MenuItem value={500}>Last 500</MenuItem>
          </Select>
        </FormControl>
        {/* </Box> */}

        <Box sx={{ mt: 4 }}>
          <RouletteTable numbers={numbers} historyRange={historyRange} />
        </Box>
      </Box>
    </Container>
  );
}

export default RouletteView;
