// src/views/RouletteView.js
import { useState } from "react";
import RouletteTable from "../components/RouletteTable";
import useRouletteData from "../hooks/useRouletteData"; // default export

export default function RouletteView() {
  const { numbers, pendingValue, setPendingValue, submitNumber, undo } =
    useRouletteData();

  const [historyRange, setHistoryRange] = useState(100);

  return (
    <RouletteTable
      numbers={numbers}
      historyRange={historyRange}
      onHistoryRangeChange={setHistoryRange}
      // wire the input
      pendingValue={pendingValue}
      onChangePending={setPendingValue}
      // submit uses the pendingValue
      onSubmit={() => submitNumber(pendingValue)}
      onUndo={undo}
    />
  );
}
