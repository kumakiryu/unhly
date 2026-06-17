import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { MeshBackground } from "./MeshBackground";
import { ParticleCanvas } from "./ParticleCanvas";
import { useAudio } from "./AudioProvider";
import unhoelyLogo from "../../imports/Unhoely_Logo__1_.png";

const SPLASH_MUSIC_URL = "";

export function SplashScreen() {
  const navigate = useNavigate();
  const { startSplashAudio } = useAudio();
  const [entered, setEntered] = useState(false);

  const handleClick = () => {
    if (entered) return;
    setEntered(true);
    startSplashAudio(SPLASH_MUSIC_URL || undefined);
    // Let RootLayout AnimatePresence handle the blur transition
    navigate("/members");
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center cursor-pointer overflow-hidden relative"
      style={{ background: "#060606" }}
      onClick={handleClick}
    >
      <MeshBackground intensity="high" />
      <ParticleCanvas count={100} />

      <div className="relative flex flex-col items-center select-none" style={{ zIndex: 10, gap: 32 }}>
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ inset: "-20%", background: "radial-gradient(circle, rgba(196,18,48,0.18) 0%, transparent 65%)", filter: "blur(40px)" }}
          />
          <motion.img
            src={unhoelyLogo}
            alt="UNHOELY"
            style={{
              width: "clamp(260px, 36vw, 420px)",
              height: "auto",
              objectFit: "contain",
              position: "relative",
              filter: "drop-shadow(0 0 32px rgba(180,10,35,0.45)) drop-shadow(0 0 80px rgba(180,10,35,0.2))",
            }}
            animate={{
              filter: [
                "drop-shadow(0 0 32px rgba(180,10,35,0.45)) drop-shadow(0 0 80px rgba(180,10,35,0.2))",
                "drop-shadow(0 0 48px rgba(180,10,35,0.65)) drop-shadow(0 0 110px rgba(180,10,35,0.3))",
                "drop-shadow(0 0 32px rgba(180,10,35,0.45)) drop-shadow(0 0 80px rgba(180,10,35,0.2))",
              ],
            }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="h-px w-10" style={{ background: "linear-gradient(to right, transparent, rgba(196,18,48,0.5))" }} />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(210,210,218,0.3)", letterSpacing: "0.48em", textTransform: "uppercase" }}>
            
          </span>
          <div className="h-px w-10" style={{ background: "linear-gradient(to left, transparent, rgba(196,18,48,0.5))" }} />
        </motion.div>

        {/* Enter indicator */}
        <motion.div
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: entered ? 0 : 1 }}
          transition={{ duration: 0.8, delay: entered ? 0 : 2.2 }}
        >
          <motion.div
            className="w-px"
            style={{ height: 28, background: "linear-gradient(to bottom, rgba(196,18,48,0.7), transparent)" }}
            animate={{ scaleY: [1, 0.35, 1], opacity: [0.8, 0.3, 0.8] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "rgba(210,210,218,0.25)", letterSpacing: "0.55em", textTransform: "uppercase" }}>
            Touch to Enter
          </span>
        </motion.div>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-28 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(196,18,48,0.04) 0%, transparent 100%)" }}
      />
    </div>
  );
}
