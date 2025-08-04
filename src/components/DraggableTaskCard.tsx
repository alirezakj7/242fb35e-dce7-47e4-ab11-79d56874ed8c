import { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent } from '@/components/ui/card';
import { TaskTimer } from '@/components/TaskTimer';
import { Edit, Calendar } from 'lucide-react';
import { TaskModal } from '@/components/modals/TaskModal';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];

interface DraggableTaskCardProps {
  task: Task;
  categoryColor: string;
  onRefetch: () => void;
  timeSlot?: string;
}

export function DraggableTaskCard({ task, categoryColor, onRefetch, timeSlot }: DraggableTaskCardProps) {
  const [showTimer, setShowTimer] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(task.status);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: task.id,
    data: {
      task,
      type: 'task'
    }
  });

  // Handle touch events for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragOffset({ x: touch.clientX, y: touch.clientY });
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    const deltaX = touch.clientX - dragOffset.x;
    const deltaY = touch.clientY - dragOffset.y;
    
    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      setIsDragging(true);
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - dragOffset.x;
    
    // Swipe left -> Edit task
    if (deltaX < -100) {
      setEditModalOpen(true);
    }
    // Swipe right -> Postpone to next day (handled by parent)
    else if (deltaX > 100) {
      // This will be handled by the drag and drop context
      console.log('Postpone task to next day');
    }
    
    setIsDragging(false);
  };

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={`border-l-4 ${categoryColor} ${isDragging ? 'opacity-75' : ''} cursor-grab active:cursor-grabbing transition-opacity`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        {...listeners}
        {...attributes}
      >
        <CardContent className="p-4">
          <div className="space-y-3">
            {timeSlot && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar size={14} />
                {timeSlot}
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded">{task.category}</span>
                  {task.tags && task.tags.length > 0 && task.tags.map(tag => (
                    <span key={tag} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditModalOpen(true);
                }}
                className="p-2 hover:bg-muted rounded-md transition-colors"
              >
                <Edit size={16} />
              </button>
            </div>
            
            <TaskTimer
              taskId={task.id}
              currentStatus={task.status}
              timeSpent={task.time_spent || 0}
              onStatusChange={onRefetch}
            />
          </div>
        </CardContent>
      </Card>

      {/* Swipe indicators */}
      {isDragging && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-between px-8 pointer-events-none z-50">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg opacity-75">
            <Edit size={20} />
            <div className="text-sm mt-1">ویرایش</div>
          </div>
          <div className="bg-orange-500 text-white px-4 py-2 rounded-lg opacity-75">
            <Calendar size={20} />
            <div className="text-sm mt-1">به تعویق</div>
          </div>
        </div>
      )}

      <TaskModal 
        open={editModalOpen} 
        onOpenChange={setEditModalOpen}
        task={task}
      />
    </>
  );
}