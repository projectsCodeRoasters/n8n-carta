import { useState, useEffect } from "react";

// ─── Allergen emoji map ───────────────────────────────────────────────────────
const ALLERGEN_MAP = {
  gluten:     { icon: "🌾", label: "Gluten" },
  lacteos:    { icon: "🥛", label: "Lácteos" },
  huevo:      { icon: "🥚", label: "Huevo" },
  pescado:    { icon: "🐟", label: "Pescado" },
  mariscos:   { icon: "🦐", label: "Mariscos" },
  cacahuetes: { icon: "🥜", label: "Cacahuetes" },
  frutos_secos:{ icon: "🌰", label: "Frutos secos" },
  soja:       { icon: "🫘", label: "Soja" },
  apio:       { icon: "🌿", label: "Apio" },
  mostaza:    { icon: "🌱", label: "Mostaza" },
  sesamo:     { icon: "⚪", label: "Sésamo" },
  sulfitos:   { icon: "🍷", label: "Sulfitos" },
  moluscos:   { icon: "🐚", label: "Moluscos" },
  altramuces: { icon: "🌼", label: "Altramuces" },
};

function parseAllergens(raw) {
  if (!raw) return [];
  return raw
    .split(/[,;\/]/)
    .map((s) => s.trim().toLowerCase().replace(/\s+/g, "_"))
    .filter((s) => ALLERGEN_MAP[s]);
}

