// Generates the local SVG placeholder illustrations in public/placeholders/ (SPEC §36).
// No stock photos, no hotlinking — every image is labelled "Demo image".
// Run: npm run placeholders

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const W = 1200;
const H = 900;
const OUT = join(process.cwd(), "public", "placeholders");

type Palette = { skyTop: string; skyBottom: string; ground: string; accent: string; ink: string; soft: string };

const PALETTES: Record<string, Palette> = {
  dawn: { skyTop: "#fde7d3", skyBottom: "#f8cfb0", ground: "#e9d6bd", accent: "#b7472a", ink: "#3b2f2a", soft: "#fff7ef" },
  pink: { skyTop: "#fbe4e6", skyBottom: "#f3c1c6", ground: "#ecd5c8", accent: "#c05a4a", ink: "#3d2b2b", soft: "#fff5f5" },
  sky: { skyTop: "#e0ecfb", skyBottom: "#c4dbf6", ground: "#d9e4d2", accent: "#1f4f7a", ink: "#1e2a36", soft: "#f5f9ff" },
  sand: { skyTop: "#f7efdd", skyBottom: "#ecdcb8", ground: "#dcc9a0", accent: "#8a5a1f", ink: "#35291a", soft: "#fffaf0" },
  sage: { skyTop: "#e7f1ea", skyBottom: "#cfe3d5", ground: "#c9d8bf", accent: "#2f6b4f", ink: "#1f2d25", soft: "#f5fbf7" },
  interior: { skyTop: "#f6f1ea", skyBottom: "#ece3d6", ground: "#d8c7ae", accent: "#9a5b3c", ink: "#2f2a25", soft: "#fffdf9" },
};

function frame(p: Palette, body: string, caption: string, width = W, height = H): string {
  const pillW = Math.max(220, caption.length * 17 + 60);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${caption} (demo image)">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${p.skyTop}"/>
      <stop offset="1" stop-color="${p.skyBottom}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  ${body}
  <g font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif">
    <rect x="36" y="${height - 96}" width="${pillW}" height="60" rx="30" fill="#ffffff" fill-opacity="0.88"/>
    <text x="${36 + pillW / 2}" y="${height - 56}" text-anchor="middle" font-size="30" font-weight="600" fill="${p.ink}">${caption}</text>
    <rect x="${width - 256}" y="36" width="220" height="52" rx="26" fill="#111827" fill-opacity="0.72"/>
    <text x="${width - 146}" y="71" text-anchor="middle" font-size="22" font-weight="700" letter-spacing="3" fill="#ffffff">DEMO IMAGE</text>
  </g>
</svg>
`;
}

const ground = (p: Palette, y = 700) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="${p.ground}"/>`;
const sun = (p: Palette, x = 980, y = 190) => `<circle cx="${x}" cy="${y}" r="70" fill="${p.soft}" fill-opacity="0.9"/>`;
const tree = (x: number, y: number, s = 1, color = "#5f8f5a") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-8" y="-10" width="16" height="70" fill="#7a5a3a"/><circle cx="0" cy="-40" r="52" fill="${color}"/><circle cx="-30" cy="-10" r="34" fill="${color}"/><circle cx="32" cy="-12" r="36" fill="${color}"/></g>`;

function windows(x: number, y: number, cols: number, rows: number, w: number, h: number, gapX: number, gapY: number, fill: string): string {
  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out += `<rect x="${x + c * (w + gapX)}" y="${y + r * (h + gapY)}" width="${w}" height="${h}" rx="3" fill="${fill}"/>`;
    }
  }
  return out;
}

