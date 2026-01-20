'use client';
import { Plus, Timer } from 'lucide-react';

interface FABProps {
  onClick: () => void;
  onRangeMode?: () => void;
  show: boolean;
  isRangeMode?: boolean;
}

export default function FloatingActionButton({ onClick, onRangeMode, show, isRangeMode }: FABProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 flex flex-col gap-3 z-40 animate-fade-in">
      {/* Range Mode Toggle */}
      {onRangeMode && (
        <button
          onClick={onRangeMode}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all ${
            isRangeMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-700 hover:bg-gray-600'
          }`}
          title={isRangeMode ? "Диапазон активен" : "Режим диапазона"}
        >
          <Timer className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Main Add Button */}
      <button
        onClick={onClick}
        className="w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110"
        title="Добавить комментарий"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>
    </div>
  );
}
