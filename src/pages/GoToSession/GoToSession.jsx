import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {getAllSession} from "../../services/SessionApi.js";
import {format} from "date-fns";
import "./GoToSession.css";

export default function GoToSession() {
  const [sessionId, setSessionId] = useState("");
  const [sessions, setSessions] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSession()
      .then((res) => {
        setSessions(res.data.data || []);
        setErrorMessage(null);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          setErrorMessage(err.response.data.message);
        } else {
          setErrorMessage("Errore nel caricamento delle sessioni: server non raggiungibile");
        }
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!sessionId.trim()) return;
    navigate(`/session/${sessionId}`);
  };

  const handleSessionClick = (id) => {
    navigate(`/session/${id}`);
  };

  const formatWinners = (winners) => {
    if (!winners) return "—";

    // Caso 1: stringa (singolo vincitore o "Session not ended")
    if (typeof winners === "string") {
      return winners;
    }

    // Caso 2: array
    if (Array.isArray(winners)) {
      if (winners.length === 0) return "—";
      if (winners.length === 1) return winners[0];
      return winners.join(", "); // più vincitori
    }

    // Fallback
    return "—";
  }


  return (
    <div className="goto-session-container">
      <h2 className="goto-session-title">Accedi alla Sessione Live</h2>

      {errorMessage && (
        <div className="goto-session-error">{errorMessage}</div>
      )}

      <form onSubmit={handleSubmit} className="goto-session-form">
        <input
          type="number"
          className="goto-session-input"
          placeholder="Inserisci ID sessione"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          min="1"
          required
        />

        <button type="submit" className="goto-session-btn">
          Open
        </button>
      </form>

      <div className="goto-session-list-container">
        <h5 className="goto-session-subtitle">Sessioni disponibili:</h5>

        <ul className="session-list">
          {sessions.map((session) => (
            <li
              key={session.id}
              className="session-card"
              onClick={() => handleSessionClick(session.id)}
            >
              <div className="session-card-header">
                <span>
                  <strong>ID:</strong> {session.id}
                </span>
                <span>
                  <strong>Vincitore:</strong> {formatWinners(session.sessionWinners)}
                </span>
              </div>

              <div className="session-date">
                <small>
                  {session.sessionStartTime &&
                    `Inizio: ${format(new Date(session.sessionStartTime), "dd/MM/yyyy HH:mm")}`}
                  {session.sessionEndTime &&
                    ` • Fine: ${format(new Date(session.sessionEndTime), "dd/MM/yyyy HH:mm")}`}
                </small>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
