"use client";

/**
 * Renders text as retro pixel-block glyphs (5x7 bitmap font) to match the
 * playground hero aesthetic. Purely decorative; the real text is exposed to
 * screen readers via an aria-label on the wrapper.
 */

const GLYPHS: Record<string, string[]> = {
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  " ": ["00", "00", "00", "00", "00", "00", "00"],
};

const ROWS = 7;
const GAP_COLUMN = "0";

type PixelCell = {
  id: string;
  on: boolean;
  variance: number;
};

function buildCells(word: string): { cells: PixelCell[]; columns: number } {
  const rows: string[] = Array.from({ length: ROWS }, () => "");
  const chars = word.toUpperCase().split("");

  chars.forEach((char, index) => {
    const glyph = GLYPHS[char] ?? GLYPHS[" "];
    for (let r = 0; r < ROWS; r++) {
      rows[r] += glyph[r];
      if (index < chars.length - 1) {
        rows[r] += GAP_COLUMN;
      }
    }
  });

  const columns = rows[0]?.length ?? 0;
  const cells: PixelCell[] = [];
  for (let r = 0; r < ROWS; r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      cells.push({
        id: `${r}:${c}`,
        on: row[c] === "1",
        // Subtle dither so strokes read like the reference pixel art.
        variance: ((r + c) % 3) * 0.08,
      });
    }
  }

  return { cells, columns };
}

export function PixelText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const { cells, columns } = buildCells(text);

  return (
    <div
      aria-label={text}
      className={className}
      role="img"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, var(--pixel-size))`,
        gridTemplateRows: `repeat(${ROWS}, var(--pixel-size))`,
        gap: "var(--pixel-gap)",
      }}
    >
      {cells.map((cell) => (
        <div
          key={cell.id}
          style={{
            backgroundColor: cell.on
              ? `rgba(228, 228, 231, ${0.72 + cell.variance})`
              : "transparent",
            boxShadow: cell.on
              ? "inset 0 0 0 0.5px rgba(255,255,255,0.06)"
              : undefined,
          }}
        />
      ))}
    </div>
  );
}
