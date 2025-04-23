"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  PieChartIcon, 
  BarChartIcon, 
  LineChartIcon,
  // Category icons
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Plane,
  HeartPulse, 
  Gamepad2, 
  GraduationCap,
  Laptop, 
  Shirt, 
  Coffee, 
  Banknote,
  Briefcase, 
  Gift, 
  Wallet, 
  CreditCard,
  Receipt,
  Building,
  Bus,
  Train,
  Bike,
  Wifi,
  Smartphone,
  CircleDollarSign,
  Tag
} from "lucide-react";
import {
  Line,
  Bar,
} from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartJSTooltip, Legend as ChartJSLegend } from 'chart.js';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/contexts/currency-context";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartJSTooltip,
  ChartJSLegend
);

// Add category icon mapping
const CATEGORY_ICONS = {
  // Common expense categories
  "shopping": ShoppingBag,
  "groceries": ShoppingBag,
  "food": Utensils,
  "dining": Utensils,
  "restaurants": Utensils,
  "housing": Home,
  "rent": Home,
  "mortgage": Home,
  "utilities": Home,
  "transportation": Car,
  "car": Car,
  "fuel": Car,
  "travel": Plane,
  "healthcare": HeartPulse,
  "medical": HeartPulse,
  "entertainment": Gamepad2,
  "education": GraduationCap,
  "technology": Laptop,
  "clothing": Shirt,
  "coffee": Coffee,
  "subscriptions": Wifi,
  "phone": Smartphone,
  "internet": Wifi,
  "insurance": Building,
  "public transport": Bus,
  "train": Train,
  "bike": Bike,
  
  // Common income categories
  "salary": Briefcase,
  "income": Banknote,
  "gift": Gift,
  "refund": Wallet,
  "investment": CreditCard,
  "dividends": CircleDollarSign,
  
  // Default
  "default": Tag
};

// Function to get the correct icon for a category
const getCategoryIcon = (category) => {
  if (!category) return CATEGORY_ICONS.default;
  
  // Convert to lowercase for case-insensitive matching
  const lowerCategory = category.toLowerCase();
  
  // Check if the category exists exactly
  if (CATEGORY_ICONS[lowerCategory]) {
    return CATEGORY_ICONS[lowerCategory];
  }
  
  // Check if any key is contained within the category string
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (lowerCategory.includes(key)) {
      return CATEGORY_ICONS[key];
    }
  }
  
  // Return default icon if no match found
  return CATEGORY_ICONS.default;
};

const COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
  "#D4A5A5",
  "#9FA8DA",
];

