import { Card, CardContent } from "@/components/ui/card";

export function TotalExpensesCard({ totalExpenses = -500 }) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-5">
        <p className="text-sm font-medium">Total Expenses</p>
        <p className="text-lg font-bold">{totalExpenses}</p>
      </CardContent>
    </Card>
  );
}