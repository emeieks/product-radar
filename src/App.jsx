import { useState, useEffect } from "react";

const C = {
  bg: "#0a0905", surface: "#12100a", surface2: "#1a1710",
  border: "#2a2518", gold: "#f0b429", goldDim: "#c8952a",
  orange: "#ff6b35", purple: "#9b7fff", text: "#f0ead8",
  muted: "#6b6050", danger: "#ff4444", green: "#4ade80", blue: "#60a5fa",
};

const API = "https://unincarnate-kellie-complexionally.ngrok-free.dev";

const HEADERS = {
  "ngrok-skip-browser-warning": "true",
};

const SCAN_STEPS = [
  "📈 Google Trends FR...",
  "🇺🇸 Google Trends US...",
  "📦 Amazon Movers & Shakers...",
  "👽 Reddit...",
  "🛒 AliExpress...",
  "🔄 Analyse des données...",
];

async function checkBackend() {
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(4000), headers: HEADERS });
    return res.ok;
  } catch (e) { return false; }
}

async function fetchTrendsCompare(keywords) {
  try {
    const res = await fetch(`${API}/trends/compare?keywords=${encodeURIComponent(keywords.join(','))}`, { headers: HEADERS });
    return await res.json();
  } catch (e) { return null; }
}

async function fetchAmazonMovers(category) {
  try {
    const res = await fetch(`${API}/amazon/movers?category=${category}`, { headers: HEADERS });
    return await res.json();
  } catch (e) { return null; }
}

async function fetchReddit(query) {
  try {
    const res = await fetch(`${API}/reddit/search?q=${encodeURIComponent(query)}`, { headers: HEADERS });
    return await res.json();
  } catch (e) { return null; }
}

async function fetchAli(query) {
  try {
    const res = await fetch(`${API}/aliexpress/search?q=${encodeURIComponent(query)}`, { headers: HEADERS });
    return await res.json();
  } catch (e) { return null; }
}

