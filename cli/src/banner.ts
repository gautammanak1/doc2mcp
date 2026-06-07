import pc from "picocolors";

const LOGO = [
  "██████╗  ██████╗  ██████╗██████╗ ███╗   ███╗ ██████╗██████╗ ",
  "██╔══██╗██╔═══██╗██╔════╝╚════██╗████╗ ████║██╔════╝██╔══██╗",
  "██║  ██║██║   ██║██║      █████╔╝██╔████╔██║██║     ██████╔╝",
  "██║  ██║██║   ██║██║     ██╔═══╝ ██║╚██╔╝██║██║     ██╔═══╝ ",
  "██████╔╝╚██████╔╝╚██████╗███████╗██║ ╚═╝ ██║╚██████╗██║     ",
  "╚═════╝  ╚═════╝  ╚═════╝╚══════╝╚═╝     ╚═╝ ╚═════╝╚═╝     ",
];

const COMPACT = [
  "     _         ___               ",
  "  __| |___  __|_  )_ __  __ _ __ ",
  " / _` / _ \\/ _|/ /| '  \\/ _| '_ \\",
  " \\__,_\\___/\\__/___|_|_|_\\__| .__/",
  "                           |_|   ",
];

const SHADES = [pc.cyan, pc.cyan, pc.blue, pc.blue, pc.cyan, pc.cyan];
const POWERED_BY = "meerutcodehub team";

function divider(width = 58): string {
  return pc.dim("─".repeat(width));
}

/** Full ASCII banner with tagline (use on tool launch). */
export function printBanner(): void {
  process.stdout.write("\n");
  LOGO.forEach((line, index) => {
    const color = SHADES[index] ?? pc.cyan;
    process.stdout.write(`  ${pc.bold(color(line))}\n`);
  });
  process.stdout.write(`\n  ${divider()}\n`);
  process.stdout.write(
    `  ${pc.dim("powered by")}  ${pc.bold(pc.cyan(POWERED_BY))}\n\n`
  );
}

/** Compact banner for narrow terminals or sub-screens. */
export function printCompactBanner(): void {
  process.stdout.write("\n");
  for (const line of COMPACT) {
    process.stdout.write(`  ${pc.bold(pc.cyan(line))}\n`);
  }
  process.stdout.write(`  ${pc.dim(`powered by ${POWERED_BY}`)}\n\n`);
}
