'use client';
import { MessageSquare, Check, Clock, Trash2 } from 'lucide-react';
import type { Comment } from '@/types';

interface CommentThreadProps {
  comments: Comment[];
  onCommentClick: (comment: Comment) => void;
  onToggleStatus: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export default function CommentThread({
  comments,
  onCommentClick,
  onToggleStatus,
  onDelete,
}: CommentThreadProps) {
  const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Комментарии ({comments.length})
        </h3>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {sortedComments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Нет комментариев</p>
            <p className="text-sm">Кликните на timeline чтобы добавить</p>
          </div>
        ) : (
          sortedComments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition cursor-pointer group"
              onClick={() => onCommentClick(comment)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="font-medium text-sm">{comment.author}</div>
                  <div className="text-xs text-gray-500 font-mono">
                    {comment.timecode} • Frame {comment.frameNumber}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStatus(comment.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition"
                  >
                    {comment.status === 'resolved' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-500" />
                    )}
                  </button>
                  
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(comment.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Comment text */}
              <p className="text-sm text-gray-300">{comment.text}</p>

              {/* Status badge */}
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    comment.status === 'resolved'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {comment.status === 'resolved' ? 'Решено' : 'Открыто'}
                </span>
              </div>

              {/* Replies preview (if any) */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-gray-700">
                  <p className="text-xs text-gray-500">
                    {comment.replies.length} {comment.replies.length === 1 ? 'ответ' : 'ответов'}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
