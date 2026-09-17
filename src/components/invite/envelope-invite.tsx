"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Flower2, Leaf, LeafyGreen, Sparkles, Sun } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { openEnvelope } from "@/lib/redux/features/envelope-slice";
import fundoCarta from "@/app/assets/fundoCarta.jpg";
import iconeBotaoAbertura from "@/app/assets/IconeBotaoDeAberturaDoEnvelope.png";

type Stage = "closed" | "unsealing" | "opening" | "rising" | "revealed";

const STAGE_ORDER: Stage[] = [
  "closed",
  "unsealing",
  "opening",
  "rising",
  "revealed",
];

const STAGE_DELAY_MS: Record<Stage, number> = {
  closed: 900,
  unsealing: 450,
  opening: 700,
  rising: 700,
  revealed: 0,
};

export function EnvelopeInvite() {
  const [stage, setStage] = useState<Stage>("closed");
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.envelope.isOpen);

  useEffect(() => {
    const currentIndex = STAGE_ORDER.indexOf(stage);
    if (currentIndex === STAGE_ORDER.length - 1) return;

    const timer = setTimeout(() => {
      setStage(STAGE_ORDER[currentIndex + 1]);
    }, STAGE_DELAY_MS[stage]);

    return () => clearTimeout(timer);
  }, [stage]);

  useEffect(() => {
    if (stage === "revealed" && !isOpen) {
      dispatch(openEnvelope());
    }
  }, [stage, isOpen, dispatch]);

  const skipToOpen = () => {
    if (stage !== "revealed") setStage("opening");
  };

  const isSealBroken = stage !== "closed";
  const isFlapOpen =
    stage === "opening" || stage === "rising" || stage === "revealed";
  const isCardVisible = stage === "rising" || stage === "revealed";
  const isRevealed = stage === "revealed";

  const cardTransform = isRevealed
    ? "translate(-50%, -50%) scale(1)"
    : isCardVisible
      ? "translate(-50%, 10%) scale(0.9)"
      : "translate(-50%, 40%) scale(0.65)";

  return (
    <div className="relative flex min-h-dvh w-full flex-col items-center justify-center gap-8 overflow-hidden bg-gradient-to-b from-yellow-50 via-amber-50 to-yellow-100 px-4 py-8 dark:from-amber-950 dark:via-neutral-950 dark:to-black">
      <Sun className="pointer-events-none absolute left-[8%] top-[10%] size-8 text-amber-400 [animation:float_5s_ease-in-out_infinite] dark:text-amber-700" />
      <Flower2 className="pointer-events-none absolute right-[10%] top-[14%] size-7 text-yellow-500 [animation:float_6s_ease-in-out_infinite_0.5s] dark:text-yellow-700" />
      <LeafyGreen className="pointer-events-none absolute left-[12%] bottom-[10%] size-7 text-lime-600 [animation:float_7s_ease-in-out_infinite_1s] dark:text-lime-800" />
      <Leaf className="pointer-events-none absolute right-[8%] bottom-[12%] size-6 text-lime-600 [animation:float_5.5s_ease-in-out_infinite_0.3s] dark:text-lime-800" />
      <Sparkles className="pointer-events-none absolute left-[4%] top-1/2 size-5 text-amber-300 [animation:float_6.5s_ease-in-out_infinite_0.8s] dark:text-amber-700" />

      <div
        onClick={skipToOpen}
        role="button"
        aria-label="Abrir convite"
        className="relative h-[90vh] w-[90vw] cursor-pointer"
        style={{ perspective: "2000px" }}
      >
        {/* mensagem / cartão do convite */}
        <div
          className="absolute left-1/2 top-1/2 z-10 w-[92%] max-w-4xl transition-all duration-700 ease-out"
          style={{
            opacity: isCardVisible ? 1 : 0,
            transform: cardTransform,
          }}
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-yellow-300 shadow-2xl dark:border-amber-900">
            <Image
              src={fundoCarta}
              alt="Girassóis"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 92vw, 56rem"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-black/70" />

            <div className="absolute inset-0 flex items-center justify-end p-4 sm:p-10">
              <div className="w-[56%] text-right sm:w-1/2">
                <h1 className="text-lg font-semibold text-yellow-50 drop-shadow-md sm:text-3xl">
                  Você foi convidado(a)!
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-yellow-100/90 drop-shadow-md sm:text-lg">
                  Venha comemorar comigo no meu{" "}
                  <strong className="text-amber-300">Chá de Panela</strong>.
                  Sua presença vai deixar essa festa ainda mais especial!
                </p>
                <p className="mt-3 text-[10px] font-medium uppercase tracking-wide text-amber-300 drop-shadow-md sm:text-sm">
                  em breve, mais detalhes ✨
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* envelope (some por completo assim que o convite é revelado) */}
        <div
          className="absolute inset-0 transition-opacity duration-500 ease-out"
          style={{
            opacity: isRevealed ? 0 : 1,
            pointerEvents: isRevealed ? "none" : "auto",
          }}
        >
          {/* corpo do envelope */}
          <div className="absolute inset-0 z-0 rounded-b-2xl rounded-t-sm bg-yellow-200 shadow-lg dark:bg-amber-950" />

          {/* bolso frontal (triângulo inferior) */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 h-1/2 bg-yellow-300 dark:bg-amber-900"
            style={{
              clipPath: "polygon(0% 100%, 100% 100%, 100% 0%, 50% 55%, 0% 0%)",
            }}
          />

          {/* aba do envelope (triângulo superior) */}
          <div
            className="absolute inset-x-0 top-0 z-30 h-1/2 origin-top bg-yellow-400 shadow-md transition-all duration-700 ease-in dark:bg-amber-800"
            style={{
              clipPath: "polygon(0% 0%, 100% 0%, 50% 90%)",
              opacity: isFlapOpen ? 0 : 1,
              transform: isFlapOpen ? "rotateX(165deg)" : "rotateX(0deg)",
              transformStyle: "preserve-3d",
            }}
          />

          {/* selo / botão de abertura do envelope */}
          <div
            className="absolute left-1/2 top-[45%] z-40 size-20 drop-shadow-md transition-all duration-500 sm:size-28"
            style={{
              opacity: isSealBroken ? 0 : 1,
              transform: `translate(-50%, -50%) scale(${isSealBroken ? 0.5 : 1})`,
            }}
          >
            <Image
              src={iconeBotaoAbertura}
              alt="Abrir convite"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {stage === "closed" && (
        <p className="absolute bottom-6 animate-pulse text-sm text-amber-500 dark:text-amber-600">
          abrindo seu convite...
        </p>
      )}
    </div>
  );
}
