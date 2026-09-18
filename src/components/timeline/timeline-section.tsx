"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import girassolTimeline from "@/app/assets/GirassolParaLinhaDoTempo.png";
import iconeGirassol from "@/app/assets/IconeBotaoDeAberturaDoEnvelope.png";

gsap.registerPlugin(ScrollTrigger);

const ROW_UNIT = 240;
const LANE_WIDTH = 80;
const LANE_LEFT_X = 24;
const LANE_RIGHT_X = 56;

const NAMORO_START = new Date(2022, 0, 4);

function formatTimeTogether(from: Date, to: Date) {
  let years = to.getFullYear() - from.getFullYear();
  let months = to.getMonth() - from.getMonth();
  if (to.getDate() < from.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const yearsLabel = years > 0 ? `${years} ${years === 1 ? "ano" : "anos"}` : "";
  const monthsLabel =
    months > 0 ? `${months} ${months === 1 ? "mês" : "meses"}` : "";

  if (yearsLabel && monthsLabel) return `${yearsLabel} e ${monthsLabel} juntos`;
  if (yearsLabel) return `${yearsLabel} juntos`;
  if (monthsLabel) return `${monthsLabel} juntos`;
  return "recém-começando";
}

type Milestone = {
  label: string;
  date: string;
  side: "left" | "right";
  isDynamic?: boolean;
};

export function TimelineSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const flowerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const today = formatTimeTogether(NAMORO_START, new Date());

  const milestones: Milestone[] = useMemo(
    () => [
      { label: "Nos conhecemos", date: "Junho de 2019", side: "left" },
      { label: "Início do namoro", date: "04 de janeiro de 2022", side: "right" },
      { label: "Início do noivado", date: "13 de junho de 2026", side: "left" },
      { label: "Hoje", date: today, side: "right", isDynamic: true },
    ],
    [today],
  );

  const pathD = useMemo(() => {
    const points = milestones.map((_, i) => ({
      x: i % 2 === 0 ? LANE_RIGHT_X : LANE_LEFT_X,
      y: i * ROW_UNIT + ROW_UNIT / 2,
    }));
    const start = { x: LANE_WIDTH / 2, y: 0 };
    const all = [start, ...points];

    let d = `M${all[0].x},${all[0].y}`;
    for (let i = 1; i < all.length; i++) {
      const prev = all[i - 1];
      const curr = all[i];
      const midY = (prev.y + curr.y) / 2;
      d += ` C${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`;
    }
    return d;
  }, [milestones]);

  const totalHeight = milestones.length * ROW_UNIT;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        flowerRef.current,
        { opacity: 0, scale: 0.8, y: 20 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: flowerRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );

      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });
      }

      cardRefs.current.forEach((card, i) => {
        if (!card) return;
        const fromX = milestones[i].side === "left" ? -40 : 40;
        gsap.fromTo(
          card,
          { opacity: 0, x: fromX },
          {
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 82%",
              once: true,
            },
          },
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [milestones]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-gradient-to-b from-amber-50 via-yellow-50 to-amber-100 px-6 py-20 dark:from-neutral-950 dark:via-neutral-900 dark:to-black sm:py-28"
    >
      <div
        ref={flowerRef}
        className="relative mx-auto mb-4 aspect-[1537/1023] w-56 sm:w-72"
      >
        <Image
          src={girassolTimeline}
          alt="Girassol"
          fill
          className="object-contain drop-shadow-xl"
          sizes="288px"
        />
      </div>

      <div className="relative mx-auto max-w-2xl">
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: LANE_WIDTH, height: totalHeight }}
        >
          <svg
            viewBox={`0 0 ${LANE_WIDTH} ${totalHeight}`}
            width={LANE_WIDTH}
            height={totalHeight}
            preserveAspectRatio="none"
            className="h-full w-full overflow-visible"
          >
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              strokeLinecap="round"
              className="text-amber-600 dark:text-amber-500"
            />
          </svg>
        </div>

        <div className="relative flex flex-col">
          {milestones.map((milestone, i) => (
            <div
              key={milestone.label}
              className="grid grid-cols-[1fr_5rem_1fr] items-center"
              style={{ height: ROW_UNIT }}
            >
              <div className="pr-6 text-right">
                {milestone.side === "left" && (
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                  >
                    <p
                      className="font-heading text-lg italic text-amber-900 dark:text-amber-100 sm:text-2xl"
                      suppressHydrationWarning={milestone.isDynamic}
                    >
                      {milestone.date}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 sm:text-sm">
                      {milestone.label}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                <div className="relative size-9 sm:size-11">
                  <Image
                    src={iconeGirassol}
                    alt=""
                    fill
                    className="object-contain drop-shadow-md"
                  />
                </div>
              </div>

              <div className="pl-6 text-left">
                {milestone.side === "right" && (
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                  >
                    <p
                      className="font-heading text-lg italic text-amber-900 dark:text-amber-100 sm:text-2xl"
                      suppressHydrationWarning={milestone.isDynamic}
                    >
                      {milestone.date}
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400 sm:text-sm">
                      {milestone.label}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
