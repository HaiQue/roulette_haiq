// src/hooks/useRouletteData.js
import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000";

// Parse "csv or spaced" text -> number[]
function parseList(text) {
  return String(text || "")
    .split(/[,\s]+/)
    .map((v) => parseInt(v, 10))
    .filter((n) => Number.isFinite(n) && n >= 0 && n <= 36);
}

export default function useRouletteData() {
  const [numbers, setNumbers] = useState([]);
  const [pendingValue, setPendingValue] = useState(""); // the input box text

  // Load once on mount
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- API ---
  const reload = async () => {
    try {
      const res = await axios.get(`${API}/data`, { responseType: "text" });
      setNumbers(parseList(res.data));
    } catch (err) {
      console.error("GET /data failed:", err);
    }
  };

  // Submit number (uses pendingValue by default)
  const submitNumber = async (value) => {
    const raw = value ?? pendingValue;
    const num = parseInt(raw, 10);
    if (!Number.isFinite(num) || num < 0 || num > 36) return;

    // optimistic update
    setNumbers((prev) => [...prev, num]);
    try {
      await axios.post(`${API}/save-number`, { number: num });
      setPendingValue(""); // clear input after success
    } catch (err) {
      console.error("POST /save-number failed:", err);
      // roll back if needed by reloading truth
      reload();
    }
  };

  // Undo last
  const undo = async () => {
    if (!numbers.length) return;

    // optimistic update
    setNumbers((prev) => prev.slice(0, -1));
    try {
      await axios.delete(`${API}/undo`);
    } catch (err) {
      console.error("DELETE /undo failed:", err);
      reload();
    }
  };

  return {
    numbers,
    pendingValue,
    setPendingValue,
    submitNumber,
    undo,
    reload,
  };
}
