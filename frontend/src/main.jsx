import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";
const navigation = ["Dashboard", "Recommendation Studio", "User Insights", "Product Explorer", "Model Lab", "System Health"];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateRecommendations() {
    setLoading(true); setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/recommendations/demo-user-001?k=3`);
      if (!response.ok) throw new Error("The recommendation service is unavailable.");
      setRecommendations((await response.json()).recommendations);
    } catch (requestError) { setError(requestError.message); } finally { setLoading(false); }
  }

  return <main className="app-shell">
    <aside className="sidebar"><div className="brand"><span>✦</span> RecomNova</div><p className="tagline">Context-aware discovery</p><nav>{navigation.map((item) => <button className={activePage === item ? "active" : ""} key={item} onClick={() => setActivePage(item)}>{item}</button>)}</nav><div className="mode">● DEMO MODE</div></aside>
    <section className="content"><header><div><p className="eyebrow">RECOMMENDATION PLATFORM</p><h1>{activePage}</h1></div><div className="status">API-ready foundation</div></header>
    <section className="hero"><p className="eyebrow">TODAY'S DISCOVERY</p><h2>Recommendations that feel considered.</h2><p>Start with a demo profile, then let RecomNova surface a relevant product set.</p><button className="primary" onClick={generateRecommendations} disabled={loading}>{loading ? "Generating..." : "Generate recommendations"}</button></section>
    {error && <p className="message error">{error}</p>}
    {recommendations.length > 0 && <section><div className="section-heading"><h2>For Aarav</h2><span>{recommendations.length} products</span></div><div className="cards">{recommendations.map((product) => <article className="product-card" key={product.article_id}><div className="product-image">{product.category.slice(0, 1)}</div><p className="eyebrow">{product.category} · {product.color}</p><h3>{product.name}</h3><p className="price">${product.price.toFixed(2)}</p><p className="reason">{product.reason}</p></article>)}</div></section>}
    {!recommendations.length && !loading && <p className="message">No recommendations loaded yet. Generate a demo set to verify the live API connection.</p>}</section>
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);
