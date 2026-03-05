import { useEffect, useState, useCallback } from "react";

const KONAMI_CODE = [
  "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
  "b", "a",
];

const WORDS = [
  "OTO", "OTO", "OTOP", "OTOPOTO", "OTOPOTO", "!!!!!",
  "RA", "RA", "RA",
  "OTO", "OTOPOTO", "RA", "!!!!!", "OTO", "RA",
  "OTOP", "OTOPOTO", "RA", "RA", "OTO", "!!!!!",
];

const RAINBOW = [
  "#ff0000", "#ff7700", "#ffff00", "#00ff00",
  "#0088ff", "#4400ff", "#aa00ff",
];

interface FloatingWord {
  id: number;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotSpeed: number;
}

export function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const [inputIndex, setInputIndex] = useState(0);

  // Listen for Konami code
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (active) return;
      if (e.key === KONAMI_CODE[inputIndex]) {
        const next = inputIndex + 1;
        if (next === KONAMI_CODE.length) {
          setActive(true);
          setInputIndex(0);
        } else {
          setInputIndex(next);
        }
      } else {
        setInputIndex(e.key === KONAMI_CODE[0] ? 1 : 0);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [inputIndex, active]);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(() => setActive(false), 5000);
    return () => clearTimeout(t);
  }, [active]);

  if (!active) return null;

  return <EasterEggOverlay onDone={() => setActive(false)} />;
}

function EasterEggOverlay({ onDone }: { onDone: () => void }) {
  const [words, setWords] = useState<FloatingWord[]>([]);

  const initWords = useCallback(() => {
    return WORDS.map((text, i) => ({
      id: i,
      text,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
      color: RAINBOW[i % RAINBOW.length],
      size: 20 + Math.random() * 40,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
    }));
  }, []);

  useEffect(() => {
    setWords(initWords());

    let frameId: number;
    const animate = () => {
      setWords(prev =>
        prev.map(w => {
          let nx = w.x + w.vx;
          let ny = w.y + w.vy;
          let nvx = w.vx;
          let nvy = w.vy;

          if (nx < 0 || nx > 95) nvx = -nvx;
          if (ny < 0 || ny > 90) nvy = -nvy;
          nx = Math.max(0, Math.min(95, nx));
          ny = Math.max(0, Math.min(90, ny));

          return {
            ...w,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
            rotation: w.rotation + w.rotSpeed,
            color: RAINBOW[(RAINBOW.indexOf(w.color) + 1) % RAINBOW.length],
          };
        })
      );
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [initWords]);

  return (
    <div
      onClick={onDone}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        overflow: "hidden",
        cursor: "pointer",
      }}
    >
      {words.map(w => (
        <span
          key={w.id}
          style={{
            position: "absolute",
            left: `${w.x}%`,
            top: `${w.y}%`,
            color: w.color,
            fontSize: `${w.size}px`,
            fontWeight: 900,
            fontFamily: "system-ui, sans-serif",
            transform: `rotate(${w.rotation}deg)`,
            textShadow: `0 0 20px ${w.color}, 0 0 40px ${w.color}`,
            whiteSpace: "nowrap",
            userSelect: "none",
            pointerEvents: "none",
          }}
        >
          {w.text}
        </span>
      ))}
    </div>
  );
}
