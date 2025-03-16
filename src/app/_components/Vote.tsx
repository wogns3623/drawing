"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { v4 } from "uuid";
import { drawItem as drawItemAction, getDraws, getMyDrawing } from "../actions";
import { Slot, SlotItem } from "./Slot";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const getClientUid = () => {
  let uuid = localStorage.getItem("uuid");

  if (!uuid) {
    uuid = v4();
    localStorage.setItem("uuid", uuid);
  }

  return uuid;
};

const setClientUid = (client_uid: string) => {
  localStorage.setItem("uuid", client_uid);
};

export default function Vote() {
  const { data: draws, isLoading: isDrawsLoading } = useQuery({
    queryKey: ["draws"],
    queryFn: getDraws,
  });

  if (isDrawsLoading) {
    return <Loader2Icon className="animate-spin w-8 h-8 text-[#000]" />;
  } else if (!draws) {
    return <div>오류!</div>;
  }

  return (
    <div className="grid grid-rows-3 gap-y-8 p-12 w-full">
      <section className="flex flex-col items-center space-y-2">
        <p className="text-4xl">뽑기 현황</p>

        <div className="flex flex-col space-y-2 text-xl ">
          <div>
            <p>{`1등: ${draws.filter((d) => d.ranking === 1)[0].prize}`}</p>
            <p>{`${
              draws.filter((d) => d.client_uid === null && d.ranking === 1)
                .length
            }명 남음`}</p>
          </div>

          <div>
            <p>{`2등: ${draws.filter((d) => d.ranking === 2)[0].prize}`}</p>
            <p>{`${
              draws.filter((d) => d.client_uid === null && d.ranking === 2)
                .length
            }명 남음`}</p>
          </div>

          <div>
            <p>{`3등: ${draws.filter((d) => d.ranking === 3)[0].prize}`}</p>
            <p>{`${
              draws.filter((d) => d.client_uid === null && d.ranking === 3)
                .length
            }명 남음`}</p>
          </div>
        </div>
      </section>

      <section className="flex justify-center items-center w-full">
        {draws.length === 0 ? <div>남은 뽑기가 없어요 😢</div> : <VoteButton />}
      </section>
    </div>
  );
}

const rankings = ["1등", "2등", "3등"];

const drawFormSchema = z.object({
  studentNumber: z
    .string({ required_error: "학번을 입력해주세요" })
    .regex(/\d{10}/, {
      message: "학번은 10자리 숫자여야 합니다",
    }),
});

function VoteButton() {
  const queryClient = useQueryClient();
  const [animationEnd, setAnimationEnd] = useState(true);

  const myDrawing = useQuery({
    queryKey: ["myDrawing"],
    queryFn: () => getMyDrawing(getClientUid()),
  });

  const drawItem = useMutation({
    mutationFn: async (studentNumber: string) => {
      const result = await drawItemAction(getClientUid(), studentNumber);
      if (result && result.client_uid) setClientUid(result.client_uid);

      return result;
    },
  });

  const drawForm = useForm<z.infer<typeof drawFormSchema>>({
    resolver: zodResolver(drawFormSchema),
  });

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof drawFormSchema>) => {
    if (drawItem.data || drawItem.isPending) return;
    setAnimationEnd(false);

    await drawItem.mutateAsync(values.studentNumber);
  };

  const drawItemData = drawItem.data || myDrawing.data;

  return (
    <div className="flex flex-col justify-center items-center space-y-4 w-full">
      <section className="flex justify-center items-center space-x-4 w-64">
        <Slot
          duration={myDrawing.data ? 1000 : 3000}
          target={drawItemData ? drawItemData.ranking : null}
          times={10}
          onEnd={() => {
            setAnimationEnd(true);
            queryClient.invalidateQueries({ queryKey: ["draws"] });
            queryClient.invalidateQueries({ queryKey: ["myDrawing"] });
          }}
          className="h-20 bg-primary text-primary-foreground rounded-md w-16"
        >
          <div className={"py-4" + (drawItemData ? "" : " animate-slot-spin")}>
            <SlotItem
              key={-1}
              className="text-2xl py-1 flex justify-center items-center"
            >
              {rankings.at(-1)}
            </SlotItem>
            {rankings.map((ranking, i) => (
              <SlotItem
                key={i}
                className="text-2xl py-1 flex justify-center items-center"
              >
                {ranking}
              </SlotItem>
            ))}
            <SlotItem
              key={rankings.length}
              className="text-2xl py-1 flex justify-center items-center"
            >
              {rankings[0]}
            </SlotItem>
          </div>
        </Slot>
        {animationEnd && myDrawing.data && (
          <div className="flex-1 flex flex-col space-y-2">
            <p className="text-3xl">{`🎉 ${myDrawing.data.ranking}등입니다!`}</p>

            <p className="text-2xl text-wrap">{`상품: ${myDrawing.data.prize}`}</p>
          </div>
        )}
      </section>

      <section className="h-24 flex justify-center items-start space-x-2">
        {animationEnd && myDrawing.data ? (
          myDrawing.data.member ? (
            <p className="text-2xl">{`🎉 ${myDrawing.data.member.name}님 축하합니다!`}</p>
          ) : (
            <a
              key="a"
              href={`https://docs.google.com/forms/d/e/1FAIpQLSf90epHRDdLhx85a9vZOqB3JkkHKKgDr9SIj5D_ukdVJ5vMgw/viewform?usp=pp_url&entry.898537491=${myDrawing.data.id}`}
              className="mb-0"
            >
              <Button variant="default">입부하러 가기</Button>
            </a>
          )
        ) : !drawItem.data && !drawItem.isPending ? (
          <Form {...drawForm}>
            <form onSubmit={(e) => e.preventDefault()}>
              <FormField
                control={drawForm.control}
                name="studentNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="학번을 입력해주세요"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>

            <Button
              key="d"
              onClick={drawForm.handleSubmit(onSubmit)}
              variant="default"
            >
              뽑기
            </Button>
          </Form>
        ) : null}
      </section>
    </div>
  );
}
