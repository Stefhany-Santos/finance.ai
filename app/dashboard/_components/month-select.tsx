"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface MonthSelectProps {
  defaultMonth: string;
}

const MonthSelect = ({ defaultMonth }: MonthSelectProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasMonthFilter = searchParams.has("month");

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", event.target.value);
    router.push(`/dashboard?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("month");
    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  };

  const getMonthLabel = (monthIndex: number) => {
    const label = new Date(0, monthIndex).toLocaleString("pt-BR", {
      month: "long",
    });
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <div className="flex items-center gap-2">
      <select
        defaultValue={defaultMonth}
        onChange={handleChange}
        className="cursor-pointer rounded-md border border-border bg-transparent px-3 py-2 text-sm focus:outline-none"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <option
            key={i}
            value={String(i + 1).padStart(2, "0")}
            className="bg-popover text-popover-foreground"
          >
            {getMonthLabel(i)}
          </option>
        ))}
      </select>
      {hasMonthFilter && (
        <button
          type="button"
          onClick={handleClear}
          className="rounded-md border border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          Limpar
        </button>
      )}
    </div>
  );
};

export default MonthSelect;
