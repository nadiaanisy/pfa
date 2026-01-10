import {
  TrendingDown,
  TrendingUp,
  Coins,
  HandCoins
} from 'lucide-react';
import { formatCurrency } from '../../../misc/utils';

export const DebtSummary = ({ summary, currency }: any) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    <SummaryCard icon={TrendingDown} label="You Owe"        value={summary.youOwe}                     currency={currency} notes={summary}/>
    <SummaryCard icon={TrendingUp}   label="Others Owe You" value={summary.othersOwe}                  currency={currency} notes={summary}/>
    <SummaryCard icon={Coins}        label="Net Position"   value={summary.othersOwe - summary.youOwe} currency={currency} notes={summary}/>
    <SummaryCard icon={HandCoins}    label="Total Tracked"  value={summary.totalDebts + summary.totalLoans}                notes={summary}/>
  </div>
);

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  currency,
  notes
}: any) => (
  <div
    className={
      Icon === TrendingDown ? "bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-6":
      Icon === TrendingUp ? "bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6":
      Icon === Coins ? "bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6":
      "bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6"
    }
  >
    <div className="flex items-center gap-3 mb-2">
      <Icon className={
        Icon === TrendingDown ? "w-5 h-5 mb-2 text-red-500":
        Icon === TrendingUp ? "w-5 h-5 mb-2 text-green-500" :
        Icon === Coins ? "w-5 h-5 text-blue-500" :
        "w-5 h-5 mb-2 text-purple-500"
    }
      />
      <h3 className="text-sm text-muted-foreground">{label}</h3>
    </div>
    <p className={
      Icon == TrendingDown ? "text-2xl font-semibold text-red-600 dark:text-red-400" :
      Icon == TrendingUp ? "text-2xl font-semibold text-green-600 dark:text-green-400" :
      Icon === Coins ? "text-2xl font-semibold text-blue-600 dark:text-blue-400" :
      "text-2xl font-semibold text-purple-600 dark:text-purple-400"
      }
    >
      {currency ? formatCurrency(value, currency) : value}
    </p>
    <p className="text-xs text-muted-foreground mt-1">{
      Icon === TrendingDown ? `${notes.totalDebts} debts` :
      Icon === TrendingUp ? `${notes.totalLoans} loans` :
      Icon === Coins ? notes.othersOwe - notes.youOwe >= 0  ? 'In your favor' : 'You owe more' :
      `Active records`
    }</p>
  </div>
);