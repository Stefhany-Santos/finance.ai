import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import TransactionsPieChart from "@/app/(home)/_components/transactions-pie-chart";
import ExpensesBarChart from "@/app/(home)/_components/expenses-bar-chart";
import Navbar from "@/app/_components/navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../_components/ui/card";
import { Button } from "../_components/ui/button";
import {
  Sparkles,
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
} from "lucide-react";
import { getDashboard } from "../_data/get-dashboard";
import MonthSelect from "./_components/month-select";
import AiReportButton from "../(home)/_components/ai-report-button";
import { TransactionType } from "@prisma/client";

export const dynamic = "force-dynamic";

type DashboardTransaction = {
  id: string;
  name: string;
  date: string | Date;
  amount: number;
  type: TransactionType;
};

const DashboardPage = async ({
  searchParams,
}: {
  searchParams: { month?: string };
}) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/login");
  }

  // Pega o mês atual (ou o mês da URL se existir)
  const currentMonth =
    searchParams.month || String(new Date().getMonth() + 1).padStart(2, "0");
  const isMonthFiltered = Boolean(searchParams.month);

  // Chama a sua função incrível que calcula tudo no banco!
  const dashboard = await getDashboard(currentMonth);
  const user = await clerkClient().users.getUser(userId);
  const hasPremiumPlan = user.publicMetadata.subscriptionPlan === "premium";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col space-y-6 overflow-hidden p-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex gap-3">
            <AiReportButton
              month={currentMonth}
              hasPremiumPlan={hasPremiumPlan}
              variant="outline"
              className="flex items-center gap-2"
              icon={<Sparkles className="h-4 w-4 text-primary" />}
            />
            <MonthSelect defaultMonth={currentMonth} />
          </div>
        </div>

        {/* GRID PRINCIPAL */}
        <div className="grid grid-cols-[1fr,400px] gap-6">
          {/* LADO ESQUERDO */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    <CardTitle className="text-base font-normal">
                      Saldo
                    </CardTitle>
                  </div>
                  <Link href="/transactions?newTransaction=true">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 rounded-full bg-primary px-4 font-bold text-primary-foreground hover:bg-primary/90"
                    >
                      Adicionar transação
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold">
                  {formatCurrency(dashboard.balance)}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Wallet className="h-4 w-4" />
                    <CardTitle className="text-sm font-normal">
                      Investido
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboard.investmentsTotal)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <CardTitle className="text-sm font-normal">
                      Receita
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboard.depositsTotal)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingDown className="h-4 w-4 text-danger" />
                    <CardTitle className="text-sm font-normal">
                      Despesas
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {formatCurrency(dashboard.expensesTotal)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-[1fr,1.5fr] gap-6">
              <TransactionsPieChart
                depositsTotal={dashboard.depositsTotal}
                expensesTotal={dashboard.expensesTotal}
                investmentsTotal={dashboard.investmentsTotal}
                typesPercentage={dashboard.typesPercentage}
                showEmptyAsZero={isMonthFiltered}
              />

              <ExpensesBarChart
                data={dashboard.totalExpensePerCategory}
                showEmptyAsZero={isMonthFiltered}
              />
            </div>
          </div>

          {/* LADO DIREITO */}
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-6">
              <CardTitle className="text-lg font-bold">
                Últimas Transações
              </CardTitle>
              <Link href="/transactions">
                <Button
                  variant="outline"
                  className="h-8 rounded-full text-xs font-bold"
                >
                  Ver mais
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-6">
              {dashboard.lastTransactions.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma transação.
                </p>
              )}
              {dashboard.lastTransactions.map(
                (tx: DashboardTransaction, i: number) => {
                  const isExpense = tx.type === TransactionType.EXPENSE;

                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-lg bg-white/5 p-3">
                          <Wallet className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">{tx.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(tx.date).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`text-sm font-bold ${isExpense ? "text-danger" : "text-primary"}`}
                      >
                        {isExpense ? "-" : "+"}
                        {formatCurrency(Number(tx.amount))}
                      </p>
                    </div>
                  );
                },
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
