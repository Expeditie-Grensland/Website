import { EOL } from "os";

export const mdHeading = (level: number, text: string) =>
  `${"#".repeat(level)} ${text}${EOL}`;

const mdTableRow = (
  cells: string[],
  columns: { align: "l" | "r"; width: number }[]
) => {
  const paddedCells = cells.map((cell, i) =>
    columns[i].align == "l"
      ? cell.padEnd(columns[i].width)
      : cell.padStart(columns[i].width)
  );

  return `| ${paddedCells.join(" | ")} |`;
};

export const mdTable = (
  headers: {
    label: string;
    align: "l" | "r";
  }[],
  rows: string[][]
) => {
  const columns = headers.map((col, idx) => ({
    ...col,
    width: rows.reduce(
      (maxWidth, row) => Math.max(maxWidth, row[idx].length),
      Math.max(col.label.length, 4)
    ),
  }));

  const headerRow = columns.map((col) => col.label);
  const alignRow = columns.map((col) =>
    col.align == "l"
      ? `:${"-".repeat(col.width - 1)}`
      : `${"-".repeat(col.width - 1)}:`
  );

  return (
    [headerRow, alignRow, ...rows]
      .map((row) => mdTableRow(row, columns))
      .join(EOL) + EOL
  );
};
