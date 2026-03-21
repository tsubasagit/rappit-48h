import { useEffect, useState } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
  totalMs: number;
}

function calcRemaining(deadline: Date): CountdownResult {
  const totalMs = deadline.getTime() - Date.now();

  if (totalMs <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isExpired: true, totalMs: 0 };
  }

  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, isExpired: false, totalMs };
}

export function useCountdown(deadline: Date) {
  const [remaining, setRemaining] = useState<CountdownResult>(() => calcRemaining(deadline));

  useEffect(() => {
    setRemaining(calcRemaining(deadline));

    const interval = setInterval(() => {
      const result = calcRemaining(deadline);
      setRemaining(result);

      if (result.isExpired) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return remaining;
}
