import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useToast } from '@/hooks/use-toast';

interface TaskTimerProps {
  taskId: string;
  currentStatus: 'not_started' | 'in_progress' | 'done' | 'postponed';
  timeSpent: number; // in seconds
  onStatusChange?: () => void;
}

export function TaskTimer({ taskId, currentStatus, timeSpent, onStatusChange }: TaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTime, setCurrentTime] = useState(timeSpent);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateTask } = useTasks();
  const { toast } = useToast();

  // Format time from seconds to HH:MM:SS
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = async () => {
    if (currentStatus === 'done') {
      toast({
        title: 'خطا',
        description: 'نمی‌توان تایمر وظیفه تکمیل شده را شروع کرد',
        variant: 'destructive',
      });
      return;
    }

    setIsRunning(true);
    
    // Update task status to in_progress if not already
    if (currentStatus === 'not_started') {
      try {
        await updateTask(taskId, { status: 'in_progress' });
        onStatusChange?.();
      } catch (error) {
        console.error('Error updating task status:', error);
      }
    }

    intervalRef.current = setInterval(() => {
      setCurrentTime(prev => prev + 1);
    }, 1000);
  };

  // Pause timer
  const pauseTimer = async () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Save current time to database
    try {
      await updateTask(taskId, { time_spent: currentTime });
    } catch (error) {
      console.error('Error saving time:', error);
    }
  };

  // Stop timer and mark as done
  const stopTimer = async () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    try {
      await updateTask(taskId, { 
        status: 'done',
        time_spent: currentTime,
        completed_at: new Date().toISOString()
      });
      onStatusChange?.();
      toast({
        title: 'وظیفه تکمیل شد',
        description: `وظیفه با موفقیت تکمیل شد. زمان صرف شده: ${formatTime(currentTime)}`,
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در تکمیل وظیفه',
        variant: 'destructive',
      });
    }
  };

  // Change status manually
  const changeStatus = async (newStatus: 'not_started' | 'in_progress' | 'done' | 'postponed') => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'done') {
        updateData.completed_at = new Date().toISOString();
        // Stop timer if running
        if (isRunning) {
          setIsRunning(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } else if (newStatus === 'not_started') {
        updateData.completed_at = null;
      }
      
      updateData.time_spent = currentTime;
      
      await updateTask(taskId, updateData);
      onStatusChange?.();
      
      toast({
        title: 'وضعیت تغییر کرد',
        description: `وضعیت وظیفه به ${getStatusLabel(newStatus)} تغییر یافت`,
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در تغییر وضعیت',
        variant: 'destructive',
      });
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'شروع نشده';
      case 'in_progress': return 'در حال انجام';
      case 'done': return 'تکمیل شده';
      case 'postponed': return 'به تعویق افتاده';
      default: return status;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'not_started': return 'secondary';
      case 'in_progress': return 'default';
      case 'done': return 'outline';
      case 'postponed': return 'destructive';
      default: return 'secondary';
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Update current time when timeSpent prop changes
  useEffect(() => {
    if (!isRunning) {
      setCurrentTime(timeSpent);
    }
  }, [timeSpent, isRunning]);

  return (
    <div className="space-y-3">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant(currentStatus)}>
          {getStatusLabel(currentStatus)}
        </Badge>
        
        {/* Time Display */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Clock size={14} />
          <span>{formatTime(currentTime)}</span>
        </div>
      </div>

      {/* Timer Controls */}
      {currentStatus !== 'done' && currentStatus !== 'postponed' && (
        <div className="flex items-center gap-2">
          {!isRunning ? (
            <Button
              size="sm"
              variant="outline"
              onClick={startTimer}
              className="flex items-center gap-1"
            >
              <Play size={14} />
              شروع
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={pauseTimer}
              className="flex items-center gap-1"
            >
              <Pause size={14} />
              توقف
            </Button>
          )}
          
          <Button
            size="sm"
            variant="default"
            onClick={stopTimer}
            className="flex items-center gap-1"
          >
            <Square size={14} />
            تکمیل
          </Button>
        </div>
      )}

      {/* Status Change Buttons */}
      <div className="flex items-center gap-1">
        {currentStatus !== 'not_started' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeStatus('not_started')}
            className="text-xs"
          >
            شروع نشده
          </Button>
        )}
        
        {currentStatus !== 'in_progress' && currentStatus !== 'done' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeStatus('in_progress')}
            className="text-xs"
          >
            در حال انجام
          </Button>
        )}
        
        {currentStatus !== 'postponed' && currentStatus !== 'done' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeStatus('postponed')}
            className="text-xs"
          >
            به تعویق انداختن
          </Button>
        )}
        
        {currentStatus !== 'done' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => changeStatus('done')}
            className="text-xs"
          >
            تکمیل
          </Button>
        )}
      </div>
    </div>
  );
}