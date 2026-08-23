"use client";

interface Props {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function LoadingDoodle({
  title = "Loading…",
  subtitle,
  size = "md",
  className = "",
}: Props) {
  const iconSize = size === "sm" ? "size-10" : size === "lg" ? "size-16" : "size-12";
  const textSize = size === "sm" ? "text-xs" : size === "lg" ? "text-base" : "text-sm";
  const dotSize = size === "sm" ? "size-1" : "size-1.5";

  return (
    <div className={`flex flex-col items-center justify-center gap-4 text-center ${className}`}>
      {/* Pulsing icon */}
      <div className="relative">
        <div className={`absolute inset-0 rounded-full bg-violet-500/20 animate-ping`} />
        <div className={`absolute inset-1 rounded-full bg-violet-500/10 animate-ping [animation-delay:0.4s]`} />
        <div
          className={`relative ${iconSize} rounded-full bg-violet-900/70 border border-violet-500/30 flex items-center justify-center`}
        >
          <span className={size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl"}>🎬</span>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1">
        <p className={`font-semibold text-violet-200 ${textSize}`}>{title}</p>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>

      {/* Bouncing dots */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${dotSize} rounded-full bg-violet-400 animate-bounce`}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>

      {/* Shimmer bar */}
      <div className="w-32 h-0.5 rounded-full overflow-hidden bg-violet-900/40">
        <div
          className="h-full w-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, #7c3aed 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: "shimmer-sweep 1.8s linear infinite",
          }}
        />
      </div>
    </div>
  );
}
