import { useState, useRef, useEffect } from "react";
import "./Chat.css";

const ATTITUDE_LABELS = {
  difficult: "actitud difícil (defensiva, agresiva o cuestionadora)",
  normal: "actitud normal (receptiva, reflexiva y analítica)",
  positive: "actitud positiva (concede más de lo necesario, dice sí a todo)",
};

const METHOD_INFO = {
  REFLEXION: {
    name: "Conversación para generar reflexión y aprendizaje",
    nameShort: "Reflexión y aprendizaje",
    desc: "Reporte / Alcance / Reflexión conjunta / Acuerdo de acciones",
    feedbackCriteria: [
      "Apertura de la conversación: claridad al abrir el contexto",
      "Reporte: planteamiento del incumplimiento con hechos concretos",
      "Alcance: muestra del impacto del incumplimiento",
      "Reflexión: preguntas abiertas para conocer la mirada del otro",
      "Acuerdo: generación de compromiso concreto, medible y con seguimiento",
    ],
  },
  DIRECTIVA: {
    name: "Conversación directiva para poner límites",
    nameShort: "Directiva para poner límites",
    desc: "Reporte / Alcance / Requerimiento / Acuerdo de acciones / Siguientes pasos",
    feedbackCriteria: [
      "Apertura de la conversación: claridad al abrir el contexto",
      "Reporte: planteamiento del incumplimiento con hechos concretos",
      "Alcance: muestra del impacto del incumplimiento",
      "Requerimiento: transmisión directa del requerimiento con verificación de comprensión",
      "Acuerdo: generación de compromiso concreto, medible y con seguimiento",
      "Siguientes pasos: especificación de consecuencias con condicionales, sin ser agresivo",
    ],
  },
};

function buildSystemPrompt(method, attitude) {
  const methodInfo = METHOD_INFO[method];
  return `Eres un colaborador de equipo en una conversación con tu líder directo. Tu líder quiere practicar una "${methodInfo.name}" (${methodInfo.desc}) para plantear un compromiso no cumplido contigo.

TU ACTITUD: ${ATTITUDE_LABELS[attitude]}

INSTRUCCIONES DE COMPORTAMIENTO:
- Responde SIEMPRE como el colaborador, nunca rompas el personaje.
- Eres una persona real del equipo. Tienes nombre genérico (puedes ser "Carlos" o "Claudia").
- Responde de forma breve y natural, sin ser excesivamente proactivo.
- Si el líder conduce bien la conversación, facilita la resolución. Si lo hace mal (se salta pasos, usa mal tono, no da hechos), dificulta la conversación según tu actitud.
- Si tienes actitud difícil: interrumpe, cuestiona, niega, desvía el tema, muéstrate defensivo.
- Si tienes actitud normal: escucha, responde honestamente, pero no facilites demasiado.
- Si tienes actitud positiva: acepta casi todo, quizás demasiado rápido, sin profundidad real.
- NO sugieras pasos al líder. NO menciones ningún método ni metodología. Solo reacciona naturalmente.
- Tus respuestas deben ser cortas (2-4 oraciones máximo).
- Al inicio, saluda brevemente y pregunta "¿de qué querías hablar?".`;
}

function buildFeedbackPrompt(method, messages) {
  const methodInfo = METHOD_INFO[method];
  const conversation = messages
    .filter((m) => m.role !== "system")
    .map((m) => `${m.role === "user" ? "LÍDER" : "COLABORADOR"}: ${m.content}`)
    .join("\n");

  const criteria = methodInfo.feedbackCriteria
    .map((c, i) => `${i + 1}. ${c}`)
    .join("\n");

  return `Eres un coach experto en liderazgo y comunicación. Analiza esta conversación donde el LÍDER practicó una "${methodInfo.name}" con un colaborador.

CRITERIOS DE EVALUACIÓN (${methodInfo.name}):
${criteria}

CONVERSACIÓN:
${conversation}

INSTRUCCIONES PARA EL FEEDBACK:
- Evalúa cada criterio indicando si fue bien ejecutado, qué faltó o qué mejorar.
- Sé constructivo pero honesto. No exijas excelencia, valora si lo hizo bien en términos generales.
- Si hay errores graves o pasos omitidos, mencionarlos claramente.
- Al final, da una nota de 0% a 100% coherente con el desempeño general.
- SIEMPRE termina con exactamente 2 tips concretos y accionables. Esta sección es obligatoria.

Responde en este formato exacto (en español). No omitas ninguna sección:

## Evaluación por criterio

[Para cada criterio: título en negrita, luego párrafo breve]

## Comentario general

[2-3 oraciones de resumen]

## Nota: XX%

[Una oración de justificación]

## Tips para mejorar

1. [Tip concreto 1: qué hacer exactamente la próxima vez]
2. [Tip concreto 2: qué hacer exactamente la próxima vez]`;
}

