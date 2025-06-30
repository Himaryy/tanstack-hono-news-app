import type { ApiRoutes, ErrorResponse, SuccessResponse } from "@/shared/types";
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
