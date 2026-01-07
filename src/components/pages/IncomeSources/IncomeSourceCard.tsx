import { Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { format, parse } from 'date-fns';
import { formatCurrency } from '../../../misc/utils';

export const IncomeSourceCard = ({
  source,
  currency,
  onDelete,
  index,
}: any) => {
  const progress =
    source.amount > 0
      ? Math.min(100, (source.balance / source.amount) * 100)
      : 0;

  return (
    <motion.div
      key={source.id}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card rounded-2xl p-5 shadow-sm border border-border/50 hover:shadow-md transition-all group relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
        style={{ backgroundColor: source.color }}
      />

      <div className="relative">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-medium mb-1">{source.name}</h4>
            <span className="text-xs text-muted-foreground capitalize bg-muted/50 px-2 py-1 rounded-lg">
              {source.type} •{' '}
              {format(
                parse(source.purposeMonth, 'yyyy-MM', new Date()),
                'MMM yyyy'
              )}
            </span>
          </div>
          <div className="flex gap-2 opacity-100 transition-opacity">
            {/* <button
              onClick={() => {
                setEditingSource(source);
                setName(source.name);
                setAmount(source.amount.toString());
                setType(source.type);
                setPurposeMonth(source.purposeMonth);
                setShowAddModal(true);
              }}
              className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </button> */}
            <button
              onClick={() => onDelete(source.id)}
              className="p-2 hover:bg-destructive/10 rounded-lg opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Income</span>
            <span>{formatCurrency(source.amount, currency)}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Current Balance</span>
            <span
              className="text-lg font-semibold"
              style={{ color: source.color }}
            >
              {formatCurrency(source.balance, currency)}
            </span>
          </div>

          <div className="w-full bg-muted/50 rounded-full h-2 mt-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${progress}%`,
                backgroundColor: source.color,
              }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
