"use client";

import { useCurrency } from "@/contexts/currency-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const { formatCurrency } = useCurrency();
  
  const { id, name, amount, category, spentAmount = 0 } = initialBudget;
  
  // Calculate the actual spent amount - use provided current expenses if available
  const actualSpentAmount = currentExpenses !== undefined ? currentExpenses : Number(spentAmount || 0);
  
  // Calculate percentage used
  const percentUsed = Math.min(100, (actualSpentAmount / Number(amount)) * 100);
  
  // Determine status based on percentage used
  let status = "On Track";
  let statusColor = "text-green-500 dark:text-green-400";
  
  if (percentUsed >= 90) {
    status = "Over Budget";
    statusColor = "text-red-500 dark:text-red-400";
  } else if (percentUsed >= 75) {
    status = "Warning";
    statusColor = "text-yellow-500 dark:text-yellow-400";
  }
  
  // Determine remaining amount
  const remainingAmount = Math.max(0, Number(amount) - actualSpentAmount);

  return (
    <Card className="dark:bg-slate-900 dark:border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base dark:text-white">{name}</CardTitle>
            <CardDescription className="text-xs dark:text-slate-400">
              {category}
            </CardDescription>
          </div>
          <div className={`text-sm font-medium ${statusColor}`}>{status}</div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-baseline mt-2 mb-1">
          <div className="text-2xl font-semibold dark:text-white">{formatCurrency(remainingAmount)}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            of {formatCurrency(Number(amount))}
          </div>
        </div>

        {percentUsed !== null && (
          <div className="space-y-2">
            <Progress
              value={percentUsed}
              extraStyles={`${
                // add to Progress component
                percentUsed >= 90
                  ? "bg-red-500"
                  : percentUsed >= 75
                    ? "bg-yellow-500"
                    : "bg-green-500"
              }`}
              className="dark:bg-slate-700"
            />
            <p className="text-xs text-muted-foreground text-right dark:text-slate-400">
              {percentUsed.toFixed(1)}% used
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}