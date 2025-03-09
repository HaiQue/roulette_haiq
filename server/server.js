const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Path to data file
const dataFilePath = path.join(__dirname, "data", "data.txt");

// Ensure data file exists
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, "");
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Get all numbers
app.get("/data", (req, res) => {
  try {
    const data = fs.readFileSync(dataFilePath, "utf8");
    res.send(data);
  } catch (error) {
    console.error("Error reading data file:", error);
    res.status(500).send("Error reading data");
  }
});

// Save a new number
app.post("/save-number", (req, res) => {
  try {
    const { number } = req.body;
    if (number === undefined || number === null) {
      return res.status(400).send("Number is required");
    }

    let data = "";
    if (fs.existsSync(dataFilePath)) {
      data = fs.readFileSync(dataFilePath, "utf8");
    }

    // Append the new number
    if (data && data.trim() !== "") {
      data += `,${number}`;
    } else {
      data = `${number}`;
    }

    fs.writeFileSync(dataFilePath, data);
    res.send("Number saved successfully");
  } catch (error) {
    console.error("Error saving number:", error);
    res.status(500).send("Error saving number");
  }
});

// Undo last number
app.delete("/undo", (req, res) => {
  try {
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).send("Data file not found");
    }

    let data = fs.readFileSync(dataFilePath, "utf8");
    if (!data || data.trim() === "") {
      return res.status(400).send("No numbers to undo");
    }

    // Remove the last number
    const numbers = data.split(",");
    numbers.pop();
    data = numbers.join(",");

    fs.writeFileSync(dataFilePath, data);
    res.send("Last number removed successfully");
  } catch (error) {
    console.error("Error undoing last number:", error);
    res.status(500).send("Error undoing last number");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
