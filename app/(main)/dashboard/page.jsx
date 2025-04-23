"use client";
import { useCurrency } from "@/contexts/currency-context";
import { useState, useEffect } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getFinanceTips } from "@/actions/getFinanceTips";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plus, ArrowUpRight, ArrowDownRight, BarChart, Wallet, CreditCard, Tag,
  ShoppingCart, Utensils, Home, Car, Plane, HeartPulse, Gamepad, GraduationCap,
  Laptop, ShoppingBag, Coffee, Briefcase, Banknote, Gift, Bus, Wifi, Smartphone,
  Lightbulb, Building, PiggyBank, BadgeDollarSign, DollarSign, CircleDollarSign,
  TrendingUp, TrendingDown
} from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import { FinanceTipsCard } from "@/components/FinanceTipsCard";
import { CategoryCardClient } from "./_components/category-card-client";
import { BudgetSetterCard } from "./_components/budget-setter-card";
import { getUserBudgets, saveBudget } from "@/actions/budget";
import { FinancialGoalsCard } from "./_components/financial-goals-card";
import { toast } from "sonner";

export default function DashboardPage() {
  const { formatCurrency } = useCurrency();

  const [dashboardData, setDashboardData] = useState({
    accounts: [],
    transactions: [],
    budgets: [],
    financeTips: [],
    loading: true,
  });

  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [updateKey, setUpdateKey] = useState(0);

  const handleAccountDelete = (accountId) => {
    setAccounts((prevAccounts) =>
      prevAccounts.filter((account) => account.id !== accountId)
    );
  };

  const handleAccountCreated = (newAccount) => {
    setAccounts((prevAccounts) => [newAccount, ...prevAccounts]);
  };

  // Add this function to handle default account changes
  const handleDefaultChanged = (accountId) => {
    // Update the accounts state with the new default account
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) => ({
        ...account,
        isDefault: account.id === accountId
      }))
    );
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [accounts, transactions, budgets] = await Promise.all([
          getUserAccounts(),
          getDashboardData(),
          getUserBudgets(),
        ]);

        const defaultAccount = accounts?.find((account) => account.isDefault);
        const accountBalance = defaultAccount?.balance || 0;

        const totalIncome = transactions.reduce((acc, transaction) => {
          return transaction.type === "INCOME" ? acc + transaction.amount : acc;
        }, 0);

        const totalExpenses = transactions.reduce((acc, transaction) => {
          return transaction.type === "EXPENSE" ? acc + transaction.amount : acc;
        }, 0);

        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const currentMonthIncome = transactions.reduce((acc, transaction) => {
          const transactionDate = new Date(transaction.date);
          return transaction.type === "INCOME" &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
            ? acc + transaction.amount
            : acc;
        }, 0);

        const currentMonthExpenses = transactions.reduce((acc, transaction) => {
          const transactionDate = new Date(transaction.date);
          return transaction.type === "EXPENSE" &&
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
            ? acc + transaction.amount
            : acc;
        }, 0);

        const financeTips = await getFinanceTips(
          Number(currentMonthExpenses),
          0,
          Number(accountBalance),
          Number(currentMonthIncome)
        );

        const categorySummary = transactions.reduce((acc, transaction) => {
          const { type, category, amount } = transaction;

          if (!acc[type]) {
            acc[type] = {};
          }

          if (!acc[type][category]) {
            acc[type][category] = 0;
          }

          acc[type][category] += amount;
          return acc;
        }, {});

        const sortedIncomeCategories = Object.entries(
          categorySummary.INCOME || {}
        )
          .sort(([, amountA], [, amountB]) => amountB - amountA)
          .slice(0, 5);

        const sortedExpenseCategories = Object.entries(
          categorySummary.EXPENSE || {}
        )
          .sort(([, amountA], [, amountB]) => amountB - amountA)
          .slice(0, 5);

        const totalTransactions = totalIncome + totalExpenses;
        const incomeRatio =
          totalTransactions > 0 ? (totalIncome / totalTransactions) * 100 : 50;

        const netSavings = totalIncome - totalExpenses;

        const allCategories = new Set();
        transactions.forEach((transaction) => {
          allCategories.add(transaction.category);
        });

        const categoryData = {};
        allCategories.forEach((category) => {
          let iconName = "Tag";
          const lowerCategory = category.toLowerCase();

          if (lowerCategory.includes("shopping")) iconName = "ShoppingCart";
          else if (
            lowerCategory.includes("grocery") ||
            lowerCategory.includes("groceries")
          )
            iconName = "ShoppingBag";
          else if (
            lowerCategory.includes("food") ||
            lowerCategory.includes("restaurant") ||
            lowerCategory.includes("dining")
          )
            iconName = "Utensils";
          else if (
            lowerCategory.includes("home") ||
            lowerCategory.includes("rent") ||
            lowerCategory.includes("mortgage")
          )
            iconName = "Home";
          else if (
            lowerCategory.includes("car") ||
            lowerCategory.includes("auto") ||
            lowerCategory.includes("fuel")
          )
            iconName = "Car";
          else if (
            lowerCategory.includes("travel") ||
            lowerCategory.includes("flight") ||
            lowerCategory.includes("vacation")
          )
            iconName = "Plane";
          else if (
            lowerCategory.includes("health") ||
            lowerCategory.includes("medical") ||
            lowerCategory.includes("doctor")
          )
            iconName = "HeartPulse";
          else if (
            lowerCategory.includes("game") ||
            lowerCategory.includes("entertainment")
          )
            iconName = "Gamepad";
          else if (
            lowerCategory.includes("education") ||
            lowerCategory.includes("school") ||
            lowerCategory.includes("college")
          )
            iconName = "GraduationCap";
          else if (
            lowerCategory.includes("tech") ||
            lowerCategory.includes("computer") ||
            lowerCategory.includes("software")
          )
            iconName = "Laptop";
          else if (lowerCategory.includes("coffee") || lowerCategory.includes("cafe"))
            iconName = "Coffee";
          else if (
            lowerCategory.includes("salary") ||
            lowerCategory.includes("wage")
          )
            iconName = "Briefcase";
          else if (
            lowerCategory.includes("income") ||
            lowerCategory.includes("revenue")
          )
            iconName = "Banknote";
          else if (lowerCategory.includes("gift")) iconName = "Gift";
          else if (
            lowerCategory.includes("investment") ||
            lowerCategory.includes("stock") ||
            lowerCategory.includes("dividend")
          )
            iconName = "BarChart";
          else if (lowerCategory.includes("utilities")) iconName = "Lightbulb";
          else if (lowerCategory.includes("insurance")) iconName = "Building";
          else if (
            lowerCategory.includes("transport") ||
            lowerCategory.includes("transit")
          )
            iconName = "Bus";
          else if (
            lowerCategory.includes("internet") ||
            lowerCategory.includes("subscription")
          )
            iconName = "Wifi";
          else if (
            lowerCategory.includes("phone") ||
            lowerCategory.includes("mobile")
          )
            iconName = "Smartphone";
          else if (lowerCategory.includes("bonus")) iconName = "BadgeDollarSign";
          else if (lowerCategory.includes("savings")) iconName = "PiggyBank";

          const colors = {
            salary: "#22c55e",
            investment: "#3b82f6",
            bonus: "#a855f7",
            food: "#ef4444",
            rent: "#f97316",
            utilities: "#06b6d4",
            shopping: "#eab308",
            transportation: "#64748b",
            entertainment: "#ec4899",
            health: "#14b8a6",
            education: "#8b5cf6",
          };

          const color = colors[lowerCategory] || "#94a3b8";

          categoryData[category] = {
            icon: iconName,
            color: color,
          };
        });

        setDashboardData({
          accounts,
          transactions,
          budgets,
          financeTips,
          defaultAccount,
          totalIncome,
          totalExpenses,
          currentMonthIncome,
          currentMonthExpenses,
          accountBalance,
          sortedIncomeCategories,
          sortedExpenseCategories,
          incomeRatio,
          netSavings,
          categoryData,
          loading: false,
        });

        setAccounts(accounts);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setDashboardData((prev) => ({ ...prev, loading: false }));
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (dashboardData.transactions) {
      setTransactions(dashboardData.transactions);
    }
  }, [dashboardData.transactions]);

  const handleTransactionComplete = (updatedDashboardData) => {
    console.log("New dashboard data received:", {
      accounts: updatedDashboardData.accounts?.length || 0,
      transactions: updatedDashboardData.transactions?.length || 0,
    });
    
    // Set loading to false immediately
    setDashboardData(prev => ({
      ...prev,
      loading: false
    }));
    
    // Update accounts state if data is available
    if (updatedDashboardData.accounts) {
      setAccounts(updatedDashboardData.accounts);
    }
    
    // Update transactions state if data is available
    if (updatedDashboardData.transactions) {
      setTransactions(updatedDashboardData.transactions);
    }
    
    // Update all dashboard data metrics with the fresh data
    setDashboardData(prevData => ({
      ...prevData,
      accounts: updatedDashboardData.accounts || prevData.accounts,
      transactions: updatedDashboardData.transactions || prevData.transactions,
      budgets: updatedDashboardData.budgets || prevData.budgets,
      goals: updatedDashboardData.goals || prevData.goals,
      financeTips: updatedDashboardData.financeTips || prevData.financeTips,
      totalIncome: updatedDashboardData.totalIncome ?? prevData.totalIncome,
      totalExpenses: updatedDashboardData.totalExpenses ?? prevData.totalExpenses,
      currentMonthIncome: updatedDashboardData.currentMonthIncome ?? prevData.currentMonthIncome,
      currentMonthExpenses: updatedDashboardData.currentMonthExpenses ?? prevData.currentMonthExpenses,
      accountBalance: updatedDashboardData.accountBalance ?? prevData.accountBalance,
      sortedIncomeCategories: updatedDashboardData.sortedIncomeCategories || prevData.sortedIncomeCategories,
      sortedExpenseCategories: updatedDashboardData.sortedExpenseCategories || prevData.sortedExpenseCategories,
      incomeRatio: updatedDashboardData.incomeRatio ?? prevData.incomeRatio,
      netSavings: updatedDashboardData.netSavings ?? prevData.netSavings,
      categoryData: updatedDashboardData.categoryData || prevData.categoryData,
    }));
  };

  // Add this useEffect to ensure updates are reflected in the UI
  useEffect(() => {
    // This will run whenever dashboardData changes
    console.log("Dashboard data changed, forcing component update");
    
    // Force component re-render
    setUpdateKey(prev => prev + 1);
  }, [dashboardData]);

  // Add this useEffect to your dashboard component
  useEffect(() => {
    // Function to handle dashboard update events from header
    const handleDashboardUpdate = (event) => {
      console.log("Dashboard received custom event with data:", event.detail);
      
      // Use the same handler as for direct updates
      handleTransactionComplete(event.detail);
    };
    
    // Add event listener when component mounts
    window.addEventListener("dashboard:update", handleDashboardUpdate);
    
    // Clean up event listener when component unmounts
    return () => {
      window.removeEventListener("dashboard:update", handleDashboardUpdate);
    };
  }, []);  // Empty dependency array means this runs once on mount

  // Add this useEffect to recalculate totals when transactions change
  useEffect(() => {
    if (transactions.length > 0) {
      // Recalculate all the financial metrics when transactions change
      const totalIncome = transactions.reduce((acc, transaction) => {
        return transaction.type === "INCOME" ? acc + transaction.amount : acc;
      }, 0);

      const totalExpenses = transactions.reduce((acc, transaction) => {
        return transaction.type === "EXPENSE" ? acc + transaction.amount : acc;
      }, 0);

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      const currentMonthIncome = transactions.reduce((acc, transaction) => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === "INCOME" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
          ? acc + transaction.amount
          : acc;
      }, 0);

      const currentMonthExpenses = transactions.reduce((acc, transaction) => {
        const transactionDate = new Date(transaction.date);
        return transaction.type === "EXPENSE" &&
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
          ? acc + transaction.amount
          : acc;
      }, 0);

      const totalTransactions = totalIncome + totalExpenses;
      const incomeRatio = totalTransactions > 0 ? (totalIncome / totalTransactions) * 100 : 50;
      const netSavings = totalIncome - totalExpenses;

      // Update the dashboard data with fresh calculations
      setDashboardData(prevData => ({
        ...prevData,
        totalIncome,
        totalExpenses,
        currentMonthIncome,
        currentMonthExpenses,
        incomeRatio,
        netSavings
      }));
    }
  }, [transactions]); // This will trigger whenever transactions change

  if (dashboardData.loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
        <h2 className="text-xl font-medium mb-4 text-slate-600 dark:text-slate-400">Loading your financial dashboard</h2>
        <div className="w-full max-w-md mx-auto">
          <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-loading-bar"></div>
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-500 mt-3">Analyzing your financial data...</p>
      </div>
    );
  }

  const {
    transactions: dashboardTransactions,
    budgets,
    financeTips,
    totalIncome,
    totalExpenses,
    currentMonthIncome,
    currentMonthExpenses,
    accountBalance,
    sortedIncomeCategories,
    sortedExpenseCategories,
    incomeRatio,
    netSavings,
    categoryData,
  } = dashboardData;

  const lastMonthIncome = 0;
  const lastMonthExpenses = 0;

  const incomeChange =
    lastMonthIncome > 0
      ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
      : 0;

  const expenseChange =
    lastMonthExpenses > 0
      ? ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100
      : 0;

  return (
    <div className="space-y-8 p-4 md:p-8 dark:bg-slate-950">
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative group dark:bg-slate-900/90">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 via-indigo-100 to-white dark:from-blue-900/70 dark:via-indigo-900/60 dark:to-slate-900/90 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <Wallet className="h-32 w-32 text-blue-500 dark:text-blue-400 rotate-6" />
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-300 to-blue-500 dark:from-blue-400 dark:to-blue-600 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <DollarSign className="h-5 w-5" />
                Net Balance
              </CardTitle>
              <CardDescription className="text-blue-600/80 dark:text-blue-400/90">
                Total savings & wealth
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative z-10">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-white dark:bg-slate-800/90 shadow-inner p-3 mr-3 ring-2 ring-blue-100 dark:ring-blue-500/30 group-hover:ring-blue-200 dark:group-hover:ring-blue-500/50 transition-all">
                  <DollarSign className="h-8 w-8 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <span
                    className={`text-3xl font-bold bg-clip-text text-transparent ${
                      netSavings >= 0
                        ? "bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-300 dark:to-indigo-300"
                        : "bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-300 dark:to-orange-300"
                    }`}
                  >
                    {formatCurrency(netSavings)}
                  </span>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground dark:text-slate-300">
                    <span className="text-xs mr-1">
                      {netSavings >= 0 ? "Total savings:" : "Net debt:"}
                    </span>
                    <span
                      className={`font-medium ${
                        netSavings >= 0
                          ? "text-blue-600 dark:text-blue-300"
                          : "text-red-600 dark:text-red-300"
                      }`}
                    >
                      {formatCurrency(Math.abs(netSavings))}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-white/50 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg shadow-sm border border-blue-100 dark:border-blue-500/30">
                <div className="flex justify-between text-xs text-muted-foreground dark:text-slate-300 mb-1.5">
                  <span className="text-green-600 dark:text-green-300 font-medium">
                    Income: {formatCurrency(totalIncome)}
                  </span>
                  <span className="text-red-600 dark:text-red-300 font-medium">
                    Expenses: {formatCurrency(totalExpenses)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-slate-700/80 rounded-full overflow-hidden shadow-inner flex">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-500 dark:from-green-400 dark:to-green-500 rounded-r-none rounded-l-full flex-shrink-0 relative group"
                    style={{ width: `${incomeRatio}%` }}
                  >
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 text-[10px] font-medium text-green-700 dark:text-green-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(totalIncome)}
                    </span>
                  </div>
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-red-500 dark:from-red-400 dark:to-red-500 rounded-l-none rounded-r-full flex-shrink-0 relative group"
                    style={{ width: `${100 - incomeRatio}%` }}
                  >
                    <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1.5 text-[10px] font-medium text-red-700 dark:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {formatCurrency(totalExpenses)}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-center mt-4 py-1 px-2 rounded-md bg-slate-50/70 dark:bg-slate-800/90 border border-slate-100 dark:border-slate-600 shadow-sm backdrop-blur-sm">
                  {incomeRatio > 50 ? (
                    <span className="font-medium text-green-700 dark:text-green-300 flex items-center justify-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      Saving{" "}
                      <span className="font-bold mx-1">
                        {(incomeRatio - 50).toFixed(0)}%
                      </span>{" "}
                      of income
                    </span>
                  ) : (
                    <span className="font-medium text-red-700 dark:text-red-300 flex items-center justify-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Spending{" "}
                      <span className="font-bold mx-1">
                        {(50 - incomeRatio).toFixed(0)}%
                      </span>{" "}
                      more than income
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative group dark:bg-slate-900/90">
            <div className="absolute inset-0 bg-gradient-to-br from-green-200 via-emerald-100 to-white dark:from-green-900/70 dark:via-emerald-900/60 dark:to-slate-900/90 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <TrendingUp className="h-32 w-32 text-green-500 dark:text-green-400 rotate-12" />
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-300 to-green-500 dark:from-green-400 dark:to-green-600 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2 text-green-700 dark:text-green-300">
                <CircleDollarSign className="h-5 w-5" />
                Total Income
              </CardTitle>
              <CardDescription className="text-green-600/80 dark:text-green-400/90">
                All-time earnings & revenue
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative z-10">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-white dark:bg-slate-800/90 shadow-inner p-3 mr-3 ring-2 ring-green-100 dark:ring-green-500/30 group-hover:ring-green-200 dark:group-hover:ring-green-500/50 transition-all">
                  <CircleDollarSign className="h-8 w-8 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-500 dark:from-green-300 dark:to-emerald-300">
                    {formatCurrency(totalIncome)}
                  </span>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground dark:text-slate-300">
                    <span className="text-xs mr-1">This month:</span>
                    <span className="font-medium text-green-600 dark:text-green-300">
                      {formatCurrency(currentMonthIncome)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center bg-white/50 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-green-100 dark:border-green-500/30">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-green-800 dark:text-green-300 mr-1">
                    Growth:
                  </span>
                </div>
                <div className="flex items-center">
                  {lastMonthIncome > 0 ? (
                    incomeChange > 0 ? (
                      <div className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/80 rounded-full text-green-700 dark:text-green-300">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">
                          +{incomeChange.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900/80 rounded-full text-yellow-700 dark:text-yellow-300">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">
                          {incomeChange.toFixed(1)}%
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center px-2 py-1 bg-blue-50 dark:bg-blue-900/80 rounded-full text-blue-700 dark:text-blue-300">
                      <span className="text-xs font-medium">
                        This month: {formatCurrency(currentMonthIncome)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 relative group dark:bg-slate-900/90">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-200 via-red-100 to-white dark:from-rose-900/70 dark:via-red-900/60 dark:to-slate-900/90 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
              <TrendingDown className="h-32 w-32 text-red-500 dark:text-red-400 -rotate-12" />
            </div>
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-300 to-red-500 dark:from-red-400 dark:to-red-600 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
            <CardHeader className="pb-2 relative">
              <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2 text-red-700 dark:text-red-300">
                <CreditCard className="h-5 w-5" />
                Total Expenses
              </CardTitle>
              <CardDescription className="text-red-600/80 dark:text-red-400/90">
                All-time spending & costs
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 relative z-10">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-white dark:bg-slate-800/90 shadow-inner p-3 mr-3 ring-2 ring-red-100 dark:ring-red-500/30 group-hover:ring-red-200 dark:group-hover:ring-red-500/50 transition-all">
                  <CreditCard className="h-8 w-8 text-red-600 dark:text-red-300" />
                </div>
                <div>
                  <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-rose-500 dark:from-red-300 dark:to-rose-300">
                    {formatCurrency(totalExpenses)}
                  </span>
                  <div className="flex items-center mt-1 text-sm text-muted-foreground dark:text-slate-300">
                    <span className="text-xs mr-1">This month:</span>
                    <span className="font-medium text-red-600 dark:text-red-300">
                      {formatCurrency(currentMonthExpenses)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center bg-white/50 dark:bg-slate-800/70 backdrop-blur-sm rounded-lg p-2 shadow-sm border border-red-100 dark:border-red-500/30">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-red-800 dark:text-red-300 mr-1">
                    Trend:
                  </span>
                </div>
                <div className="flex items-center">
                  {lastMonthExpenses > 0 ? (
                    expenseChange > 0 ? (
                      <div className="flex items-center px-2 py-1 bg-red-100 dark:bg-red-900/80 rounded-full text-red-700 dark:text-red-300">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">
                          +{expenseChange.toFixed(1)}%
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/80 rounded-full text-green-700 dark:text-green-300">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium">
                          {Math.abs(expenseChange).toFixed(1)}%
                        </span>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center px-2 py-1 bg-red-50 dark:bg-red-900/80 rounded-full text-red-700 dark:text-red-300">
                      <span className="text-xs font-medium">
                        This month: {formatCurrency(currentMonthExpenses)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {accounts.length > 0 &&
            accounts?.map((account, index) => (
              <div 
                key={account.id}
                className="animate-in fade-in slide-in-from-bottom-5 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <AccountCard 
                  account={account} 
                  onDelete={handleAccountDelete} 
                  onDefaultChanged={handleDefaultChanged}
                />
              </div>
            ))}
          <CreateAccountDrawer onAccountCreated={handleAccountCreated}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed dark:bg-slate-900 dark:border-slate-700">
              <CardContent className="flex flex-col items-center justify-center text-muted-foreground dark:text-slate-400 h-full pt-5">
                <Plus className="h-10 w-10 mb-2" />
                <p className="text-sm font-medium">Add New Account</p>
              </CardContent>
            </Card>
          </CreateAccountDrawer>
        </div>
      </div>
      <FinancialGoalsCard />
      <BudgetSetterCard currentBudgets={budgets} onSaveBudget={saveBudget} />
      <FinanceTipsCard
        expenses={currentMonthExpenses}
        budget={0}
        accountBalance={accountBalance}
        income={currentMonthIncome}
        initialTips={financeTips}
      />
      <div className="space-y-6">
        <DashboardOverview 
          key={`transaction-overview-${updateKey}`}
          accounts={accounts} 
          transactions={transactions}
          updateKey={updateKey} 
        />
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryCardClient
            type="EXPENSE"
            accounts={accounts}
            transactions={transactions}
            totalAmount={totalExpenses}
            sortedCategories={sortedExpenseCategories}
            categoryData={categoryData}
          />
          <CategoryCardClient
            type="INCOME"
            accounts={accounts}
            transactions={transactions}
            totalAmount={totalIncome}
            sortedCategories={sortedIncomeCategories}
            categoryData={categoryData}
          />
        </div>
      </div>
    </div>
  );
}