// ── Build products from real data ─────────────────────────────────────────
function buildProductsFromData(trendsData, amazonData, redditData, aliData, query) {
  const products = [];

  // From Amazon Movers
  const movers = amazonData?.movers || [];
  movers.slice(0, 4).forEach((mover, i) => {
    const trendFr = trendsData?.comparison?.[query]?.fr?.current_score || 0;
    const trendUs = trendsData?.comparison?.[query]?.us?.current_score || 0;
    const gap = trendUs - trendFr;
    const advanceWeeks = Math.max(0, Math.round(gap / 8));
    const score = Math.min(98, Math.max(60, 60 + Math.round(mover.rise_percent / 10) + (gap > 0 ? 15 : 0)));

    products.push({
      name: mover.name,
      tag: mover.rise_percent > 200 ? "HOT" : "À VENIR",
      source: "amazon",
      score,
      advance_weeks: advanceWeeks,
      rise_percent: mover.rise_percent,
      price_us: mover.price,
      price_range: mover.price ? `${Math.round(parseFloat(mover.price.replace(/[^0-9.]/g, '')) * 0.92)}€ - ${Math.round(parseFloat(mover.price.replace(/[^0-9.]/g, '')) * 0.92 * 1.4)}€` : "N/A",
      trend_fr: trendFr > 0 ? `+${Math.round(trendFr)}%` : "—",
      trend_us: `+${mover.rise_percent}%`,
      google_score_fr: trendFr,
      google_score_us: trendUs,
      saturation_fr: gap > 20 ? "Quasi nulle" : gap > 0 ? "Faible" : "Modérée",
      saturation_level: gap > 20 ? "low" : gap > 0 ? "mid" : "high",
      category: mover.category,
      aliexpress_query: mover.name.toLowerCase().replace(/\s+/g, '+'),
      image_query: mover.name,
      reddit_posts: redditData?.posts?.slice(0, 3) || [],
      ali_suggestions: aliData?.suggestions || [],
    });
  });

  // From Google Trends if available
  if (trendsData?.comparison) {
    Object.entries(trendsData.comparison).forEach(([kw, data]) => {
      if (data.opportunity && products.length < 6) {
        products.push({
          name: kw.charAt(0).toUpperCase() + kw.slice(1),
          tag: "HOT",
          source: "google_trends",
          score: Math.min(98, 70 + (data.gap || 0)),
          advance_weeks: data.advance_weeks || 0,
          rise_percent: data.us?.trend_percent || 0,
          price_range: "À définir",
          trend_fr: data.fr?.trend_percent ? `+${Math.round(data.fr.trend_percent)}%` : "—",
          trend_us: data.us?.trend_percent ? `+${Math.round(data.us.trend_percent)}%` : "—",
          google_score_fr: data.fr?.current_score || 0,
          google_score_us: data.us?.current_score || 0,
          saturation_fr: data.gap > 20 ? "Quasi nulle" : "Faible",
          saturation_level: data.gap > 20 ? "low" : "mid",
          aliexpress_query: kw.replace(/\s+/g, '+'),
          image_query: kw,
          reddit_posts: redditData?.posts?.slice(0, 3) || [],
          ali_suggestions: aliData?.suggestions || [],
        });
      }
    });
  }

  // Fill with Reddit signals if needed
  if (products.length < 4 && redditData?.posts?.length > 0) {
    redditData.posts.slice(0, 2).forEach(post => {
      products.push({
        name: post.title.slice(0, 50),
        tag: post.score > 1000 ? "HOT" : "À VENIR",
        source: "reddit",
        score: Math.min(98, 60 + Math.round(post.score / 100)),
        advance_weeks: 2,
        rise_percent: post.score,
        price_range: "À définir",
        trend_fr: "—",
        trend_us: `▲${post.score} upvotes`,
        google_score_fr: 0,
        google_score_us: 0,
        saturation_fr: "Inconnue",
        saturation_level: "low",
        aliexpress_query: query.replace(/\s+/g, '+'),
        image_query: query,
        reddit_url: post.url,
        reddit_sub: post.subreddit,
        reddit_posts: redditData?.posts?.slice(0, 3) || [],
        ali_suggestions: aliData?.suggestions || [],
      });
    });
  }

  return products.slice(0, 6);
}

const imgUrl = q => `https://source.unsplash.com/400x300/?${encodeURIComponent(q)}`;
const aliUrl = q => `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q.replace(/\+/g, " "))}`;
const metaUrl = q => `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&q=${encodeURIComponent(q)}`;
const formatDate = ts => new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " à " + new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

const SOURCE_LABELS = {
  amazon: { icon: "📦", label: "Amazon Movers", color: "#ff9900" },
  google_trends: { icon: "📈", label: "Google Trends", color: "#4285f4" },
  reddit: { icon: "👽", label: "Reddit Signal", color: "#ff4500" },
};

