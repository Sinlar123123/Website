"use client";

import { motion, type Transition } from "framer-motion";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const SIZE = 8;
const STORAGE_BEST = "portfolio-2048-best";

/** Три ключевых кадра scale несовместимы с spring в Motion — только tween: https://motion.dev/troubleshooting/spring-two-frames */
const MERGE_POP_TRANSITION = {
  scale: {
    type: "tween" as const,
    duration: 0.34,
    times: [0, 0.36, 1],
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  },
} satisfies Transition;

/** Позицию плиток анимируем через CSS (left/top), не через Framer: иначе Motion сводит движение к transform и все плитки оказываются в одной точке. */
const TILE_SLIDE_CSS =
  "left 0.15s cubic-bezier(0.25, 0.82, 0.35, 1), top 0.15s cubic-bezier(0.25, 0.82, 0.35, 1), width 0.15s ease-out, height 0.15s ease-out";

type Tile = { id: string; value: number };
type TileGrid = (Tile | null)[][];

function newTileId(): string {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `t-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyGrid(): TileGrid {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

function cloneGrid(g: TileGrid): TileGrid {
  return g.map((row) => [...row]);
}

function mergeLineTiles(line: (Tile | null)[]): { next: (Tile | null)[]; scoreAdd: number; changed: boolean } {
  const tiles = line.filter((t): t is Tile => t !== null);
  const merged: Tile[] = [];
  let scoreAdd = 0;
  let i = 0;
  while (i < tiles.length) {
    if (i + 1 < tiles.length && tiles[i].value === tiles[i + 1].value) {
      const v = tiles[i].value * 2;
      merged.push({ id: tiles[i].id, value: v });
      scoreAdd += v;
      i += 2;
    } else {
      merged.push({ id: tiles[i].id, value: tiles[i].value });
      i += 1;
    }
  }
  const next: (Tile | null)[] = [...merged];
  while (next.length < SIZE) next.push(null);
  const trimmed = next.slice(0, SIZE);
  const changed = trimmed.some((t, idx) => {
    const a = line[idx];
    const b = trimmed[idx];
    if (a === null && b === null) return false;
    if (a === null || b === null) return true;
    return a.id !== b.id || a.value !== b.value;
  });
  return { next: trimmed, scoreAdd, changed };
}

function moveLeft(grid: TileGrid): { grid: TileGrid; moved: boolean; scoreAdd: number } {
  let moved = false;
  let scoreAdd = 0;
  const next = cloneGrid(grid);
  for (let r = 0; r < SIZE; r++) {
    const { next: row, scoreAdd: s, changed } = mergeLineTiles(next[r]);
    if (changed) moved = true;
    scoreAdd += s;
    next[r] = row;
  }
  return { grid: next, moved, scoreAdd };
}

function transpose(g: TileGrid): TileGrid {
  return Array.from({ length: SIZE }, (_, i) =>
    Array.from({ length: SIZE }, (_, j) => g[j][i]),
  );
}

function reverseRows(g: TileGrid): TileGrid {
  return g.map((row) => [...row].reverse());
}

function move(grid: TileGrid, dir: "up" | "down" | "left" | "right"): { grid: TileGrid; moved: boolean; scoreAdd: number } {
  let g = grid;
  if (dir === "left") return moveLeft(g);
  if (dir === "right") {
    g = reverseRows(g);
    const r = moveLeft(g);
    return { grid: reverseRows(r.grid), moved: r.moved, scoreAdd: r.scoreAdd };
  }
  if (dir === "up") {
    g = transpose(g);
    const r = moveLeft(g);
    return { grid: transpose(r.grid), moved: r.moved, scoreAdd: r.scoreAdd };
  }
  g = transpose(g);
  g = reverseRows(g);
  const r = moveLeft(g);
  return { grid: transpose(reverseRows(r.grid)), moved: r.moved, scoreAdd: r.scoreAdd };
}

function addRandomTile(grid: TileGrid): TileGrid {
  const empty: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (grid[r][c] === null) empty.push([r, c]);
    }
  }
  if (empty.length === 0) return grid;
  const pick = empty[Math.floor(Math.random() * empty.length)];
  const next = cloneGrid(grid);
  next[pick[0]][pick[1]] = { id: newTileId(), value: Math.random() < 0.9 ? 2 : 4 };
  return next;
}

function gridToNumbers(g: TileGrid): number[][] {
  return g.map((row) => row.map((t) => t?.value ?? 0));
}

/** Numeric move for canMove only — ids dummy */
function moveNumGrid(grid: number[][], dir: "up" | "down" | "left" | "right"): { moved: boolean } {
  const asTiles: TileGrid = grid.map((row) =>
    row.map((v) => (v === 0 ? null : { id: "_", value: v })),
  );
  return { moved: move(asTiles, dir).moved };
}

function canMove(grid: TileGrid): boolean {
  const nums = gridToNumbers(grid);
  for (const dir of ["up", "down", "left", "right"] as const) {
    if (moveNumGrid(nums, dir).moved) return true;
  }
  return false;
}

function startGrid(): TileGrid {
  let g = emptyGrid();
  g = addRandomTile(g);
  g = addRandomTile(g);
  return g;
}

function tileClasses(value: number): string {
  const step = Math.min(14, Math.max(0, Math.round(Math.log2(value)) - 1));
  const palette = [
    "bg-slate-600/90 text-white",
    "bg-slate-500/95 text-white",
    "bg-indigo-600/90 text-white",
    "bg-violet-600/90 text-white",
    "bg-fuchsia-600/85 text-white",
    "bg-purple-600/85 text-white",
    "bg-rose-600/85 text-white",
    "bg-orange-600/90 text-white",
    "bg-amber-500/90 text-slate-900",
    "bg-yellow-400/95 text-slate-900",
    "bg-lime-400/90 text-slate-900",
    "bg-emerald-500/85 text-white",
    "bg-cyan-500/85 text-white",
    "bg-sky-500/85 text-white",
    "bg-blue-600/90 text-white",
  ];
  return `${palette[step]} shadow-[inset_0_-4px_0_rgba(0,0,0,0.15)]`;
}

function tileValueAtId(g: TileGrid | null, id: string): number | undefined {
  if (!g) return undefined;
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = g[r][c];
      if (t?.id === id) return t.value;
    }
  }
  return undefined;
}

function collectTiles(grid: TileGrid): { tile: Tile; r: number; c: number }[] {
  const out: { tile: Tile; r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const t = grid[r][c];
      if (t) out.push({ tile: t, r, c });
    }
  }
  return out;
}

function boardGapPx(): number {
  if (typeof window === "undefined") return 4;
  return window.matchMedia("(min-width: 640px)").matches ? 6 : 4;
}

export default function Game2048() {
  const [grid, setGrid] = useState<TileGrid>(() => startGrid());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const prevGridRef = useRef<TileGrid | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [boardLayout, setBoardLayout] = useState({ cell: 0, gap: 4 });

  useLayoutEffect(() => {
    prevGridRef.current = grid;
  }, [grid]);

  useLayoutEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      const gap = boardGapPx();
      const cell = w > 0 ? (w - gap * (SIZE - 1)) / SIZE : 0;
      setBoardLayout({ cell, gap });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mq = window.matchMedia("(min-width: 640px)");
    const onMq = () => measure();
    mq.addEventListener("change", onMq);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", onMq);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_BEST);
      if (raw) setBest(parseInt(raw, 10) || 0);
    } catch {
      /* ignore */
    }
  }, []);

  const applyMove = useCallback((dir: "up" | "down" | "left" | "right") => {
    setGrid((prev) => {
      const { grid: next, moved, scoreAdd } = move(prev, dir);
      if (!moved) return prev;
      setScore((s) => {
        const ns = s + scoreAdd;
        setBest((b) => {
          const nb = Math.max(b, ns);
          try {
            localStorage.setItem(STORAGE_BEST, String(nb));
          } catch {
            /* ignore */
          }
          return nb;
        });
        return ns;
      });
      const withTile = addRandomTile(next);
      if (!canMove(withTile)) setGameOver(true);
      return withTile;
    });
  }, []);

  const newGame = useCallback(() => {
    setGrid(startGrid());
    setScore(0);
    setGameOver(false);
    prevGridRef.current = null;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (gameOver) return;
      const key = e.key;
      if (key === "ArrowUp" || key === "w" || key === "W") {
        e.preventDefault();
        applyMove("up");
      } else if (key === "ArrowDown" || key === "s" || key === "S") {
        e.preventDefault();
        applyMove("down");
      } else if (key === "ArrowLeft" || key === "a" || key === "A") {
        e.preventDefault();
        applyMove("left");
      } else if (key === "ArrowRight" || key === "d" || key === "D") {
        e.preventDefault();
        applyMove("right");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [applyMove, gameOver]);

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchRef.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (gameOver) return;
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const min = 24;
    if (absX < min && absY < min) return;
    if (absX >= absY) {
      applyMove(dx > 0 ? "right" : "left");
    } else {
      applyMove(dy > 0 ? "down" : "up");
    }
  };

  const prevGrid = prevGridRef.current;
  const placed = collectTiles(grid);
  const { cell, gap } = boardLayout;
  const boardReady = cell > 0;

  return (
    <div className="mx-auto w-full max-w-[min(100%,520px)]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <div className="rounded-xl bg-white/[0.07] px-3 py-2 text-center min-w-[4.5rem]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Счёт</div>
            <div className="text-lg font-bold tabular-nums text-white">{score}</div>
          </div>
          <div className="rounded-xl bg-violet-500/15 border border-violet-500/25 px-3 py-2 text-center min-w-[4.5rem]">
            <div className="text-[10px] font-mono uppercase tracking-wider text-violet-300/80">Рекорд</div>
            <div className="text-lg font-bold tabular-nums text-violet-200">{best}</div>
          </div>
        </div>
        <button
          type="button"
          onClick={newGame}
          className="rounded-xl border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.1] hover:border-violet-500/30"
        >
          Новая игра
        </button>
      </div>

      <p className="text-xs text-slate-500 mb-3">
        Поле 8×8, можно играть после 2048. Стрелки или WASD, на телефоне — свайпы.
      </p>

      <div
        className="rounded-2xl border border-white/[0.08] bg-[#12121c] p-2 sm:p-3 touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div ref={boardRef} className="relative w-full aspect-square">
          {/* Фоновые ячейки — только сетка. Плитки отдельным слоем в px, анимация left/top без layout на grid. */}
          <div
            className="grid gap-1 sm:gap-1.5 w-full h-full"
            style={{
              gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${SIZE}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: SIZE * SIZE }).map((_, i) => (
              <div
                key={`slot-${i}`}
                className="min-h-0 min-w-0 rounded-md sm:rounded-lg bg-white/[0.06] aspect-square"
              />
            ))}
          </div>

          <div className="pointer-events-none absolute inset-0">
            {boardReady &&
              placed.map(({ tile, r, c }) => {
                const left = Math.round(c * (cell + gap));
                const top = Math.round(r * (cell + gap));
                const w = Math.round(cell);
                const h = Math.round(cell);
                const was = tileValueAtId(prevGrid, tile.id);
                const mergedPop = was !== undefined && was * 2 === tile.value;
                const fontPx = Math.max(10, Math.min(20, cell * 0.38));
                return (
                  <div
                    key={tile.id}
                    className="absolute z-10"
                    style={{
                      left,
                      top,
                      width: w,
                      height: h,
                      boxSizing: "border-box",
                      transition: TILE_SLIDE_CSS,
                    }}
                  >
                    {/* Не используем initial={{ scale: 0.2 }} для новых плиток: при следующем рендере initial становится false и Framer оставляет scale < 1. Поп появления — только merge. */}
                    <motion.div
                      className={`flex h-full w-full items-center justify-center rounded-md sm:rounded-lg font-bold tabular-nums ${tileClasses(tile.value)}`}
                      initial={false}
                      animate={{
                        scale: mergedPop ? [1, 1.14, 1] : 1,
                      }}
                      transition={mergedPop ? MERGE_POP_TRANSITION : { scale: { duration: 0 } }}
                      style={{
                        transformOrigin: "center",
                        fontSize: fontPx,
                      }}
                    >
                      {tile.value}
                    </motion.div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {gameOver && (
        <div className="mt-5 rounded-2xl border border-rose-500/25 bg-rose-500/[0.08] px-4 py-4 text-center">
          <p className="font-semibold text-rose-200">Нет ходов — конец игры</p>
          <button
            type="button"
            onClick={newGame}
            className="mt-3 rounded-xl bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-500 transition"
          >
            Сыграть ещё раз
          </button>
        </div>
      )}
    </div>
  );
}
