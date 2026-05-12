"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/_components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/app/_components/ui/chart";
import { TRANSACTION_CATEGORY_LABELS } from "@/app/_constants/transactions";
import { TotalExpensePerCategory } from "@/app/_data/get-dashboard/types";
import { TransactionCategory } from "@prisma/client";

interface ExpensesBarChartProps {
  data: TotalExpensePerCategory[];
  showEmptyAsZero?: boolean;
}

const chartConfig = {
  totalAmount: {
    label: "Gasto",
    color: "hsl(var(--primary))",
  },
  label: {
    color: "hsl(var(--background))",
  },
} satisfies ChartConfig;

const ExpensesBarChart = ({
  data,
  showEmptyAsZero = false,
}: ExpensesBarChartProps) => {
  const isFilteredEmpty = showEmptyAsZero && data.length === 0;
  const chartHeight = Math.max(80, data.length * 48);
  const getCategoryLabel = (category: string) =>
    TRANSACTION_CATEGORY_LABELS[
      category as keyof typeof TRANSACTION_CATEGORY_LABELS
    ] ?? category;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  const ExpensesTooltipContent = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ value?: number; payload?: { category?: string } }>;
  }) => {
    if (!active || !payload?.length) {
      return null;
    }

    const item = payload[0];
    const category = item.payload?.category || "";

    return (
      <div className="grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
        <div className="font-medium">{getCategoryLabel(category)}</div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground">Gasto</span>
          <span className="font-mono font-medium tabular-nums text-foreground">
            {formatCurrency(item.value ?? 0)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="flex flex-col p-6">
      <CardHeader className="p-0 pb-4">
        <CardTitle className="text-lg font-bold">
          Gastos por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {isFilteredEmpty
              ? "Nenhum gasto neste mês filtrado."
              : "Nenhuma despesa este mês."}
          </p>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto w-full"
            style={{ height: chartHeight }}
          >
            <BarChart
              accessibilityLayer
              data={data}
              layout="vertical"
              barCategoryGap={15}
              margin={{ bottom: 0, left: 0, right: 24, top: 0 }}
            >
              <CartesianGrid horizontal={false} vertical={false} />
              <YAxis
                dataKey="category"
                type="category"
                tickLine={false}
                axisLine={false}
                hide
              />
              <XAxis dataKey="totalAmount" type="number" hide />
              <ChartTooltip
                cursor={false}
                content={<ExpensesTooltipContent />}
              />
              <Bar
                dataKey="totalAmount"
                fill="var(--color-totalAmount)"
                radius={4}
                barSize={35}
                background={{ fill: "hsl(var(--muted))", radius: 4 }}
              >
                <LabelList
                  dataKey="category"
                  position="insideLeft"
                  offset={8}
                  className="fill-white"
                  fontSize={12}
                  formatter={(value: string) => getCategoryLabel(value)}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesBarChart;