// ─── Single dish card ─────────────────────────────────────────────────────────
function DishCard({ item, index }) {
  const [imgError, setImgError] = useState(false);
  const allergens = parseAllergens(item.alergenos);

  return (
    <article
      className="dish-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {item.foto && !imgError ? (
        <div className="dish-img-wrap">
          <img
            src={item.foto}
            alt={item.nombre}
            className="dish-img"
            onError={() => setImgError(true)}
          />
        </div>
      ) : (
        <div className="dish-img-placeholder">
          <span>🍽️</span>
        </div>
      )}

      <div className="dish-body">
        <div className="dish-header">
          <h3 className="dish-name">{item.nombre}</h3>
          <span className="dish-price">{item.precio}</span>
        </div>

        {item.descripcion && (
          <p className="dish-desc">{item.descripcion}</p>
        )}

        {allergens.length > 0 && (
          <div className="dish-allergens">
            {allergens.map((key) => (
              <span
                key={key}
                className="allergen-badge"
                title={ALLERGEN_MAP[key].label}
                aria-label={ALLERGEN_MAP[key].label}
              >
                {ALLERGEN_MAP[key].icon}
                <span className="allergen-label">{ALLERGEN_MAP[key].label}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Category section ─────────────────────────────────────────────────────────
function CategorySection({ category, items }) {
  return (
    <section className="category-section">
      <h2 className="category-title">
        <span>{category}</span>
      </h2>
      <div className="dishes-grid">
        {items.map((item, i) => (
          <DishCard key={item.nombre + i} item={item} index={i} />
        ))}
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
// Props:
//   menuData  → array of objects from Google Sheets
//   restaurantName → string, name shown in header
//   logoUrl   → optional logo image URL
export default function CartaRestaurante({
  menuData = [],
  restaurantName = "Nuestra Carta",
  logoUrl = null,
}) {
  // Group by category if column exists, else show all flat
  const categories = menuData.reduce((acc, item) => {
    const cat = item.categoria || "Platos";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const [activeFilter, setActiveFilter] = useState("all");
  const categoryKeys = Object.keys(categories);

  const displayedCategories =
    activeFilter === "all"
      ? categories
      : { [activeFilter]: categories[activeFilter] };

  return (
    <>
      <style>{CSS}</style>
      <div className="carta-root">
        {/* Header */}
        <header className="carta-header">
          <div className="header-inner">
            {logoUrl && (
              <img src={logoUrl} alt="logo" className="header-logo" />
            )}
            <h1 className="header-title">{restaurantName}</h1>
            <p className="header-tagline">Carta de temporada</p>
          </div>
          <div className="header-wave" aria-hidden="true">
            <svg viewBox="0 0 1200 60" preserveAspectRatio="none">
              <path
                d="M0,30 C300,60 900,0 1200,30 L1200,60 L0,60 Z"
                fill="var(--bg)"
              />
            </svg>
          </div>
        </header>

        {/* Filter pills */}
        {categoryKeys.length > 1 && (
          <nav className="filter-nav" aria-label="Categorías">
            <button
              className={`filter-pill ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              Todos
            </button>
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                className={`filter-pill ${activeFilter === cat ? "active" : ""}`}
                onClick={() => setActiveFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </nav>
        )}

        {/* Menu content */}
        <main className="carta-main">
          {Object.entries(displayedCategories).map(([cat, items]) => (
            <CategorySection key={cat} category={cat} items={items} />
          ))}
        </main>

        {/* Footer allergen legend */}
        <footer className="carta-footer">
          <p className="footer-allergen-title">Leyenda de alérgenos</p>
          <div className="footer-allergen-list">
            {Object.entries(ALLERGEN_MAP).map(([key, { icon, label }]) => (
              <span key={key} className="footer-allergen-item">
                {icon} {label}
              </span>
            ))}
          </div>
          <p className="footer-note">
            Si tiene alguna alergia o intolerancia, consulte con nuestro personal.
          </p>
        </footer>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');

  :root {
    --bg: #faf7f2;
    --surface: #ffffff;
    --accent: #b5451b;
    --accent-light: #f2e8e3;
    --text: #1a1612;
    --text-muted: #6b5e52;
    --border: #e8dfd6;
    --header-bg: #1a1612;
    --header-text: #faf7f2;
    --gold: #c9a84c;
    --radius: 12px;
    --shadow: 0 2px 16px rgba(26,22,18,0.08);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .carta-root {
    font-family: 'Lato', sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
  }

  /* ── Header ── */
  .carta-header {
    background: var(--header-bg);
    position: relative;
    padding: 3rem 2rem 4rem;
    text-align: center;
    overflow: hidden;
  }
  .carta-header::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 50% 120%, rgba(201,168,76,0.15) 0%, transparent 70%);
    pointer-events: none;
  }
  .header-inner { position: relative; z-index: 1; }
  .header-logo {
    width: 80px; height: 80px;
    object-fit: contain;
    border-radius: 50%;
    margin-bottom: 1rem;
    border: 2px solid var(--gold);
  }
  .header-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    color: var(--header-text);
    letter-spacing: 0.02em;
    line-height: 1.1;
  }
  .header-tagline {
    font-family: 'Lato', sans-serif;
    font-weight: 300;
    color: var(--gold);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    font-size: 0.8rem;
    margin-top: 0.5rem;
  }
  .header-wave {
    position: absolute;
    bottom: 0; left: 0; right: 0;
    height: 40px;
  }
  .header-wave svg { width: 100%; height: 100%; }

  /* ── Filter nav ── */
  .filter-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    padding: 1.5rem 1rem 0.5rem;
  }
  .filter-pill {
    padding: 0.4rem 1.2rem;
    border-radius: 999px;
    border: 1.5px solid var(--border);
    background: var(--surface);
    color: var(--text-muted);
    font-family: 'Lato', sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.2s;
  }
  .filter-pill:hover { border-color: var(--accent); color: var(--accent); }
  .filter-pill.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  /* ── Main ── */
  .carta-main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 2rem 1rem 3rem;
  }

  /* ── Category ── */
  .category-section { margin-bottom: 3rem; }
  .category-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    color: var(--text);
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .category-title::before, .category-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .category-title span { white-space: nowrap; }

  /* ── Grid ── */
  .dishes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.25rem;
  }

  /* ── Card ── */
  .dish-card {
    background: var(--surface);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    overflow: hidden;
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    animation: fadeUp 0.45s ease both;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .dish-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(26,22,18,0.13);
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .dish-img-wrap {
    width: 100%;
    aspect-ratio: 4/3;
    overflow: hidden;
  }
  .dish-img {
    width: 100%; height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  .dish-card:hover .dish-img { transform: scale(1.04); }

  .dish-img-placeholder {
    width: 100%;
    aspect-ratio: 4/3;
    background: var(--accent-light);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
  }

  .dish-body {
    padding: 1rem 1.1rem 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .dish-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 0.5rem;
  }

  .dish-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text);
    line-height: 1.3;
    flex: 1;
  }

  .dish-price {
    font-family: 'Lato', sans-serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--accent);
    white-space: nowrap;
  }

  .dish-desc {
    font-size: 0.85rem;
    color: var(--text-muted);
    line-height: 1.55;
    font-weight: 300;
  }

  .dish-allergens {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin-top: auto;
    padding-top: 0.5rem;
    border-top: 1px solid var(--border);
  }

  .allergen-badge {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    background: var(--accent-light);
    border-radius: 999px;
    padding: 0.15rem 0.5rem;
    font-size: 0.72rem;
    color: var(--accent);
    font-weight: 700;
    cursor: default;
  }
  .allergen-label { font-size: 0.68rem; }

  /* ── Footer ── */
  .carta-footer {
    background: var(--header-bg);
    color: var(--header-text);
    padding: 2rem 1.5rem;
    text-align: center;
  }
  .footer-allergen-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    color: var(--gold);
    margin-bottom: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.75rem;
  }
  .footer-allergen-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem 1.2rem;
    max-width: 700px;
    margin: 0 auto 1rem;
  }
  .footer-allergen-item {
    font-size: 0.78rem;
    color: #c9b9aa;
  }
  .footer-note {
    font-size: 0.75rem;
    color: #6b5e52;
    font-style: italic;
  }

  /* ── Responsive ── */
  @media (max-width: 480px) {
    .dishes-grid { grid-template-columns: 1fr; }
    .carta-header { padding: 2rem 1rem 3rem; }
  }
`;