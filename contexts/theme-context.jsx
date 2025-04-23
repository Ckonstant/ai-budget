"use client";

import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(undefined);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");
  
  // Initialize theme from localStorage when the provider mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check localStorage first
      const savedTheme = localStorage.getItem('userTheme');
      
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(savedTheme);
      } else {
        // If no saved theme, check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemTheme = prefersDark ? 'dark' : 'light';
        setTheme(systemTheme);
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(systemTheme);
        localStorage.setItem('userTheme', systemTheme);
      }
    }
  }, []);
  
  // Function to change theme that will be exposed via context
  const changeTheme = (newTheme) => {
    setTheme(newTheme);
    
    // Apply theme to document and save to localStorage
    if (typeof document !== 'undefined') {
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newTheme);
      localStorage.setItem("userTheme", newTheme);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};