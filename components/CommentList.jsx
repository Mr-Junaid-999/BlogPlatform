"use client";

import { formatDate } from "@/lib/utils";

export function CommentList({ comments }) {
  const topLevelComments = comments.filter((comment) => !comment.parent_id);

  const getReplies = (commentId) => {
    return comments.filter((comment) => comment.parent_id === commentId);
  };

  const CommentItem = ({ comment, depth = 0 }) => {
    const replies = getReplies(comment.id);

    return (
      <div
        className={`${depth > 0 ? "ml-8 border-l-2 border-gray-200 pl-4" : ""}`}
      >
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-gray-900">
              {comment.author_name}
            </h4>
            <span className="text-sm text-gray-500">
              {formatDate(comment.created_at)}
            </span>
          </div>
          <p className="text-gray-700">{comment.content}</p>
        </div>
        {replies.map((reply) => (
          <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">
        Comments ({topLevelComments.length})
      </h3>
      {topLevelComments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
      {topLevelComments.length === 0 && (
        <p className="text-gray-500 text-center py-8">
          No comments yet. Be the first to comment!
        </p>
      )}
    </div>
  );
}
