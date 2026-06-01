import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import type { ProjectForm } from "./ProjectForm";

const ProjectFormComponent = lazy(() =>
  import("./ProjectForm").then((m) => ({ default: m.ProjectForm })),
);

export function LazyProjectForm(props: ComponentProps<typeof ProjectForm>) {
  return (
    <Suspense
      fallback={
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary/50 border-t-primary rounded-full animate-spin" />
          </div>
        </DialogContent>
      }
    >
      <ProjectFormComponent {...props} />
    </Suspense>
  );
}
