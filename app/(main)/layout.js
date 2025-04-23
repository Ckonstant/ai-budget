import React from "react";
import { CurrencyProvider } from "@/contexts/currency-context";
import { Settings } from "lucide-react";
import Link from "next/link";

const MainLayout = ({ children }) => {
  return (
    <CurrencyProvider>
      <div className="container mx-auto my-32">
        {children}
      </div>
    </CurrencyProvider>
  );
};

export default MainLayout;
