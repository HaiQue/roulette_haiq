import React from "react";
import { Alert, Snackbar } from "@mui/material";

function Message({ message, type, onClose }) {
  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert onClose={onClose} severity={type || "info"} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}

export default Message;
