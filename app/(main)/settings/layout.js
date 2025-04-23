import { BarLoader } from "react-spinners";
import { Suspense } from "react";

// Updated script to use the consistent key name
const themeScript = `
  (function() {
    // Check for theme in localStorage with the standardized key name
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      // Use saved theme
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(savedTheme);
    } else {
      // Otherwise, respect system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(systemTheme);
      // Save with the standardized key name
      localStorage.setItem('theme', systemTheme);
    }
  })();
`;

export default function SettingsLayout({ children }) {
  return (
    <div className="px-5">
      {/* Inline script for immediate theme application to avoid FOUC */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        {children}
      </Suspense>
    </div>
  );
}