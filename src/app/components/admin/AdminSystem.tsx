"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence } from "motion/react";
import { useAdminStore } from "../../hooks/useAdminStore";
import { AdminAuthModal } from "./AdminAuthModal";
import { AdminDashboard } from "./AdminDashboard";

/* ─────────────────────── LogoHoldTrigger ─────────────────────── */

interface LogoHoldTriggerProps {
  children: React.ReactNode;
  onHoldComplete: () => void;
}

export function LogoHoldTrigger({ children, onHoldComplete }: LogoHoldTriggerProps) {
  const [progress, setProgress] = useState(0); // 0–1
  const [holding, setHolding] = useState(false);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const HOLD_DURATION = 3000;

  const startHold = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = false;
    setHolding(true);
    startTimeRef.current = performance.now();

    const tick = (now: number) => {
      if (!startTimeRef.current) return;
      const elapsed = now - startTimeRef.current;
      const p = Math.min(elapsed / HOLD_DURATION, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        completedRef.current = true;
        setHolding(false);
        setProgress(0);
        onHoldComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [onHoldComplete]);

  const cancelHold = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    startTimeRef.current = null;
    setHolding(false);
    setProgress(0);
  }, []);

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // SVG ring
  const SIZE = 56;
  const STROKE = 2.5;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * RADIUS;
  const dashoffset = CIRC * (1 - progress);
  const pct = Math.round(progress * 100);

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center", userSelect: "none", cursor: "pointer" }}
      onMouseDown={startHold}
      onMouseUp={cancelHold}
      onMouseLeave={cancelHold}
      onTouchStart={e => { e.preventDefault(); startHold(); }}
      onTouchEnd={cancelHold}
    >
      {children}

      {/* Progress ring */}
      {holding && progress > 0 && (
        <svg
          width={SIZE}
          height={SIZE}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-90deg)",
            pointerEvents: "none",
          }}
        >
          {/* Track */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="rgba(196,18,48,0.15)"
            strokeWidth={STROKE}
          />
          {/* Progress */}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="#c41230"
            strokeWidth={STROKE}
            strokeDasharray={CIRC}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 4px rgba(196,18,48,0.8))", transition: "stroke-dashoffset 0.016s linear" }}
          />
        </svg>
      )}

      {/* Tooltip */}
      {holding && progress > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 10px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(8,8,8,0.95)",
            border: "1px solid rgba(196,18,48,0.3)",
            borderRadius: 8,
            padding: "5px 10px",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#c41230",
            letterSpacing: "0.12em",
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {pct}%
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── AdminSystem ─────────────────────── */

interface AdminSystemProps {
  onExternalClose?: () => void;
}

export function AdminSystem({ onExternalClose }: AdminSystemProps) {
  const store = useAdminStore();
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleAuthSuccess = useCallback(() => {
    setShowAuthModal(false);
    setShowDashboard(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowDashboard(false);
    setShowAuthModal(false);
    onExternalClose?.();
  }, [onExternalClose]);

  const handleAuthClose = useCallback(() => {
    setShowAuthModal(false);
    onExternalClose?.();
  }, [onExternalClose]);

  // If already authenticated, skip auth modal
  useEffect(() => {
    if (store.isAuthenticated) {
      setShowAuthModal(false);
      setShowDashboard(true);
    }
  }, [store.isAuthenticated]);

  return (
    <>
      {/* Auth modal */}
      <AnimatePresence>
        {showAuthModal && (
          <AdminAuthModal
            key="auth-modal"
            store={store}
            onSuccess={handleAuthSuccess}
            onClose={handleAuthClose}
          />
        )}
      </AnimatePresence>

      {/* Left backdrop + dashboard */}
      <AnimatePresence>
        {showDashboard && (
          <>
            {/* Left 25% backdrop */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                bottom: 0,
                width: "25%",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 8999,
              }}
              onClick={handleClose}
            />
            <AdminDashboard key="dashboard" store={store} onClose={handleClose} />
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminSystem;
