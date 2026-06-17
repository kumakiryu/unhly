import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { motion } from "motion/react";
import type { SocialPlatform } from "../data/members";
import { StatusDot, STATUS_META } from "./StatusDot";
import { useLanyard, getDiscordAvatarUrl, getActivityText } from "../hooks/useLanyard";
import useAdminStore from "../hooks/useAdminStore";
import { ProfileEditButton } from "./ProfileEditor";

// ── Social Icons ──────────────────────────────────────────────────────────────
const SocialIcons: Record<SocialPlatform, React.FC<{ size?: number }>> = {
  discord: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  ),
  instagram: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
  tiktok: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
    </svg>
  ),
  twitter: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  ),
  youtube: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  ),
  kick: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M2 2h4v6l4-6h5l-5 7 5.5 6H10l-4-5.5V15H2V2zm14 0h4v5h2v4h-2v5h-4V2z" />
    </svg>
  ),
  spotify: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  ),
  steam: ({ size = 18 }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.624 0 11.999-5.375 11.999-12 0-6.628-5.375-12-11.999-12zm-5.stub 16.816a2.037 2.037 0 01-2.736.889 2.037 2.037 0 01-.889-2.736l1.486-.615a1.215 1.215 0 001.62 1.619l-1.481.614v.229zm7.432-8.853c0-1.662-1.349-3.012-3.011-3.012-1.664 0-3.013 1.35-3.013 3.012 0 1.663 1.349 3.012 3.013 3.012 1.662 0 3.011-1.349 3.011-3.012z" />
    </svg>
  ),
};

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
  discord: "Discord",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "Twitter / X",
  youtube: "YouTube",
  kick: "Kick",
  spotify: "Spotify",
  steam: "Steam",
};

// ── Music Player ──────────────────────────────────────────────────────────────
const VOLUME_SLIDER_CSS = `
.vol-slider {
  -webkit-appearance: none;
  appearance: none;
  height: 3px;
  border-radius: 99px;
  background: rgba(255,255,255,0.1);
  outline: none;
  cursor: pointer;
  width: 100%;
}
.vol-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c41230;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(196,18,48,0.6);
}
.vol-slider::-moz-range-thumb {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #c41230;
  cursor: pointer;
  border: none;
  box-shadow: 0 0 6px rgba(196,18,48,0.6);
}
`;

function useMusicPlayer(url: string, startTime = 0) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.18);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    if (startTime) audio.currentTime = startTime;
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
    });

    const p = audio.play();
    if (p) {
      p.then(() => {
        setPlaying(true);
        let vol = 0;
        const fade = setInterval(() => {
          vol = Math.min(vol + 0.008, 0.18);
          audio.volume = vol;
          if (vol >= 0.18) clearInterval(fade);
        }, 80);
      }).catch(() => {});
    }

    return () => { audio.pause(); audio.src = ""; };
  }, [url, startTime]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const seek = (pct: number) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    a.currentTime = (pct / 100) * a.duration;
  };

  const setVol = (v: number) => {
    const a = audioRef.current;
    setVolume(v);
    if (a) a.volume = v;
  };

  return { playing, toggle, progress, seek, currentTime, duration, volume, setVol };
}

