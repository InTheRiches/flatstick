import { useEffect, useMemo, useRef, useState } from "react";

// ─── Demo Data ───────────────────────────────────────────────────────────────
// Simulates a realistic putting green with a dominant back-to-front slope
// and subtle E-W undulations / a small hollow near the centre-left.
const DEMO_W = 45;
const DEMO_H = 35;

function generateDemoGrid() {
  const samples = [];
  for (let j = 0; j < DEMO_H; j++) {
    for (let i = 0; i < DEMO_W; i++) {
      const nx = i / (DEMO_W - 1); // 0 = west, 1 = east
      const ny = j / (DEMO_H - 1); // 0 = south, 1 = north
      const elev =
        10.0 +
        3.8 * ny +                                              // main N tilt
        1.2 * Math.sin(nx * Math.PI * 2.2) * (0.3 + ny * 0.7) + // E-W roll
        0.7 * Math.cos((nx - 0.38) * Math.PI * 4) * ny +       // second ridge
        -0.9 * Math.exp(-((nx - 0.35) ** 2 + (ny - 0.45) ** 2) / 0.04) + // hollow
        0.35 * Math.sin(nx * 9) * Math.sin(ny * 7);            // fine grain
      samples.push({
        location: { x: -90 + nx * 0.001, y: 35 + ny * 0.001 },
        value: elev,
      });
    }
  }
  return { samples, width: DEMO_W, height: DEMO_H };
}

// ─── Colour Utilities ────────────────────────────────────────────────────────

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function lerpRGB(c1, c2, t) {
  return [
    Math.round(lerp(c1[0], c2[0], t)),
    Math.round(lerp(c1[1], c2[1], t)),
    Math.round(lerp(c1[2], c2[2], t)),
  ];
}

function multiStop(stops, t) {
  const ct = Math.max(0, Math.min(1, t));
  const seg = ct * (stops.length - 1);
  const i = Math.min(Math.floor(seg), stops.length - 2);
  return lerpRGB(stops[i], stops[i + 1], seg - i);
}

// white → sky blue → royal blue
const ELEV_STOPS = [
  [255, 255, 255],
  [190, 220, 255],
  [60, 130, 230],
  [10, 50, 160],
];

// white → yellow → orange → crimson
const SLOPE_STOPS = [
  [255, 255, 255],
  [255, 245, 80],
  [255, 145, 20],
  [210, 15, 15],
];

const elevColor = (t) => multiStop(ELEV_STOPS, t);
const slopeColor = (t) => multiStop(SLOPE_STOPS, t);

// ─── Slope Grid ──────────────────────────────────────────────────────────────

function computeSlopeGrid({ samples, width, height }) {
  const getZ = (i, j) => samples[j * width + i].value;
  return samples.map((_, idx) => {
    const i = idx % width;
    const j = Math.floor(idx / width);
    const x0 = Math.max(0, i - 1), x1 = Math.min(width - 1, i + 1);
    const y0 = Math.max(0, j - 1), y1 = Math.min(height - 1, j + 1);
    const gx = (getZ(x1, j) - getZ(x0, j)) / (x1 - x0); // dz / dEast-step
    const gy = (getZ(i, y1) - getZ(i, y0)) / (y1 - y0); // dz / dNorth-step
    return { gx, gy, mag: Math.sqrt(gx * gx + gy * gy) };
  });
}

// ─── Canvas Renderer ─────────────────────────────────────────────────────────

/**
 * Bilinear interpolation in grid space.
 * px, py ∈ [0,1] where py=0 → canvas top = geographic north (j = height−1).
 */
function bilinear(px, py, width, height, getVal) {
  const gx = px * (width - 1);
  const gy = (1 - py) * (height - 1); // flip: canvas-top = north
  const x0 = Math.floor(gx), x1 = Math.min(x0 + 1, width - 1);
  const y0 = Math.floor(gy), y1 = Math.min(y0 + 1, height - 1);
  const fx = gx - x0, fy = gy - y0;
  return (
    getVal(x0, y0) * (1 - fx) * (1 - fy) +
    getVal(x1, y0) * fx * (1 - fy) +
    getVal(x0, y1) * (1 - fx) * fy +
    getVal(x1, y1) * fx * fy
  );
}

