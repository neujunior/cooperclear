import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

import LOGO_DARK from './assets/logo-fundo-claro.png';
import LOGO_LIGHT from './assets/logo-fundo-escuro.png';

const TARIFAS = [
  { id: "verde",   label: "Verde",      add: 0,       cor: "#22c55e", corEscura: "#16a34a" },
  { id: "amarela", label: "Amarela",    add: 0.01885, cor: "#eab308", corEscura: "#ca8a04" },
  { id: "v1",      label: "Vermelha 1", add: 0.04463, cor: "#f97316", corEscura: "#ea580c" },
  { id: "v2",      label: "Vermelha 2", add: 0.07877, cor: "#ef4444", corEscura: "#dc2626" },
];

function calcular(consumo, iluminacao) {
  const valorKwhBase   = consumo * 0.8703;
  const valorInjetado  = consumo * 0.611619;
  const impostoBase    = valorKwhBase - valorInjetado;
  const ecoVerde       = valorKwhBase - (impostoBase + consumo * 0.5189);
  const fatSem         = valorKwhBase + iluminacao;
  const fatCom         = consumo * 0.5189 + impostoBase + iluminacao;

  return TARIFAS.map((t) => {
    const eco = ecoVerde + consumo * t.add;
    const base = valorInjetado + consumo * t.add;
    const pct  = base > 0 ? (eco / base) * 100 : 0;
    return { ...t, eco, pct, fatSem: fatSem + consumo * t.add, fatCom: fatCom + consumo * t.add };
  });
}

