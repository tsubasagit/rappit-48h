import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  deadline: Date;
}

function calcRemaining(deadline: Date): { hours: number; minutes: number; expired: boolean } {
  const now = Date.now();
  const target = deadline instanceof Date ? deadline.getTime() : new Date(deadline).getTime();
  const diff = target - now;

  if (diff <= 0) {
    return { hours: 0, minutes: 0, expired: true };
  }

  const totalMinutes = Math.floor(diff / 60000);
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
    expired: false,
  };
}

export function CountdownTimer({ deadline }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(() => calcRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining(calcRemaining(deadline));
    }, 60000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (remaining.expired) {
    return (
      <span className="text-sm font-medium text-red-600">
        期限切れ
      </span>
    );
  }

  const isUrgent = remaining.hours < 12;

  return (
    <span
      className={`text-sm font-medium ${
        isUrgent ? 'text-accent-500' : 'text-gray-600'
      }`}
    >
      残り {remaining.hours}時間 {remaining.minutes}分
    </span>
  );
}
