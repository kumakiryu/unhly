import { motion } from "motion/react";

interface MeshBackgroundProps {
  intensity?: "low" | "medium" | "high";
}

export function MeshBackground({ intensity = "medium" }: MeshBackgroundProps) {
  const opacity = { low: 0.12, medium: 0.18, high: 0.26 }[intensity];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#060606]">
      {/* Primary crimson bloom — top left */}
      <motion.div
        className="absolute rounded-full blur-[140px]"
        style={{
          width: "70vw",
          height: "70vw",
          maxWidth: 900,
          maxHeight: 900,
          background: `radial-gradient(circle, rgba(180,10,35,${opacity}) 0%, transparent 65%)`,
          top: "-25%",
          left: "-15%",
        }}
        animate={{ x: [0, 50, 0], y: [0, 35, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Secondary bloom — bottom right */}
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{
          width: "55vw",
          height: "55vw",
          maxWidth: 750,
          maxHeight: 750,
          background: `radial-gradient(circle, rgba(150,8,28,${opacity * 0.8}) 0%, transparent 65%)`,
          bottom: "-20%",
          right: "-10%",
        }}
        animate={{ x: [0, -40, 20, 0], y: [0, -30, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Silver center haze */}
      <motion.div
        className="absolute rounded-full blur-[180px]"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: 600,
          maxHeight: 600,
          background: `radial-gradient(circle, rgba(200,200,210,${opacity * 0.25}) 0%, transparent 70%)`,
          top: "30%",
          left: "35%",
        }}
        animate={{ x: [0, 30, -20, 0], y: [0, -40, 15, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />

      {/* Grain texture */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Deep vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, rgba(0,0,0,0.75) 100%)",
        }}
      />
    </div>
  );
}
