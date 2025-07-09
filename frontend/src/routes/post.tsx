import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { orderSchema, sortBySchema } from "@/shared/types";
import {
  infiniteQueryOptions,
  queryOptions,
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { getComments, getPost } from "@/lib/api";
import PostCard from "@/components/PostCard";
import { useUpvotePost } from "@/lib/api-hooks";
import SortBar from "@/components/SortBar";
import { Card, CardContent } from "@/components/ui/card";
import { CommentsCard } from "@/components/CommentsCard";

const postSearchSchema = z.object({
  id: fallback(z.number(), 0).default(0),
  sortBy: fallback(sortBySchema, "points").default("points"),
  order: fallback(orderSchema, "desc").default("desc"),
});

const postQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["post", id],
    queryFn: () => getPost(id),
    staleTime: Infinity,
    retry: false,
    throwOnError: true,
  });

const commentsInfiniteQueryOptions = ({
  id,
  sortBy,
  order,
}: z.infer<typeof postSearchSchema>) =>
  infiniteQueryOptions({
    queryKey: ["comments", "post", id, sortBy, order],
    queryFn: ({ pageParam }) =>
      getComments(id, pageParam, 10, {
        sortBy,
        order,
      }),
    initialPageParam: 1,
    staleTime: Infinity,
    retry: false,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

export const Route = createFileRoute("/post")({
  component: PostComponent,
  validateSearch: zodSearchValidator(postSearchSchema),
});

function PostComponent() {
  const { id, sortBy, order } = Route.useSearch();
  const [activeReplyId, setActiveReplyId] = useState<number | null>(null);
  const { data } = useSuspenseQuery(postQueryOptions(id));
  const {
    data: comments,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useSuspenseInfiniteQuery(
    commentsInfiniteQueryOptions({ id, sortBy, order })
  );

  const upvotePost = useUpvotePost();

  return (
    <div className="mx-auto max-w-3xl">
      {data && (
        <PostCard
          post={data.data}
          onUpvote={() => upvotePost.mutate(id.toString())}
        />
      )}
      <div className="mb-4 mt-8">
        <h2 className="mb-2 text-lg font-semibold text-foreground">Comments</h2>
        {comments && comments.pages[0].data.length > 0 && (
          <SortBar sortBy={sortBy} order={order} />
        )}
      </div>

      {comments && comments.pages[0].data.length > 0 && (
        <Card>
          <CardContent className="p-4">
            {comments.pages.map((page) =>
              page.data.map((comment, index) => (
                <CommentsCard
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  activeReplyId={activeReplyId}
                  setActiveReplyId={setActiveReplyId}
                  isLast={index === page.data.length - 1}
                  toggleUpvote={() => console.log("Upvote ngab")}
                />
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
