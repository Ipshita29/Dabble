import { useEffect } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Hint from "./pages/Hint.jsx";

export default function App() {
  const { pathname, hash } = useLocation();

  // Scroll to the section named in the URL hash, otherwise to the top of the new page
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: "smooth" });
    else window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <div className="site">
      <div className="top-bg" />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/hint" element={<Hint />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-intro">
            <h2>
              Try a little.
              <br />
              Discover a lot.
            </h2>
            <p>Dabble is a little corner of the internet for when you’re bored, curious, or both.</p>
          </div>
          <div className="footer-col">
            <h3>Dabble</h3>
            <Link to="/#about">About</Link>
            <a href="https://github.com/Ipshita29/Dabble" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
        <div className="footer-mark" aria-hidden="true">
          Dabble
        </div>
        <div className="cloud cloud-footer-a" />
        <div className="cloud cloud-footer-b" />
      </footer>
    </div>
  );
}
