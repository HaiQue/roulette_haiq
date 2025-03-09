import React from "react";
import { Box, Slider, Typography, FormControl, FormLabel } from "@mui/material";

const marks = [
  {
    value: 100,
    label: "100",
  },
  {
    value: 300,
    label: "300",
  },
  {
    value: 500,
    label: "500",
  },
];

function NumberRangeSlider({ value, onChange }) {
  const handleChange = (event, newValue) => {
    onChange(newValue);
  };

  return (
    <Box sx={{ width: "100%", mt: 4, mb: 2 }}>
      <FormControl fullWidth>
        <FormLabel component="legend" sx={{ mb: 2 }}>
          <Typography variant="h6" component="div">
            Number History Range
          </Typography>
        </FormLabel>
        <Slider
          value={value}
          onChange={handleChange}
          step={null}
          marks={marks}
          min={100}
          max={500}
          valueLabelDisplay="auto"
          aria-labelledby="number-range-slider"
        />
      </FormControl>
    </Box>
  );
}

export default NumberRangeSlider;
