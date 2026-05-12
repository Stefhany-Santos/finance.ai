"use client";

import { Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/app/_components/ui/chart";
import { TransactionType } from "@prisma/client";
import { TransactionPercentagePerType } from "@/app/_data/get-dashboard/types";
import { PiggyBankIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import PercentageItem from "./percentage-item";

const chartConfig = {
  [TransactionType.INVESTMENT]: {
    label: "Investido",
    color: "#FFFFFF",
  },
  [TransactionType.DEPOSIT]: {
    label: "Receita",
    color: "hsl(var(--primary))",
  },
  [TransactionType.EXPENSE]: {
    label: "Despesas",
    color: "#E93030",
  },
} satisfies ChartConfig;

interface TransactionsPieChartProps {
  typesPercentage: TransactionPercentagePerType;
  depositsTotal: number;
  investmentsTotal: number;
  expensesTotal: number;
  showEmptyAsZero?: boolean;
}

const TransactionsPieChart = ({
  depositsTotal,
  investmentsTotal,
  expensesTotal,
  typesPercentage,
  showEmptyAsZero = false,
}: TransactionsPieChartProps) => {
  const totalAmount = depositsTotal + expensesTotal + investmentsTotal;
  const isEmpty = totalAmount === 0;
  const chartData = [
    {
      type: TransactionType.DEPOSIT,
      amount: depositsTotal,
      fill: isEmpty
        ? "hsl(var(--muted))"
        : `var(--color-${TransactionType.DEPOSIT})`,
    },
    {
      type: TransactionType.EXPENSE,
      amount: expensesTotal,
      fill: isEmpty
        ? "hsl(var(--muted))"
        : `var(--color-${TransactionType.EXPENSE})`,
    },
    {
      type: TransactionType.INVESTMENT,
      amount: investmentsTotal,
      fill: isEmpty
        ? "hsl(var(--muted))"
        : `var(--color-${TransactionType.INVESTMENT})`,
    },
  ];
  const displayData = isEmpty
    ? [{ type: "Sem movimentacao", amount: 1, fill: "hsl(var(--muted))" }]
    : chartData;
  const tooltipContent = isEmpty ? (
    <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">Sem movimentacão</div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground">Total</span>
        <span className="font-mono font-medium tabular-nums text-foreground">
          R$ 0,00
        </span>
      </div>
    </div>
  ) : (
    <ChartTooltipContent hideLabel />
  );

  return (
    <Card className="flex flex-col p-6">
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={tooltipContent} />
            <Pie
              data={displayData}
              dataKey="amount"
              nameKey="type"
              innerRadius={60}
              strokeWidth={5}
            />
          </PieChart>
        </ChartContainer>

        <div className="mt-4 space-y-3">
          <PercentageItem
            icon={<TrendingUpIcon size={16} className="text-primary" />}
            title="Receita"
            value={typesPercentage[TransactionType.DEPOSIT]}
          />
          <PercentageItem
            icon={<TrendingDownIcon size={16} className="text-red-500" />}
            title="Despesas"
            value={typesPercentage[TransactionType.EXPENSE]}
          />
          <PercentageItem
            icon={<PiggyBankIcon size={16} />}
            title="Investido"
            value={typesPercentage[TransactionType.INVESTMENT]}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionsPieChart;
