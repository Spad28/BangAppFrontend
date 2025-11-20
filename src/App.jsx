import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pagine
import Home from "./pages/Home/Home.jsx";
import Session from "./pages/StartSession/StartSession.jsx";
import GoToSession from "./pages/GoToSession/GoToSession.jsx";
import SessionLive from "./pages/SessionLive/SessionLive.jsx";
import Score from "./pages/Score/Score.jsx";
import Rules from "./pages/Rules/Rules.jsx";
import Settings from "./pages/Settings/Settings.jsx";

// Componenti
import Footer from "./components/layout/Footer/Footer.jsx";
import TopNavbar from "./components/layout/TopNavbar/TopNavbar.jsx";
export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <TopNavbar />

        {/* Contenuto principale */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/session" element={<Session />} />
            <Route path="/goToSession" element={<GoToSession />} />
            <Route path="/session/:sessionId" element={<SessionLive />} />
            <Route path="/score" element={<Score />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}