function renderHeatmap(canvas, grid, slopeGrid, mode) {
  if (!canvas) return;
  const { samples, width, height } = grid;
  const ctx = canvas.getContext("2d");
  const cw = canvas.width, ch = canvas.height;

  // Normalisation helpers
  const vals = samples.map((s) => s.value);
  const minV = Math.min(...vals), maxV = Math.max(...vals);
  const mags = slopeGrid.map((s) => s.mag);
  const maxM = Math.max(...mags) || 1;

  const normElev = (i, j) =>
    maxV === minV ? 0 : (samples[j * width + i].value - minV) / (maxV - minV);
  const normMag = (i, j) => slopeGrid[j * width + i].mag / maxM;

  // ── Pixel fill ─────────────────────────────────────────────────────────────
  const imageData = ctx.createImageData(cw, ch);
  const d = imageData.data;

  for (let py = 0; py < ch; py++) {
    for (let px = 0; px < cw; px++) {
      const t = bilinear(
        px / (cw - 1),
        py / (ch - 1),
        width,
        height,
        mode === "elevation" ? normElev : normMag
      );
      const [r, g, b] = mode === "elevation" ? elevColor(t) : slopeColor(t);
      const i4 = (py * cw + px) * 4;
      d[i4] = r; d[i4 + 1] = g; d[i4 + 2] = b; d[i4 + 3] = 255;
    }
  }
  ctx.putImageData(imageData, 0, 0);

  // ── Slope arrows ───────────────────────────────────────────────────────────
  if (mode === "slope") {
    // Target ~18 columns of arrows regardless of grid density
    const ARROW_COLS = Math.min(width, 18);
    const stepI = Math.max(1, Math.round(width / ARROW_COLS));
    const stepJ = Math.max(1, Math.round(stepI * (height / width) * (cw / ch)));

    const cellPxW = (cw / (width - 1)) * stepI;
    const cellPxH = (ch / (height - 1)) * stepJ;
    const maxLen = Math.min(cellPxW, cellPxH) * 0.72;

    for (let j = Math.floor(stepJ / 2); j < height; j += stepJ) {
      for (let i = Math.floor(stepI / 2); i < width; i += stepI) {
        const { gx, gy, mag } = slopeGrid[j * width + i];
        const relMag = mag / maxM;
        if (relMag < 0.03) continue;

        // Canvas pixel centre for this grid point (flip j)
        const cx = (i / (width - 1)) * cw;
        const cy = (1 - j / (height - 1)) * ch;

        const len = relMag * maxLen;

        // Downhill direction in canvas space:
        //   geographic downhill = (−gx, −gy) in (east, north)
        //   canvas x = east ✓; canvas y = −north (flipped)
        //   → canvas vector = (−gx, +gy)
        const angle = Math.atan2(gy, -gx);
        drawArrow(ctx, cx, cy, angle, len, relMag);
      }
    }
  }
}

function drawArrow(ctx, x, y, angle, length, weight) {
  if (length < 3) return;
  const headLen = Math.min(length * 0.38, 9);
  const headA = Math.PI / 5.5;
  const lw = 0.8 + weight * 1.8;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // Dark outline for contrast, slight glow on heavier arrows
  ctx.globalAlpha = 0.5 + weight * 0.45;
  ctx.strokeStyle = "#111";
  ctx.lineWidth = lw + 1.4;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const half = length / 2;
  ctx.beginPath();
  ctx.moveTo(-half, 0);
  ctx.lineTo(half - headLen * 0.45, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(half - headLen * Math.cos(headA), -headLen * Math.sin(headA));
  ctx.moveTo(half, 0);
  ctx.lineTo(half - headLen * Math.cos(headA), headLen * Math.sin(headA));
  ctx.stroke();

  // White inner stroke
  ctx.strokeStyle = "rgba(255,255,255,0.88)";
  ctx.lineWidth = lw;
  ctx.beginPath();
  ctx.moveTo(-half, 0);
  ctx.lineTo(half - headLen * 0.45, 0);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(half, 0);
  ctx.lineTo(half - headLen * Math.cos(headA), -headLen * Math.sin(headA));
  ctx.moveTo(half, 0);
  ctx.lineTo(half - headLen * Math.cos(headA), headLen * Math.sin(headA));
  ctx.stroke();

  ctx.restore();
}

function renderLegend(canvas, mode) {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const { width: w, height: h } = canvas;
  const fn = mode === "elevation" ? elevColor : slopeColor;
  for (let x = 0; x < w; x++) {
    const [r, g, b] = fn(x / (w - 1));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, 0, 1, h);
  }
}

// ─── Component ───────────────────────────────────────────────────────────────

const CANVAS_W = 640;
const CANVAS_H = 480;

