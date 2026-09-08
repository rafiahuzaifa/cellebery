import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";

export function StatCard({
  icon: Icon,
  label,
  value,
  change,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: number;
  tone?: "default" | "alert";
}) {
  return (
    <div className={`rounded-xl border p-5 ${tone === "alert" ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-[#101416]"}`}>
      <div className="flex items-center justify-between">
        <span className={`grid size-9 place-items-center rounded-full ${tone === "alert" ? "bg-red-500/15 text-red-300" : "bg-[#22d3ee]/12 text-[#22d3ee]"}`}>
          <Icon size={16} strokeWidth={1.6} />
        </span>
        {typeof change === "number" && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold ${change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-semibold tracking-[-0.02em]">{value}</p>
      <p className="mt-1 text-xs text-white/45">{label}</p>
    </div>
  );
}
