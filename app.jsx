// Main app — tab shell + header.

const { useState: useAppState } = React;

function Header({ tab, setTab }) {
  return (
    <header className="bg-[var(--bone)] border-b border-[var(--line)] sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-10 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        {/* Wordmark */}
        <div className="flex items-baseline gap-3">
          <div className="font-display text-xl sm:text-2xl tracking-wide text-[var(--ink)]">IdealProposal</div>
          <div className="hidden md:block text-[10px] tracking-luxe uppercase text-[var(--muted)]">Atelier de Joyería Fina · México</div>
        </div>

        {/* Tabs */}
        <nav className="flex items-center gap-4 sm:gap-8 border-b border-transparent">
          {[
            { id: "configurator", label: "Configurador" },
            { id: "education",    label: "Guía de Educación" },
          ].map(t => (
            <button key={t.id}
              onClick={() => setTab(t.id)}
              data-active={tab === t.id}
              className="tab-btn py-2 text-[10px] sm:text-[11px] tracking-luxe uppercase text-[var(--ink)] hover:text-black transition whitespace-nowrap"
              style={{ opacity: tab === t.id ? 1 : 0.55 }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Trailing meta */}
        <div className="hidden lg:flex items-center gap-5 text-[10px] tracking-luxe uppercase text-[var(--muted)]">
          <span>MXN</span>
          <span className="w-px h-3 bg-[var(--line)]"></span>
          <span>Polanco · CDMX</span>
        </div>
      </div>
    </header>
  );
}

function App() {
  const [tab, setTab] = useAppState("configurator");
  return (
    <div className="h-full flex flex-col">
      <Header tab={tab} setTab={setTab} />
      <main className="flex-1 min-h-0 overflow-auto">
        {tab === "configurator" ? <Configurator /> : <Education />}
      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
