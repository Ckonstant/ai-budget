import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Expenz",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/yes.png" sizes="any" />
        </head>
        <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 transition-colors`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster 
              richColors 
              toastOptions={{
                className: "dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-700",
              }}
            />

            <footer className="bg-blue-50 dark:bg-slate-900 py-12 border-t border-blue-100 dark:border-slate-800">
              <div className="container mx-auto px-4 text-center text-gray-600 dark:text-slate-400">
                <p>Made with 💗 by Christos Konstantinidis</p>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}