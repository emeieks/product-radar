import { useState, useEffect } from "react";

const C = {
  bg: "#0a0905", surface: "#12100a", surface2: "#1a1710",
  border: "#2a2518", gold: "#f0b429", goldDim: "#c8952a",
  orange: "#ff6b35", purple: "#9b7fff", text: "#f0ead8",
  muted: "#6b6050", danger: "#ff4444", green: "#4ade80", blue: "#60a5fa",
};

const API = "/api";

const PATTERN_MAP = {
  geo_delay: { icon: "🌍", color: "#69c9d0", label: "Retard géographique" },
  season_inverse: { icon: "🌏", color: "#ff9900", label: "Saison inversée" },
  reddit_problem: { icon: "😤", color: "#ff4500", label: "Problème Reddit" },
  niche_crossover: { icon: "🎯", color: C.purple, label: "Crossover de niche" },
  long_running_ad: { icon: "📺", color: C.gold, label: "Pub longue durée" },
  ali_choice: { icon: "⭐", color: C.orange, label: "AliExpress Choice" },
  amazon_mover: { icon: "📦", color: "#ff9900", label: "Amazon Mover" },
};

const SCAN_STEPS = [
  "📈 Google Trends FR en temps réel...",
  "🇺🇸 Google Trends US en temps réel...",
  "📦 Amazon Movers & Shakers live...",
  "👽 Scan 9 subreddits...",
  "🛒 AliExpress nouveautés...",
  "🔄 Croisement des données réelles...",
  "🤖 Analyse IA approfondie...",
  "💡 Génération des opportunités...",
];

// ── API calls to backend ──────────────────────────────────────────────────
async function checkBackend() {
  try {
    const res = await fetch(`${API}/health`, { signal: AbortSignal.timeout(3000) });
    return res.ok;
  } catch (e) { return false; }
}

async function fetchTrendsCompare(keywords) {
  try {
    const res = await fetch(`${API}/trends/compare?keywords=${encodeURIComponent(keywords.join(','))}`);
    return await res.json();
  } catch (e) { return null; }
}

async function fetchAmazonMovers(category = "health") {
  try {
    const res = await fetch(`${API}/amazon/movers?category=${category}`);
    return await res.json();
  } catch (e) { return null; }
}

async function fetchReddit(query) {
  try {
    const res = await fetch(`${API}/reddit/search?q=${encodeURIComponent(query)}`);
    return await res.json();
  } catch (e) { return null; }
}

async function fetchAli(query) {
  try {
    const res = await fetch(`${API}/aliexpress/search?q=${encodeURIComponent(query)}`);
    return await res.json();
  } catch (e) { return null; }
}

// ── Claude analysis with REAL data ───────────────────────────────────────
async function claudeAnalyze(niche, realData) {
  const { trendsComparison, amazonMovers, redditPosts, aliSuggestions } = realData;

  // Construire le contexte avec vraies données
  let trendsContext = "Pas de données Google Trends";
  if (trendsComparison?.comparison) {
    const items = Object.entries(trendsComparison.comparison).map(([kw, data]) => {
      const gap = data.gap || 0;
      const advance = data.advance_weeks || 0;
      return `"${kw}" : FR=${data.fr?.current_score || 0} vs US=${data.us?.current_score || 0} (${gap > 0 ? `+${gap} pts avance US` : 'stable'}, ~${advance} sem. avant FR)`;
    });
    trendsContext = items.join('\n');
  }

  let amazonContext = "Pas de données Amazon";
  if (amazonMovers?.movers?.length > 0) {
    amazonContext = amazonMovers.movers.slice(0, 8).map(m =>
      `"${m.name}" : +${m.rise_percent}% cette semaine (${m.price})`
    ).join('\n');
  }

  let redditContext = "Pas de données Reddit";
  if (redditPosts?.posts?.length > 0) {
    redditContext = redditPosts.posts.slice(0, 6).map(p =>
      `"${p.title}" (${p.score} upvotes, ${p.comments} comments, r/${p.subreddit})`
    ).join('\n');
  }

  let aliContext = "Pas de données AliExpress";
  if (aliSuggestions?.suggestions?.length > 0) {
    aliContext = aliSuggestions.suggestions.join(', ');
  }

  const prompt = `Tu es un expert dropshipping. Analyse ces VRAIES données en temps réel pour la niche "${niche}" et génère 6 produits gagnants.

═══ GOOGLE TRENDS RÉEL (FR vs US) ═══
${trendsContext}

═══ AMAZON MOVERS & SHAKERS RÉEL ═══
${amazonContext}

═══ REDDIT RÉEL ═══
${redditContext}

═══ ALIEXPRESS RÉEL ═══
${aliContext}

INSTRUCTIONS : Basé sur ces vraies données, identifie les meilleures opportunités. Privilégie les produits qui ont un score US bien supérieur au score FR (avance géographique réelle). Utilise les vrais produits Amazon Movers si pertinents.

JSON UNIQUEMENT (sans markdown) :
[{
  "name": "Nom produit",
  "tag": "HOT",
  "pattern": "geo_delay",
  "score": 85,
  "advance_weeks": 4,
  "ad_duration_days": 30,
  "trend_fr": "+180%",
  "trend_us": "+480%",
  "google_trend_score_fr": 45,
  "google_trend_score_us": 89,
  "saturation_us": "Modérée",
  "saturation_fr": "Quasi nulle",
  "saturation_level": "low",
  "price_range": "29-49€",
  "cost_ali": "7-10€",
  "margin": "~75%",
  "sources": ["google_trends", "amazon", "reddit"],
  "image_query": "english photo query",
  "aliexpress_query": "english+query",
  "angle": "Accroche marketing",
  "angle_analysis": "Angle inexploité suggéré",
  "insight": "Pourquoi maintenant basé sur les données réelles",
  "market_analysis": "Analyse basée sur les vraies données collectées",
  "saturation_detail": "Basé sur comparaison US vs FR réelle",
  "pattern_analysis": "Explication basée sur les vraies données",
  "tiktok_signal": "Signal TikTok",
  "reddit_signal": "Signal basé sur les vrais posts Reddit collectés",
  "amazon_signal": "Signal basé sur les vrais Movers Amazon",
  "aliexpress_signal": "Signal AliExpress",
  "pinterest_signal": "Signal Pinterest",
  "meta_ads_signal": "Signal Meta Ads",
  "competitors": [
    {"name": "Boutique", "price": "XX€", "rating": "4.X/5", "sales": "~XXX/mois", "country": "🇫🇷"}
  ]
}]

Règles : tag HOT/À VENIR, pattern parmi geo_delay/season_inverse/reddit_problem/niche_crossover/long_running_ad/ali_choice/amazon_mover, score 60-98.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 4000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  const raw = data.content.map(b => b.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

// ── Generate ads ──────────────────────────────────────────────────────────
async function generateAds(product) {
  const prompt = `Expert copywriting dropshipping. Génère des pubs PRÊTES À L'EMPLOI.

PRODUIT : ${product.name}
ANGLE : ${product.angle}
ANGLE INEXPLOITÉ : ${product.angle_analysis || ""}
PRIX : ${product.price_range}
INSIGHT : ${product.insight}

JSON UNIQUEMENT :
{
  "facebook": {
    "hook": "Accroche ultra-punchy 1 phrase",
    "body": "Corps Facebook 150-200 mots avec emojis",
    "cta": "Call to action",
    "headline": "Titre max 40 caractères",
    "description": "Description max 25 mots"
  },
  "tiktok": {
    "hook_0_3s": "Accroche visuelle 0-3 secondes",
    "script": "Script TikTok 60-90s avec timecodes [0-3s] etc.",
    "caption": "Légende TikTok 150 mots max",
    "hashtags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8"]
  },
  "email": {
    "subject": "Objet email max 50 caractères",
    "preview": "Prévisualisation max 90 caractères",
    "body": "Email complet 200-250 mots"
  },
  "angles": [
    {"title": "Angle A", "description": "Pourquoi ça marche"},
    {"title": "Angle B", "description": "Pourquoi ça marche"},
    {"title": "Angle C", "description": "Pourquoi ça marche"}
  ]
}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 2000, messages: [{ role: "user", content: prompt }] }),
  });
  const data = await res.json();
  const raw = data.content.map(b => b.text || "").join("");
  return JSON.parse(raw.replace(/```json|```/g, "").trim());
}

