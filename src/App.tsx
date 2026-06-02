import { RouterProvider, createRouter } from "@tanstack/react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { MigrationBanner } from "@/components/ui/MigrationBanner";
import { queryClient } from "@/lib/queryClient";
import { useMigration } from "@/hooks/useMigration";

const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const migration = useMigration();

  return (
    <ErrorBoundary>
      <MigrationBanner status={migration.status} error={migration.error} />
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
