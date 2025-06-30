import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { fallback, zodSearchValidator } from "@tanstack/router-zod-adapter";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { loginSchema } from "@/shared/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import FieldInfo from "@/components/FieldInfo";
import { Button } from "@/components/ui/button";
import { postSignup } from "@/lib/api";
import { toast } from "sonner";

const signUpSearchSchema = z.object({
  redirect: fallback(z.string(), "/").default("/"),
});

export const Route = createFileRoute("/signup")({
  component: SignUp,
  validateSearch: zodSearchValidator(signUpSearchSchema),
});

function SignUp() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      const response = await postSignup(value.username, value.password);
      if (response.success) {
        await navigate({
          to: search.redirect,
        });
        return null;
      } else {
        if (!response.isFormError) {
          toast.error("Sign Up Failed", {
            description: response.error,
          });
        }
        form.setErrorMap({
          onSubmit: response.isFormError
            ? response.error
            : "An error occurred during sign up",
        });
      }
    },
  });

  return (
    <div className="w-full">
      <Card className="mx-auto mt-12 max-w-sm border/25">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <CardHeader>
            <CardTitle className="text-center text-2xl">Sign Up</CardTitle>
            <CardDescription>
              Enter your details below to create an account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4">
              <form.Field
                name="username"
                // eslint-disable-next-line react/no-children-prop
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Username</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldInfo field={field} />
                  </div>
                )}
              />

              <form.Field
                name="password"
                // eslint-disable-next-line react/no-children-prop
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Password</Label>
                    <Input
                      type="password"
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />

                    <FieldInfo field={field} />
                  </div>
                )}
              />

              {/* Give error from backend if username already taken */}
              <form.Subscribe
                selector={(state) => [state.errorMap]}
                // eslint-disable-next-line react/no-children-prop
                children={([errorMap]) =>
                  errorMap.onSubmit ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errorMap.onSubmit?.toString()}
                    </p>
                  ) : null
                }
              />

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                // eslint-disable-next-line react/no-children-prop
                children={([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full"
                  >
                    {isSubmitting ? "Signin Up..." : "Sign Up"}
                  </Button>
                )}
              />
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
