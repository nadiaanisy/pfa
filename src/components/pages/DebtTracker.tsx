import React, {
  useMemo,
  useEffect
} from 'react';
import {
  motion,
  AnimatePresence
} from 'motion/react';
import { 
  HandCoins, 
  Plus, 
  Edit, 
  Trash2, 
  X,
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  TrendingDown,
  TrendingUp,
  History,
  Coins
} from 'lucide-react';
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
import { getCurrentUser } from '../../services/settings-user';

export const DebtTracker: React.FC = () => {
  const [isAddingDebt, setIsAddingDebt] = React.useState(false);
  const [isUpdatingDebt, setIsUpdatingDebt] = React.useState(false);
  const [isDeletingDebt, setIsDeletingDebt] = React.useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = React.useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = React.useState<string | null>(null);

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
    refreshKey
  } = useCustomHook();

  useEffect(() => {
    const fetchDebtsData = async () => {
      const data = await fetchDebts(currentUser.id);
      setDebts(data);
    };
    fetchDebtsData();
  }, [refreshKey]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#A8D5BA';
      case 'partial': return '#FFD93D';
      case 'overdue': return '#FF6B6B';
      default: return '#B4A7D6';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return CheckCircle;
      case 'partial': return Clock;
      case 'overdue': return AlertCircle;
      default: return Coins;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF6B6B';
      case 'medium': return '#FFD93D';
      case 'low': return '#A8D5BA';
      default: return '#B4A7D6';
    }
  };

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
    const normalizeAmount = (d: any) =>
      typeof d.remaining_amount === 'number'
        ? d.remaining_amount
        : d.total_amount ?? 0;

    const youOwe = debts
      .filter(d => d.type === 'owe' && d.status !== 'paid')
      .reduce((sum, d) => sum + normalizeAmount(d), 0);

    const othersOwe = debts
      .filter(d => d.type === 'owed' && d.status !== 'paid')
      .reduce((sum, d) => sum + normalizeAmount(d), 0);

    const totalDebts = debts.filter(d => d.type === 'owe').length;
    const totalLoans = debts.filter(d => d.type === 'owed').length;

    return {
      youOwe,
      othersOwe,
      totalDebts,
      totalLoans,
    };
  }, [debts]);

  const youOweDebts = debts.filter(d => d.type === 'owe');
  const othersOweDebts = debts.filter(d => d.type === 'owed');
  const selectedDebt = debts.find(d => d.id === showPaymentModal);
  const remainingAmount = selectedDebt?.remaining_amount ?? selectedDebt?.total_amount ?? 0;

  const getDebtStatus = (debt: any) => {
    if (debt.remainingAmount <= 0) return 'paid';

    if (
      debt.due_date &&
      isPast(parseISO(debt.due_date)) &&
      debt.status !== 'paid'
    ) {
      return 'overdue';
    }

    if ((debt.payments?.length ?? 0) > 0 && debt.remainingAmount > 0) {
      return 'partial';
    }

    return 'active';
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
      setRefreshKey(prev => prev + 1); // triggers useEffect fetch
      resetForm();
      setShowAddModal(false);
      setIsAddingDebt(false);
    } else {
      toast.error('Failed to update income source.');
      setIsAddingDebt(false);
    }
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
      setIsUpdatingDebt(false);
    } else {
      toast.error('Failed to update debt.');
      setIsUpdatingDebt(false);
    }
  };

  const handleDeleteDebt = async (debtId: string, debtType: string) => {
    if (isDeletingDebt) return;

    setIsDeletingDebt(debtId);

    const result = await deleteDebt(debtId);
    if (result) {
      toast.success(debtType === 'owe' ? 'Debt deleted successfully.' : 'Loan deleted successfully.');
      setRefreshKey(prev => prev + 1);
      setIsDeletingDebt(null);
    } else {
      toast.error(debtType === 'owe' ? 'Failed to delete debt.' : 'Failed to delete loan.');
      setIsDeletingDebt(null);
    }
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
      setIsAddingPayment(false);
    } else {
      toast.error('Failed to record payment.');
      setIsAddingPayment(false);
    }
  };

  const handleDeletePayment = async (debtId: string | null, paymentId: string) => {
    if (!debtId || isDeletingPayment) return;

    setIsDeletingPayment(paymentId);

    const result = await deleteDebtPayment(debtId, paymentId);
    if (result) {
      toast.success('Payment deleted successfully.');
      setRefreshKey(prev => prev + 1);
      setIsDeletingPayment(null);
    } else {
      toast.error('Failed to delete payment.');
      setIsDeletingPayment(null);
    }
  };

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

  

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Debt Tracker</h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <h3 className="text-sm text-muted-foreground">You Owe</h3>
            </div>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
              {
                new Intl.NumberFormat('en-MY', {
                  style: 'currency',
                  currency: currentUser.currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              ).format(summary.youOwe)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{summary.totalDebts} debts</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <h3 className="text-sm text-muted-foreground">Others Owe You</h3>
            </div>
            <p className="text-2xl font-semibold text-green-600 dark:text-green-400">
              {
                new Intl.NumberFormat('en-MY', {
                  style: 'currency',
                  currency: currentUser.currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              ).format(summary.othersOwe)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{summary.totalLoans} loans</p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm text-muted-foreground">Net Position</h3>
            </div>
            <p className={`text-2xl font-semibold ${summary.othersOwe - summary.youOwe >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {
                new Intl.NumberFormat('en-MY', {
                  style: 'currency',
                  currency: currentUser.currency,
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }
              ).format((summary.othersOwe - summary.youOwe))}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.othersOwe - summary.youOwe >= 0 ? 'In your favor' : 'You owe more'}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <HandCoins className="w-5 h-5 text-purple-500" />
              <h3 className="text-sm text-muted-foreground">Total Tracked</h3>
            </div>
            <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">
              {debts.length}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Active records</p>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#4F6B52] to-[#5B3E80] text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Debt/Loan
          </button>
        </div>

        {/* You Owe Section */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <h3 className="text-lg font-semibold">You Owe</h3>
            <span className="ml-auto text-sm text-muted-foreground">
              {youOweDebts.length} {youOweDebts.length === 1 ? 'debt' : 'debts'}
            </span>
          </div>

          <div className="space-y-4">
            {youOweDebts.map((debt: any, index: any) => {
              const StatusIcon = getStatusIcon(getDebtStatus(debt));
              const percentage = ((debt.total_amount - (typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount)) / debt.total_amount) * 100;
              const isEditing = editingDebt === debt.id;

              return (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-border/50 bg-muted/20"
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateDebt(debt.id);
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Edit Debt</span>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isUpdatingDebt}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                          >
                            {isUpdatingDebt ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDebt(null);
                              resetForm();
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Person Name</label>
                          <input
                            type="text"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Total Amount</label>
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
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Description</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Due Date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                          >
                            <option value="" hidden disabled>Select Priority</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className="w-5 h-5" style={{ color: getStatusColor(getDebtStatus(debt)) }} />
                            <h4 className="font-medium">{debt.person_name}</h4>
                            {debt.priority && (
                              <span
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{ 
                                  backgroundColor: `${getPriorityColor(debt.priority)}20`,
                                  color: getPriorityColor(debt.priority)
                                }}
                              >
                                {debt.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{debt.description}</p>
                          {debt.due_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(debt.due_date).toLocaleDateString()}
                              {isPast(parseISO(debt.due_date)) && getDebtStatus(debt) !== 'paid' && (
                                <span className="text-red-500 font-medium ml-1">(Overdue)</span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowPaymentHistory(debt.id)}
                            className="p-1.5 hover:bg-purple-500/10 rounded-lg transition-colors group"
                            title="Payment History"
                          >
                            <History className="w-4 h-4 text-muted-foreground group-hover:text-purple-500" />
                          </button>
                          <button
                            onClick={() => startEdit(debt)}
                            className="p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors group"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                          </button>
                          <button
                            disabled={isDeletingDebt === debt.id}
                            onClick={() => handleDeleteDebt(debt.id, 'owe')}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Paid: {
                                    new Intl.NumberFormat('en-MY', {
                                      style: 'currency',
                                      currency: currentUser.currency,
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  ).format(
                                    debt.total_amount - (typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount)
                                  )}
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            Remaining: {
                                        new Intl.NumberFormat('en-MY', {
                                          style: 'currency',
                                          currency: currentUser.currency,
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }
                                      ).format(
                                        typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount
                                      )}
                          </span>
                        </div>

                        <div className="relative w-full h-3 bg-soft-gray rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500"
                          />
                        </div>

                        {getDebtStatus(debt) !== 'paid' && (
                          <button
                            onClick={() => setShowPaymentModal(debt.id)}
                            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                          >
                            Record Payment
                          </button>
                        )}

                        {getDebtStatus(debt) === 'paid' && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Fully Paid! 🎉
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}

            {youOweDebts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium mb-1">No debts!</p>
                <p className="text-sm">You don't owe anyone money</p>
              </div>
            )}
          </div>
        </div>

        {/* Others Owe You Section */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <h3 className="text-lg font-semibold">Others Owe You</h3>
            <span className="ml-auto text-sm text-muted-foreground">
              {othersOweDebts.length} {othersOweDebts.length === 1 ? 'loan' : 'loans'}
            </span>
          </div>

          <div className="space-y-4">
            {othersOweDebts.map((debt, index) => {
              const StatusIcon = getStatusIcon(getDebtStatus(debt));
              const percentage = ((debt.total_amount - (typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount)) / debt.total_amount) * 100;
              const isEditing = editingDebt === debt.id;

              return (
                <motion.div
                  key={debt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl border border-border/50 bg-muted/20"
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleUpdateDebt(debt.id);
                      }}
                      className="space-y-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Edit Loan</span>
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isUpdatingDebt}
                            className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                          >
                            {isUpdatingDebt ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingDebt(null);
                              resetForm();
                            }}
                            className="px-3 py-1 bg-gray-500 text-white rounded-lg text-sm hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Person Name</label>
                          <input
                            type="text"
                            value={personName}
                            onChange={(e) => setPersonName(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Total Amount</label>
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
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs text-muted-foreground mb-1">Description</label>
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Due Date</label>
                          <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Priority</label>
                          <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as any)}
                            className="w-full px-3 py-2 bg-background rounded-lg border border-border/50 focus:border-primary focus:outline-none"
                          >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <StatusIcon className="w-5 h-5" style={{ color: getStatusColor(getDebtStatus(debt)) }} />
                            <h4 className="font-medium">{debt.person_name}</h4>
                            {debt.priority && (
                              <span
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{ 
                                  backgroundColor: `${getPriorityColor(debt.priority)}20`,
                                  color: getPriorityColor(debt.priority)
                                }}
                              >
                                {debt.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">{debt.description}</p>
                          {debt.due_date && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Due: {new Date(debt.due_date).toLocaleDateString()}
                              {isPast(parseISO(debt.due_date)) && getDebtStatus(debt) !== 'paid' && (
                                <span className="text-red-500 font-medium ml-1">(Overdue)</span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setShowPaymentHistory(debt.id)}
                            className="p-1.5 hover:bg-purple-500/10 rounded-lg transition-colors group"
                            title="Payment History"
                          >
                            <History className="w-4 h-4 text-muted-foreground group-hover:text-purple-500" />
                          </button>
                          <button
                            onClick={() => startEdit(debt)}
                            className="p-1.5 hover:bg-blue-500/10 rounded-lg transition-colors group"
                          >
                            <Edit className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                          </button>
                          <button
                            disabled={isDeletingDebt === debt.id}
                            onClick={() => handleDeleteDebt(debt.id, 'loan')}
                            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors group"
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Received: {new Intl.NumberFormat('en-MY', {
                                        style: 'currency',
                                        currency: currentUser.currency,
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format((debt.total_amount - (typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount)))}
                          </span>
                          <span className="font-medium text-green-600 dark:text-green-400">
                            Remaining: {new Intl.NumberFormat('en-MY', {
                                        style: 'currency',
                                        currency: currentUser.currency,
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(
                                        typeof debt.remaining_amount === 'number' ? debt.remaining_amount : debt.total_amount
                                      )}
                          </span>
                        </div>

                        <div className="relative w-full h-3 bg-soft-gray rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500"
                          />
                        </div>

                        {getDebtStatus(debt) !== 'paid' && (
                          <button
                            onClick={() => setShowPaymentModal(debt.id)}
                            className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                          >
                            Record Payment Received
                          </button>
                        )}

                        {getDebtStatus(debt) === 'paid' && (
                          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 flex items-center gap-2 mt-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                              Fully Received! 🎉
                            </p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </motion.div>
              );
            })}

            {othersOweDebts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <HandCoins className="w-12 h-12 mx-auto mb-3 text-blue-500" />
                <p className="font-medium mb-1">No loans given</p>
                <p className="text-sm">You haven't lent money to anyone</p>
              </div>
            )}
          </div>
        </div>
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
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={personName}
                      onChange={(e) => setPersonName(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      placeholder="e.g., John Doe"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Amount</label>
                  <div className="relative">
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                      className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
                      rows={3}
                      placeholder="What is this debt for?"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Due Date (Optional)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
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
                    className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
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

      {/* Payment Modal */}
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
                    <Coins className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
                      className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  {showPaymentModal && debts.find(d => d.id === showPaymentModal) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Remaining: {
                                  new Intl.NumberFormat('en-MY', {
                                  style: 'currency',
                                  currency: currentUser.currency,
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(remainingAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Payment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="date"
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Note (Optional)</label>
                  <textarea
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                    className="w-full px-4 py-3 bg-muted/50 rounded-xl border border-border/50 focus:border-primary focus:outline-none transition-colors resize-none"
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