function fmt(s: number) {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function MusicWidget({
  title, artist, coverUrl, musicUrl, startTime,
}: {
  title: string; artist: string; coverUrl?: string; musicUrl: string; startTime?: number;
}) {
  const { playing, toggle, progress, seek, currentTime, duration, volume, setVol } = useMusicPlayer(musicUrl, startTime);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: VOLUME_SLIDER_CSS }} />
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        style={{
          width: 280,
          background: "rgba(8,8,8,0.88)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 18,
          padding: "14px 16px",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          {/* Album art */}
          <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 46, height: 46, background: "#1a1a1a" }}>
            {coverUrl
              ? <img src={coverUrl} alt={title} className="w-full h-full object-cover" />
              : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="rgba(196,18,48,0.6)">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                  </svg>
                </div>
              )
            }
          </div>

          <div className="flex-1 min-w-0">
            <p className="truncate" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#f2f0ee", fontWeight: 500 }}>
              {title}
            </p>
            <p className="truncate" style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "rgba(210,210,218,0.45)", marginTop: 1 }}>
              {artist}
            </p>
          </div>

          {/* Play/pause */}
          <button
            onClick={toggle}
            className="flex items-center justify-center rounded-full flex-shrink-0"
            style={{ width: 30, height: 30, background: "rgba(196,18,48,0.15)", border: "1px solid rgba(196,18,48,0.3)", color: "#f2f0ee", cursor: "pointer" }}
          >
            {playing ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect x="1" y="1" width="3" height="8" rx="1" />
                <rect x="6" y="1" width="3" height="8" rx="1" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 1.5l7 3.5-7 3.5V1.5z" />
              </svg>
            )}
          </button>
        </div>

        {/* Seek bar */}
        <div
          className="relative rounded-full cursor-pointer overflow-hidden mb-1"
          style={{ height: 3, background: "rgba(255,255,255,0.1)" }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            seek(((e.clientX - rect.left) / rect.width) * 100);
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${progress}%`, background: "linear-gradient(to right, #c41230, rgba(196,18,48,0.55))", transition: "width 0.3s linear" }}
          />
        </div>
        <div className="flex justify-between mb-3">
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "rgba(210,210,218,0.3)" }}>{fmt(currentTime)}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "rgba(210,210,218,0.3)" }}>{fmt(duration)}</span>
        </div>

        {/* Volume control */}
        <div className="flex items-center gap-2.5">
          {/* Mute icon */}
          <button
            onClick={() => setVol(volume > 0 ? 0 : 0.18)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "rgba(210,210,218,0.4)", flexShrink: 0 }}
          >
            {volume === 0 ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVol(parseFloat(e.target.value))}
            className="vol-slider flex-1"
            style={{ background: `linear-gradient(to right, #c41230 ${volume * 100}%, rgba(255,255,255,0.1) ${volume * 100}%)` }}
          />
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "8px", color: "rgba(210,210,218,0.3)", minWidth: 24, textAlign: "right" }}>
            {Math.round(volume * 100)}
          </span>
        </div>
      </motion.div>
    </>
  );
}

