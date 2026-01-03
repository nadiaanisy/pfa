import {
  useState
} from 'react';
import {
  Expense,
  IncomeSource,
  UserProfile
} from './interfaces';
import { format } from 'date-fns';
import { CATEGORIES } from './constants';

export const useCustomHook = () => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [darkMode, setDarkMode] = useState<boolean>(
    JSON.parse(localStorage.getItem('darkMode') || 'false')
  );
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<'salary' | 'rental' | 'loan' | 'dividend' | 'other'>('salary');
  const [amount, setAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [incomeSourceId, setIncomeSourceId] = useState(incomeSources[0]?.id || '');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<null | 'daily' | 'weekly' | 'monthly' | 'yearly'>(null);
  const [notes, setNotes] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  return {
    loading,
    setLoading,
    apiError,
    setApiError,
    successMsg,
    setSuccessMsg,
    toastMessage,
    setToastMessage,
    toastType,
    setToastType,
    success,
    setSuccess,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
    user,
    setUser,
    newPassword,
    setNewPassword,
    darkMode,
    setDarkMode,
    avatarUrl,
    setAvatarUrl,
    showAddModal,
    setShowAddModal,
    name,
    setName,
    type,
    setType,
    amount,
    setAmount,
    incomeSources,
    setIncomeSources,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    selectedSource,
    setSelectedSource,
    showFilters,
    setShowFilters,
    title,
    setTitle,
    category,
    setCategory,
    date,
    setDate,
    incomeSourceId,
    setIncomeSourceId,
    isRecurring,
    setIsRecurring,
    recurringFrequency,
    setRecurringFrequency,
    notes,
    setNotes,
    expenses,
    setExpenses,
    refreshKey,
    setRefreshKey
  };
}