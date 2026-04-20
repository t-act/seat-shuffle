# 席替えアプリ 実装計画

## Context
教室/会議室向けの席替えツールをゼロから作る。ブラウザ完結（バックエンドなし）で、行×列のグリッド上に席を配置し、名前をランダムに割り振る。固定席の指定や空席対応、PNG保存まで備えた「使える」最小構成を目指す。

## 確定した要件
- **フレームワーク**: TS + React + Vite、バックエンドなし
- **グリッド**: 行×列で指定。一部マスを「席なし」にできる（U字・島型レイアウトに対応）
- **名前入力**: テキスト一括入力 ＋ 1人ずつ編集の両対応
- **配置**: 基本ランダム。人単位で固定席を指定可能
- **席数 vs 人数**: 不一致でも実行可能。画面に警告を表示（席数≥人数なら空席、人数超過なら未配置者を別枠表示）
- **出力**: PNG保存
- **演出**: シャッフル時に簡易アニメーション（高速に名前が入れ替わり最終値で停止）
- **上部に「教卓/前」の帯**を常時表示
- **永続化**: なし（リロードで消える）

## 技術選定
| 用途 | 採用 | 理由 |
|---|---|---|
| ビルド | Vite (react-ts template) | 要件指定 |
| 状態管理 | `useState` + `useReducer` | 画面1枚規模、追加依存不要 |
| スタイル | 素のCSS (CSS Modules) | 依存を増やさない |
| PNG保存 | `html-to-image` | 小さく、DOM → PNG が1行 |
| ID生成 | `crypto.randomUUID()` | 標準API |

## ファイル構成
```
seating-change/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── docs/PLAN.md
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.module.css
    ├── lib/
    │   ├── types.ts
    │   └── shuffle.ts
    └── components/
        ├── GridEditor.tsx
        ├── NameInput.tsx
        └── SeatMap.tsx
```

## データモデル (`src/lib/types.ts`)
```ts
export type CellId = `${number}-${number}`; // "row-col"
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
```

## 配置ロジック (`src/lib/shuffle.ts`)
純粋関数 `assignSeats(grid, people, rng?): { assignment, unseated, warnings }`

1. enabled cells = 全マス - disabled
2. 固定席を先に配置。固定席が disabled / 重複なら warning に追加しランダム対象へ回す
3. 残りを Fisher–Yates でシャッフルし enabled cells の空きに順に配置
4. 溢れた人は `unseated` へ
5. 人数不一致は warning に含める

## 画面 (`src/App.tsx`)
タブ式 3 ステップ：
1. **配置**: 行×列スピナー、グリッドクリックで無効マス切替
2. **名前**: 一括 textarea ＋ 1人ずつ編集、固定席ドロップダウン
3. **実行**: シャッフル / PNG保存

## シャッフルアニメ
1.2 秒間、80ms 毎に各マスの表示名をプールからランダム入替え → 最終結果で停止。アニメ中は PNG 保存 disabled。

## 警告表示
- 固定席が無効マス / 重複
- 人数 > 席数（未配置者氏名）
- 人数 < 席数（空席数）

## 起動確認手順（検証）
1. `npm install`
2. `npm run dev`
3. 4×5 の配置・数マス無効化を確認
4. 10名貼付け、1人に固定席設定
5. シャッフル → 固定席が守られる、再シャッフルで他人の位置が変わる
6. PNG保存が動く
7. 人数超過/不足/固定席重複の警告
8. `npm run build` 成功

## 非対応
- 永続化、ドラッグ配置、印刷CSS、認証、共有
