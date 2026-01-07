import React, { useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  Lightbulb,
  TrendingDown,
  TrendingUp,
  Target,
  Sparkles,
} from 'lucide-react';
import { useCustomHook } from '../../../misc/customHooks';
import { fetchExpenses } from '../../../services/expenses';
import { getCurrentUser } from '../../../services/settings-user';
import { getIncomeSources } from '../../../services/incomeSources';

export const AIInsights: React.FC = () => {
  const { expenses, setExpenses, incomeSources, setIncomeSources } =
    useCustomHook();

  const currentUser = getCurrentUser();
  const currency = currentUser?.currency || 'MYR';

  // ---------------------- fetch data ----------------------
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchData = async () => {
      try {
        const expData = await fetchExpenses(currentUser.id);
        setExpenses(
          (expData || []).sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )
        );

        const incData = await getIncomeSources(currentUser.id);
        setIncomeSources(incData || []);
      } catch (err) {
        console.error('Failed to fetch expenses or income', err);
      }
    };

    fetchData();
  }, [currentUser?.id, setExpenses, setIncomeSources]);

  // ---------------------- helpers ----------------------
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const getPeriodSummary = (period: 'month' | 'week' | 'year') => {
    const now = new Date();
    let start: Date;

    switch (period) {
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(now.getDate() - now.getDay());
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(0);
    }

    const periodExpenses = expenses.filter(
      (e) => new Date(e.date) >= start
    );

    const totalExpenses = periodExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const totalIncome = incomeSources.reduce(
      (sum, i) => sum + i.amount,
      0
    );

    return { expenses: totalExpenses, income: totalIncome };
  };

  // ---------------------- AI insights ----------------------
  const insights = useMemo(() => {
    const result: any[] = [];

    const monthSummary = getPeriodSummary('month');
    const totalIncome = monthSummary.income;
    const totalExpenses = monthSummary.expenses;

    if (totalIncome <= 0) return result;

    const savingsAmount = totalIncome - totalExpenses;
    const savingsRate = (savingsAmount / totalIncome) * 100;

    // -------- Savings insight --------
    if (savingsRate >= 20) {
      result.push({
        icon: TrendingUp,
        color: '#A8D5BA',
        title: 'Excellent Savings!',
        description: `You're saving ${savingsRate.toFixed(
          1
        )}% (${formatCurrency(savingsAmount)}). Keep up the great work!`,
      });
    } else if (savingsRate < 10) {
      result.push({
        icon: TrendingDown,
        color: '#FFB4B4',
        title: 'Improve Your Savings',
        description: `Your savings rate is ${savingsRate.toFixed(
          1
        )}% (${formatCurrency(
          savingsAmount
        )}). Aim for at least 20% to build a healthy cushion.`,
      });
    } else {
      result.push({
        icon: Target,
        color: '#FFD4A3',
        title: 'Good Progress',
        description: `You're saving ${savingsRate.toFixed(
          1
        )}% (${formatCurrency(
          savingsAmount
        )}). Try pushing it closer to 20%.`,
      });
    }

    // -------- Top spending category --------
    const categorySpending = expenses.reduce(
      (acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount;
        return acc;
      },
      {} as Record<string, number>
    );

    const topCategory = Object.entries(categorySpending).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topCategory) {
      result.push({
        icon: Target,
        color: '#FFD4A3',
        title: 'Top Spending Category',
        description: `You spend the most on ${
          topCategory[0]
        } (${formatCurrency(
          topCategory[1]
        )}). Consider if this aligns with your priorities.`,
      });
    }

    // -------- Recurring expenses --------
    const totalRecurring = expenses
      .filter((e: any) => e.isRecurring)
      .reduce((sum, e) => sum + e.amount, 0);

    if (totalRecurring > totalIncome * 0.3) {
      result.push({
        icon: Lightbulb,
        color: '#B4A7D6',
        title: 'High Recurring Costs',
        description: `${(
          (totalRecurring / totalIncome) *
          100
        ).toFixed(0)}% of your income (${formatCurrency(
          totalRecurring
        )}) goes to recurring expenses. Review subscriptions.`,
      });
    }

    // -------- Monthly prediction --------
    if (totalExpenses > 0) {
      const predictedMonthly = totalExpenses; // already monthly-based
      result.push({
        icon: Sparkles,
        color: '#A3C4F3',
        title: 'Monthly Prediction',
        description: `Based on current trends, you'll spend approximately ${formatCurrency(
          predictedMonthly
        )} this month.`,
      });
    }

    return result;
  }, [expenses, incomeSources]);

  // ---------------------- Suggestions ----------------------
  const suggestions = useMemo(() => {
    const sugg: string[] = [];
    const { income, expenses: monthExpenses } = getPeriodSummary('month');

    if (income <= 0) return ['Add income sources to unlock insights.'];

    const savingsRate = ((income - monthExpenses) / income) * 100;

    if (savingsRate < 15) {
      sugg.push('Set up automatic savings of at least 10% of your income.');
    }

    const totalRecurring = expenses
      .filter((e: any) => e.isRecurring)
      .reduce((sum, e) => sum + e.amount, 0);

    if (totalRecurring > income * 0.3) {
      sugg.push('Review and cancel unused subscriptions or memberships.');
    }

    if (sugg.length === 0) {
      sugg.push('Keep monitoring your spending to maintain healthy savings!');
    }

    return sugg;
  }, [expenses, incomeSources]);

  // ---------------------- render ----------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">AI Insights & Predictions</h3>
      </div>

      <div className="space-y-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-muted/30 rounded-xl p-4 flex items-start gap-3"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: insight.color + '30' }}
            >
              <insight.icon
                className="w-5 h-5"
                style={{ color: insight.color }}
              />
            </div>
            <div className="flex-1">
              <h4 className="font-medium mb-1">{insight.title}</h4>
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <h4 className="font-medium mb-3">Savings Suggestions</h4>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="text-green-500">✓</span>
              <p className="text-muted-foreground">{s}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
