import React, {
  useMemo,
  useEffect
} from 'react';
import {
  motion,
  AnimatePresence
} from 'motion/react';
import { 
  Plus, 
  Trash2, 
  X,
  Calendar, 
  User, 
  CheckCircle,
  FileText,
  TrendingDown,
  TrendingUp,
  History,
  Coins
} from 'lucide-react';
import {
  formatCurrency,
  getPriorityColor,
  getStatusColor,
  getStatusIcon
} from '../../misc/utils';
import {
  addDebt,
  addDebtPayment,
  deleteDebt,
  deleteDebtPayment,
  fetchDebts,
  updateDebt
} from '../../services/debts';
import { toast } from 'sonner';
import { format, parseISO, isPast } from 'date-fns';
import { useCustomHook } from '../../misc/customHooks';
import { DebtSummary } from './DebtTracker/DebtSummary';
import { DebtSection } from './DebtTracker/DebtSection';
import { getCurrentUser } from '../../services/settings-user';

export const DebtTracker: React.FC = () => {
  const [isAddingDebt, setIsAddingDebt] = React.useState(false);
  const [isUpdatingDebt, setIsUpdatingDebt] = React.useState(false);
  const [isDeletingDebt, setIsDeletingDebt] = React.useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all');
  const [filterPriority, setFilterPriority] = React.useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [searchPerson, setSearchPerson] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'newest' | 'oldest' | 'amountHigh' | 'amountLow' | 'dueSoon' | 'nameAZ' | 'nameZA'>('newest');

  const currentUser = getCurrentUser();
  const {
    debts,
    setDebts,
    showAddModal,
    setShowAddModal,
    editingDebt,
    setEditingDebt,
    showPaymentModal,
    setShowPaymentModal,
    showPaymentHistory,
    setShowPaymentHistory,
    debtType,
    setDebtType,
    personName,
    setPersonName,
    totalAmount,
    setTotalAmount,
    description,
    setDescription,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    optionalCategory,
    setOptionalCategory,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    paymentNote,
    setPaymentNote,
    setRefreshKey,
    refreshKey,
  } = useCustomHook();

  useEffect(() => {
    const fetch = async () => {
      const data = await fetchDebts(currentUser.id);
      setDebts(data);
    };
    fetch();
  }, [refreshKey]);

  const resetForm = () => {
    setDebtType('owe');
    setPersonName('');
    setTotalAmount('');
    setDescription('');
    setDueDate('');
    setPriority('low');
    setOptionalCategory('');
  };

  const resetPaymentForm = () => {
    setPaymentAmount('');
    setPaymentDate(format(new Date(), 'yyyy-MM-dd'));
    setPaymentNote('');
  };

  const summary = useMemo(() => {
    const normalizeAmount = (d: any) => typeof d.remaining_amount === 'number' ? d.remaining_amount : d.total_amount ?? 0;

    const youOwe = debts.filter(d => d.type === 'owe' && d.status !== 'paid').reduce((sum, d) => sum + normalizeAmount(d), 0);
    const othersOwe = debts.filter(d => d.type === 'owed' && d.status !== 'paid').reduce((sum, d) => sum + normalizeAmount(d), 0);

    const totalDebts = debts.filter(d => d.type === 'owe').length;
    const totalLoans = debts.filter(d => d.type === 'owed').length;

    return { youOwe, othersOwe, totalDebts, totalLoans };
  }, [debts]);

  const applyFilters = (debtList: any[]) => {
    return debtList.filter(d => {
      // Status filter
      if (filterStatus !== 'all') {
        if (filterStatus === 'paid' && d.status !== 'paid') return false;
        if (filterStatus === 'unpaid' && d.status === 'paid') return false;
        if (filterStatus === 'overdue') {
          if (!d.due_date || !isPast(parseISO(d.due_date)) || d.status === 'paid') return false;
        }
      }

      // Priority filter
      if (filterPriority !== 'all' && d.priority !== filterPriority) {
        return false;
      }

      // Search by person
      if (searchPerson.trim()) {
        if (!d.person_name.toLowerCase().includes(searchPerson.toLowerCase())) {
          return false;
        }
      }

      return true;
    });
  };

  const applySorting = (debtList: any[]) => {
    return [...debtList].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

        case 'amountHigh':
          return (b.remaining_amount ?? b.total_amount) - (a.remaining_amount ?? a.total_amount);

        case 'amountLow':
          return (a.remaining_amount ?? a.total_amount) - (b.remaining_amount ?? b.total_amount);

        case 'dueSoon':
          if (!a.due_date) return 1;
          if (!b.due_date) return -1;
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();

        case 'nameAZ':
          return a.person_name.localeCompare(b.person_name);

        case 'nameZA':
          return b.person_name.localeCompare(a.person_name);

        default: // newest
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  };

  const youOweDebts = applySorting(applyFilters(debts.filter(d => d.type === 'owe')));
  const othersOweDebts = applySorting(applyFilters(debts.filter(d => d.type === 'owed')));
  const selectedDebt = debts.find(d => d.id === showPaymentModal);
  const remainingAmount = selectedDebt?.remaining_amount ?? selectedDebt?.total_amount ?? 0;

  const startEdit = (debt: any) => {
    setEditingDebt(debt.id);
    setDebtType(debt.type);
    setPersonName(debt.person_name);
    setTotalAmount(debt.total_amount.toString());
    setDescription(debt.description);
    setDueDate(debt.due_date || '');
    setPriority(debt.priority || 'medium');
    setOptionalCategory(debt.category || '');
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();

    if (parseFloat(totalAmount) <= 0) {
      toast.error('Total amount must be greater than 0.');
      return;
    }

    setIsAddingDebt(true);

    const debtToAdd = {
      user_id: currentUser.id,
      type: debtType,
      person_name: personName,
      description,
      total_amount: parseFloat(totalAmount),
      due_date: dueDate || undefined,
      priority,
      category: optionalCategory || undefined,
    }
    
    const result = await addDebt(debtToAdd);
    if (result) {
      toast.success(`Debt ${debtType === 'owe' ? 'you owe' : 'owed to you'} added successfully!`);
      setRefreshKey(prev => prev + 1);
      resetForm();
      setShowAddModal(false);
    } else {
      toast.error('Failed to update income source.');
    }
    setIsAddingDebt(false);
  };

  const handleUpdateDebt = async (debtId: string) => {
    if (isUpdatingDebt) return;

    const debt = debts.find(d => d.id === debtId);
    if (!debt) return;

    setIsUpdatingDebt(true);

    const updatedTotal = parseFloat(totalAmount);
    if (updatedTotal <= 0) {
      toast.error('Total amount must be greater than 0.');
      return;
    }

    const totalPaid = debt.payments?.reduce((sum: number, p: any) => sum + p.amount, 0) ?? 0;
    const newRemaining = Math.max(updatedTotal - totalPaid, 0);
    const isPaid = newRemaining === 0;

    const updatedDebtData = {
      person_name: personName,
      description,
      total_amount: updatedTotal,
      remaining_amount: newRemaining,
      due_date: dueDate || null,
      priority: priority || null,
      category: optionalCategory || null,
      status: isPaid ? 'paid' : debt.status,
    };

    const result = await updateDebt(debtId, updatedDebtData);
    if (result) {
      toast.success('Debt updated successfully!');
      setRefreshKey(prev => prev + 1);
      setEditingDebt(null);
      resetForm();
    } else {
      toast.error('Failed to update debt.');
    }
    setIsUpdatingDebt(false);
  };

  const handleDeleteDebt = async (debtId: string, debtType: string) => {
    if (isDeletingDebt) return;

    setIsDeletingDebt(debtId);

    const result = await deleteDebt(debtId);
    if (result) {
      toast.success(debtType === 'owe' ? 'Debt deleted successfully.' : 'Loan deleted successfully.');
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error(debtType === 'owe' ? 'Failed to delete debt.' : 'Failed to delete loan.');
    }
    setIsDeletingDebt(null);
  };

  const handleAddPayment = async (debtId: string | null) => {
    if (isAddingPayment || !paymentAmount) return;

    setIsAddingPayment(true);

    const debt = debts.find(d => d.id === showPaymentModal);
    if (!debt) return;

    const amount = Number(paymentAmount);
    if (amount <= 0) return;

    const currentRemaining = debt.remaining_amount ?? debt.total_amount;
    const newRemaining = Math.max(currentRemaining - amount, 0);
    const isPaid = newRemaining === 0;

    const paymentDataToAdd = {
      debt_id: debt.id,
      amount,
      date: paymentDate,
      note: paymentNote || null,
    };

    const result = await addDebtPayment(paymentDataToAdd, newRemaining, isPaid);
    if (result) {
      toast.success('Payment recorded successfully!');
      setRefreshKey(prev => prev + 1);
      resetPaymentForm();
      setShowPaymentModal(null);
    } else {
      toast.error('Failed to record payment.');
    }
    setIsAddingPayment(false);
  };

  const handleDeletePayment = async (debtId: string | null, paymentId: string) => {
    if (!debtId || isDeletingPayment) return;

    setIsDeletingPayment(paymentId);

    const result = await deleteDebtPayment(debtId, paymentId);
    if (result) {
      toast.success('Payment deleted successfully.');
      setRefreshKey(prev => prev + 1);
    } else {
      toast.error('Failed to delete payment.');
    }
    setIsDeletingPayment(null);
  };

  const editFormProps = {
    personName,
    setPersonName,
    totalAmount,
    setTotalAmount,
    description,
    setDescription,
    dueDate,
    setDueDate,
    priority,
    setPriority,
    isUpdatingDebt,
    handleUpdateDebt,
    cancelEdit: () => {
      setEditingDebt(null);
      resetForm();
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Debt Tracker</h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Summary Cards */}
        <DebtSummary
          summary={summary}
          currency={currentUser.currency}
        />

        {/* Filter and Action Button */}
        <div className="flex justify-center md:justify-end gap-3">
          {/* Search */}
          <input
            type="text"
            placeholder="Search person..."
            value={searchPerson}
            onChange={(e) => setSearchPerson(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-muted/50"
          />

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 border rounded-lg bg-muted/50"
          >
            <option value="all">All Status</option>
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>

          {/* Priority */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="px-3 py-2 border rounded-lg bg-muted/50"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg bg-muted/50"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="amountHigh">Amount: High → Low</option>
            <option value="amountLow">Amount: Low → High</option>
            <option value="dueSoon">Due Date: Soonest</option>
            <option value="nameAZ">Name: A → Z</option>
            <option value="nameZA">Name: Z → A</option>
          </select>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Debt/Loan
          </button>
        </div>

        {/* You Owe Section */}
        <DebtSection
          title="You Owe"
          debts={youOweDebts}
          currency={currentUser.currency}
          gradient="bg-gradient-to-r from-red-500 to-orange-500"
          editingDebt={editingDebt}
          onEdit={startEdit}
          onDelete={(debt: any) => handleDeleteDebt(debt.id, 'owe')}
          onPayment={(debtId: string) => setShowPaymentModal(debtId)}
          onHistory={(debtId: string) => setShowPaymentHistory(debtId)}
          editFormProps={editFormProps}
        />

        {/* Others Owe You Section */}
        <DebtSection
          title="Others Owe You"
          debts={othersOweDebts}
          currency={currentUser.currency}
          gradient="bg-gradient-to-r from-green-500 to-emerald-500"
          editingDebt={editingDebt}
          onEdit={startEdit}
          onDelete={(debt: any) => handleDeleteDebt(debt.id, 'loan')}
          onPayment={(debtId: string) => setShowPaymentModal(debtId)}
          onHistory={(debtId: string) => setShowPaymentHistory(debtId)}
          editFormProps={editFormProps}
        />
      </motion.div>

      {/* Add Debt Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-4 md:left-[35%] md:-translate-x-1/2 md:-translate-y-1/2 md:flex md:flex-col md:justify-center md:w-full md:max-w-lg bg-card rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold">Add Debt/Loan</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDebt} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDebtType('owe')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        debtType === 'owe'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${debtType === 'owe' ? 'text-red-500' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium">You Owe</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDebtType('owed')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        debtType === 'owed'
                          ? 'border-green-500 bg-green-500/10'
                          : 'border-border/50 hover:border-border'
                      }`}
                    >
                      <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${debtType === 'owed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                      <p className="text-sm font-medium">Others Owe You</p>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Person Name</label>
                  <div className="relative">
                    <User className="dark:text-black absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="dark:text-black w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Amount</label>
                  <div className="relative">
                    <Coins className="dark:text-black absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      step="0.01"
                      value={totalAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setTotalAmount('');
                          return;
                        }
                        if (/^\d+(\.\d{0,2})?$/.test(value)) {
                          setTotalAmount(value);
                        }
                      }}
                      className="dark:text-black w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Description</label>
                  <div className="relative">
                    <FileText className="dark:text-black absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="dark:text-black w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
                      rows={3}
                      placeholder="What is this debt for?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Due Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="dark:text-black absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="dark:text-black w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="" hidden disabled>Select Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Category (Optional)</label>
                  <input
                    type="text"
                    value={optionalCategory}
                    onChange={(e) => setOptionalCategory(e.target.value)}
                    className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    placeholder="e.g., Personal, Business"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAddingDebt}
                  className="w-full py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  {isAddingDebt ? 'Adding...' : `Add ${debtType === 'owe' ? 'Debt' : 'Loan'}`}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => {
                setShowPaymentModal(null);
                resetPaymentForm();
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-[40%] top-[20%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold">Record Payment</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(null);
                    resetPaymentForm();
                  }}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Payment Amount</label>
                  <div className="relative">
                    <Coins className="dark:text-black absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '') {
                          setPaymentAmount('');
                          return;
                        }
                        if (/^\d+(\.\d{0,2})?$/.test(value)) {
                          setPaymentAmount(value);
                        }
                      }}
                      className="dark:text-black w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {showPaymentModal && debts.find(d => d.id === showPaymentModal) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining: {formatCurrency(remainingAmount, currentUser.currency)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Payment Date</label>
                  <div className="relative">
                    <Calendar className="dark:text-black absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="dark:text-black w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Note (Optional)</label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="dark:text-black w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
                    rows={2}
                    placeholder="Add a note about this payment..."
                  />
                </div>

                <button
                  disabled={isAddingPayment}
                  onClick={() => handleAddPayment(showPaymentModal)}
                  className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  {isAddingPayment ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment History Modal */}
      <AnimatePresence>
        {showPaymentHistory && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowPaymentHistory(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-[40%] top-[20%] -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card rounded-3xl shadow-2xl z-50 overflow-hidden max-h-[80vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-border/50">
                <h2 className="text-xl font-semibold">Payment History</h2>
                <button
                  onClick={() => setShowPaymentHistory(null)}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-accent flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
                {showPaymentHistory && debts.find(d => d.id === showPaymentHistory)?.payments?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3" />
                    <p className="font-medium mb-1">No payments yet</p>
                    <p className="text-sm">Payment history will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {showPaymentHistory && debts.find(d => d.id === showPaymentHistory)?.payments?.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-start justify-between p-4 rounded-xl border border-border/50 bg-muted/20"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium">
                              {
                                new Intl.NumberFormat('en-MY', {
                                style: 'currency',
                                currency: currentUser.currency,
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }).format(payment.amount)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.date).toLocaleDateString()}
                          </p>
                          {payment.note && (
                            <p className="text-xs text-muted-foreground mt-1">{payment.note}</p>
                          )}
                        </div>
                        <button
                          disabled={isDeletingPayment === payment.id}
                          onClick={() => {
                            handleDeletePayment(showPaymentHistory, payment.id);
                          }}
                          className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}