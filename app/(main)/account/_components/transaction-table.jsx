"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  Filter,
  ArrowDownUp,
  Bookmark,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function TransactionTable({ transactions }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [recurringFilter, setRecurringFilter] = useState("ALL");
  const [categoryFilters, setCategoryFilters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const router = useRouter();

  // Extract unique categories from transactions
  const availableCategories = useMemo(() => {
    const categories = new Set();
    transactions.forEach(transaction => {
      if (transaction.category) {
        categories.add(transaction.category);
      }
    });
    return Array.from(categories).sort();
  }, [transactions]);

  // Memoized filtered and sorted transactions
  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transaction) =>
        transaction.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply type filter
    if (typeFilter && typeFilter !== "ALL") {
      result = result.filter((transaction) => transaction.type === typeFilter);
    }

    // Apply category filters
    if (categoryFilters.length > 0) {
      result = result.filter((transaction) => 
        categoryFilters.includes(transaction.category)
      );
    }

    // Apply recurring filter
    if (recurringFilter && recurringFilter !== "ALL") {
      result = result.filter((transaction) => {
        if (recurringFilter === "recurring") return transaction.isRecurring;
        return !transaction.isRecurring;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, categoryFilters, sortConfig]);

  // Pagination calculations
  const totalPages = Math.ceil(
    filteredAndSortedTransactions.length / ITEMS_PER_PAGE
  );
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(
      startIndex,
      startIndex + ITEMS_PER_PAGE
    );
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length
        ? []
        : paginatedTransactions.map((t) => t.id)
    );
  };

  const toggleCategoryFilter = (category) => {
    setCategoryFilters((current) =>
      current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    );
    setCurrentPage(1);
  };

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
    )
      return;

    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions deleted successfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("ALL");
    setRecurringFilter("ALL");
    setCategoryFilters([]);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]); // Clear selections on page change
  };

  // Count active filters
  const activeFiltersCount = [
    searchTerm ? 1 : 0,
    typeFilter !== "ALL" ? 1 : 0,
    recurringFilter !== "ALL" ? 1 : 0,
    categoryFilters.length
  ].reduce((sum, val) => sum + val, 0);

  return (
    <div className="space-y-5">
      {deleteLoading && (
        <div className="relative h-1">
          <BarLoader className="absolute inset-0" width={"100%"} color="#9333ea" />
        </div>
      )}
      
      {/* Premium Search and Filters Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 h-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus-visible:ring-purple-500"
          />
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter Button with Active Count Badge */}
          <Button 
            variant="outline" 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={cn(
              "relative gap-2 transition-all duration-200 px-4 h-10",
              isFiltersOpen ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800" : "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            )}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
          
          {/* Sort Button */}
          <Button 
            variant="outline" 
            className="gap-2 h-10 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
            onClick={() => handleSort(sortConfig.field)}
          >
            <ArrowDownUp className="h-4 w-4" />
            <span className="hidden sm:inline">Sort</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize hidden sm:inline">
              ({sortConfig.field}, {sortConfig.direction})
            </span>
          </Button>

          {/* Bulk Actions */}
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleBulkDelete}
              className="gap-2 h-10 ml-auto dark:bg-rose-800 dark:hover:bg-rose-700 dark:text-white"
            >
              <Trash className="h-4 w-4" />
              <span>Delete {selectedIds.length}</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Expanded Filters Section */}
      {isFiltersOpen && (
        <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm p-4 rounded-lg border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm animate-in fade-in-50 slide-in-from-top-5 duration-300">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1.5 text-slate-500 dark:text-slate-400">
                Transaction Type
              </label>
              <Select
                value={typeFilter}
                onValueChange={(value) => {
                  setTypeFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-9 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                  <SelectItem value="ALL" className="dark:text-slate-200">All Types</SelectItem>
                  <SelectItem value="INCOME" className="dark:text-slate-200">Income</SelectItem>
                  <SelectItem value="EXPENSE" className="dark:text-slate-200">Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1.5 text-slate-500 dark:text-slate-400">
                Recurrence
              </label>
              <Select
                value={recurringFilter}
                onValueChange={(value) => {
                  setRecurringFilter(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-[160px] h-9 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200">
                  <SelectValue placeholder="All Transactions" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900 dark:border-slate-700">
                  <SelectItem value="ALL" className="dark:text-slate-200">All Transactions</SelectItem>
                  <SelectItem value="recurring" className="dark:text-slate-200">Recurring Only</SelectItem>
                  <SelectItem value="non-recurring" className="dark:text-slate-200">Non-recurring Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="flex flex-col">
              <label className="text-xs font-medium mb-1.5 text-slate-500 dark:text-slate-400">
                Categories
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline"
                    role="combobox"
                    className="w-[160px] h-9 justify-between dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <span className="truncate">
                      {categoryFilters.length > 0 
                        ? `${categoryFilters.length} Selected` 
                        : "All Categories"}
                    </span>
                    <ChevronDown className="ml-1 h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[240px] p-3 max-h-[300px] overflow-auto dark:bg-slate-900 dark:border-slate-700">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center pb-1.5 mb-1 border-b dark:border-slate-700">
                      <h4 className="font-medium text-sm dark:text-slate-200">Select Categories</h4>
                      {categoryFilters.length > 0 && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                          onClick={() => setCategoryFilters([])}
                        >
                          Clear all
                        </Button>
                      )}
                    </div>
                    {availableCategories.length === 0 ? (
                      <div className="text-sm text-muted-foreground dark:text-slate-400 text-center py-2">No categories available</div>
                    ) : (
                      <div className="grid grid-cols-1 gap-1.5">
                        {availableCategories.map((category) => (
                          <div key={category} 
                            className={cn(
                              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors",
                              categoryFilters.includes(category) 
                                ? "bg-purple-50 dark:bg-purple-900/20" 
                                : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                            )}
                            onClick={() => toggleCategoryFilter(category)}
                          >
                            <Checkbox 
                              id={`category-${category}`}
                              checked={categoryFilters.includes(category)}
                              className={cn(
                                "rounded-sm",
                                categoryFilters.includes(category) ? "border-purple-500 text-purple-500" : "dark:border-slate-600"
                              )}
                            />
                            <div 
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: categoryColors[category] || "#888" }}
                            />
                            <label
                              htmlFor={`category-${category}`}
                              className="flex-1 text-sm capitalize cursor-pointer dark:text-slate-200"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="ml-auto text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4 mr-1" />
                Clear filters
              </Button>
            )}
          </div>
          
          {/* Category Filter Chips */}
          {categoryFilters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {categoryFilters.map(category => (
                <Badge 
                  key={category} 
                  className="gap-1 pl-1.5 pr-1 py-0.5 cursor-pointer transition-all hover:pl-2 hover:pr-1.5" 
                  variant="outline"
                  style={{
                    backgroundColor: `${categoryColors[category]}15`, // Add transparency
                    borderColor: categoryColors[category],
                  }}
                  onClick={() => toggleCategoryFilter(category)}
                >
                  <div 
                    className="h-2 w-2 rounded-full mr-1" 
                    style={{ backgroundColor: categoryColors[category] }}
                  />
                  <span className="capitalize dark:text-slate-200 text-xs">{category}</span>
                  <X className="h-3 w-3 ml-0.5" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enhanced Premium Transactions Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
              <TableRow className="hover:bg-slate-100 dark:hover:bg-slate-800 dark:border-slate-700">
                <TableHead className="w-[50px] dark:text-slate-300">
                  <Checkbox
                    checked={
                      selectedIds.length === paginatedTransactions.length &&
                      paginatedTransactions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                    className="rounded-sm dark:border-slate-600"
                  />
                </TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap dark:text-slate-300"
                  onClick={() => handleSort("date")}
                >
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span>Date</span>
                    {sortConfig.field === "date" && (
                      <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-0.5">
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead className="dark:text-slate-300">Description</TableHead>
                <TableHead
                  className="cursor-pointer whitespace-nowrap dark:text-slate-300"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center gap-1">
                    <Bookmark className="h-3.5 w-3.5 text-slate-400" />
                    <span>Category</span>
                    {sortConfig.field === "category" && (
                      <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-0.5">
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer text-right whitespace-nowrap dark:text-slate-300"
                  onClick={() => handleSort("amount")}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    {sortConfig.field === "amount" && (
                      <div className="bg-purple-100 dark:bg-purple-900/30 rounded p-0.5">
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        ) : (
                          <ChevronDown className="h-3 w-3 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                    )}
                  </div>
                </TableHead>
                <TableHead className="dark:text-slate-300 whitespace-nowrap">Recurring</TableHead>
                <TableHead className="w-[50px] dark:text-slate-300" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.length === 0 ? (
                <TableRow className="dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>
                      <p>No transactions found</p>
                      {activeFiltersCount > 0 && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={handleClearFilters}
                          className="text-purple-600 dark:text-purple-400"
                        >
                          Clear all filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTransactions.map((transaction, index) => (
                  <TableRow 
                    key={transaction.id} 
                    className={cn(
                      "group transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 dark:border-slate-700",
                      selectedIds.includes(transaction.id) && "bg-purple-50 dark:bg-purple-900/10"
                    )}
                  >
                    <TableCell className="relative">
                      <div className={cn(
                        "absolute top-0 bottom-0 left-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity",
                        transaction.type === "EXPENSE" ? "bg-red-400" : "bg-green-400"
                      )} />
                      <Checkbox
                        checked={selectedIds.includes(transaction.id)}
                        onCheckedChange={() => handleSelect(transaction.id)}
                        className={cn(
                          "rounded-sm",
                          selectedIds.includes(transaction.id) 
                            ? "border-purple-500 text-purple-500 dark:border-purple-400 dark:text-purple-400" 
                            : "dark:border-slate-600"
                        )}
                      />
                    </TableCell>
                    <TableCell className="font-medium dark:text-slate-300 whitespace-nowrap">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="dark:text-slate-300 max-w-[200px] truncate">
                      {transaction.description}
                    </TableCell>
                    <TableCell>
                      <div
                        style={{
                          backgroundColor: `${categoryColors[transaction.category]}22`,
                          color: categoryColors[transaction.category],
                          borderColor: categoryColors[transaction.category]
                        }}
                        className="inline-block px-2.5 py-1 rounded-full text-xs border capitalize"
                      >
                        {transaction.category}
                      </div>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-semibold whitespace-nowrap",
                        transaction.type === "EXPENSE"
                          ? "text-red-500 dark:text-red-400"
                          : "text-green-500 dark:text-green-400"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? "-" : "+"}$
                      {transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {transaction.isRecurring ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge
                                variant="secondary"
                                className="gap-1 bg-purple-50 border border-purple-200 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:border-purple-800/50 dark:text-purple-300 dark:hover:bg-purple-900/50"
                              >
                                <RefreshCw className="h-3 w-3" />
                                {
                                  RECURRING_INTERVALS[
                                    transaction.recurringInterval
                                  ]
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white dark:bg-slate-800 dark:border-slate-700 shadow-lg p-3">
                              <div className="text-sm dark:text-slate-200">
                                <div className="font-medium">Next Payment:</div>
                                <div className="text-purple-600 dark:text-purple-400 font-semibold">
                                  {format(
                                    new Date(transaction.nextRecurringDate),
                                    "MMM d, yyyy"
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="outline" className="gap-1 bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          <Clock className="h-3 w-3" />
                          One-time
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="rounded-full h-7 w-7 text-slate-400 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 bg-white dark:bg-slate-900 dark:border-slate-700 shadow-lg">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/transaction/create?edit=${transaction.id}`
                              )
                            }
                            className="cursor-pointer text-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            Edit transaction
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="dark:bg-slate-700" />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-500 dark:text-red-400 focus:text-red-500 dark:focus:text-red-400 dark:hover:bg-slate-800"
                            onClick={() => deleteFn([transaction.id])}
                          >
                            Delete transaction
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Showing <span className="font-medium text-slate-700 dark:text-slate-300">{Math.min(filteredAndSortedTransactions.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)}-{Math.min(filteredAndSortedTransactions.length, currentPage * ITEMS_PER_PAGE)}</span> of <span className="font-medium text-slate-700 dark:text-slate-300">{filteredAndSortedTransactions.length}</span> transactions
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
                <ChevronLeft className="h-4 w-4 -ml-2" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNumber = calculatePageNumber(currentPage, totalPages, i);
                  return (
                    <Button
                      key={i}
                      variant={pageNumber === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNumber)}
                      className={cn(
                        "h-8 w-8 p-0 font-medium",
                        pageNumber === currentPage 
                          ? "bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600" 
                          : "dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                      )}
                    >
                      {pageNumber}
                    </Button>
                  );
                })}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
                <ChevronRight className="h-4 w-4 -ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function for pagination display
function calculatePageNumber(currentPage, totalPages, index) {
  // Always show 5 page numbers if possible
  if (totalPages <= 5) {
    return index + 1;
  }
  
  // If near the start
  if (currentPage <= 3) {
    return index + 1;
  }
  
  // If near the end
  if (currentPage >= totalPages - 2) {
    return totalPages - 4 + index;
  }
  
  // In the middle
  return currentPage - 2 + index;
}