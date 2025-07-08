import * as React from "react";
import {
  createFileRoute,
  useBlocker,
  useNavigate,
  useRouter,
} from "@tanstack/react-router";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { createPostSchema } from "@/shared/types";
import { postSubmit } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_auth/submit")({
  component: SubmitComponent,
});

function SubmitComponent() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const navigate = useNavigate();
  const form = useForm({
    defaultValues: {
      title: "",
      url: "",
      content: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: createPostSchema,
    },
    onSubmit: async ({ value }) => {
      const response = await postSubmit(value.title, value.url, value.content);

      if (response.success) {
        await queryClient.invalidateQueries({ queryKey: ["posts"] });
        router.invalidate();

        await navigate({ to: "/post", search: { id: response.data.postId } });
        return;
      } else {
        if (!response.isFormError) {
          toast.error("Failed to create post", {
            description: response.error,
            richColors: true,
            style: { backgroundColor: "#dc2626", color: "white" },
          });
        }
        form.setErrorMap({
          onSubmit: response.isFormError
            ? response.error
            : "Unexpected Error Occured ",
        });
      }
    },
  });

  // const shouldBlock = form.useStore(
  //   (state) => state.isDirty && !state.isSubmitting
  // );
  useBlocker({
    shouldBlockFn: () => window.confirm("Are you sure want to leave ?"),
  });

  return (
    <div className="w-full">
      <Card className="mx-auto mt-12 max-w-lg border-border/25">
        <CardHeader>
          <CardTitle>Create New Post</CardTitle>
          <CardDescription>
            Leave url blank to submit a question for discussion. if there is no
            url, text will appear at the top of the thread. if there is a url,
            text is optional.
          </CardDescription>
        </CardHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="grid gap-4"
        >
          <CardContent>
            <div className="grid gap-4">
              <form.Field
                name="title"
                // eslint-disable-next-line react/no-children-prop
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Title</Label>
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
                name="url"
                // eslint-disable-next-line react/no-children-prop
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Url</Label>
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
                name="content"
                // eslint-disable-next-line react/no-children-prop
                children={(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Content</Label>
                    <Textarea
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

              <form.Subscribe
                selector={(state) => [state.errorMap]}
                // eslint-disable-next-line react/no-children-prop
                children={([errorMap]) =>
                  errorMap.onSubmit ? (
                    <p className="text-[0.8rem] font-medium text-destructive">
                      {errorMap.onSubmit.toString()}
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
                    {isSubmitting ? "Submitting..." : "Submit"}
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
