import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
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
} from '../../services/incomeSources';
import React, { useEffect } from 'react';
import { INCOME_TYPES } from '../../misc/constants';
import { IncomeSource } from '../../misc/interfaces';
import { useCustomHook } from '../../misc/customHooks';
import { getCurrentUser } from '../../services/settings-user';

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
    setUser
  } = useCustomHook();

  const [editingSource, setEditingSource] = React.useState<IncomeSource | null>(null);

  useEffect(() => {
    const fetchIncomeSources = async () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      const data = await getIncomeSources(currentUser.id);
      setIncomeSources(data as IncomeSource[]);
    }
    fetchIncomeSources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || !user?.id) return;

    const colors = ['#A8D5BA', '#FFD4A3', '#B4A7D6', '#FFB4B4', '#A3C4F3'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    if (editingSource) {
      const updatedSource = { ...editingSource, user_id: user.id, name, type, amount: parseFloat(amount), balance: parseFloat(amount), color };
      const result = await updateIncomeSource(updatedSource);
      if (result) {
        toast.success('Income source updated successfully.');
        setIncomeSources(incomeSources.map(src => src.id === updatedSource.id ? updatedSource : src));
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
      })
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
    setShowAddModal(false);
    setEditingSource(null);
  };

  const deleteIncomeSource = async (id: string) => {
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

  const getTotalBalance = () => incomeSources.reduce((sum, source) => sum + source.balance, 0);

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Income Sources</h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#A8D5BA]/20 to-[#B4A7D6]/20 rounded-2xl p-6 border border-border/50 mt-6">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-6 h-6 text-primary" />
            <span className="text-muted-foreground">Total Balance</span>
          </div>
          <h2 className="text-3xl font-bold">
            {new Intl.NumberFormat('en-MY', {
              style: 'currency',
              currency: getCurrentUser().currency,
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }).format(getTotalBalance())}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {incomeSources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
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
                      {source.type}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSource(source);
                      setName(source.name);
                      setAmount(source.amount.toString());
                      setType(source.type);
                      setShowAddModal(true);
                    }}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Pencil className="w-4 h-4 text-destructive" />
                  </button>
                  <button
                    onClick={() => deleteIncomeSource(source.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Income</span>
                    <span className="font-medium">
                      {new Intl.NumberFormat('en-MY', {
                        style: 'currency',
                        currency: getCurrentUser().currency,
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
                        currency: getCurrentUser().currency,
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

        <AnimatePresence>
          {showAddModal && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              />

              {/* Centered modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Add Income Source</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Freelance Work"
                        required
                        className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors dark:text-black"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-muted-foreground mb-2">Type</label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value as any)}
                        className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors cursor-pointer dark:text-black"
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
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground dark:text-black" />
                        <input
                          type="number"
                          step="0.01"
                          value={amount ? parseFloat(amount).toFixed(2) : ''}
                          onChange={(e) => {
                            let val = e.target.value;

                            // Allow empty input
                            if (val === '') {
                              setAmount('');
                              return;
                            }

                            // Only allow up to 2 decimals
                            if (/^\d+(\.\d{0,2})?$/.test(val)) {
                              setAmount(val);
                            }
                          }}
                          onBlur={() => {
                            // Ensure exactly 2 decimals on blur
                            if (amount !== '') {
                              setAmount(parseFloat(amount).toFixed(2));
                            }
                          }}
                          placeholder="0.00"
                          required
                          className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors dark:text-black"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingSource(null);
                          setName('');
                          setAmount('');
                          setType('salary');
                          setShowAddModal(false)
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
}