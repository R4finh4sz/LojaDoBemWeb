"use client";

import { useEffect, useRef, useState } from "react";

const cooldownMs = 5 * 60_000;
const maxResends = 3;

export function useCodeResend() {
  const deadlineRef = useRef(0);
  const resends = useRef(0);
  const [deadline, setDeadline] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  useEffect(() => {
    if (!deadline || limitReached) return;
    const timer = window.setInterval(() => {
      const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(seconds);
      if (seconds === 0) window.clearInterval(timer);
    }, 250);
    return () => window.clearInterval(timer);
  }, [deadline, limitReached]);

  function startCooldown() {
    const nextDeadline = Date.now() + cooldownMs;
    deadlineRef.current = nextDeadline;
    setDeadline(nextDeadline);
    setRemaining(cooldownMs / 1000);
  }

  function start() {
    resends.current = 0;
    setLimitReached(false);
    startCooldown();
  }

  function tryResend() {
    if (resends.current >= maxResends || Date.now() < deadlineRef.current) return false;
    resends.current += 1;
    setLimitReached(resends.current >= maxResends);
    startCooldown();
    return true;
  }

  const time = `${String(Math.floor(remaining / 60)).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const label = limitReached ? "Reenvio indisponível" : remaining > 0 ? `Reenviar em ${time}` : "Reenviar código";

  return { blocked: limitReached || remaining > 0, label, start, tryResend };
}
