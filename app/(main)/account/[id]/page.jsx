import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";

export default async function AccountPage({ params }) {
  const resolvedParams = await params; // Await `params`
  const accountData = await getAccountWithTransactions(resolvedParams.id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex gap-4 items-end justify-between">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight gradient-title capitalize dark:text-white">
            {account.name}
          </h1>
          <p className="text-muted-foreground dark:text-slate-400">
            {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>

        <div className="text-right pb-2">
          <div className={`text-xl sm:text-2xl font-bold ${
            parseFloat(account.balance) >= 0 
              ? "text-slate-900 dark:text-white" 
              : "text-rose-600 dark:text-rose-400"
          }`}>
            ${parseFloat(account.balance).toFixed(2)}
          </div>
          <p className="text-sm text-muted-foreground dark:text-slate-400">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      {/* Account Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Income This Month</h3>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            ${calculateMonthlyIncome(transactions).toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Expenses This Month</h3>
          <p className="mt-1 text-2xl font-semibold text-rose-600 dark:text-rose-400">
            ${calculateMonthlyExpenses(transactions).toFixed(2)}
          </p>
        </div>
        
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Largest Transaction</h3>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
            ${findLargestTransaction(transactions).toFixed(2)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {getLargestTransactionCategory(transactions)}
          </p>
        </div>
        
        {/* Monthly Cashflow Card */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Cashflow</h3>
            <p className={`mt-1 text-2xl font-semibold ${
              calculateMonthlyCashflow(transactions) >= 0 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-rose-600 dark:text-rose-400"
            }`}>
              ${Math.abs(calculateMonthlyCashflow(transactions)).toFixed(2)}
            </p>
            <div className="mt-1 flex items-center text-xs">
              <span className={`${
                calculateMonthlyCashflow(transactions) >= 0 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-rose-600 dark:text-rose-400"
              }`}>
                {calculateMonthlyCashflow(transactions) >= 0 ? "+" : "-"}
                {Math.abs(calculateMonthlyChangePercentage(transactions)).toFixed(1)}%
              </span>
              <span className="text-slate-400 dark:text-slate-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>
        
        {/* Account Balance Projection Card */}
        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden relative group hover:shadow-md transition-shadow duration-300">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/20 dark:to-sky-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative z-10">
            <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Balance Projection</h3>
            <div className="flex items-baseline justify-between mt-1">
              <p className={`text-2xl font-semibold ${
                calculateBalanceProjection(transactions, account.balance) >= parseFloat(account.balance) 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-rose-600 dark:text-rose-400"
              }`}>
                ${calculateBalanceProjection(transactions, account.balance).toFixed(2)}
              </p>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                in 30 days
              </span>
            </div>
            <div className="mt-2 flex items-center text-xs">
              <span className={`${
                calculateBalanceProjection(transactions, account.balance) >= parseFloat(account.balance)
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-rose-600 dark:text-rose-400"
              }`}>
                {calculateBalanceProjection(transactions, account.balance) >= parseFloat(account.balance) ? "+" : ""}
                ${(calculateBalanceProjection(transactions, account.balance) - parseFloat(account.balance)).toFixed(2)}
              </span>
              <span className="text-slate-400 dark:text-slate-500 ml-1">projected change</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <Suspense
        fallback={<div className="rounded-lg border border-slate-200 dark:border-slate-700 p-8 bg-white dark:bg-slate-900">
          <BarLoader className="mx-auto" width={"70%"} color="#9333ea" />
        </div>}
      >
        <AccountChart transactions={transactions} />
      </Suspense>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-5">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Transactions</h2>
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
      
      {/* NEW: Category Breakdown Section (at the bottom) */}
      <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold mb-5 dark:text-white flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5 mr-2 text-purple-500">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
          Spending Categories
        </h2>
        
        {/* Top Expense Categories */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Top Expense Categories</h3>
          <div className="space-y-3">
            {getCategoriesForType(transactions, "EXPENSE", 5).map((category, index) => {
              const percentage = Math.min(100, (category.amount / getTotalForType(transactions, "EXPENSE")) * 100);
              return (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getCategoryColor(category.name, index) }}
                      ></div>
                      <span className="text-sm font-medium dark:text-white">{category.name || "Uncategorized"}</span>
                    </div>
                    <div className="text-sm font-semibold dark:text-white">
                      ${category.amount.toFixed(2)} 
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: getCategoryColor(category.name, index)
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Top Income Categories */}
        <div>
          <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">Top Income Categories</h3>
          <div className="space-y-3">
            {getCategoriesForType(transactions, "INCOME", 5).map((category, index) => {
              const percentage = Math.min(100, (category.amount / getTotalForType(transactions, "INCOME")) * 100);
              return (
                <div key={index}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getIncomeColor(category.name, index) }}
                      ></div>
                      <span className="text-sm font-medium dark:text-white">{category.name || "Uncategorized"}</span>
                    </div>
                    <div className="text-sm font-semibold dark:text-white">
                      ${category.amount.toFixed(2)} 
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
                        ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full"
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: getIncomeColor(category.name, index)
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// New helper functions for the Categories Breakdown section
function getCategoriesForType(transactions, type, limit = 5) {
  // Filter transactions by type and group by category
  const categories = {};
  
  transactions
    .filter(t => t.type === type)
    .forEach(t => {
      const categoryName = t.category || "Uncategorized";
      if (!categories[categoryName]) {
        categories[categoryName] = {
          name: categoryName,
          amount: 0,
          count: 0
        };
      }
      categories[categoryName].amount += parseFloat(t.amount);
      categories[categoryName].count += 1;
    });
  
  // Convert to array and sort by amount
  const sortedCategories = Object.values(categories)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
  
  return sortedCategories;
}

function getTotalForType(transactions, type) {
  return transactions
    .filter(t => t.type === type)
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

function getCategoryColor(category, index) {
  // Colors for expense categories
  const colorMap = {
    "Food": "#4ade80", // green-400
    "Groceries": "#22c55e", // green-500
    "Rent": "#f97316", // orange-500
    "Utilities": "#3b82f6", // blue-500
    "Transportation": "#8b5cf6", // violet-500
    "Entertainment": "#ec4899", // pink-500
    "Shopping": "#06b6d4", // cyan-500
    "Healthcare": "#ef4444", // red-500
    "Travel": "#f59e0b", // amber-500
    "Dining": "#d946ef", // fuchsia-500
    "Education": "#0ea5e9", // sky-500
    "Personal": "#14b8a6", // teal-500
    "Uncategorized": "#94a3b8", // slate-400
  };
  
  // Return the mapped color or use a color based on index
  const fallbackColors = ["#8b5cf6", "#ec4899", "#f97316", "#3b82f6", "#ef4444", "#f59e0b", "#10b981"];
  return colorMap[category] || fallbackColors[index % fallbackColors.length];
}

function getIncomeColor(category, index) {
  // Colors for income categories (different palette)
  const colorMap = {
    "Salary": "#10b981", // emerald-500
    "Freelance": "#059669", // emerald-600
    "Investments": "#0ea5e9", // sky-500
    "Interest": "#0284c7", // sky-600
    "Gifts": "#8b5cf6", // violet-500
    "Refunds": "#6366f1", // indigo-500
    "Rental": "#f59e0b", // amber-500
    "Sale": "#f97316", // orange-500
    "Dividends": "#14b8a6", // teal-500
    "Bonus": "#d946ef", // fuchsia-500
    "Income": "#10b981", // emerald-500
    "Uncategorized": "#94a3b8", // slate-400
  };
  
  // Different fallback palette for income
  const fallbackColors = ["#10b981", "#0ea5e9", "#8b5cf6", "#f59e0b", "#14b8a6", "#d946ef"];
  return colorMap[category] || fallbackColors[index % fallbackColors.length];
}

// Helper functions for Monthly Cashflow card
function calculateMonthlyCashflow(transactions) {
  const monthlyIncome = calculateMonthlyIncome(transactions);
  const monthlyExpenses = calculateMonthlyExpenses(transactions);
  return monthlyIncome - monthlyExpenses;
}

function calculateMonthlyChangePercentage(transactions) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  // Get previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  
  // Current month transactions
  const currentMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  
  // Previous month transactions
  const prevMonthTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === prevMonth && date.getFullYear() === prevMonthYear;
  });
  
  // Calculate cashflows
  const currentCashflow = currentMonthTransactions.reduce((sum, t) => 
    sum + (t.type === "INCOME" ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);
  
  const prevCashflow = prevMonthTransactions.reduce((sum, t) => 
    sum + (t.type === "INCOME" ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);
  
  // Calculate percentage change
  if (prevCashflow === 0) return currentCashflow > 0 ? 100 : 0;
  return ((currentCashflow - prevCashflow) / Math.abs(prevCashflow)) * 100;
}

// Helper function for Balance Projection card
function calculateBalanceProjection(transactions, currentBalance) {
  // Look at the last 30 days of transactions to predict next 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTransactions = transactions.filter(t => 
    new Date(t.date) >= thirtyDaysAgo
  );
  
  if (recentTransactions.length === 0) return parseFloat(currentBalance);
  
  // Calculate the net cashflow over the period
  const netCashflow = recentTransactions.reduce((sum, t) => 
    sum + (t.type === "INCOME" ? parseFloat(t.amount) : -parseFloat(t.amount)), 0);
  
  // Project this forward
  return parseFloat(currentBalance) + netCashflow;
}

// Existing helper functions
function calculateMonthlyIncome(transactions) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return transactions
    .filter(t => 
      new Date(t.date) >= startOfMonth && 
      t.type === "INCOME"
    )
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

function calculateMonthlyExpenses(transactions) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  return transactions
    .filter(t => 
      new Date(t.date) >= startOfMonth && 
      t.type === "EXPENSE"
    )
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
}

function findLargestTransaction(transactions) {
  if (!transactions.length) return 0;
  
  const largest = transactions.reduce((max, t) => 
    parseFloat(t.amount) > parseFloat(max.amount) ? t : max, 
    transactions[0]
  );
  
  return parseFloat(largest.amount);
}

function getLargestTransactionCategory(transactions) {
  if (!transactions.length) return "No transactions";
  
  const largest = transactions.reduce((max, t) => 
    parseFloat(t.amount) > parseFloat(max.amount) ? t : max, 
    transactions[0]
  );
  
  return largest.category || "Uncategorized";
}