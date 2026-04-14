import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  endTime: string;
}

export function CountdownTimer({ endTime }: CountdownTimerProps) {
  const { display, isOverdue, totalSeconds } = useCountdown(endTime);

  const getColorClass = () => {
    if (isOverdue) return 'text-timer animate-pulse-timer';
    if (totalSeconds < 600) return 'text-timer-warning'; // < 10 min
    return 'text-timer-ok';
  };

  return (
    <span className={`font-heading text-lg font-bold tabular-nums ${getColorClass()}`}>
      {display}
    </span>
  );
}
