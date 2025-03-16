import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Vote from "./_components/Vote";

export default async function Home() {
  const queryClient = new QueryClient();

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="h-screen flex items-center justify-center">
        <Vote />
      </main>
    </HydrationBoundary>
  );
}
