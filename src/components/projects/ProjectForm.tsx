import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface ProjectFormProps {
  onSubmit: (
    data: Omit<Project, "id" | "createdAt" | "updatedAt">,
  ) => Promise<void>;
  onCancel: () => void;
  initialData?: { name: string; color: string; description?: string };
  title: string;
}

const projectSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(60, "Name must be 60 characters or less"),
  color: z.string(),
  description: z.string().optional(),
});

export function ProjectForm({
  onSubmit,
  onCancel,
  initialData,
  title,
}: ProjectFormProps) {
  const form = useForm({
    defaultValues: initialData || {
      name: "",
      color: "#ff2d78",
      description: "",
    },
    /* eslint-disable @typescript-eslint/no-deprecated */
    // @ts-expect-error - TanStack Form version mismatch
    validatorAdapter: zodValidator(),
    /* eslint-enable @typescript-eslint/no-deprecated */
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <form
        onSubmit={(e) => {
          e.stopPropagation();
          void form.handleSubmit();
        }}
        className="space-y-6 py-4"
      >
        <form.Field
          name="name"
          validators={{
            onChange: projectSchema.shape.name,
          }}
          children={(field) => (
            <div className="space-y-2">
              <label
                htmlFor={field.name}
                className="font-label text-xs uppercase tracking-wider text-on_surface_variant"
              >
                Project Name
              </label>
              <input
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
                className={cn(
                  "w-full bg-surface_variant border-b-2 border-outline/20 p-3 outline-none transition-all focus:border-primary font-headline",
                  field.state.meta.errors.length > 0 && "border-error",
                )}
                placeholder="Marketing Strategy..."
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-error">
                  {field.state.meta.errors
                    .map((err) => {
                      if (typeof err === "string") return err;
                      if (err && typeof err === "object" && "message" in err)
                        return err.message;
                      return JSON.stringify(err);
                    })
                    .join(", ")}
                </p>
              )}
            </div>
          )}
        />

        <form.Field
          name="color"
          children={(field) => (
            <div className="space-y-3">
              <label
                htmlFor="brandColor"
                className="font-label text-xs uppercase tracking-wider text-on_surface_variant"
              >
                Brand Color
              </label>
              <input type="hidden" id="brandColor" value={field.state.value} />
              <div className="flex gap-4 flex-wrap">
                {[
                  "#ff2d78",
                  "#00ffcc",
                  "#ffe04a",
                  "#8c0038",
                  "#004d4d",
                  "#665200",
                ].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      field.handleChange(c);
                    }}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 transition-transform hover:scale-110",
                      field.state.value === c
                        ? "border-on_surface scale-110"
                        : "border-transparent",
                    )}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          )}
        />

        <form.Field
          name="description"
          children={(field) => (
            <div className="space-y-2">
              <label
                htmlFor={field.name}
                className="font-label text-xs uppercase tracking-wider text-on_surface_variant"
              >
                Description (Optional)
              </label>
              <textarea
                id={field.name}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => {
                  field.handleChange(e.target.value);
                }}
                className="w-full bg-surface_variant border-b-2 border-outline/20 p-3 outline-none transition-all focus:border-secondary min-h-[100px] resize-none"
                placeholder="What is this project about?"
              />
            </div>
          )}
        />

        <DialogFooter className="pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 rounded-xl font-label text-sm uppercase tracking-widest text-on_surface_variant hover:bg-surface_variant transition-colors"
          >
            Cancel
          </button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="bg-primary text-on_primary px-8 py-2.5 rounded-xl font-headline font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(255,45,120,0.3)] hover:shadow-[0_0_25px_rgba(255,45,120,0.5)] transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Project"}
              </button>
            )}
          />
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
