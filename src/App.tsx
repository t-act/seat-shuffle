import { useState } from "react";
import { GridEditor } from "./components/GridEditor";
import { NameInput } from "./components/NameInput";
import { SeatMap } from "./components/SeatMap";
import { Grid, Person } from "./lib/types";
import styles from "./App.module.css";

type Tab = "grid" | "names" | "run";

const initialGrid: Grid = {
  rows: 4,
  cols: 5,
  disabled: new Set(),
};

export default function App() {
  const [tab, setTab] = useState<Tab>("grid");
  const [grid, setGrid] = useState<Grid>(initialGrid);
  const [people, setPeople] = useState<Person[]>([]);
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const hasShuffled = shuffleNonce > 0;

  const runInitialShuffle = () => {
    setShuffleNonce((n) => n + 1);
    setTab("run");
  };

  const triggerShuffle = () => {
    setShuffleNonce((n) => n + 1);
  };

  const visibleTabs: { id: Tab; label: string }[] = [
    { id: "grid", label: "配置" },
    { id: "names", label: "名前" },
    ...(hasShuffled ? [{ id: "run" as Tab, label: "実行" }] : []),
  ];

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>席替え</h1>
        <nav className={styles.tabs} aria-label="工程">
          {visibleTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className={styles.main}>
        <div className={tab === "grid" ? styles.pane : styles.paneHidden}>
          <GridEditor grid={grid} onChange={setGrid} />
        </div>
        <div className={tab === "names" ? styles.pane : styles.paneHidden}>
          <NameInput
            grid={grid}
            people={people}
            onChange={setPeople}
            onExecute={!hasShuffled ? runInitialShuffle : undefined}
          />
        </div>
        {hasShuffled && (
          <div className={tab === "run" ? styles.pane : styles.paneHidden}>
            <SeatMap
              grid={grid}
              people={people}
              shuffleNonce={shuffleNonce}
              onShuffle={triggerShuffle}
            />
          </div>
        )}
      </main>
    </div>
  );
}
