// Configurator tab — control panel + dynamic pricer.

const { useState, useMemo, useEffect, useRef } = React;

// Inline SVG icons for montaras and shapes — tiny, monochrome, luxe.
const Icon = {
  Solitario: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="22" r="6.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M11 13l5-5 5 5-5 4z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none"/>
    </svg>
  ),
  Halo: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="22" r="6.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="16" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.1"/>
      {Array.from({length: 8}).map((_, i) => {
        const a = (i/8)*Math.PI*2;
        const x = 16 + Math.cos(a)*5.5; const y = 11 + Math.sin(a)*5.5;
        return <circle key={i} cx={x} cy={y} r="0.7" fill="currentColor"/>;
      })}
    </svg>
  ),
  TresPiedras: ({ size = 28 }) => (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="22" r="6.5" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="16" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.1"/>
      <circle cx="9" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
      <circle cx="23" cy="12.5" r="2" stroke="currentColor" strokeWidth="1.1"/>
    </svg>
  ),
  Round: () => <svg width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="1.1" fill="none"/></svg>,
  Princess: () => <svg width="22" height="22" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" stroke="currentColor" strokeWidth="1.1" fill="none" transform="rotate(45 12 12)"/></svg>,
  Emerald: () => <svg width="22" height="22" viewBox="0 0 24 24"><polygon points="8,4 16,4 20,8 20,16 16,20 8,20 4,16 4,8" stroke="currentColor" strokeWidth="1.1" fill="none"/></svg>,
  Oval: () => <svg width="22" height="22" viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="5.5" ry="8" stroke="currentColor" strokeWidth="1.1" fill="none"/></svg>,
};

const SHAPE_ICONS = { round: Icon.Round, princess: Icon.Princess, emerald: Icon.Emerald, oval: Icon.Oval };

// Metal palette swatches for the metal chips
const METAL_SWATCHES = [
  { id: "white-14k",  label: "Oro Blanco",   karat: "14K", swatch: ["#fbfaf6", "#dad4c6"] },
  { id: "yellow-14k", label: "Oro Amarillo", karat: "14K", swatch: ["#f9e6a8", "#d5ab47"] },
  { id: "rose-14k",   label: "Oro Rosa",     karat: "14K", swatch: ["#f6cdb6", "#cf8666"] },
  { id: "white-18k",  label: "Oro Blanco",   karat: "18K", swatch: ["#fdfcf8", "#e0d9c8"] },
  { id: "yellow-18k", label: "Oro Amarillo", karat: "18K", swatch: ["#ffe88a", "#e0a316"] },
  { id: "rose-18k",   label: "Oro Rosa",     karat: "18K", swatch: ["#f9c5a5", "#d77a4d"] },
  { id: "platinum",   label: "Platino",      karat: "950", swatch: ["#f4f3ef", "#c9c8c1"] },
];

// MXN formatter
const fmt = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(Math.round(n));

function priceCalc(config) {
  const metal = METAL_PALETTE[config.metal];
  const montura = MONTURAS.find(m => m.id === config.montura);
  const shape = SHAPES.find(s => s.id === config.shape);

  // Base montura
  const baseMontura = montura.base;

  // Metal cost: weight * pricePerGram. Halo & three-stones add a touch more weight (extra mounting).
  const weightMultiplier = config.montura === "halo" ? 1.10 : config.montura === "tres-piedras" ? 1.15 : 1.00;
  const metalCost = metal.weightG * metal.pricePerG * weightMultiplier;

  // Gem cost — exponential in carat.
  // Natural diamond reference (rough MX market): ~ MXN 95,000 per carat at 1.0ct,
  // scaling roughly with carat^2.0.
  const naturalBase = 95000;
  let gemCost = naturalBase * Math.pow(config.carat, 2.0) * shape.factor;

  // Halo + three-stones include accent stones (~0.30ct total extra)
  if (config.montura === "halo") gemCost += 9500;
  if (config.montura === "tres-piedras") gemCost += 22000;

  // Lab-grown discount ~ 65%
  if (config.origin === "lab") gemCost *= 0.35;

  const subtotal = baseMontura + metalCost + gemCost;
  // Light setting/labor fee
  const labor = 3500 + 0.04 * subtotal;
  const total = subtotal + labor;

  return {
    baseMontura, metalCost, gemCost, labor, total,
  };
}

