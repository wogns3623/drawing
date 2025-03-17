"use client";

import { useQuery } from "@tanstack/react-query";
import QRCode from "react-qr-code";
import { getDraws } from "../actions";
import { Loader2Icon } from "lucide-react";

export default function QRPage() {
  const { data: draws, isLoading: isDrawsLoading } = useQuery({
    queryKey: ["draws"],
    queryFn: getDraws,
    refetchInterval: 5000,
  });

  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-2">
      <section className="flex flex-col items-center space-y-2">
        <p className="text-4xl">뽑기 현황</p>

        {isDrawsLoading || !draws ? (
          <Loader2Icon className="animate-spin" />
        ) : (
          <div className="flex flex-col space-y-2 text-xl ">
            <div>
              <p>{`1등: ${draws.filter((d) => d.ranking === 1)[0].prize}`}</p>
              <p>{`${
                draws.filter((d) => d.clientUid === null && d.ranking === 1)
                  .length
              }명 남음`}</p>
            </div>

            <div>
              <p>{`2등: ${draws.filter((d) => d.ranking === 2)[0].prize}`}</p>
              <p>{`${
                draws.filter((d) => d.clientUid === null && d.ranking === 2)
                  .length
              }명 남음`}</p>
            </div>

            <div>
              <p>{`3등: ${draws.filter((d) => d.ranking === 3)[0].prize}`}</p>
              <p>{`${
                draws.filter((d) => d.clientUid === null && d.ranking === 3)
                  .length
              }명 남음`}</p>
            </div>
          </div>
        )}
      </section>

      <h1 className="text-4xl">뽑기하러 가기</h1>

      <QRCode size={512} value="https://drawing-rho.vercel.app/" />
    </div>
  );
}
