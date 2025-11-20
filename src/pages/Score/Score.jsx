import { useState, useEffect } from "react";
import { getPlayerClassification } from "../../services/StatistiqueAPi.js";
import "./Score.css";

export default function Score() {
  const [classification, setClassification] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    getPlayerClassification()
      .then((res) => {
        const data = res.data.data || {};
        const list = Object.entries(data).map(([name, score]) => ({ name, score }));
        list.sort((a, b) => b.score - a.score);
        setClassification(list);
        setErrorMessage(null);
      })
      .catch((err) => {
        console.error(err);
        setErrorMessage("Errore nel caricamento della classifica: server non raggiungibile");
      });
  }, []);

  return (
    <div className="score-container">
      <h2 className="score-title">Classifica Giocatori</h2>

      {errorMessage && (
        <div className="score-error">{errorMessage}</div>
      )}

      <div className="score-table-wrapper">
        <table className="score-table">
          <thead>
            <tr>
              <th>Giocatore</th>
              <th>Match Vinti</th>
            </tr>
          </thead>
          <tbody>
            {classification.map((c, index) => (
              <tr key={index}>
                <td>{c.name}</td>
                <td>{c.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