// Update the CustomLegend component to use formatCurrency
const CustomLegend = ({ data, isDarkMode, formatCurrency }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 pt-2">
      {data.map((entry, index) => (
        <div 
          key={`legend-${index}`} 
          className={`flex items-center rounded-md px-1.5 py-0.5 border shadow-sm ${
            isDarkMode 
              ? 'bg-slate-800/80 border-slate-700/30' 
              : 'bg-background/80 backdrop-blur-sm border-border/30'
          }`}
        >
          <div 
            className="w-2.5 h-2.5 rounded-full mr-1.5" 
            style={{ backgroundColor: COLORS[index % COLORS.length] }}
          />
          <span className={`text-[10px] sm:text-xs whitespace-nowrap ${
            isDarkMode ? 'text-slate-200' : ''
          }`}>
            {entry.name}: {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function DashboardOverview({ accounts, transactions, updateKey = 0 }) {
  const { formatCurrency } = useCurrency();
  
  // Add explicit state for forcing updates on charts and transaction lists
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Add state for tracking transaction count to detect changes
  const [prevTransactionCount, setPrevTransactionCount] = useState(0);
  
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );
  const [chartType, setChartType] = useState("pie");
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // First day of current month
    return date;
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    // Set to last day of current month
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay;
  });
  const [showChartOptions, setShowChartOptions] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Detect dark mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're in dark mode
      const checkDarkMode = () => {
        const isDark = document.documentElement.classList.contains('dark');
        setIsDarkMode(isDark);
      };
      
      // Initial check
      checkDarkMode();
      
      // Set up observer to detect theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            checkDarkMode();
          }
        });
      });
      
      observer.observe(document.documentElement, { attributes: true });
      return () => observer.disconnect();
    }
  }, []);

  const handleChartTypeChange = (value) => {
    setChartType(value);
    setShowChartOptions(false);
  };

  // Critical useEffect to detect transaction changes
  useEffect(() => {
    // Only trigger if we have transactions and they've changed in count
    if (transactions && transactions.length !== prevTransactionCount) {
      console.log("Transaction count changed:", {
        prev: prevTransactionCount,
        current: transactions.length
      });
      
      // Update our count tracking
      setPrevTransactionCount(transactions.length);
      
      // Force component to re-render with new data
      setForceUpdate(prev => prev + 1);
    }
  }, [transactions, transactions?.length, prevTransactionCount, updateKey]);

  // Use useMemo with direct dependency on forceUpdate for filtered transactions
  const accountTransactions = useMemo(() => {
    console.log("Recalculating account transactions", {
      accountId: selectedAccountId,
      transactionCount: transactions?.length || 0,
      forceUpdate
    });
    
    return transactions.filter(
      (t) =>
        t.accountId === selectedAccountId &&
        new Date(t.date) >= startDate &&
        new Date(t.date) <= endDate
    );
  }, [transactions, selectedAccountId, startDate, endDate, forceUpdate]);

  // Critical: Add debugging log and recalculate recentTransactions with extra key dependencies
  const recentTransactions = useMemo(() => {
    console.log("Recalculating recent transactions", {
      accountTransactionsCount: accountTransactions?.length || 0,
      forceUpdate,
      updateKey
    });
    
    // Create a fresh copy of the array, sort it by date descending, and take the 5 most recent
    const sorted = [...(accountTransactions || [])]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    console.log("New recent transactions:", sorted.length);
    return sorted;
  }, [accountTransactions, forceUpdate, updateKey]);

  const pieChartData = useMemo(() => {
    const expensesByCategory = accountTransactions.reduce((acc, transaction) => {
      if (transaction.type === "EXPENSE") {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += transaction.amount;
      }
      return acc;
    }, {});

    return Object.entries(expensesByCategory).map(
      ([category, amount]) => ({
        name: category,
        value: amount,
      })
    );
  }, [accountTransactions, forceUpdate]);

  const chartData = useMemo(() => {
    const sortedTransactions = [...accountTransactions].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  
    const transactionsByDate = sortedTransactions.reduce((acc, transaction) => {
      const dateStr = format(new Date(transaction.date), "yyyy-MM-dd");
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          expense: 0,
          income: 0
        };
      }
      
      if (transaction.type === "EXPENSE") {
        acc[dateStr].expense += transaction.amount;
      } else if (transaction.type === "INCOME") {
        acc[dateStr].income += transaction.amount;
      }
      
      return acc;
    }, {});
  
    const lineChartData = Object.values(transactionsByDate).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
  
    const formattedLineChartData = lineChartData.map(item => ({
      ...item,
      displayDate: format(new Date(item.date), "dd MMM")
    }));
  
    return {
      labels: formattedLineChartData.map((data) => data.displayDate),
      datasets: [
        {
          label: "Expenses",
          data: formattedLineChartData.map((data) => data.expense),
          borderColor: "#FF6B6B",
          backgroundColor: "rgba(255, 107, 107, 0.5)",
          borderWidth: 2,
        },
        {
          label: "Incomes",
          data: formattedLineChartData.map((data) => data.income),
          borderColor: "#4ECDC4",
          backgroundColor: "rgba(78, 205, 196, 0.5)",
          borderWidth: 2,
        },
      ],
    };
  }, [accountTransactions, forceUpdate]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDarkMode ? "#e2e8f0" : undefined, // Use slate-200 in dark mode for legend text
        }
      },
      title: {
        display: true,
        text: "Monthly Expense Breakdown",
        color: isDarkMode ? "#e2e8f0" : undefined, // Use slate-200 in dark mode for title text
      },
      tooltip: {
        backgroundColor: isDarkMode ? "#1e293b" : undefined, // slate-800 for dark mode tooltips
        titleColor: isDarkMode ? "#e2e8f0" : undefined,
        bodyColor: isDarkMode ? "#e2e8f0" : undefined,
        borderColor: isDarkMode ? "#475569" : undefined,
        borderWidth: isDarkMode ? 1 : 0,
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? "rgba(148, 163, 184, 0.1)" : undefined, // slate-400 with low opacity for grid
        },
        ticks: {
          color: isDarkMode ? "#94a3b8" : undefined, // slate-400 for axis ticks
        }
      },
      y: {
        grid: {
          color: isDarkMode ? "rgba(148, 163, 184, 0.1)" : undefined,
        },
        ticks: {
          color: isDarkMode ? "#94a3b8" : undefined,
        }
      }
    }
  };

  const chartTypes = [
    { value: "pie", label: "Pie Chart", icon: PieChartIcon },
    { value: "line", label: "Line Chart", icon: LineChartIcon },
    { value: "bar", label: "Bar Chart", icon: BarChartIcon },
  ];

  const currentChartType = chartTypes.find(type => type.value === chartType);
  const ChartIcon = currentChartType ? currentChartType.icon : PieChartIcon;

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, value, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    if (percent < 0.08) return null;
  
    return (
      <text 
        x={x} 
        y={y} 
        fill={isDarkMode ? "#e2e8f0" : "#333333"} // Use slate-200 in dark mode for labels
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 sm:grid-cols-1">
      {/* Recent Transactions Card - Premium Redesign */}
      <Card className="overflow-hidden border-0 shadow-xl transition-all duration-300 relative group dark:bg-slate-900">
        {/* Premium gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/5 rounded-full transform translate-x-16 -translate-y-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-500/10 to-indigo-400/5 rounded-full transform -translate-x-20 translate-y-16 blur-2xl"></div>
            
        {/* Decorative dots and lines */}
        <div className="absolute top-0 left-0 right-0 h-64 overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute top-12 right-4 h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
          <div className="absolute top-20 right-10 h-1 w-1 rounded-full bg-purple-500"></div>
          <div className="absolute top-16 right-16 h-2 w-2 rounded-full bg-indigo-300"></div>
          <div className="absolute top-28 right-20 h-1 w-1 rounded-full bg-purple-400"></div>
          <div className="absolute top-4 left-12 h-1.5 w-1.5 rounded-full bg-indigo-400"></div>
          <div className="absolute top-10 left-20 h-1 w-1 rounded-full bg-purple-500"></div>
          <div className="absolute top-20 left-8 h-2 w-2 rounded-full bg-indigo-300"></div>
        </div>
            
        {/* Accent bar at top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-1 w-1/3 bg-gradient-to-r from-indigo-500 via-purple-400 to-indigo-500 rounded-b-lg"></div>
            
        <CardHeader className="relative z-10 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0 pb-4 pt-5">
          <div>
            <CardTitle className="text-lg sm:text-xl font-semibold flex items-center gap-2 text-gray-800 dark:text-white">
              <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md text-white shadow-sm">
                <Receipt className="h-5 w-5" />
              </div>
              Recent Transactions
            </CardTitle>
            <p className="text-sm text-indigo-600/80 dark:text-indigo-400/80 mt-1">
              Track your latest financial activities
            </p>
          </div>
          <Select
            value={selectedAccountId}
            onValueChange={setSelectedAccountId}
          >
            <SelectTrigger className="w-full md:w-[160px] bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-200">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 z-[200]">
              {accounts.map((account) => (
                <SelectItem key={account.id} value={account.id} className="dark:text-white dark:focus:bg-slate-700 dark:hover:bg-slate-700">
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="relative z-10 pt-0">
          {recentTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center bg-white/70 dark:bg-slate-800/70 rounded-lg border border-dashed border-indigo-200/80 dark:border-indigo-800/50 shadow-sm">
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="relative rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 p-3 mb-3 shadow-lg">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white mt-3">No recent transactions</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md">
                Transactions for this account will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4 p-1" key={`recent-transactions-list-${forceUpdate}-${updateKey}`}>
              {recentTransactions.map((transaction, index) => {
                const CategoryIcon = getCategoryIcon(transaction.category);
                const isExpense = transaction.type === "EXPENSE";
                const formattedDate = format(new Date(transaction.date), "PP");
                
                return (
                  <div
                    key={`transaction-${transaction.id}-${forceUpdate}-${updateKey}`}
                    className="group/item flex items-center justify-between p-3 rounded-xl transition-all duration-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        isExpense 
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-500 dark:text-rose-400' 
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 dark:text-emerald-400'
                      } transition-all duration-300 group-hover/item:scale-110`}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none dark:text-white group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors duration-200">
                          {transaction.description || "Untitled Transaction"}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-muted-foreground dark:text-slate-400 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 mr-1 opacity-70">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
                            </svg>
                            {formattedDate}
                          </p>
                          {transaction.category && (
                            <span className="rounded-full bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50">
                              {transaction.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex items-center font-medium text-sm group-hover/item:scale-105 transition-all duration-300",
                          isExpense
                            ? "text-rose-500 dark:text-rose-400"
                            : "text-emerald-500 dark:text-emerald-400"
                        )}
                      >
                        {isExpense ? (
                          <ArrowDownRight className="mr-1 h-4 w-4" />
                        ) : (
                          <ArrowUpRight className="mr-1 h-4 w-4" />
                        )}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* View all transactions link */}
              <div className="flex justify-center pt-1 mt-3 border-t border-indigo-100 dark:border-indigo-900/50">
                <button className="text-sm text-indigo-600 dark:text-indigo-400 font-medium flex items-center py-1.5 px-3 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                  View all transactions
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 ml-1 opacity-70">
                    <path fillRule="evenodd" d="M2 10a.75.75 0 01.75-.75h12.59l-2.1-1.95a.75.75 0 111.02-1.1l3.5 3.25a.75.75 0 010 1.1l-3.5 3.25a.75.75 0 11-1.02-1.1l2.1-1.95H2.75A.75.75 0 012 10z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expense Breakdown Card */}
      <Card className="dark:bg-slate-900 dark:border-slate-800">
        <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <CardTitle className="text-base font-normal dark:text-white">
            Monthly Expense Breakdown
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              className="border rounded px-2 py-1 w-full md:w-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              dateFormat="MMM d, yyyy"
            />
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              className="border rounded px-2 py-1 w-full md:w-auto bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
              dateFormat="MMM d, yyyy"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-2 pb-6">
          {pieChartData.length === 0 ? (
            <p className="text-center text-muted-foreground dark:text-slate-400 py-4">
              No expenses this month
            </p>
          ) : (
            <div className="h-[340px] sm:h-[300px] relative">
              <ResponsiveContainer 
                width="100%" 
                height={chartType === "pie" ? "85%" : "100%"}
                key={`chart-container-${forceUpdate}`}
              >
                {chartType === "pie" ? (
                  <PieChart key={`pie-chart-${forceUpdate}`}>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%" 
                      outerRadius={70} 
                      fill="#8884d8"
                      dataKey="value"
                      labelLine={false}
                      label={window.innerWidth > 640 ? renderCustomizedLabel : null}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}-${forceUpdate}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: isDarkMode 
                          ? "hsl(217, 33%, 17%)" 
                          : "hsl(var(--popover))",
                        border: isDarkMode 
                          ? "1px solid hsl(215, 25%, 27%)" 
                          : "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                        color: isDarkMode 
                          ? "hsl(214, 32%, 91%)" 
                          : "hsl(var(--popover-foreground))"
                      }}
                    />
                  </PieChart>
                ) : chartType === "line" ? (
                  <Line data={chartData} options={options} key={`line-chart-${forceUpdate}`} />
                ) : (
                  <Bar data={chartData} options={options} key={`bar-chart-${forceUpdate}`} />
                )}
              </ResponsiveContainer>
              
              {chartType === "pie" && (
                <div className="absolute bottom-2 left-0 w-full px-2">
                  <CustomLegend 
                    data={pieChartData} 
                    isDarkMode={isDarkMode}
                    formatCurrency={formatCurrency} 
                  />
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-center items-center mt-6 pt-4 border-t dark:border-slate-700">
            <div className="relative inline-block">
              <button
                onClick={() => setShowChartOptions(!showChartOptions)}
                className="flex items-center justify-between w-[220px] px-4 py-2.5 text-sm font-medium border rounded-md bg-background dark:bg-slate-800 dark:border-slate-700 dark:text-white hover:bg-accent hover:text-accent-foreground dark:hover:bg-slate-700 shadow-sm transition-colors"
              >
                <div className="flex items-center">
                  <ChartIcon className="mr-2 h-5 w-5" />
                  <span className="font-medium">{currentChartType?.label}</span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="ml-2 h-4 w-4 opacity-50"
                >
                  {showChartOptions ? (
                    <path d="m18 15-6-6-6 6" />
                  ) : (
                    <path d="m6 9 6 6 6-6" />
                  )}
                </svg>
              </button>
              
              {showChartOptions && (
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10 w-[220px] mt-1 rounded-md border bg-popover dark:bg-slate-800 dark:border-slate-700 p-1 text-popover-foreground dark:text-white shadow-md">
                  <div className="overflow-hidden py-1">
                    {chartTypes.map((type) => {
                      const TypeIcon = type.icon;
                      return (
                        <button
                          key={type.value}
                          className={`flex w-full items-center rounded-sm px-3 py-2 text-sm hover:bg-accent dark:hover:bg-slate-700 hover:text-accent-foreground transition-colors ${
                            chartType === type.value ? 'bg-accent dark:bg-slate-700 text-accent-foreground' : ''
                          }`}
                          onClick={() => handleChartTypeChange(type.value)}
                        >
                          <TypeIcon className="mr-2 h-5 w-5" />
                          <span>{type.label}</span>
                          {chartType === type.value && (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="ml-auto h-4 w-4"
                            >
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          background-color: white;
          border-color: #e2e8f0;
        }
        
        .react-datepicker__header {
          background-color: #f8fafc;
          border-bottom-color: #e2e8f0;
        }
        
        .react-datepicker__current-month,
        .react-datepicker__day-name,
        .react-datepicker__day {
          color: #334155;
        }
        
        .react-datepicker__day:hover {
          background-color: #f1f5f9;
        }
        
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6;
          color: white;
        }
        
        .react-datepicker__day--outside-month {
          color: #94a3b8;
        }
        
        .react-datepicker__triangle::before,
        .react-datepicker__triangle::after {
          border-bottom-color: #f8fafc;
        }
        
        .react-datepicker__navigation-icon::before {
          border-color: #64748b;
        }
        
        .react-datepicker__navigation:hover *::before {
          border-color: #334155;
        }
        
        .dark .react-datepicker {
          background-color: #1e293b;
          border-color: #334155;
        }
        
        .dark .react-datepicker__header {
          background-color: #0f172a;
          border-bottom-color: #334155;
        }
        
        .dark .react-datepicker__current-month,
        .dark .react-datepicker__day-name,
        .dark .react-datepicker__day {
          color: #e2e8f0;
        }
        
        .dark .react-datepicker__day:hover {
          background-color: #334155;
        }
        
        .dark .react-datepicker__day--selected,
        .dark .react-datepicker__day--keyboard-selected {
          background-color: #3b82f6;
          color: white;
        }
        
        .dark .react-datepicker__day--outside-month {
          color: #64748b;
        }
        
        .dark .react-datepicker__triangle::before,
        .dark .react-datepicker__triangle::after {
          border-bottom-color: #0f172a !important;
        }
        
        .dark .react-datepicker__navigation-icon::before {
          border-color: #94a3b8;
        }
        
        .dark .react-datepicker__navigation:hover *::before {
          border-color: #e2e8f0;
        }
        
        .react-datepicker-popper {
          z-index: 40;
        }
        
        .react-datepicker-wrapper,
        .react-datepicker__input-container {
          display: block;
          width: 100%;
          background-color: transparent;
        }
        
        .react-datepicker__input-container input {
          background-color: white;
        }
        
        .dark .react-datepicker__input-container input {
          background-color: #1e293b;
        }
      `}</style>
    </div>
  );
}