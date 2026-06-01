import { lazy, Suspense } from "react";
import type { ComponentProps } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/Dialog";
import type { TaskForm } from "./TaskForm";

const TaskFormComponent = lazy(() =>
  import("./TaskForm").then((m) => ({ default: m.TaskForm })),
);

export function LazyTaskForm(props: ComponentProps<typeof TaskForm>) {
  return (
    <Suspense
      fallback={
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-tertiary/50 border-t-tertiary rounded-full animate-spin" />
          </div>
        </DialogContent>
      }
    >
      <TaskFormComponent {...props} />
    </Suspense>
  );
}
