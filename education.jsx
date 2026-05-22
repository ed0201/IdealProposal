// Education tab — 4Cs interactive modules + metals table.

const { useState: useStateEdu, useEffect: useEffectEdu } = React;

const COLOR_GRADES = [
  // D-F: incoloro · G-J: casi incoloro · K-M: leve tonalidad · N-R: muy leve amarillo · S-Z: tonalidad amarilla
  { letter: "D", label: "Incoloro",        tint: "#ffffff" },
  { letter: "E", label: "Incoloro",        tint: "#fdfdf8" },
  { letter: "F", label: "Incoloro",        tint: "#fcfbf2" },
  { letter: "G", label: "Casi incoloro",   tint: "#faf6e3" },
  { letter: "H", label: "Casi incoloro",   tint: "#f9f2d4" },
  { letter: "I", label: "Casi incoloro",   tint: "#f7eec4" },
  { letter: "J", label: "Casi incoloro",   tint: "#f5e9b2" },
  { letter: "K", label: "Leve color",      tint: "#f3e1a0" },
  { letter: "L", label: "Leve color",      tint: "#f0d98c" },
  { letter: "M", label: "Leve color",      tint: "#ecd078" },
  { letter: "N", label: "Muy leve amarillo", tint: "#e8c660" },
  { letter: "O", label: "Muy leve amarillo", tint: "#e3bb4c" },
  { letter: "P", label: "Muy leve amarillo", tint: "#ddb03c" },
  { letter: "Q", label: "Muy leve amarillo", tint: "#d7a52e" },
  { letter: "R", label: "Muy leve amarillo", tint: "#d09a22" },
  { letter: "S", label: "Tonalidad amarilla", tint: "#c98e18" },
  { letter: "T", label: "Tonalidad amarilla", tint: "#c08412" },
  { letter: "U", label: "Tonalidad amarilla", tint: "#b87a0d" },
  { letter: "V", label: "Tonalidad amarilla", tint: "#b07009" },
  { letter: "W", label: "Tonalidad amarilla", tint: "#a86606" },
  { letter: "X", label: "Tonalidad amarilla", tint: "#a05c03" },
  { letter: "Y", label: "Tonalidad amarilla", tint: "#985300" },
  { letter: "Z", label: "Tonalidad amarilla", tint: "#904a00" },
];

const CLARITY_GRADES = [
  { id: "FL",   name: "FL",   sub: "Flawless",            desc: "Sin inclusiones visibles bajo aumento 10×. Extremadamente raro." },
  { id: "IF",   name: "IF",   sub: "Internally Flawless", desc: "Inclusiones internas ausentes; pueden existir marcas externas mínimas." },
  { id: "VVS1", name: "VVS1", sub: "Very Very Slight",    desc: "Inclusiones difíciles de detectar incluso por un gemólogo experimentado." },
  { id: "VVS2", name: "VVS2", sub: "Very Very Slight",    desc: "Inclusiones diminutas, casi imperceptibles a 10×." },
  { id: "VS1",  name: "VS1",  sub: "Very Slight",         desc: "Inclusiones pequeñas, requieren esfuerzo para verse a 10×." },
  { id: "VS2",  name: "VS2",  sub: "Very Slight",         desc: "Inclusiones menores visibles bajo aumento." },
  { id: "SI1",  name: "SI1",  sub: "Slight Included",     desc: "Inclusiones notables bajo aumento; típicamente no visibles a simple vista." },
  { id: "SI2",  name: "SI2",  sub: "Slight Included",     desc: "Inclusiones visibles a 10×; ocasionalmente perceptibles sin aumento." },
  { id: "I1",   name: "I1",   sub: "Included",            desc: "Inclusiones evidentes que pueden afectar la transparencia." },
  { id: "I2",   name: "I2",   sub: "Included",            desc: "Inclusiones notorias que afectan brillo y durabilidad." },
  { id: "I3",   name: "I3",   sub: "Included",            desc: "Inclusiones obvias que comprometen estructura y brillo." },
];

const CUT_GRADES = [
  { id: "excellent", name: "Excellent", brilliance: 100, label: "Máximo brillo y centelleo" },
  { id: "very-good", name: "Very Good", brilliance: 88,  label: "Brillo superior con leve pérdida de luz" },
  { id: "good",      name: "Good",      brilliance: 72,  label: "Brillo agradable, buen valor" },
  { id: "fair",      name: "Fair",      brilliance: 55,  label: "Brillo limitado por proporciones" },
  { id: "poor",      name: "Poor",      brilliance: 38,  label: "Pérdida importante de luz" },
];

