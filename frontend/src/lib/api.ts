import { hc, InferResponseType } from "hono/client";
import type { ApiRoutes, SuccessResponse } from "@/shared/types";

const client = hc<ApiRoutes>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
}).api;

// 4:59:25

const signUp = client.auth["sign-up"].$post;
type Test = InferResponseType<typeof signUp>;

export const postSignup = async (username: string, password: string) => {
  try {
    const response = await client.auth["sign-up"].$post({
      form: {
        username,
        password,
      },
    });

    if (response.ok) {
      const data = (await response.json()) as SuccessResponse;
    }
  } catch (error) {}
};
