import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Wallet, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import {
  addIncomeSource,
  deleteIncomeSources,
  getIncomeSources,
  updateIncomeSource
} from '../../services/incomeSources';
import { INCOME_TYPES } from '../../misc/constants';
import { IncomeSource } from '../../misc/interfaces';
import { useCustomHook } from '../../misc/customHooks';
import { getCurrentUser } from '../../services/settings-user';
import { format, parse } from 'date-fns';

export const IncomeSources: React.FC = () => {
  const {
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
    user,
    setUser,
  } = useCustomHook();

  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // Filter by purposeMonth
  const [purposeMonth, setPurposeMonth] = useState<string>(format(new Date(), 'yyyy-MM')); // For modal

  const currentUser = getCurrentUser();

  // Fetch income sources
  useEffect(() => {
    const fetchIncomeSources = async () => {
      setUser(currentUser);
      const data = await getIncomeSources(currentUser.id);
      setIncomeSources(data as IncomeSource[]);
    };
    fetchIncomeSources();
  }, []);

  // Filter + Sort
  const filteredSources = useMemo(() => {
    let sources = [...(incomeSources as IncomeSource[])];

    // Filter by type
    if (filterType !== 'all') {
      sources = sources.filter((src) => src.type === filterType);
    }

    // Filter by purposeMonth
    if (selectedMonth) {
      sources = sources.filter((src) => src.purposeMonth === selectedMonth);
    }

    // Sort
    switch (sortBy) {
      case 'name':
        sources.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'amount':
        sources.sort((a, b) => b.amount - a.amount);
        break;
      case 'balance':
        sources.sort((a, b) => b.balance - a.balance);
        break;
    }

    return sources;
  }, [incomeSources, filterType, sortBy, selectedMonth]);

  // Total balance
  const totalBalance = useMemo(() => {
    return filteredSources.reduce((sum, src) => sum + src.balance, 0);
  }, [filteredSources]);

  // Get all unique purpose months for filter, sorted descending
  const months = useMemo(() => {
    const monthSet = new Set<string>();
    (incomeSources as IncomeSource[]).forEach((src) => {
      if (src.purposeMonth) monthSet.add(src.purposeMonth);
    });

    // Sort descending
    const monthArray = Array.from(monthSet).sort((a, b) => (a > b ? -1 : 1));
    return [null, ...monthArray]; // null = All Time
  }, [incomeSources]);

  // Add / Update Income Source
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !user?.id || !purposeMonth) return;

    const colors = ['#A8D5BA', '#FFD4A3', '#B4A7D6', '#FFB4B4', '#A3C4F3'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (editingSource) {
      const updatedSource = {
        ...editingSource,
        user_id: user.id,
        name,
        type,
        amount: parseFloat(amount),
        balance: parseFloat(amount),
        color,
        purposeMonth
      };
      const result = await updateIncomeSource(updatedSource);
      if (result) {
        toast.success('Income source updated successfully.');
        setIncomeSources(
          incomeSources.map((src) =>
            src.id === updatedSource.id ? updatedSource : src
          )
        );
      } else {
        toast.error('Failed to update income source.');
      }
    } else {
      const result = await addIncomeSource({
        user_id: user.id,
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
      } else {
        toast.error('Failed to add income source.');
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
    setLoading(false);
    if (result) {
      toast.success('Income source deleted successfully.');
      setIncomeSources(incomeSources.filter((src) => src.id !== id));
    } else {
      toast.error('Failed to delete income source.');
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
              className="px-3 py-2 rounded-lg border border-border/50 focus:outline-none focus:border-primary"
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
              className="px-3 py-2 rounded-lg border border-border/50 focus:outline-none focus:border-primary"
            >
              <option value="amount">Sort by Amount</option>
              <option value="balance">Sort by Balance</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Month Filter */}
            <select
              value={selectedMonth || 'all'}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? null : e.target.value)}
              className="px-3 py-2 rounded-lg border border-border/50 focus:outline-none focus:border-primary"
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
          <h2 className="text-3xl font-bold">
            {new Intl.NumberFormat('en-MY', {
              style: 'currency',
              currency: currentUser.currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(totalBalance)}
          </h2>
        </div>

        {/* Income List */}
        {filteredSources.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>No data for this selection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {filteredSources.map((source, index) => (
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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{source.name}</h4>
                      <span className="text-xs text-muted-foreground capitalize bg-muted/50 px-2 py-1 rounded-lg">
                        {source.type} - {format(parse(source.purposeMonth, 'yyyy-MM', new Date()), 'MMM yyyy')}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        onClick={() => deleteSource(source.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Income</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: currentUser.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(source.amount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Current Balance</span>
                      <span className="font-semibold text-lg" style={{ color: source.color }}>
                        {new Intl.NumberFormat('en-MY', {
                          style: 'currency',
                          currency: currentUser.currency,
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(source.balance)}
                      </span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-2 mt-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.max(0, Math.min(100, (source.balance / source.amount) * 100))}%`,
                          backgroundColor: source.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
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
                        className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer"
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
                        className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Month/Year (Purpose)</label>
                      <input
                        type="month"
                        value={purposeMonth}
                        onChange={(e) => setPurposeMonth(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
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
