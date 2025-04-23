"use client";

import { useState, useEffect, useRef } from "react";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "@/app/(main)/transaction/_components/transaction-form";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getLatestDashboardData } from "@/actions/dashboard";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

export function CreateTransactionDrawer({ children, editId = null, accounts = [], onTransactionComplete }) {
  const [open, setOpen] = useState(false);
  const [initialData, setInitialData] = useState(null);
  const [isLoading, setIsLoading] = useState(!!editId);
  const closeButtonRef = useRef(null);
  
  // Set drawer height
  const getDrawerHeight = () => {
    if (typeof window !== 'undefined') {
      const windowHeight = window.innerHeight;
      return Math.min(Math.max(700, windowHeight * 0.85), windowHeight * 0.9);
    }
    return 700;
  };
  
  const [formHeight, setFormHeight] = useState(getDrawerHeight());
  
  // Update height on window resize and drawer open
  useEffect(() => {
    if (typeof window !== 'undefined' && open) {
      const updateHeight = () => {
        setFormHeight(getDrawerHeight());
      };
      
      updateHeight();
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }
  }, [open]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Load transaction data if in edit mode
  useEffect(() => {
    if (editId && open) {
      const loadTransaction = async () => {
        setIsLoading(true);
        try {
          const { getTransaction } = await import("@/actions/transaction");
          const transaction = await getTransaction(editId);
          setInitialData(transaction);
        } catch (error) {
          console.error("Failed to load transaction", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadTransaction();
    }
  }, [editId, open]);

  // Reset form state when drawer closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        if (!editId) {
          setInitialData(null);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open, editId]);

  // Handle transaction completion - Key function
  const handleTransactionComplete = async (transactionData) => {
    console.log("Transaction completed in drawer, fetching latest dashboard data");
    
    try {
      // Fetch fresh dashboard data
      const dashboardResult = await getLatestDashboardData();
      
      if (dashboardResult && dashboardResult.success && dashboardResult.data) {
        console.log("Successfully fetched new dashboard data:", {
          accounts: dashboardResult.data.accounts?.length,
          transactions: dashboardResult.data.transactions?.length
        });
        
        // Close the drawer
        setOpen(false);
        
        // Call parent callback with updated data
        if (onTransactionComplete && typeof onTransactionComplete === 'function') {
          console.log("Calling parent onTransactionComplete with new data");
          onTransactionComplete(dashboardResult.data);
        }
        
        // Show success toast
        toast.success(editId ? "Transaction updated" : "Transaction added", {
          description: `${transactionData.type === 'EXPENSE' ? 'Expense' : 'Income'} of ${new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(transactionData.amount)} recorded`,
          icon: transactionData.type === 'EXPENSE' ? '📤' : '📥',
        });
      } else {
        console.error("Failed to get updated dashboard data or invalid response:", dashboardResult);
        setOpen(false);
        toast.success(editId ? "Transaction updated" : "Transaction added", {
          description: "Dashboard may need a refresh",
        });
      }
    } catch (error) {
      console.error("Error refreshing data after transaction:", error);
      setOpen(false);
      toast.error("Transaction saved, but couldn't refresh data");
    }
  };

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent 
        className="rounded-t-xl dark:border-slate-700 dark:bg-slate-900 shadow-xl"
        style={{
          maxWidth: "800px",
          width: "100%",
          marginLeft: "auto",
          marginRight: "auto",
          maxHeight: `${formHeight}px`,
          height: `${formHeight}px`
        }}
      >
        {/* Gradient header line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-400 to-orange-500 rounded-t-xl z-10"></div>
        
        {/* Fixed close button in the top-right corner */}
        <div className="absolute top-3 right-3 z-10">
          <DrawerClose ref={closeButtonRef} asChild>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
            >
              <X size={18} className="text-slate-500 dark:text-slate-400" />
              <span className="sr-only">Close</span>
            </Button>
          </DrawerClose>
        </div>

        <DrawerHeader className="px-0 pt-0 pb-0">
          <DrawerTitle className="sr-only">
            {editId ? "Edit Transaction" : "Add New Transaction"}
          </DrawerTitle>
        </DrawerHeader>

        {/* Container for the form */}
        <div 
          className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-64 w-full">
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 text-rose-500 mx-auto mb-4" />
                <p className="text-slate-500 dark:text-slate-400">Loading transaction data...</p>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-3xl mx-auto pt-2 pb-12">
              <AddTransactionForm
                accounts={accounts}
                categories={defaultCategories}
                editMode={!!editId}
                initialData={initialData}
                inDrawer={true}
                onComplete={handleTransactionComplete}
                centered={true}
              />
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}