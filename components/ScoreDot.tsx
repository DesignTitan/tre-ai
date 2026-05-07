/** Small 48px score circle used on prospect cards. */
export function ScoreDot({ score, size = 48 }: { score: number; size?: number }) {
  return (
    <div
      className="scoredot"
      style={{ ["--s" as any]: score, width: size, height: size }}
      aria-label={`Exit Readiness ${score}`}
    >
      <span>{score}</span>
    </div>
  );
}
