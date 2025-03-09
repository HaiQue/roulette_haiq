import { calculateCurrentStreak } from "../utils/utils";
import axios from "axios";
import { useState, useEffect } from "react";

// Define the red and black numbers in European roulette
const redNumbers = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);
const blackNumbers = new Set([
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35,
]);
export const useRouletteData = () => {
  const [number, setNumber] = useState("");
  const [numbers, setNumbers] = useState([]);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [currentStreaks, setCurrentStreaks] = useState({
    red: 0,
    black: 0,
    first: 0,
    second: 0,
    third: 0,
    zero: 0,
  });

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Update streaks whenever numbers change
  useEffect(() => {
    if (numbers.length > 0) {
      const streaks = calculateCurrentStreak(numbers, redNumbers, blackNumbers);
      setCurrentStreaks(streaks);
    }
  }, [numbers]);
  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/data");
      if (response.data) {
        const fetchedNumbers = response.data.split(",").filter((n) => n !== "");
        setNumbers(fetchedNumbers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage("Error fetching data. Please try again.");
      setMessageType("error");
    }
  };

  const handleSubmit = async () => {
    if (!number) {
      setMessage("Please enter a number.");
      setMessageType("error");
      return;
    }

    const num = parseInt(number, 10);
    if (isNaN(num) || num < 0 || num > 36) {
      setMessage("Please enter a valid number between 0 and 36.");
      setMessageType("error");
      return;
    }

    try {
      await axios.post("http://localhost:5000/save-number", { number: num });
      setMessage("Number saved successfully!");
      setMessageType("success");
      setNumber("");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error saving number:", error);
      setMessage("Error saving number. Please try again.");
      setMessageType("error");
    }
  };

  const handleUndo = async () => {
    try {
      await axios.delete("http://localhost:5000/undo");
      setMessage("Last number removed successfully!");
      setMessageType("success");
      fetchData(); // Refresh data
    } catch (error) {
      console.error("Error undoing last number:", error);
      setMessage("Error undoing last number. Please try again.");
      setMessageType("error");
    }
  };

  return {
    number,
    setNumber,
    message,
    messageType,
    currentStreaks,
    numbers,
    handleSubmit,
    handleUndo,
  };
};
