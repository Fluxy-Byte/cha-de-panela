"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import iconeGirassol from "@/app/assets/IconeBotaoDeAberturaDoEnvelope.png";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const nameARef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<HTMLImageElement>(null);
  const nameBRef = useRef<HTMLSpanElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const threshold = () => window.innerHeight - 96;
    const onScroll = () => setIsScrolled(window.scrollY > threshold());
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([nameARef.current, iconRef.current, nameBRef.current], {
        opacity: 0,
        y: -16,
      });

      gsap
        .timeline({ delay: 0.2 })
        .to(nameARef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        })
        .to(
          iconRef.current,
          {
            opacity: 1,
            y: 0,
            rotate: 360,
            duration: 0.8,
            ease: "back.out(1.7)",
          },
          "-=0.5",
        )
        .to(
          nameBRef.current,
          { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" },
          "-=0.5",
        );
    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-transparent px-6 py-5 sm:gap-5 sm:py-6"
    >
      <span
        ref={nameARef}
        className={`font-signature text-3xl leading-none transition-colors duration-500 sm:text-4xl ${
          isScrolled
            ? "text-neutral-900"
            : "text-yellow-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        }`}
      >
        Gabrielle
      </span>
      <Image
        ref={iconRef}
        src={iconeGirassol}
        alt="Girassol"
        className={`size-6 transition-[filter] duration-500 sm:size-8 ${
          isScrolled ? "" : "drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        }`}
      />
      <span
        ref={nameBRef}
        className={`font-signature text-3xl leading-none transition-colors duration-500 sm:text-4xl ${
          isScrolled
            ? "text-neutral-900"
            : "text-yellow-50 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
        }`}
      >
        Gabriel
      </span>
    </header>
  );
}
