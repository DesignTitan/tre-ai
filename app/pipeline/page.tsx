import Link from "next/link";
import { DEALS } from "@/lib/data/deals";
import { findProspect } from "@/lib/data/prospects";
import { findArea } from "@/lib/data/areas";
import { cx } from "@/lib/utils";
import type { DealStage } from "@/lib/types";

const STAGE_ORDER: { stage: DealStage; label: string }[] = [
  { stage: "first-visit", label: "First Visit" },
  { stage: "discovery",   label: "Discovery" },
  { stage: "engagement",  label: "Engagement" },
];

export default function PipelinePage() {
  const byStage: Record<DealStage, typeof DEALS> = {
    "first-visit": [],
    "discovery": [],
    "engagement": [],
  };
  for (const d of DEALS) byStage[d.stage].push(d);

  const open = DEALS.length;
  const stuck = DEALS.filter(d => d.isWarn || d.status === "stuck").length;
  const dueThisWeek = DEALS.filter(d => /today|Mon|Wed|Fri|Tue|Thu/.test(d.nextActionLabel ?? "")).length;

  return (
    <div>
      <div className="px-6 pt-3.5 pb-1.5">
        <div className="text-[12px] text-mute uppercase tracking-[.08em] font-medium">Detroit Trip</div>
        <h2 className="text-[24px] font-semibold tracking-tightx mt-0.5">Pipeline</h2>
      </div>

      <div className="flex gap-2 px-6 pb-3">
        <Stat k="Open" v={String(open)} />
        <Stat k="Stuck" v={String(stuck)} kind="red" />
        <Stat k="Due" v={`${dueThisWeek} `} suffix="this wk" />
      </div>

      <div className="px-6 pb-6 flex flex-col gap-3.5">
        {STAGE_ORDER.map(({ stage, label }) => {
          const deals = byStage[stage];
          if (!deals.length) return null;
          return (
            <section key={stage}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span className="text-[12px] font-semibold tracking-tight2">{label}</span>
                <span className="text-[10px] text-mute font-semibold">{deals.length}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {deals.map((d, idx) => {
                  const p = findProspect(d.prospectId);
                  if (!p) return null;
                  const area = findArea(p.area);
                  return (
                    <Link
                      key={idx}
                      href={`/prospect/${p.id}`}
                      className={cx(
                        "bg-card rounded-xl border px-3 py-2.5 flex justify-between items-center active:scale-[.985] transition-transform",
                        d.isWarn ? "border-red/40 bg-red/[.04]" : "border-rule"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold tracking-tight2 truncate">
                          {p.name.replace(/<br\s*\/?>/g, " ").replace(/&amp;/g, "&")} · {area?.shortName ?? area?.name}
                        </div>
                        <div className="text-[11px] text-mute mt-px">
                          {p.ownerHint ? `${p.ownerHint} · ` : ""}score {p.score}
                        </div>
                      </div>
                      <div className="text-[10px] font-semibold text-mute text-right leading-[1.3] flex-none">
                        <strong className={cx(
                          "block text-[11px]",
                          d.isWarn ? "text-red" : "text-ink"
                        )}>
                          {d.nextActionLabel}
                        </strong>
                        {d.nextActionDetail}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Stat({ k, v, suffix, kind }: { k: string; v: string; suffix?: string; kind?: "red" }) {
  return (
    <div className="flex-1 bg-card border border-rule rounded-xl px-3 py-2.5">
      <div className="text-[10px] text-mute uppercase tracking-[.1em] font-semibold">{k}</div>
      <div className={cx("text-[18px] font-bold tracking-tightx mt-0.5", kind === "red" ? "text-red" : "")}>
        {v}
        {suffix && <small className="text-[11px] text-mute font-medium tracking-normal ml-0.5">{suffix}</small>}
      </div>
    </div>
  );
}