function StepLabel({ n, title, hint }) {
  return (
    <div className="flex items-start gap-3 mb-3">
      <span className="font-display text-2xl text-[var(--ink)] leading-none mt-1 shrink-0" style={{ fontStyle: "italic" }}>
        {n}.
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-xl text-[var(--ink)] leading-tight">{title}</h3>
        {hint && <p className="text-[11px] tracking-wider2 uppercase text-[var(--muted)] mt-1">{hint}</p>}
      </div>
    </div>
  );
}

function Configurator() {
  const [config, setConfig] = useState({
    montura: "solitario",
    metal: "white-18k",
    shape: "round",
    origin: "natural",
    carat: 1.0,
  });

  const set = (k, v) => setConfig(c => ({ ...c, [k]: v }));
  const price = useMemo(() => priceCalc(config), [config]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_minmax(360px,460px)] gap-0 h-full lg:min-h-[640px]">
      {/* ── Left: visualizer stage ─────────────────────────────────────── */}
      <div className="relative stage-bg border-b lg:border-b-0 lg:border-r border-[var(--line)] flex items-center justify-center overflow-hidden min-h-[440px] sm:min-h-[520px] lg:min-h-[560px]">
        {/* Stage frame */}
        <div className="absolute inset-3 sm:inset-6 border border-[var(--line)] pointer-events-none"></div>
        <div className="hidden sm:block absolute top-8 left-8 text-[10px] tracking-luxe uppercase text-[var(--muted)]">IdealProposal · Atelier</div>
        <div className="hidden sm:block absolute top-8 right-8 text-[10px] tracking-luxe uppercase text-[var(--muted)]">Vista Frontal</div>
        <div className="hidden sm:block absolute bottom-8 left-8 text-[10px] tracking-luxe uppercase text-[var(--muted)]">No.°{("000" + Math.round(config.carat*100)).slice(-4)}-{config.shape.slice(0,2).toUpperCase()}</div>
        <div className="hidden sm:block absolute bottom-8 right-8 text-[10px] tracking-luxe uppercase text-[var(--muted)]">Render en tiempo real</div>

        <div className="flex flex-col items-stretch gap-2 w-full h-full justify-center anim-in" key={`${config.montura}`}>
          <ModelViewer config={config} />
          <div className="text-center mt-2">
            <div className="text-[11px] tracking-wider2 uppercase text-[var(--muted)]">
              {config.origin === "lab" ? "Diamante de Laboratorio" : "Diamante Natural"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: panel ───────────────────────────────────────────────── */}
      <div className="overflow-y-auto no-scrollbar p-5 sm:p-8 lg:p-10">
        <div className="max-w-md mx-auto space-y-9">

          {/* Step 1 — Montura */}
          <section>
            <StepLabel n="I" title="Selección de Montura" hint="Estilo del engaste" />
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "solitario",    label: "Solitario",    Icon: Icon.Solitario,    sub: "El clásico atemporal" },
                { id: "halo",         label: "Halo",         Icon: Icon.Halo,         sub: "Brillo amplificado" },
                { id: "tres-piedras", label: "Tres Piedras", Icon: Icon.TresPiedras,  sub: "Pasado · Presente · Futuro" },
              ].map(({ id, label, Icon: IC, sub }) => (
                <button key={id} onClick={() => set("montura", id)}
                  data-active={config.montura === id}
                  className="chip rounded-sm py-4 px-3 text-left">
                  <div className="text-[var(--ink)] mb-2 flex justify-center"><IC /></div>
                  <div className="font-display text-base leading-tight">{label}</div>
                  <div className="text-[10px] text-[var(--muted)] tracking-wider2 uppercase mt-1">{sub}</div>
                </button>
              ))}
            </div>
          </section>

          <div className="hr-line"></div>

          {/* Step 2 — Metal */}
          <section>
            <StepLabel n="II" title="Metal" hint="Quilataje y tonalidad" />
            <div className="grid grid-cols-3 gap-2">
              {METAL_SWATCHES.map(m => (
                <button key={m.id} onClick={() => set("metal", m.id)}
                  data-active={config.metal === m.id}
                  className="chip rounded-sm py-3 px-2.5 text-left">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="w-5 h-5 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${m.swatch[0]} 0%, ${m.swatch[1]} 100%)`,
                        boxShadow: "0 1px 2px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.6)"
                      }} />
                    <span className="font-display text-[15px] leading-none">{m.karat}</span>
                  </div>
                  <div className="text-[11px] text-[var(--ink-2)] leading-tight">{m.label}</div>
                </button>
              ))}
            </div>
          </section>

          <div className="hr-line"></div>

          {/* Step 3 — Gem */}
          <section>
            <StepLabel n="III" title="Gema Central" hint="Forma · Origen · Quilates" />

            {/* Shape */}
            <div className="mb-5">
              <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)] mb-2">Forma</div>
              <div className="grid grid-cols-4 gap-2">
                {SHAPES.map(s => {
                  const IC = SHAPE_ICONS[s.id];
                  return (
                    <button key={s.id} onClick={() => set("shape", s.id)}
                      data-active={config.shape === s.id}
                      className="chip rounded-sm py-3 px-2 flex flex-col items-center gap-1.5">
                      <IC />
                      <span className="text-[11px]">{s.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Origin */}
            <div className="mb-5">
              <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)] mb-2">Origen</div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => set("origin", "natural")}
                  data-active={config.origin === "natural"}
                  className="chip rounded-sm py-3 px-3 text-left">
                  <div className="font-display text-[15px]">Natural</div>
                  <div className="text-[10px] text-[var(--muted)] tracking-wider2 uppercase mt-0.5">Formado en la tierra</div>
                </button>
                <button onClick={() => set("origin", "lab")}
                  data-active={config.origin === "lab"}
                  className="chip rounded-sm py-3 px-3 text-left">
                  <div className="font-display text-[15px]">Laboratorio</div>
                  <div className="text-[10px] text-[var(--muted)] tracking-wider2 uppercase mt-0.5">Misma composición · ~65% menos</div>
                </button>
              </div>
            </div>

            {/* Carat slider */}
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)]">Quilates</div>
                <div className="font-display text-2xl tabular-nums">{config.carat.toFixed(2)}<span className="text-[var(--muted)] text-base"> ct</span></div>
              </div>
              <input type="range" min="0.5" max="3.0" step="0.1"
                value={config.carat}
                onChange={(e) => set("carat", parseFloat(e.target.value))}
                className="lux" />
              <div className="flex justify-between text-[10px] text-[var(--muted)] tracking-wider2 uppercase mt-1.5">
                <span>0.50 ct</span><span>1.50 ct</span><span>3.00 ct</span>
              </div>
            </div>
          </section>

          <div className="hr-line"></div>

          {/* Step 4 — Cotizador */}
          <section>
            <StepLabel n="IV" title="Cotización" hint="Precio estimado de mercado · MXN" />

            <div className="bg-[#fffdf8] border border-[var(--line)] p-5 space-y-2.5">
              <Line label="Costo base de montura" value={fmt(price.baseMontura)} />
              <Line label={`Metal · ${METAL_PALETTE[config.metal].name}`} value={fmt(price.metalCost)} sub={`${METAL_PALETTE[config.metal].weightG.toFixed(1)} g × ${fmt(METAL_PALETTE[config.metal].pricePerG)}/g`} />
              <Line
                label={`Gema · ${SHAPES.find(s => s.id === config.shape).name} ${config.carat.toFixed(2)} ct`}
                value={fmt(price.gemCost)}
                sub={config.origin === "lab" ? "Diamante de laboratorio (−65%)" : "Diamante natural certificado"}
              />
              <Line label="Engaste y mano de obra" value={fmt(price.labor)} />

              <div className="h-px bg-[var(--line)] my-3"></div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)]">Total estimado</div>
                  <div className="text-[10px] tracking-wider2 uppercase text-[var(--muted)]">Precio estimado de mercado</div>
                </div>
                <div className="font-display text-4xl tabular-nums leading-none text-[var(--ink)]">
                  {fmt(price.total)}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-[var(--muted)] tracking-wider2 uppercase mt-3 leading-relaxed">
              * Estimación referencial al {new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}. Sujeto a cotización en taller, certificación GIA y disponibilidad de materia prima.
            </p>

            <button className="mt-5 w-full py-4 bg-[var(--ink)] text-[var(--bone)] font-display text-lg tracking-wider2 hover:bg-black transition-colors">
              Solicitar cita en atelier
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function Line({ label, value, sub }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-[13px] text-[var(--ink-2)]">{label}</div>
        {sub && <div className="text-[10px] text-[var(--muted)] tracking-wider2 uppercase mt-0.5">{sub}</div>}
      </div>
      <div className="text-[14px] tabular-nums text-[var(--ink)]">{value}</div>
    </div>
  );
}

