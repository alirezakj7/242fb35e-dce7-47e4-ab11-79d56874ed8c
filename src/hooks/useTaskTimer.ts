import { useState, useEffect, useRef } from 'react';
import { useTasks } from './useTasks';
import { useToast } from './use-toast';

interface UseTaskTimerProps {
  taskId: string;
  initialTimeSpent?: number;
  onStatusChange?: (status: string) => void;
}

export function useTaskTimer({ taskId, initialTimeSpent = 0, onStatusChange }: UseTaskTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [timeSpent, setTimeSpent] = useState(initialTimeSpent);
  const [sessionTime, setSessionTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { updateTask } = useTasks();
  const { toast } = useToast();

  // Format time to MM:SS or HH:MM:SS
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
    try {
      await updateTask(taskId, { status: 'in_progress' });
      setIsRunning(true);
      onStatusChange?.(​'in_progress');
      
      toast({
        title: 'تایمر شروع شد',
        description: 'وظیفه در حال انجام است',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در شروع تایمر',
        variant: 'destructive',
      });
    }
  };

  // Pause timer
  const pauseTimer = async () => {
    try {
      const totalTime = timeSpent + sessionTime;
      await updateTask(taskId, { 
        status: 'not_started',
        time_spent: totalTime 
      });
      
      setIsRunning(false);
      setTimeSpent(totalTime);
      setSessionTime(0);
      onStatusChange?.('not_started');
      
      toast({
        title: 'تایمر متوقف شد',
        description: `زمان ثبت شد: ${formatTime(totalTime)}`,
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در توقف تایمر',
        variant: 'destructive',
      });
    }
  };

  // Complete task
  const completeTask = async () => {
    try {
      const totalTime = timeSpent + sessionTime;
      await updateTask(taskId, { 
        status: 'done',
        completed_at: new Date().toISOString(),
        time_spent: totalTime 
      });
      
      setIsRunning(false);
      setSessionTime(0);
      onStatusChange?.('done');
      
      toast({
        title: 'وظیفه تکمیل شد',
        description: `زمان کل: ${formatTime(totalTime)}`,
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در تکمیل وظیفه',
        variant: 'destructive',
      });
    }
  };

  // Reset timer
  const resetTimer = async () => {
    try {
      await updateTask(taskId, { 
        status: 'not_started',
        time_spent: 0 
      });
      
      setIsRunning(false);
      setTimeSpent(0);
      setSessionTime(0);
      onStatusChange?.('not_started');
      
      toast({
        title: 'تایمر ریست شد',
        description: 'زمان صفر شد',
      });
    } catch (error) {
      toast({
        title: 'خطا',
        description: 'خطا در ریست تایمر',
        variant: 'destructive',
      });
    }
  };

  // Effect for timer interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const totalTime = timeSpent + sessionTime;

  return {
    isRunning,
    timeSpent: totalTime,
    sessionTime,
    formatTime: () => formatTime(totalTime),
    startTimer,
    pauseTimer,
    completeTask,
    resetTimer,
  };
}