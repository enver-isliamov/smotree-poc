'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { storageManager } from '@/lib/storage-manager';

export default function NamePrompt({ onComplete }: { onComplete: (name: string) => void }) {
  const [name, setName] = useState('');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const existing = storageManager.getUserName();
    if (existing) {
      onComplete(existing);
    } else {
      setShow(true);
    }
  }, [onComplete]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      storageManager.setUserName(name.trim());
      onComplete(name.trim());
      setShow(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4">Добро пожаловать в SmoTree!</h2>
        <p className="text-gray-400 mb-6">
          Представьтесь, чтобы оставлять комментарии
        </p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            className="input mb-4"
            placeholder="Ваше имя"
            value={name}
            onChange={e => setName(e.target.value)}
            autoFocus
            required
          />
          <button type="submit" className="btn-primary w-full">
            Продолжить
          </button>
        </form>
      </div>
    </div>
  );
}