function SectionHeading({ kicker, title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)] mb-2">{kicker}</div>
      <h2 className="font-display text-3xl sm:text-4xl text-[var(--ink)]">{title}</h2>
      {subtitle && <p className="text-[var(--ink-2)] mt-2 max-w-prose">{subtitle}</p>}
    </div>
  );
}

// 4Cs — Carat illustrator (relative size circles)
function CaratCard() {
  const samples = [0.5, 0.75, 1.0, 1.5, 2.0, 3.0];
  const [active, setActive] = useStateEdu(1.0);
  // Two scales — smaller on mobile, fuller on desktop
  const [px, setPx] = useStateEdu(() => (ct) => 26 + ct * 22);
  useEffectEdu(() => {
    const compute = () => {
      const isSm = window.matchMedia("(max-width: 640px)").matches;
      setPx(() => (ct) => (isSm ? 18 + ct * 12 : 26 + ct * 22));
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);
  return (
    <Card kicker="C — Carat" title="Quilates · El peso de la gema">
      <p className="text-[14px] leading-relaxed text-[var(--ink-2)] mb-5">
        Un quilate equivale a <em>0.2 gramos</em>. El precio crece de forma exponencial: un diamante de 2 ct cuesta mucho más que dos de 1 ct, porque las gemas grandes son significativamente más escasas.
      </p>
      <div className="flex items-end justify-between gap-1 sm:gap-2 mb-3 overflow-x-auto no-scrollbar">
        {samples.map(ct => (
          <button key={ct} onClick={() => setActive(ct)}
            className="flex flex-col items-center gap-2 group shrink-0">
            <div
              className="rounded-full transition-all duration-200"
              style={{
                width: px(ct), height: px(ct),
                background: `radial-gradient(circle at 35% 30%, #ffffff 0%, rgba(255,255,255,0) 30%), conic-gradient(from 0deg, #e8edf5, #ffffff, #c4cee0, #ffffff, #e8edf5)`,
                boxShadow: active === ct
                  ? "0 0 0 2px var(--ink), 0 6px 18px rgba(0,0,0,0.2)"
                  : "0 3px 10px rgba(0,0,0,0.12)",
              }}
            />
            <span className={`text-[10px] sm:text-[11px] tabular-nums ${active===ct?"text-[var(--ink)]":"text-[var(--muted)]"}`}>{ct.toFixed(2)} ct</span>
          </button>
        ))}
      </div>
      <div className="text-[11px] tracking-wider2 uppercase text-[var(--muted)] text-center">
        El diámetro visible no escala linealmente con el peso.
      </div>
    </Card>
  );
}

// 4Cs — Color slider D→Z
function ColorCard() {
  const [idx, setIdx] = useStateEdu(0); // D
  const grade = COLOR_GRADES[idx];

  return (
    <Card kicker="C — Color" title="Color · De incoloro a amarillo">
      <p className="text-[14px] leading-relaxed text-[var(--ink-2)] mb-5">
        El GIA clasifica el color de la <strong>D</strong> (totalmente incoloro) a la <strong>Z</strong> (tonalidad amarilla evidente). Cuanto más cerca de la D, más raro y costoso.
      </p>

      <div className="flex items-center justify-center mb-5">
        <div className="relative" style={{ width: 160, height: 160 }}>
          <div
            style={{
              position: "absolute", inset: 0,
              clipPath: "circle(50% at 50% 50%)",
              background: `
                radial-gradient(circle at 38% 30%, #ffffff 0%, rgba(255,255,255,0) 28%),
                conic-gradient(from 0deg,
                  ${grade.tint}, #ffffff, ${grade.tint}, #ffffff,
                  ${grade.tint}, #ffffff, ${grade.tint}, #ffffff, ${grade.tint})
              `,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18), inset 0 0 18px rgba(0,0,0,0.25)",
              transition: "background .2s ease",
            }}
          />
        </div>
      </div>

      <input type="range" min="0" max={COLOR_GRADES.length - 1} step="1"
        value={idx} onChange={(e) => setIdx(parseInt(e.target.value))}
        className="color-grade" />

      <div className="flex items-baseline justify-between mt-3">
        <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)]">D · Incoloro</div>
        <div className="text-center">
          <div className="font-display text-3xl leading-none">{grade.letter}</div>
          <div className="text-[10px] tracking-wider2 uppercase text-[var(--muted)] mt-1">{grade.label}</div>
        </div>
        <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)]">Z · Amarillo</div>
      </div>
    </Card>
  );
}

