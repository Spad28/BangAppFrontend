import {useState, useEffect} from "react";
import {getClassification} from "../../services/StatistiqueAPi.js";
import {getMatchNumber} from "../../services/MatchApi.js";
import "./Score.css";

export default function Score() {
  const [classification, setClassification] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [matchNumber, setMatchNumber] = useState(0);


  useEffect(() => {
  Promise.all([getClassification(), getMatchNumber()])
    .then(([classificationRes, matchNumberRes]) => {
      // --- Gestione della classifica ---
      const data = classificationRes.data.data || {};
      const list = Object.entries(data).map(([name, stats]) => ({
        name,
        wins: stats.W,
        games: stats.PG,
        points: stats.P,
        winRate: stats.PG > 0 ? ((stats.W / stats.PG) * 100).toFixed(1) : 0 // opzionale
      }));

      list.sort((a, b) => {
        const ratioA = a.games > 0 ? a.points / a.games : 0;
        const ratioB = b.games > 0 ? b.points / b.games : 0;

        if (ratioB !== ratioA) return ratioB - ratioA;       // rapporto punti/partite decrescente
        if (b.points !== a.points) return b.points - a.points; // punti totali decrescente
        return b.games - a.games;                           // partite giocate decrescente
      });

      setClassification(list);

      // --- Gestione del numero di match ---
      setMatchNumber(matchNumberRes.data.data);

      // Reset eventuale messaggio di errore
      setErrorMessage(null);
    })
    .catch((err) => {
      console.error(err);
      setErrorMessage("Errore nel caricamento della classifica o del numero di match");
    });
}, []);


  return (
    <div className="score-container">
      <h2 className="score-title">Classifica Giocatori</h2>
      <h2 className="match-number">Totale Partite: {matchNumber}</h2>

      {errorMessage && (
        <div className="score-error">{errorMessage}</div>
      )}

      <div className="score-table-wrapper">
        <table className="score-table">
          <thead>
          <tr>
            <th>Giocatore</th>
            <th>Punti</th>
            <th>Match Vinti</th>
            <th>Partite Giocate</th>
            <th>W%</th>
          </tr>
          </thead>
          <tbody>
          {classification.map((c, index) => (
            <tr key={index}>
              <td>{c.name}</td>
              <td>{c.points}</td>
              <td>{c.wins}</td>
              <td>{c.games}</td>
              <td>{Math.round(c.games > 0 ? (c.wins / c.games) * 100 : 0)}%</td>
            </tr>
          ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}
