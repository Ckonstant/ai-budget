"use client";

import { useState, useEffect } from "react";
import { useCurrency } from "@/contexts/currency-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Target,
  Plus,
  Home,
  Car,
  Briefcase,
  GraduationCap,
  Plane,
  PiggyBank,
  Trash2,
  Edit,
  AlertCircle,
  Check,
  CreditCard,
  Calendar,
  XCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { getUserGoals, createGoal, updateGoal, deleteGoal } from "@/actions/goals";

// Goal icons mapping
const GOAL_ICONS = {
  "SAVINGS": PiggyBank,
  "EMERGENCY_FUND": AlertCircle,
  "DEBT_PAYOFF": CreditCard,
  "HOME": Home,
  "CAR": Car,
  "RETIREMENT": Briefcase,
  "EDUCATION": GraduationCap,
  "VACATION": Plane,
  "CUSTOM": Target
};

export function FinancialGoalsCard() {
  const { formatCurrency } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [createMode, setCreateMode] = useState(true);
  const [editingGoalId, setEditingGoalId] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "SAVINGS",
    targetAmount: "",
    currentAmount: "",
    deadline: "",
    description: ""
  });

  // Load goals on component mount
  useEffect(() => {
    fetchGoals();
    console.log("Financial Goals Card has mounted");
  }, []);

  // Fetch goals from the server
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const userGoals = await getUserGoals();
      setGoals(userGoals || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast.error("Failed to load your financial goals");
    } finally {
      setLoading(false);
    }
  };

  // Reset form state
  const resetForm = () => {
    setFormData({
      name: "",
      type: "SAVINGS",
      targetAmount: "",
      currentAmount: "",
      deadline: "",
      description: ""
    });
    setCreateMode(true);
    setEditingGoalId(null);
  };

  // Open create dialog
  const handleCreateGoal = () => {
    resetForm();
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleEditGoal = (goal) => {
    setCreateMode(false);
    setEditingGoalId(goal.id);
    setFormData({
      name: goal.name,
      type: goal.type,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : "",
      description: goal.description || ""
    });
    setOpenDialog(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit goal form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: parseFloat(formData.currentAmount || 0),
      };

      if (createMode) {
        // Create new goal
        const result = await createGoal(goalData);
        if (result.success) {
          toast.success("Financial goal created successfully");
          setOpenDialog(false);
          fetchGoals();
        } else {
          toast.error(result.error || "Failed to create goal");
        }
      } else {
        // Update existing goal
        const result = await updateGoal(editingGoalId, goalData);
        if (result.success) {
          toast.success("Financial goal updated successfully");
          setOpenDialog(false);
          fetchGoals();
        } else {
          toast.error(result.error || "Failed to update goal");
        }
      }
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("An error occurred while saving your goal");
    }
  };

  // Confirm delete dialog
  const confirmDelete = (goal) => {
    setGoalToDelete(goal);
    setDeleteConfirmOpen(true);
  };

  // Delete goal
  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;
    
    try {
      const result = await deleteGoal(goalToDelete.id);
      if (result.success) {
        toast.success("Goal deleted successfully");
        setGoals(goals.filter(goal => goal.id !== goalToDelete.id));
        setDeleteConfirmOpen(false);
        setGoalToDelete(null);
      } else {
        toast.error(result.error || "Failed to delete goal");
      }
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("An error occurred while deleting the goal");
    }
  };

  // Calculate progress percentage
  const calculateProgress = (current, target) => {
    if (!target || target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(progress, 100); // Cap at 100%
  };

  // Format deadline date
  const formatDeadline = (deadline) => {
    if (!deadline) return null;
    return new Date(deadline).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get progress color based on completion percentage
  const getProgressColor = (progress) => {
    if (progress >= 100) return "bg-green-500 dark:bg-green-500";
    if (progress >= 75) return "bg-emerald-500 dark:bg-emerald-500";
    if (progress >= 50) return "bg-blue-500 dark:bg-blue-500";
    if (progress >= 25) return "bg-amber-500 dark:bg-amber-500";
    return "bg-purple-500 dark:bg-purple-500";
  };

  // Get time remaining text
  const getTimeRemaining = (deadline) => {
    if (!deadline) return null;
    
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Deadline passed";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "1 day left";
    if (diffDays < 30) return `${diffDays} days left`;
    if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} ${months === 1 ? 'month' : 'months'} left`;
    }
    const years = Math.floor(diffDays / 365);
    return `${years} ${years === 1 ? 'year' : 'years'} left`;
  };

  // Get icon for goal type
  const getGoalIcon = (type) => {
    const IconComponent = GOAL_ICONS[type] || Target;
    return IconComponent;
  };

  // Render progress bar
  const renderProgressBar = (current, target) => {
    const progress = calculateProgress(current, target);
    const progressColor = getProgressColor(progress);
    
    return (
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div 
          className={`h-full ${progressColor} rounded-full transition-all duration-500`} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-xl transition-all duration-300 relative group dark:bg-slate-900/90 financial-goals-card">
        {/* Background gradients like your other cards */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-200 via-indigo-100 to-white dark:from-purple-900/70 dark:via-indigo-900/60 dark:to-slate-900/90 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
          <Target className="h-32 w-32 text-purple-500 dark:text-purple-400 rotate-6" />
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-indigo-500/5 rounded-full transform translate-x-16 -translate-y-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-indigo-500/10 to-purple-400/5 rounded-full transform -translate-x-20 translate-y-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-300 to-purple-500 dark:from-purple-400 dark:to-purple-600 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-lg md:text-xl font-medium flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-md text-white shadow-sm">
              <Target className="h-5 w-5" />
            </div>
            Financial Goals
          </CardTitle>
          <CardDescription className="text-purple-600/80 dark:text-purple-400/90">
            Track your progress toward financial milestones
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-6 relative z-10">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-6 text-center bg-white/70 dark:bg-slate-800/70 rounded-lg border border-dashed border-purple-200/80 dark:border-purple-800/50 shadow-sm">
              <div className="relative">
                <div className="absolute -inset-4 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-xl opacity-70 animate-pulse"></div>
                <div className="relative rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 p-3 mb-3 shadow-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-base font-medium text-gray-800 dark:text-white mt-3">No financial goals yet</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-md">
                Create goals for savings, debt payoff, or major purchases to stay on track with your financial journey
              </p>
              <Button 
                onClick={handleCreateGoal}
                className="mt-4 bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:shadow-lg transition-all"
              >
                <Plus className="h-4 w-4 mr-1" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const IconComponent = getGoalIcon(goal.type);
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
                const isCompleted = progress >= 100;
                const deadlineFormatted = formatDeadline(goal.deadline);
                const timeRemaining = getTimeRemaining(goal.deadline);
                
                return (
                  <div 
                    key={goal.id}
                    className="p-4 rounded-xl border border-purple-100 dark:border-purple-900/50 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 hover:shadow-md relative overflow-hidden group/goal"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          isCompleted 
                            ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" 
                            : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                        } mr-3`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-800 dark:text-white flex items-center">
                            {goal.name}
                            {isCompleted && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                <Check className="h-3 w-3 mr-1" />
                                Achieved
                              </span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {goal.description || `${goal.type.replace('_', ' ').toLowerCase()} goal`}
                          </p>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover/goal:opacity-100 transition-opacity duration-200 flex space-x-1">
                        <button
                          onClick={() => handleEditGoal(goal)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                          title="Edit goal"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(goal)}
                          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400"
                          title="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span className="font-medium dark:text-white">
                          {formatCurrency(goal.currentAmount)} 
                          <span className="text-gray-500 dark:text-gray-400 font-normal">
                            {' of '}
                          </span>
                          {formatCurrency(goal.targetAmount)}
                        </span>
                        <span className={`font-medium ${isCompleted ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-300'}`}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      {renderProgressBar(goal.currentAmount, goal.targetAmount)}
                    </div>
                    
                    {(deadlineFormatted || timeRemaining) && (
                      <div className="flex items-center justify-between mt-2 text-xs">
                        {deadlineFormatted && (
                          <div className="flex items-center text-gray-500 dark:text-gray-400">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Target: {deadlineFormatted}</span>
                          </div>
                        )}
                        {timeRemaining && (
                          <div className={`flex items-center font-medium ${
                            timeRemaining.includes("passed") 
                              ? "text-red-500 dark:text-red-400" 
                              : "text-purple-600 dark:text-purple-400"
                          }`}>
                            <span>{timeRemaining}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="flex justify-center mt-3 pt-1 border-t border-purple-100 dark:border-purple-900/50">
                <Button 
                  onClick={handleCreateGoal}
                  variant="ghost" 
                  className="text-sm bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 font-medium flex items-center py-1.5 px-3 rounded-full hover:bg-purple-100 dark:hover:bg-purple-800/30 hover:text-purple-800 dark:hover:text-purple-200 transition-colors border border-purple-200 dark:border-purple-800/30 shadow-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Goal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Goal Form Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[500px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-md text-white shadow-sm">
                {createMode ? <Plus className="h-5 w-5" /> : <Edit className="h-5 w-5" />}
              </div>
              {createMode ? 'Create Financial Goal' : 'Edit Financial Goal'}
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              {createMode ? 
                'Define a new financial goal to track your progress.' : 
                'Update the details of your financial goal.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="dark:text-slate-300">Goal Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g., Emergency Fund, Down Payment"
                value={formData.name}
                onChange={handleChange}
                required
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type" className="dark:text-slate-300">Goal Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleSelectChange('type', value)}
                required
              >
                <SelectTrigger className="dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-800 dark:border-slate-700">
                  <SelectItem value="SAVINGS" className="dark:text-white">Savings</SelectItem>
                  <SelectItem value="EMERGENCY_FUND" className="dark:text-white">Emergency Fund</SelectItem>
                  <SelectItem value="DEBT_PAYOFF" className="dark:text-white">Debt Payoff</SelectItem>
                  <SelectItem value="HOME" className="dark:text-white">Home Purchase</SelectItem>
                  <SelectItem value="CAR" className="dark:text-white">Vehicle Purchase</SelectItem>
                  <SelectItem value="RETIREMENT" className="dark:text-white">Retirement</SelectItem>
                  <SelectItem value="EDUCATION" className="dark:text-white">Education</SelectItem>
                  <SelectItem value="VACATION" className="dark:text-white">Vacation</SelectItem>
                  <SelectItem value="CUSTOM" className="dark:text-white">Custom Goal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount" className="dark:text-slate-300">Target Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="10000"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    required
                    className="pl-7 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="currentAmount" className="dark:text-slate-300">Current Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500 dark:text-gray-400">$</span>
                  <Input
                    id="currentAmount"
                    name="currentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={formData.currentAmount}
                    onChange={handleChange}
                    className="pl-7 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline" className="dark:text-slate-300">
                Target Date (Optional)
              </Label>
              <Input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={handleChange}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="dark:text-slate-300">
                Description (Optional)
              </Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of your goal"
                value={formData.description}
                onChange={handleChange}
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
            </div>
            
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpenDialog(false)}
                className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md hover:opacity-90 transition-opacity"
              >
                {createMode ? 'Create Goal' : 'Update Goal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-md text-white shadow-sm">
                  <Trash2 className="h-5 w-5" />
                </div>
                Delete Goal
              </div>
            </DialogTitle>
            <DialogDescription className="dark:text-slate-400">
              Are you sure you want to delete this goal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {goalToDelete && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 mb-4">
              <p className="font-medium text-red-800 dark:text-red-300">{goalToDelete.name}</p>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {formatCurrency(goalToDelete.currentAmount)} saved of {formatCurrency(goalToDelete.targetAmount)} goal
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="dark:bg-slate-800 dark:text-white dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteGoal}
              className="bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md hover:opacity-90 transition-opacity"
            >
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}