const imgUrl = q => `https://source.unsplash.com/400x300/?${encodeURIComponent(q)}`;
const aliUrl = q => `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(q.replace(/\+/g, " "))}`;
const metaUrl = q => `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=FR&q=${encodeURIComponent(q)}`;
const formatDate = ts => new Date(ts).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) + " à " + new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

// ── Ad Generator Screen ───────────────────────────────────────────────────
function AdGeneratorScreen({ product, onBack }) {
  const [ads, setAds] = useState(null);
  const [loading, setLoading] = useState(false);
  const [adTab, setAdTab] = useState("facebook");
  const [copied, setCopied] = useState(null);

  const generate = async () => {
    setLoading(true);
    try { setAds(await generateAds(product)); }
    catch (e) { alert("Erreur génération. Réessaie !"); }
    finally { setLoading(false); }
  };

  const copy = (text, key) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const CopyBtn = ({ text, id }) => (
    <button onClick={() => copy(text, id)}
      style={{ fontFamily: "inherit", fontSize: 11, fontWeight: 700, padding: "6px 12px", borderRadius: 8, border: `1px solid ${copied === id ? "rgba(74,222,128,0.3)" : C.border}`, cursor: "pointer", background: copied === id ? "rgba(74,222,128,0.15)" : C.surface, color: copied === id ? C.green : C.muted, transition: "all 0.2s", flexShrink: 0 }}>
      {copied === id ? "✓ Copié" : "Copier"}
    </button>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "-apple-system,sans-serif" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{display:none}`}</style>
      <div style={{ padding: "18px 16px", borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, background: C.bg, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: ads ? 12 : 0 }}>
          <button onClick={onBack} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 14px", color: C.text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>← Retour</button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>✦ {product.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>Générateur pubs IA</div>
          </div>
          <button onClick={generate} disabled={loading}
            style={{ background: ads ? C.surface : `linear-gradient(135deg,${C.goldDim},${C.gold})`, border: ads ? `1px solid ${C.border}` : "none", borderRadius: 12, padding: "10px 16px", fontSize: 12, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", color: ads ? C.muted : "#0a0905", opacity: loading ? 0.6 : 1 }}>
            {loading ? "..." : ads ? "🔄" : "⚡ Générer"}
          </button>
        </div>
        {ads && (
          <div style={{ display: "flex", background: C.surface2, borderRadius: 12, padding: 3 }}>
            {[{ key: "facebook", label: "📘 Facebook" }, { key: "tiktok", label: "🎵 TikTok" }, { key: "email", label: "📧 Email" }, { key: "angles", label: "🎯 Angles" }].map(t => (
              <button key={t.key} onClick={() => setAdTab(t.key)}
                style={{ flex: 1, fontFamily: "inherit", fontSize: 10, fontWeight: 700, padding: "9px 2px", borderRadius: 10, border: "none", cursor: "pointer", background: adTab === t.key ? C.surface : "transparent", color: adTab === t.key ? C.gold : C.muted, boxShadow: adTab === t.key ? "0 1px 8px rgba(0,0,0,0.4)" : "none" }}>
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ padding: "16px" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, animation: "spin 0.9s linear infinite", margin: "0 auto 20px" }} />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, marginBottom: 8 }}>Génération en cours...</div>
            <div style={{ fontSize: 13, color: C.muted }}>Facebook · TikTok · Email · 3 angles</div>
          </div>
        )}
        {!ads && !loading && (
          <div style={{ textAlign: "center", padding: "30px 20px" }}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 16, marginBottom: 20, textAlign: "left" }}>
              <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{product.name}</div>
              <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, fontStyle: "italic" }}>"{product.angle}"</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(74,222,128,0.1)", color: C.green, fontWeight: 600 }}>{product.price_range}</span>
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(240,180,41,0.1)", color: C.gold, fontWeight: 600 }}>{product.margin}</span>
                <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(155,127,255,0.1)", color: C.purple, fontWeight: 600 }}>Score {product.score}</span>
              </div>
            </div>
            {[{ icon: "📘", label: "Facebook/Instagram", desc: "Hook + body + CTA + headline" }, { icon: "🎵", label: "TikTok", desc: "Script minuté + caption + hashtags" }, { icon: "📧", label: "Email", desc: "Objet + preview + corps complet" }, { icon: "🎯", label: "3 angles A/B", desc: "Pour tester et scaler le meilleur" }].map((item, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", textAlign: "left", marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 11, color: C.muted }}>{item.desc}</div>
                </div>
              </div>
            ))}
            <button onClick={generate} style={{ width: "100%", background: `linear-gradient(135deg,${C.goldDim},${C.gold})`, color: "#0a0905", border: "none", borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 800, cursor: "pointer", marginTop: 8 }}>
              ⚡ Générer mes pubs
            </button>
          </div>
        )}
        {ads && adTab === "facebook" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>📘 Facebook / Instagram</div>
            {[{ label: "Titre", value: ads.facebook.headline, id: "fb_hl", color: "#1877f2" }, { label: "Accroche", value: ads.facebook.hook, id: "fb_hook", color: "#1877f2" }, { label: "Corps du texte", value: ads.facebook.body, id: "fb_body", color: "#1877f2" }, { label: "Description", value: ads.facebook.description, id: "fb_desc", color: "#1877f2" }, { label: "CTA", value: ads.facebook.cta, id: "fb_cta", color: C.gold }].map((field, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: field.color, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{field.label}</div>
                  <CopyBtn text={field.value} id={field.id} />
                </div>
                <div style={{ fontSize: i === 0 ? 15 : 13, fontWeight: i === 0 ? 800 : 400, color: i === 1 ? C.gold : C.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{field.value}</div>
              </div>
            ))}
            <button onClick={() => copy(`${ads.facebook.hook}\n\n${ads.facebook.body}\n\n${ads.facebook.cta}`, "fb_all")}
              style={{ width: "100%", background: "linear-gradient(135deg,#1565c0,#1877f2)", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              {copied === "fb_all" ? "✓ Copié !" : "📋 Copier toute la pub Facebook"}
            </button>
          </div>
        )}
        {ads && adTab === "tiktok" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>🎵 TikTok</div>
            {[{ label: "Hook 0-3 secondes", value: ads.tiktok.hook_0_3s, id: "tt_hook", color: "#69c9d0" }, { label: "Script complet", value: ads.tiktok.script, id: "tt_script", color: "#69c9d0", mono: true }, { label: "Légende (Caption)", value: ads.tiktok.caption, id: "tt_cap", color: "#69c9d0" }].map((field, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: field.color, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{field.label}</div>
                  <CopyBtn text={field.value} id={field.id} />
                </div>
                <div style={{ fontSize: i === 0 ? 14 : 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? C.gold : C.text, lineHeight: 1.8, whiteSpace: "pre-line", fontFamily: field.mono ? "monospace" : "inherit" }}>{field.value}</div>
              </div>
            ))}
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: "#69c9d0", textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Hashtags</div>
                <CopyBtn text={(ads.tiktok.hashtags || []).map(h => `#${h}`).join(" ")} id="tt_hash" />
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(ads.tiktok.hashtags || []).map((h, i) => <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "rgba(105,201,208,0.1)", color: "#69c9d0", fontWeight: 600 }}>#{h}</span>)}
              </div>
            </div>
            <button onClick={() => copy(`${ads.tiktok.hook_0_3s}\n\n${ads.tiktok.script}\n\n${ads.tiktok.caption}\n\n${(ads.tiktok.hashtags || []).map(h => `#${h}`).join(" ")}`, "tt_all")}
              style={{ width: "100%", background: "linear-gradient(135deg,#010101,#69c9d0)", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              {copied === "tt_all" ? "✓ Copié !" : "📋 Copier tout le TikTok"}
            </button>
          </div>
        )}
        {ads && adTab === "email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>📧 Email Marketing</div>
            {[{ label: "Objet", value: ads.email.subject, id: "em_sub", big: true }, { label: "Prévisualisation", value: ads.email.preview, id: "em_prev", italic: true }, { label: "Corps de l'email", value: ads.email.body, id: "em_body" }].map((field, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: C.blue, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>{field.label}</div>
                  <CopyBtn text={field.value} id={field.id} />
                </div>
                <div style={{ fontSize: field.big ? 15 : 13, fontWeight: field.big ? 800 : 400, fontStyle: field.italic ? "italic" : "normal", color: field.italic ? C.muted : C.text, lineHeight: 1.7, whiteSpace: "pre-line" }}>{field.value}</div>
              </div>
            ))}
            <button onClick={() => copy(`Objet: ${ads.email.subject}\n\n${ads.email.body}`, "em_all")}
              style={{ width: "100%", background: `linear-gradient(135deg,#1565c0,${C.blue})`, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>
              {copied === "em_all" ? "✓ Copié !" : "📋 Copier l'email complet"}
            </button>
          </div>
        )}
        {ads && adTab === "angles" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
            <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600, marginBottom: 4 }}>🎯 3 Angles A/B</div>
            <div style={{ background: "rgba(155,127,255,0.08)", border: "1px solid rgba(155,127,255,0.2)", borderRadius: 12, padding: 12, marginBottom: 4 }}>
              <div style={{ fontSize: 12, color: C.purple, lineHeight: 1.6 }}>Lance les 3 avec 5€/jour chacun. Après 3 jours, coupe les perdants. Scale le gagnant.</div>
            </div>
            {(ads.angles || []).map((angle, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, borderLeft: `3px solid ${i === 0 ? C.gold : i === 1 ? C.orange : C.purple}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: i === 0 ? "rgba(240,180,41,0.15)" : i === 1 ? "rgba(255,107,53,0.15)" : "rgba(155,127,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: i === 0 ? C.gold : i === 1 ? C.orange : C.purple }}>A{i + 1}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{angle.title}</div>
                </div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{angle.description}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────
export default function ProductRadar() {
  const [mainTab, setMainTab] = useState("scan");
  const [adProduct, setAdProduct] = useState(null);
  const [niche, setNiche] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stepTxt, setStepTxt] = useState("");
  const [progress, setProgress] = useState(0);
  const [filter, setFilter] = useState("all");
  const [lastScan, setLastScan] = useState(null);
  const [stats, setStats] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState({});
  const [redditData, setRedditData] = useState([]);
  const [scanStats, setScanStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [backendOnline, setBackendOnline] = useState(null);
  const [realDataSummary, setRealDataSummary] = useState(null);

  useEffect(() => {
    const check = async () => {
      const online = await checkBackend();
      setBackendOnline(online);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await window.storage.get("scan_history_v11");
        if (result) setHistory(JSON.parse(result.value));
      } catch (e) {}
    };
    load();
  }, []);

  const saveHistory = async (entry) => {
    const updated = [entry, ...history].slice(0, 20);
    setHistory(updated);
    try { await window.storage.set("scan_history_v11", JSON.stringify(updated)); } catch (e) {}
  };

  const scan = async () => {
    const query = niche.trim() || "trending ecommerce products";
    setLoading(true); setProgress(0); setExpanded(null); setMainTab("scan");
    setRealDataSummary(null);

    try {
      // Step 1 - Google Trends FR
      setStepTxt(SCAN_STEPS[0]); setProgress(10);
      const keywords = query.split(' ').slice(0, 3);

      // Step 2 - Google Trends US
      setStepTxt(SCAN_STEPS[1]); setProgress(22);
      const trendsComparison = backendOnline ? await fetchTrendsCompare(keywords) : null;

      // Step 3 - Amazon Movers
      setStepTxt(SCAN_STEPS[2]); setProgress(38);
      const amazonMovers = backendOnline ? await fetchAmazonMovers("health") : null;
      const amazonMovers2 = backendOnline ? await fetchAmazonMovers("beauty") : null;

      // Merge amazon movers
      const allMovers = { movers: [...(amazonMovers?.movers || []), ...(amazonMovers2?.movers || [])] };

      // Step 4 - Reddit
      setStepTxt(SCAN_STEPS[3]); setProgress(52);
      const redditPosts = backendOnline ? await fetchReddit(query) : null;
      if (redditPosts?.posts) setRedditData(redditPosts.posts.slice(0, 6));

      // Step 5 - AliExpress
      setStepTxt(SCAN_STEPS[4]); setProgress(64);
      const aliSuggestions = backendOnline ? await fetchAli(query) : null;

      // Step 6 - Cross data
      setStepTxt(SCAN_STEPS[5]); setProgress(74);
      await new Promise(r => setTimeout(r, 400));

      // Résumé des vraies données
      const summary = {
        trendsFound: trendsComparison ? Object.keys(trendsComparison.comparison || {}).length : 0,
        amazonMovers: allMovers.movers?.length || 0,
        redditPosts: redditPosts?.count || 0,
        aliSuggestions: aliSuggestions?.suggestions?.length || 0,
        backendUsed: backendOnline,
      };
      setRealDataSummary(summary);

      // Step 7 - Claude analysis
      setStepTxt(SCAN_STEPS[6]); setProgress(85);
      const realData = {
        trendsComparison,
        amazonMovers: allMovers,
        redditPosts,
        aliSuggestions,
      };

      let parsed;
      try { parsed = await claudeAnalyze(query, realData); }
      catch (e) { throw new Error("Claude API error"); }

      setStepTxt(SCAN_STEPS[7]); setProgress(100);
      await new Promise(r => setTimeout(r, 300));

      setProducts(parsed);
      const avg = Math.round(parsed.reduce((s, p) => s + p.score, 0) / parsed.length);
      const opps = parsed.filter(p => p.score >= 80 && p.saturation_level === "low").length;
      const avgAdv = Math.round(parsed.reduce((s, p) => s + (p.advance_weeks || 0), 0) / parsed.length);
      const statsData = { total: parsed.length, avg, opps, avgAdv };
      setStats(statsData);
      setScanStats({ redditPosts: summary.redditPosts, aliSuggestions: summary.aliSuggestions, patternsFound: [...new Set(parsed.map(p => p.pattern))].length, amazonMovers: summary.amazonMovers });
      setLastScan(new Date());
      await saveHistory({ id: Date.now(), timestamp: Date.now(), niche: query, products: parsed, stats: statsData, redditCount: summary.redditPosts, realData: true });

    } catch (e) {
      alert("Erreur lors de l'analyse. Vérifie que le serveur tourne !");
    } finally { setLoading(false); }
  };

  if (adProduct) return <AdGeneratorScreen product={adProduct} onBack={() => setAdProduct(null)} />;

  const filtered = products.filter(p => {
    if (filter === "hot") return p.tag === "HOT";
    if (filter === "coming") return p.tag === "À VENIR";
    if (filter === "long_ad") return (p.ad_duration_days || 0) >= 30;
    if (filter === "virgin") return (p.ad_duration_days || 0) === 0;
    return true;
  });

  const scoreColor = s => s >= 80 ? C.gold : s >= 65 ? C.orange : C.purple;
  const satColor = l => l === "low" ? C.green : l === "mid" ? C.orange : C.danger;
  const getTab = i => activeTab[i] || "signals";
  const setTab = (i, t) => setActiveTab(p => ({ ...p, [i]: t }));
  const adInfo = (days) => !days || days === 0 ? { color: C.blue, label: "Vierge", bg: "rgba(96,165,250,0.12)" } : days >= 30 ? { color: C.gold, label: `${days}j ✓`, bg: "rgba(240,180,41,0.12)" } : { color: C.orange, label: `${days}j`, bg: "rgba(255,107,53,0.12)" };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "-apple-system,sans-serif", color: C.text, maxWidth: 480, margin: "0 auto" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}*{box-sizing:border-box}::-webkit-scrollbar{display:none}input::placeholder{color:#6b6050}`}</style>

      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(10,9,5,0.97)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", border: `2px solid ${C.border}`, borderTop: `2px solid ${C.gold}`, animation: "spin 0.9s linear infinite", marginBottom: 20 }} />
          <div style={{ fontSize: 17, fontWeight: 700, color: C.gold, marginBottom: 4 }}>
            {backendOnline ? "Données réelles en cours..." : "Analyse IA..."}
          </div>
          <div style={{ fontSize: 12, color: backendOnline ? C.green : C.muted, marginBottom: 20, textAlign: "center" }}>
            {backendOnline ? "✓ Backend connecté — vraies données" : "Backend hors ligne — mode IA seul"}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap", justifyContent: "center", padding: "0 24px" }}>
            {["📈 G.Trends", "📦 Amazon", "👽 Reddit", "🛒 Ali", "🤖 Claude"].map((s, i) => (
              <div key={i} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, transition: "all 0.3s", background: progress > (i + 1) * 17 ? "rgba(240,180,41,0.15)" : C.surface, color: progress > (i + 1) * 17 ? C.gold : C.muted, border: `1px solid ${progress > (i + 1) * 17 ? C.goldDim + "50" : C.border}` }}>
                {s} {progress > (i + 1) * 17 ? "✓" : ""}
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
              {/* Backend status */}
              <div style={{ fontSize: 9, fontWeight: 800, padding: "2px 8px", borderRadius: 20, background: backendOnline ? "rgba(74,222,128,0.12)" : "rgba(255,68,68,0.12)", color: backendOnline ? C.green : C.danger, border: `1px solid ${backendOnline ? "rgba(74,222,128,0.3)" : "rgba(255,68,68,0.3)"}` }}>
                {backendOnline === null ? "..." : backendOnline ? "⚡ LIVE" : "⚠️ Hors ligne"}
              </div>
            </div>
            <div style={{ fontSize: 11, color: C.muted, paddingLeft: 15 }}>
              {backendOnline ? "Google Trends · Amazon · Reddit · Ali" : "Lance server.py pour activer les données réelles"}
            </div>
          </div>
          <button onClick={scan} disabled={loading}
            style={{ background: `linear-gradient(135deg,${C.goldDim},${C.gold})`, color: "#0a0905", border: "none", borderRadius: 14, padding: "12px 18px", fontSize: 14, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.5 : 1, boxShadow: `0 4px 18px rgba(240,180,41,0.25)` }}>
            ⚡ Scan
          </button>
        </div>

        {/* Backend offline warning */}
        {backendOnline === false && (
          <div style={{ background: "rgba(255,68,68,0.08)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, padding: "10px 12px", marginBottom: 12, fontSize: 12, color: C.danger, lineHeight: 1.5 }}>
            ⚠️ Backend hors ligne — Lance <strong>server.py</strong> pour activer Google Trends, Amazon Movers et les vraies données.
          </div>
        )}

        <div style={{ display: "flex", background: C.surface2, borderRadius: 12, padding: 3 }}>
          {[{ key: "scan", label: "🔍 Scan" }, { key: "history", label: `📜 Historique${history.length > 0 ? ` (${history.length})` : ""}` }].map(t => (
            <button key={t.key} onClick={() => setMainTab(t.key)}
              style={{ flex: 1, fontFamily: "inherit", fontSize: 13, fontWeight: 700, padding: "10px 4px", borderRadius: 10, border: "none", cursor: "pointer", background: mainTab === t.key ? C.surface : "transparent", color: mainTab === t.key ? C.gold : C.muted, boxShadow: mainTab === t.key ? "0 1px 8px rgba(0,0,0,0.4)" : "none" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {mainTab === "history" && (
        <div style={{ padding: "16px" }}>
          {history.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📜</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, opacity: 0.35 }}>Aucun scan sauvegardé</div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>{history.length} scans</div>
                <button onClick={async () => { setHistory([]); try { await window.storage.delete("scan_history_v11"); } catch (e) {} }}
                  style={{ background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", borderRadius: 10, padding: "6px 12px", color: C.danger, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>🗑 Effacer</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingBottom: 40 }}>
                {history.map(entry => (
                  <div key={entry.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: "14px 16px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                          <div style={{ fontSize: 15, fontWeight: 700 }}>{entry.niche || "Scan général"}</div>
                          {entry.realData && <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, background: "rgba(74,222,128,0.12)", color: C.green, fontWeight: 700 }}>⚡ LIVE</span>}
                        </div>
                        <div style={{ fontSize: 11, color: C.muted }}>{formatDate(entry.timestamp)}</div>
                      </div>
                      <button onClick={async () => { const u = history.filter(h => h.id !== entry.id); setHistory(u); try { await window.storage.set("scan_history_v11", JSON.stringify(u)); } catch (e) {} }}
                        style={{ background: "none", border: "none", color: C.muted, fontSize: 16, cursor: "pointer" }}>✕</button>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(240,180,41,0.1)", color: C.gold, fontWeight: 700 }}>{entry.stats?.total} produits</span>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(74,222,128,0.1)", color: C.green, fontWeight: 700 }}>{entry.stats?.opps} opps</span>
                      <span style={{ fontSize: 11, padding: "4px 10px", borderRadius: 20, background: "rgba(255,69,0,0.1)", color: "#ff4500", fontWeight: 700 }}>{entry.redditCount} Reddit</span>
                    </div>
                    {(entry.products || []).slice(0, 3).map((p, j) => {
                      const pat = PATTERN_MAP[p.pattern] || PATTERN_MAP.geo_delay;
                      const sc = scoreColor(p.score);
                      return (
                        <div key={j} style={{ background: C.surface2, borderRadius: 10, padding: "8px 12px", display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${sc}44`, background: `${sc}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: sc }}>{p.score}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                            <div style={{ fontSize: 10, color: C.muted }}>{pat.icon} · 🇺🇸 {p.trend_us}</div>
                          </div>
                          <button onClick={() => setAdProduct(p)}
                            style={{ background: "rgba(240,180,41,0.12)", border: "1px solid rgba(240,180,41,0.2)", borderRadius: 8, padding: "4px 8px", color: C.gold, fontSize: 10, fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>
                            ✦ Pub
                          </button>
                        </div>
                      );
                    })}
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

          {/* Real data summary */}
          {realDataSummary && (
            <div style={{ margin: "12px 0 0", display: "flex", gap: 6, flexWrap: "wrap" }}>
              {realDataSummary.backendUsed && <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(74,222,128,0.1)", color: C.green, fontWeight: 700 }}>⚡ Données réelles</span>}
              <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(66,133,244,0.1)", color: "#4285f4", fontWeight: 600 }}>📈 {realDataSummary.trendsFound} trends</span>
              <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(255,153,0,0.1)", color: "#ff9900", fontWeight: 600 }}>📦 {realDataSummary.amazonMovers} movers</span>
              <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(255,69,0,0.1)", color: "#ff4500", fontWeight: 600 }}>👽 {realDataSummary.redditPosts} Reddit</span>
              <span style={{ fontSize: 10, padding: "4px 10px", borderRadius: 20, background: "rgba(255,107,53,0.1)", color: C.orange, fontWeight: 600 }}>🛒 {realDataSummary.aliSuggestions} Ali</span>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
            {[{ label: "Produits", value: stats?.total ?? "—", color: C.gold }, { label: "Score", value: stats?.avg ?? "—", color: C.text }, { label: "Opps", value: stats?.opps ?? "—", color: C.green }, { label: "Avance", value: stats ? `${stats.avgAdv}sem` : "—", color: C.purple }].map((s, i) => (
              <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "12px 8px", textAlign: "center" }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, marginBottom: 3 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: "uppercase" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ position: "relative", marginBottom: 12 }}>
            <input value={niche} onChange={e => setNiche(e.target.value)} onKeyDown={e => e.key === "Enter" && scan()}
              placeholder="Niche ou mot-clé..."
              style={{ width: "100%", fontFamily: "inherit", fontSize: 15, background: C.surface, color: C.text, border: `1px solid ${C.border}`, padding: "15px 48px 15px 16px", borderRadius: 16, outline: "none" }} />
            <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 18, opacity: 0.35 }}>🔍</span>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
            {[{ key: "all", label: "Tous" }, { key: "hot", label: "🔥 HOT" }, { key: "coming", label: "⏳ À Venir" }, { key: "long_ad", label: "📺 Pub 30j+" }, { key: "virgin", label: "🆕 Vierge" }].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{ fontFamily: "inherit", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", padding: "9px 14px", borderRadius: 22, border: "none", cursor: "pointer", background: filter === f.key ? C.gold : C.surface, color: filter === f.key ? "#0a0905" : C.muted, boxShadow: filter === f.key ? `0 2px 12px rgba(240,180,41,0.25)` : "none" }}>
                {f.label}
              </button>
            ))}
          </div>

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

          {filtered.length === 0 && !loading && (
            <div style={{ textAlign: "center", padding: "40px 20px 60px" }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>📡</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.text, opacity: 0.35, marginBottom: 8 }}>
                {backendOnline ? "Backend connecté — Prêt à scanner !" : "Prêt à scanner"}
              </div>
              {backendOnline && (
                <div style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 12, padding: 12, textAlign: "left" }}>
                  <div style={{ fontSize: 11, color: C.green, fontWeight: 700, marginBottom: 8 }}>⚡ Sources actives en temps réel</div>
                  {[{ icon: "📈", label: "Google Trends FR & US" }, { icon: "📦", label: "Amazon Movers & Shakers" }, { icon: "👽", label: "9 subreddits" }, { icon: "🛒", label: "AliExpress" }, { icon: "🤖", label: "Analyse IA Claude" }].map((s, i) => (
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
              {filtered.length} produit{filtered.length > 1 ? "s" : ""}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingBottom: 40 }}>
            {filtered.map((p, i) => {
              const isOpen = expanded === i;
              const sc = scoreColor(p.score);
              const tab = getTab(i);
              const pat = PATTERN_MAP[p.pattern] || PATTERN_MAP.geo_delay;
              const ad = adInfo(p.ad_duration_days);

              return (
                <div key={i} style={{ background: C.surface, border: `1px solid ${isOpen ? C.goldDim : C.border}`, borderRadius: 20, overflow: "hidden", boxShadow: isOpen ? `0 6px 28px rgba(240,180,41,0.08)` : "none" }}>
                  {isOpen && (
                    <div style={{ position: "relative", height: 150, overflow: "hidden", background: C.surface2 }}>
                      <img src={imgUrl(p.image_query)} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.8 }} onError={e => e.target.style.display = "none"} />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(18,16,10,0.95) 0%, transparent 50%)" }} />
                      <div style={{ position: "absolute", top: 10, left: 12, display: "flex", gap: 5, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: p.tag === "HOT" ? "linear-gradient(135deg,#ff4444,#ff6b35)" : "linear-gradient(135deg,#7c6fff,#9b7fff)", color: "#fff" }}>{p.tag === "HOT" ? "🔥 HOT" : "⏳ À VENIR"}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: `${pat.color}CC`, color: "#fff" }}>{pat.icon} {pat.label}</span>
                        {p.advance_weeks > 0 && <span style={{ fontSize: 10, fontWeight: 800, padding: "4px 10px", borderRadius: 20, background: "rgba(155,127,255,0.85)", color: "#fff" }}>⏱ {p.advance_weeks}sem</span>}
                      </div>
                      <div style={{ position: "absolute", top: 10, right: 12, width: 42, height: 42, borderRadius: "50%", background: "rgba(10,9,5,0.85)", border: `2px solid ${sc}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: sc }}>{p.score}</span>
                      </div>
                    </div>
                  )}

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
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: `${pat.color}15`, color: pat.color }}>{pat.icon}</span>
                          <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: ad.bg, color: ad.color }}>📺 {ad.label}</span>
                        </>}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 11, color: C.muted }}>🇫🇷 {p.trend_fr || p.trend}</span>
                        <span style={{ fontSize: 11, color: C.green, fontWeight: 700 }}>🇺🇸 {p.trend_us}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, alignSelf: "center" }} />
                        <span style={{ fontSize: 11, color: satColor(p.saturation_level) }}>{p.saturation_fr}</span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, alignSelf: "center" }} />
                        <span style={{ fontSize: 11, color: C.muted }}>{p.price_range}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 18, color: C.muted, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.25s" }}>⌄</div>
                  </div>

                  {isOpen && (
                    <div style={{ borderTop: `1px solid ${C.border}` }}>
                      {/* Google Trends real data indicator */}
                      {(p.google_trend_score_fr || p.google_trend_score_us) && (
                        <div style={{ margin: "10px 16px 0", background: "rgba(66,133,244,0.08)", border: "1px solid rgba(66,133,244,0.2)", borderRadius: 12, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, color: "#4285f4", fontWeight: 700, marginBottom: 8 }}>📈 Google Trends Réel</div>
                          <div style={{ display: "flex", gap: 12 }}>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: C.blue }}>{p.google_trend_score_fr || "—"}</div>
                              <div style={{ fontSize: 9, color: C.muted }}>Score FR</div>
                            </div>
                            <div style={{ fontSize: 18, color: C.muted, alignSelf: "center" }}>→</div>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{p.google_trend_score_us || "—"}</div>
                              <div style={{ fontSize: 9, color: C.muted }}>Score US</div>
                            </div>
                            {p.advance_weeks > 0 && (
                              <>
                                <div style={{ fontSize: 18, color: C.muted, alignSelf: "center" }}>→</div>
                                <div style={{ textAlign: "center" }}>
                                  <div style={{ fontSize: 18, fontWeight: 800, color: C.gold }}>{p.advance_weeks}sem</div>
                                  <div style={{ fontSize: 9, color: C.muted }}>Avance FR</div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div style={{ margin: "10px 16px 0", display: "flex", flexDirection: "column", gap: 8 }}>
                        <div style={{ background: `${pat.color}10`, border: `1px solid ${pat.color}25`, borderRadius: 12, padding: "10px 14px" }}>
                          <div style={{ fontSize: 10, color: pat.color, fontWeight: 700, marginBottom: 5 }}>{pat.icon} {pat.label}</div>
                          <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{p.pattern_analysis}</div>
                        </div>
                        {p.angle_analysis && (
                          <div style={{ background: "rgba(155,127,255,0.08)", border: "1px solid rgba(155,127,255,0.2)", borderRadius: 12, padding: "10px 14px" }}>
                            <div style={{ fontSize: 10, color: C.purple, fontWeight: 700, marginBottom: 5 }}>🎯 Angle inexploité</div>
                            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{p.angle_analysis}</div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, padding: "10px 16px 0" }}>
                        {[{ label: "🇺🇸 Trend", value: p.trend_us, color: C.green }, { label: "🇫🇷 Trend", value: p.trend_fr || p.trend, color: C.blue }, { label: "Coût Ali", value: p.cost_ali, color: C.orange }, { label: "Marge", value: p.margin, color: C.gold }].map((m, j) => (
                          <div key={j} style={{ background: C.surface2, borderRadius: 10, padding: "9px 6px", textAlign: "center" }}>
                            <div style={{ fontSize: 8, color: C.muted, marginBottom: 3 }}>{m.label}</div>
                            <div style={{ fontSize: 11, fontWeight: 800, color: m.color }}>{m.value}</div>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, padding: "6px 16px 0" }}>
                        <div style={{ background: "rgba(255,107,53,0.08)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(255,107,53,0.15)" }}>
                          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>🇺🇸 Sat. USA</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>{p.saturation_us}</div>
                        </div>
                        <div style={{ background: "rgba(74,222,128,0.08)", borderRadius: 10, padding: "9px 12px", border: "1px solid rgba(74,222,128,0.15)" }}>
                          <div style={{ fontSize: 9, color: C.muted, marginBottom: 3 }}>🇫🇷 Sat. France</div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: C.green }}>{p.saturation_fr}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", margin: "10px 16px 0", background: C.surface2, borderRadius: 12, padding: 4 }}>
                        {[{ key: "signals", label: "📡 Signaux" }, { key: "market", label: "📊 Marché" }, { key: "competitors", label: "🏪 Concurrents" }, { key: "angle", label: "✦ Marketing" }].map(t => (
                          <button key={t.key} onClick={() => setTab(i, t.key)}
                            style={{ flex: 1, fontFamily: "inherit", fontSize: 9, fontWeight: 700, padding: "8px 2px", borderRadius: 9, border: "none", cursor: "pointer", background: tab === t.key ? C.surface : "transparent", color: tab === t.key ? C.gold : C.muted, boxShadow: tab === t.key ? "0 1px 6px rgba(0,0,0,0.3)" : "none" }}>
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div style={{ padding: "12px 16px" }}>
                        {tab === "signals" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[{ icon: "📺", label: "Meta Ads", color: "#1877f2", value: p.meta_ads_signal }, { icon: "🎵", label: "TikTok US", color: "#69c9d0", value: p.tiktok_signal }, { icon: "👽", label: "Reddit", color: "#ff4500", value: p.reddit_signal }, { icon: "📦", label: "Amazon", color: "#ff9900", value: p.amazon_signal }, { icon: "🛒", label: "AliExpress", color: C.orange, value: p.aliexpress_signal }, { icon: "📌", label: "Pinterest", color: "#e60023", value: p.pinterest_signal }].filter(s => s.value).map((sig, k) => (
                              <div key={k} style={{ background: C.surface2, borderRadius: 12, padding: "11px 14px", borderLeft: `3px solid ${sig.color}` }}>
                                <div style={{ fontSize: 10, color: sig.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 5, fontWeight: 700 }}>{sig.icon} {sig.label}</div>
                                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{sig.value}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {tab === "market" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ background: C.surface2, borderRadius: 14, padding: 14, borderLeft: `3px solid ${C.gold}` }}>
                              <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>Analyse marché</div>
                              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{p.market_analysis}</div>
                            </div>
                            <div style={{ background: C.surface2, borderRadius: 14, padding: 14, borderLeft: `3px solid ${satColor(p.saturation_level)}` }}>
                              <div style={{ fontSize: 10, color: satColor(p.saturation_level), textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>Saturation US → FR</div>
                              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{p.saturation_detail}</div>
                            </div>
                          </div>
                        )}
                        {tab === "competitors" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {(p.competitors || []).map((c, k) => (
                              <div key={k} style={{ background: C.surface2, borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>{c.country} {c.name}</div>
                                  <div style={{ fontSize: 11, color: C.muted }}>{c.rating} · {c.sales}</div>
                                </div>
                                <div style={{ fontSize: 15, fontWeight: 800, color: C.gold }}>{c.price}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        {tab === "angle" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            <div style={{ background: C.surface2, borderRadius: 14, padding: 14, borderLeft: `3px solid ${C.gold}` }}>
                              <div style={{ fontSize: 10, color: C.gold, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>✦ Angle</div>
                              <div style={{ fontSize: 14, color: C.text, lineHeight: 1.7, fontStyle: "italic" }}>"{p.angle}"</div>
                            </div>
                            {p.angle_analysis && (
                              <div style={{ background: C.surface2, borderRadius: 14, padding: 14, borderLeft: `3px solid ${C.purple}` }}>
                                <div style={{ fontSize: 10, color: C.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>🎯 Angle inexploité</div>
                                <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{p.angle_analysis}</div>
                              </div>
                            )}
                            <div style={{ background: C.surface2, borderRadius: 14, padding: 14, borderLeft: `3px solid ${C.blue}` }}>
                              <div style={{ fontSize: 10, color: C.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, fontWeight: 700 }}>💡 Insight</div>
                              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.7 }}>{p.insight}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
                        <button onClick={() => setAdProduct(p)}
                          style={{ flex: 1, background: `linear-gradient(135deg,${C.goldDim},${C.gold})`, color: "#0a0905", border: "none", borderRadius: 12, padding: "11px 8px", fontSize: 12, fontWeight: 800, cursor: "pointer" }}>
                          ✦ Générer pubs
                        </button>
                        <a href={aliUrl(p.aliexpress_query)} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg,#e8501a,#ff6b35)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "11px 8px", borderRadius: 12 }}>
                          🛒 Ali
                        </a>
                        <a href={metaUrl(p.name)} target="_blank" rel="noopener noreferrer"
                          style={{ flex: 1, textDecoration: "none", textAlign: "center", background: "linear-gradient(135deg,#1565c0,#1877f2)", color: "#fff", fontSize: 12, fontWeight: 800, padding: "11px 8px", borderRadius: 12 }}>
                          📺 Spy
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
