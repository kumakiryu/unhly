"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AdminStore } from "../../hooks/useAdminStore";

interface AdminAuthModalProps {
  onSuccess: () => void;
  onClose: () => void;
  store: AdminStore;
}

export function AdminAuthModal({ onSuccess, onClose, store }: AdminAuthModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (success) return;
      const ok = store.login(password);
      if (ok) {
        setError(false);
        setSuccess(true);
        setTimeout(() => onSuccess(), 700);
      } else {
        setError(true);
        setShaking(true);
        setTimeout(() => setShaking(false), 500);
      }
    },
    [password, store, onSuccess, success]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundColor: "rgba(0,0,0,0.7)",
      }}
    >
      {/* Close backdrop */}
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={shaking ? { scale: 1, opacity: 1, x: [0, -10, 10, -8, 8, -4, 4, 0] } : { scale: 1, opacity: 1, x: 0 }}
        transition={shaking ? { duration: 0.5, type: "tween" } : { duration: 0.3, ease: "easeOut" }}
        style={{
          position: "relative",
          backgroundColor: "rgba(8,8,8,0.95)",
          border: "1px solid rgba(196,18,48,0.3)",
          borderRadius: 24,
          padding: 40,
          width: 400,
          zIndex: 1,
          boxShadow: "0 0 60px rgba(196,18,48,0.15), 0 0 120px rgba(0,0,0,0.8)",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "rgba(255,255,255,0.4)",
            fontSize: 18,
            lineHeight: 1,
            padding: 4,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
        >
          ✕
        </button>

        {/* Lock icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "rgba(196,18,48,0.1)",
              border: "1px solid rgba(196,18,48,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(196,18,48,0.3)",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="#c41230" strokeWidth="1.5" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="#c41230" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="16" r="1.5" fill="#c41230" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              color: "#ffffff",
              letterSpacing: "0.02em",
              marginBottom: 8,
            }}
          >
            Administrative Access
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "#c41230",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
            }}
          >
            Authentication Required
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Password input */}
          <div style={{ position: "relative" }}>
            <input
              ref={inputRef}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                setError(false);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              style={{
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "rgba(255,255,255,0.04)",
                border: `1px solid ${error ? "rgba(196,18,48,0.7)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 12,
                padding: "14px 48px 14px 16px",
                color: "#ffffff",
                fontFamily: "var(--font-mono)",
                fontSize: 14,
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={e => {
                if (!error) e.currentTarget.style.borderColor = "rgba(196,18,48,0.5)";
              }}
              onBlur={e => {
                if (!error) e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(v => !v)}
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(255,255,255,0.4)",
                fontSize: 14,
                padding: 0,
              }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#c41230",
                  textAlign: "center",
                  letterSpacing: "0.1em",
                }}
              >
                Invalid credentials
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit button */}
          <motion.button
            type="submit"
            whileTap={{ scale: 0.97 }}
            style={{
              width: "100%",
              padding: "14px",
              backgroundColor: success ? "rgba(34,197,94,0.2)" : "rgba(196,18,48,0.85)",
              border: `1px solid ${success ? "rgba(34,197,94,0.5)" : "rgba(196,18,48,0.5)"}`,
              borderRadius: 12,
              color: "#ffffff",
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "background-color 0.3s, border-color 0.3s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {success ? (
              <>
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.3, 1] }}
                  transition={{ duration: 0.4 }}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </motion.svg>
                <span style={{ color: "#22c55e" }}>Access Granted</span>
              </>
            ) : (
              "Authenticate"
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