// ── 3D model viewer ────────────────────────────────────────────────────────
// Wraps <model-viewer> and applies real-time material tinting based on the
// selected metal. Uses the model-viewer Materials API to recolor PBR materials.
function ModelViewer({ config }) {
  const ringRef = useRef(null);
  const gemRef = useRef(null);
  const metal = METAL_PALETTE[config.metal];

  const MODEL_SRC = {
    "solitario":    "models/ring-solitario.glb",
    "halo":         "models/ring-halo.glb",
    "tres-piedras": "models/ring-tres-piedras.glb",
  };
  const GEM_SRC = {
    round:    "models/gem-round.glb",
    princess: "models/gem-princess.glb",
    emerald:  "models/gem-emerald.glb",
    oval:     "models/gem-oval.glb",
  };
  const src = MODEL_SRC[config.montura];
  const gemSrc = GEM_SRC[config.shape];
  const shapeName = SHAPES.find(s => s.id === config.shape).name;

  // Convert "#rrggbb" → [r,g,b,1] (sRGB floats 0–1)
  const hexToRgba = (hex) => {
    const h = hex.replace("#", "");
    return [
      parseInt(h.slice(0, 2), 16) / 255,
      parseInt(h.slice(2, 4), 16) / 255,
      parseInt(h.slice(4, 6), 16) / 255,
      1,
    ];
  };

  // Detect gem-like materials (so we don't tint the central diamond on the ring model)
  const isGemMaterial = (mat) => {
    const name = (mat?.name || "").toLowerCase();
    return /diamond|gem|stone|crystal|piedra|gema|jewel|brillante/.test(name);
  };

  // Strip a texture from a TextureInfo if possible — without this, baseColorFactor
  // is multiplied with whatever texture the GLB ships with and tints look muddy.
  const clearTexture = (textureInfo) => {
    try { textureInfo?.setTexture?.(null); } catch (e) {}
  };

  const applyMetal = (mat, color) => {
    try {
      const pbr = mat.pbrMetallicRoughness;
      if (!pbr) return;
      clearTexture(pbr.baseColorTexture);
      clearTexture(pbr.metallicRoughnessTexture);
      pbr.setBaseColorFactor(color);
      pbr.setMetallicFactor?.(1.0);
      pbr.setRoughnessFactor?.(0.22);
      mat.setEmissiveFactor?.([0, 0, 0]);
    } catch (e) {
      console.warn("Metal apply failed:", e);
    }
  };

  const applyDiamond = (mat) => {
    try {
      const pbr = mat.pbrMetallicRoughness;
      if (!pbr) return;
      clearTexture(pbr.baseColorTexture);
      clearTexture(pbr.metallicRoughnessTexture);
      // Cool azure-tinted white so the gem reads against warm bone backgrounds
      pbr.setBaseColorFactor([0.74, 0.86, 1.0, 0.78]);
      pbr.setMetallicFactor?.(0.0);
      pbr.setRoughnessFactor?.(0.04);
      // Stronger blue-white emissive for fire / scintillation
      mat.setEmissiveFactor?.([0.14, 0.20, 0.32]);
      mat.setAlphaMode?.("BLEND");
      mat.setDoubleSided?.(true);
    } catch (e) {
      console.warn("Diamond apply failed:", e);
    }
  };

  // Tint the ring whenever metal OR montura changes
  useEffect(() => {
    const mv = ringRef.current;
    if (!mv) return;
    const color = hexToRgba(metal.mid);
    const apply = () => {
      const materials = mv.model?.materials;
      if (!materials || !materials.length) return;
      materials.forEach((mat) => {
        if (isGemMaterial(mat)) applyDiamond(mat);
        else applyMetal(mat, color);
      });
    };
    if (mv.model) apply();
    mv.addEventListener("load", apply);
    return () => mv.removeEventListener("load", apply);
  }, [config.metal, config.montura]);

  // Diamond look on the satellite gem model
  useEffect(() => {
    const mv = gemRef.current;
    if (!mv) return;
    const apply = () => {
      const materials = mv.model?.materials;
      if (!materials) return;
      materials.forEach(applyDiamond);
    };
    if (mv.model) apply();
    mv.addEventListener("load", apply);
    return () => mv.removeEventListener("load", apply);
  }, [config.shape]);

  const mvCommon = {
    "camera-controls": true,
    "auto-rotate": true,
    "auto-rotate-delay": "2500",
    "rotation-per-second": "18deg",
    "interaction-prompt": "none",
    "shadow-intensity": "1.1",
    "shadow-softness": "0.9",
    exposure: "1.1",
    "environment-image": "neutral",
  };

  return (
    <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3 w-full px-3 sm:px-8 py-3 sm:py-4" style={{ height: "min(440px, 60vh)" }}>
      {/* Main ring */}
      <div className="relative h-full flex flex-col overflow-hidden">
        <div className="relative flex-1 min-h-0">
          <model-viewer
            ref={ringRef}
            src={src}
            alt="Anillo de compromiso IdealProposal"
            {...mvCommon}
            camera-orbit="0deg 75deg 140%"
            min-camera-orbit="auto auto 100%"
            max-camera-orbit="auto auto 250%"
            field-of-view="48deg"
            min-field-of-view="22deg"
            max-field-of-view="60deg"
            style={{ width: "100%", height: "100%", background: "transparent" }}
          ></model-viewer>
          <div className="absolute top-2 left-2 text-[9px] tracking-luxe uppercase text-[var(--muted)] bg-[#fffdf8]/80 backdrop-blur px-2 py-1 border border-[var(--line)]">
            Arrastra para rotar
          </div>
        </div>
        <div className="text-center mt-1 px-2">
          <div className="text-[12px] tracking-luxe uppercase text-[var(--muted)]">Montura</div>
          <div className="font-display text-2xl text-[var(--ink)] leading-none mt-0.5">{MONTURAS.find(m => m.id === config.montura).name}</div>
          <div className="text-[13px] text-[var(--muted)] tabular-nums mt-1">{METAL_PALETTE[config.metal].name}</div>
        </div>
      </div>

      {/* Satellite gem viewer */}
      <div className="relative h-full flex flex-col items-stretch border-l border-[var(--line)] pl-3 overflow-hidden" key={config.shape}>
        <div className="anim-in relative w-full flex-1 min-h-0">
          <model-viewer
            ref={gemRef}
            src={gemSrc}
            alt={`Diamante ${shapeName}`}
            {...mvCommon}
            camera-orbit="20deg 70deg 140%"
            min-camera-orbit="auto auto 100%"
            max-camera-orbit="auto auto 250%"
            field-of-view="38deg"
            min-field-of-view="18deg"
            max-field-of-view="55deg"
            style={{ width: "100%", height: "100%", background: "transparent" }}
          ></model-viewer>
        </div>
        <div className="text-center mt-1 px-2">
          <div className="text-[12px] tracking-luxe uppercase text-[var(--muted)]">Corte de la gema</div>
          <div className="font-display text-2xl text-[var(--ink)] leading-none mt-0.5">{shapeName}</div>
          <div className="text-[13px] text-[var(--muted)] tabular-nums mt-1">{config.carat.toFixed(2)} ct</div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Configurator, fmt });
