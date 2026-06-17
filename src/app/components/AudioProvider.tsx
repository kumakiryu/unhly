import React, { createContext, useContext, useRef, useState, useCallback } from "react";

interface AudioContextValue {
  splashPlaying: boolean;
  startSplashAudio: (url?: string) => void;
}

const Ctx = createContext<AudioContextValue>({
  splashPlaying: false,
  startSplashAudio: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const splashAudioRef = useRef<HTMLAudioElement | null>(null);
  const [splashPlaying, setSplashPlaying] = useState(false);

  const startSplashAudio = useCallback(
    (url?: string) => {
      if (splashPlaying) return;

      if (url) {
        // URL-based audio
        const audio = new Audio(url);
        audio.loop = true;
        audio.volume = 0;
        splashAudioRef.current = audio;
        audio.play().catch(() => {});

        let vol = 0;
        const fade = setInterval(() => {
          vol = Math.min(vol + 0.005, 0.18);
          audio.volume = vol;
          if (vol >= 0.18) clearInterval(fade);
        }, 80);
      } else {
        // Fallback: Web Audio API ambient drone
        const ac = new AudioContext();
        const master = ac.createGain();
        master.gain.setValueAtTime(0, ac.currentTime);
        master.gain.linearRampToValueAtTime(0.06, ac.currentTime + 4);
        master.connect(ac.destination);

        [
          { freq: 55, gain: 0.45 },
          { freq: 82.5, gain: 0.28 },
          { freq: 110, gain: 0.18 },
        ].forEach(({ freq, gain }) => {
          const osc = ac.createOscillator();
          const g = ac.createGain();
          osc.type = "sine";
          osc.frequency.value = freq;
          g.gain.value = gain;
          osc.connect(g);
          g.connect(master);
          osc.start();
        });
      }

      setSplashPlaying(true);
    },
    [splashPlaying]
  );

  return (
    <Ctx.Provider value={{ splashPlaying, startSplashAudio }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAudio = () => useContext(Ctx);
