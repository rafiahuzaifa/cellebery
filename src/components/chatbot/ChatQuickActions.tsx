export function ChatQuickActions({ items, onSelect, disabled }: { items: string[]; onSelect: (text: string) => void; disabled?: boolean }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {items.slice(0, 6).map((item) => (
        <button
          key={item}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(item)}
          className="rounded-full border border-white/15 px-3.5 py-2 text-[11px] font-medium text-white/75 transition hover:border-[#22d3ee]/60 hover:text-[#22d3ee] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {item}
        </button>
      ))}
    </div>
  );
}
