import { db } from "@/app/_lib/prisma";
import { TransactionType } from "@prisma/client";
import { TotalExpensePerCategory, TransactionPercentagePerType } from "./types";
import { auth } from "@clerk/nextjs/server";

export const getDashboard = async (month: string) => {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }
  const currentYear = new Date().getFullYear();
  const where = {
    userId,
    date: {
      gte: new Date(`${currentYear}-${month}-01`),
      lt: new Date(`${currentYear}-${month}-31`),
    },
  };
  
  // Executar todas as consultas no banco de dados AO MESMO TEMPO (Paralelo)
  const [
    depositsTotalResult,
    investmentsTotalResult,
    expensesTotalResult,
    transactionsTotalResult,
    totalExpensePerCategoryResult,
    lastTransactionsResult
  ] = await Promise.all([
    db.transaction.aggregate({ where: { ...where, type: "DEPOSIT" }, _sum: { amount: true } }),
    db.transaction.aggregate({ where: { ...where, type: "INVESTMENT" }, _sum: { amount: true } }),
    db.transaction.aggregate({ where: { ...where, type: "EXPENSE" }, _sum: { amount: true } }),
    db.transaction.aggregate({ where, _sum: { amount: true } }),
    db.transaction.groupBy({
      by: ["category"],
      where: { ...where, type: TransactionType.EXPENSE },
      _sum: { amount: true },
    }),
    db.transaction.findMany({ where, orderBy: { date: "desc" }, take: 15 })
  ]);

  const depositsTotal = Number(depositsTotalResult?._sum?.amount || 0);
  const investmentsTotal = Number(investmentsTotalResult?._sum?.amount || 0);
  const expensesTotal = Number(expensesTotalResult?._sum?.amount || 0);
  const transactionsTotal = Number(transactionsTotalResult?._sum?.amount || 0);
  
  const balance = depositsTotal - investmentsTotal - expensesTotal;
  
  const typesPercentage: TransactionPercentagePerType = {
    [TransactionType.DEPOSIT]: transactionsTotal ? Math.round((depositsTotal / transactionsTotal) * 100) : 0,
    [TransactionType.EXPENSE]: transactionsTotal ? Math.round((expensesTotal / transactionsTotal) * 100) : 0,
    [TransactionType.INVESTMENT]: transactionsTotal ? Math.round((investmentsTotal / transactionsTotal) * 100) : 0,
  };
  
  const totalExpensePerCategory: TotalExpensePerCategory[] = totalExpensePerCategoryResult.map(
    (category) => ({
      category: category.category,
      totalAmount: Number(category._sum.amount),
      percentageOfTotal: expensesTotal ? Math.round((Number(category._sum.amount) / expensesTotal) * 100) : 0,
    })
  );

  return {
    balance,
    depositsTotal,
    investmentsTotal,
    expensesTotal,
    typesPercentage,
    totalExpensePerCategory,
    lastTransactions: JSON.parse(JSON.stringify(lastTransactionsResult)),
  };
};
