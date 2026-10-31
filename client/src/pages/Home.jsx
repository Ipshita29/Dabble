import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { animate, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const EASE = [0.62, 0, 0.12, 1.012];
const ABOUT_TEXT = "You don’t need a reason to try something new. You don’t need to be good at it. Just be curious.";

async function getTasks(count) {
  const res = await fetch(`${API}/api/tasks/random?count=${count}`);
  if (!res.ok) throw new Error(`Task request failed (${res.status})`);
  return res.json();
}

// Row height follows the viewport, like the reference's desktop / tablet / phone sizes
function useRowHeight() {
  const get = () => (window.innerWidth < 520 ? 92 : window.innerWidth < 860 ? 104 : 116);
  const [rowH, setRowH] = useState(get);
  useEffect(() => {
    const onResize = () => setRowH(get());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return rowH;
}

// One line of the reel: the centre row is sharp with a pink highlight, the others fade and blur
function Row({ task, index, y, rowH }) {
  const dist = useTransform(y, (v) => Math.min(Math.abs(index * rowH + v - rowH) / rowH, 1));
  const opacity = useTransform(dist, [0, 1], [1, 0.26]);
  const scale = useTransform(dist, [0, 1], [1, 0.94]);
  const filter = useTransform(dist, (d) => `blur(${d * 2.4}px)`);
  const highlight = useTransform(dist, [0, 0.5], [1, 0]);
  return (
    <motion.div className="reel-row" style={{ height: rowH, opacity, scale, filter, "--hl": highlight }}>
      <span className="reel-text">{task.task}</span>
    </motion.div>
  );
}

function Reveal() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.5"] });
  const words = ABOUT_TEXT.split(" ");
  return (
    <p className="reveal" ref={ref}>
      {words.map((word, i) => (
        <Word key={i} word={word} i={i} total={words.length} progress={scrollYProgress} reduce={reduce} />
      ))}
    </p>
  );
}

function Word({ word, i, total, progress, reduce }) {
  const start = i / total;
  const end = Math.min(start + 2.5 / total, 1);
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  const lift = useTransform(progress, [start, end], [6, 0]);
  const accent = /^(reason|curious\.?)$/.test(word);
  return (
    <>
      <motion.span className={accent ? "reveal-word script" : "reveal-word"} style={reduce ? undefined : { opacity, y: lift }}>
        {word}
      </motion.span>{" "}
    </>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const rowH = useRowHeight();
  const y = useMotionValue(0);
  const [reel, setReel] = useState(null); // the three visible tasks, centre is index 1
  const [seq, setSeq] = useState(null); // longer list rendered while spinning
  const [phase, setPhase] = useState("idle"); // idle | spinning | selected
  const [error, setError] = useState("");
  const autoShuffled = useRef(false);

  const load = () => {
    setError("");
    getTasks(3)
      .then(setReel)
      .catch((err) => {
        console.error("Could not load tasks", err);
        setError("Couldn’t reach the task server. Make sure it is running on port 5000.");
      });
  };
  useEffect(load, []);

  const shuffle = async () => {
    if (!reel || phase === "spinning") return;
    const previous = phase;
    setPhase("spinning");
    setError("");
    let batch;
    try {
      batch = await getTasks(10);
    } catch (err) {
      console.error("Could not shuffle tasks", err);
      setError("Couldn’t load a new task. Please try again.");
      setPhase(previous);
      return;
    }
    const [before, target, after, ...fillers] = batch.filter((t) => t.id !== reel[1].id);
    const list = [...reel, ...fillers, before, target, after];
    setSeq(list);
    y.set(0);
    await animate(y, -(list.length - 3) * rowH, { duration: 1.8, ease: EASE });
    flushSync(() => {
      setReel(list.slice(-3));
      setSeq(null);
    });
    y.set(0);
    setPhase("selected");
  };

  // "Shuffle again" on the hint page returns here and shuffles straight away
  useEffect(() => {
    if (reel && location.state?.shuffle && !autoShuffled.current) {
      autoShuffled.current = true;
      navigate("/", { replace: true, state: null });
      shuffle();
    }
  }, [reel]);

  const goHint = () => {
    const task = reel[1];
    try {
      sessionStorage.setItem("dabble:task", JSON.stringify(task));
    } catch (err) {
      console.warn("Dabble: could not store the selected task", err);
    }
    navigate("/hint", { state: { task } });
  };

  const rows = seq || reel;

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">
            A little bored?
            <br />
            <span className="script">Go Dabble.</span>
          </h1>
          <p className="hero-sub">
            Discover something unexpected. Try something you’ve never tried. Make today a little more interesting.
          </p>

          <div className="shuffler">
            <div className="reel" style={{ height: rowH * 3 }}>
              {rows && (
                <motion.div style={{ y }}>
                  {rows.map((task, i) => (
                    <Row key={`${i}-${task.id}`} task={task} index={i} y={y} rowH={rowH} />
                  ))}
                </motion.div>
              )}
            </div>
            {phase === "selected" && reel[1].description && <p className="task-description">{reel[1].description}</p>}

            <div className="actions">
              {phase === "selected" ? (
                <>
                  <button className="btn btn-dark" onClick={goHint}>
                    Need a hint?
                  </button>
                  <button className="btn btn-light" onClick={shuffle}>
                    Shuffle again
                  </button>
                </>
              ) : (
                <button className="btn btn-dark" onClick={shuffle} disabled={!reel || phase === "spinning"} style={{ visibility: phase === "spinning" ? "hidden" : "visible" }}>
                  Give me a task
                </button>
              )}
            </div>
            {error && (
              <p className="notice" role="alert">
                {error} {!reel && <button className="link-button" onClick={load}>Try again</button>}
              </p>
            )}
          </div>
        </div>
        <div className="cloud cloud-hero-a" />
        <div className="cloud cloud-hero-b" />
        <div className="cloud cloud-hero-c" />
        <div className="hero-fade" />
      </section>

      <section className="about" id="about">
        <span className="script about-eyebrow">why dabble</span>
        <Reveal />
      </section>
    </>
  );
}
