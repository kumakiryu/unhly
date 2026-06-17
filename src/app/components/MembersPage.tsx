import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import { motion, useMotionValue, useSpring } from "motion/react";
import type { Member } from "../data/members";
import { StatusDot, STATUS_META } from "./StatusDot";
import { useLanyard, getDiscordAvatarUrl, getActivityText } from "../hooks/useLanyard";
import { ParticleCanvas } from "./ParticleCanvas";
import { LogoHoldTrigger, AdminSystem } from "./admin/AdminSystem";
import useAdminStore from "../hooks/useAdminStore";
import unhoelyLogo from "../../imports/Unhoely_Logo__1_.png";

// ── BG music ──────────────────────────────────────────────────────────────────
const MEMBERS_MUSIC_URL = "https://www.youtube.com/watch?v=-lmPAcXHgN4&list=RD-lmPAcXHgN4&start_radio=1";

// ── Dynamic CSS — regenerated whenever accent color changes ──────────────────
function buildStyles(c: string) {
  // Lighten the accent for the shine sweep
  const light = c.replace(/^#/, "");
  const r = parseInt(light.slice(0,2),16), g = parseInt(light.slice(2,4),16), b = parseInt(light.slice(4,6),16);
  const lighter = `rgb(${Math.min(r+80,255)},${Math.min(g+60,255)},${Math.min(b+70,255)})`;
  return `
@keyframes crimsonShine {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}
.name-shine {
  background: linear-gradient(90deg, ${c} 0%, ${lighter} 40%, #fff8 50%, ${lighter} 60%, ${c} 100%);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: crimsonShine 3.2s linear infinite;
}
@keyframes borderSweep {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes auroraGlow {
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50%       { opacity: 0.85; transform: scale(1.06); }
}
@media (prefers-reduced-motion: reduce) {
  .name-shine { animation: none; }
  .float-card { animation: none !important; }
}
`;
}

// ── Hooks ─────────────────────────────────────────────────────────────────────
function useBgMusic(url: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef  = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Stop and clean up previous audio + any running fade
    if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }

    if (!url) return;

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    const p = audio.play();
    if (p) p.then(() => {
      let v = 0;
      fadeRef.current = setInterval(() => {
        v = Math.min(v + 0.006, 0.12);
        audio.volume = v;
        if (v >= 0.12) { clearInterval(fadeRef.current!); fadeRef.current = null; }
      }, 80);
    }).catch(() => {});

    return () => {
      if (fadeRef.current) { clearInterval(fadeRef.current); fadeRef.current = null; }
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [url]);
}

function useSessionViews() {
  const [views, setViews] = useState<number | null>(null);
  useEffect(() => {
    const S = "unhoely_session_counted", V = "unhoely_total_views";
    const stored = parseInt(localStorage.getItem(V) ?? "0", 10);
    if (!sessionStorage.getItem(S)) {
      sessionStorage.setItem(S, "1");
      const next = stored + 1;
      localStorage.setItem(V, String(next)); setViews(next);
    } else { setViews(stored); }
  }, []);
  return views;
}

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const day  = now.toLocaleDateString("en-US",  { weekday: "long", month: "long", day: "numeric" });
  return (
    <div className="flex flex-col">
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "rgba(240,238,236,0.85)", letterSpacing: "0.04em", fontWeight: 500 }}>{time}</span>
      <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px",  color: "rgba(210,210,218,0.4)",  letterSpacing: "0.1em",  textTransform: "uppercase" }}>{day}</span>
    </div>
  );
}

