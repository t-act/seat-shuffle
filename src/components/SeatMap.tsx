import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { CellId, Grid, Person, cellId } from "../lib/types";
import { assignSeats } from "../lib/shuffle";
import styles from "./SeatMap.module.css";

type Props = {
  grid: Grid;
  people: Person[];
  shuffleNonce: number;
  onShuffle: () => void;
};

type Display = Map<CellId, string>;
type Result = ReturnType<typeof assignSeats>;

const ANIM_DURATION_MS = 1200;
const ANIM_TICK_MS = 80;

export function SeatMap({ grid, people, shuffleNonce, onShuffle }: Props) {
  const peopleById = useMemo(() => {
    const m = new Map<string, Person>();
    for (const p of people) m.set(p.id, p);
    return m;
  }, [people]);

  const [finalResult, setFinalResult] = useState<Result | null>(null);
  const [display, setDisplay] = useState<Display>(new Map());
  const [animating, setAnimating] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (shuffleNonce === 0) return;
    const result = assignSeats(grid, people);
    setFinalResult(result);

    const namePool = people.map((p) => p.name || "(名前なし)");
    if (namePool.length === 0) {
      setDisplay(toDisplay(result.assignment, peopleById));
      return;
    }

    setAnimating(true);
    const allCells = cellList(grid);
    const start = performance.now();

    const interval = setInterval(() => {
      const now = performance.now();
      if (now - start >= ANIM_DURATION_MS) {
        clearInterval(interval);
        setDisplay(toDisplay(result.assignment, peopleById));
        setAnimating(false);
        return;
      }
      const next: Display = new Map();
      for (const c of allCells) {
        const name = namePool[Math.floor(Math.random() * namePool.length)];
        next.set(c, name);
      }
      setDisplay(next);
    }, ANIM_TICK_MS);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shuffleNonce]);

  const savePng = async () => {
    if (!captureRef.current) return;
    try {
      const dataUrl = await toPng(captureRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
      });
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `seating-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("PNG保存に失敗しました");
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.actions}>
        <button
          type="button"
          className="primary"
          onClick={onShuffle}
          disabled={animating}
        >
          {animating ? "シャッフル中..." : "シャッフル"}
        </button>
        <button type="button" onClick={savePng} disabled={animating}>
          PNG保存
        </button>
      </div>

      {finalResult && finalResult.warnings.length > 0 && !animating && (
        <ul className={styles.warnings}>
          {finalResult.warnings.map((w, i) => (
            <li key={i}>{w}</li>
          ))}
        </ul>
      )}

      <div ref={captureRef} className={styles.capture}>
        <div className={styles.frontBar}>教卓 / 前</div>
        <div
          className={styles.grid}
          style={{ gridTemplateColumns: `repeat(${grid.cols}, 1fr)` }}
        >
          {Array.from({ length: grid.rows }).map((_, r) =>
            Array.from({ length: grid.cols }).map((_, c) => {
              const id = cellId(r, c);
              const disabled = grid.disabled.has(id);
              const name = display.get(id);
              return (
                <div
                  key={id}
                  className={`${styles.cell} ${disabled ? styles.disabled : ""} ${
                    !disabled && !name ? styles.empty : ""
                  }`}
                >
                  {disabled ? "" : name || "空席"}
                </div>
              );
            }),
          )}
        </div>
      </div>

      {!animating && finalResult && finalResult.unseated.length > 0 && (
        <div className={styles.unseated}>
          <h4>未配置 ({finalResult.unseated.length})</h4>
          <ul>
            {finalResult.unseated.map((p) => (
              <li key={p.id}>{p.name || "(名前なし)"}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function toDisplay(
  assignment: Map<CellId, string>,
  peopleById: Map<string, Person>,
): Display {
  const out: Display = new Map();
  for (const [cell, personId] of assignment) {
    const p = peopleById.get(personId);
    out.set(cell, p?.name || "(名前なし)");
  }
  return out;
}

function cellList(grid: Grid): CellId[] {
  const out: CellId[] = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      const id = cellId(r, c);
      if (!grid.disabled.has(id)) out.push(id);
    }
  }
  return out;
}