export default function Chat({ method, attitude, onReset }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState("chat");
  const [feedback, setFeedback] = useState("");
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const initialized = useRef(false);

  const methodInfo = METHOD_INFO[method];

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      initChat();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, feedback]);

  const initChat = async () => {
    setLoading(true);
    const systemPrompt = buildSystemPrompt(method, attitude);
    const initMessages = [{ role: "user", content: "Hola, ¿tienes un momento?" }];

    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemPrompt,
          messages: initMessages,
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "Hola, ¿de qué querías hablar?";
      setMessages([
        { role: "user", content: "Hola, ¿tienes un momento?" },
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages([
        { role: "user", content: "Hola, ¿tienes un momento?" },
        {
          role: "assistant",
          content: "Hola, claro. ¿De qué querías conversar?",
        },
      ]);
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: buildSystemPrompt(method, attitude),
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      const data = await response.json();
      const reply = data.content?.[0]?.text || "...";
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Perdona, no te escuché bien." },
      ]);
    }
    setLoading(false);
  };

  const requestFeedback = async () => {
    setPhase("loading-feedback");
    try {
      const response = await fetch("/api/anthropic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [
            {
              role: "user",
              content: buildFeedbackPrompt(method, messages),
            },
          ],
        }),
      });
      const data = await response.json();
      const fb = data.content?.[0]?.text || "No se pudo generar el feedback.";
      setFeedback(fb);
      setPhase("feedback");
    } catch {
      setFeedback("No se pudo generar el feedback en este momento.");
      setPhase("feedback");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const renderFeedback = (text) => {
    if (!text) return null;
    const lines = text.split("\n");
    let inTipsSection = false;
    return lines.map((line, i) => {
      if (line.startsWith("## ")) {
        const title = line.replace(/^##\s*/, "");
        if (title.toLowerCase().includes("tip")) inTipsSection = true;
        else inTipsSection = false;
        return <h3 key={i} className="fb-section">{title}</h3>;
      }
      if (!line.trim()) return null;
      // Bold-only lines = criterion title
      if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
        return (
          <p key={i} className="fb-criterion">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      // Numbered lines OR lines inside tips section
      if (/^\d[\.\)]/.test(line.trim()) || inTipsSection) {
        return (
          <p key={i} className="fb-tip">
            {line.replace(/\*\*/g, "")}
          </p>
        );
      }
      // Inline bold: render with <strong>
      if (line.includes("**")) {
        const parts = line.split(/\*\*/).map((part, j) =>
          j % 2 === 1 ? <strong key={j}>{part}</strong> : part
        );
        return <p key={i} className="fb-text">{parts}</p>;
      }
      return <p key={i} className="fb-text">{line}</p>;
    });
  };

  const attitudeEmoji =
    attitude === "difficult" ? "⚡" : attitude === "normal" ? "🤝" : "✅";
  const attitudeLabel =
    attitude === "difficult"
      ? "Difícil"
      : attitude === "normal"
      ? "Normal"
      : "Positiva";

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-info">
          <div className="chat-avatar">
            {method === "REFLEXION" ? "🌿" : "🎯"}
          </div>
          <div>
            <div className="chat-name">
              {methodInfo.nameShort}
            </div>
            <div className="chat-meta">
              Actitud: {attitudeEmoji} {attitudeLabel} ·{" "}
              <span className="chat-method-desc">{methodInfo.desc}</span>
            </div>
          </div>
        </div>
        <div className="chat-actions">
          <button className="action-btn" onClick={onReset} title="Menú inicial">
            ⬅ Menú
          </button>
          <button
            className="action-btn"
            onClick={() => {
              initialized.current = false;
              setMessages([]);
              setFeedback("");
              setPhase("chat");
              initialized.current = true;
              initChat();
            }}
            title="Reiniciar conversación"
          >
            🔄 Reiniciar
          </button>
          {phase === "chat" && (
            <button
              className="action-btn feedback-btn"
              onClick={requestFeedback}
              disabled={messages.length < 4}
              title="Pedir feedback"
            >
              📊 Feedback
            </button>
          )}
        </div>
      </div>

      {phase === "chat" && (
        <>
          <div className="messages-area">
            <div className="method-banner">
              <strong>{methodInfo.nameShort}</strong> · {methodInfo.desc}
            </div>
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`message ${
                  msg.role === "user" ? "message-user" : "message-bot"
                }`}
              >
                <div className="message-bubble">{msg.content}</div>
              </div>
            ))}
            {loading && (
              <div className="message message-bot">
                <div className="message-bubble typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            {messages.length >= 4 && (
              <div className="feedback-hint">
                Cuando estés listo, presiona{" "}
                <strong>📊 Feedback</strong> para recibir tu evaluación.
              </div>
            )}
            <div className="input-row">
              <textarea
                ref={textareaRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje… (Enter para enviar)"
                rows={2}
                disabled={loading}
              />
              <button
                className="send-btn"
                onClick={sendMessage}
                disabled={!input.trim() || loading}
              >
                ➤
              </button>
            </div>
          </div>
        </>
      )}

      {phase === "loading-feedback" && (
        <div className="feedback-loading">
          <div className="spinner" />
          <p>Analizando tu conversación…</p>
        </div>
      )}

      {phase === "feedback" && (
        <div className="feedback-container">
          <div className="feedback-header">
            <div className="feedback-title">
              📊 Evaluación de tu desempeño
            </div>
            <div className="feedback-subtitle">
              {methodInfo.nameShort} · Actitud {attitudeLabel}
            </div>
          </div>
          <div className="feedback-body">{renderFeedback(feedback)}</div>
          <div className="feedback-footer">
            <button className="action-btn" onClick={onReset}>
              ⬅ Ir al menú inicial
            </button>
            <button
              className="action-btn feedback-btn"
              onClick={() => {
                initialized.current = false;
                setMessages([]);
                setFeedback("");
                setPhase("chat");
                initialized.current = true;
                initChat();
              }}
            >
              🔄 Reiniciar conversación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

