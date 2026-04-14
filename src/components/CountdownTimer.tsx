import { useCountdown } from '@/hooks/useCountdown';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  startTime: string;
  endTime: string;
}

export function CountdownTimer({ startTime, endTime }: CountdownTimerProps) {
  const { display, isOverdue, isStarted, totalSeconds } = useCountdown(startTime, endTime);

  const getColorClass = () => {
    if (!isStarted) return 'text-muted-foreground opacity-70';
    if (isOverdue) return 'text-timer animate-pulse-timer';
    if (totalSeconds < 600) return 'text-timer-warning'; // < 10 min
    return 'text-timer-ok';
  };

  return (
    <div className="flex flex-col items-end">
      {!isStarted && <span className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1"><Clock className="w-3 h-3"/>Ожидание</span>}
      <span className={`font-heading text-lg font-bold tabular-nums ${getColorClass()}`}>
        {display}
      </span>
    </div>
  );
}