// ── Profile Page ──────────────────────────────────────────────────────────────
export function ProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const store = useAdminStore();
  // Read from live store so edits reflect immediately
  const member = store.adminMembers.find((m) => m.slug === slug);

  const { data: lanyardData } = useLanyard(member?.discordId ?? "");

  if (!member) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#080808" }}>
        <div className="text-center">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(196,18,48,0.6)", letterSpacing: "0.3em" }}>NOT FOUND</p>
          <button onClick={() => navigate("/members")} className="mt-3" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(210,210,218,0.3)", letterSpacing: "0.15em" }}>
            ← members
          </button>
        </div>
      </div>
    );
  }

  const liveStatus = lanyardData?.discord_status ?? member.status;
  const liveActivity = lanyardData ? getActivityText(lanyardData) : "";
  const avatarSrc = lanyardData ? getDiscordAvatarUrl(member.discordId, lanyardData.discord_user.avatar) : null;
  const { hex } = STATUS_META[liveStatus];
  const [bgLoaded, setBgLoaded] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#080808" }}>

      {/* ── Background — fades in once media is ready ── */}
      <div className="fixed inset-0">
        <div style={{ opacity: bgLoaded ? 1 : 0, transition: "opacity 0.7s ease", position: "absolute", inset: 0 }}>
          {member.bgUrl && member.bgType === "video" ? (
            <video
              src={member.bgUrl}
              autoPlay muted loop playsInline
              preload="auto"
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.4, filter: "brightness(0.55) saturate(0.8)" }}
              onCanPlay={() => setBgLoaded(true)}
            />
          ) : member.bgUrl ? (
            <img
              src={member.bgUrl}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.4, filter: "brightness(0.55) saturate(0.8)" }}
              onLoad={() => setBgLoaded(true)}
            />
          ) : null}
        </div>
        {!member.bgUrl && (
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 60% at 50% 30%, rgba(130,8,25,0.18) 0%, transparent 65%)" }} />
        )}
        {/* Dark overlay always present so text is readable before bg loads */}
        <div className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.6) 50%, rgba(8,8,8,0.92) 100%)" }} />
      </div>

      {/* ── Back nav ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10"
        style={{ padding: "20px 28px" }}
      >
        <button onClick={() => navigate("/members")} className="flex items-center gap-1.5 group">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6l4 4" stroke="rgba(210,210,218,0.3)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "9px", color: "rgba(210,210,218,0.3)", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            unhoely.xyz/members
          </span>
        </button>
      </motion.div>

      {/* ── CENTER HERO ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6" style={{ paddingTop: 10, paddingBottom: 120 }}>

        {/* Avatar ring */}
        <motion.div
          initial={{ scale: 0.82, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          <motion.div
            className="absolute rounded-full"
            style={{ inset: -10, border: "1px solid rgba(196,18,48,0.25)" }}
            animate={{ boxShadow: ["0 0 36px rgba(196,18,48,0.14)", "0 0 60px rgba(196,18,48,0.34)", "0 0 36px rgba(196,18,48,0.14)"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{ inset: -26, border: "1px solid rgba(255,255,255,0.04)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="w-[160px] h-[160px] rounded-full overflow-hidden flex items-center justify-center"
            style={{ border: "2px solid rgba(255,255,255,0.14)", boxShadow: "0 16px 56px rgba(0,0,0,0.6)", background: "#111" }}
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={member.name} className="w-full h-full object-cover" />
            ) : (
              <span style={{ fontFamily: "var(--font-display)", fontSize: "64px", fontWeight: 700, color: "rgba(196,18,48,0.65)", userSelect: "none" }}>
                {member.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <div className="absolute bottom-2 right-2 rounded-full" style={{ padding: 4, background: "#080808", border: "2px solid #0a0a0a" }}>
            <StatusDot status={liveStatus} size="lg" />
          </div>
        </motion.div>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(42px, 6vw, 72px)", color: "#f2f0ee", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", lineHeight: 1, textShadow: "0 2px 32px rgba(0,0,0,0.7)", textAlign: "center" }}
        >
          {member.name}
        </motion.h1>

        {/* Status row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="flex items-center gap-3 mt-3"
        >
          <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(210,210,218,0.28)", letterSpacing: "0.1em" }}>
            unhoely.xyz/{member.slug}
          </span>
          <div style={{ width: 1, height: 10, background: "rgba(255,255,255,0.1)" }} />
          <StatusDot status={liveStatus} size="xs" showLabel />
        </motion.div>

        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.26 }}
          className="mt-5 px-6 py-4 rounded-2xl text-center"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", maxWidth: 380 }}
        >
          <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "rgba(210,210,218,0.65)", lineHeight: 1.7, letterSpacing: "0.01em" }}>
            {member.bio}
          </p>
        </motion.div>

        {/* Activity — own pill box */}
        {liveActivity && liveActivity !== member.bio && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.34 }}
            className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full"
            style={{ background: "rgba(196,18,48,0.08)", border: "1px solid rgba(196,18,48,0.22)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)" }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: hex }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
            />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "rgba(210,210,218,0.55)", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              {liveActivity}
            </span>
          </motion.div>
        )}

        {/* ── Social icons ── */}
        {member.socialLinks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.42 }}
            className="flex items-center gap-2.5 mt-6 flex-wrap justify-center"
          >
            {member.socialLinks.map(({ platform, url }, i) => {
              const Icon = SocialIcons[platform];
              if (!Icon) return null;
              return (
                <motion.a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.38 + i * 0.06 }}
                  whileHover={{ scale: 1.12, boxShadow: "0 0 20px rgba(196,18,48,0.28), 0 0 0 1px rgba(196,18,48,0.3)", transition: { duration: 0.22 } }}
                  whileTap={{ scale: 0.94 }}
                  title={PLATFORM_LABEL[platform]}
                  className="flex items-center justify-center rounded-full group"
                  style={{ width: 42, height: 42, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(210,210,218,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", textDecoration: "none" }}
                >
                  <span className="group-hover:text-[rgba(196,18,48,0.9)] transition-colors duration-200">
                    <Icon size={18} />
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* ── Music player ── */}
      {member.music && (
        <div className="fixed z-20" style={{ bottom: 28, left: 28 }}>
          <MusicWidget
            title={member.musicTitle}
            artist={member.musicArtist}
            coverUrl={member.musicCoverUrl}
            musicUrl={member.music}
            startTime={member.musicStartTime}
          />
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 h-32 pointer-events-none z-10" style={{ background: "linear-gradient(to top, rgba(8,8,8,0.9) 0%, transparent 100%)" }} />

      {/* ── Profile edit button (bottom-right) ── */}
      <ProfileEditButton member={member} />
    </div>
  );
}