export default function GolfHeatmap({ grid }) {
  const g = useMemo(() => grid ?? generateDemoGrid(), [grid]);
  const [mode, setMode] = useState("elevation");
  const canvasRef = useRef(null);
  const legendRef = useRef(null);

  const slopeGrid = useMemo(() => computeSlopeGrid(g), [g]);

  // Stats
  const stats = useMemo(() => {
    const vals = g.samples.map((s) => s.value);
    const mags = slopeGrid.map((s) => s.mag);
    return {
      minElev: Math.min(...vals).toFixed(2),
      maxElev: Math.max(...vals).toFixed(2),
      maxSlope: Math.max(...mags).toFixed(3),
      avgSlope: (mags.reduce((a, b) => a + b, 0) / mags.length).toFixed(3),
    };
  }, [g, slopeGrid]);

  useEffect(() => {
    renderHeatmap(canvasRef.current, g, slopeGrid, mode);
  }, [g, slopeGrid, mode]);

  useEffect(() => {
    renderLegend(legendRef.current, mode);
  }, [mode]);

  const isElev = mode === "elevation";

  return (
    <div style={styles.root}>
      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <div style={styles.tagline}>LIDAR ANALYSIS</div>
          <div style={styles.title}>Putting Green</div>
        </div>
        <div style={styles.toggle}>
          <button
            onClick={() => setMode("elevation")}
            style={{ ...styles.toggleBtn, ...(isElev ? styles.toggleActive : {}) }}
          >
            ▲ Elevation
          </button>
          <button
            onClick={() => setMode("slope")}
            style={{ ...styles.toggleBtn, ...(!isElev ? styles.toggleActiveSlope : {}) }}
          >
            ↗ Slope
          </button>
        </div>
      </div>

      {/* ── Canvas ── */}
      <div style={styles.canvasWrap}>
        {/* Compass */}
        <div style={styles.compass}>
          <svg width="32" height="32" viewBox="0 0 32 32">
            <circle cx="16" cy="16" r="14" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <polygon points="16,4 13,16 16,14 19,16" fill="#f0f0f0"/>
            <polygon points="16,28 13,16 16,18 19,16" fill="rgba(255,255,255,0.35)"/>
            <text x="16" y="7" textAnchor="middle" fill="white" fontSize="5.5" fontFamily="monospace" fontWeight="bold">N</text>
          </svg>
        </div>
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          style={styles.canvas}
        />
      </div>

      {/* ── Legend + Stats ── */}
      <div style={styles.footer}>
        <div style={styles.legendWrap}>
          <span style={styles.legendLabel}>{isElev ? "Low" : "Flat"}</span>
          <canvas ref={legendRef} width={220} height={14} style={styles.legendCanvas} />
          <span style={styles.legendLabel}>{isElev ? "High" : "Steep"}</span>
        </div>

        <div style={styles.stats}>
          {isElev ? (
            <>
              <Stat label="MIN" value={`${stats.minElev} m`} />
              <Stat label="MAX" value={`${stats.maxElev} m`} />
              <Stat label="RANGE" value={`${(stats.maxElev - stats.minElev).toFixed(2)} m`} />
            </>
          ) : (
            <>
              <Stat label="MAX SLOPE" value={stats.maxSlope} />
              <Stat label="AVG SLOPE" value={stats.avgSlope} />
              <Stat label="ARROWS" value="↓ downhill" />
            </>
          )}
          <Stat label="GRID" value={`${g.width} × ${g.height}`} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = {
  root: {
    background: "#0d1a14",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    fontFamily: "'DM Mono', 'Courier New', monospace",
    color: "#e8f0e9",
  },
  header: {
    width: CANVAS_W,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "12px",
  },
  tagline: {
    fontSize: "10px",
    letterSpacing: "3px",
    color: "#5a8f6a",
    marginBottom: "2px",
  },
  title: {
    fontSize: "22px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    color: "#d8ead9",
    fontFamily: "'Georgia', serif",
  },
  toggle: {
    display: "flex",
    gap: "6px",
    background: "rgba(255,255,255,0.06)",
    borderRadius: "8px",
    padding: "4px",
  },
  toggleBtn: {
    padding: "7px 18px",
    borderRadius: "6px",
    border: "none",
    background: "transparent",
    color: "rgba(220,230,220,0.55)",
    fontSize: "12px",
    letterSpacing: "0.5px",
    cursor: "pointer",
    transition: "all 0.18s",
    fontFamily: "inherit",
    fontWeight: "600",
  },
  toggleActive: {
    background: "linear-gradient(135deg, #1a3a8f, #0a2060)",
    color: "#aaccff",
    boxShadow: "0 0 12px rgba(60,100,230,0.35)",
  },
  toggleActiveSlope: {
    background: "linear-gradient(135deg, #8f1a1a, #60100a)",
    color: "#ffbbbb",
    boxShadow: "0 0 12px rgba(210,40,40,0.35)",
  },
  canvasWrap: {
    position: "relative",
    borderRadius: "10px",
    overflow: "hidden",
    boxShadow: "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.07)",
  },
  canvas: {
    display: "block",
    width: CANVAS_W,
    height: CANVAS_H,
  },
  compass: {
    position: "absolute",
    top: "12px",
    right: "12px",
    zIndex: 10,
    opacity: 0.85,
  },
  footer: {
    width: CANVAS_W,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "14px",
    gap: "20px",
  },
  legendWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  legendCanvas: {
    borderRadius: "3px",
    boxShadow: "0 0 0 1px rgba(255,255,255,0.12)",
    display: "block",
  },
  legendLabel: {
    fontSize: "10px",
    color: "rgba(200,220,200,0.6)",
    letterSpacing: "1px",
    textTransform: "uppercase",
  },
  stats: {
    display: "flex",
    gap: "20px",
  },
  stat: {
    textAlign: "right",
  },
  statLabel: {
    fontSize: "9px",
    letterSpacing: "1.5px",
    color: "#5a8f6a",
    textTransform: "uppercase",
  },
  statValue: {
    fontSize: "13px",
    color: "#c8e0ca",
    marginTop: "1px",
  },
};