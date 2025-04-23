"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateTransactionDrawer } from "@/components/create-transaction-drawer";

export function DashboardActionButton({ accounts, onTransactionComplete }) {
  const handleTransactionComplete = (updatedData) => {
    console.log("Transaction completed in button, passing data to dashboard");
    if (onTransactionComplete && typeof onTransactionComplete === 'function') {
      onTransactionComplete(updatedData);
    }
  };

  return (
    <div>
      <CreateTransactionDrawer 
        accounts={accounts} 
        onTransactionComplete={handleTransactionComplete}
      >
        <Button className="flex items-center gap-2 bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-sm">
          <PlusCircle size={18} className="text-white" />
          <span className="hidden md:inline">Add Transaction</span>
        </Button>
      </CreateTransactionDrawer>
    </div>
  );
}