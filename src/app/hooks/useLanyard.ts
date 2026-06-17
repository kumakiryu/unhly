import { useEffect, useState, useRef } from "react";
import type { Status } from "../data/members";

// ── Lanyard types ─────────────────────────────────────────────────────────────
export interface LanyardActivity {
  name: string;
  type: number; // 0=Playing 1=Streaming 2=Listening 3=Watching 4=Custom 5=Competing
  state?: string;
  details?: string;
  assets?: {
    large_image?: string;
    large_text?: string;
    small_image?: string;
    small_text?: string;
  };
  application_id?: string;
}

export interface LanyardSpotify {
  song: string;
  artist: string;
  album: string;
  album_art_url: string;
  track_id: string;
}

export interface LanyardData {
  discord_status: Status;
  discord_user: {
    id: string;
    username: string;
    display_name?: string;
    avatar: string | null;
    discriminator: string;
    global_name?: string;
  };
  activities: LanyardActivity[];
  listening_to_spotify: boolean;
  spotify: LanyardSpotify | null;
  active_on_discord_desktop: boolean;
  active_on_discord_mobile: boolean;
  active_on_discord_web: boolean;
}

export interface LanyardState {
  data: LanyardData | null;
  loading: boolean;
  error: boolean;
}

// ── Derive avatar URL from Lanyard discord_user ───────────────────────────────
export function getDiscordAvatarUrl(userId: string, hash: string | null): string | null {
  if (!hash) return null;
  const ext = hash.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${userId}/${hash}.${ext}?size=256`;
}

// ── Derive human-readable activity string ─────────────────────────────────────
export function getActivityText(data: LanyardData): string {
  if (data.listening_to_spotify && data.spotify) {
    return `${data.spotify.song} — ${data.spotify.artist}`;
  }

  // Filter out Spotify activity (type 2 named "Spotify") and custom status (type 4)
  const real = data.activities.filter(
    (a) => a.type !== 4 && a.name !== "Spotify"
  );

  if (real.length > 0) {
    const a = real[0];
    if (a.type === 0) return `Playing ${a.name}`;
    if (a.type === 1) return `Streaming ${a.name}`;
    if (a.type === 2) return `Listening to ${a.name}`;
    if (a.type === 3) return `Watching ${a.name}`;
    if (a.type === 5) return `Competing in ${a.name}`;
    return a.name;
  }

  // Custom status
  const custom = data.activities.find((a) => a.type === 4);
  if (custom?.state) return custom.state;

  return "";
}

// ── WebSocket Lanyard hook ────────────────────────────────────────────────────
// Uses Lanyard's WebSocket API for real-time presence — no polling needed.
// Subscribes to a single user ID and updates on every PRESENCE_UPDATE event.

const LANYARD_WS = "wss://api.lanyard.rest/socket";
const OP = { EVENT: 0, HELLO: 1, INITIALIZE: 2, HEARTBEAT: 3 } as const;

// Whether the Discord ID looks like a real snowflake (17-19 digits)
function isRealId(id: string): boolean {
  return /^\d{17,19}$/.test(id);
}

export function useLanyard(discordId: string): LanyardState {
  const [state, setState] = useState<LanyardState>({ data: null, loading: true, error: false });
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Skip if placeholder ID
    if (!isRealId(discordId)) {
      setState({ data: null, loading: false, error: false });
      return;
    }

    let alive = true;

    function connect() {
      const ws = new WebSocket(LANYARD_WS);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        if (!alive) return;
        const msg = JSON.parse(event.data as string);

        if (msg.op === OP.HELLO) {
          // Start heartbeat
          heartbeatRef.current = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ op: OP.HEARTBEAT }));
            }
          }, msg.d.heartbeat_interval);

          // Subscribe to this user
          ws.send(
            JSON.stringify({
              op: OP.INITIALIZE,
              d: { subscribe_to_id: discordId },
            })
          );
        }

        if (msg.op === OP.EVENT) {
          const { t, d } = msg;
          if (
            t === "INIT_STATE" ||
            t === "PRESENCE_UPDATE" ||
            t === "PRESENCE_REPLACE"
          ) {
            setState({ data: d, loading: false, error: false });
          }
        }
      };

      ws.onerror = () => {
        if (alive) setState((s) => ({ ...s, loading: false, error: true }));
      };

      ws.onclose = () => {
        if (heartbeatRef.current) clearInterval(heartbeatRef.current);
        // Reconnect after 5s on unexpected close
        if (alive) setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      alive = false;
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      wsRef.current?.close();
    };
  }, [discordId]);

  return state;
}
