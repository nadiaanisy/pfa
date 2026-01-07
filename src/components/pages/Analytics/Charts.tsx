import React, {
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import {
  format,
  subMonths,
  parseISO,
  startOfMonth,
  eachDayOfInterval,
  endOfMonth,
  addMonths
} from 'date-fns';
import { motion } from 'motion/react';
import { CATEGORIES } from '../../../misc/constants';
import { IncomeSource } from '../../../misc/interfaces';
import { useCustomHook } from '../../../misc/customHooks';
import { fetchExpenses } from '../../../services/expenses';
import { getCurrentUser } from '../../../services/settings-user';
import { getIncomeSources } from '../../../services/incomeSources';
import { useExpenses } from '../../../services/context/ExpenseContext';

const COLORS = [
  '#FFB4B4',
  '#A8D5BA',
  '#FFD4A3',
  '#B4A7D6',
  '#A3C4F3',
  '#FFB6C1',
  '#C7CEEA',
  '#B5EAD7',
  '#FFDAB9',
];

const formatAmount = (currency: any, value?: number | string) => {
  const num = typeof value === 'number' ? value : Number(value ?? 0);
  if (isNaN(num)) return `0.00`;

  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

type FilterState = {
  category: string | 'all';
  month: number | 'all';
  year: number | 'all';
};

export const CategoryPieChart: React.FC = () => {
  const currentUser = getCurrentUser();
  const { expenses, setExpenses } = useCustomHook();

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    month: 'all',
    year: 'all',
  });

  /* ---------------- Fetch expenses ---------------- */
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchExpensesList = async () => {
      try {
        const data = await fetchExpenses(currentUser.id);
        const sorted = (data || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setExpenses(sorted);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      }
    };

    fetchExpensesList();
  }, [currentUser?.id, setExpenses]);

  const currency = currentUser?.currency;

  /* ---------------- Quick buttons handlers ---------------- */
  const handleQuick = (type: 'month' | 'year' | 'all') => {
    const now = new Date();
    if (type === 'month') {
      setFilters(f => ({
        ...f,
        month: now.getMonth(),
        year: now.getFullYear(),
        category: 'all',
      }));
    } else if (type === 'year') {
      setFilters(f => ({
        ...f,
        month: 'all',
        year: now.getFullYear(),
        category: 'all',
      }));
    } else {
      setFilters({
        category: 'all',
        month: 'all',
        year: 'all',
      });
    }
  };

  /* ---------------- Filter expenses ---------------- */
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const date = parseISO(exp.date);

      const matchCategory =
        filters.category === 'all' || exp.category === filters.category;

      const matchMonth =
        filters.month === 'all' || date.getMonth() === filters.month;

      const matchYear =
        filters.year === 'all' || date.getFullYear() === filters.year;

      return matchCategory && matchMonth && matchYear;
    });
  }, [expenses, filters]);

  /* ---------------- Group by category ---------------- */
  const categoryData = useMemo(() => {
    const grouped: Record<string, number> = {};

    filteredExpenses.forEach(expense => {
      grouped[expense.category] =
        (grouped[expense.category] || 0) + expense.amount;
    });

    return Object.entries(grouped)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));
  }, [filteredExpenses]);

  /* ---------------- Years list (auto) ---------------- */
  const availableYears = Array.from(
    new Set(expenses.map(exp => parseISO(exp.date).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      <h3 className="text-lg font-semibold mb-4">
        Expenses by Category
      </h3>

      {/* ---------------- Quick Buttons ---------------- */}
      <div className="dark:text-black flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => handleQuick('month')}
          className="px-3 py-1 bg-green-200 rounded-lg hover:bg-green-300 transition"
        >
          This Month
        </button>
        <button
          onClick={() => handleQuick('year')}
          className="px-3 py-1 bg-blue-200 rounded-lg hover:bg-blue-300 transition"
        >
          This Year
        </button>
        <button
          onClick={() => handleQuick('all')}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          All Time
        </button>
      </div>

      {/* ---------------- Filters ---------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Category */}
        <select
          value={filters.category}
          onChange={(e) =>
            setFilters(f => ({ ...f, category: e.target.value }))
          }
          className="dark:text-black px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={filters.month}
          onChange={(e) =>
            setFilters(f => ({
              ...f,
              month:
                e.target.value === 'all'
                  ? 'all'
                  : Number(e.target.value),
            }))
          }
          className="dark:text-black px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
        >
          <option value="all">All months</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('default', {
                month: 'long',
              })}
            </option>
          ))}
        </select>

        {/* Year */}
        <select
          value={filters.year}
          onChange={(e) =>
            setFilters(f => ({
              ...f,
              year:
                e.target.value === 'all'
                  ? 'all'
                  : Number(e.target.value),
            }))
          }
          className="dark:text-black px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
        >
          <option value="all">All years</option>
          {availableYears.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* ---------------- Chart or No Data ---------------- */}
      {categoryData.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No data</p>
          <p className="text-sm">No expenses for selected filters.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              labelLine={false}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
              }
            >
              {categoryData.map((_, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: number | undefined) =>
                formatAmount(currency, value)
              }
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export const ExpenseTrendChart: React.FC = () => {
  const currentUser = getCurrentUser();
  const { expenses, setExpenses } = useCustomHook();
  const { darkMode } = useExpenses();

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    month: 'all',
    year: 'all',
  });

  /* ---------------- Fetch expenses ---------------- */
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchExpensesList = async () => {
      try {
        const data = await fetchExpenses(currentUser.id);
        const sorted = (data || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );
        setExpenses(sorted);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      }
    };

    fetchExpensesList();
  }, [currentUser?.id, setExpenses]);

  const currency = currentUser?.currency;

  /* ---------------- Quick buttons ---------------- */
  const handleQuick = (type: 'month' | 'year' | 'all') => {
    const now = new Date();
    if (type === 'month') {
      setFilters({
        month: now.getMonth(),
        year: now.getFullYear(),
        category: 'all',
      });
    } else if (type === 'year') {
      setFilters({
        month: 'all',
        year: now.getFullYear(),
        category: 'all',
      });
    } else {
      setFilters({
        month: 'all',
        year: 'all',
        category: 'all',
      });
    }
  };

  /* ---------------- Filter expenses ---------------- */
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const date = parseISO(exp.date);

      const matchCategory =
        filters.category === 'all' || exp.category === filters.category;

      const matchMonth =
        filters.month === 'all' || date.getMonth() === filters.month;

      const matchYear =
        filters.year === 'all' || date.getFullYear() === filters.year;

      return matchCategory && matchMonth && matchYear;
    });
  }, [expenses, filters]);

  /* ---------------- Trend Data ---------------- */
  const trendData = useMemo(() => {
    if (filters.month !== 'all' && filters.year !== 'all') {
      // Single month → show each day
      const daysInMonth = new Date(filters.year, filters.month + 1, 0).getDate();
      return Array.from({ length: daysInMonth }, (_, i) => {
        const day = i + 1;
        const dayExpenses = filteredExpenses.filter(exp => {
          const date = parseISO(exp.date);
          return date.getDate() === day;
        });
        const total = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
        return { label: day.toString(), expenses: total };
      });
    }

    // Default: show last 6 months
    const months = Array.from({ length: 6 }, (_, i) =>
      subMonths(new Date(), 5 - i)
    );

    return months.map(month => {
      const monthExpenses = filteredExpenses.filter(exp => {
        const date = parseISO(exp.date);
        return (
          date.getMonth() === month.getMonth() &&
          date.getFullYear() === month.getFullYear()
        );
      });
      const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { label: format(month, 'MMM'), expenses: total };
    });
  }, [filteredExpenses, filters]);

  /* ---------------- Years list ---------------- */
  const availableYears = Array.from(
    new Set(expenses.map(exp => parseISO(exp.date).getFullYear()))
  ).sort((a, b) => b - a);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      <h3 className="text-lg font-semibold mb-4">Expense Trend</h3>

      {/* Quick Buttons */}
      <div className="dark:text-black flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => handleQuick('month')}
          className="px-3 py-1 bg-green-200 rounded-lg hover:bg-green-300 transition"
        >
          This Month
        </button>
        <button
          onClick={() => handleQuick('year')}
          className="px-3 py-1 bg-blue-200 rounded-lg hover:bg-blue-300 transition"
        >
          This Year
        </button>
        <button
          onClick={() => handleQuick('all')}
          className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
        >
          All Time
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Category */}
        <select
          value={filters.category}
          onChange={e =>
            setFilters(f => ({ ...f, category: e.target.value }))
          }
          className="dark:text-black px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Month */}
        <select
          value={filters.month}
          onChange={e =>
            setFilters(f => ({
              ...f,
              month:
                e.target.value === 'all'
                  ? 'all'
                  : Number(e.target.value),
            }))
          }
          className="dark:text-black px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
        >
          <option value="all">All months</option>
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i} value={i}>
              {new Date(0, i).toLocaleString('default', {
                month: 'long',
              })}
            </option>
          ))}
        </select>

        {/* Year */}
        <select
          value={filters.year}
          onChange={e =>
            setFilters(f => ({
              ...f,
              year:
                e.target.value === 'all'
                  ? 'all'
                  : Number(e.target.value),
            }))
          }
          className="dark:text-black px-3 py-2 rounded-lg bg-muted/50 border border-border/50"
        >
          <option value="all">All years</option>
          {availableYears.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Chart or No Data */}
      {trendData.every(d => d.expenses === 0) ? (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No data</p>
          <p className="text-sm">No expenses for selected filters.</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trendData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={darkMode ? '#4B5563' : '#4B5563'}
            />
            <XAxis dataKey="label" stroke={ darkMode ? '#F9FAFB' : 'var(--color-muted-foreground)'} />
            <YAxis stroke={ darkMode ? '#F9FAFB' : 'var(--color-muted-foreground)'} />
            <Tooltip
              formatter={(value: number | undefined) => formatAmount(currency, value)}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid gray',
                borderRadius: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#B4A7D6"
              strokeWidth={3}
              dot={{ fill: '#B4A7D6', r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};

export const IncomeVsExpenseChart: React.FC = () => {
  const currentUser = getCurrentUser();
  const { expenses, setExpenses, incomeSources, setIncomeSources } = useCustomHook();

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchItemList = async () => {
      try {
        const data = await fetchExpenses(currentUser.id);
        const sorted = (data || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setExpenses(sorted);

        const incomeSourcesData = await getIncomeSources(currentUser.id);
        setIncomeSources(incomeSourcesData as IncomeSource[]);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      }
    };

    fetchItemList();
  }, [currentUser?.id, setExpenses]);

  const currency = currentUser?.currency;

  const data = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i));
    return months.map((month) => {
      const monthExpenses = expenses.filter((expense) => {
        const expenseDate = parseISO(expense.date);
        return (
          expenseDate.getMonth() === month.getMonth() &&
          expenseDate.getFullYear() === month.getFullYear()
        );
      });
      const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncome = incomeSources.reduce((sum, source) => sum + source.amount, 0);
      return {
        month: format(month, 'MMM'),
        income: totalIncome,
        expenses: totalExpenses,
        savings: totalIncome - totalExpenses,
      };
    });
  }, [expenses, incomeSources]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
          <YAxis stroke="var(--color-muted-foreground)" />
          <Tooltip
            formatter={(value: any) => formatAmount(currency,value)}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid gray',
              borderRadius: '12px',
            }}
          />
          <Legend />
          <Bar dataKey="income" fill="#A8D5BA" radius={[8, 8, 0, 0]} />
          <Bar dataKey="expenses" fill="#FFB4B4" radius={[8, 8, 0, 0]} />
          <Bar dataKey="savings" fill="#B4A7D6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export const HeatmapCalendar: React.FC = () => {
  const currentUser = getCurrentUser();
  const { expenses, setExpenses } = useCustomHook();

  const [selectedMonth, setSelectedMonth] = React.useState(new Date());

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchExpensesList = async () => {
      try {
        const data = await fetchExpenses(currentUser.id);
        const sorted = (data || []).sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        setExpenses(sorted);
      } catch (err) {
        console.error('Failed to fetch expenses', err);
      }
    };

    fetchExpensesList();
  }, [currentUser?.id, setExpenses]);

  const currency = currentUser?.currency;

  const formatCurrency = (value?: number | string) => {
    const num = typeof value === 'number' ? value : Number(value ?? 0);
    if (isNaN(num)) return `0.00`;
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // --------------------------- heatmap data ---------------------------
  const heatmapData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const dayExpenses = expenses.filter(
        (expense) =>
          format(parseISO(expense.date), 'yyyy-MM-dd') ===
          format(day, 'yyyy-MM-dd')
      );

      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      return {
        date: format(day, 'd'),
        day: format(day, 'EEE'),
        amount: total,
      };
    });
  }, [expenses, selectedMonth]);

  const getIntensity = (amount: number) => {
    if (amount === 0) return 'bg-muted/20';
    if (amount < 50) return 'bg-green-200 dark:bg-green-900/40';
    if (amount < 150) return 'bg-yellow-200 dark:bg-yellow-900/40';
    if (amount < 300) return 'bg-orange-200 dark:bg-orange-900/40';
    return 'bg-red-200 dark:bg-red-900/40';
  };

  // --------------------------- month navigation ---------------------------
  const prevMonth = () => setSelectedMonth(subMonths(selectedMonth, 1));
  const nextMonth = () => setSelectedMonth(addMonths(selectedMonth, 1));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-card rounded-2xl p-6 shadow-sm border border-border/50"
    >
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="px-3 py-1 rounded bg-aliceblue dark:text-black">
          &lt;
        </button>
        <h3 className="text-lg font-semibold">{format(selectedMonth, 'MMMM yyyy')}</h3>
        <button onClick={nextMonth} className="px-3 py-1 rounded bg-aliceblue dark:text-black">
          &gt;
        </button>
      </div>

      {/* --------------------------- heatmap grid --------------------------- */}
      {/* <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {heatmapData.map((day, index) => (
          <div
            key={index}
            className={`aspect-square rounded-lg flex flex-col items-center justify-center ${getIntensity(
              day.amount
            )} transition-all hover:scale-110 cursor-pointer`}
            title={`${day.day} ${day.date}: ${formatCurrency(day.amount)}`}
          >
            <span className="text-xs font-medium">{day.date}</span>
            {day.amount > 0 && (
              <span className="text-xs text-muted-foreground">
                {formatCurrency(day.amount)}
              </span>
            )}
          </div>
        ))}
      </div> */}

      <div className="grid grid-cols-7 gap-2 sm:gap-3">
        {heatmapData.map((day, index) => (
          <div
            key={index}
            className={`group relative aspect-square rounded-lg
              flex flex-col items-center justify-center
              ${getIntensity(day.amount)}
              transition-all cursor-pointer`}
          >
            {/* Date */}
            <span className="text-[10px] sm:text-xs font-medium z-10">
              {day.date}
            </span>

            {/* Amount (md+ always visible) */}
            {day.amount > 0 && (
              <span className="
                hidden md:block
                text-[10px] text-muted-foreground
                z-10
              ">
                {formatCurrency(day.amount)}
              </span>
            )}

            {/* Amount overlay (mobile & sm only) */}
            {day.amount > 0 && (
              <div className="
                absolute inset-0
                flex items-center justify-center
                bg-black/60 text-white text-[10px]
                rounded-lg
                opacity-0
                group-hover:opacity-100
                md:hidden
                transition-opacity
              ">
                {formatCurrency(day.amount)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* --------------------------- legend --------------------------- */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-muted/20" />
          <span>{formatCurrency(0)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-200 dark:bg-green-900/40" />
          <span>&lt;{formatCurrency(50)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-200 dark:bg-yellow-900/40" />
          <span>&lt;{formatCurrency(150)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-orange-200 dark:bg-orange-900/40" />
          <span>&lt;{formatCurrency(300)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-200 dark:bg-red-900/40" />
          <span>&gt;{formatCurrency(300)}</span>
        </div>
      </div>
    </motion.div>
  );
};
