"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getUserSettings } from "@/actions/settings";

// Define currency formats with symbols and formatting options
export const CURRENCY_FORMATS = {
  USD: { 
    symbol: "$", 
    code: "USD", 
    locale: "en-US",
    name: "US Dollar",
    position: "before" // $ goes before the amount
  },
  EUR: { 
    symbol: "€", 
    code: "EUR", 
    locale: "de-DE",
    name: "Euro",
    position: "after" // € goes after the amount in some European countries
  },
  GBP: { 
    symbol: "£", 
    code: "GBP", 
    locale: "en-GB",
    name: "British Pound",
    position: "before"
  },
  JPY: { 
    symbol: "¥", 
    code: "JPY", 
    locale: "ja-JP",
    name: "Japanese Yen",
    position: "before"
  },
  CAD: { 
    symbol: "C$", 
    code: "CAD", 
    locale: "en-CA",
    name: "Canadian Dollar",
    position: "before"
  },
  AUD: { 
    symbol: "A$", 
    code: "AUD", 
    locale: "en-AU",
    name: "Australian Dollar",
    position: "before"
  },
};

const CurrencyContext = createContext({
  currency: "USD",
  setCurrency: () => {},
  formatCurrency: () => {},
  getCurrencySymbol: () => "$",
  currencyInfo: CURRENCY_FORMATS.USD
});

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("USD");
  const [isLoading, setIsLoading] = useState(true);

  // Load currency from localStorage and server
  useEffect(() => {
    async function loadSettings() {
      try {
        // First, check localStorage (client-side only)
        if (typeof window !== "undefined") {
          const localCurrency = localStorage.getItem("userCurrency");
          if (localCurrency && CURRENCY_FORMATS[localCurrency]) {
            setCurrency(localCurrency);
          }
        }
        
        // Then try to get from server
        const settings = await getUserSettings();
        if (settings && settings.currency && CURRENCY_FORMATS[settings.currency]) {
          setCurrency(settings.currency);
          // Save to localStorage for future fallback
          if (typeof window !== "undefined") {
            localStorage.setItem("userCurrency", settings.currency);
          }
        }
      } catch (error) {
        console.error("Failed to load currency settings:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Set up a handler to sync currency across tabs
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Handle storage changes from other tabs
      const handleStorageChange = (e) => {
        if (e.key === "userCurrency" && e.newValue && CURRENCY_FORMATS[e.newValue]) {
          setCurrency(e.newValue);
        }
      };
      
      window.addEventListener("storage", handleStorageChange);
      return () => window.removeEventListener("storage", handleStorageChange);
    }
  }, []);

  // Get current currency information
  const currencyInfo = CURRENCY_FORMATS[currency] || CURRENCY_FORMATS.USD;

  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "";
    
    try {
      return new Intl.NumberFormat(currencyInfo.locale, {
        style: "currency",
        currency: currencyInfo.code,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    } catch (e) {
      // Fallback formatting if Intl.NumberFormat fails
      const formatted = Math.abs(amount).toFixed(2);
      return amount < 0 
        ? `-${currencyInfo.symbol}${formatted}`
        : `${currencyInfo.symbol}${formatted}`;
    }
  };

  // Get just the currency symbol
  const getCurrencySymbol = () => currencyInfo.symbol;

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        formatCurrency, 
        getCurrencySymbol,
        currencyInfo
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);