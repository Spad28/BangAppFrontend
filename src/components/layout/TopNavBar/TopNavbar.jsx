import { Link } from "react-router-dom";
import "./TopNavbar.css";

export default function TopNavbar() {
  return (
    <nav className="top-navbar">
      <Link className="brand" to="/">
        Bang! Online
      </Link>
    </nav>
  );
}
