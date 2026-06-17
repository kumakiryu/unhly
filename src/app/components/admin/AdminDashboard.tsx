"use client";

import {
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import type { AdminStore } from "../../hooks/useAdminStore";
import type { Member, SocialPlatform, BgType } from "../../data/members";

/* ─────────────────────────── types ─────────────────────────── */

type NavSection = "overview" | "members" | "music" | "site" | "security" | "restore";

/* ─────────────────────────── helpers ─────────────────────────── */

const statusColor: Record<string, string> = {
  online: "#23d160",
  idle: "#f5a623",
  dnd: "#c41230",
  offline: "#555",
};

function glass(extra?: React.CSSProperties): React.CSSProperties {
  return {
    backgroundColor: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 14,
    ...extra,
  };
}

function crimsonGlass(extra?: React.CSSProperties): React.CSSProperties {
  return {
    backgroundColor: "rgba(196,18,48,0.06)",
    border: "1px solid rgba(196,18,48,0.25)",
    borderRadius: 14,
    ...extra,
  };
}

function inputStyle(extra?: React.CSSProperties): React.CSSProperties {
  return {
    backgroundColor: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#fff",
    fontFamily: "var(--font-mono)",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    ...extra,
  };
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

/* ─────────────────────── WaveformCanvas ─────────────────────── */

function WaveformCanvas({ playing }: { playing: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bars = 32;
      const barW = W / bars - 2;

      for (let i = 0; i < bars; i++) {
        const phase = (i / bars) * Math.PI * 2;
        const amplitude = playing
          ? 0.3 + 0.7 * Math.abs(Math.sin(tRef.current * 2.2 + phase))
          : 0.08 + 0.05 * Math.abs(Math.sin(phase));
        const barH = H * amplitude;
        const x = i * (barW + 2);
        const y = (H - barH) / 2;

        const grad = ctx.createLinearGradient(x, y, x, y + barH);
        grad.addColorStop(0, "rgba(196,18,48,0.9)");
        grad.addColorStop(1, "rgba(196,18,48,0.2)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, 2);
        ctx.fill();
      }

      if (playing) tRef.current += 0.04;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={60}
      style={{ width: "100%", height: 60, borderRadius: 8 }}
    />
  );
}

/* ─────────────────────── MemberEditModal ─────────────────────── */

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "discord", "instagram", "tiktok", "twitter", "youtube", "kick", "spotify", "steam",
];

function MemberEditModal({
  member,
  isNew,
  onSave,
  onCancel,
}: {
  member: Member;
  isNew: boolean;
  onSave: (m: Member) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Member>({ ...member });

  const set = <K extends keyof Member>(key: K, val: Member[K]) =>
    setForm(prev => ({ ...prev, [key]: val }));

  const addSocial = () =>
    setForm(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "discord", url: "" }],
    }));

  const removeSocial = (i: number) =>
    setForm(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, idx) => idx !== i),
    }));

  const updateSocial = (i: number, field: "platform" | "url", val: string) =>
    setForm(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, idx) =>
        idx === i ? { ...s, [field]: val } : s
      ),
    }));

  const labelStyle: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: 6,
    display: "block",
  };

  const fieldWrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        style={{
          ...glass(),
          backgroundColor: "rgba(10,10,10,0.98)",
          width: 560,
          maxHeight: "80vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 0 60px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: 16, color: "#fff" }}>
            {isNew ? "Create Member" : `Edit — ${member.name}`}
          </span>
          <button
            onClick={onCancel}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Row: slug + name */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Slug</label>
              <input
                style={inputStyle()}
                value={form.slug}
                onChange={e => set("slug", e.target.value)}
                disabled={!isNew}
                placeholder="member-slug"
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Name</label>
              <input
                style={inputStyle()}
                value={form.name}
                onChange={e => set("name", e.target.value)}
                placeholder="Display name"
              />
            </div>
          </div>

          {/* Row: discordId + featured */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Discord ID</label>
              <input
                style={inputStyle()}
                value={form.discordId}
                onChange={e => set("discordId", e.target.value)}
                placeholder="531278967404232724"
              />
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 2 }}
              onClick={() => set("featured", !form.featured)}
            >
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
                Featured
              </span>
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: form.featured ? "#c41230" : "rgba(255,255,255,0.1)",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: form.featured ? 19 : 3,
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    transition: "left 0.2s",
                  }}
                />
              </div>
            </div>
          </div>

          {/* bio */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Bio</label>
            <textarea
              style={{ ...inputStyle(), resize: "vertical", minHeight: 70 }}
              value={form.bio}
              onChange={e => set("bio", e.target.value)}
              placeholder="Member bio..."
            />
          </div>

          {/* tagline */}
          <div style={fieldWrap}>
            <label style={labelStyle}>Tagline</label>
            <input
              style={inputStyle()}
              value={form.tagline}
              onChange={e => set("tagline", e.target.value)}
              placeholder="Short tagline"
            />
          </div>

          {/* music row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Music Title</label>
              <input
                style={inputStyle()}
                value={form.musicTitle}
                onChange={e => set("musicTitle", e.target.value)}
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>Music Artist</label>
              <input
                style={inputStyle()}
                value={form.musicArtist}
                onChange={e => set("musicArtist", e.target.value)}
              />
            </div>
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Music URL</label>
            <input
              style={inputStyle()}
              value={form.music}
              onChange={e => set("music", e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div style={fieldWrap}>
            <label style={labelStyle}>Music Cover URL</label>
            <input
              style={inputStyle()}
              value={form.musicCoverUrl ?? ""}
              onChange={e => set("musicCoverUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>

          {/* bg */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "end" }}>
            <div style={fieldWrap}>
              <label style={labelStyle}>Background URL</label>
              <input
                style={inputStyle()}
                value={form.bgUrl ?? ""}
                onChange={e => set("bgUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div style={fieldWrap}>
              <label style={labelStyle}>BG Type</label>
              <select
                style={{ ...inputStyle(), width: "auto" }}
                value={form.bgType ?? "image"}
                onChange={e => set("bgType", e.target.value as BgType)}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
          </div>

          {/* Social links */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <label style={{ ...labelStyle, marginBottom: 0 }}>Social Links</label>
              <button
                onClick={addSocial}
                style={{
                  background: "rgba(196,18,48,0.15)",
                  border: "1px solid rgba(196,18,48,0.3)",
                  borderRadius: 8,
                  color: "#c41230",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  padding: "4px 10px",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                }}
              >
                + ADD
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {form.socialLinks.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <select
                    style={{ ...inputStyle(), width: 110, flexShrink: 0 }}
                    value={s.platform}
                    onChange={e => updateSocial(i, "platform", e.target.value)}
                  >
                    {SOCIAL_PLATFORMS.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  <input
                    style={inputStyle()}
                    value={s.url}
                    onChange={e => updateSocial(i, "url", e.target.value)}
                    placeholder="https://..."
                  />
                  <button
                    onClick={() => removeSocial(i)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(196,18,48,0.6)",
                      cursor: "pointer",
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            flexShrink: 0,
          }}
        >
          <button
            onClick={onCancel}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              color: "rgba(255,255,255,0.6)",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "10px 20px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            CANCEL
          </button>
          <button
            onClick={() => onSave(form)}
            style={{
              background: "rgba(196,18,48,0.8)",
              border: "1px solid rgba(196,18,48,0.5)",
              borderRadius: 10,
              color: "#fff",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "10px 20px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            {isNew ? "CREATE" : "SAVE"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ─────────────────────── Overview ─────────────────────── */

function OverviewSection({ store }: { store: AdminStore }) {
  const members = store.adminMembers;
  const counts = {
    online: members.filter(m => m.status === "online").length,
    idle: members.filter(m => m.status === "idle").length,
    dnd: members.filter(m => m.status === "dnd").length,
    offline: members.filter(m => m.status === "offline").length,
  };

  const stats = [
    { label: "Total Members", value: members.length, color: "#fff" },
    { label: "Online", value: counts.online, color: "#23d160" },
    { label: "Idle", value: counts.idle, color: "#f5a623" },
    { label: "DND", value: counts.dnd, color: "#c41230" },
    { label: "Offline", value: counts.offline, color: "#555" },
    { label: "Total Visits", value: store.totalVisits, color: "#c41230" },
  ];

  return (
    <motion.div key="overview" variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {stats.map(s => (
          <div
            key={s.label}
            style={{
              ...glass(),
              padding: "20px 20px",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(196,18,48,0.4)";
              (e.currentTarget as HTMLDivElement).style.borderTopColor = "#c41230";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                color: s.color,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Music URL */}
      <div style={{ ...glass(), padding: "16px 20px" }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "rgba(255,255,255,0.3)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 8,
          }}
        >
          Current Music URL
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {store.musicConfig.url || "— not set —"}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────── Members ─────────────────────── */

function MembersSection({ store }: { store: AdminStore }) {
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const blankMember: Member = {
    slug: "",
    name: "",
    featured: false,
    discordId: "",
    status: "offline",
    avatar: "",
    bio: "",
    tagline: "",
    music: "",
    musicTitle: "",
    musicArtist: "",
    socialLinks: [],
  };

  const handleEdit = (m: Member) => { setIsNew(false); setEditTarget(m); };
  const handleAdd = () => { setIsNew(true); setEditTarget({ ...blankMember }); };

  const handleSave = (m: Member) => {
    if (isNew) store.createMember(m);
    else store.updateMember(m.slug, m);
    setEditTarget(null);
  };

  const handleDelete = (slug: string) => {
    store.deleteMember(slug);
    setConfirmDelete(null);
  };

  return (
    <motion.div key="members" variants={sectionVariants} initial="hidden" animate="visible" exit="exit">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button
          onClick={handleAdd}
          style={{
            background: "rgba(196,18,48,0.15)",
            border: "1px solid rgba(196,18,48,0.35)",
            borderRadius: 10,
            color: "#c41230",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            padding: "8px 16px",
            cursor: "pointer",
            letterSpacing: "0.12em",
          }}
        >
          + ADD MEMBER
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {store.adminMembers.map(m => (
          <div
            key={m.slug}
            style={{
              ...glass(),
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "rgba(196,18,48,0.2)",
                border: "1px solid rgba(196,18,48,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 14,
                fontFamily: "var(--font-display)",
                color: "#c41230",
                overflow: "hidden",
              }}
            >
              {m.avatar ? (
                <img src={m.avatar} alt={m.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                m.name[0]?.toUpperCase()
              )}
            </div>

            {/* Name + slug */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff" }}>{m.name}</span>
                {m.featured && (
                  <span style={{ color: "#f5a623", fontSize: 12 }}>★</span>
                )}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                {m.slug}
              </div>
            </div>

            {/* Status dot */}
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: statusColor[m.status] ?? "#555",
                flexShrink: 0,
              }}
            />

            {/* Actions */}
            <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
              <button
                onClick={() => handleEdit(m)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  padding: "5px 10px",
                  cursor: "pointer",
                  letterSpacing: "0.08em",
                }}
              >
                EDIT
              </button>

              {confirmDelete === m.slug ? (
                <>
                  <button
                    onClick={() => handleDelete(m.slug)}
                    style={{
                      background: "rgba(196,18,48,0.3)",
                      border: "1px solid rgba(196,18,48,0.5)",
                      borderRadius: 8,
                      color: "#c41230",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    CONFIRM
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      background: "none",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "5px 8px",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setConfirmDelete(m.slug)}
                  style={{
                    background: "rgba(196,18,48,0.08)",
                    border: "1px solid rgba(196,18,48,0.2)",
                    borderRadius: 8,
                    color: "rgba(196,18,48,0.7)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 10,
                    padding: "5px 10px",
                    cursor: "pointer",
                    letterSpacing: "0.08em",
                  }}
                >
                  DELETE
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editTarget && (
          <MemberEditModal
            key="edit-modal"
            member={editTarget}
            isNew={isNew}
            onSave={handleSave}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────── Music ─────────────────────── */

function MusicSection({ store }: { store: AdminStore }) {
  const [url, setUrl] = useState(store.musicConfig.url);
  const [volume, setVolume] = useState(store.musicConfig.volume);
  const [loop, setLoop] = useState(store.musicConfig.loop);
  const [autoplay, setAutoplay] = useState(store.musicConfig.autoplay);
  const [playing, setPlaying] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    store.updateMusicConfig({ url, volume, loop, autoplay });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <div
      onClick={() => onChange(!value)}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        backgroundColor: value ? "#c41230" : "rgba(255,255,255,0.1)",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 3,
          left: value ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: "#fff",
          transition: "left 0.2s",
        }}
      />
    </div>
  );

  const iconBtn = (label: string, active?: boolean, onClick?: () => void) => (
    <button
      key={label}
      onClick={onClick}
      style={{
        background: active ? "rgba(196,18,48,0.2)" : "rgba(255,255,255,0.04)",
        border: `1px solid ${active ? "rgba(196,18,48,0.4)" : "rgba(255,255,255,0.1)"}`,
        borderRadius: 10,
        color: active ? "#c41230" : "rgba(255,255,255,0.6)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        padding: "8px 16px",
        cursor: "pointer",
        letterSpacing: "0.1em",
      }}
    >
      {label}
    </button>
  );

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: 8,
  };

  return (
    <motion.div key="music" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* URL */}
      <div>
        <div style={mono}>Music URL</div>
        <input
          style={inputStyle()}
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Volume */}
      <div>
        <div style={{ ...mono, marginBottom: 10 }}>Volume — {volume}%</div>
        <div style={{ position: "relative" }}>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            style={{
              width: "100%",
              accentColor: "#c41230",
              height: 4,
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {/* Toggles */}
      <div style={{ display: "flex", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Loop</span>
          <Toggle value={loop} onChange={setLoop} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Autoplay</span>
          <Toggle value={autoplay} onChange={setAutoplay} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 8 }}>
        {iconBtn("▶ PLAY", playing, () => setPlaying(true))}
        {iconBtn("⏸ PAUSE", false, () => setPlaying(false))}
        {iconBtn("■ STOP", false, () => setPlaying(false))}
      </div>

      {/* Waveform */}
      <div style={{ ...crimsonGlass(), padding: 12 }}>
        <WaveformCanvas playing={playing} />
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        style={{
          alignSelf: "flex-end",
          background: saved ? "rgba(34,197,94,0.2)" : "rgba(196,18,48,0.8)",
          border: `1px solid ${saved ? "rgba(34,197,94,0.4)" : "rgba(196,18,48,0.5)"}`,
          borderRadius: 10,
          color: saved ? "#22c55e" : "#fff",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          padding: "10px 24px",
          cursor: "pointer",
          letterSpacing: "0.12em",
          transition: "all 0.3s",
        }}
      >
        {saved ? "✓ SAVED" : "SAVE"}
      </button>
    </motion.div>
  );
}

/* ─────────────────────── Site ─────────────────────── */

function SiteSection({ store }: { store: AdminStore }) {
  const [accentColor, setAccentColor] = useState(store.siteConfig.accentColor);
  const [particleDensity, setParticleDensity] = useState(store.siteConfig.particleDensity);
  const [splashText, setSplashText] = useState(store.siteConfig.splashText);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    store.updateSiteConfig({ accentColor, particleDensity, splashText });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const mono: React.CSSProperties = {
    fontFamily: "var(--font-mono)",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase" as const,
    letterSpacing: "0.12em",
    marginBottom: 8,
  };

  return (
    <motion.div key="site" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Accent color */}
      <div>
        <div style={mono}>Accent Color</div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            type="color"
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            style={{
              width: 48,
              height: 40,
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              cursor: "pointer",
              backgroundColor: "transparent",
              padding: 2,
            }}
          />
          <input
            style={{ ...inputStyle(), flex: 1, fontFamily: "var(--font-mono)", textTransform: "uppercase" }}
            value={accentColor}
            onChange={e => setAccentColor(e.target.value)}
            placeholder="#c41230"
          />
          {/* Glow swatch */}
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              backgroundColor: accentColor,
              boxShadow: `0 0 20px ${accentColor}aa, 0 0 40px ${accentColor}44`,
              border: `1px solid ${accentColor}88`,
              flexShrink: 0,
              transition: "all 0.2s",
            }}
          />
        </div>
      </div>

      {/* Particle density */}
      <div>
        <div style={{ ...mono, marginBottom: 10 }}>Particle Density — {particleDensity}</div>
        <input
          type="range"
          min={0}
          max={200}
          value={particleDensity}
          onChange={e => setParticleDensity(Number(e.target.value))}
          style={{ width: "100%", accentColor, cursor: "pointer" }}
        />
      </div>

      {/* Splash text */}
      <div>
        <div style={mono}>Splash Text</div>
        <input
          style={inputStyle()}
          value={splashText}
          onChange={e => setSplashText(e.target.value)}
          placeholder="Welcome text..."
        />
      </div>

      <button
        onClick={handleSave}
        style={{
          alignSelf: "flex-end",
          background: saved ? "rgba(34,197,94,0.2)" : "rgba(196,18,48,0.8)",
          border: `1px solid ${saved ? "rgba(34,197,94,0.4)" : "rgba(196,18,48,0.5)"}`,
          borderRadius: 10,
          color: saved ? "#22c55e" : "#fff",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          padding: "10px 24px",
          cursor: "pointer",
          letterSpacing: "0.12em",
          transition: "all 0.3s",
        }}
      >
        {saved ? "✓ SAVED" : "SAVE"}
      </button>
    </motion.div>
  );
}

/* ─────────────────────── Security ─────────────────────── */

function SecuritySection({ store }: { store: AdminStore }) {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);

  const strength = (() => {
    const n = newPass.length;
    if (n === 0) return 0;
    if (n < 6) return 1;
    if (n < 10) return 2;
    if (n < 14 || !/[^a-zA-Z0-9]/.test(newPass)) return 3;
    return 4;
  })();

  const strengthColor = ["transparent", "#c41230", "#f5a623", "#3b82f6", "#23d160"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Strong", "Excellent"][strength];

  const handleChangePassword = () => {
    if (newPass !== confirm) {
      setPwMsg({ text: "Passwords do not match", ok: false });
      return;
    }
    const ok = store.changePassword(current, newPass);
    setPwMsg({ text: ok ? "Password changed successfully" : "Current password incorrect", ok });
    if (ok) { setCurrent(""); setNewPass(""); setConfirm(""); }
  };

  const lastLog = store.accessLogs[0];

  return (
    <motion.div key="security" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Change password */}
      <div style={{ ...glass(), padding: 20 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "rgba(255,255,255,0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 16,
          }}
        >
          Change Password
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="password"
            style={inputStyle()}
            value={current}
            onChange={e => setCurrent(e.target.value)}
            placeholder="Current password"
          />
          <input
            type="password"
            style={inputStyle()}
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="New password"
          />
          <input
            type="password"
            style={inputStyle()}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm new password"
          />

          {/* Strength bars */}
          <div style={{ display: "flex", gap: 4, height: 4, marginTop: 2 }}>
            {[1, 2, 3, 4].map(i => (
              <div
                key={i}
                style={{
                  flex: 1,
                  borderRadius: 2,
                  backgroundColor: i <= strength ? strengthColor : "rgba(255,255,255,0.08)",
                  transition: "background-color 0.3s",
                }}
              />
            ))}
          </div>
          {newPass && (
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: strengthColor }}>
              {strengthLabel}
            </div>
          )}

          {pwMsg && (
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: pwMsg.ok ? "#22c55e" : "#c41230",
                letterSpacing: "0.05em",
              }}
            >
              {pwMsg.text}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            style={{
              alignSelf: "flex-start",
              background: "rgba(196,18,48,0.15)",
              border: "1px solid rgba(196,18,48,0.3)",
              borderRadius: 10,
              color: "#c41230",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "8px 16px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            UPDATE PASSWORD
          </button>
        </div>
      </div>

      {/* Last login */}
      {lastLog && (
        <div style={{ ...glass(), padding: "12px 16px" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)", marginBottom: 4, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Last Activity
          </div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
            {new Date(lastLog.time).toLocaleString()} — {lastLog.action}
          </div>
        </div>
      )}

      {/* Access log terminal */}
      <div
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 12,
          padding: 16,
          maxHeight: 220,
          overflowY: "auto",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        <div style={{ color: "rgba(255,255,255,0.3)", marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase", fontSize: 9 }}>
          Access Log
        </div>
        {store.accessLogs.length === 0 && (
          <div style={{ color: "rgba(255,255,255,0.2)" }}>No entries.</div>
        )}
        {store.accessLogs.map((log, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 4, alignItems: "center" }}>
            <span style={{ color: "rgba(255,255,255,0.25)", flexShrink: 0, fontSize: 10 }}>
              {new Date(log.time).toLocaleTimeString()}
            </span>
            <span
              style={{
                fontSize: 9,
                padding: "1px 6px",
                borderRadius: 4,
                backgroundColor: log.success ? "rgba(34,197,94,0.15)" : "rgba(196,18,48,0.2)",
                color: log.success ? "#22c55e" : "#c41230",
                letterSpacing: "0.08em",
                flexShrink: 0,
              }}
            >
              {log.success ? "SUCCESS" : "FAILED"}
            </span>
            <span style={{ color: "rgba(255,255,255,0.6)" }}>{log.action}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={() => store.logout()}
        style={{
          alignSelf: "flex-start",
          background: "rgba(196,18,48,0.1)",
          border: "1px solid rgba(196,18,48,0.3)",
          borderRadius: 10,
          color: "#c41230",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
          padding: "10px 20px",
          cursor: "pointer",
          letterSpacing: "0.12em",
        }}
      >
        LOGOUT
      </button>
    </motion.div>
  );
}

/* ─────────────────────── Restore ─────────────────────── */

function RestoreSection({ store }: { store: AdminStore }) {
  const [snapName, setSnapName] = useState("");
  const [confirmRestore, setConfirmRestore] = useState<string | null>(null);
  const [confirmDelete, setConfirmDeleteSnap] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleCreate = () => {
    store.createSnapshot(snapName);
    setSnapName("");
    setMsg("Snapshot created.");
    setTimeout(() => setMsg(null), 2000);
  };

  const handleRestore = (id: string) => {
    store.restoreSnapshot(id);
    setConfirmRestore(null);
    setMsg("Snapshot restored.");
    setTimeout(() => setMsg(null), 2000);
  };

  const handleDeleteSnap = (id: string) => {
    store.deleteSnapshot(id);
    setConfirmDeleteSnap(null);
  };

  const handleReset = () => {
    store.resetToDefaults();
    setConfirmReset(false);
    setMsg("Reset to factory defaults.");
    setTimeout(() => setMsg(null), 2000);
  };

  return (
    <motion.div key="restore" variants={sectionVariants} initial="hidden" animate="visible" exit="exit" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Create snapshot */}
      <div style={{ ...glass(), padding: 20 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>
          Create Snapshot
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...inputStyle(), flex: 1 }}
            value={snapName}
            onChange={e => setSnapName(e.target.value)}
            placeholder="Snapshot name..."
          />
          <button
            onClick={handleCreate}
            style={{
              background: "rgba(196,18,48,0.15)",
              border: "1px solid rgba(196,18,48,0.35)",
              borderRadius: 10,
              color: "#c41230",
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "10px 16px",
              cursor: "pointer",
              letterSpacing: "0.1em",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            SAVE POINT
          </button>
        </div>
      </div>

      {/* Snapshots list */}
      <div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>
          Saved Snapshots
        </div>
        {store.snapshots.length === 0 && (
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "rgba(255,255,255,0.2)", padding: "12px 0" }}>
            No snapshots saved.
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {store.snapshots.map(snap => (
            <div
              key={snap.id}
              style={{ ...glass(), padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "#fff", marginBottom: 3 }}>
                  {snap.name}
                </div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                  {new Date(snap.createdAt).toLocaleString()} · {snap.members.length} members
                </div>
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {confirmRestore === snap.id ? (
                  <>
                    <button
                      onClick={() => handleRestore(snap.id)}
                      style={{
                        background: "rgba(196,18,48,0.25)",
                        border: "1px solid rgba(196,18,48,0.5)",
                        borderRadius: 8,
                        color: "#c41230",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      CONFIRM
                    </button>
                    <button
                      onClick={() => setConfirmRestore(null)}
                      style={{
                        background: "none",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 8,
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "var(--font-mono)",
                        fontSize: 10,
                        padding: "5px 8px",
                        cursor: "pointer",
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setConfirmRestore(snap.id)}
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 8,
                      color: "rgba(255,255,255,0.6)",
                      fontFamily: "var(--font-mono)",
                      fontSize: 10,
                      padding: "5px 10px",
                      cursor: "pointer",
                    }}
                  >
                    RESTORE
                  </button>
                )}

                <button
                  onClick={() =>
                    confirmDelete === snap.id ? handleDeleteSnap(snap.id) : setConfirmDeleteSnap(snap.id)
                  }
                  style={{
                    background: confirmDelete === snap.id ? "rgba(196,18,48,0.2)" : "none",
                    border: "1px solid rgba(196,18,48,0.2)",
                    borderRadius: 8,
                    color: "rgba(196,18,48,0.6)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    padding: "5px 8px",
                    cursor: "pointer",
                  }}
                  title={confirmDelete === snap.id ? "Click again to confirm" : "Delete snapshot"}
                >
                  {confirmDelete === snap.id ? "✓" : "✕"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Status message */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "#22c55e",
              letterSpacing: "0.08em",
            }}
          >
            ✓ {msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Factory reset */}
      <div
        style={{
          ...crimsonGlass(),
          padding: 20,
          marginTop: 8,
        }}
      >
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "rgba(196,18,48,0.7)", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
          Danger Zone
        </div>
        <div style={{ fontFamily: "var(--font-body)", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 14, lineHeight: 1.6 }}>
          Resetting to factory defaults will remove all custom members, settings, and configurations. This action cannot be undone.
        </div>
        {confirmReset ? (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleReset}
              style={{
                background: "rgba(196,18,48,0.4)",
                border: "1px solid rgba(196,18,48,0.7)",
                borderRadius: 10,
                color: "#fff",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "10px 18px",
                cursor: "pointer",
                letterSpacing: "0.1em",
              }}
            >
              YES, RESET
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                color: "rgba(255,255,255,0.5)",
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                padding: "10px 16px",
                cursor: "pointer",
              }}
            >
              CANCEL
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            style={{
              background: "rgba(196,18,48,0.12)",
              border: "1px solid rgba(196,18,48,0.35)",
              borderRadius: 10,
              color: "#c41230",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              padding: "10px 18px",
              cursor: "pointer",
              letterSpacing: "0.1em",
            }}
          >
            RESET TO FACTORY DEFAULTS
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────────────── Main Dashboard ─────────────────────── */

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ReactNode }[] = [
  {
    id: "overview",
    label: "Overview",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    id: "members",
    label: "Members",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
      </svg>
    ),
  },
  {
    id: "music",
    label: "Music",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  },
  {
    id: "site",
    label: "Site",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a15 15 0 0 1 0 18M3 12h18" />
      </svg>
    ),
  },
  {
    id: "security",
    label: "Security",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2l8 4v6c0 5-4 9-8 10C8 21 4 17 4 12V6z" />
      </svg>
    ),
  },
  {
    id: "restore",
    label: "Restore",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 12a9 9 0 1 1 2.6 6.3" />
        <path d="M3 7v5h5" />
      </svg>
    ),
  },
];

interface AdminDashboardProps {
  store: AdminStore;
  onClose: () => void;
}

export function AdminDashboard({ store, onClose }: AdminDashboardProps) {
  const [activeSection, setActiveSection] = useState<NavSection>("overview");

  const renderSection = () => {
    switch (activeSection) {
      case "overview": return <OverviewSection store={store} />;
      case "members":  return <MembersSection store={store} />;
      case "music":    return <MusicSection store={store} />;
      case "site":     return <SiteSection store={store} />;
      case "security": return <SecuritySection store={store} />;
      case "restore":  return <RestoreSection store={store} />;
    }
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "75%",
        backgroundColor: "rgba(4,4,4,0.97)",
        borderLeft: "1px solid rgba(196,18,48,0.3)",
        boxShadow: "-4px 0 40px rgba(196,18,48,0.1), -20px 0 80px rgba(0,0,0,0.6)",
        zIndex: 9000,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 56,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
          flexShrink: 0,
          backgroundColor: "rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              backgroundColor: "#c41230",
              boxShadow: "0 0 8px #c41230",
            }}
          />
          <span style={{ fontFamily: "var(--font-display)", fontSize: 14, letterSpacing: "0.2em", color: "#fff" }}>
            UNHOELY ADMIN
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.5)",
            cursor: "pointer",
            fontSize: 14,
            padding: "6px 10px",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(196,18,48,0.4)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
          }}
        >
          ✕
        </button>
      </div>

      {/* Body: sidebar + content */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Sidebar */}
        <div
          style={{
            width: 200,
            borderRight: "1px solid rgba(255,255,255,0.05)",
            padding: "16px 0",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            backgroundColor: "rgba(0,0,0,0.2)",
          }}
        >
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                style={{
                  background: isActive ? "rgba(196,18,48,0.1)" : "none",
                  border: "none",
                  borderLeft: `3px solid ${isActive ? "#c41230" : "transparent"}`,
                  borderRight: "none",
                  borderTop: "none",
                  borderBottom: "none",
                  cursor: "pointer",
                  padding: "10px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  letterSpacing: "0.1em",
                  textAlign: "left",
                  width: "100%",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.7)";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
                    (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ color: isActive ? "#c41230" : "inherit", flexShrink: 0 }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
          }}
        >
          <AnimatePresence mode="wait">
            {renderSection()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
