// Ring visualizer — pure CSS/SVG, no images.
// Renders a front-on ring with elliptical band + gem on top.
// Reacts to metal color, gem shape, carat size, and montura (solitaire/halo/three-stone).

const METAL_PALETTE = {
  "white-14k":  { name: "Oro Blanco 14K",   light: "#f3f1ec", mid: "#d7d2c5", dark: "#8c8676", spec: "#ffffff", weightG: 4.2, pricePerG: 1400 },
  "yellow-14k": { name: "Oro Amarillo 14K", light: "#f6e2a8", mid: "#d8b35a", dark: "#8a661b", spec: "#fff6cc", weightG: 4.2, pricePerG: 1500 },
  "rose-14k":   { name: "Oro Rosa 14K",     light: "#f4ccb8", mid: "#d18d6a", dark: "#874a31", spec: "#ffe4d6", weightG: 4.2, pricePerG: 1500 },
  "white-18k":  { name: "Oro Blanco 18K",   light: "#f7f5f0", mid: "#dcd6c8", dark: "#928c7c", spec: "#ffffff", weightG: 4.4, pricePerG: 2050 },
  "yellow-18k": { name: "Oro Amarillo 18K", light: "#fbe18c", mid: "#e4a92e", dark: "#8e5c0c", spec: "#fff2b0", weightG: 4.4, pricePerG: 2200 },
  "rose-18k":   { name: "Oro Rosa 18K",     light: "#f6c4a8", mid: "#d97e54", dark: "#823d24", spec: "#ffd9c4", weightG: 4.4, pricePerG: 2200 },
  "platinum":   { name: "Platino",          light: "#f0f0ec", mid: "#c9c8c1", dark: "#6e6d65", spec: "#ffffff", weightG: 6.6, pricePerG: 1850 },
};

const SHAPES = [
  { id: "round",    name: "Redondo",  factor: 1.00 },
  { id: "princess", name: "Princesa", factor: 0.95 },
  { id: "emerald",  name: "Esmeralda", factor: 0.92 },
  { id: "oval",     name: "Ovalado",  factor: 0.98 },
];

const MONTURAS = [
  { id: "solitario",   name: "Solitario",  base: 8500 },
  { id: "halo",        name: "Halo",       base: 14500 },
  { id: "tres-piedras",name: "Tres Piedras", base: 18000 },
];

