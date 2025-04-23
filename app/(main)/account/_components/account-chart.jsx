"use client";

import { useState, useMemo } from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ChevronDown, BarChart, LineChart, PieChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  "ALL": { label: "All Time", days: null },
  "CUSTOM": { label: "Custom Range", days: null },
};

const CHART_TYPES = [
  { id: "bar", name: "Bar Chart", icon: BarChart },
  { id: "line", name: "Line Chart", icon: LineChart },
  { id: "pie", name: "Pie Chart", icon: PieChart },
];

const COLORS = [
  "#22c55e", // green for income
  "#ef4444", // red for expense
  "#3b82f6", // blue
  "#a855f7", // purple
  "#f97316", // orange
  "#06b6d4", // cyan
];

export function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("1M");
  const [customStartDate, setCustomStartDate] = useState(subDays(new Date(), 30));
  const [customEndDate, setCustomEndDate] = useState(new Date());
  const [chartType, setChartType] = useState("bar");
  const [showChartOptions, setShowChartOptions] = useState(false);

  const handleDateRangeChange = (value) => {
    setDateRange(value);
  };

  const handleChartTypeChange = (value) => {
    setChartType(value);
    setShowChartOptions(false);
  };
  
  // Get the current chart type icon
  const CurrentChartIcon = CHART_TYPES.find(type => type.id === chartType)?.icon || BarChart;

  const filteredData = useMemo(() => {
    const now = new Date();
    let startDate;
    let endDate = endOfDay(now);
    
    if (dateRange === "CUSTOM") {
      startDate = startOfDay(customStartDate);
      endDate = endOfDay(customEndDate);
    } else {
      const range = DATE_RANGES[dateRange];
      startDate = range.days
        ? startOfDay(subDays(now, range.days))
        : startOfDay(new Date(0));
    }

    // Filter transactions within date range
    const filtered = transactions.filter(
      (t) => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      }
    );

    // Group transactions by date
    const grouped = filtered.reduce((acc, transaction) => {
      // Format based on selected range to avoid overcrowding X-axis
      let dateFormat = "MMM dd";
      if (dateRange === "3M" || dateRange === "6M") {
        dateFormat = "MMM dd";
      } else if (dateRange === "ALL") {
        dateFormat = "MMM yyyy";
      } else if (dateRange === "CUSTOM") {
        // If date range is more than 60 days, show month only
        const dayDiff = Math.abs((customEndDate - customStartDate) / (1000 * 60 * 60 * 24));
        dateFormat = dayDiff > 60 ? "MMM yyyy" : "MMM dd";
      }
      
      const date = format(new Date(transaction.date), dateFormat);
      
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    // Convert to array and sort by date
    return Object.values(grouped).sort(
      (a, b) => {
        // Sort by actual date, not by the formatted string
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA - dateB;
      }
    );
  }, [transactions, dateRange, customStartDate, customEndDate]);

  // Calculate totals for the selected period
  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  // Prepare data for pie chart - combine all income and expense
  const pieChartData = useMemo(() => {
    if (chartType !== "pie") return [];

    return [
      { name: "Income", value: totals.income },
      { name: "Expense", value: totals.expense },
    ];
  }, [totals, chartType]);

  return (
    <Card className="dark:bg-slate-900 dark:border-slate-800">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 pb-4">
        <CardTitle className="text-base font-normal dark:text-slate-200">
          Transaction Overview
        </CardTitle>
        <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={handleDateRangeChange}>
              <SelectTrigger className="w-[180px] dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                <SelectValue>{DATE_RANGES[dateRange].label}</SelectValue>
              </SelectTrigger>
              <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                {Object.entries(DATE_RANGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key} className="dark:text-slate-200 dark:hover:bg-slate-800">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Chart Type Selector */}
            <Popover open={showChartOptions} onOpenChange={setShowChartOptions}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={showChartOptions}
                  className="w-[150px] justify-between dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center">
                    <CurrentChartIcon className="mr-2 h-4 w-4" />
                    <span>
                      {CHART_TYPES.find((type) => type.id === chartType)?.name || "Bar Chart"}
                    </span>
                  </div>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[150px] p-0 dark:bg-slate-900 dark:border-slate-700">
                <div className="flex flex-col py-1.5">
                  {CHART_TYPES.map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.id}
                        variant={chartType === type.id ? "secondary" : "ghost"}
                        className={`justify-start px-3 py-1.5 text-sm ${
                          chartType === type.id 
                            ? "dark:bg-slate-800 dark:text-slate-200" 
                            : "dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                        onClick={() => handleChartTypeChange(type.id)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {type.name}
                      </Button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {dateRange === "CUSTOM" && (
            <div className="flex flex-wrap gap-2 items-center mt-2 md:mt-0">
              <div>
                <DatePicker
                  selected={customStartDate}
                  onChange={(date) => setCustomStartDate(date)}
                  selectsStart
                  startDate={customStartDate}
                  endDate={customEndDate}
                  maxDate={customEndDate}
                  dateFormat="MMM d, yyyy"
                  className="w-[130px] border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  wrapperClassName="date-picker-wrapper"
                />
              </div>
              <span className="text-sm text-muted-foreground dark:text-slate-400">to</span>
              <div>
                <DatePicker
                  selected={customEndDate}
                  onChange={(date) => setCustomEndDate(date)}
                  selectsEnd
                  startDate={customStartDate}
                  endDate={customEndDate}
                  minDate={customStartDate}
                  maxDate={new Date()}
                  dateFormat="MMM d, yyyy"
                  className="w-[130px] border rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  wrapperClassName="date-picker-wrapper"
                />
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-6 text-sm dark:text-slate-200">
          <div className="text-center">
            <p className="text-muted-foreground dark:text-slate-400">Total Income</p>
            <p className="text-lg font-bold text-green-500 dark:text-green-400">
              ${totals.income.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground dark:text-slate-400">Total Expenses</p>
            <p className="text-lg font-bold text-red-500 dark:text-red-400">
              ${totals.expense.toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground dark:text-slate-400">Net</p>
            <p
              className={`text-lg font-bold ${
                totals.income - totals.expense >= 0
                  ? "text-green-500 dark:text-green-400"
                  : "text-red-500 dark:text-red-400"
              }`}
            >
              ${(totals.income - totals.expense).toFixed(2)}
            </p>
          </div>
        </div>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <RechartsBarChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={filteredData.length > 20 ? -45 : 0}
                  textAnchor={filteredData.length > 20 ? "end" : "middle"}
                  height={60}
                  tick={{ fill: '#94a3b8' }} // slate-400 equivalent
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: '#94a3b8' }} // slate-400 equivalent
                />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
                  contentStyle={{
                    backgroundColor: "#1e293b", // slate-800
                    border: "1px solid #334155", // slate-700
                    borderRadius: "0.5rem",
                    color: "#e2e8f0", // slate-200
                  }}
                  labelStyle={{ color: "#e2e8f0" }} // slate-200
                />
                <Legend
                  wrapperStyle={{ color: '#e2e8f0' }} // slate-200
                />
                <Bar
                  dataKey="income"
                  name="Income"
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="expense"
                  name="Expense"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
            ) : chartType === "line" ? (
              <RechartsLineChart
                data={filteredData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                <XAxis
                  dataKey="date"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  angle={filteredData.length > 20 ? -45 : 0}
                  textAnchor={filteredData.length > 20 ? "end" : "middle"}
                  height={60}
                  tick={{ fill: '#94a3b8' }} // slate-400 equivalent
                />
                <YAxis
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: '#94a3b8' }} // slate-400 equivalent
                />
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
                  contentStyle={{
                    backgroundColor: "#1e293b", // slate-800
                    border: "1px solid #334155", // slate-700
                    borderRadius: "0.5rem",
                    color: "#e2e8f0", // slate-200
                  }}
                  labelStyle={{ color: "#e2e8f0" }} // slate-200
                />
                <Legend 
                  wrapperStyle={{ color: '#e2e8f0' }} // slate-200
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#4ade80" // green-400 for better visibility in dark mode
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  name="Expense"
                  stroke="#f87171" // red-400 for better visibility in dark mode
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </RechartsLineChart>
            ) : (
              <RechartsPieChart margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <Tooltip
                  formatter={(value) => [`$${value.toFixed(2)}`, undefined]}
                  contentStyle={{
                    backgroundColor: "#1e293b", // slate-800
                    border: "1px solid #334155", // slate-700
                    borderRadius: "0.5rem",
                    color: "#e2e8f0", // slate-200
                  }}
                  labelStyle={{ color: "#e2e8f0" }} // slate-200
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  wrapperStyle={{ color: '#e2e8f0' }} // slate-200
                />
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </RechartsPieChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}