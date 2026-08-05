import { formatDate } from "@/lib/utils";
import type { Comment } from "@/types/database.types";

export function CommentList({ comments }: { comments: Comment[] }) {
  if (comments.length === 0) {
    return <p className="text-sm text-neutral-500">Sé la primera persona en comentar.</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {comments.map((comment) => (
        <li key={comment.id} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-medium text-neutral-900 dark:text-neutral-100">{comment.author_name}</span>
            <span className="text-xs text-neutral-400">{formatDate(comment.created_at)}</span>
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300">{comment.content}</p>
        </li>
      ))}
    </ul>
  );
}
