import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { SettingsContent } from "./_components/settings-content";

export const metadata = {
  title: "Settings | My Oikonomika",
  description: "Customize your finance platform experience",
};

export default function SettingsPage() {
  return (
    <div className="px-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-5xl font-bold tracking-tight gradient-title dark:text-white">
          Settings
        </h1>
      </div>

      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#9333ea" />}
      >
        <SettingsContent />
      </Suspense>
    </div>
  );
}