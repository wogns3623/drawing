import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import Vote from "./_components/Vote";
// import { createServerSideClient } from "@/utils/supabase";

export default async function Home() {
  // const supabase = await createServerSideClient();

  const queryClient = new QueryClient();

  // await queryClient.prefetchQuery({
  //   queryKey: ["drawing_remain_ids"],
  //   queryFn: async () => {
  //     const result = await supabase.from("drawing_remains").select();

  //     console.log(result);
  //     const { data, error } = await supabase
  //       .from("drawing_remains")
  //       .select("id")
  //       .is("uuid", null);

  //     if (error) throw error;
  //     console.log(data);
  //     return data.map((d) => d.id) as number[];
  //   },
  // });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <main className="h-screen flex items-center justify-center">
        <Vote />
      </main>
    </HydrationBoundary>
  );
}
