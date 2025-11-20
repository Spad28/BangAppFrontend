import {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {getSessionInfoFromId, getSumSessionScore, endSession} from "../../services/SessionApi.js";
import {addMatch} from "../../services/MatchApi.js";
import "./SessionLive.css";

export default function SessionLive() {
  const {sessionId} = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // <--- stato per tipo messaggio
  const [ranking, setRanking] = useState({});
  const [showForm, setShowForm] = useState(false);

  const [playersRoles, setPlayersRoles] = useState([]);
  const [winner, setWinner] = useState("");
  const [winnerRole, setWinnerRole] = useState("");

  const roles = ["Sceriffo", "Vice", "Fuorilegge", "Rinnegato"];
  const selectedPlayers = JSON.parse(sessionStorage.getItem("selectedPlayers") || "[]");

  useEffect(() => {
    fetchSession();
    fetchRanking();
  }, []);

  useEffect(() => {
    if (showForm) {
      setWinner(null);
      setWinnerRole("");
      setPlayersRoles([]);
    }
  }, [showForm]);

  const fetchSession = () => {
    getSessionInfoFromId(sessionId)
      .then(res => setSession(res.data.data))
      .catch(() => {
        setMessage("Errore nel caricamento della sessione");
        setMessageType("error");
      });
  };

  const fetchRanking = () => {
    getSumSessionScore(sessionId)
      .then(res => {
        if (res.data.success) setRanking(res.data.data);
      })
      .catch(() => {
        setMessage("Errore nel caricamento della classifica");
        setMessageType("error");
      });
  };

  const handleEndSession = () => {
    if (!ranking || Object.keys(ranking).length === 0) {
      setMessage("Impossibile terminare la sessione: classifica vuota");
      setMessageType("error");
      return;
    }

    const sessionEndTime = new Date().toISOString();

    const entries = Object.entries(ranking); // [ [name, score], ... ]
    const maxScore = Math.max(...entries.map(entry => entry[1]));

    const sessionWinners = entries
      .filter(entry => entry[1] === maxScore)
      .map(entry => entry[0]); // prendi il nome


    endSession(sessionId, sessionWinners, sessionEndTime)
      .then(() => {
        setMessage(`Sessione terminata. Vincitore: ${sessionWinners}`);
        setMessageType("success");
        setTimeout(() => navigate("/"), 1500);
      })
      .catch(() => {
        setMessage("Errore nel terminare la sessione");
        setMessageType("error");
      });
  };

  const handleRoleChange = (player, role) => {
    setPlayersRoles(prev => [...prev.filter(pr => pr.player !== player), {player, role}]);
    if (player === winner) setWinnerRole(role);
  };

  const handleSaveMatch = () => {
    if (!winner || !winnerRole) {
      setMessage("Seleziona vincitore e ruolo vincitore");
      setMessageType("error");
      return;
    }

    const matchData = {
      sessionId: Number(sessionId),
      winner,
      winnerRole,
      playersRoles
    };

    addMatch(matchData)
      .then(res => {
        setMessage(res.data.message);
        setMessageType("success");
        setShowForm(false);
        fetchSession();
        fetchRanking();
      })
      .catch(() => {
        setMessage("Errore nell'aggiungere il match");
        setMessageType("error");
      });
  };

  if (!session) return <p className="sessionlive-loading">Caricamento sessione...</p>;

  return (
    <div className="sessionlive-container">
      <h2 className="sessionlive-title">Sessione Live</h2>

      {message && <div className={`sessionlive-message ${messageType}`}>{message}</div>}

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
          <button className="sessionlive-btn secondary" onClick={() => navigate("/")}>
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
        <div className="sessionlive-card">
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
