import {
  ShoppingCart, 
  Utensils, 
  Home, 
  Car, 
  Plane,
  HeartPulse, 
  Gamepad, 
  GraduationCap,
  Laptop, 
  ShoppingBag,
  Coffee, 
  Briefcase, 
  Banknote,
  Gift, 
  Wallet, 
  Bus,
  Wifi,
  Smartphone,
  Tag,
  Lightbulb,
  Building,
  PiggyBank,
  BarChart,
  BadgeDollarSign
} from "lucide-react";

export function getCategoryColor(category) {
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
  
  const lowerCategory = category.toLowerCase();
  return colors[lowerCategory] || "#94a3b8";
}

export function getCategoryIcon(category) {
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('shopping')) return ShoppingCart;
  if (lowerCategory.includes('grocery') || lowerCategory.includes('groceries')) return ShoppingBag;
  if (lowerCategory.includes('food') || lowerCategory.includes('restaurant') || lowerCategory.includes('dining')) return Utensils;
  if (lowerCategory.includes('home') || lowerCategory.includes('rent') || lowerCategory.includes('mortgage')) return Home;
  if (lowerCategory.includes('car') || lowerCategory.includes('auto') || lowerCategory.includes('fuel')) return Car;
  if (lowerCategory.includes('travel') || lowerCategory.includes('flight') || lowerCategory.includes('vacation')) return Plane;
  if (lowerCategory.includes('health') || lowerCategory.includes('medical') || lowerCategory.includes('doctor')) return HeartPulse;
  if (lowerCategory.includes('game') || lowerCategory.includes('entertainment')) return Gamepad;
  if (lowerCategory.includes('education') || lowerCategory.includes('school') || lowerCategory.includes('college')) return GraduationCap;
  if (lowerCategory.includes('tech') || lowerCategory.includes('computer') || lowerCategory.includes('software')) return Laptop;
  if (lowerCategory.includes('coffee') || lowerCategory.includes('cafe')) return Coffee;
  if (lowerCategory.includes('salary') || lowerCategory.includes('wage')) return Briefcase;
  if (lowerCategory.includes('income') || lowerCategory.includes('revenue')) return Banknote;
  if (lowerCategory.includes('gift')) return Gift;
  if (lowerCategory.includes('investment') || lowerCategory.includes('stock') || lowerCategory.includes('dividend')) return BarChart;
  if (lowerCategory.includes('utilities')) return Lightbulb;
  if (lowerCategory.includes('insurance')) return Building;
  if (lowerCategory.includes('transport') || lowerCategory.includes('transit')) return Bus;
  if (lowerCategory.includes('internet') || lowerCategory.includes('subscription')) return Wifi;
  if (lowerCategory.includes('phone') || lowerCategory.includes('mobile')) return Smartphone;
  if (lowerCategory.includes('bonus')) return BadgeDollarSign;
  if (lowerCategory.includes('savings')) return PiggyBank;
  
  return Tag;
}