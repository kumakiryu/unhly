import { useRef } from "react";
import { Outlet, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";

const EASING = [0.22, 1, 0.36, 1] as const;

function routeDepth(path: string) {
  if (path === "/") return 0;
  if (path === "/members") return 1;
  return 2;
}

// Per-route enter/exit configs
function getVariants(isForward: boolean) {
  return {
    initial: isForward
      ? { opacity: 0, y: 30, scale: 0.97, filter: "blur(12px)" }
      : { opacity: 0, y: -20, scale: 1.03, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
    exit: isForward
      ? { opacity: 0, scale: 1.05, filter: "blur(18px)", y: -8 }
      : { opacity: 0, y: 28, scale: 0.96, filter: "blur(14px)" },
  };
}

export function RootLayout() {
  const location = useLocation();
  const prevDepth = useRef(routeDepth(location.pathname));
  const currentDepth = routeDepth(location.pathname);
  const isForward = currentDepth >= prevDepth.current;

  // Update after render so next comparison is correct
  prevDepth.current = currentDepth;

  const v = getVariants(isForward);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={{
          duration: 0.55,
          ease: EASING,
          // Exit is faster so the enter feels snappy
          ...(typeof v.exit === "object" && { exit: { duration: 0.22, ease: EASING } }),
        }}
        style={{ minHeight: "100vh", willChange: "transform, opacity, filter" }}
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}
