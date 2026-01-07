import React, { useEffect, useMemo, useState } from 'react';
import {
  format,
  parse
} from 'date-fns';
import {
  Plus,
  Trash2,
  Wallet,
  Pencil
} from 'lucide-react';
import {
  motion,
  AnimatePresence
} from 'motion/react';
import { toast } from 'sonner';
import {
  addIncomeSource,
  deleteIncomeSources,
  getIncomeSources,
  updateIncomeSource
} from '../../../services/incomeSources';
import { formatCurrency } from '../../../misc/utils';
import { INCOME_TYPES } from '../../../misc/constants';
import { IncomeSource } from '../../../misc/interfaces';
import { useCustomHook } from '../../../misc/customHooks';
import { getCurrentUser } from '../../../services/settings-user';
import { IncomeSourcesList } from './IncomeSourcesList';
import { IncomeSourcesSkeleton } from './IncomeSourcesSkeleton';

const PAGE_SIZE = 10;

export const IncomeSources: React.FC = () => {
  const {
    loading,
    setLoading,
    incomeSources,
    setIncomeSources,
    showAddModal,
    setShowAddModal,
    name,
    setName,
    type,
    setType,
    amount,
    setAmount,
  } = useCustomHook();

  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // Filter by purposeMonth
  const [purposeMonth, setPurposeMonth] = useState<string>(format(new Date(), 'yyyy-MM')); // For modal
  const [page, setPage] = useState(1);

  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const data = await getIncomeSources(currentUser.id);
      setIncomeSources(data as IncomeSource[]);
      setLoading(false);
    };
    fetch();
  }, []);

  // Filter + Sort
  const filtered = useMemo(() => {
    let list = [...(incomeSources as IncomeSource[])];

    // Filter by type
    if (filterType !== 'all') {
      list = list.filter(i => i.type === filterType);
    }

    // Filter by purposeMonth
    if (selectedMonth) {
      list = list.filter(i => i.purposeMonth === selectedMonth);
    }

    // Sort
    switch (sortBy) {
      case 'amount':
        list.sort((a, b) => b.amount - a.amount);
        break;
      case 'balance':
        list.sort((a, b) => b.balance - a.balance);
        break;
      case 'name':
        list.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return list;
  }, [incomeSources, filterType, sortBy, selectedMonth]);

  // Pagination
  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  // Total balance
  const totalBalance = useMemo(() => {
    return filtered.reduce((sum, i) => sum + i.balance, 0);
  }, [filtered]);

  // Month
  const months = useMemo(() => {
    const set = new Set<string>();
    (incomeSources as IncomeSource[]).forEach(s => {
      if (s.purposeMonth) set.add(s.purposeMonth);
    });

    // Sort descending
    const monthArray = Array.from(set).sort((a, b) => (a > b ? -1 : 1));
    return [null, ...monthArray]; // null = All Time
  }, [incomeSources]);

  // Add / Update Income Source
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !currentUser?.id || !purposeMonth) return;

    const colors = ['#A8D5BA', '#FFD4A3', '#B4A7D6', '#FFB4B4', '#A3C4F3'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (editingSource) {
      const updatedSource = {
        ...editingSource,
        user_id: currentUser.id,
        name,
        type,
        amount: parseFloat(amount),
        balance: parseFloat(amount),
        color,
        purposeMonth
      };
      setLoading(true);
      const result = await updateIncomeSource(updatedSource);
      if (result) {
        toast.success('Income source updated successfully.');
        setIncomeSources(
          incomeSources.map((src) =>
            src.id === updatedSource.id ? updatedSource : src
          )
        );
        setLoading(false);
      } else {
        toast.error('Failed to update income source.');
        setLoading(false);
      }
    } else {
      setLoading(true);
      const result = await addIncomeSource({
        user_id: currentUser.id,
        name,
        type,
        amount: parseFloat(amount),
        balance: parseFloat(amount),
        color,
        purposeMonth
      });
      if (result) {
        toast.success('Income source added successfully.');
        setIncomeSources([...(incomeSources as IncomeSource[]), result]);
        setLoading(false);
      } else {
        toast.error('Failed to add income source.');
        setLoading(false);
      }
    }

    setName('');
    setAmount('');
    setType('salary');
    setPurposeMonth(format(new Date(), 'yyyy-MM'));
    setShowAddModal(false);
    setEditingSource(null);
  };

  // Delete source
  const deleteSource = async (id: string) => {
    setLoading(true);
    const result = await deleteIncomeSources(id);
    if (result) {
      toast.success('Income source deleted successfully.');
      setIncomeSources(incomeSources.filter((src) => src.id !== id));
      setLoading(false);
    } else {
      toast.error('Failed to delete income source.');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Income Sources</h3>
          <div className="flex gap-2 flex-wrap">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="dark:text-black px-3 py-2 rounded-lg border border-border/50 focus:outline-none focus:border-primary"
            >
              <option value="all">All Types</option>
              {INCOME_TYPES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="dark:text-black px-3 py-2 rounded-lg border border-border/50 focus:outline-none focus:border-primary"
            >
              <option value="amount">Sort by Amount</option>
              <option value="balance">Sort by Balance</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Month Filter */}
            <select
              value={selectedMonth || 'all'}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? null : e.target.value)}
              className="dark:text-black px-3 py-2 rounded-lg border border-border/50 focus:outline-none focus:border-primary"
            >
              <option value="all">All Time</option>
              {months.slice(1).map((m: any) => (
                <option key={m} value={m}>
                  {format(parse(m, 'yyyy-MM', new Date()), 'MMM yyyy')}
                </option>
              ))}
            </select>

            {/* Add Button */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Source
            </button>
          </div>
        </div>

        {/* Total Balance */}
        <div className="bg-gradient-to-br from-[#A8D5BA]/20 to-[#B4A7D6]/20 rounded-2xl p-6 border border-border/50 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-muted-foreground">Total Balance</span>
          </div>
          <h2 className="text-3xl font-bold">{formatCurrency(totalBalance, currentUser.currency)}</h2>
        </div>
        
        {/* Income List */}
        {loading ? (
          <IncomeSourcesSkeleton />
        ) : (
          <IncomeSourcesList
            sources={paginated}
            remove={deleteSource}
            currentUser={currentUser}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        )}

        {/* Add/Edit Modal */}
        <AnimatePresence>
          {showAddModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    {editingSource ? 'Update Income Source' : 'Add Income Source'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Freelance Work"
                        required
                        className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
                      >
                        {INCOME_TYPES.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Amount</label>
                      <input
                        type="number"
                        step="0.01"
                        value={amount ? amount : ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '') {
                            setAmount('');
                            return;
                          }
                          if (/^\d+(\.\d{0,2})?$/.test(val)) {
                            setAmount(val);
                          }
                        }}
                        placeholder="0.00"
                        required
                        className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Month/Year (Purpose)</label>
                      <input
                        type="month"
                        value={purposeMonth}
                        onChange={(e) => setPurposeMonth(e.target.value)}
                        required
                        className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSource(null);
                          setName('');
                          setAmount('');
                          setType('salary');
                          setPurposeMonth(format(new Date(), 'yyyy-MM'));
                          setShowAddModal(false);
                        }}
                        className="flex-1 py-3 bg-muted rounded-xl hover:bg-accent transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all"
                      >
                        {editingSource ? 'Update Source' : 'Add Source'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
