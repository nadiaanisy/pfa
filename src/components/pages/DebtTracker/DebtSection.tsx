import {
  CheckCircle,
  TrendingDown,
  TrendingUp,
  HandCoins
} from 'lucide-react';
import { DebtCard } from './DebtCard';

interface DebtSectionProps {
  title: string;
  debts: any[];
  currency: string;
  gradient?: string;
  onEdit: (debt: any) => void;
  onDelete: (debt: any) => void;
  onPayment: (debtId: string) => void;
  onHistory: (debtId: string) => void;
  editingDebt?: string | null;
  editFormProps: any;
}

export const DebtSection: React.FC<DebtSectionProps> = ({
  title,
  debts,
  currency,
  gradient,
  onEdit,
  onDelete,
  onPayment,
  onHistory,
  editingDebt,
  editFormProps
}) => {
  const isYouOwe = title === 'You Owe';

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        {isYouOwe ? (
          <TrendingDown className="w-5 h-5 text-red-500" />
        ) : (
          <TrendingUp className="w-5 h-5 text-green-500" />
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="ml-auto text-sm text-muted-foreground">
          {debts.length} {debts.length === 1 ? (isYouOwe ? 'debt' : 'loan') : debts.length === 0 ? '' : isYouOwe ? 'debts' : 'loans'}
        </span>
      </div>

      {/* Debt List */}
      <div className="space-y-4">
        {debts.map((d: any, index: number) => (
          <DebtCard
            key={d.id}
            title={title}
            debt={d}
            currency={currency}
            gradient={gradient}
            onEdit={() => onEdit(d)}
            onDelete={() => onDelete(d)}
            onPayment={() => onPayment(d.id)}
            onHistory={() => onHistory(d.id)}
            index={index}
            editingDebt={editingDebt}
            editFormProps={editFormProps}
          />
        ))}

        {/* Empty State */}
        {debts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {isYouOwe ? (
              <>
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium mb-1">No debts!</p>
                <p className="text-sm">You don't owe anyone money</p>
              </>
            ) : (
              <>
                <HandCoins className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <p className="font-medium mb-1">No loans given</p>
                <p className="text-sm">You haven't lent money to anyone</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};