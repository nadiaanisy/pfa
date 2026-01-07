import React, {
  useEffect,
  useMemo,
  useState
} from 'react';
import { toast } from 'sonner';
import {
  deleteExpense,
  fetchExpenses
} from '../../../services/expenses';
import {
  formatCurrency,
  usePagination
} from '../../../misc/utils';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { ExpensesGrid } from './ExpensesGrid';
import { AddExpenseModal } from './AddExpenseModal';
import { CATEGORIES } from '../../../misc/constants';
import { ExpensesSkeleton } from './ExpensesSkeleton';
import { ExpensePagination } from './ExpensePagination';
import { IncomeSource } from '../../../misc/interfaces';
import { RecurringExpenses } from './RecurringExpenses';
import { useCustomHook } from '../../../misc/customHooks';
import { getCurrentUser } from '../../../services/settings-user';
import { getIncomeSources } from '../../../services/incomeSources';

export const Expenses: React.FC = () => {
  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSource,
    setSelectedSource,
    showAddModal,
    setShowAddModal,
    incomeSources,
    setIncomeSources,
    expenses,
    setExpenses,
    refreshKey,
    setRefreshKey,
    loading,
    setLoading
  } = useCustomHook();

  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date_desc');

  const currentUser = getCurrentUser();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [srcs, exps] = await Promise.all([
        getIncomeSources(currentUser.id),
        fetchExpenses(currentUser.id)
      ])
      setIncomeSources(srcs as IncomeSource[]);

      const sorted = (exps || []).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setExpenses(sorted);
      setLoading(false);
    };
    load();
  }, [refreshKey]);

  // Generate unique months for dropdown
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    expenses.forEach((exp) => {
      if (exp.date) {
        monthSet.add(format(new Date(exp.date), 'yyyy-MM'));
      }
    });
    const monthArray = Array.from(monthSet).sort((a, b) => b.localeCompare(a));
    return ['all', ...monthArray];
  }, [expenses]);

  // Filter + sort expenses
  const filteredExpenses = useMemo(() => {
    let list = expenses.filter((expense) => {
      const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || expense.category === selectedCategory;
      const matchesSource = selectedSource === 'All' || String(expense.income_source_id) === selectedSource;
      const matchesMonth = selectedMonth === 'all' || format(new Date(expense.date), 'yyyy-MM') === selectedMonth;
      return matchesSearch && matchesCategory && matchesSource && matchesMonth;
    });

    // Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'date_asc':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount_desc':
          return b.amount - a.amount;
        case 'amount_asc':
          return a.amount - b.amount;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'source':
          const srcA = incomeSources.find(s => s.id === a.income_source_id)?.name || '';
          const srcB = incomeSources.find(s => s.id === b.income_source_id)?.name || '';
          return srcA.localeCompare(srcB);
        default:
          return 0;
      }
    });

    return list;
  }, [expenses, searchTerm, selectedCategory, selectedSource, selectedMonth, sortBy, incomeSources]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  }, [filteredExpenses]);

  const {
    paginated,
    page,
    setPage,
    totalPages
  } = usePagination(filteredExpenses, 10);

  return (
    <div className="h-full overflow-y-auto px-2 sm:px-4">
      <div className="space-y-6">

        {/* Recurring Expenses */}
        <RecurringExpenses
          expenses={expenses}
          currency={currentUser.currency}
          loading={loading}
        />

        {/* Expenses List */}
        <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-sm border border-border/50">
          {/*Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div>
              <h2 className="text-2xl font-semibold">All Expenses</h2>
              <p className="text-muted-foreground">
                Total: {filteredExpenses.length} transactions • Total Spent: {formatCurrency(totalSpent, currentUser.currency)}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all w-full sm:w-auto"
            >
              Add Expense
            </button>
          </div>

          {/*Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1 relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expenses..."
                className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors dark:text-black"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="dark:text-black px-4 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="dark:text-black px-4 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="All">All Sources</option>
                {incomeSources.map((source) => (
                  <option key={source.id} value={source.id}>{source.name}</option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="dark:text-black px-4 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month === 'all' ? 'All Months' : format(new Date(month + '-01'), 'MMM yyyy')}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="dark:text-black px-4 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
              >
                <option value="date_desc">Date ↓</option>
                <option value="date_asc">Date ↑</option>
                <option value="amount_desc">Amount ↓</option>
                <option value="amount_asc">Amount ↑</option>
                <option value="category">Category</option>
                <option value="source">Income Source</option>
              </select>
            </div>
          </div>

          {/* Expenses List */}
          <div className="w-full overflow-x-auto">
            {loading ? (
              <ExpensesSkeleton />
            ) : (
              <>
              <ExpensesGrid
                expenses={paginated}
                incomeSources={incomeSources}
                currency={currentUser.currency}
                onEdit={async (expense) => {
                  setEditingExpense(expense);
                  setShowAddModal(true);
                }}
                onDelete={async (expense) => {
                  const ok = await deleteExpense(expense);
                  if (ok) {
                    setExpenses(prev => prev.filter(e => e.id !== expense.id));
                    toast.success('Expense deleted');
                  }
                }}
              />
              <ExpensePagination
                page={page}
                totalPages={totalPages}
                setPage={setPage}
              />
              </>
            )}
          </div>
        </div>
        
        {showAddModal && (
          <AddExpenseModal
            isOpen={showAddModal}
            onClose={() => {
              setShowAddModal(false);
              setEditingExpense(null);
            }}
            onSuccess={() => {
              setRefreshKey(prev => prev + 1);
              setEditingExpense(null); 
            }}
            expenseToEdit={editingExpense}
          />
        )}
      </div> 
    </div>
  );
};
