import { ExpenseCard } from './ExpenseCard';

interface ExpensesGridProps {
  expenses: any[];
  incomeSources: any[];
  currency: string;
  onEdit: (expense: any) => void;
  onDelete: (expense: any) => void;
}

export const ExpensesGrid = ({
  expenses,
  incomeSources,
  currency,
  onEdit,
  onDelete,
}: ExpensesGridProps) => {
  if (!expenses.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No expenses found
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      {expenses.map((expense: any, index: number) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          index={index}
          currency={currency}
          incomeSourceName={
            incomeSources.find((s: any) => s.id === expense.income_source_id)?.name
          }
          onEdit={() => onEdit(expense)}
          onDelete={() => onDelete(expense)}
        />
      ))}
    </div>
  );
};
