import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw, CheckCircle } from 'lucide-react';
import { useTaskTimer } from '@/hooks/useTaskTimer';
import { Badge } from '@/components/ui/badge';

interface TaskTimerControlsProps {
  taskId: string;
  initialTimeSpent?: number;
  currentStatus: string;
  onStatusChange?: (status: string) => void;
  compact?: boolean;
}

export function TaskTimerControls({ 
  taskId, 
  initialTimeSpent = 0, 
  currentStatus,
  onStatusChange,
  compact = false 
}: TaskTimerControlsProps) {
  const {
    isRunning,
    timeSpent,
    formatTime,
    startTimer,
    pauseTimer,
    completeTask,
    resetTimer,
  } = useTaskTimer({
    taskId,
    initialTimeSpent,
    onStatusChange,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">در حال انجام</Badge>;
      case 'done':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">تکمیل شده</Badge>;
      case 'postponed':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">به تعویق افتاده</Badge>;
      default:
        return <Badge variant="outline">شروع نشده</Badge>;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm font-mono text-muted-foreground">
          {formatTime()}
        </div>
        <div className="flex gap-1">
          {currentStatus !== 'done' && (
            <>
              {!isRunning ? (
                <Button size="sm" variant="outline" onClick={startTimer}>
                  <Play size={14} />
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={pauseTimer}>
                  <Pause size={14} />
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={completeTask}>
                <CheckCircle size={14} />
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Timer Display */}
      <div className="text-center">
        <div className="text-2xl font-mono font-bold text-primary">
          {formatTime()}
        </div>
        {getStatusBadge(currentStatus)}
      </div>

      {/* Timer Controls */}
      {currentStatus !== 'done' && (
        <div className="flex gap-2 justify-center">
          {!isRunning ? (
            <Button onClick={startTimer} className="flex items-center gap-2">
              <Play size={16} />
              شروع
            </Button>
          ) : (
            <Button onClick={pauseTimer} variant="outline" className="flex items-center gap-2">
              <Pause size={16} />
              توقف
            </Button>
          )}
          
          <Button onClick={completeTask} variant="default" className="flex items-center gap-2">
            <CheckCircle size={16} />
            تکمیل
          </Button>
          
          {timeSpent > 0 && (
            <Button onClick={resetTimer} variant="outline" size="sm" className="flex items-center gap-2">
              <RotateCcw size={14} />
              ریست
            </Button>
          )}
        </div>
      )}

      {currentStatus === 'done' && (
        <div className="text-center">
          <Button onClick={resetTimer} variant="outline" size="sm" className="flex items-center gap-2">
            <RotateCcw size={14} />
            شروع مجدد
          </Button>
        </div>
      )}
    </div>
  );
}