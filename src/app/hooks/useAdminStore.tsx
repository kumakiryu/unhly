import { useReducer, useEffect, useCallback, createContext, useContext } from "react";
import { members as defaultMembers } from "../data/members";
import type { Member } from "../data/members";

const LS_PASSWORD  = "unhoely_admin_password";
const LS_AUTH      = "unhoely_admin_auth";
const LS_MEMBERS   = "unhoely_members";
const LS_MUSIC     = "unhoely_music_config";
const LS_SITE      = "unhoely_site_config";
const LS_LOGS      = "unhoely_access_logs";
const LS_VISITS    = "unhoely_total_views";
const LS_SNAPSHOTS = "unhoely_snapshots";

export interface MusicConfig { url: string; volume: number; loop: boolean; autoplay: boolean; }
export interface SiteConfig  { accentColor: string; particleDensity: number; splashText: string; }
export interface AccessLog   { time: string; action: string; success: boolean; }
export interface Snapshot {
  id: string; name: string; createdAt: string;
  members: Member[]; musicConfig: MusicConfig; siteConfig: SiteConfig;
}

function lsGet<T>(key: string, fallback: T): T {
  try { const r = localStorage.getItem(key); return r === null ? fallback : JSON.parse(r) as T; }
  catch { return fallback; }
}
function lsSet(key: string, v: unknown) { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }

const DEFAULT_MUSIC: MusicConfig = { url: "", volume: 70, loop: true, autoplay: false };
const DEFAULT_SITE:  SiteConfig  = { accentColor: "#c41230", particleDensity: 120, splashText: "" };

interface StoreState {
  isAuthenticated: boolean;
  adminMembers: Member[];
  musicConfig: MusicConfig;
  siteConfig: SiteConfig;
  accessLogs: AccessLog[];
  totalVisits: number;
  snapshots: Snapshot[];
}

const _state: StoreState = {
  isAuthenticated: lsGet<boolean>(LS_AUTH, false),
  adminMembers:    lsGet<Member[]>(LS_MEMBERS, defaultMembers),
  musicConfig:     lsGet<MusicConfig>(LS_MUSIC, DEFAULT_MUSIC),
  siteConfig:      lsGet<SiteConfig>(LS_SITE, DEFAULT_SITE),
  accessLogs:      lsGet<AccessLog[]>(LS_LOGS, []),
  totalVisits:     lsGet<number>(LS_VISITS, 0),
  snapshots:       lsGet<Snapshot[]>(LS_SNAPSHOTS, []),
};

const _listeners = new Set<() => void>();

function _notify() {
  _listeners.forEach(fn => fn());
  window.dispatchEvent(new CustomEvent("unhoely-store-change"));
}

function _applyCSSVars(cfg: SiteConfig) {
  const el = document.documentElement;
  el.style.setProperty("--crimson", cfg.accentColor);
  el.style.setProperty("--primary", cfg.accentColor);
  const r = parseInt(cfg.accentColor.slice(1, 3), 16);
  const g = parseInt(cfg.accentColor.slice(3, 5), 16);
  const b = parseInt(cfg.accentColor.slice(5, 7), 16);
  el.style.setProperty("--crimson-dim",            `rgba(${r},${g},${b},0.6)`);
  el.style.setProperty("--crimson-glow",           `rgba(${r},${g},${b},0.25)`);
  el.style.setProperty("--glass-border-crimson",   `rgba(${r},${g},${b},0.3)`);
  el.style.setProperty("--border",                 `rgba(${r},${g},${b},0.18)`);
  el.style.setProperty("--ring",                   `rgba(${r},${g},${b},0.5)`);
}

_applyCSSVars(_state.siteConfig);

function _addLog(action: string, success: boolean) {
  const entry: AccessLog = { time: new Date().toISOString(), action, success };
  _state.accessLogs = [entry, ..._state.accessLogs].slice(0, 100);
  lsSet(LS_LOGS, _state.accessLogs);
}

function _login(password: string): boolean {
  const stored = localStorage.getItem(LS_PASSWORD) ?? "unhoely";
  if (password === stored) {
    _state.isAuthenticated = true; lsSet(LS_AUTH, true);
    _addLog("LOGIN", true); _notify(); return true;
  }
  _addLog("LOGIN ATTEMPT", false); _notify(); return false;
}

function _logout() {
  _state.isAuthenticated = false; lsSet(LS_AUTH, false);
  _addLog("LOGOUT", true); _notify();
}

function _changePassword(current: string, newPass: string): boolean {
  const stored = localStorage.getItem(LS_PASSWORD) ?? "unhoely";
  if (current !== stored) { _addLog("PASSWORD CHANGE FAILED", false); _notify(); return false; }
  localStorage.setItem(LS_PASSWORD, newPass);
  _addLog("PASSWORD CHANGED", true); _notify(); return true;
}

function _updateMember(slug: string, data: Partial<Member>) {
  _state.adminMembers = _state.adminMembers.map(m => m.slug === slug ? { ...m, ...data } : m);
  lsSet(LS_MEMBERS, _state.adminMembers);
  _addLog(`UPDATE MEMBER: ${slug}`, true); _notify();
}

function _deleteMember(slug: string) {
  _state.adminMembers = _state.adminMembers.filter(m => m.slug !== slug);
  lsSet(LS_MEMBERS, _state.adminMembers);
  _addLog(`DELETE MEMBER: ${slug}`, true); _notify();
}

