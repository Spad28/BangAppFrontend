import { Link } from "react-router-dom";
import BangLogo from "../../assets/images/LogoBang.png";
import "./Home.css";

export default function Home() {
  return (
    <main className="home-root">
      <div className="hero container">
        <header className="hero-top">
          <img src={BangLogo} alt="Bang Logo" className="logo" />
          <h1 className="sr-only">Bang! Online</h1>
        </header>

        <section className="hero-card">
          <p className="lead">
            Controllare i punteggi o inizia una nuova partita
            <span className="muted">
              Se sei indeciso, controlla le regole — non fare la Ballistata.
            </span>
          </p>

          <nav className="actions" aria-label="Navigazione principale">
            <Link to="/session" className="btn btn-newSession">Nuova Sessione</Link>
            <Link to="/goToSession" className="btn btn-loadSession">Carica Sessione</Link>
            <Link to="/score" className="btn btn-score">Score</Link>
            <Link to="/rules" className="btn btn-rules">Regole</Link>
            <Link to="/settings" className="btn btn-settings">Impostazioni</Link>
          </nav>
        </section>
      </div>
    </main>
  );
}
