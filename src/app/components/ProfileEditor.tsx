import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { Member, SocialPlatform, BgType } from "../data/members";
import useAdminStore from "../hooks/useAdminStore";

// ── Per-member password helpers ───────────────────────────────────────────────
// Default password = member's slug. Stored per-member in localStorage.

function getMemberPwKey(slug: string) { return `unhoely_member_pw_${slug}`; }

function checkMemberPassword(slug: string, attempt: string): boolean {
  const stored = localStorage.getItem(getMemberPwKey(slug));
  return attempt === (stored ?? slug); // default = slug
}

function setMemberPassword(slug: string, pw: string) {
  localStorage.setItem(getMemberPwKey(slug), pw);
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const C = "#c41230";
const BG = "rgba(4,4,4,0.97)";
const GLASS = "rgba(255,255,255,0.04)";
const BORDER = "rgba(196,18,48,0.22)";
const TEXT = "#f0eeec";
const MUTED = "rgba(240,238,236,0.4)";

const input: React.CSSProperties = {
  width: "100%", padding: "9px 13px",
  background: GLASS, border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 8, color: TEXT,
  fontFamily: "var(--font-mono)", fontSize: 13, outline: "none", boxSizing: "border-box",
};
const label: React.CSSProperties = {
  fontFamily: "var(--font-mono)", fontSize: 9, color: MUTED,
  letterSpacing: "0.2em", textTransform: "uppercase", display: "block", marginBottom: 6,
};
const btn = (primary = true): React.CSSProperties => ({
  padding: "9px 18px", borderRadius: 8, border: primary ? "none" : `1px solid ${BORDER}`,
  background: primary ? C : "transparent", color: primary ? TEXT : MUTED,
  fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.1em",
  cursor: "pointer", textTransform: "uppercase",
});

const PLATFORMS: SocialPlatform[] = ["discord","instagram","tiktok","twitter","youtube","kick","spotify","steam"];

// ── Auth step ─────────────────────────────────────────────────────────────────
function AuthStep({ slug, onSuccess }: { slug: string; onSuccess: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (checkMemberPassword(slug, pw)) {
      onSuccess();
    } else {
      setError(true);
      setShake(s => s + 1);
      setTimeout(() => setError(false), 2200);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "40px 32px" }}>
      {/* Lock icon */}
      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(196,18,48,0.1)", border: `1px solid rgba(196,18,48,0.3)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 0 24px rgba(196,18,48,0.15)" }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C} strokeWidth="1.5" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>

      <p style={{ fontFamily: "var(--font-display)", fontSize: 20, color: TEXT, fontWeight: 700, marginBottom: 4 }}>Member Access</p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: C, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 28 }}>
        Enter your profile password
      </p>
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED, marginBottom: 22, textAlign: "center", lineHeight: 1.7 }}>
        Default password is your username: <span style={{ color: TEXT }}>"{slug}"</span>
      </p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 320 }}>
        <motion.div
          animate={shake ? { x: [0, -8, 8, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          key={shake}
          style={{ marginBottom: 12 }}
        >
          <div style={{ position: "relative" }}>
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={e => setPw(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{ ...input, paddingRight: 40, border: `1px solid ${error ? "rgba(196,18,48,0.6)" : "rgba(255,255,255,0.1)"}` }}
            />
            <button type="button" onClick={() => setShow(s => !s)}
              style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: MUTED, cursor: "pointer", padding: 4 }}>
              {show
                ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              }
            </button>
          </div>
        </motion.div>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: C, marginBottom: 10, textAlign: "center" }}>
            Incorrect password
          </motion.p>
        )}
        <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          style={{ ...btn(true), width: "100%", marginTop: 4 }}>
          Unlock Profile Editor
        </motion.button>
      </form>
    </div>
  );
}