function _createMember(data: Member) {
  _state.adminMembers = [..._state.adminMembers, data];
  lsSet(LS_MEMBERS, _state.adminMembers);
  _addLog(`CREATE MEMBER: ${data.slug}`, true); _notify();
}

function _reorderMembers(newOrder: Member[]) {
  _state.adminMembers = newOrder;
  lsSet(LS_MEMBERS, _state.adminMembers);
  _addLog("REORDER MEMBERS", true); _notify();
}

function _updateMusicConfig(config: Partial<MusicConfig>) {
  _state.musicConfig = { ..._state.musicConfig, ...config };
  lsSet(LS_MUSIC, _state.musicConfig);
  _addLog("UPDATE MUSIC CONFIG", true); _notify();
}

function _updateSiteConfig(config: Partial<SiteConfig>) {
  _state.siteConfig = { ..._state.siteConfig, ...config };
  lsSet(LS_SITE, _state.siteConfig);
  _applyCSSVars(_state.siteConfig);
  _addLog("UPDATE SITE CONFIG", true); _notify();
}

function _createSnapshot(name: string) {
  const snap: Snapshot = {
    id: `snap_${Date.now()}`,
    name: name.trim() || `Snapshot ${new Date().toLocaleString()}`,
    createdAt: new Date().toISOString(),
    members: JSON.parse(JSON.stringify(_state.adminMembers)),
    musicConfig: { ..._state.musicConfig },
    siteConfig:  { ..._state.siteConfig },
  };
  _state.snapshots = [snap, ..._state.snapshots].slice(0, 20);
  lsSet(LS_SNAPSHOTS, _state.snapshots);
  _addLog(`SNAPSHOT CREATED: ${snap.name}`, true); _notify();
}

function _restoreSnapshot(id: string) {
  const snap = _state.snapshots.find(s => s.id === id);
  if (!snap) return;
  _state.adminMembers = JSON.parse(JSON.stringify(snap.members));
  _state.musicConfig  = { ...snap.musicConfig };
  _state.siteConfig   = { ...snap.siteConfig };
  lsSet(LS_MEMBERS, _state.adminMembers);
  lsSet(LS_MUSIC, _state.musicConfig);
  lsSet(LS_SITE, _state.siteConfig);
  _applyCSSVars(_state.siteConfig);
  _addLog(`SNAPSHOT RESTORED: ${snap.name}`, true); _notify();
}

function _deleteSnapshot(id: string) {
  const snap = _state.snapshots.find(s => s.id === id);
  _state.snapshots = _state.snapshots.filter(s => s.id !== id);
  lsSet(LS_SNAPSHOTS, _state.snapshots);
  _addLog(`SNAPSHOT DELETED: ${snap?.name ?? id}`, true); _notify();
}

function _resetToDefaults() {
  _state.adminMembers = JSON.parse(JSON.stringify(defaultMembers));
  _state.musicConfig  = { ...DEFAULT_MUSIC };
  _state.siteConfig   = { ...DEFAULT_SITE };
  lsSet(LS_MEMBERS, _state.adminMembers);
  lsSet(LS_MUSIC, _state.musicConfig);
  lsSet(LS_SITE, _state.siteConfig);
  _applyCSSVars(_state.siteConfig);
  _addLog("RESET TO DEFAULTS", true); _notify();
}

export function useAdminStore() {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  useEffect(() => {
    _listeners.add(forceUpdate);
    return () => { _listeners.delete(forceUpdate); };
  }, [forceUpdate]);

  useEffect(() => { _applyCSSVars(_state.siteConfig); }, []);

  return {
    isAuthenticated:   _state.isAuthenticated,
    adminMembers:      _state.adminMembers,
    musicConfig:       _state.musicConfig,
    siteConfig:        _state.siteConfig,
    accessLogs:        _state.accessLogs,
    totalVisits:       _state.totalVisits,
    snapshots:         _state.snapshots,

    login:             useCallback(_login, []),
    logout:            useCallback(_logout, []),
    changePassword:    useCallback(_changePassword, []),
    updateMember:      useCallback(_updateMember, []),
    deleteMember:      useCallback(_deleteMember, []),
    createMember:      useCallback(_createMember, []),
    reorderMembers:    useCallback(_reorderMembers, []),
    updateMusicConfig: useCallback(_updateMusicConfig, []),
    updateSiteConfig:  useCallback(_updateSiteConfig, []),
    addLog:            useCallback(_addLog, []),
    createSnapshot:    useCallback(_createSnapshot, []),
    restoreSnapshot:   useCallback(_restoreSnapshot, []),
    deleteSnapshot:    useCallback(_deleteSnapshot, []),
    resetToDefaults:   useCallback(_resetToDefaults, []),
  };
}

export type AdminStore = ReturnType<typeof useAdminStore>;

const AdminStoreContext = createContext<AdminStore | null>(null);
export function AdminStoreProvider({ children, store }: { children: React.ReactNode; store: AdminStore }) {
  return <AdminStoreContext.Provider value={store}>{children}</AdminStoreContext.Provider>;
}
export function useAdminStoreContext(): AdminStore {
  const ctx = useContext(AdminStoreContext);
  if (!ctx) throw new Error("useAdminStoreContext must be used within AdminStoreProvider");
  return ctx;
}

export default useAdminStore;