const scenes: Record<string, { palette: Palette; caption: string; body: (p: Palette) => string; size?: [number, number] }> = {
  "apartment-exterior": {
    palette: PALETTES.sky!,
    caption: "Building exterior",
    body: (p) =>
      `${sun(p)}${ground(p)}
      <rect x="170" y="230" width="260" height="470" fill="#f2efe9" stroke="${p.ink}" stroke-width="4"/>
      ${windows(200, 260, 4, 9, 40, 30, 20, 18, "#8fb3d9")}
      <rect x="470" y="140" width="300" height="560" fill="#ffffff" stroke="${p.ink}" stroke-width="4"/>
      ${windows(500, 170, 5, 12, 38, 28, 16, 14, "#7fa6cf")}
      <rect x="810" y="300" width="230" height="400" fill="#efe8de" stroke="${p.ink}" stroke-width="4"/>
      ${windows(835, 330, 4, 8, 34, 28, 17, 16, "#8fb3d9")}
      ${tree(120, 690, 0.9)}${tree(1100, 690, 1)}
      <rect x="0" y="760" width="${W}" height="40" fill="#b9b2a6"/>`,
  },
  "house-exterior": {
    palette: PALETTES.dawn!,
    caption: "House exterior",
    body: (p) =>
      `${sun(p)}${ground(p, 690)}
      <polygon points="330,330 600,170 870,330" fill="${p.accent}"/>
      <rect x="360" y="330" width="480" height="360" fill="#fbf3e8" stroke="${p.ink}" stroke-width="4"/>
      <rect x="560" y="520" width="90" height="170" rx="6" fill="#8a5a3c"/>
      ${windows(400, 380, 2, 1, 110, 90, 280, 0, "#9cc3dd")}
      ${windows(400, 540, 1, 1, 110, 90, 0, 0, "#9cc3dd")}
      ${windows(690, 540, 1, 1, 110, 90, 0, 0, "#9cc3dd")}
      ${tree(200, 680, 1.1)}${tree(1020, 680, 0.95, "#6f9c63")}
      <rect x="520" y="690" width="170" height="210" fill="#d8c4a4"/>`,
  },
  "villa-exterior": {
    palette: PALETTES.sand!,
    caption: "Villa exterior",
    body: (p) =>
      `${sun(p, 200, 170)}${ground(p, 680)}
      <rect x="220" y="330" width="760" height="350" fill="#fffaf2" stroke="${p.ink}" stroke-width="4"/>
      <rect x="200" y="310" width="800" height="30" fill="${p.accent}"/>
      <rect x="420" y="180" width="400" height="150" fill="#fffaf2" stroke="${p.ink}" stroke-width="4"/>
      <rect x="400" y="165" width="440" height="24" fill="${p.accent}"/>
      ${windows(450, 210, 3, 1, 100, 90, 25, 0, "#a9c9dc")}
      ${windows(260, 390, 5, 2, 110, 100, 36, 40, "#a9c9dc")}
      <rect x="300" y="740" width="600" height="90" rx="12" fill="#7cc3dd" stroke="#4f98b3" stroke-width="4"/>
      ${tree(110, 670, 1.2, "#6b8f4e")}${tree(1090, 670, 1.1, "#6b8f4e")}`,
  },
  "plot-site": {
    palette: PALETTES.sage!,
    caption: "Plot site",
    body: (p) =>
      `${sun(p)}
      <rect x="0" y="560" width="${W}" height="${H - 560}" fill="${p.ground}"/>
      <polygon points="260,600 940,600 1060,820 140,820" fill="#e3d6b2" stroke="${p.accent}" stroke-width="6" stroke-dasharray="22 14"/>
      ${[260, 940, 1060, 140].map((x, i) => `<rect x="${x - 8}" y="${i < 2 ? 570 : 790}" width="16" height="40" fill="${p.accent}"/>`).join("")}
      <rect x="0" y="840" width="${W}" height="60" fill="#9c9a92"/>
      <rect x="0" y="866" width="${W}" height="8" fill="#f3f1e8" stroke-dasharray="40 30"/>
      <rect x="560" y="470" width="12" height="140" fill="#7a5a3a"/>
      <rect x="480" y="420" width="172" height="80" rx="8" fill="#ffffff" stroke="${p.ink}" stroke-width="3"/>
      <text x="566" y="470" text-anchor="middle" font-family="system-ui, sans-serif" font-size="28" font-weight="700" fill="${p.ink}">PLOT</text>
      ${tree(120, 560, 0.9)}${tree(1110, 560, 1)}`,
  },
  "plot-layout": {
    palette: PALETTES.sage!,
    caption: "Layout plan",
    body: (p) => {
      let cells = "";
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 5; c++) {
          const x = 170 + c * 180;
          const y = 180 + r * 170;
          cells += `<rect x="${x}" y="${y}" width="160" height="150" fill="${(r + c) % 3 === 0 ? "#f3e6c4" : "#ffffff"}" stroke="${p.ink}" stroke-width="3"/><text x="${x + 80}" y="${y + 85}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="24" fill="${p.ink}">${r * 5 + c + 1}</text>`;
        }
      }
      return `<rect x="130" y="140" width="940" height="570" fill="#eef5ee" stroke="${p.accent}" stroke-width="6"/>${cells}<rect x="130" y="720" width="940" height="40" fill="#b9b8b0"/>`;
    },
  },
  "office-exterior": {
    palette: PALETTES.sky!,
    caption: "Commercial building",
    body: (p) =>
      `${sun(p, 190, 180)}${ground(p)}
      <polygon points="380,700 380,170 820,120 820,700" fill="#9ec3e6" stroke="${p.ink}" stroke-width="4"/>
      ${Array.from({ length: 11 }, (_, i) => `<line x1="380" y1="${210 + i * 45}" x2="820" y2="${170 + i * 48}" stroke="#e8f2fb" stroke-width="3"/>`).join("")}
      ${Array.from({ length: 5 }, (_, i) => `<line x1="${460 + i * 80}" y1="${160 - i * 8}" x2="${460 + i * 80}" y2="700" stroke="#e8f2fb" stroke-width="3"/>`).join("")}
      <rect x="820" y="330" width="220" height="370" fill="#dfe7ef" stroke="${p.ink}" stroke-width="4"/>
      ${windows(845, 360, 3, 7, 50, 30, 18, 16, "#8fb3d9")}
      <rect x="540" y="600" width="120" height="100" fill="#355d82"/>`,
  },
  "shop-front": {
    palette: PALETTES.pink!,
    caption: "Shop front",
    body: (p) =>
      `${ground(p, 720)}
      <rect x="180" y="200" width="840" height="520" fill="#fff8f3" stroke="${p.ink}" stroke-width="4"/>
      <rect x="220" y="240" width="760" height="90" rx="8" fill="${p.accent}"/>
      <text x="600" y="300" text-anchor="middle" font-family="system-ui, sans-serif" font-size="42" font-weight="700" fill="#ffffff" letter-spacing="4">SHOP</text>
      ${Array.from({ length: 8 }, (_, i) => `<path d="M ${220 + i * 95} 330 h 95 l -10 50 h -75 z" fill="${i % 2 ? "#f3d2c9" : "#ffffff"}" stroke="${p.ink}" stroke-width="2"/>`).join("")}
      <rect x="240" y="420" width="420" height="300" fill="#bcd7e8" stroke="${p.ink}" stroke-width="4"/>
      <rect x="720" y="420" width="220" height="300" fill="#8a5a3c"/>`,
  },
  "living-room": {
    palette: PALETTES.interior!,
    caption: "Living room",
    body: (p) =>
      `<rect x="0" y="650" width="${W}" height="${H - 650}" fill="${p.ground}"/>
      <rect x="700" y="140" width="330" height="330" fill="#cfe3ee" stroke="${p.ink}" stroke-width="6"/>
      <line x1="865" y1="140" x2="865" y2="470" stroke="${p.ink}" stroke-width="5"/>
      <rect x="180" y="470" width="480" height="150" rx="30" fill="${p.accent}"/>
      <rect x="150" y="430" width="80" height="210" rx="30" fill="${p.accent}"/>
      <rect x="610" y="430" width="80" height="210" rx="30" fill="${p.accent}"/>
      <rect x="220" y="420" width="190" height="90" rx="20" fill="#c77d5a"/>
      <rect x="430" y="420" width="190" height="90" rx="20" fill="#c77d5a"/>
      <ellipse cx="420" cy="760" rx="330" ry="60" fill="#e9dcc8"/>
      <rect x="330" y="690" width="180" height="20" rx="6" fill="#6b4a33"/>
      <rect x="1060" y="400" width="10" height="250" fill="${p.ink}"/>
      <path d="M 1020 400 h 90 l -20 -80 h -50 z" fill="#f6d9a8"/>`,
  },
  bedroom: {
    palette: PALETTES.interior!,
    caption: "Bedroom",
    body: (p) =>
      `<rect x="0" y="640" width="${W}" height="${H - 640}" fill="${p.ground}"/>
      <rect x="120" y="160" width="300" height="260" fill="#d7e8f0" stroke="${p.ink}" stroke-width="6"/>
      <rect x="470" y="330" width="560" height="120" rx="16" fill="#8a5a3c"/>
      <rect x="450" y="450" width="620" height="170" rx="20" fill="#f7f1e8" stroke="${p.ink}" stroke-width="4"/>
      <rect x="500" y="400" width="200" height="80" rx="24" fill="#ffffff" stroke="${p.ink}" stroke-width="3"/>
      <rect x="800" y="400" width="200" height="80" rx="24" fill="#ffffff" stroke="${p.ink}" stroke-width="3"/>
      <rect x="450" y="520" width="620" height="100" rx="16" fill="${p.accent}" fill-opacity="0.85"/>
      <rect x="250" y="520" width="140" height="120" rx="8" fill="#b88d6a"/>
      <path d="M 285 520 h 70 l -12 -70 h -46 z" fill="#f6d9a8"/>`,
  },
  kitchen: {
    palette: PALETTES.interior!,
    caption: "Kitchen",
    body: (p) =>
      `<rect x="0" y="660" width="${W}" height="${H - 660}" fill="${p.ground}"/>
      <rect x="120" y="150" width="960" height="170" fill="#f3ebe0" stroke="${p.ink}" stroke-width="4"/>
      ${windows(140, 170, 6, 1, 140, 130, 16, 0, "#e6d6c2")}
      <rect x="120" y="440" width="960" height="30" fill="#5d4c3f"/>
      <rect x="120" y="470" width="960" height="190" fill="#efe4d6" stroke="${p.ink}" stroke-width="4"/>
      ${windows(140, 490, 6, 1, 140, 150, 16, 0, "#e3d3be")}
      <rect x="720" y="415" width="220" height="28" rx="6" fill="#2f2f2f"/>
      <circle cx="780" cy="429" r="10" fill="#555"/><circle cx="880" cy="429" r="10" fill="#555"/>
      <rect x="260" y="360" width="160" height="80" rx="8" fill="#cfe3ee" stroke="${p.ink}" stroke-width="3"/>
      <rect x="1000" y="380" width="30" height="60" rx="6" fill="${p.accent}"/>`,
  },
  "office-interior": {
    palette: PALETTES.sky!,
    caption: "Office interior",
    body: (p) =>
      `<rect x="0" y="620" width="${W}" height="${H - 620}" fill="#cfd8e0"/>
      ${windows(100, 120, 4, 1, 230, 330, 25, 0, "#dcebf8")}
      ${[200, 560, 920].map((x) => `<rect x="${x - 130}" y="560" width="260" height="24" rx="6" fill="#6b7c8f"/><rect x="${x - 110}" y="584" width="14" height="110" fill="#6b7c8f"/><rect x="${x + 96}" y="584" width="14" height="110" fill="#6b7c8f"/><rect x="${x - 60}" y="470" width="120" height="85" rx="6" fill="#26323f"/><rect x="${x - 30}" y="600" width="60" height="100" rx="18" fill="${p.accent}"/>`).join("")}`,
  },
  "floor-plan": {
    palette: PALETTES.sand!,
    caption: "Floor plan",
    body: (p) =>
      `<rect x="150" y="130" width="900" height="620" fill="#ffffff" stroke="${p.ink}" stroke-width="10"/>
      <line x1="560" y1="130" x2="560" y2="480" stroke="${p.ink}" stroke-width="6"/>
      <line x1="150" y1="480" x2="1050" y2="480" stroke="${p.ink}" stroke-width="6"/>
      <line x1="800" y1="480" x2="800" y2="750" stroke="${p.ink}" stroke-width="6"/>
      <line x1="800" y1="130" x2="800" y2="480" stroke="${p.ink}" stroke-width="6"/>
      <g font-family="system-ui, sans-serif" font-size="28" fill="${p.ink}" text-anchor="middle">
        <text x="355" y="310">Living / Dining</text><text x="680" y="310">Bedroom 1</text>
        <text x="925" y="310">Bedroom 2</text><text x="475" y="620">Kitchen &amp; Utility</text>
        <text x="925" y="620">Bath</text>
      </g>`,
  },
  "balcony-view": {
    palette: PALETTES.pink!,
    caption: "Balcony view",
    body: (p) =>
      `${sun(p, 900, 260)}
      ${[80, 200, 330, 470, 620, 760, 900, 1040].map((x, i) => `<rect x="${x}" y="${420 - (i % 3) * 60}" width="110" height="${320 + (i % 3) * 60}" fill="${i % 2 ? "#d9a7a4" : "#e7bfb9"}"/>`).join("")}
      <rect x="0" y="600" width="${W}" height="16" fill="${p.ink}"/>
      ${Array.from({ length: 25 }, (_, i) => `<rect x="${i * 50}" y="616" width="10" height="200" fill="${p.ink}"/>`).join("")}
      <rect x="0" y="816" width="${W}" height="84" fill="#cdb8a6"/>`,
  },
  "project-towers": {
    palette: PALETTES.sky!,
    caption: "Project view",
    body: (p) =>
      `${sun(p)}${ground(p, 710)}
      ${[
        [140, 260, 220],
        [400, 150, 240],
        [680, 210, 230],
        [940, 300, 200],
      ]
        .map(
          ([x, y, w]) =>
            `<rect x="${x}" y="${y}" width="${w}" height="${710 - y!}" fill="#ffffff" stroke="${p.ink}" stroke-width="4"/>${windows(x! + 22, y! + 26, 4, Math.floor((710 - y! - 60) / 42), (w! - 88) / 4, 24, 14, 18, "#8fb3d9")}`,
        )
        .join("")}
      <rect x="0" y="760" width="${W}" height="140" fill="#9fc48f"/>
      ${tree(90, 760, 0.8)}${tree(380, 780, 0.7)}${tree(660, 770, 0.75)}${tree(1120, 770, 0.8)}`,
  },
  "locality-skyline": {
    palette: PALETTES.pink!,
    caption: "Jaipur neighbourhood",
    body: (p) => {
      // Stylised pink-city facade: arches and chhatris (domed pavilions).
      const arches = Array.from({ length: 9 }, (_, i) => {
        const x = 150 + i * 100;
        return `<path d="M ${x} 640 v -110 a 35 35 0 0 1 70 0 v 110 z" fill="#f7ddd8" stroke="${p.accent}" stroke-width="3"/>`;
      }).join("");
      const upper = Array.from({ length: 13 }, (_, i) => {
        const x = 170 + i * 66;
        return `<rect x="${x}" y="380" width="40" height="70" rx="20" fill="#f7ddd8" stroke="${p.accent}" stroke-width="3"/>`;
      }).join("");
      const domes = [260, 600, 940]
        .map((x) => `<path d="M ${x - 60} 330 a 60 55 0 0 1 120 0 z" fill="${p.accent}"/><rect x="${x - 70}" y="330" width="140" height="18" fill="#a4453a"/><rect x="${x - 3}" y="248" width="6" height="30" fill="#a4453a"/>`)
        .join("");
      return `${sun(p, 1040, 150)}<rect x="120" y="348" width="960" height="300" fill="#e8a79b" stroke="${p.accent}" stroke-width="4"/>${domes}${upper}${arches}${ground(p, 648)}`;
    },
  },
  "agent-avatar": {
    palette: PALETTES.sand!,
    caption: "Agent",
    size: [600, 600],
    body: (p) =>
      `<circle cx="300" cy="250" r="110" fill="#d7b48f"/><path d="M 100 600 a 200 190 0 0 1 400 0 z" fill="${p.accent}"/>`,
  },
  "blog-cover": {
    palette: PALETTES.dawn!,
    caption: "Article",
    body: (p) =>
      `<rect x="160" y="170" width="880" height="520" rx="28" fill="#ffffff" stroke="${p.ink}" stroke-width="4"/>
      <polygon points="300,420 420,320 540,420" fill="${p.accent}"/><rect x="320" y="420" width="200" height="150" fill="#fbe9dc" stroke="${p.ink}" stroke-width="3"/>
      ${[260, 320, 380, 440, 500].map((y, i) => `<rect x="620" y="${y}" width="${i === 4 ? 200 : 340}" height="22" rx="11" fill="#e5d5c5"/>`).join("")}`,
  },
};

mkdirSync(OUT, { recursive: true });
for (const [name, scene] of Object.entries(scenes)) {
  const [w, h] = scene.size ?? [W, H];
  const svg = frame(scene.palette, scene.body(scene.palette), scene.caption, w, h);
  writeFileSync(join(OUT, `${name}.svg`), svg, "utf8");
}
console.log(`Wrote ${Object.keys(scenes).length} placeholders to ${OUT}`);
