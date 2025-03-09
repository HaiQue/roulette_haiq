import { useState } from "react";
import { TextField, Button, Box, Grid } from "@mui/material";

function NumberInput({ value, onChange, onSubmit, onUndo }) {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input for clearing
    if (inputValue === "") {
      onChange("");
      setError("");
      return;
    }

    // Check if input is a valid number between 0 and 36
    const num = parseInt(inputValue, 10);
    if (isNaN(num) || num < 0 || num > 36) {
      setError("Please enter a number between 0 and 36");
      return;
    }

    setError("");
    onChange(num.toString());
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (value === "" || error) {
      return;
    }

    onSubmit();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Enter number (0-36)"
            variant="outlined"
            value={value}
            onChange={handleChange}
            error={!!error}
            helperText={error}
            type="number"
            InputProps={{
              inputProps: { min: 0, max: 36 },
            }}
          />
        </Grid>
        <Grid item xs={6} sm={2}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            type="submit"
            disabled={!value || !!error}
          >
            Submit
          </Button>
        </Grid>
        <Grid item xs={6} sm={2}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={onUndo}
          >
            Undo
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NumberInput;
