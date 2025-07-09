import { userQueryOption } from "@/lib/api";
import { cn, relativeTime } from "@/lib/utils";
import { Comment } from "@/shared/types";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, MessageSquare, MinusIcon, PlusIcon } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";

type CommentCardProps = {
  comment: Comment;
  depth: number;
  activeReplyId: number | null;
  setActiveReplyId: Dispatch<SetStateAction<number | null>>;
  isLast: boolean;
  toggleUpvote: () => void;
};

export function CommentsCard({
  comment,
  depth,
  activeReplyId,
  setActiveReplyId,
  isLast,
  toggleUpvote,
}: CommentCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: user } = useQuery(userQueryOption());
  const isUpvoted = comment.commentUpvotes.length > 0;
  const isReplying = activeReplyId === comment.id;
  return (
    <div className={cn(depth > 0 && "ml-4 border-l border-border pl-4")}>
      <div className="py-2">
        <div className="mb-2 flex items-center space-x-1 text-xs">
          <button
            disabled={!user}
            className={cn(
              "flex items-center space-x-1 hover:text-primary",
              isUpvoted ? "text-primary" : "text-muted-foreground"
            )}
          >
            <ChevronUp size={14} />
            <span className="font-medium">{comment.points}</span>
          </button>

          <span className="text-muted-foreground">•</span>
          <span className="font-medium">{comment.author.username}</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-muted-foreground">
            {relativeTime(comment.createdAt)}
          </span>
          <span className="text-muted-foreground">•</span>

          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="text-muted-foreground hover:text-foreground"
          >
            {isCollapsed ? <PlusIcon size={14} /> : <MinusIcon size={14} />}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <p className="mb-2 text-sm text-foreground">{comment.content}</p>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {user && (
                <button
                  onClick={() =>
                    setActiveReplyId(isReplying ? null : comment.id)
                  }
                  className="flex items-center space-x-1 hover:text-foreground"
                >
                  <MessageSquare size={12} />
                  <span>Reply</span>
                </button>
              )}
            </div>

            {isReplying && <div className="mt-2">Show Comment Form</div>}
          </>
        )}
      </div>
    </div>
  );
}
