"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateUserSettings, getUserSettings } from "@/actions/settings";
import { CreditCard, Globe, Bell, Save, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency, CURRENCY_FORMATS } from "@/contexts/currency-context";

export function SettingsContent() {
  // Call all hooks at the top level in the same order
  const { currency: currentCurrency, setCurrency: setContextCurrency, formatCurrency } = useCurrency();
  
  // States for various settings
  const [currency, setCurrency] = useState(currentCurrency);
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState({
    email: true,
    transactionAlerts: true,
    budgetAlerts: true,
    weeklyReport: true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [previewIncome, setPreviewIncome] = useState(formatCurrency(1234.56));
  const [previewExpense, setPreviewExpense] = useState(formatCurrency(-567.89));

  // Update preview when currency changes
  useEffect(() => {
    setCurrency(currentCurrency);
  }, [currentCurrency]);

  // Format preview values when currency changes
  useEffect(() => {
    setPreviewIncome(formatCurrency(1234.56));
    setPreviewExpense(formatCurrency(-567.89));
  }, [currency, formatCurrency]);

  // Initialize theme from localStorage or system preference on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // First check localStorage
      const savedTheme = localStorage.getItem('theme');
      
      if (savedTheme) {
        setTheme(savedTheme);
        // Apply it immediately to prevent flash
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(savedTheme);
      } else {
        // If no saved theme, check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? 'dark' : 'light';
        setTheme(systemTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(systemTheme);
      }
    }
  }, []);

  // Fetch user settings on component mount
  useEffect(() => {
    async function fetchUserSettings() {
      try {
        const settings = await getUserSettings();
        if (settings && !settings.error) {
          setCurrency(settings.currency || "USD");
          setDateFormat(settings.dateFormat || "MM/DD/YYYY");
          
          // Only update theme from server if we don't have a local setting
          if (!localStorage.getItem('theme')) {
            setTheme(settings.theme || "light");
          }
          
          setNotifications({
            email: settings.emailNotifications ?? true,
            transactionAlerts: settings.transactionAlerts ?? true,
            budgetAlerts: settings.budgetAlerts ?? true,
            weeklyReport: settings.weeklyReport ?? true,
          });
        } else if (settings?.error) {
          toast.error(settings.error || "Failed to load settings");
        }
        setInitialLoad(false);
      } catch (error) {
        toast.error("Failed to load settings");
        setInitialLoad(false);
      }
    }

    fetchUserSettings();
  }, []);

  // Handle currency change
  const handleCurrencyChange = (value) => {
    setCurrency(value);
    
    // Update the preview values immediately when currency changes in the dropdown
    // This will show the user how the new currency will look
    const tempFormat = (amount) => {
      const currencyInfo = CURRENCY_FORMATS[value] || CURRENCY_FORMATS.USD;
      
      try {
        return new Intl.NumberFormat(currencyInfo.locale, {
          style: "currency",
          currency: currencyInfo.code,
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch (e) {
        // Fallback formatting
        return `${currencyInfo.symbol}${Math.abs(amount).toFixed(2)}`;
      }
    };
    
    setPreviewIncome(tempFormat(1234.56));
    setPreviewExpense(tempFormat(-567.89));
  };

  // Handle theme change immediately when user switches
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    
    // Apply theme immediately
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(newTheme);
      
      // Save to localStorage with a consistent key name
      localStorage.setItem("theme", newTheme);
    }
    
    // Show confirmation toast
    toast.success(`Theme switched to ${newTheme} mode`);
  };

  // Save settings function
  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    const settingsData = {
      currency,
      dateFormat,
      theme,
      emailNotifications: notifications.email,
      transactionAlerts: notifications.transactionAlerts,
      budgetAlerts: notifications.budgetAlerts,
      weeklyReport: notifications.weeklyReport,
    };
    
    try {
      // Save to localStorage for persistence between sessions
      if (typeof window !== "undefined") {
        // Use consistent key names across the app
        localStorage.setItem("currency", currency);
        localStorage.setItem("theme", theme);
        localStorage.setItem("dateFormat", dateFormat);
        
        // Ensure the theme is applied to the document
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
      }
      
      // Update the context for immediate UI feedback across the app
      setContextCurrency(currency);
      
      const result = await updateUserSettings(settingsData);
      if (result?.success) {
        toast.success("Settings saved successfully");
      } else {
        // Even if server save fails, local settings are saved
        toast.info("Settings saved locally. Server sync will be available soon.");
      }
    } catch (error) {
      console.error("Settings save error:", error);
      toast.info("Settings saved locally. Server sync will be available soon.");
    } finally {
      setIsSaving(false);
    }
  };

  // Sync theme when component mounts to ensure correct class on document
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove("dark", "light");
      root.classList.add(theme);
    }
  }, [theme]);

  const tabButtons = [
    { id: "general", label: "General", icon: <Globe className="h-4 w-4 mr-2" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4 mr-2" /> },
    { id: "financial", label: "Financial", icon: <CreditCard className="h-4 w-4 mr-2" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Custom Tab Navigation with improved dark mode contrast */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabButtons.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "outline"}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center ${
              activeTab === tab.id 
                ? "dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300" // Selected button in dark mode
                : "dark:border-slate-700 dark:text-white dark:hover:bg-slate-800" // Unselected button in dark mode
            }`}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">General Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="date-format" className="dark:text-slate-300">Date Format</Label>
              <select 
                id="date-format" 
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (UK, EU)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="YYYY/MM/DD">YYYY/MM/DD (Japan)</option>
              </select>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Format used for displaying dates throughout the application
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme" className="dark:text-slate-300">Theme</Label>
              
              {/* Enhanced theme selection UI with fixed dark mode contrast */}
              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => handleThemeChange("light")}
                  className={`flex flex-col items-center justify-center py-4 px-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "light" 
                    ? "border-blue-300 dark:border-blue-500 bg-blue-50 dark:bg-slate-800" 
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    theme === "light" 
                    ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    <Sun className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${
                    theme === "light" 
                    ? "text-blue-700 dark:text-blue-300" 
                    : "text-slate-600 dark:text-slate-300"
                  }`}>Light Mode</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Bright interface</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleThemeChange("dark")}
                  className={`flex flex-col items-center justify-center py-4 px-6 rounded-xl border-2 transition-all duration-200 ${
                    theme === "dark" 
                    ? "border-indigo-300 dark:border-indigo-500 bg-indigo-50 dark:bg-slate-800" 
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center mb-2 ${
                    theme === "dark" 
                    ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300" 
                    : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                  }`}>
                    <Moon className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${
                    theme === "dark" 
                    ? "text-indigo-700 dark:text-indigo-300" 
                    : "text-slate-600 dark:text-slate-300"
                  }`}>Dark Mode</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Reduced eye strain</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="dark:text-slate-300">Data Management</Label>
              <div className="flex gap-2 mt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  Export Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  Import Data
                </Button>
              </div>
            </div>

            <div className="pt-6 mt-2 border-t dark:border-slate-700">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2 animate-spin"></span>
                    Saving Settings
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save General Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notifications Settings */}
      {activeTab === "notifications" && (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium dark:text-white">Notification Channels</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-notifications" className="text-sm dark:text-slate-300">Email Notifications</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive notifications via email</p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                />
              </div>
            </div>

            <Separator className="dark:bg-slate-700" />

            <div className="space-y-4">
              <h3 className="text-sm font-medium dark:text-white">Notification Types</h3>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="transaction-alerts" className="text-sm dark:text-slate-300">Transaction Alerts</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get notified about new transactions</p>
                </div>
                <Switch
                  id="transaction-alerts"
                  checked={notifications.transactionAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, transactionAlerts: checked})}
                />
              </div>
              <Separator className="dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="budget-alerts" className="text-sm dark:text-slate-300">Budget Alerts</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Get notified when approaching budget limits</p>
                </div>
                <Switch
                  id="budget-alerts"
                  checked={notifications.budgetAlerts}
                  onCheckedChange={(checked) => setNotifications({...notifications, budgetAlerts: checked})}
                />
              </div>
              <Separator className="dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="weekly-report" className="text-sm dark:text-slate-300">Weekly Summary Report</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Receive a weekly financial summary</p>
                </div>
                <Switch
                  id="weekly-report"
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({...notifications, weeklyReport: checked})}
                />
              </div>
            </div>

            <div className="pt-6 mt-2 border-t dark:border-slate-700">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2 animate-spin"></span>
                    Saving Settings
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Notification Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Financial Settings */}
      {activeTab === "financial" && (
        <Card className="dark:bg-slate-900 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Financial Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="currency" className="dark:text-slate-300">Currency</Label>
              <select 
                id="currency" 
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                value={currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                {Object.entries(CURRENCY_FORMATS).map(([code, currencyData]) => (
                  <option key={code} value={code}>
                    {currencyData.symbol} {code} - {currencyData.name}
                  </option>
                ))}
              </select>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Currency used for displaying financial values throughout the application
              </p>
              
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md border dark:border-slate-700">
                <p className="text-sm font-medium mb-1 dark:text-white">Preview:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <span className="text-slate-500 dark:text-slate-400 mr-2">Income:</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">
                      {previewIncome}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-slate-500 dark:text-slate-400 mr-2">Expense:</span>
                    <span className="font-medium text-rose-600 dark:text-rose-400">
                      {previewExpense}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rounding" className="dark:text-slate-300">Financial Rounding</Label>
              <select 
                id="rounding" 
                className="w-full px-3 py-2 border rounded-md bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white"
                defaultValue="2"
              >
                <option value="0">0 decimal places</option>
                <option value="1">1 decimal place</option>
                <option value="2">2 decimal places</option>
                <option value="3">3 decimal places</option>
              </select>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Number of decimal places to show in financial amounts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate" className="dark:text-slate-300">Default Tax Rate (%)</Label>
              <Input 
                id="tax-rate" 
                type="number" 
                defaultValue="8.5" 
                min="0"
                max="100"
                step="0.1"
                className="dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Default tax rate for calculations (can be overridden per transaction)
              </p>
            </div>

            <div className="pt-6 mt-2 border-t dark:border-slate-700">
              <Button 
                onClick={handleSaveSettings} 
                disabled={isSaving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700"
              >
                {isSaving ? (
                  <>
                    <span className="inline-block h-4 w-4 border-2 border-white/30 border-t-white rounded-full mr-2 animate-spin"></span>
                    Saving Settings
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Financial Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}