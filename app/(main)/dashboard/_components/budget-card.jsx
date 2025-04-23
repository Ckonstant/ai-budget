"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Pencil, Check, X } from "lucide-react";
import { createBudget, updateBudget } from "@/actions/budget";

export function BudgetCard({ initialBudget, currentExpenses }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(!initialBudget);
  const [budget, setBudget] = useState(initialBudget || { amount: 0 });
  const [formValues, setFormValues] = useState({ 
    amount: initialBudget?.amount || 0 
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setFormValues({ amount: budget.amount });
  };

  const handleCancel = () => {
    if (isCreating) {
      // If cancelling during creation, keep the creating state but reset form
      setFormValues({ amount: 0 });
    } else {
      // If cancelling during edit, exit edit mode
      setIsEditing(false);
    }
  };

  const handleSave = async () => {
    // Validate form values - only amount is truly required
    if (!formValues.amount || formValues.amount <= 0) {
      toast.error("Budget amount must be greater than zero");
      return;
    }

    setIsLoading(true);

    try {
      let result;
      
      if (isCreating) {
        // Create new budget using server action
        result = await createBudget({
          amount: parseFloat(formValues.amount),
        });
      } else {
        // Update existing budget using server action
        result = await updateBudget(budget.id, {
          amount: parseFloat(formValues.amount),
        });
      }

      if (result.error) {
        throw new Error(result.error);
      }
      
      setBudget(result.data);
      setIsEditing(false);
      setIsCreating(false);
      
      toast.success(isCreating ? "Budget created successfully" : "Budget updated successfully");
      router.refresh(); // Refresh the page to update data
    } catch (error) {
      console.log("Error saving budget:", error.message);
      toast.error(error.message || `Failed to ${isCreating ? 'create' : 'update'} budget`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate budget progress
  const progress = budget.amount > 0 ? Math.min(100, (currentExpenses / budget.amount) * 100) : 0;
  const isOverBudget = currentExpenses > budget.amount;
  const remaining = budget.amount - currentExpenses;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">
            <div className="flex items-center gap-2">
              Monthly Budget
              {!isEditing && !isCreating && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={handleEdit}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </CardTitle>
          {isEditing || isCreating ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2">$</span>
                <Input
                  type="number"
                  value={formValues.amount}
                  onChange={(e) => setFormValues(prev => ({ ...prev, amount: e.target.value }))}
                  className="h-8 pl-6 w-24"
                  min="0"
                  step="0.01"
                />
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-green-500 hover:text-green-700 hover:bg-green-50"
                onClick={handleSave}
                disabled={isLoading}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <span className={isOverBudget ? "text-red-500" : "text-green-500"}>
              ${currentExpenses.toFixed(2)} / ${budget.amount.toFixed(2)}
            </span>
          )}
        </div>
        <CardDescription>
          {isCreating ? "Set your monthly budget to track spending" : "Track your monthly spending"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full ${isOverBudget ? "bg-red-500" : "bg-green-500"}`}
            style={{ 
              width: `${progress}%`
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm">
          <span>{progress.toFixed(0)}% used</span>
          {!isEditing && !isCreating && (
            <span className={isOverBudget ? "text-red-500" : "text-green-500"}>
              {isOverBudget 
                ? `$${Math.abs(remaining).toFixed(2)} over budget` 
                : `$${remaining.toFixed(2)} remaining`}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}