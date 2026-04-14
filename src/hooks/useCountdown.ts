import { useEffect, useState } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  seconds: number;
  isOverdue: boolean;
  isStarted: boolean;
  totalSeconds: number;
  display: string;
}

export function useCountdown(startTime: string, endTime: string): CountdownResult {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const isStarted = now >= start;
  const isOverdue = now >= end;
  
  const diff = !isStarted ? (end - start) : (end - now);
  const absDiff = Math.abs(diff);

  const totalSeconds = Math.floor(absDiff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const display = `${isOverdue ? '-' : ''}${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, isOverdue, isStarted, totalSeconds, display };
}
