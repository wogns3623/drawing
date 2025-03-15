"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { useCallback, useMemo } from "react";
import { v4 } from "uuid";
import { createBrowserClient } from "@supabase/ssr";

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const getUuid = () => {
  let uuid = localStorage.getItem("uuid");

  if (!uuid) {
    uuid = v4();
    localStorage.setItem("uuid", uuid);
  }

  return uuid;
};

type DrawingRemains = {
  id: number;
  prize: number;
  uuid: string | null;
};

export default function Vote() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: my_drawing_exist, isLoading: isLoading1 } = useQuery({
    queryKey: ["my_drawing_exist"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drawing_remains")
        .select("*")
        .eq("uuid", getUuid());

      if (error) throw error;
      if (!data || data.length === 0) return null;
      return data[0] as DrawingRemains;
    },
  });

  const { data: drawing_remains, isLoading: isLoading2 } = useQuery({
    queryKey: ["drawing_remains"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drawing_remains")
        .select("*");

      if (error) throw error;
      return data as DrawingRemains[];
    },
  });

  if (isLoading1 || isLoading2) {
    return <Loader2Icon className="animate-spin w-8 h-8 text-[#000]" />;
  } else if (!drawing_remains) {
    return <div>오류!</div>;
  }

  return (
    <div className="flex flex-col space-y-8">
      <section className="flex flex-col space-y-2">
        <p className="text-4xl">전광판</p>

        <div className="flex flex-col space-y-2 text-2xl">
          <span>{`1등: ${
            drawing_remains.filter((d) => d.prize === 1).length
          }`}</span>
          <span>{`2등: ${
            drawing_remains.filter((d) => d.prize === 2).length
          }`}</span>
          <span>{`3등: ${
            drawing_remains.filter((d) => d.prize === 3).length
          }`}</span>
        </div>
      </section>

      <section className="flex justify-center items-center space-x-4">
        {drawing_remains.length === 0 ? (
          <div>뽑기 끝</div>
        ) : my_drawing_exist ? (
          <div>
            <p>{`${my_drawing_exist.prize}등입니다!`}</p>
          </div>
        ) : (
          <div>
            <VoteButton drawing_remains={drawing_remains} />
          </div>
        )}
      </section>
    </div>
  );
}

function VoteButton({
  drawing_remains,
}: {
  drawing_remains: DrawingRemains[];
}) {
  const queryClient = useQueryClient();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const drawing_no_selected = useMemo(() => {
    return drawing_remains.filter((d) => d.uuid === null);
  }, [drawing_remains]);

  const draw_result = useCallback(() => {
    return drawing_no_selected[getRandomInt(0, drawing_no_selected.length - 1)];
  }, [drawing_no_selected]);

  const register = useCallback(
    async (id: number) => {
      const result = await supabase
        .from("drawing_remains")
        .update({ uuid: getUuid() })
        .eq("id", id);

      console.log(result);
      queryClient.invalidateQueries({ queryKey: ["my_drawing_exist"] });
    },
    [supabase, queryClient]
  );

  return (
    <button
      onClick={() => {
        const { id, prize } = draw_result();
        alert(`${id} ${prize}`);
        register(id);
      }}
      className="px-4 py-2 bg-[#f0f0f0] rounded-md text-black"
    >
      뽑기
    </button>
  );
}
