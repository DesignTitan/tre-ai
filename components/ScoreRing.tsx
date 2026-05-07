/** Large 96px score ring used on the prospect detail page. */
export function ScoreRing({ score, size = 96, label = "Exit-ready" }: { score: number; size?: number; label?: string }) {
  return (
    <div
      className="score-ring relative flex-none"
      style={{ ["--s" as any]: score, width: size, height: size }}
    >
      <span className="text-[32px] font-bold tracking-tightest text-ink">{score}</span>
      <span
        className="
          absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-[100px]
          text-[9px] text-mute font-semibold uppercase tracking-cadence text-center
        "
      >
        {label}
      </span>
    </div>
  );
}
