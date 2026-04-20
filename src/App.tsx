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

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1>席替え</h1>
        <nav className={styles.tabs}>
          <TabButton active={tab === "grid"} onClick={() => setTab("grid")}>
            1. 配置
          </TabButton>
          <TabButton active={tab === "names"} onClick={() => setTab("names")}>
            2. 名前
          </TabButton>
          <TabButton active={tab === "run"} onClick={() => setTab("run")}>
            3. 実行
          </TabButton>
        </nav>
      </header>

      <main className={styles.main}>
        {tab === "grid" && <GridEditor grid={grid} onChange={setGrid} />}
        {tab === "names" && (
          <NameInput grid={grid} people={people} onChange={setPeople} />
        )}
        {tab === "run" && <SeatMap grid={grid} people={people} />}
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`${styles.tab} ${active ? styles.tabActive : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
