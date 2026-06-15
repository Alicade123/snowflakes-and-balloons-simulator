import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Snowflake, Wind, Play, Pause, RefreshCw, BarChart2, ShieldAlert } from "lucide-react";

interface SnowflakeParticle {
  id: string;
  left: number; // percentage width across screen (0 - 100)
  size: number; // medium size: 18px to 28px
  speed: number; // animation duration: 3.2s to 4.8s
  sway: number; // horizontal sway distance
  opacity: number; // randomized opacity for depth
  rotationSpeed: number; // seconds per full rotation
}

interface BalloonParticle {
  id: string;
  left: number; // percentage width across screen (0 - 100)
  size: number; // medium size: 42px to 54px
  speed: number; // animation duration: 3.5s to 4.8s
  sway: number; // horizontal sway distance
  color: string; // elegant color presets
  glowColor: string; // complementary glow color
  opacity: number;
}

export default function App() {
  // Effects activation states
  const [snowflakeActive, setSnowflakeActive] = useState(false);
  const [balloonActive, setBalloonActive] = useState(false);

  // Lists of active rendered particles
  const [snowflakes, setSnowflakes] = useState<SnowflakeParticle[]>([]);
  const [balloons, setBalloons] = useState<BalloonParticle[]>([]);

  // Sound effects toggle (using elegant web synth audio effects as custom feedback)
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Individual 5-second timers in milliseconds (5000ms)
  const [snowflakeTimeLeft, setSnowflakeTimeLeft] = useState(0);
  const [balloonTimeLeft, setBalloonTimeLeft] = useState(0);

  // Particle counters for summary telemetry
  const [snowflakesGenerated, setSnowflakesGenerated] = useState(0);
  const [balloonsGenerated, setBalloonsGenerated] = useState(0);

  // Refs for tracking active intervals and animations
  const snowflakeSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const balloonSpawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Play standard professional audio tick
  const playSynthChime = (type: "snowflake" | "balloon" | "click") => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      if (type === "snowflake") {
        // High, light crystalline tinkling sound
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
      } else if (type === "balloon") {
        // Soft, rising warm air sound
        oscillator.type = "triangle";
        oscillator.frequency.setValueAtTime(330, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(523.25, audioCtx.currentTime + 0.25);
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.4);
      } else {
        // Elegant UI click
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      console.warn("Audio Context not supported or allowed", e);
    }
  };

  // Timer loop that ticks down active effect runtimes at high-precision (every 10ms)
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setSnowflakeTimeLeft((prev) => {
        if (prev <= 10) {
          setSnowflakeActive(false);
          return 0;
        }
        return prev - 10;
      });

      setBalloonTimeLeft((prev) => {
        if (prev <= 10) {
          setBalloonActive(false);
          return 0;
        }
        return prev - 10;
      });
    }, 10);

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Snowflakes spawning manager
  useEffect(() => {
    if (snowflakeActive) {
      // Spawn instantly
      spawnSnowflake();
      // Configure interval to spawn snowflakes continuously over the duration
      snowflakeSpawnIntervalRef.current = setInterval(() => {
        spawnSnowflake();
      }, 140);
    } else {
      if (snowflakeSpawnIntervalRef.current) {
        clearInterval(snowflakeSpawnIntervalRef.current);
        snowflakeSpawnIntervalRef.current = null;
      }
    }

    return () => {
      if (snowflakeSpawnIntervalRef.current) clearInterval(snowflakeSpawnIntervalRef.current);
    };
  }, [snowflakeActive]);

  // Balloons spawning manager
  useEffect(() => {
    if (balloonActive) {
      // Spawn instantly
      spawnBalloon();
      // Configure interval to spawn balloons continuously over the duration
      balloonSpawnIntervalRef.current = setInterval(() => {
        spawnBalloon();
      }, 220);
    } else {
      if (balloonSpawnIntervalRef.current) {
        clearInterval(balloonSpawnIntervalRef.current);
        balloonSpawnIntervalRef.current = null;
      }
    }

    return () => {
      if (balloonSpawnIntervalRef.current) clearInterval(balloonSpawnIntervalRef.current);
    };
  }, [balloonActive]);

  // Snowflake particle spawn factory
  const spawnSnowflake = () => {
    const randomId = `snowflake_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newSnowflake: SnowflakeParticle = {
      id: randomId,
      left: Math.random() * 92 + 4, // keep inside safe viewport boundaries
      size: Math.random() * 10 + 16, // Medium range: 16px to 26px
      speed: Math.random() * 1.5 + 3.0, // 3.0s to 4.5s fall time
      sway: Math.random() * 80 + 40, // random pixels of wave drift
      opacity: Math.random() * 0.4 + 0.6, // clear, majestic opacity
      rotationSpeed: Math.random() * 6 + 4, // full rotate in 4-10s
    };

    setSnowflakes((prev) => [...prev, newSnowflake]);
    setSnowflakesGenerated((g) => g + 1);

    // Auto-remove once individual animation cycle ends
    setTimeout(() => {
      setSnowflakes((prev) => prev.filter((p) => p.id !== randomId));
    }, 5000);
  };

  // Balloon particle spawn factory
  const spawnBalloon = () => {
    // Array of luxury, formal colors with tailored glow attributes
    const balloonColors = [
      { fill: "#3b82f6", glow: "rgba(59,130,246,0.3)" }, // Slate Royal Blue
      { fill: "#f43f5e", glow: "rgba(244,63,94,0.3)" },  // Luxurious Rose Carmine
      { fill: "#10b981", glow: "rgba(16,185,129,0.3)" }, // Emerald Mint
      { fill: "#f59e0b", glow: "rgba(245,158,11,0.3)" }, // Matte Saffron Gold
      { fill: "#8b5cf6", glow: "rgba(139,92,246,0.3)" }, // Imperial Amethyst
      { fill: "#ec4899", glow: "rgba(236,72,153,0.3)" }, // Pearl Orchid Pink
    ];
    const pickedColorObj = balloonColors[Math.floor(Math.random() * balloonColors.length)];

    const randomId = `balloon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBalloon: BalloonParticle = {
      id: randomId,
      left: Math.random() * 88 + 6, // keep inside safe viewport margins
      size: Math.random() * 12 + 42, // Medium range: 42px to 54px width
      speed: Math.random() * 1.4 + 3.2, // 3.2s to 4.6s float time
      sway: Math.random() * 90 + 30, // horizontal wind wave
      color: pickedColorObj.fill,
      glowColor: pickedColorObj.glow,
      opacity: Math.random() * 0.2 + 0.8, // high presence
    };

    setBalloons((prev) => [...prev, newBalloon]);
    setBalloonsGenerated((g) => g + 1);

    // Auto-remove once individual animation completes
    setTimeout(() => {
      setBalloons((prev) => prev.filter((p) => p.id !== randomId));
    }, 5200);
  };

  // Button Click Triggers
  const handleSnowflakesClick = () => {
    playSynthChime("click");
    setTimeout(() => playSynthChime("snowflake"), 80);
    setSnowflakeTimeLeft(5000);
    setSnowflakeActive(true);
  };

  const handleBalloonsClick = () => {
    playSynthChime("click");
    setTimeout(() => playSynthChime("balloon"), 80);
    setBalloonTimeLeft(5000);
    setBalloonActive(true);
  };

  const handleReset = () => {
    playSynthChime("click");
    setSnowflakeActive(false);
    setBalloonActive(false);
    setSnowflakeTimeLeft(0);
    setBalloonTimeLeft(0);
    setSnowflakes([]);
    setBalloons([]);
  };

  // Human descriptive text for active items
  const isAnyActive = snowflakeActive || balloonActive;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100 font-sans flex flex-col items-center justify-between p-4 sm:p-6 md:p-8">
      
      {/* Dynamic Technological Grid Lines Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]" />

      {/* Outer ambient decorative glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[35rem] h-[35rem] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none z-0" />

      {/* SNOWFLAKE PARTICLE PREVIEW FIELD */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <AnimatePresence>
          {snowflakes.map((flake) => (
            <motion.div
              key={flake.id}
              initial={{ y: -50, x: `${flake.left}vw`, opacity: 0, scale: 0.8 }}
              animate={{
                y: "110vh",
                x: [
                  `${flake.left}vw`,
                  `${flake.left + (flake.sway / 30)}vw`,
                  `${flake.left - (flake.sway / 30)}vw`,
                  `${flake.left}vw`,
                ],
                opacity: [0, flake.opacity, flake.opacity, 0],
                scale: 1,
                rotate: 360,
              }}
              exit={{ opacity: 0 }}
              transition={{
                y: { duration: flake.speed, ease: "linear" },
                x: { duration: flake.speed, ease: "easeInOut", repeat: Infinity },
                rotate: { duration: flake.rotationSpeed, ease: "linear", repeat: Infinity },
                opacity: { duration: flake.speed, times: [0, 0.1, 0.85, 1], ease: "linear" },
                scale: { duration: 0.3 }
              }}
              className="absolute text-blue-200/90 filter drop-shadow-[0_0_8px_rgba(186,230,253,0.4)]"
              style={{ width: flake.size, height: flake.size }}
            >
              <Snowflake className="w-full h-full stroke-[1.25]" />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BALLOON PARTICLE PREVIEW FIELD */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        <AnimatePresence>
          {balloons.map((balloon) => (
            <motion.div
              key={balloon.id}
              initial={{ y: "110vh", x: `${balloon.left}vw`, opacity: 0, scale: 0.9 }}
              animate={{
                y: "-20vh",
                x: [
                  `${balloon.left}vw`,
                  `${balloon.left - (balloon.sway / 25)}vw`,
                  `${balloon.left + (balloon.sway / 25)}vw`,
                  `${balloon.left}vw`,
                ],
                opacity: [0, balloon.opacity, balloon.opacity, 0],
                scale: 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                y: { duration: balloon.speed, ease: "easeOut" },
                x: { duration: balloon.speed * 0.8, ease: "easeInOut", repeat: Infinity },
                opacity: { duration: balloon.speed, times: [0, 0.08, 0.88, 1], ease: "linear" },
                scale: { duration: 0.4 }
              }}
              className="absolute"
              style={{
                width: balloon.size,
                height: balloon.size * 1.3,
                color: balloon.color,
                filter: `drop-shadow(0 4px 12px ${balloon.glowColor})`
              }}
            >
              {/* Elegant Custom Glossy Balloon Vector */}
              <svg viewBox="0 0 100 130" fill="currentColor" className="w-full h-full">
                {/* Glossy Balloon Body */}
                <path d="M50 10 C 20 10, 12 55, 50 96 C 88 55, 80 10, 50 10 Z" />
                {/* Photorealistic light glare highlight */}
                <path d="M34 22 C 26 26, 24 38, 24 43 C 24 39, 27 28, 34 22" fill="rgba(255,255,255,0.3)" />
                {/* Lower Knot */}
                <polygon points="50,95 44,103 56,103 border-2" />
                {/* Waved Ribbon Thread */}
                <path d="M50 103 Q 47 112, 53 120 T 50 130" fill="none" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.4" />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* HEADER BAR - Sleek Corporate branding */}
      <header className="w-full max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800 pb-4 z-20">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center border border-slate-700">
            <Wind className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h1 className="text-sm font-display font-semibold tracking-wider text-slate-200 uppercase">
              Aero Dynamics
            </h1>
            <p className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
              Interactive Deck
            </p>
          </div>
        </div>

        {/* Audio feedback indicator */}
        <button
          onClick={() => {
            setSoundEnabled((s) => !s);
            playSynthChime("click");
          }}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border text-xs font-mono transition-all duration-300 ${
            soundEnabled
              ? "bg-slate-800/80 border-slate-700 text-emerald-400 hover:bg-slate-700/80"
              : "bg-slate-900/40 border-slate-800/80 text-slate-500 hover:text-slate-400 hover:bg-slate-900/80"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${soundEnabled ? "bg-emerald-400 animate-pulse" : "bg-slate-600"}`} />
          <span>AUDIO FX: {soundEnabled ? "ON" : "OFF"}</span>
        </button>
      </header>

      {/* MAIN CONTAINER PANEL */}
      <main className="w-full max-w-xl mx-auto flex-1 flex flex-col justify-center py-6 md:py-12 z-20">
        
        {/* Terminal Case Screen */}
        <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden p-6 md:p-8 flex flex-col space-y-6 md:space-y-8">
          
          {/* Deck Badge / Header Info */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded text-[9px] font-mono tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 uppercase mb-2">
                Atmospheric Control Panel
              </span>
              <h2 className="text-xl md:text-2xl font-display font-semibold text-slate-100 leading-tight">
                Particle Generator Studio
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select an atmospheric dynamic preset to spawn medium-sized physical objects.
              </p>
            </div>
            
            {/* Connection Status Pill */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500">SYSTEM STATE</span>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-mono font-medium text-emerald-400">READY</span>
              </div>
            </div>
          </div>

          {/* SIMULATION SUMMARY WIDGET */}
          <div className="grid grid-cols-2 gap-4 bg-slate-950/50 rounded-xl border border-slate-800/65 p-4 relative overflow-hidden">
            {/* Snowflakes status */}
            <div className="flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Snowflake Vector
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">5.0 Second Session</span>
              </div>
              
              <div className="mt-4 flex items-baseline space-x-2">
                {snowflakeActive ? (
                  <span className="text-2xl font-mono text-blue-400 font-semibold tracking-tight">
                    {(snowflakeTimeLeft / 1000).toFixed(2)}s
                  </span>
                ) : (
                  <span className="text-2xl font-mono text-slate-600 font-medium">0.00s</span>
                )}
                <span className="text-[10px] font-mono uppercase text-slate-500">rem</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-400 h-full transition-all duration-75 ease-linear"
                  style={{ width: `${(snowflakeTimeLeft / 5000) * 100}%` }}
                />
              </div>
            </div>

            {/* Balloons status */}
            <div className="flex flex-col justify-between border-l border-slate-850 pl-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                  Balloon Vector
                </span>
                <span className="text-xs text-slate-400 mt-0.5 block">5.0 Second Session</span>
              </div>

              <div className="mt-4 flex items-baseline space-x-2">
                {balloonActive ? (
                  <span className="text-2xl font-mono text-rose-400 font-semibold tracking-tight">
                    {(balloonTimeLeft / 1000).toFixed(2)}s
                  </span>
                ) : (
                  <span className="text-2xl font-mono text-slate-600 font-medium">0.00s</span>
                )}
                <span className="text-[10px] font-mono uppercase text-slate-500">rem</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-rose-400 h-full transition-all duration-75 ease-linear"
                  style={{ width: `${(balloonTimeLeft / 5000) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* TWO PRIMARY INTERACTIVE TRIGGER BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* SNOWFLAKES BUTTON (Cold-Blue Slate Accent) */}
            <button
              onClick={handleSnowflakesClick}
              disabled={snowflakeActive}
              className={`group relative flex flex-col justify-between text-left p-5 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                snowflakeActive
                  ? "bg-blue-500/10 border-blue-400/80 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
              }`}
            >
              {/* Internal glow aura on active */}
              {snowflakeActive && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-500 animate-shimmer" />
              )}

              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-lg border transition-all duration-300 ${
                  snowflakeActive
                    ? "bg-blue-500/20 border-blue-400 text-blue-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-300 group-hover:border-slate-700"
                }`}>
                  <Snowflake className={`w-5 h-5 ${snowflakeActive ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                </div>
                {snowflakeActive ? (
                  <span className="flex items-center space-x-1.5 text-[9px] font-mono bg-blue-400/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                    <span>FALLING</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider group-hover:text-slate-400">
                    SELECT
                  </span>
                )}
              </div>

              <div className="mt-8">
                <span className="block text-xs font-mono text-blue-400/70 uppercase tracking-widest font-semibold">
                  Aerosol Cold
                </span>
                <span className="block text-lg font-display font-semibold text-slate-100 mt-1">
                  Snowflakes
                </span>
                <span className="block text-[11px] text-slate-400 mt-1 leading-normal">
                  Cascades calibrated medium crystalline snowflakes from the ceiling downwards.
                </span>
              </div>
            </button>

            {/* BALLOONS BUTTON (Warm-Rose Crimson Accent) */}
            <button
              onClick={handleBalloonsClick}
              disabled={balloonActive}
              className={`group relative flex flex-col justify-between text-left p-5 rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer ${
                balloonActive
                  ? "bg-rose-500/10 border-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20"
                  : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50"
              }`}
            >
              {/* Internal glow aura on active */}
              {balloonActive && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 animate-shimmer" />
              )}

              <div className="flex items-center justify-between w-full">
                <div className={`p-2.5 rounded-lg border transition-all duration-300 ${
                  balloonActive
                    ? "bg-rose-500/20 border-rose-400 text-rose-300"
                    : "bg-slate-950 border-slate-800 text-slate-400 group-hover:text-slate-300 group-hover:border-slate-700"
                }`}>
                  <svg viewBox="0 0 100 130" className="w-5 h-5" fill="currentColor">
                    <path d="M50 10 C 20 10, 15 55, 50 95 C 85 55, 80 10, 50 10 Z" />
                    <circle cx="50" cy="99" r="4" fill="currentColor" />
                  </svg>
                </div>
                {balloonActive ? (
                  <span className="flex items-center space-x-1.5 text-[9px] font-mono bg-rose-400/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-400/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                    <span>FLOATING</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider group-hover:text-slate-400">
                    SELECT
                  </span>
                )}
              </div>

              <div className="mt-8">
                <span className="block text-xs font-mono text-rose-400/70 uppercase tracking-widest font-semibold">
                  Light Helium
                </span>
                <span className="block text-lg font-display font-semibold text-slate-100 mt-1">
                  Balloons
                </span>
                <span className="block text-[11px] text-slate-400 mt-1 leading-normal">
                  Floats a series of medium-sized luxury gloss balloons from the base upwards.
                </span>
              </div>
            </button>
            
          </div>

          {/* UTILITIES & STATS PANEL */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-6 space-y-4 sm:space-y-0">
            {/* Live active stats */}
            <div className="flex items-center space-x-6 w-full sm:w-auto justify-around sm:justify-start">
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Live Objects</span>
                <span className="text-sm font-mono font-medium text-slate-300">
                  {snowflakes.length + balloons.length}
                </span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-6 animate-pulse">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Total Logged</span>
                <span className="text-sm font-mono font-medium text-slate-300">
                  {snowflakesGenerated + balloonsGenerated}
                </span>
              </div>
              <div className="flex flex-col border-l border-slate-800 pl-6">
                <span className="text-[9px] font-mono text-slate-500 uppercase">Payload Size</span>
                <span className="text-sm font-mono font-medium text-blue-400 uppercase">Medium</span>
              </div>
            </div>

            {/* Clear Deck Button */}
            <button
              onClick={handleReset}
              disabled={!isAnyActive && snowflakes.length === 0 && balloons.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-xs font-mono transition-all duration-300 cursor-pointer ${
                isAnyActive || snowflakes.length > 0 || balloons.length > 0
                  ? "bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white"
                  : "bg-slate-900/20 border-slate-850 text-slate-600 cursor-not-allowed"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>TERMINATE ALL</span>
            </button>
          </div>

        </div>
      </main>

      {/* FOOTER - Sleek formal layout indicator */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between border-t border-slate-800 pt-4 pb-1 text-[11px] text-slate-500 font-mono z-20 space-y-1 sm:space-y-0">
        <div>
          <span>ENV PRESET: FORMAL MODE_V4</span>
        </div>
        <div>
          <span>REACTIVE SYSTEM 5.0S CLOCK MONITORING</span>
        </div>
      </footer>

    </div>
  );
}
