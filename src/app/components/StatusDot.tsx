import { motion } from "motion/react";
import type { Status } from "../data/members";

export const STATUS_META: Record<Status, { hex: string; glow: string; label: string }> = {
  online: { hex: "#2dc771", glow: "rgba(45,199,113,0.55)", label: "Online" },
  idle: { hex: "#f5a623", glow: "rgba(245,166,35,0.55)", label: "Idle" },
  dnd: { hex: "#ed4245", glow: "rgba(237,66,69,0.55)", label: "Do Not Disturb" },
  offline: { hex: "#5a5a6a", glow: "rgba(90,90,106,0.4)", label: "Offline" },
};

const SIZES = { xs: 7, sm: 9, md: 11, lg: 15 };

interface StatusDotProps {
  status: Status;
  size?: keyof typeof SIZES;
  showLabel?: boolean;
}

export function StatusDot({ status, size = "md", showLabel = false }: StatusDotProps) {
  const { hex, glow, label } = STATUS_META[status];
  const d = SIZES[size];
  const isActive = status !== "offline";

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-shrink-0" style={{ width: d, height: d }}>
        {isActive && (
          <motion.div
            className="absolute rounded-full"
            style={{ inset: -2, backgroundColor: hex, opacity: 0.3 }}
            animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
          />
        )}
        <div
          className="relative rounded-full flex items-center justify-center"
          style={{
            width: d,
            height: d,
            backgroundColor: hex,
            boxShadow: `0 0 ${d + 4}px ${glow}`,
          }}
        >
          {status === "dnd" && (
            <div
              style={{
                width: "55%",
                height: 1.5,
                backgroundColor: "rgba(255,255,255,0.9)",
                borderRadius: 2,
              }}
            />
          )}
        </div>
      </div>

      {showLabel && (
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: hex,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