function moeda(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const CustomTooltip = ({ active, payload, dark }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div style={{
        background: dark ? "#1e293b" : "#fff",
        border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
        borderRadius: 10, padding: "10px 14px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        fontSize: 13, color: dark ? "#f1f5f9" : "#1e293b"
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{d.label}</div>
        <div>Economia: <b>{moeda(d.eco)}</b></div>
        <div>Percentual: <b>{d.pct.toFixed(2)}%</b></div>
      </div>
    );
  }
  return null;
};

export default function App() {
  const [consumo, setConsumo]       = useState("");
  const [iluminacao, setIluminacao] = useState("");
  const [dark, setDark]             = useState(false);
  const [resultados, setResultados] = useState(null);
  const [animado, setAnimado]       = useState(false);
  const [copiado, setCopiado]       = useState(false);
  const [activeBar, setActiveBar]   = useState(null);
  const resultRef = useRef(null);

  useEffect(() => {
    const c = parseFloat(consumo);
    const i = parseFloat(iluminacao) || 0;
    if (c > 0) {
      setAnimado(false);
      setTimeout(() => {
        setResultados(calcular(c, i));
        setAnimado(true);
      }, 80);
    } else {
      setResultados(null);
      setAnimado(false);
    }
  }, [consumo, iluminacao]);

  function compartilhar() {
    if (!resultados) return;
    const c = parseFloat(consumo);
    const linha = resultados.map(r =>
      `${r.label}: ${moeda(r.eco)} (${r.pct.toFixed(1)}%)`
    ).join("\n");
    const texto = `🌿 Simulador CooperClear\nConsumo: ${c} kWh\n\n${linha}`;
    if (navigator.share) {
      navigator.share({ title: "CooperClear", text: texto }).catch(() => {});
    } else {
      navigator.clipboard.writeText(texto).then(() => {
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
      });
    }
  }

  const bg      = dark ? "#0f172a" : "#f8fafc";
  const surface = dark ? "#1e293b" : "#ffffff";
  const border  = dark ? "#334155" : "#e2e8f0";
  const texto   = dark ? "#f1f5f9" : "#0f172a";
  const sub     = dark ? "#94a3b8" : "#64748b";
  const inputBg = dark ? "#0f172a" : "#f8fafc";

  const verde = resultados?.[0];
  const chartData = resultados?.map(r => ({ ...r, value: r.eco }));

  return (
    <div style={{
      minHeight: "100vh", background: bg, fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      transition: "background 0.3s", padding: "20px 16px 40px"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 440, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <img
              src={dark ? LOGO_DARK : LOGO_LIGHT}
              alt="CooperClear"
              style={{ height: 48, width: "auto", objectFit: "contain" }}
            />
          </div>
          <button
            onClick={() => setDark(!dark)}
            style={{
              width: 40, height: 40, borderRadius: 12,
              background: dark ? "#334155" : "#f1f5f9",
              border: `1px solid ${border}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, transition: "all 0.2s", color: texto
            }}
          >
            {dark ? "☀️" : "🌙"}
          </button>
        </div>

        {/* Inputs */}
        <div style={{
          background: surface, borderRadius: 20, padding: 24,
          border: `1px solid ${border}`, marginBottom: 16,
          boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: sub, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Consumo Mensal
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={consumo}
                onChange={e => setConsumo(e.target.value)}
                inputMode="numeric"
                placeholder="0"
                style={{
                  width: "100%", padding: "14px 48px 14px 16px",
                  background: inputBg, border: `1.5px solid ${consumo ? "#22c55e" : border}`,
                  borderRadius: 12, fontSize: 20, fontWeight: 600, color: texto,
                  boxSizing: "border-box", outline: "none",
                  fontFamily: "'DM Mono', monospace", transition: "border-color 0.2s"
                }}
              />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 600, color: sub }}>
                kWh
              </span>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: sub, textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Iluminação Pública
            </label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                value={iluminacao}
                onChange={e => setIluminacao(e.target.value)}
                inputMode="decimal"
                placeholder="0,00"
                style={{
                  width: "100%", padding: "14px 48px 14px 16px",
                  background: inputBg, border: `1.5px solid ${iluminacao ? "#22c55e" : border}`,
                  borderRadius: 12, fontSize: 20, fontWeight: 600, color: texto,
                  boxSizing: "border-box", outline: "none",
                  fontFamily: "'DM Mono', monospace", transition: "border-color 0.2s"
                }}
              />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 600, color: sub }}>
                R$
              </span>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {resultados && animado && (
          <div ref={resultRef}>

            {/* Resumo fatura */}
            <div style={{
              background: surface, borderRadius: 20, padding: 20,
              border: `1px solid ${border}`, marginBottom: 12,
              display: "flex", gap: 12,
              boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: sub, textTransform: "uppercase", marginBottom: 4 }}>
                  Sem Cooperativa
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#ef4444", fontFamily: "'DM Mono', monospace" }}>
                  {moeda(verde.fatSem)}
                </div>
              </div>
              <div style={{ width: 1, background: border }} />
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: sub, textTransform: "uppercase", marginBottom: 4 }}>
                  Com Cooperativa
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#22c55e", fontFamily: "'DM Mono', monospace" }}>
                  {moeda(verde.fatCom)}
                </div>
              </div>
            </div>

            {/* Cards de economia */}
            {resultados.map((r, i) => (
              <div
                key={r.id}
                style={{
                  background: surface, borderRadius: 16, padding: "16px 20px",
                  border: `1px solid ${border}`, marginBottom: 10,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
                  opacity: animado ? 1 : 0,
                  transform: animado ? "translateY(0)" : "translateY(12px)",
                  transition: `opacity 0.35s ease ${i * 0.07}s, transform 0.35s ease ${i * 0.07}s`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background: r.cor, boxShadow: `0 0 8px ${r.cor}80`
                  }} />
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: sub, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>
                      {r.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: texto, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
                      {moeda(r.eco)}
                    </div>
                  </div>
                </div>
                <div style={{
                  background: `${r.cor}20`, color: r.cor,
                  padding: "6px 12px", borderRadius: 8,
                  fontSize: 14, fontWeight: 700, fontFamily: "'DM Mono', monospace"
                }}>
                  {r.pct.toFixed(1)}%
                </div>
              </div>
            ))}

            {/* Gráfico */}
            <div style={{
              background: surface, borderRadius: 20, padding: 20,
              border: `1px solid ${border}`, marginBottom: 12,
              boxShadow: dark ? "none" : "0 1px 3px rgba(0,0,0,0.05)"
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.5, color: sub, textTransform: "uppercase", marginBottom: 16 }}>
                Comparativo por Bandeira
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barCategoryGap="30%" onMouseLeave={() => setActiveBar(null)}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: sub, fontWeight: 600 }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip dark={dark} />} cursor={{ fill: "transparent" }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} onMouseEnter={(_, idx) => setActiveBar(idx)}>
                    {chartData.map((entry, idx) => (
                      <Cell
                        key={entry.id}
                        fill={entry.cor}
                        opacity={activeBar === null || activeBar === idx ? 1 : 0.45}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Botão compartilhar */}
            <button
              onClick={compartilhar}
              style={{
                width: "100%", padding: "15px",
                background: dark ? "#1e293b" : "#0f172a",
                color: dark ? "#f1f5f9" : "#ffffff",
                border: `1.5px solid ${border}`,
                borderRadius: 14, fontSize: 14, fontWeight: 600,
                letterSpacing: 0.5, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "all 0.2s"
              }}
            >
              {copiado ? "✅ Copiado!" : "↗ Compartilhar Resultado"}
            </button>

          </div>
        )}

        {/* Estado vazio */}
        {!resultados && (
          <div style={{ textAlign: "center", padding: "40px 0", color: sub }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚡</div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>
              Digite o consumo para ver<br />sua economia em tempo real
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
