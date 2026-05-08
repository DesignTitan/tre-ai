import Link from "next/link";
import type { Prospect } from "@/lib/types";
import { ScoreDot } from "./ScoreDot";
import { renderInlineBold, yearsSince } from "@/lib/utils";
import { findArea } from "@/lib/data/areas";

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const area = findArea(prospect.area);
  return (
    <Link
      href={`/prospect/${prospect.id}`}
      className="
        block bg-card border border-rule/60 rounded-xl p-2.5
        shadow-soft active:scale-[.985] transition-transform
      "
    >
      <div className="flex items-start gap-2.5">
        <ScoreDot score={prospect.score} size={36} />
        <div className="flex-1 min-w-0">
          {area && (
            <span className="
              inline-block mb-0.5
              text-[9px] font-semibold uppercase tracking-[.04em]
              text-accent bg-accent/[.09] px-1.5 py-[1px] rounded
            ">{area.name}</span>
          )}
          <h3
            className="text-[13.5px] font-semibold tracking-tight2 text-ink leading-[1.2]"
            dangerouslySetInnerHTML={{ __html: prospect.name }}
          />
          <div className="text-[10.5px] text-mute mt-px">
            <em className="not-italic text-ink2 font-medium">{prospect.industry}</em>
            {prospect.founded ? (
              <>
                <span> · </span>
                <em className="not-italic text-ink2 font-medium">est. {prospect.founded} · {yearsSince(prospect.founded)} yrs</em>
              </>
            ) : null}
          </div>
        </div>
        {prospect.distanceMi !== undefined && (
          <span className="flex-none text-[10px] text-mute font-medium tabular-nums pt-px">
            {prospect.distanceMi}mi
          </span>
        )}
      </div>

      {prospect.whyBullets.length > 0 && (
        <div className="why mt-2 flex flex-col gap-[3px] border-t border-dashed border-rule pt-2">
          {prospect.whyBullets.slice(0, 2).map((b, i) => (
            <div key={i} className="text-[11.5px] text-ink2 leading-[1.35] flex gap-[6px]">
              <span className="flex-none w-[4px] h-[4px] rounded-full bg-accent mt-[6px]" />
              <span className="truncate" dangerouslySetInnerHTML={{ __html: renderInlineBold(b) }} />
            </div>
          ))}
        </div>
      )}

      {(prospect.tags?.includes("owner-led") || prospect.tags?.includes("pe-tailwind") || prospect.provisional) && (
        <div className="flex gap-1 mt-2 text-[9px]">
          {prospect.tags?.includes("owner-led") && (
            <span className="bg-warm/[.12] text-warm px-1.5 py-[1px] rounded font-semibold tracking-[.04em] uppercase">Owner-led</span>
          )}
          {prospect.tags?.includes("pe-tailwind") && (
            <span className="bg-gold/[.15] text-[#8A6A1F] px-1.5 py-[1px] rounded font-semibold tracking-[.04em] uppercase">PE tailwind</span>
          )}
          {prospect.provisional && (
            <span className="bg-black/[.06] text-mute px-1.5 py-[1px] rounded font-semibold tracking-[.04em] uppercase">Provisional</span>
          )}
        </div>
      )}
    </Link>
  );
}
