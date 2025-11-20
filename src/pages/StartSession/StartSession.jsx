import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getPlayers, addPlayer } from "../../services/PlayerApi.js";
import { createSession } from "../../services/SessionApi.js";
import "./StartSession.css";

export default function Session() {
  const [players, setPlayers] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success"); // <--- stato per tipo messaggio
  const navigate = useNavigate();

  useEffect(() => {
    getPlayers()
      .then(res => setPlayers(res.data.data))
      .catch(err => {
        console.error(err);
        setMessage("Errore nel caricamento dei giocatori");
        setMessageType("error");
      });
  }, []);

  const handleAddNewPlayer = () => {
    if (!newPlayer.trim()) return;

    addPlayer(newPlayer)
      .then(res => {
        const response = res.data;
        setMessage(response.message);
        setMessageType(response.success ? "success" : "error");

        if (response.success) {
          setPlayers(prev => [...prev, newPlayer]);
          setSelectedPlayers(prev => [...prev, newPlayer]);
          setNewPlayer("");
        }
      })
      .catch(err => {
        if (err.response && err.response.data) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Errore di rete o server non raggiungibile");
        }
        setMessageType("error");
      });
  };

  const handleStartSession = () => {
    const sessionStartTime = new Date().toISOString();
    const nPlayer = Number(selectedPlayers.length);

    createSession(sessionStartTime, nPlayer)
      .then(res => {
        const response = res.data;
        setMessage(response.message);
        setMessageType(response.success ? "success" : "error");

        if (response.success) {
          const sessionId = response.data;
          sessionStorage.setItem("sessionId", sessionId);
          sessionStorage.setItem("selectedPlayers", JSON.stringify(selectedPlayers));
          navigate(`/session/${sessionId}`);
        }
      })
      .catch(err => {
        if (err.response && err.response.data) {
          setMessage(err.response.data.message);
        } else {
          setMessage("Errore di rete o server non raggiungibile");
        }
        setMessageType("error");
      });
  };

  const togglePlayer = (name) => {
    if (selectedPlayers.includes(name)) {
      setSelectedPlayers(prev => prev.filter(p => p !== name));
    } else {
      setSelectedPlayers(prev => [...prev, name]);
    }
  };

  return (
    <div className="session-container">
      <h2 className="session-title">Nuova Sessione</h2>

      {message && <div className={`session-message ${messageType}`}>{message}</div>}

      {/* Giocatori esistenti */}
      <div className="session-section">
        <h5>Giocatori esistenti:</h5>
        <div className="player-list">
          {players.map((p, idx) => (
            <button
              key={idx}
              className={`player-btn ${selectedPlayers.includes(p) ? "selected" : ""}`}
              onClick={() => togglePlayer(p)}
              onTouchEnd={(e) => { e.preventDefault(); togglePlayer(p); }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Nuovo giocatore */}
      <div className="session-section new-player-section">
        <input
          type="text"
          value={newPlayer}
          onChange={e => setNewPlayer(e.target.value)}
          placeholder="Nome nuovo giocatore"
          className="new-player-input"
        />
        <button className="btn-add-player" onClick={handleAddNewPlayer}>
          Aggiungi
        </button>
      </div>

      {/* Avvia sessione */}
      <button
        className="btn-start-session"
        onClick={handleStartSession}
        disabled={!selectedPlayers.length}
      >
        Avvia Sessione
      </button>
    </div>
  );
}