export default function ProductRadar() {
  const [mainTab, setMainTab] = useState("scan");
  const [niche, setNiche] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepTxt, setStepTxt] = useState("");
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState("all");
  const [lastScan, setLastScan] = useState(null);
  const [stats, setStats] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [redditData, setRedditData] = useState([]);
  const [history, setHistory] = useState([]);
  const [backendOnline, setBackendOnline] = useState(null);
  const [rawData, setRawData] = useState(null);

  useEffect(() => {
    const check = async () => {
      const online = await checkBackend();
      setBackendOnline(online);
    };
    check();
    const interval = setInterval(check, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get("scan_history_v12");
        if (result) setHistory(JSON.parse(result.value));
      } catch (e) {}
    };
    load();
  }, []);

  const saveHistory = async (entry) => {
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try { await window.storage.set("scan_history_v12", JSON.stringify(updated)); } catch (e) {}
  };

  const scan = async () => {
    if (!backendOnline) {
      alert("Backend hors ligne ! Lance server.py sur ton ordi.");
      return;
    }
    const query = niche.trim() || "fitness products";
    setLoading(true); setProgress(0); setExpanded(null); setMainTab("scan");

    try {
      // Google Trends FR
      setStepTxt(SCAN_STEPS[0]); setProgress(15);
      const keywords = query.split(' ').slice(0, 3);
      
      // Google Trends US
      setStepTxt(SCAN_STEPS[1]); setProgress(30);
      const trendsData = await fetchTrendsCompare(keywords);

      // Amazon Movers
      setStepTxt(SCAN_STEPS[2]); setProgress(48);
      const cats = ["health", "beauty", "home", "kitchen", "sports"];
      const allMovers = { movers: [] };
      for (const cat of cats.slice(0, 3)) {
        const data = await fetchAmazonMovers(cat);
        if (data?.movers) allMovers.movers.push(...data.movers);
      }
      allMovers.movers.sort((a, b) => (b.rise_percent || 0) - (a.rise_percent || 0));

      // Reddit
      setStepTxt(SCAN_STEPS[3]); setProgress(65);
      const reddit = await fetchReddit(query);
      if (reddit?.posts) setRedditData(reddit.posts.slice(0, 6));

      // AliExpress
      setStepTxt(SCAN_STEPS[4]); setProgress(80);
      const ali = await fetchAli(query);

      // Build products
      setStepTxt(SCAN_STEPS[5]); setProgress(95);
      const parsed = buildProductsFromData(trendsData, allMovers, reddit, ali, query);

      setProgress(100);
      await new Promise(r => setTimeout(r, 300));

      setProducts(parsed);
      setRawData({ trendsData, allMovers, reddit, ali });

      const avg = parsed.length > 0 ? Math.round(parsed.reduce((s, p) => s + p.score, 0) / parsed.length) : 0;
      const opps = parsed.filter(p => p.saturation_level === "low").length;
      const statsData = { total: parsed.length, avg, opps, movers: allMovers.movers.length, reddit: reddit?.count || 0 };
      setStats(statsData);
      setLastScan(new Date());
      await saveHistory({ id: Date.now(), timestamp: Date.now(), niche: query, products: parsed, stats: statsData });

    } catch (e) {
      alert("Erreur lors du scan. Vérifie que server.py tourne !");
    } finally { setLoading(false); }
  };

  const filtered = products.filter(p => {
    if (filter === "hot") return p.tag === "HOT";
    if (filter === "coming") return p.tag === "À VENIR";
    if (filter === "low-sat") return p.saturation_level === "low";
    return true;
  });

  const scoreColor = s => s >= 80 ? C.gold : s >= 65 ? C.orange : C.purple;
  const satColor = l => l === "low" ? C.green : l === "mid" ? C.orange : C.danger;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "-apple-system,sans-serif", color: C.text, maxWidth: 480, margin: "0 auto" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{display:none}input::placeholder{color:#6b6050}`}</style>

      {/* Loader */}
      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,9,5,0.97)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, animation: "spin 0.9s linear infinite", marginBottom: 20 }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: C.gold, marginBottom: 4 }}>Collecte des données réelles</div>
          <div style={{ fontSize: 12, color: C.green, marginBottom: 20 }}>⚡ Backend connecté</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center", padding: "0 24px" }}>
            {["📈 G.Trends", "📦 Amazon", "👽 Reddit", "🛒 Ali"].map((s, i) => (
              <div key={i} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, transition: "all 0.3s", background: progress > (i + 1) * 20 ? "rgba(240,180,41,0.15)" : C.surface, color: progress > (i + 1) * 20 ? C.gold : C.muted, border: `1px solid ${progress > (i + 1) * 20 ? C.goldDim + "50" : C.border}` }}>
                {s} {progress > (i + 1) * 20 ? "✓" : ""}
              </div>
            ))}
          </div>
          <div style={{ width: 220, height: 2, background: C.border, borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg,${C.goldDim},${C.gold})`, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 12, color: C.muted }}>{stepTxt}</div>
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.bg, zIndex: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.gold, boxShadow: `0 0 8px ${C.gold}` }} />
              <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: -0.5 }}>ProductRadar</span>
              <div style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: backendOnline ? "rgba(74,222,128,0.12)" : "rgba(255,68,68,0.12)", color: backendOnline ? C.green : C.danger, border: `1px solid ${backendOnline ? "rgba(74,222,128,0.3)" : "rgba(255,68,68,0.3)"}` }}>
                {backendOnline === null ? "..." : backendOnline ? "⚡ LIVE" : "⚠️ Hors ligne"}
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, paddingLeft: 15 }}>
              {backendOnline ? "Google Trends · Amazon · Reddit · AliExpress" : "Lance server.py pour activer"}
            </div>
          </div>
          <button onClick={scan} disabled={loading || !backendOnline}
            style={{ background: backendOnline ? `linear-gradient(135deg,${C.goldDim},${C.gold})` : C.surface, color: backendOnline ? "#0a0905" : C.muted, border: backendOnline ? "none" : `1px solid ${C.border}`, borderRadius: 14, padding: "12px 18px", fontSize: 14, fontWeight: 800, cursor: loading || !backendOnline ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, boxShadow: backendOnline ? `0 4px 18px rgba(240,180,41,0.25)` : "none" }}>
            ⚡ Scan
          </button>
        </div>

        {!backendOnline && backendOnline !== null && (
          <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: C.danger }}>
            ⚠️ Lance <strong>server.py</strong> sur ton ordi pour activer les données réelles.
          </div>
        )}

        <div style={{ display: "flex", background: C.surface2, borderRadius: 12, padding: 3 }}>
          {[{ key: "scan", label: "🔍 Scan" }, { key: "data", label: "📊 Données brutes" }, { key: "history", label: `📜 Historique${history.length > 0 ? ` (${history.length})` : ""}` }].map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              style={{ flex: 1, fontFamily: "inherit", fontSize: 11, fontWeight: 700, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: mainTab === t.key ? C.surface : "transparent", color: mainTab === t.key ? C.gold : C.muted, boxShadow: mainTab === t.key ? "0 1px 8px rgba(0,0,0,0.4)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Raw data tab */}
      {mainTab === "data" && (
        <div style={{ padding: "16px" }}>
          {!rawData ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📊</div>
              <div style={{ fontSize: 14, color: C.muted }}>Lance un scan pour voir les données brutes</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingBottom: 40 }}>

              {/* Google Trends */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#4285f4", marginBottom: 12 }}>📈 Google Trends FR vs US</div>
                {rawData.trendsData?.comparison ? Object.entries(rawData.trendsData.comparison).map(([kw, data]) => (
                  <div key={kw} style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>{kw}</div>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.blue }}>{data.fr?.current_score || 0}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>Score FR</div>
                      </div>
                      <div style={{ fontSize: 18, color: C.muted, alignSelf: "center" }}>→</div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{data.us?.current_score || 0}</div>
                        <div style={{ fontSize: 9, color: C.muted }}>Score US</div>
                      </div>
                      <div style={{ fontSize: 18, color: C.muted, alignSelf: "center" }}>→</div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: data.opportunity ? C.gold : C.muted }}>{data.advance_weeks || 0}sem</div>
                        <div style={{ fontSize: 9, color: C.muted }}>Avance</div>
                      </div>
                    </div>
                  </div>
                )) : <div style={{ fontSize: 12, color: C.muted }}>Pas de données</div>}
              </div>

              {/* Amazon Movers */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ff9900", marginBottom: 12 }}>📦 Amazon Movers & Shakers ({rawData.allMovers?.movers?.length || 0})</div>
                {(rawData.allMovers?.movers || []).slice(0, 8).map((m, i) => (
                  <div key={i} style={{ background: C.surface2, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>{m.category} · {m.price}</div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: C.green, flexShrink: 0 }}>+{m.rise_percent}%</div>
                  </div>
                ))}
              </div>

              {/* Reddit */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#ff4500", marginBottom: 12 }}>👽 Reddit ({rawData.reddit?.count || 0} posts)</div>
                {(rawData.reddit?.posts || []).slice(0, 5).map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noopener noreferrer"
                    style={{ textDecoration: "none", background: C.surface2, borderRadius: 10, padding: "10px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                      <div style={{ fontSize: 10, color: C.muted }}>r/{p.subreddit}</div>
                    </div>
                    <span style={{ fontSize: 10, color: "#ff4500", fontWeight: 700, flexShrink: 0 }}>▲{p.score}</span>
                  </a>
                ))}
              </div>

              {/* AliExpress */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.orange, marginBottom: 12 }}>🛒 AliExpress suggestions</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(rawData.ali?.suggestions || []).map((s, i) => (
                    <span key={i} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, background: "rgba(255,107,53,0.1)", color: C.orange }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* History tab */}
      {mainTab === "history" && (
        <div style={{ padding: "16px" }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📜</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, opacity: 0.35 }}>Aucun scan</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{history.length} scans</div>
                <button onClick={async () => { setHistory([]); try { await window.storage.delete("scan_history_v12"); } catch (e) {} }}
                  style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, padding: "6px 12px", color: C.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑 Effacer</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
                {history.map(entry => (
                  <div key={entry.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{entry.niche || "Scan général"}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{formatDate(entry.timestamp)}</div>
                      </div>
                      <button onClick={async () => { const u = history.filter(h => h.id !== entry.id); setHistory(u); try { await window.storage.set("scan_history_v12", JSON.stringify(u)); } catch (e) {} }}
                        style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(240,180,41,0.1)", color: C.gold, fontWeight: 700 }}>{entry.stats?.total} produits</span>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(74,222,128,0.1)", color: C.green, fontWeight: 700 }}>{entry.stats?.opps} opps</span>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(255,153,0,0.1)", color: "#ff9900", fontWeight: 700 }}>📦 {entry.stats?.movers} movers</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Scan tab */}
      {mainTab === "scan" && (
        <div style={{ padding: "0 16px" }}>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, margin: "14px 0" }}>
            {[
              { label: "Produits", value: stats?.total ?? "—", color: C.gold },
              { label: "Score moy.", value: stats?.avg ?? "—", color: C.text },
              { label: "Opps", value: stats?.opps ?? "—", color: C.green },
              { label: "Movers", value: stats?.movers ?? "—", color: "#ff9900" },
            ].map((s, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: "relative", marginBottom: 12 }}>
            <input value={niche} onChange={e => setNiche(e.target.value)} onKeyDown={e => e.key === "Enter" && scan()}
              placeholder="Niche ou mot-clé (ex: fitness, beauty)..."
              style={{ width: "100%", fontFamily: "inherit", fontSize: 15, background: C.surface, color: C.text, border: `1px solid ${C.border}`, padding: "15px 48px 15px 16px", borderRadius: 16, outline: "none" }} />
            <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.35 }}>🔍</span>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
            {[{ key: "all", label: "Tous" }, { key: "hot", label: "🔥 HOT" }, { key: "coming", label: "⏳ À Venir" }, { key: "low-sat", label: "💎 Faible sat." }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", padding: "9px 14px", borderRadius: 22, border: "none", cursor: "pointer", background: filter === f.key ? C.gold : C.surface, color: filter === f.key ? "#0a0905" : C.muted, boxShadow: filter === f.key ? `0 2px 12px rgba(240,180,41,0.25)` : "none" }}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Reddit live feed */}
          {redditData.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: "#ff4500", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8, fontWeight: 700 }}>👽 {redditData.length} signaux Reddit live</div>
              {redditData.slice(0, 3).map((post, i) => (
                <a key={i} href={post.url} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "9px 13px", display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 5 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>r/{post.subreddit}</div>
                  </div>
                  <span style={{ fontSize: 10, color: "#ff4500", fontWeight: 700, flexShrink: 0 }}>▲{post.score}</span>
                </a>
              ))}
            </div>
          )}

          {/* Empty state */}
          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "40px 20px 60px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📡</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, opacity: 0.35, marginBottom: 8 }}>
                {backendOnline ? "Backend connecté ✓" : "Backend requis"}
              </div>
              {backendOnline && (
                <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: 14, textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 8 }}>⚡ Sources actives</div>
                  {[{ icon: "📈", label: "Google Trends FR & US — temps réel" }, { icon: "📦", label: "Amazon Movers & Shakers — live" }, { icon: "👽", label: "9 subreddits — live" }, { icon: "🛒", label: "AliExpress suggestions — live" }].map((s, i) => (
                    <div key={i} style={{ fontSize: 12, color: C.text, marginBottom: 4, display: "flex", gap: 8 }}>
                      <span>{s.icon}</span><span>{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12, fontWeight: 600 }}>
              {filtered.length} produit{filtered.length > 1 ? "s" : ""} détecté{filtered.length > 1 ? "s" : ""}
            </div>
          )}

          {/* Product cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
            {filtered.map((p, i) => {
              const isOpen = expanded === i;
              const sc = scoreColor(p.score);
              const src = SOURCE_LABELS[p.source] || SOURCE_LABELS.amazon;

              return (
                <div key={i} style={{ background: C.surface, border: `1px solid ${isOpen ? C.goldDim : C.border}`, borderRadius: 20, overflow: "hidden", boxShadow: isOpen ? `0 6px 28px rgba(240,180,41,0.08)` : "none" }}>

                  {/* Image */}
                  {isOpen && (
                    <div style={{ position: "relative", height: 150, overflow: "hidden", background: C.surface2 }}>
                      <img src={imgUrl(p.image_query)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} onError={e => e.target.style.display = "none"} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,16,10,0.95) 0%, transparent 50%)" }} />
                      <div style={{ position: "absolute", top: 10, left: 12, display: "flex", gap: 5 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: p.tag === "HOT" ? "linear-gradient(135deg,#ff4444,#ff6b35)" : "linear-gradient(135deg,#7c6fff,#9b7fff)", color: "#fff" }}>{p.tag === "HOT" ? "🔥 HOT" : "⏳ À VENIR"}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: `${src.color}CC`, color: "#fff" }}>{src.icon} {src.label}</span>
                      </div>
                      <div style={{ position: "absolute", top: 10, right: 12, width: 42, height: 42, borderRadius: "50%", background: "rgba(10,9,5,0.85)", border: `2px solid ${sc}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: sc }}>{p.score}</span>
                      </div>
                    </div>
                  )}

                  {/* Header */}
                  <div onClick={() => setExpanded(isOpen ? null : i)} style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
                    {!isOpen && (
                      <div style={{ width: 52, height: 52, borderRadius: "50%", border: `2px solid ${sc}44`, background: `${sc}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: sc }}>{p.score}</span>
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4, flexWrap: "wrap" }}>
                        <div style={{ fontSize: 14, fontWeight: 700 }}>{p.name}</div>
                        {!isOpen && <>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: p.tag === "HOT" ? "rgba(255,68,68,0.15)" : "rgba(124,111,255,0.15)", color: p.tag === "HOT" ? C.danger : C.purple }}>{p.tag === "HOT" ? "🔥" : "⏳"}</span>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: `${src.color}15`, color: src.color }}>{src.icon}</span>
                        </>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>🇫🇷 {p.trend_fr}</span>
                        <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>🇺🇸 {p.trend_us}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, alignSelf: "center" }} />
                        <span style={{ fontSize: 11, color: satColor(p.saturation_level) }}>{p.saturation_fr}</span>
                        {p.price_range !== "À définir" && <>
                          <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, alignSelf: "center" }} />
                          <span style={{ fontSize: 11, color: C.muted }}>{p.price_range}</span>
                        </>}
                      </div>
                    </div>
                    <div style={{ fontSize: 18, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>⌄</div>
                  </div>

                  {/* Expanded */}
                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${C.border}` }}>

                      {/* Google Trends real scores */}
                      {(p.google_score_fr > 0 || p.google_score_us > 0) && (
                        <div style={{ margin: "12px 16px 0", background: "rgba(66,133,244,0.08)", border: "1px solid rgba(66,133,244,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                          <div style={{ fontSize: 10, color: "#4285f4", fontWeight: 700, marginBottom: 10 }}>📈 Google Trends — Données réelles</div>
                          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 24, fontWeight: 800, color: C.blue }}>{p.google_score_fr}</div>
                              <div style={{ fontSize: 10, color: C.muted }}>🇫🇷 Score FR</div>
                            </div>
                            <div style={{ fontSize: 20, color: C.muted, alignSelf: "center" }}>→</div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 24, fontWeight: 800, color: C.green }}>{p.google_score_us}</div>
                              <div style={{ fontSize: 10, color: C.muted }}>🇺🇸 Score US</div>
                            </div>
                            {p.advance_weeks > 0 && <>
                              <div style={{ fontSize: 20, color: C.muted, alignSelf: "center" }}>→</div>
                              <div style={{ textAlign: "center" }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: C.gold }}>{p.advance_weeks}sem</div>
                                <div style={{ fontSize: 10, color: C.muted }}>Avance FR</div>
                              </div>
                            </>}
                          </div>
                        </div>
                      )}

                      {/* Amazon signal */}
                      {p.source === "amazon" && (
                        <div style={{ margin: "10px 16px 0", background: "rgba(255,153,0,0.08)", border: "1px solid rgba(255,153,0,0.2)", borderRadius: 12, padding: "12px 14px" }}>
                          <div style={{ fontSize: 10, color: "#ff9900", fontWeight: 700, marginBottom: 6 }}>📦 Amazon Movers & Shakers — Données réelles</div>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 22, fontWeight: 800, color: C.green }}>+{p.rise_percent}%</div>
                              <div style={{ fontSize: 10, color: C.muted }}>Hausse semaine</div>
                            </div>
                            <div style={{ flex: 1, fontSize: 12, color: C.muted }}>Catégorie : {p.category}</div>
                            {p.price_us && <div style={{ fontSize: 14, fontWeight: 700, color: C.gold }}>{p.price_us}</div>}
                          </div>
                        </div>
                      )}

                      {/* Reddit posts */}
                      {p.reddit_posts?.length > 0 && (
                        <div style={{ margin: "10px 16px 0" }}>
                          <div style={{ fontSize: 10, color: "#ff4500", fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>👽 Signaux Reddit réels</div>
                          {p.reddit_posts.slice(0, 2).map((post, k) => (
                            <a key={k} href={post.url} target="_blank" rel="noopener noreferrer"
                              style={{ textDecoration: "none", background: C.surface2, borderRadius: 10, padding: "9px 12px", display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 11, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.title}</div>
                                <div style={{ fontSize: 10, color: C.muted }}>r/{post.subreddit}</div>
                              </div>
                              <span style={{ fontSize: 10, color: "#ff4500", fontWeight: 700 }}>▲{post.score}</span>
                            </a>
                          ))}
                        </div>
                      )}

                      {/* AliExpress suggestions */}
                      {p.ali_suggestions?.length > 0 && (
                        <div style={{ margin: "10px 16px 0" }}>
                          <div style={{ fontSize: 10, color: C.orange, fontWeight: 700, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>🛒 Suggestions AliExpress</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            {p.ali_suggestions.slice(0, 4).map((s, k) => (
                              <span key={k} style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(255,107,53,0.1)", color: C.orange }}>{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CTAs */}
                      <div style={{ padding: "14px 16px", display: "flex", gap: 8 }}>
                        <a href={aliUrl(p.aliexpress_query)} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg,#e8501a,#ff6b35)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "11px 8px", borderRadius: 12 }}>
                          🛒 AliExpress
                        </a>
                        <a href={metaUrl(p.name)} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg,#1565c0,#1877f2)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "11px 8px", borderRadius: 12 }}>
                          📺 Meta Ads
                        </a>
                        <a href={`https://www.amazon.com/s?k=${encodeURIComponent(p.name)}`} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg,#e47911,#ff9900)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "11px 8px", borderRadius: 12 }}>
                          📦 Amazon
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
