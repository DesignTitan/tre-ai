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
        block bg-card border border-rule/60 rounded-2xl p-3.5
        shadow-soft active:scale-[.985] transition-transform
      "
    >
      <div className="flex items-start gap-3.5">
        <ScoreDot score={prospect.score} />
        <div className="flex-1 min-w-0">
          {area && (
            <span className="
              inline-block mb-1
              text-[10px] font-semibold uppercase tracking-[.04em]
              text-accent bg-accent/[.09] px-1.5 py-[2px] rounded
            ">{area.name}</span>
          )}
          <h3
            className="text-[14.5px] font-semibold tracking-tight2 text-ink leading-[1.25]"
            dangerouslySetInnerHTML={{ __html: prospect.name }}
          />
          <div className="text-[11px] text-mute mt-0.5">
            <em className="not-italic text-ink2 font-medium">{prospect.industry}</em>
            <span> · </span>
            <em className="not-italic text-ink2 font-medium">est. {prospect.founded} · {yearsSince(prospect.founded)} yrs</em>
          </div>
        </div>
      </div>

      {prospect.whyBullets.length > 0 && (
        <div className="why mt-2.5 flex flex-col gap-[5px] border-t border-dashed border-rule pt-2.5">
          {prospect.whyBullets.map((b, i) => (
            <div key={i} className="text-[12px] text-ink2 leading-[1.4] flex gap-[7px]">
              <span className="flex-none w-[5px] h-[5px] rounded-full bg-accent mt-[7px]" />
              <span dangerouslySetInnerHTML={{ __html: renderInlineBold(b) }} />
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center mt-2.5 text-[11px] text-mute">
        <span className="flex gap-1.5">
          {prospect.tags?.includes("owner-led") && (
            <span className="text-[10px] bg-warm/[.12] text-warm px-[7px] py-[2px] rounded font-semibold tracking-[.04em] uppercase">Owner-led</span>
          )}
          {prospect.tags?.includes("pe-tailwind") && (
            <span className="text-[10px] bg-gold/[.15] text-[#8A6A1F] px-[7px] py-[2px] rounded font-semibold tracking-[.04em] uppercase">PE tailwind</span>
          )}
        </span>
        {prospect.distanceMi !== undefined && (
          <span>
            {prospect.distanceMi} mi
            {prospect.driveMin ? ` · ${prospect.driveMin} min` : ""}
          </span>
        )}
      </div>
    </Link>
  );
}