// 4Cs — Clarity scale (vertical chips with description)
function ClarityCard() {
  const [active, setActive] = useStateEdu("VS1");
  const cur = CLARITY_GRADES.find(c => c.id === active);
  return (
    <Card kicker="C — Clarity" title="Pureza · Inclusiones internas">
      <p className="text-[14px] leading-relaxed text-[var(--ink-2)] mb-5">
        Una escala que mide la presencia de inclusiones (imperfecciones internas) y manchas (externas). La mayoría son invisibles a simple vista a partir de <strong>SI1</strong>.
      </p>
      <div className="grid grid-cols-6 sm:grid-cols-11 gap-1 mb-4">
        {CLARITY_GRADES.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            data-active={active === c.id}
            className="chip py-2 text-[10px] tracking-wider2 uppercase">
            {c.name}
          </button>
        ))}
      </div>
      <div className="bg-[#fffdf8] border border-[var(--line)] p-4">
        <div className="flex items-baseline gap-3 mb-1">
          <span className="font-display text-2xl">{cur.name}</span>
          <span className="text-[11px] tracking-wider2 uppercase text-[var(--muted)]">{cur.sub}</span>
        </div>
        <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">{cur.desc}</p>
      </div>
    </Card>
  );
}

// 4Cs — Cut brilliance bar
function CutCard() {
  const [active, setActive] = useStateEdu("excellent");
  const cur = CUT_GRADES.find(c => c.id === active);
  return (
    <Card kicker="C — Cut" title="Corte · La fuente del brillo">
      <p className="text-[14px] leading-relaxed text-[var(--ink-2)] mb-5">
        El corte determina cómo la luz entra, rebota dentro y vuelve a salir de la gema. Un corte excelente puede hacer que un diamante de menor peso luzca más que uno mayor mal proporcionado.
      </p>
      <div className="flex flex-col gap-2 mb-4">
        {CUT_GRADES.map(c => (
          <button key={c.id} onClick={() => setActive(c.id)}
            data-active={active === c.id}
            className="chip py-3 px-4 text-left flex items-center gap-4">
            <div className="w-20 font-display text-[15px]">{c.name}</div>
            <div className="flex-1 h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--ink)]" style={{ width: `${c.brilliance}%` }}></div>
            </div>
            <div className="text-[11px] tabular-nums text-[var(--muted)] w-10 text-right">{c.brilliance}%</div>
          </button>
        ))}
      </div>
      <div className="text-[12px] text-[var(--ink-2)] italic">{cur.label}</div>
    </Card>
  );
}

function Card({ kicker, title, children }) {
  return (
    <details className="lux bg-[#fffdf8] border border-[var(--line)]" open={kicker === "C — Carat"}>
      <summary className="flex items-center justify-between p-4 sm:p-6 group gap-3">
        <div className="min-w-0">
          <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)] mb-1">{kicker}</div>
          <h3 className="font-display text-xl sm:text-2xl text-[var(--ink)]">{title}</h3>
        </div>
        <span className="chev text-2xl font-display text-[var(--ink)] leading-none shrink-0">+</span>
      </summary>
      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-0">{children}</div>
    </details>
  );
}

