import { CellId, Grid, cellId } from "../lib/types";
import styles from "./GridEditor.module.css";

type Props = {
  grid: Grid;
  onChange: (grid: Grid) => void;
};

export function GridEditor({ grid, onChange }: Props) {
  const setRows = (rows: number) => {
    const safe = clamp(rows, 1, 20);
    onChange({ ...grid, rows: safe, disabled: pruneDisabled(grid.disabled, safe, grid.cols) });
  };
  const setCols = (cols: number) => {
    const safe = clamp(cols, 1, 20);
    onChange({ ...grid, cols: safe, disabled: pruneDisabled(grid.disabled, grid.rows, safe) });
  };
  const toggleCell = (id: CellId) => {
    const next = new Set(grid.disabled);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange({ ...grid, disabled: next });
  };

  const enabledCount =
    grid.rows * grid.cols - grid.disabled.size;

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <label>
          行
          <input
            type="number"
            min={1}
            max={20}
            value={grid.rows}
            onChange={(e) => setRows(Number(e.target.value))}
          />
        </label>
        <label>
          列
          <input
            type="number"
            min={1}
            max={20}
            value={grid.cols}
            onChange={(e) => setCols(Number(e.target.value))}
          />
        </label>
        <span className={styles.count}>有効席数: {enabledCount}</span>
      </div>
      <p className={styles.hint}>
        マスをクリックすると「席あり ⇄ 席なし」を切り替えできます。
      </p>
      <div className={styles.frontBar}>教卓 / 前</div>
      <div
        className={styles.grid}
        style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}
      >
        {Array.from({ length: grid.rows }).map((_, r) =>
          Array.from({ length: grid.cols }).map((_, c) => {
            const id = cellId(r, c);
            const disabled = grid.disabled.has(id);
            return (
              <button
                key={id}
                type="button"
                className={`${styles.cell} ${disabled ? styles.disabled : ""}`}
                onClick={() => toggleCell(id)}
                aria-pressed={!disabled}
              >
                {disabled ? "" : `${r + 1}-${c + 1}`}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

function clamp(n: number, min: number, max: number): number {
  if (Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function pruneDisabled(
  disabled: Set<CellId>,
  rows: number,
  cols: number,
): Set<CellId> {
  const next = new Set<CellId>();
  for (const id of disabled) {
    const [r, c] = id.split("-").map(Number);
    if (r < rows && c < cols) next.add(id);
  }
  return next;
}
