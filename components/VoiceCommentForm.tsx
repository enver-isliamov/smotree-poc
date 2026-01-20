'use client';
import { useState, useEffect } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { secondsToTimecode } from '@/lib/timecode';

interface VoiceCommentFormProps {
  startTime: number;
  endTime?: number;
  framerate: number;
  userName: string;
  onSubmit: (text: string, isVoice: boolean) => void;
  onCancel: () => void;
}

export default function VoiceCommentForm({
  startTime,
  endTime,
  framerate,
  userName,
  onSubmit,
  onCancel,
}: VoiceCommentFormProps) {
  const [text, setText] = useState('');
  const {
    transcript,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
    isSupported,
    error,
  } = useVoiceRecognition('ru-RU');

  // Update text when transcript changes
  useEffect(() => {
    if (transcript) {
      setText(transcript);
    }
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      startListening();
    }
  };

  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), transcript.length > 0);
      setText('');
      resetTranscript();
    }
  };

  const startTimecode = secondsToTimecode(startTime, framerate);
  const endTimecode = endTime ? secondsToTimecode(endTime, framerate) : null;

  return (
    <div className="bg-gray-900 rounded-t-2xl p-4 space-y-4 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Новый комментарий</h3>
          <p className="text-sm text-gray-400 font-mono mt-1">
            {endTimecode ? `${startTimecode} → ${endTimecode}` : startTimecode}
            {endTimecode && <span className="ml-2 text-blue-400">(Диапазон)</span>}
          </p>
        </div>
        <button
          onClick={onCancel}
          className="w-10 h-10 flex items-center justify-center hover:bg-gray-800 rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Voice/Text Input */}
      <div className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите комментарий или используйте голосовой ввод..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none resize-none"
          rows={4}
        />

        {/* Voice Button */}
        {isSupported && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleVoiceToggle}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                isListening
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isListening ? (
                <>
                  <MicOff className="w-5 h-5" />
                  <span>Остановить запись</span>
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </>
              ) : (
                <>
                  <Mic className="w-5 h-5" />
                  <span>Голосовой ввод</span>
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400">
            Ошибка: {error}. Разрешите доступ к микрофону в настройках браузера.
          </p>
        )}

        {!isSupported && (
          <p className="text-sm text-yellow-400">
            Голосовой ввод не поддерживается в вашем браузере. Используйте Chrome или Safari.
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!text.trim()}
        className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        <span>Добавить комментарий</span>
      </button>
    </div>
  );
}
