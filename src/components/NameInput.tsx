import { useState } from "react";
import { CellId, Grid, Person, parseCellId } from "../lib/types";
import { assignableCells } from "../lib/shuffle";
import styles from "./NameInput.module.css";

type Props = {
  grid: Grid;
  people: Person[];
  onChange: (people: Person[]) => void;
  onExecute?: () => void;
};

export function NameInput({ grid, people, onChange, onExecute }: Props) {
  const [bulk, setBulk] = useState("");

  const applyBulk = () => {
    const names = bulk
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (names.length === 0) return;
    const next: Person[] = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
    }));
    onChange(next);
    setBulk("");
  };

  const appendBulk = () => {
    const names = bulk
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (names.length === 0) return;
    const added: Person[] = names.map((name) => ({
      id: crypto.randomUUID(),
      name,
    }));
    onChange([...people, ...added]);
    setBulk("");
  };

  const updatePerson = (id: string, patch: Partial<Person>) => {
    onChange(people.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const removePerson = (id: string) => {
    onChange(people.filter((p) => p.id !== id));
  };
  const addEmpty = () => {
    onChange([...people, { id: crypto.randomUUID(), name: "" }]);
  };

  const cellLabel = (id: CellId) => {
    const { row, col } = parseCellId(id);
    return `${row + 1}行${col + 1}列`;
  };

  return (
    <div className={styles.wrap}>
      <section className={styles.bulk}>
        <h3>一括入力</h3>
        <p className={styles.hint}>改行区切りで貼り付けてください。</p>
        <textarea
          rows={6}
          value={bulk}
          onChange={(e) => setBulk(e.target.value)}
          placeholder={"山田 太郎\n田中 花子\n..."}
        />
        <div className={styles.bulkButtons}>
          <button type="button" onClick={applyBulk}>
            置き換えで反映
          </button>
          <button type="button" onClick={appendBulk}>
            末尾に追加
          </button>
        </div>
      </section>

      <section>
        <div className={styles.listHeader}>
          <h3>メンバー ({people.length})</h3>
          <button type="button" onClick={addEmpty}>
            + 1人追加
          </button>
        </div>
        {people.length === 0 && (
          <p className={styles.empty}>メンバーが未登録です。</p>
        )}
        <ul className={styles.list}>
          {people.map((p) => {
            const options = assignableCells(grid, people, p.id);
            return (
              <li key={p.id} className={styles.row}>
                <input
                  type="text"
                  value={p.name}
                  onChange={(e) =>
                    updatePerson(p.id, { name: e.target.value })
                  }
                  placeholder="名前"
                  className={styles.nameInput}
                />
                <select
                  value={p.fixedCell ?? ""}
                  onChange={(e) =>
                    updatePerson(p.id, {
                      fixedCell: e.target.value === ""
                        ? undefined
                        : (e.target.value as CellId),
                    })
                  }
                >
                  <option value="">固定席なし</option>
                  {options.map((c) => (
                    <option key={c} value={c}>
                      {cellLabel(c)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removePerson(p.id)}
                  aria-label="削除"
                >
                  ×
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {onExecute && (
        <div className={styles.execute}>
          <button
            type="button"
            className="primary"
            onClick={onExecute}
            disabled={people.length === 0}
          >
            実行
          </button>
        </div>
      )}
    </div>
  );
}
