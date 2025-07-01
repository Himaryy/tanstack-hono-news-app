import type {
  ApiRoutes,
  ErrorResponse,
  Order,
  SortBy,
  SuccessResponse,
} from "@/shared/types";
import { queryOptions } from "@tanstack/react-query";
import { hc } from "hono/client";

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