// ── Premium Member Card ───────────────────────────────────────────────────────
function MemberCard({ member, index, accent = "#c41230" }: { member: Member; index: number; accent?: string }) {
  const navigate  = useNavigate();
  const [hovered, setHovered] = useState(false);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const { data } = useLanyard(member.discordId);

  const liveStatus  = data?.discord_status ?? member.status;
  const liveActivity= data ? getActivityText(data) : "";
  const avatarSrc   = data ? getDiscordAvatarUrl(member.discordId, data.discord_user.avatar) : null;
  const { hex }     = STATUS_META[liveStatus];
  const statusLabel = { online: "Online", idle: "Idle", dnd: "DND", offline: "Offline" }[liveStatus];
  const isFeatured  = member.featured;

  // ── Tilt springs (existing) ─────────────────────────────────────────────────
  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const springX = useSpring(rotX, { stiffness: 260, damping: 22 });
  const springY = useSpring(rotY, { stiffness: 260, damping: 22 });

  // ── Idle float — randomised per card so none sync ──────────────────────────
  const float = useMemo(() => ({
    y:        [-2, -5, -2, 1, -2],
    duration: 4 + (index % 5) * 0.9,   // 4 – 8 s, index-stable
    delay:    (index * 0.37) % 2.5,
  }), [index]);

  // ── Magnetic pull toward cursor (container-level proximity) ───────────────
  const magX = useMotionValue(0);
  const magY = useMotionValue(0);
  const magSpringX = useSpring(magX, { stiffness: 120, damping: 18 });
  const magSpringY = useSpring(magY, { stiffness: 120, damping: 18 });

  const cardRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const maxDist = 140;
      if (dist < maxDist) {
        const strength = (1 - dist / maxDist) * 8;
        magX.set((e.clientX - cx) / (rect.width / 2)  * strength);
        magY.set((e.clientY - cy) / (rect.height / 2) * strength);
      } else {
        magX.set(0); magY.set(0);
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [magX, magY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width)  * 100;
    const y = ((e.clientY - rect.top)  / rect.height) * 100;
    setGlowPos({ x, y });
    const dx = (e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2);
    const dy = (e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2);
    rotX.set(dy * -8);
    rotY.set(dx * 8);
  };

  const handleMouseLeave = () => {
    rotX.set(0); rotY.set(0); setHovered(false);
  };

  // ── Dynamic shadow from tilt ────────────────────────────────────────────────
  const tiltShadow = hovered
    ? `0 ${16 + Math.abs(rotY.get()) * 1.2}px ${44 + Math.abs(rotX.get()) * 2}px rgba(0,0,0,.6),
       0 0 28px ${accent}30, 0 0 65px ${accent}18,
       inset 0 0 30px ${accent}0d`
    : "0 4px 16px rgba(0,0,0,.3)";

  return (
    // Outermost: magnetic pull (x + y offset only)
    <motion.div style={{ x: magSpringX, y: magSpringY, position: "relative" }}>
    {/* Middle: idle float (separate y so it doesn't fight magnetic y) */}
    <motion.div
      className="float-card"
      animate={{ y: float.y }}
      transition={{ duration: float.duration, delay: float.delay, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
    >
      {/* Featured aurora ring — contained, no bleed */}
      {isFeatured && (
        <div
          className="absolute pointer-events-none overflow-hidden rounded-[20px]"
          style={{ inset: -1, zIndex: 0 }}
          aria-hidden
        >
          <div style={{
            position: "absolute", inset: 0,
            background: `conic-gradient(from 0deg, ${accent}00, ${accent}66, ${accent}88, ${accent}66, ${accent}00)`,
            filter: "blur(6px)",
            animation: "auroraGlow 3.5s ease-in-out infinite",
          }} />
        </div>
      )}

      <motion.article
        ref={cardRef as React.RefObject<HTMLElement>}
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: index * 0.08 + 0.05, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => navigate(`/${member.slug}`)}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.06, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
        whileTap={{ scale: 0.96, transition: { duration: 0.08, ease: [0.22, 1, 0.36, 1] } }}
        className="relative cursor-pointer overflow-hidden flex flex-col items-center justify-center"
        style={{
          background: "#0e0e0e",
          border: isFeatured
            ? `1px solid ${accent}80`
            : hovered
              ? `1px solid ${accent}60`
              : "1px solid rgba(255,255,255,0.07)",
          borderRadius: 18,
          boxShadow: tiltShadow,
          transition: "border-color 0.28s ease, box-shadow 0.28s ease",
          aspectRatio: "4 / 3",
          padding: "16px 14px 14px",
          transformPerspective: 900,
          rotateX: springX,
          rotateY: springY,
          zIndex: 1,
        }}
      >
        {/* ── Featured shimmer border sweep ───────────────────────────────── */}
        {isFeatured && (
          <div
            className="absolute inset-0 pointer-events-none rounded-[18px] overflow-hidden"
            aria-hidden
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${accent}88 40%, ${accent}cc 50%, ${accent}88 60%, transparent 100%)`,
              backgroundSize: "200% 100%",
              animation: "borderSweep 2.8s linear infinite",
              WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
              WebkitMaskComposite: "xor",
              maskComposite: "exclude",
              padding: "1px",
              opacity: 0.9,
            }}
          />
        )}

        {/* ── Crimson spotlight (tracks cursor) ───────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[18px] overflow-hidden"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            background: `radial-gradient(ellipse 55% 55% at ${glowPos.x}% ${glowPos.y}%, ${accent}25 0%, ${accent}0a 40%, transparent 70%)`,
          }}
          aria-hidden
        />

        {/* ── Specular glass highlight (smaller, brighter, follows cursor) ── */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[18px] overflow-hidden"
          style={{
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.25s ease",
            background: `radial-gradient(ellipse 22% 22% at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.07) 0%, transparent 55%)`,
          }}
          aria-hidden
        />

        {/* ── Top edge glow ────────────────────────────────────────────────── */}
        <div
          className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: `linear-gradient(to right, transparent, ${accent}e6, transparent)`, opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease" }}
        />

        {/* ── Inner top bloom ─────────────────────────────────────────────── */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[18px]"
          style={{
            background: `radial-gradient(ellipse 70% 55% at 50% 0%, ${accent}17 0%, transparent 65%)`,
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.4s ease",
          }}
          aria-hidden
        />

        {/* ── Watermark ───────────────────────────────────────────────────── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden" aria-hidden>
          <span style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(22px, 2.8vw, 40px)",
            fontWeight: 900,
            color: "rgba(255,255,255,0.055)",
            textShadow: hovered ? `0 0 20px ${accent}59, 0 0 40px ${accent}2e` : "none",
            transition: "text-shadow 0.4s ease",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            userSelect: "none",
            transform: "none",
          }}>
            Unhoely
          </span>
        </div>

        {/* ── Featured star badge ──────────────────────────────────────────── */}
        {isFeatured && (
          <div
            className="absolute top-2.5 right-2.5 z-20 flex items-center justify-center rounded-full"
            style={{ width: 22, height: 22, background: `${accent}33`, border: `1px solid ${accent}99`, boxShadow: `0 0 12px ${accent}66` }}
          >
            <svg width="9" height="9" viewBox="0 0 12 12" fill={accent}>
              <path d="M6 0l1.5 4.5H12L8.25 7.5 9.75 12 6 9 2.25 12l1.5-4.5L0 4.5h4.5z" />
            </svg>
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col items-center gap-2.5 w-full">

          {/* Avatar */}
          <motion.div
            className="relative flex-shrink-0"
            animate={hovered ? { scale: 1.06 } : { scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="rounded-full overflow-hidden flex items-center justify-center"
              style={{
                width: 64, height: 64,
                border: hovered ? `2px solid ${accent}80` : "2px solid rgba(255,255,255,0.1)",
                background: "#1e1e1e",
                boxShadow: hovered
                  ? `0 0 0 4px ${accent}1a, 0 0 24px ${accent}52`
                  : "none",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              {avatarSrc
                ? <img src={avatarSrc} alt={member.name} className="w-full h-full object-cover" />
                : <span style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: `${accent}99`, userSelect: "none" }}>{member.name[0].toUpperCase()}</span>
              }
            </div>
            <div className="absolute rounded-full" style={{ bottom: 2, right: 2, padding: 2, background: "rgba(10,10,10,0.9)", border: "1.5px solid rgba(10,10,10,0.9)" }}>
              <StatusDot status={liveStatus} size="sm" />
            </div>
          </motion.div>

          {/* Text */}
          <div className="flex flex-col items-center gap-1 w-full px-1">
            <h3 className="name-shine truncate w-full text-center"
              style={{ fontFamily: "var(--font-display)", fontSize: "16px", fontWeight: 700, letterSpacing: "0.03em", lineHeight: 1.2 }}>
              {member.name}
            </h3>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full flex-shrink-0" style={{ width: 6, height: 6, background: hex, boxShadow: `0 0 7px ${hex}` }} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: hex, letterSpacing: "0.07em" }}>{statusLabel}</span>
            </div>
            {liveActivity && (
              <div className="flex items-center gap-1 w-full justify-center">
                <motion.span style={{ color: "rgba(210,210,218,0.28)", fontSize: "5px" }} animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.2, repeat: Infinity }}>●</motion.span>
                <span className="truncate" style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(210,210,218,0.35)", letterSpacing: "0.04em", maxWidth: "88%" }}>{liveActivity}</span>
              </div>
            )}
          </div>
        </div>
      </motion.article>
    </motion.div>
    </motion.div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function MembersPage() {
  const navigate = useNavigate();
  const views = useSessionViews();
  const store = useAdminStore();
  const allMembers = store.adminMembers;
  const featuredMembers = allMembers.filter(m => m.featured);
  const regularMembers  = allMembers.filter(m => !m.featured);
  const musicUrl = store.musicConfig.url || MEMBERS_MUSIC_URL;
  const particleCount = store.siteConfig.particleDensity ?? 120;
  useBgMusic(musicUrl);

  const [adminOpen, setAdminOpen] = useState(false);

  const accentColor = store.siteConfig.accentColor || "#c41230";
  const liveStyles = buildStyles(accentColor);

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#080808" }}>
      <style dangerouslySetInnerHTML={{ __html: liveStyles }} />
      <ParticleCanvas count={particleCount} crimsonOnly />
      {adminOpen && <AdminSystem onExternalClose={() => setAdminOpen(false)} />}

      <div className="fixed inset-0 pointer-events-none" style={{
        background: "radial-gradient(ellipse 55% 45% at 15% 15%, rgba(140,8,28,0.1) 0%, transparent 60%), radial-gradient(ellipse 45% 35% at 85% 85%, rgba(120,6,22,0.07) 0%, transparent 60%)",
        zIndex: 1,
      }} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex items-center justify-between"
        style={{ padding: "14px 36px", borderBottom: "1px solid rgba(255,255,255,0.07)", background: "rgba(8,8,8,0.78)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", zIndex: 10 }}
      >
        <LiveClock />
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <motion.div className="rounded-full" style={{ width: 7, height: 7, backgroundColor: "#2dc771", boxShadow: "0 0 8px rgba(45,199,113,0.8)" }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(210,210,218,0.6)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {views !== null ? `${views.toLocaleString()} visits` : "—"}
            </span>
          </div>
          <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
          <div className="flex items-center gap-2">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(210,210,218,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(210,210,218,0.6)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {allMembers.length} members
            </span>
          </div>
        </div>
      </motion.header>

      {/* Content */}
      <div className="relative" style={{ padding: "24px 36px 60px", zIndex: 5 }}>

        {/* Logo hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center mb-7"
        >
          <LogoHoldTrigger onHoldComplete={() => setAdminOpen(true)}>
            <motion.button onClick={() => navigate("/")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <img src={unhoelyLogo} alt="UNHOELY" style={{ width: "clamp(120px, 16vw, 200px)", height: "auto", objectFit: "contain", filter: "drop-shadow(0 0 20px rgba(180,10,35,0.4)) drop-shadow(0 0 50px rgba(180,10,35,0.18))" }} />
            </motion.button>
          </LogoHoldTrigger>
          <div className="flex items-center gap-3 mt-3">
            <div className="h-px w-10" style={{ background: "linear-gradient(to right, transparent, rgba(196,18,48,0.4))" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "rgba(210,210,218,0.2)", letterSpacing: "0.5em", textTransform: "uppercase" }}>ABOVE ALL</span>
            <div className="h-px w-10" style={{ background: "linear-gradient(to left, transparent, rgba(196,18,48,0.4))" }} />
          </div>
        </motion.div>

        {/* Featured — centered row, spans full width */}
        {featuredMembers.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${featuredMembers.length}, minmax(220px, 320px))`, justifyContent: "center", gap: 12, marginBottom: 12 }}>
            {featuredMembers.map((m, i) => (
              <MemberCard key={`${m.slug}-${i}`} member={m} index={i} accent={accentColor} />
            ))}
          </div>
        )}

        {/* Divider */}
        {featuredMembers.length > 0 && regularMembers.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "7px", color: "rgba(210,210,218,0.14)", letterSpacing: "0.4em", textTransform: "uppercase" }}>TAINTED</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.05)" }} />
          </div>
        )}

        {/* Regular grid */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {regularMembers.map((m, i) => (
            <MemberCard key={`${m.slug}-${i}`} member={m} index={featuredMembers.length + i} accent={accentColor} />
          ))}
        </div>
      </div>
    </div>
  );
}
