import {
  Assignment,
  CellId,
  Grid,
  Person,
  enabledCells,
} from "./types";

export type ShuffleResult = {
  assignment: Assignment;
  unseated: Person[];
  warnings: string[];
};

export function assignSeats(
  grid: Grid,
  people: Person[],
  rng: () => number = Math.random,
): ShuffleResult {
  const assignment: Assignment = new Map();
  const warnings: string[] = [];
  const seats = new Set(enabledCells(grid));

  const floating: Person[] = [];
  for (const p of people) {
    if (!p.fixedCell) {
      floating.push(p);
      continue;
    }
    if (!seats.has(p.fixedCell)) {
      warnings.push(
        `${p.name || "(名前なし)"} の固定席 ${p.fixedCell} は席なしマス、または別の人に既に割り当て済みです。ランダム配置に回します。`,
      );
      floating.push({ ...p, fixedCell: undefined });
      continue;
    }
    assignment.set(p.fixedCell, p.id);
    seats.delete(p.fixedCell);
  }

  const remaining = [...seats];
  shuffleInPlace(remaining, rng);

  const unseated: Person[] = [];
  for (const p of floating) {
    const cell = remaining.pop();
    if (!cell) {
      unseated.push(p);
      continue;
    }
    assignment.set(cell, p.id);
  }

  if (unseated.length > 0) {
    warnings.push(
      `席数が足りません。未配置: ${unseated
        .map((p) => p.name || "(名前なし)")
        .join(", ")}`,
    );
  }
  if (remaining.length > 0) {
    warnings.push(`空席が ${remaining.length} マスあります。`);
  }

  return { assignment, unseated, warnings };
}

function shuffleInPlace<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function assignableCells(
  grid: Grid,
  people: Person[],
  excludePersonId?: string,
): CellId[] {
  const used = new Set<CellId>();
  for (const p of people) {
    if (p.fixedCell && p.id !== excludePersonId) used.add(p.fixedCell);
  }
  return enabledCells(grid).filter((c) => !used.has(c));
}