function MetalsTable() {
  const rows = [
    {
      metal: "Oro 14K",
      composition: "58.5% oro puro",
      hardness: "Vickers 150",
      durability: "Alta — resiste rasguños cotidianos",
      maintenance: "Pulido cada 2–3 años",
      hypo: "Puede contener níquel; verificar aleación",
      price: "$$",
    },
    {
      metal: "Oro 18K",
      composition: "75% oro puro",
      hardness: "Vickers 125",
      durability: "Media-alta — más suave que 14K",
      maintenance: "Pulido cada 1–2 años",
      hypo: "Más hipoalergénico que 14K",
      price: "$$$",
    },
    {
      metal: "Platino",
      composition: "95% platino puro",
      hardness: "Vickers 130 (más denso)",
      durability: "Máxima — el metal se desplaza, no se pierde",
      maintenance: "Rodinado nunca, pulido ocasional",
      hypo: "Hipoalergénico por excelencia",
      price: "$$$$",
    },
  ];
  const cols = [
    { key: "composition",  label: "Pureza" },
    { key: "hardness",     label: "Dureza" },
    { key: "durability",   label: "Durabilidad" },
    { key: "maintenance",  label: "Mantenimiento" },
    { key: "hypo",         label: "Hipoalergénico" },
    { key: "price",        label: "Precio" },
  ];
  return (
    <>
      {/* Desktop / tablet — wide table */}
      <div className="hidden md:block bg-[#fffdf8] border border-[var(--line)] overflow-hidden">
        <div className="grid grid-cols-[1.1fr_1fr_1fr_1.4fr_1.2fr_1.3fr_0.6fr] text-[10px] tracking-luxe uppercase text-[var(--muted)] border-b border-[var(--line)]">
          {["Metal","Pureza","Dureza","Durabilidad","Mantenimiento","Hipoalergénico","Precio"].map(h => (
            <div key={h} className="px-4 py-3">{h}</div>
          ))}
        </div>
        {rows.map((r) => (
          <div key={r.metal}
            className="grid grid-cols-[1.1fr_1fr_1fr_1.4fr_1.2fr_1.3fr_0.6fr] text-[13px] border-b border-[var(--line)] last:border-b-0"
          >
            <div className="px-4 py-5 font-display text-xl text-[var(--ink)]">{r.metal}</div>
            <div className="px-4 py-5 text-[var(--ink-2)]">{r.composition}</div>
            <div className="px-4 py-5 text-[var(--ink-2)]">{r.hardness}</div>
            <div className="px-4 py-5 text-[var(--ink-2)]">{r.durability}</div>
            <div className="px-4 py-5 text-[var(--ink-2)]">{r.maintenance}</div>
            <div className="px-4 py-5 text-[var(--ink-2)]">{r.hypo}</div>
            <div className="px-4 py-5 font-display text-lg tabular-nums text-[var(--ink)]">{r.price}</div>
          </div>
        ))}
      </div>

      {/* Mobile — stacked cards */}
      <div className="md:hidden space-y-4">
        {rows.map((r) => (
          <div key={r.metal} className="bg-[#fffdf8] border border-[var(--line)] p-5">
            <div className="flex items-baseline justify-between mb-3">
              <h4 className="font-display text-2xl text-[var(--ink)]">{r.metal}</h4>
              <span className="font-display text-lg tabular-nums text-[var(--ink)]">{r.price}</span>
            </div>
            <dl className="space-y-2">
              {cols.slice(0, 5).map(c => (
                <div key={c.key} className="grid grid-cols-[110px_1fr] gap-3 text-[13px]">
                  <dt className="text-[10px] tracking-luxe uppercase text-[var(--muted)] pt-0.5">{c.label}</dt>
                  <dd className="text-[var(--ink-2)]">{r[c.key]}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </>
  );
}

function Education() {
  return (
    <div className="overflow-y-auto no-scrollbar h-full">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 py-8 sm:py-12">

        <SectionHeading
          kicker="Aprende antes de comprar"
          title="Las 4Cs del Diamante"
          subtitle="Cuatro factores definen el valor y la belleza de cada diamante. Comprenderlos te permite elegir con seguridad — no por marca, sino por mérito."
        />

        <div className="space-y-4 mb-16">
          <CaratCard />
          <ColorCard />
          <ClarityCard />
          <CutCard />
        </div>

        <div className="hr-line my-12"></div>

        <SectionHeading
          kicker="Guía de Metales"
          title="Oro 14K · Oro 18K · Platino"
          subtitle="Cada metal tiene un balance distinto entre dureza, color, peso y mantenimiento. Esta tabla compara lo que importa para un anillo de uso diario."
        />
        <MetalsTable />

        <div className="hr-line my-12"></div>

        <SectionHeading
          kicker="Consejo del Atelier"
          title="Cómo priorizar las 4Cs"
        />
        <div className="grid md:grid-cols-2 gap-5">
          <Tip n="01" title="Empieza por el Corte">
            Es el único factor controlado por el ser humano y el que más impacta el brillo percibido. Antes que tamaño o pureza, prioriza un corte <em>Excellent</em>.
          </Tip>
          <Tip n="02" title="Color G–H es el punto dulce">
            A simple vista resultan indistinguibles de un D, con un ahorro significativo que puedes invertir en mayor tamaño o mejor corte.
          </Tip>
          <Tip n="03" title="Pureza VS2–SI1 sin sacrificio visual">
            Las inclusiones a este nivel rara vez son visibles sin aumento. No pagues por una pureza que solo verá un gemólogo.
          </Tip>
          <Tip n="04" title="Considera el Laboratorio">
            Idéntica composición química y propiedades ópticas que un natural, con ~65% menos costo. Permite acceder a quilates o calidades superiores.
          </Tip>
        </div>

        <div className="mt-16 pb-8 text-center">
          <div className="text-[10px] tracking-luxe uppercase text-[var(--muted)]">IdealProposal · Atelier de Joyería</div>
          <div className="font-display text-xl mt-1 italic">"Una piedra entendida brilla por dos."</div>
        </div>
      </div>
    </div>
  );
}

function Tip({ n, title, children }) {
  return (
    <div className="bg-[#fffdf8] border border-[var(--line)] p-6">
      <div className="flex items-baseline gap-3 mb-2">
        <span className="font-display text-2xl text-[var(--gold)] italic">{n}</span>
        <h4 className="font-display text-xl text-[var(--ink)]">{title}</h4>
      </div>
      <p className="text-[13px] text-[var(--ink-2)] leading-relaxed">{children}</p>
    </div>
  );
}

Object.assign(window, { Education });
