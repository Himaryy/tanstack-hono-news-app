import type {
  ApiRoutes,
  ErrorResponse,
  Order,
  SortBy,
  SuccessResponse,
} from "@/shared/types";
import { queryOptions } from "@tanstack/react-query";
import { hc, InferResponseType } from "hono/client";
import { notFound } from "@tanstack/react-router";

const client = hc<ApiRoutes>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
}).api;

export const postSignup = async (username: string, password: string) => {
  try {
    const response = await client.auth.signup.$post({
      form: {
        username,
        password,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as SuccessResponse;
      return data;
    }

    const data = (await response.json()) as unknown as ErrorResponse;
    return data;
  } catch (error) {
    return {
      success: false as const,
      error: String(error),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const postLogin = async (username: string, password: string) => {
  try {
    const response = await client.auth.login.$post({
      form: {
        username,
        password,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as SuccessResponse;
      return data;
    }

    const data = (await response.json()) as unknown as ErrorResponse;
    return data;
  } catch (error) {
    return {
      success: false as const,
      error: String(error),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const getUser = async () => {
  const result = await client.auth.user.$get();
  if (result.ok) {
    const data = await result.json();
    return data;
  }
  return null;
};

export type GetPostsSuccess = InferResponseType<typeof client.posts.$get>;

export const getPosts = async ({
  pageParam = 1,
  pagination,
}: {
  pageParam: number;
  pagination: {
    sortBy?: SortBy;
    order?: Order;
    author?: string;
    site?: string;
  };
}) => {
  const response = await client.posts.$get({
    query: {
      page: pageParam.toString(),
      sortBy: pagination.sortBy,
      order: pagination.order,
      author: pagination.author,
      site: pagination.site,
    },
  });

  if (!response.ok) {
    const data = (await response.json()) as unknown as ErrorResponse;
    throw new Error(data.error);
  }

  const data = await response.json();
  return data;
};

export const userQueryOption = () =>
  queryOptions({
    queryKey: ["user"],
    queryFn: getUser,
    staleTime: Infinity,
  });

export async function upvotePost(id: string) {
  const response = await client.posts[":id"].upvote.$post({
    param: {
      id,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  }

  const data = (await response.json()) as unknown as ErrorResponse;
  throw new Error(data.error);
}

export const postSubmit = async (
  title: string,
  url: string,
  content: string
) => {
  try {
    const response = await client.posts.$post({
      form: {
        title,
        url,
        content,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data;
    }

    const data = (await response.json()) as unknown as ErrorResponse;
    return data;
  } catch (error) {
    return {
      success: false,
      error: String(error),
      isFormError: false,
    } as ErrorResponse;
  }
};

export const getPost = async (id: number) => {
  const response = await client.posts[":id"].$get({
    param: {
      id: id.toString(),
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    if (response.status === 404) {
      throw notFound();
    }

    const data = (await response.json()) as unknown as ErrorResponse;
    throw new Error(data.error);
  }
};

export async function getComments(
  id: number,
  page: number = 1,
  limit: number = 10,
  pagination: {
    sortBy?: SortBy;
    order?: Order;
  }
) {
  const response = await client.posts[":id"].comments.$get({
    param: {
      id: id.toString(),
    },
    query: {
      page: page.toString(),
      limit: limit.toString(),
      includeChildren: "true",
      sortBy: pagination.sortBy,
      order: pagination.order,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const data = (await response.json()) as unknown as ErrorResponse;
    throw new Error(data.error);
  }
}

export async function getCommentComments(
  id: number,
  page: number = 1,
  limit: number = 2
) {
  const response = await client.comments[":id"].comments.$get({
    param: {
      id: id.toString(),
    },
    query: {
      page: page.toString(),
      limit: limit.toString(),
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const data = (await response.json()) as unknown as ErrorResponse;
    throw new Error(data.error);
  }
}

export async function upvoteComments(id: string) {
  const response = await client.comments[":id"].upvote.$post({
    param: {
      id,
    },
  });

  if (response.ok) {
    return await response.json();
  }

  const data = (await response.json()) as unknown as ErrorResponse;
  throw Error(data.error);
}
