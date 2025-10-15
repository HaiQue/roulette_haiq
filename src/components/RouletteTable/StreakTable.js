// src/components/RouletteTable/StreakTable.js
import {
  Card,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { fmtPct } from "../../lib/streaks";

const StreakTable = ({
  title,
  rowsObj, // object {len: {nextWin, nextLoss, total}}
  flipColumnFirst = false, // true => show Loss, Win, Switch; false => Win, Loss, Switch
  highlightLen = null,
  highlightPick = null, // 'win' | 'loss' — which cell to emphasize in highlighted row
}) => {
  const lengths = Object.keys(rowsObj)
    .map((k) => parseInt(k, 10))
    .sort((a, b) => a - b);

  return (
    <Card elevation={2}>
      <CardHeader
        title={title}
        sx={{ py: 1.25, borderBottom: "1px solid", borderColor: "divider" }}
      />
      <CardContent sx={{ pt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Streak</TableCell>
              {flipColumnFirst ? (
                <>
                  <TableCell align="right">Next is Loss %</TableCell>
                  <TableCell align="right">Next is Win %</TableCell>
                  <TableCell align="right">Switch %</TableCell>
                </>
              ) : (
                <>
                  <TableCell align="right">Next is Win %</TableCell>
                  <TableCell align="right">Next is Loss %</TableCell>
                  <TableCell align="right">Switch %</TableCell>
                </>
              )}
              <TableCell align="right">Samples</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lengths.map((len) => {
              const { nextWin, nextLoss, total } = rowsObj[len];
              const winp = fmtPct(nextWin, total);
              const lossp = fmtPct(nextLoss, total);
              const switchp = flipColumnFirst ? winp : lossp;

              const isHL = highlightLen === len;
              const hlRowSx = isHL
                ? {
                    backgroundColor: "action.hover",
                    borderLeft: "3px solid #1976d2",
                  }
                : undefined;

              const emphasizeWin =
                isHL &&
                highlightPick === "win" &&
                total > 0 &&
                nextWin >= nextLoss;
              const emphasizeLoss =
                isHL &&
                highlightPick === "loss" &&
                total > 0 &&
                nextLoss > nextWin;

              const winCellSx = emphasizeWin
                ? { fontWeight: 700, bgcolor: "rgba(76,175,80,0.18)" }
                : undefined;
              const lossCellSx = emphasizeLoss
                ? { fontWeight: 700, bgcolor: "rgba(244,67,54,0.18)" }
                : undefined;

              return (
                <TableRow key={len} sx={hlRowSx}>
                  <TableCell>{len}</TableCell>
                  {flipColumnFirst ? (
                    <>
                      <TableCell align="right" sx={lossCellSx}>
                        {lossp}
                      </TableCell>
                      <TableCell align="right" sx={winCellSx}>
                        {winp}
                      </TableCell>
                      <TableCell align="right">{switchp}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell align="right" sx={winCellSx}>
                        {winp}
                      </TableCell>
                      <TableCell align="right" sx={lossCellSx}>
                        {lossp}
                      </TableCell>
                      <TableCell align="right">{switchp}</TableCell>
                    </>
                  )}
                  <TableCell align="right">{total}</TableCell>
                </TableRow>
              );
            })}
            {lengths.length === 0 && (
              <TableRow>
                <TableCell colSpan={5}>
                  Not enough data in this range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default StreakTable;
