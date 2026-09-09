import type { ChatComparisonData } from "@/lib/ai/types";

export function ChatComparison({ comparison, isArabic }: { comparison: ChatComparisonData; isArabic: boolean }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#101416]">
      <table className="w-full min-w-[420px] text-left text-[11px]">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-3 py-2 font-medium text-white/40" />
            {comparison.products.map((p) => (
              <th key={p.slug} className="px-3 py-2 font-semibold text-white/85">{p.name}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {comparison.rows.map((row) => (
            <tr key={row.label}>
              <td className="px-3 py-2 text-white/40">{row.label}</td>
              {row.values.map((value, index) => (
                <td key={index} className="px-3 py-2 text-white/75">{value}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {(comparison.bestOverall || comparison.bestValue) && (
        <div className="flex flex-wrap gap-3 border-t border-white/10 px-3 py-2.5 text-[10px] text-[#22d3ee]">
          {comparison.bestOverall && <span>{isArabic ? "الأفضل عموماً:" : "Best overall:"} {comparison.products.find((p) => p.slug === comparison.bestOverall)?.name}</span>}
          {comparison.bestValue && <span>{isArabic ? "أفضل قيمة:" : "Best value:"} {comparison.products.find((p) => p.slug === comparison.bestValue)?.name}</span>}
        </div>
      )}
    </div>
  );
}
