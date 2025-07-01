import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { orderSchema, sortBySchema } from "@/shared/types";
import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { getPosts } from "@/lib/api";
import SortBar from "@/components/SortBar";
import PostCard from "@/components/PostCard";
import { Button } from "@/components/ui/button";

const homeSearchSchema = z.object({
  sortBy: fallback(sortBySchema, "points").default("recent"),
  order: fallback(orderSchema, "desc").default("desc"),
  author: z.optional(fallback(z.string(), "")),
  site: z.optional(fallback(z.string(), "")),
});

const postsInfiniteQueryOptions = ({
  sortBy,
  order,
  author,
  site,
}: z.infer<typeof homeSearchSchema>) =>
  infiniteQueryOptions({
    queryKey: ["posts", sortBy, order, author, site],
    queryFn: ({ pageParam }) =>
      getPosts({
        pageParam,
        pagination: {
          sortBy,
          order,
          author,
          site,
        },
      }),
    initialPageParam: 1,
    staleTime: Infinity,
    getNextPageParam: (lastPage, allPages, lastPageParam) => {
      if (lastPage.pagination.totalPages <= lastPageParam) {
        return undefined;
      }
      return lastPageParam + 1;
    },
  });

export const Route = createFileRoute("/")({
  component: HomeComponent,
  validateSearch: zodSearchValidator(homeSearchSchema),
});

function HomeComponent() {
  const { sortBy, order, author, site } = Route.useSearch();
  const { data, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useSuspenseInfiniteQuery(
      postsInfiniteQueryOptions({
        sortBy,
        order,
        author,
        site,
      })
    );
  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-6 text-2xl font-bold text-foreground">Submissions</h1>
      <SortBar sortBy={sortBy} order={order} />

      <div className="space-y-4">
        {data?.pages.map((page) =>
          page.data.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
      <div className="mt-6">
        <Button
          onClick={() => fetchNextPage()}
          disabled={!hasNextPage || isFetchingNextPage}
        >
          {isFetchingNextPage
            ? "Loading More..."
            : hasNextPage
              ? "Load More"
              : "Nothing More"}
        </Button>
      </div>
    </div>
  );
}
