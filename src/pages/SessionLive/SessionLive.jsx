import {useState, useEffect, useRef, useCallback} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
  getSessionInfoFromId,
  getCumulativeSessionScore,
  endSession,
  getPlayersList
} from "../../services/SessionApi.js";
import {addNewMatch} from "../../services/MatchApi.js";
import "./SessionLive.css";

export default function SessionLive() {
  const {sessionId} = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");
  const [messageUpdateId, setMessageUpdateId] = useState(0);
  const messageRef = useRef(null);
  const formRef = useRef(null);
  const [ranking, setRanking] = useState({});
  const [showForm, setShowForm] = useState(false);

  const [playersRoles, setPlayersRoles] = useState([]);
  const [winner, setWinner] = useState("");
  const [winnerRole, setWinnerRole] = useState("");

  const roles = ["Sceriffo", "Vice", "Fuorilegge", "Rinnegato"];
  const [selectedPlayers, setSelectedPlayers] = useState(() => JSON.parse(sessionStorage.getItem("selectedPlayers") || "[]"));


  /**
   * Funzione helper per mostrare messaggi
   * Scroll e focus automatico se errore
   */
  const showMessage = useCallback((msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setMessageUpdateId(prev => prev + 1);
  }, []);

  const fetchPlayers = useCallback(() => {
    getPlayersList(sessionId)
      .then(res => {
        setSelectedPlayers(res.data.data);
        sessionStorage.setItem("selectedPlayers", JSON.stringify(res.data.data));
      })
      .catch(err => {
        if (err.response && err.response.data) {
          showMessage(err.response.data.message, "error");
        } else {
          showMessage("Errore nel caricamento della lista dei giocatori", "error");
        }
      });
  }, [sessionId, showMessage]);


  /** Fetch iniziale della sessione */
  const fetchSession = useCallback(() => {
    getSessionInfoFromId(sessionId)
      .then(res => setSession(res.data.data))
      .catch(err => {
        if (err.response && err.response.data) {
          showMessage(err.response.data.message, "error");
        } else {
          showMessage("Errore nel caricamento della sessione", "error");
        }
      });
  }, [sessionId, showMessage]);

  /** Fetch iniziale della classifica */
  const fetchRanking = useCallback(() => {
    getCumulativeSessionScore(sessionId)
      .then(res => {
        if (res.data.success) setRanking(res.data.data);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          showMessage(err.response.data.message, "error");
        } else {
          showMessage("Errore nel caricamento della classifica", "error");
        }
      });
  }, [sessionId, showMessage]);

  /** Fetch iniziale */
  useEffect(() => {
    fetchSession();
    fetchRanking();
  }, [fetchSession, fetchRanking]);

  /** Quando la sessione è disponibile */
  useEffect(() => {
    if (!session) return;

    if (session.sessionEndTime === null && selectedPlayers.length === 0) {
      fetchPlayers();
    }
  }, [session, selectedPlayers.length, fetchPlayers]);


  /** Reset form quando chiuso */
  useEffect(() => {
    if (!showForm) {
      setWinner("");
      setWinnerRole("");
      setPlayersRoles([]);
    }
  }, [showForm]);

  /** Click fuori dal form cancella messaggio */
  useEffect(() => {
    const handleClick = (event) => {
      if (message && formRef.current && !formRef.current.contains(event.target)) {
        setMessage(null);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [message]);

  useEffect(() => {
    if (message && messageType === "error" && messageRef.current) {
      messageRef.current.scrollIntoView({behavior: "smooth", block: "center"});
      messageRef.current.focus({preventScroll: true});
    }
  }, [message, messageType, messageUpdateId]);

  /** Fine sessione */
  const handleEndSession = () => {
    if (!ranking || Object.keys(ranking).length === 0) {
      showMessage("Impossibile terminare la sessione: classifica vuota", "error");
      return;
    }

    const sessionEndTime = new Date().toISOString();
    const entries = Object.entries(ranking);
    const maxScore = Math.max(...entries.map(entry => entry[1]));

    const sessionWinners = entries
      .filter(entry => entry[1] === maxScore)
      .map(entry => entry[0]);

    endSession(sessionId, sessionWinners, sessionEndTime)
      .then(() => {
        showMessage(`Sessione terminata. Vincitore: ${sessionWinners}`, "success");
        setTimeout(() => navigate("/"), 1500);
      })
      .catch(err => {
        if (err.response && err.response.data) {
          showMessage(err.response.data.message, "error");
        } else {
          showMessage("Errore nel terminare la sessione", "error");
        }
      });
  };

  /** Cambio ruolo giocatore */
  const handleRoleChange = (player, role) => {
    setPlayersRoles(prev => [...prev.filter(pr => pr.player !== player), {player, role}]);
    if (player === winner) setWinnerRole(role);
  };

  /** Salva match */
  const handleSaveMatch = () => {
    if (!winner || !winnerRole) {
      showMessage("Seleziona vincitore e ruolo vincitore", "error");
      return;
    }

    const matchData = {sessionId: Number(sessionId), winner, winnerRole, playersRoles};

    addNewMatch(matchData)
      .then(res => {
        showMessage(res.data.message, "success");
        setShowForm(false);
        fetchSession();
        fetchRanking();
      })
      .catch(err => {
        if (err.response && err.response.data) {
          showMessage(err.response.data.message, "error");
        } else {
          showMessage("Errore di rete o server non raggiungibile", "error");
        }
      });
  };

  if (!session) return <p className="sessionlive-loading">Caricamento sessione...</p>;

  return (
    <div className="sessionlive-container">
      <h2 className="sessionlive-title">Sessione Live</h2>

      {message &&
        <div
          ref={messageRef}
          tabIndex={-1}
          className={`sessionlive-message ${messageType}`}
          aria-live={messageType === "error" ? "assertive" : "polite"}
        >
          {message}
        </div>
      }

      <p className="sessionlive-subtitle"><strong>Session ID:</strong> {sessionId}</p>

      <div className="sessionlive-section">
        <h5>Match presenti: {session.matchList?.length || 0}</h5>
        <div className="sessionlive-table-wrapper">
          <table className="sessionlive-table">
            <thead>
            <tr>
              <th>ID Match</th>
              <th>Vincitore</th>
              <th>Ruolo Vincitore</th>
            </tr>
            </thead>
            <tbody>
            {session.matchList?.length ? (
              session.matchList.map(match => (
                <tr key={match.matchId}>
                  <td>{match.matchId}</td>
                  <td>{match.winner}</td>
                  <td>{match.winnerRole}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Nessun match presente</td>
              </tr>
            )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sessionlive-actions">
        {session.sessionEndTime ? (
          <button className="sessionlive-btn secondary" onClick={() => navigate("/goToSession")}>
            Torna Indietro
          </button>
        ) : (
          <>
            <button className="sessionlive-btn danger" onClick={handleEndSession}>
              Termina Sessione
            </button>
            <button className="sessionlive-btn primary" onClick={() => setShowForm(true)}>
              Aggiungi Match
            </button>
          </>
        )}
      </div>

      {showForm && (
        <div ref={formRef} className="sessionlive-card" onClick={() => setMessage(null)}>
          <h3>Aggiungi Match</h3>

          <div className="sessionlive-form-group">
            <label><strong>Vincitore:</strong></label>
            <div className="sessionlive-players">
              {selectedPlayers.map(player => (
                <button
                  key={player}
                  type="button"
                  className={`sessionlive-btn ${winner === player ? "success" : "outline"}`}
                  onClick={() => {
                    setWinner(player);
                    const roleObj = playersRoles.find(pr => pr.player === player);
                    setWinnerRole(roleObj ? roleObj.role : "");
                  }}
                >
                  {player}
                </button>
              ))}
              {selectedPlayers.length !== 4 && (
                <button
                  type="button"
                  className={`sessionlive-btn ${winner === "forfait" ? "success" : "outline"}`}
                  onClick={() => {
                    setWinner("forfait");
                    setWinnerRole("forfait");
                  }}
                >
                  Forfait
                </button>
              )}
            </div>
          </div>

          <h4>Associa ruoli ai giocatori</h4>
          {selectedPlayers.map(player => (
            <div key={player} className="sessionlive-form-group flex">
              <span className="sessionlive-player-name">{player}</span>
              <select
                className="sessionlive-select"
                value={playersRoles.find(pr => pr.player === player)?.role || ""}
                onChange={e => handleRoleChange(player, e.target.value)}
              >
                <option value="">Seleziona ruolo</option>
                {roles.map(role => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
          ))}

          <div className="sessionlive-form-actions">
            <button className="sessionlive-btn success" onClick={handleSaveMatch}>Salva Match</button>
            <button className="sessionlive-btn secondary" onClick={() => setShowForm(false)}>Annulla</button>
          </div>
        </div>
      )}

      <div className="sessionlive-section">
        <h5>Classifica</h5>
        {ranking && Object.keys(ranking).length > 0 ? (
          <table className="sessionlive-table">
            <thead>
            <tr>
              <th>Giocatore</th>
              <th>Punteggio</th>
            </tr>
            </thead>
            <tbody>
            {Object.entries(ranking).sort((a, b) => b[1] - a[1]).map(([player, score]) => (
              <tr key={player}>
                <td>{player}</td>
                <td>{score}</td>
              </tr>
            ))}
            </tbody>
          </table>
        ) : (<p>Nessuna classifica disponibile</p>)}
      </div>
    </div>
  );
}
