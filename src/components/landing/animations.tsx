"use client";

import * as React from "react";

/* ─── Grid Pattern Background ─── */
export function GridPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.07" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>
      {/* Radial fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white dark:to-gray-950" />
    </div>
  );
}

/* ─── Dot Pattern Background ─── */
export function DotPattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="dot-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" opacity="0.08" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dot-pattern)" />
      </svg>
    </div>
  );
}

/* ─── Spotlight Effect (cursor-following) ─── */
export function Spotlight() {
  const [pos, setPos] = React.useState({ x: 50, y: 50 });

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setPos({ x, y });
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-30 transition-opacity duration-500"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}% ${pos.y}%, rgba(15,76,92,0.12), transparent 70%)`,
      }}
    />
  );
}

/* ─── Animated Gradient Text ─── */
export function GradientText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-text ${className}`}
      style={{
        backgroundImage: "linear-gradient(90deg, #0F4C5C, #D4A373, #0F4C5C, #D4A373)",
      }}
    >
      {children}
    </span>
  );
}

/* ─── Blur Fade In (scroll-triggered) ─── */
export function BlurFade({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        opacity: visible ? 1 : 0,
        filter: visible ? "blur(0px)" : "blur(8px)",
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Marquee (infinite scroll) ─── */
export function Marquee({
  children,
  speed = 40,
  direction = "left",
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  direction?: "left" | "right";
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex gap-8 whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationDirection: direction === "right" ? "reverse" : "normal",
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

/* ─── Bento Grid ─── */
export function BentoGrid({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function BentoCard({
  title,
  description,
  icon,
  className = "",
  large = false,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  large?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-gray-200/60 bg-white/50 backdrop-blur-sm p-6 hover:shadow-lg hover:border-gray-300/80 transition-all duration-300 ${
        large ? "md:col-span-2 lg:col-span-2" : ""
      } ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-teal-50/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="h-10 w-10 rounded-xl bg-teal-100/80 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/* ─── Floating Badge / Pill ─── */
export function HeroBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gray-200/80 bg-white/70 backdrop-blur-sm text-xs font-medium text-gray-600 shadow-sm ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
      {children}
    </div>
  );
}

/* ─── Number Counter (animate on scroll) ─── */
export function AnimatedCounter({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef<HTMLSpanElement>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{prefix}{count.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ─── Beam Line (decorative) ─── */
export function BeamLine({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px w-full overflow-hidden ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-400/40 to-transparent" />
      <div className="absolute h-full w-1/4 bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-beam" />
    </div>
  );
}
