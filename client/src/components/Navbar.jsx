import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="nav-wrap">
      <nav className="nav">
        <Link to="/" className="nav-logo">
          Dabble
        </Link>
        <div className="nav-links">
          <Link to="/#about">About</Link>
          <a href="mailto:hello@dabble.app">Contact</a>
        </div>
      </nav>
    </header>
  );
}