// ── Editor panel ──────────────────────────────────────────────────────────────
function EditorPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const store = useAdminStore();
  const [tab, setTab] = useState<"profile" | "background" | "music" | "links" | "password">("profile");
  const [form, setForm] = useState<Member>({ ...member });
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwMsg, setPwMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (field: keyof Member, val: unknown) =>
    setForm(f => ({ ...f, [field]: val }));

  const handleSave = () => {
    store.updateMember(member.slug, form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePw = () => {
    if (!newPw) return;
    if (newPw !== confirmPw) { setPwMsg({ text: "Passwords don't match", ok: false }); return; }
    if (newPw.length < 4) { setPwMsg({ text: "Min 4 characters", ok: false }); return; }
    setMemberPassword(member.slug, newPw);
    setNewPw(""); setConfirmPw("");
    setPwMsg({ text: "Password changed successfully", ok: true });
    setTimeout(() => setPwMsg(null), 2500);
  };

  const TABS = [
    { id: "profile" as const, label: "Profile" },
    { id: "background" as const, label: "Background" },
    { id: "music" as const, label: "Music" },
    { id: "links" as const, label: "Links" },
    { id: "password" as const, label: "Password" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ padding: "20px 24px 0", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 18, color: TEXT, fontWeight: 700 }}>Edit Profile</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: C, letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 2 }}>{member.slug}</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleSave}
              style={{ ...btn(true), background: saved ? "#16a34a" : C, transition: "background 0.3s", fontSize: 10 }}>
              {saved ? "✓ Saved" : "Save Changes"}
            </motion.button>
            <motion.button whileTap={{ scale: 0.95 }} onClick={onClose}
              style={{ ...btn(false), padding: "9px 12px" }}>
              ✕
            </motion.button>
          </div>
        </div>
        {/* Tab nav */}
        <div style={{ display: "flex", gap: 4, paddingBottom: 1 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{ padding: "7px 14px", background: tab === t.id ? `rgba(196,18,48,0.15)` : "transparent", border: "none", borderBottom: tab === t.id ? `2px solid ${C}` : "2px solid transparent", color: tab === t.id ? C : MUTED, fontFamily: "var(--font-mono)", fontSize: 10, cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

            {/* ── Profile tab ── */}
            {tab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={label}>Display Name</label>
                  <input value={form.name} onChange={e => set("name", e.target.value)} style={input} placeholder="Your display name" />
                </div>
                <div>
                  <label style={label}>Bio</label>
                  <textarea value={form.bio} onChange={e => set("bio", e.target.value)}
                    style={{ ...input, height: 90, resize: "vertical" }} placeholder="Tell something about yourself" />
                </div>
                <div>
                  <label style={label}>Tagline</label>
                  <input value={form.tagline} onChange={e => set("tagline", e.target.value)} style={input} placeholder="Short tagline" />
                </div>
                <div>
                  <label style={label}>Discord User ID</label>
                  <input value={form.discordId} onChange={e => set("discordId", e.target.value)} style={input} placeholder="17-19 digit Discord ID" />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: GLASS, border: `1px solid ${BORDER}`, borderRadius: 8 }}>
                  <span style={{ ...label, margin: 0, flex: 1 }}>Featured Member</span>
                  <button onClick={() => set("featured", !form.featured)}
                    style={{ width: 40, height: 22, borderRadius: 11, background: form.featured ? C : "rgba(255,255,255,0.1)", border: "none", cursor: "pointer", position: "relative", transition: "background 0.25s" }}>
                    <span style={{ position: "absolute", width: 16, height: 16, borderRadius: "50%", background: "#fff", top: 3, left: form.featured ? 21 : 3, transition: "left 0.25s" }} />
                  </button>
                </div>
              </div>
            )}

            {/* ── Background tab ── */}
            {tab === "background" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={label}>Background URL</label>
                  <input value={form.bgUrl ?? ""} onChange={e => set("bgUrl", e.target.value)} style={input} placeholder="https://... (image, gif, or video)" />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MUTED, marginTop: 6, lineHeight: 1.6 }}>
                    Supports images, GIFs, and direct video URLs (.mp4).
                  </p>
                </div>
                <div>
                  <label style={label}>Background Type</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    {(["image", "video"] as BgType[]).map(t => (
                      <button key={t} onClick={() => set("bgType", t)}
                        style={{ flex: 1, padding: "9px", background: form.bgType === t ? "rgba(196,18,48,0.15)" : GLASS, border: `1px solid ${form.bgType === t ? C : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: form.bgType === t ? C : MUTED, fontFamily: "var(--font-mono)", fontSize: 11, cursor: "pointer", textTransform: "capitalize" }}>
                        {t === "image" ? "Image / GIF" : "Video (MP4)"}
                      </button>
                    ))}
                  </div>
                </div>
                {form.bgUrl && (
                  <div style={{ position: "relative", borderRadius: 10, overflow: "hidden", height: 140, background: "#111" }}>
                    {form.bgType === "video"
                      ? <video src={form.bgUrl} muted loop autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                      : <img src={form.bgUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
                    }
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(4,4,4,0.8), transparent)" }} />
                    <p style={{ position: "absolute", bottom: 10, left: 12, fontFamily: "var(--font-mono)", fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: "0.15em" }}>PREVIEW</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Music tab ── */}
            {tab === "music" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div>
                  <label style={label}>Music URL (MP3)</label>
                  <input value={form.music ?? ""} onChange={e => set("music", e.target.value)} style={input} placeholder="https://...mp3" />
                </div>
                <div>
                  <label style={label}>Track Title</label>
                  <input value={form.musicTitle ?? ""} onChange={e => set("musicTitle", e.target.value)} style={input} placeholder="Song name" />
                </div>
                <div>
                  <label style={label}>Artist</label>
                  <input value={form.musicArtist ?? ""} onChange={e => set("musicArtist", e.target.value)} style={input} placeholder="Artist name" />
                </div>
                <div>
                  <label style={label}>Album Art URL</label>
                  <input value={form.musicCoverUrl ?? ""} onChange={e => set("musicCoverUrl", e.target.value)} style={input} placeholder="https://...cover.jpg" />
                  {form.musicCoverUrl && (
                    <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
                      <img src={form.musicCoverUrl} alt="cover" style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", border: `1px solid ${BORDER}` }} />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED }}>Cover preview</span>
                    </div>
                  )}
                </div>
                <div>
                  <label style={label}>Start Time (seconds)</label>
                  <input type="number" min={0} value={form.musicStartTime ?? 0}
                    onChange={e => set("musicStartTime", parseFloat(e.target.value) || 0)} style={input} />
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: MUTED, marginTop: 6 }}>
                    Playback begins at this timestamp when someone visits your profile.
                  </p>
                </div>
              </div>
            )}

            {/* ── Links tab ── */}
            {tab === "links" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED, marginBottom: 4, lineHeight: 1.6 }}>
                  Add or remove your social links. These appear as icon buttons on your profile.
                </p>
                {(form.socialLinks ?? []).map((link, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <select value={link.platform} onChange={e => {
                      const links = [...(form.socialLinks ?? [])];
                      links[i] = { ...links[i], platform: e.target.value as SocialPlatform };
                      set("socialLinks", links);
                    }} style={{ ...input, width: 120, flexShrink: 0 }}>
                      {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <input value={link.url} placeholder="https://..." onChange={e => {
                      const links = [...(form.socialLinks ?? [])];
                      links[i] = { ...links[i], url: e.target.value };
                      set("socialLinks", links);
                    }} style={{ ...input, flex: 1 }} />
                    <button onClick={() => {
                      const links = (form.socialLinks ?? []).filter((_, j) => j !== i);
                      set("socialLinks", links);
                    }} style={{ padding: "9px 12px", background: "rgba(196,18,48,0.1)", border: `1px solid rgba(196,18,48,0.25)`, borderRadius: 8, color: C, cursor: "pointer", fontSize: 14, flexShrink: 0 }}>✕</button>
                  </div>
                ))}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => set("socialLinks", [...(form.socialLinks ?? []), { platform: "discord", url: "" }])}
                  style={{ ...btn(false), border: `1px dashed rgba(196,18,48,0.3)`, color: C, marginTop: 4, width: "100%", textAlign: "center" }}>
                  + Add Social Link
                </motion.button>
              </div>
            )}

            {/* ── Password tab ── */}
            {tab === "password" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ padding: "16px", background: "rgba(196,18,48,0.06)", border: `1px solid rgba(196,18,48,0.2)`, borderRadius: 10 }}>
                  <p style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: MUTED, lineHeight: 1.7 }}>
                    Change your personal profile password. The default is your username slug: <span style={{ color: TEXT }}>"{member.slug}"</span>. Only you can edit your profile with this password.
                  </p>
                </div>
                <div>
                  <label style={label}>New Password</label>
                  <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} style={input} placeholder="Min 4 characters" />
                </div>
                <div>
                  <label style={label}>Confirm Password</label>
                  <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} style={input} placeholder="Repeat new password" onKeyDown={e => e.key === "Enter" && handleChangePw()} />
                </div>
                {pwMsg && (
                  <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: pwMsg.ok ? "#22c55e" : C, textAlign: "center" }}>
                    {pwMsg.text}
                  </motion.p>
                )}
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleChangePw}
                  style={{ ...btn(true), width: "100%", textAlign: "center" }}>
                  Update Password
                </motion.button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export function ProfileEditButton({ member }: { member: Member }) {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
    setTimeout(() => setAuthed(false), 400); // reset auth after panel closes
  }, []);

  return (
    <>
      {/* Floating edit button */}
      <motion.button
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        whileHover={{ scale: 1.1, boxShadow: "0 0 24px rgba(196,18,48,0.5)" }}
        whileTap={{ scale: 0.92 }}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 40,
          width: 48, height: 48, borderRadius: "50%",
          background: "rgba(8,8,8,0.9)",
          border: "1px solid rgba(196,18,48,0.45)",
          color: "#c41230", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 20px rgba(0,0,0,0.5), 0 0 12px rgba(196,18,48,0.18)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
        }}
        title="Edit your profile"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", zIndex: 50 }}
            />

            {/* Slide-in panel */}
            <motion.div
              key="panel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "fixed", top: 0, right: 0, bottom: 0,
                width: "min(480px, 95vw)",
                background: BG,
                borderLeft: `1px solid ${BORDER}`,
                boxShadow: "-8px 0 40px rgba(196,18,48,0.08), -2px 0 60px rgba(0,0,0,0.6)",
                zIndex: 51,
                display: "flex", flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Top crimson line */}
              <div style={{ height: 2, background: `linear-gradient(to right, transparent, ${C}, transparent)`, flexShrink: 0 }} />

              {!authed
                ? <AuthStep slug={member.slug} onSuccess={() => setAuthed(true)} />
                : <EditorPanel member={member} onClose={handleClose} />
              }
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
