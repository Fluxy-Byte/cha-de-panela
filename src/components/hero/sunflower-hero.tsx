"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { Button } from "@/components/ui/button";
import campoGirassois from "@/app/assets/GirassolParaCapa.png";

gsap.registerPlugin(SplitText);

export function SunflowerHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const kickerRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageWrapRef.current,
        { scale: 1.15 },
        { scale: 1, duration: 14, ease: "power1.out" },
      );

      const split = new SplitText(titleRef.current, {
        type: "words,chars",
        wordsClass: "split-word",
        charsClass: "split-char",
      });

      gsap.set(titleRef.current, { visibility: "visible" });
      gsap.set(split.chars, { opacity: 0, yPercent: 120, rotate: 6 });

      gsap
        .timeline({ delay: 0.3 })
        .to(kickerRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        })
        .to(
          split.chars,
          {
            opacity: 1,
            yPercent: 0,
            rotate: 0,
            duration: 0.9,
            stagger: 0.02,
            ease: "back.out(1.7)",
          },
          "-=0.2",
        )
        .to(
          subRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.4",
        )
        .to(
          ctaRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" },
          "-=0.3",
        );

      return () => split.revert();
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-dvh w-full items-center justify-end overflow-hidden bg-black"
    >
      <div ref={imageWrapRef} className="absolute inset-0">
        <Image
          src={campoGirassois}
          alt="Campo de girassóis ao entardecer"
          fill
          priority
          className="object-cover object-center saturate-[1.15] brightness-105"
          sizes="100vw"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-end gap-4 px-6 text-right sm:px-16">
        <p
          ref={kickerRef}
          className="translate-y-3 text-xl font-medium uppercase tracking-[0.3em] text-amber-200 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:text-2xl"
        >
          Chá de Panela
        </p>
        <h1
          ref={titleRef}
          className="invisible font-heading text-4xl italic leading-[1.05] text-yellow-50 drop-shadow-[0_4px_16px_rgba(0,0,0,0.65)] sm:text-6xl md:text-7xl"
        >
          Logo, logo, uma nova festa floresce
        </h1>
        <p
          ref={subRef}
          className="max-w-lg translate-y-3 text-base text-yellow-100/80 opacity-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] sm:text-lg"
        >
          Em breve chega o convite oficial do nosso Chá de Panela. Fique de
          olho.
        </p>
        <Button
          ref={ctaRef}
          size="lg"
          className="mt-2 h-auto translate-y-3 rounded-full bg-amber-400 px-6 py-3 text-base font-semibold text-amber-950 opacity-0 shadow-lg hover:bg-amber-300"
        >
          Quero confirmar minha presença
        </Button>
      </div>
    </div>
  );
}
