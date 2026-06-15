import { useState } from "react";
import "./Menu.css";

const METHODS = [
  {
    id: "REFLEXION",
    title: "Conversación para generar reflexión y aprendizaje",
    subtitle: "Explorar juntos, entender y avanzar",
    steps: ["Reporte", "Alcance", "Reflexión conjunta", "Acuerdo de acciones"],
    description:
      "Para plantear un compromiso no cumplido con intención de reflexionar juntos, conocer su mirada y generar aprendizajes.",
    color: "teal",
  },
  {
    id: "DIRECTIVA",
    title: "Conversación directiva para poner límites",
    subtitle: "Marcar un límite y advertir consecuencias",
    steps: [
      "Reporte",
      "Alcance",
      "Requerimiento",
      "Acuerdo de acciones",
      "Siguientes pasos",
    ],
    description:
      "Para cuando ya no quieres conversar tanto, necesitas marcar un límite claro y advertir las consecuencias del incumplimiento.",
    color: "coral",
  },
];

const ATTITUDES = [
  {
    id: "difficult",
    icon: "⚡",
    label: "Actitud difícil",
    desc: "Defensiva, agresiva o cuestionadora",
  },
  {
    id: "normal",
    icon: "🤝",
    label: "Actitud normal",
    desc: "Receptiva, reflexiva y analítica",
  },
  {
    id: "positive",
    icon: "✅",
    label: "Actitud positiva",
    desc: "Concede más de lo necesario, dice sí a todo",
  },
];

export default function Menu({ onStart }) {
  const [step, setStep] = useState("method");
  const [selectedMethod, setSelectedMethod] = useState(null);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep("attitude");
  };

  const handleAttitudeSelect = (attitude) => {
    onStart(selectedMethod.id, attitude.id);
  };

  return (
    <div className="menu-container">
      <div className="menu-header">
        <div className="logo-badge">Simulador de liderazgo</div>
        <h1>Simulador de conversaciones</h1>
        <p>
          Practica cómo plantear compromisos no cumplidos con tu equipo,
          usando conversaciones estructuradas.
        </p>
      </div>

      {step === "method" && (
        <div className="menu-section">
          <div className="step-indicator">
            <span className="step active">1</span>
            <span className="step-line" />
            <span className="step">2</span>
          </div>
          <h2>¿Qué tipo de conversación quieres practicar?</h2>
          <div className="method-grid">
            {METHODS.map((m) => (
              <button
                key={m.id}
                className={`method-card method-${m.color}`}
                onClick={() => handleMethodSelect(m)}
              >
                <div className="method-badge">{m.subtitle}</div>
                <div className="method-title">{m.title}</div>
                <div className="method-subtitle">{m.subtitle}</div>
                <div className="method-steps">
                  {m.steps.map((s, i) => (
                    <div key={i} className="method-step">
                      <span className="step-num">{i + 1}</span>
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
                <div className="method-desc">{m.description}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === "attitude" && (
        <div className="menu-section">
          <button className="back-btn" onClick={() => setStep("method")}>
            ← Volver
          </button>
          <div className="step-indicator">
            <span className="step done">✓</span>
            <span className="step-line done" />
            <span className="step active">2</span>
          </div>
          <h2>¿Qué actitud tendrá tu colaborador?</h2>
          <p className="method-selected-label">
            Conversación seleccionada:{" "}
            <strong>{selectedMethod?.title}</strong>
          </p>
          <div className="attitude-grid">
            {ATTITUDES.map((a) => (
              <button
                key={a.id}
                className="attitude-card"
                onClick={() => handleAttitudeSelect(a)}
              >
                <div className="attitude-icon">{a.icon}</div>
                <div className="attitude-label">{a.label}</div>
                <div className="attitude-desc">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="menu-footer">
        <p>
          Recuerda: tú serás el líder. El chatbot responderá como un colaborador
          tuyo con la actitud que elijas.
        </p>
      </div>
    </div>
  );
}