// Gem ─ rendered as a layered shape with shape-specific clip-path + facet gradients.
function Gem({ shape, sizePx, accentTone = "#f6f7ff", style = {} }) {
  const s = sizePx;
  const tone = accentTone;

  // Faceting gradients vary by shape
  const facetCommon = {
    boxShadow: `0 6px 18px rgba(0,0,0,0.25), 0 1px 0 rgba(255,255,255,0.6) inset, 0 -6px 14px rgba(0,0,0,0.15) inset`,
  };

  let bg, clip = "none", rotate = 0, ratio = 1;
  if (shape === "round") {
    clip = "circle(50% at 50% 50%)";
    bg = `
      radial-gradient(circle at 38% 30%, #ffffff 0%, rgba(255,255,255,0.0) 28%),
      conic-gradient(from 0deg,
        ${tone} 0deg, #ffffff 30deg, #cfd6e6 60deg, #ffffff 95deg,
        ${tone} 140deg, #b9c2d6 180deg, #ffffff 220deg, ${tone} 260deg,
        #d6dde9 300deg, #ffffff 330deg, ${tone} 360deg)
    `;
  } else if (shape === "princess") {
    clip = "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)"; // diamond/square rotated
    bg = `
      radial-gradient(circle at 50% 30%, #ffffff 0%, rgba(255,255,255,0) 35%),
      conic-gradient(from 45deg at 50% 50%,
        ${tone} 0deg, #ffffff 45deg, #c8d0e2 90deg, #ffffff 135deg,
        ${tone} 180deg, #ffffff 225deg, #c8d0e2 270deg, #ffffff 315deg, ${tone} 360deg)
    `;
    ratio = 1;
  } else if (shape === "emerald") {
    // step-cut rectangle, corners snipped
    clip = "polygon(15% 0, 85% 0, 100% 18%, 100% 82%, 85% 100%, 15% 100%, 0 82%, 0 18%)";
    bg = `
      linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 15%),
      linear-gradient(180deg,
        ${tone} 0%, #ffffff 16%, ${tone} 24%, #ffffff 40%, ${tone} 50%,
        #ffffff 62%, ${tone} 72%, #ffffff 86%, ${tone} 100%)
    `;
    ratio = 0.72; // narrower
  } else if (shape === "oval") {
    clip = "ellipse(40% 50% at 50% 50%)";
    bg = `
      radial-gradient(ellipse at 40% 30%, #ffffff 0%, rgba(255,255,255,0) 35%),
      conic-gradient(from 0deg,
        ${tone} 0deg, #ffffff 50deg, #c8d0e2 100deg, #ffffff 160deg,
        ${tone} 210deg, #ffffff 270deg, #c8d0e2 320deg, ${tone} 360deg)
    `;
    ratio = 1; // we'll scale Y via container ratio
  }

  // Container sizing: for emerald & oval the bounding box isn't square
  const widthPx = shape === "emerald" ? s * 1.0 : s;
  const heightPx = shape === "emerald" ? s * 1.35 : s;

  return (
    <div
      className="relative"
      style={{
        width: widthPx,
        height: heightPx,
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0,
          clipPath: clip,
          background: bg,
          filter: "saturate(1.05) contrast(1.05)",
          ...facetCommon,
        }}
      />
      {/* Inner highlight */}
      <div style={{
        position: "absolute",
        left: "22%", top: "12%",
        width: "30%", height: "22%",
        clipPath: clip === "none" ? "ellipse(50% 50% at 50% 50%)" : "ellipse(50% 50% at 50% 50%)",
        background: "radial-gradient(ellipse at center, rgba(255,255,255,0.95), rgba(255,255,255,0) 70%)",
        pointerEvents: "none",
      }} />
      {/* Edge darkening */}
      <div style={{
        position: "absolute", inset: 0,
        clipPath: clip,
        boxShadow: "inset 0 0 16px rgba(20,20,40,0.35)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

// Prong-set wrapper: 4 prongs at compass points for round/oval/emerald, 4 corner prongs for princess.
function Prongs({ shape, sizePx, metal }) {
  const dotSize = Math.max(4, sizePx * 0.085);
  const color = `linear-gradient(180deg, ${metal.light}, ${metal.mid})`;
  const positions = shape === "princess"
    ? [[8, 8], [92, 8], [8, 92], [92, 92]]
    : shape === "emerald"
    ? [[12, 6], [88, 6], [12, 94], [88, 94]]
    : [[50, 4], [96, 50], [50, 96], [4, 50]];
  return (
    <>
      {positions.map(([x, y], i) => (
        <div key={i}
          style={{
            position: "absolute", left: `calc(${x}% - ${dotSize/2}px)`, top: `calc(${y}% - ${dotSize/2}px)`,
            width: dotSize, height: dotSize, borderRadius: "50%",
            background: color, boxShadow: "0 1px 1px rgba(0,0,0,0.35)",
            zIndex: 3,
          }}
        />
      ))}
    </>
  );
}

// Halo of micro-gems orbiting central gem
function Halo({ shape, sizePx }) {
  const count = 14;
  const microSize = Math.max(3, sizePx * 0.085);
  const radiusX = shape === "emerald" ? sizePx * 0.58 : sizePx * 0.58;
  const radiusY = shape === "emerald" ? sizePx * 0.78 : sizePx * 0.58;
  const dots = [];
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const x = Math.cos(a) * radiusX;
    const y = Math.sin(a) * radiusY;
    dots.push(
      <div key={i}
        style={{
          position: "absolute",
          left: `calc(50% + ${x}px - ${microSize/2}px)`,
          top: `calc(50% + ${y}px - ${microSize/2}px)`,
          width: microSize, height: microSize, borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #ffffff, #cfd6e6 60%, #8990a4 100%)",
          boxShadow: "0 1px 1px rgba(0,0,0,0.3), 0 0 6px rgba(255,255,255,0.4)",
        }}
      />
    );
  }
  return <>{dots}</>;
}

// Two flanking side stones
function SideStones({ shape, sizePx, gap = 14 }) {
  const sideSize = sizePx * 0.55;
  const offset = sizePx * 0.5 + gap + sideSize * 0.5;
  return (
    <>
      <div style={{ position: "absolute", left: `calc(50% - ${offset}px - ${sideSize/2}px)`, top: `calc(50% - ${sideSize/2}px)`, zIndex: 1 }}>
        <Gem shape={shape === "emerald" ? "round" : shape} sizePx={sideSize} />
      </div>
      <div style={{ position: "absolute", left: `calc(50% + ${offset}px - ${sideSize/2}px)`, top: `calc(50% - ${sideSize/2}px)`, zIndex: 1 }}>
        <Gem shape={shape === "emerald" ? "round" : shape} sizePx={sideSize} />
      </div>
    </>
  );
}

// Elliptical ring band, viewed from front (so the front of the ring forms an "O" shape).
function Band({ metal, montura }) {
  const { light, mid, dark, spec } = metal;
  // The band is a vertical ellipse drawn with two layered ovals: outer (metal) + inner (cutout via bg color).
  return (
    <div style={{ position: "relative", width: 340, height: 380 }}>
      {/* Shadow under ring */}
      <div style={{
        position: "absolute", left: "50%", bottom: -6, transform: "translateX(-50%)",
        width: 240, height: 28, borderRadius: "50%",
        background: "radial-gradient(ellipse at center, rgba(0,0,0,0.28), rgba(0,0,0,0) 70%)",
        filter: "blur(2px)",
      }} />
      {/* Outer ring */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: 230, height: 290, borderRadius: "50%",
        background: `
          radial-gradient(ellipse 60% 35% at 50% 18%, ${spec} 0%, transparent 55%),
          linear-gradient(180deg, ${light} 0%, ${mid} 50%, ${dark} 100%)
        `,
        boxShadow: `inset 0 -10px 28px rgba(0,0,0,0.35), inset 0 10px 24px rgba(255,255,255,0.45), 0 18px 40px rgba(0,0,0,0.18)`,
      }} />
      {/* Inner cutout — use the stage backdrop color */}
      <div style={{
        position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
        width: 158, height: 222, borderRadius: "50%",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 60%),
          radial-gradient(ellipse at 50% 80%, #e8dfce 0%, #d6cab2 60%, #c1b393 100%)
        `,
        boxShadow: `inset 0 0 28px rgba(0,0,0,0.28), inset 0 -6px 12px rgba(255,255,255,0.25)`,
      }} />

      {/* Band highlights — a horizontal sheen line near top */}
      <div style={{
        position: "absolute", left: "50%", top: "calc(50% - 110px)", transform: "translateX(-50%)",
        width: 200, height: 10, borderRadius: "50%",
        background: `radial-gradient(ellipse at center, ${spec}, rgba(255,255,255,0) 70%)`,
        opacity: 0.85, pointerEvents: "none",
      }} />
    </div>
  );
}

function Ring({ config }) {
  const metal = METAL_PALETTE[config.metal];
  const montura = MONTURAS.find(m => m.id === config.montura);

  // Gem size in px scales by carat (0.5 to 3.0)  →  ~46px to ~120px
  const baseSize = 46 + (config.carat - 0.5) * (74 / 2.5);
  // Slight reduction for halo/three-stones so the central gem doesn't overflow
  const centralSize = config.montura === "halo" ? baseSize * 0.82
                    : config.montura === "tres-piedras" ? baseSize * 0.92
                    : baseSize;

  return (
    <div className="relative" style={{ filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.18))" }}>
      <Band metal={metal} montura={montura.id} />

      {/* Setting cluster sits above the top of the band */}
      <div style={{
        position: "absolute",
        left: "50%",
        top: "calc(50% - 145px)",   // above the band
        transform: "translate(-50%, -50%)",
        width: 240, height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 2,
      }}>
        {/* Side stones first (behind) */}
        {config.montura === "tres-piedras" && (
          <SideStones shape={config.shape} sizePx={centralSize} gap={6} />
        )}

        {/* Halo (behind central gem) */}
        {config.montura === "halo" && (
          <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", width: centralSize * 1.7, height: centralSize * 1.7 }}>
            <Halo shape={config.shape} sizePx={centralSize * 1.0} />
          </div>
        )}

        {/* Central gem */}
        <div style={{ position: "relative", width: centralSize * 1.1, height: centralSize * 1.4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Gem shape={config.shape} sizePx={centralSize} />
          <Prongs shape={config.shape} sizePx={centralSize} metal={metal} />
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Ring, METAL_PALETTE, SHAPES, MONTURAS });
