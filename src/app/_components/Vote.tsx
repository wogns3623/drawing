"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2Icon } from "lucide-react";
import { v4 } from "uuid";
import {
  drawItem as drawItemAction,
  getDraws,
  getMyDrawing,
  registerStudentNumber as registerStudentNumberAction,
} from "../actions";
import { Slot, SlotItem } from "./Slot";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const getUuid = () => {
  let uuid = localStorage.getItem("uuid");

  if (!uuid) {
    uuid = v4();
    localStorage.setItem("uuid", uuid);
  }

  return uuid;
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

function VoteButton() {
  const queryClient = useQueryClient();
  const [animationEnd, setAnimationEnd] = useState(true);
  const [showPhoneInput, setShowPhoneInput] = useState(false);

  const myDrawing = useQuery({
    queryKey: ["myDrawing"],
    queryFn: () => getMyDrawing(getUuid()),
  });

  const drawItem = useMutation({
    mutationFn: async () => {
      const result = await drawItemAction(getUuid());
      return result;
    },
  });

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

      {animationEnd && myDrawing.data ? (
        <div className="flex flex-col items-center space-y-2">
          {showPhoneInput ? (
            <StudentNumberInput />
          ) : (
            <section className="flex justify-center items-center space-x-2">
              <a
                href={`https://docs.google.com/forms/d/e/1FAIpQLSf90epHRDdLhx85a9vZOqB3JkkHKKgDr9SIj5D_ukdVJ5vMgw/viewform?usp=pp_url&entry.898537491=${myDrawing.data.id}`}
                className="mb-0"
              >
                <Button variant="default">입부하러 가기</Button>
              </a>

              <Button
                variant="secondary"
                onClick={() => {
                  setShowPhoneInput(true);
                }}
              >
                이미 회원이신가요?
              </Button>
            </section>
          )}
        </div>
      ) : (
        <Button
          onClick={async () => {
            if (drawItem.isPending) return;
            setAnimationEnd(false);

            await drawItem.mutateAsync();
          }}
          variant="default"
          size="lg"
          className="w-16"
        >
          뽑기
        </Button>
      )}
    </div>
  );
}

const StudentNumberInput = () => {
  const [studentNumber, setStudentNumber] = useState("");
  const registerStudentNumber = useMutation({
    mutationFn: async () => {
      const result = await registerStudentNumberAction(
        getUuid(),
        studentNumber
      );
      return result;
    },
  });

  return (
    <div className="flex items-center justify-center space-x-2">
      <Input
        type="text"
        value={studentNumber}
        onChange={(e) => setStudentNumber(e.target.value)}
        placeholder="학번을 입력해주세요"
      />

      <Button
        onClick={async () => {
          if (registerStudentNumber.isPending) return;

          await registerStudentNumber.mutateAsync();
        }}
        variant="default"
      >
        등록하기
      </Button>
    </div>
  );
};
