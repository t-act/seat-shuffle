export type CellId = `${number}-${number}`;

export type Grid = {
  rows: number;
  cols: number;
  disabled: Set<CellId>;
};

export type Person = {
  id: string;
  name: string;
  fixedCell?: CellId;
};

export type Assignment = Map<CellId, string>;

export const cellId = (row: number, col: number): CellId => `${row}-${col}`;

export const parseCellId = (id: CellId): { row: number; col: number } => {
  const [r, c] = id.split("-").map(Number);
  return { row: r, col: c };
};

export const enabledCells = (grid: Grid): CellId[] => {
  const out: CellId[] = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const id = cellId(r, c);
      if (!grid.disabled.has(id)) out.push(id);
    }
  }
  return out;
};
