import { getCommentComments, userQueryOption } from "@/lib/api";
import { cn, relativeTime } from "@/lib/utils";
import { Comment } from "@/shared/types";
import {
  useQuery,
  useQueryClient,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import {
  ChevronDownIcon,
  ChevronUp,
  MessageSquare,
  MinusIcon,
  PlusIcon,
} from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { Separator } from "./ui/separator";
import { useUpvoteComment } from "@/lib/api-hooks";

type CommentCardProps = {
  comment: Comment;
  depth: number;
  activeReplyId: number | null;
  setActiveReplyId: Dispatch<SetStateAction<number | null>>;
  isLast: boolean;
  toggleUpvote: ReturnType<typeof useUpvoteComment>["mutate"];
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

  const queryClient = useQueryClient();
  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery({
    queryKey: ["comments", "comment", comment.id],
    queryFn: ({ pageParam }) => getCommentComments(comment.id, pageParam),
    initialPageParam: 1,
    staleTime: Infinity,
    initialData: {
      pageParams: [1],
      pages: [
        {
          success: true,
          message: "Comment Fetched",
          data: comment.childComments ?? [],
          pagination: {
            page: 1,
            totalPages: Math.ceil(comment.commentCount / 2),
          },
        },
      ],
    },
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

  const loadFirstPage =
    comments?.pages[0].data?.length === 0 && comment.commentCount > 0;

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
            onClick={() =>
              toggleUpvote({
                id: comment.id.toString(),
                postId: comment.postId,
                parentCommentId: comment.parentCommentId,
              })
            }
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

      {!isCollapsed &&
        comments &&
        comments.pages.map((page, index) => {
          const isLastPage = index === comments.pages.length - 1;
          return page.data.map((reply, index) => (
            <CommentsCard
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              activeReplyId={activeReplyId}
              setActiveReplyId={setActiveReplyId}
              isLast={isLastPage && index === page.data.length - 1}
              toggleUpvote={toggleUpvote}
            />
          ));
        })}

      {!isCollapsed && (hasNextPage || loadFirstPage) && (
        <div className="mt-2">
          <button
            className="flex items-center text-xs space-x-1 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (loadFirstPage) {
                queryClient.invalidateQueries({
                  queryKey: ["comments", "comment", comment.id],
                });
              } else {
                fetchNextPage();
              }
            }}
            disabled={!(hasNextPage || loadFirstPage || isFetchingNextPage)}
          >
            {isFetchingNextPage ? (
              <span>Loading more...</span>
            ) : (
              <>
                <ChevronDownIcon size={12} />
                <span>More Replies</span>
              </>
            )}
          </button>
        </div>
      )}

      {!isLast && <Separator className="my-2" />}
    </div>
  );
}
