
import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, Wallet, Building2, Phone, FileText } from 'lucide-react';
import Header from './components/Header';
import TransactionList from './components/TransactionList';
import SummaryChart from './components/SummaryChart';
import AddTransactionModal from './components/AddTransactionModal';
import CalendarView from './components/CalendarView';
import { Transaction, TransactionType, TimeRange, User } from './types';
import { filterTransactionsByRange, isSameDay, formatDate } from './services/utils';
import { signInWithGoogle, logoutUser, authStateListener, saveTransaction, getUserTransactions, deleteTransactionFromFirestore, saveUserProfile, getUserProfile } from './services/firebase';

// Dados iniciais
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: 'Salário Mensal', amount: 3500, type: 'income', date: new Date() },
  { id: '2', description: 'Aluguel', amount: 1200, type: 'expense', date: new Date() },
];

const INITIAL_USER: User = {
  name: "",
  email: "",
  avatarUrl: ""
};

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const App: React.FC = () => {
  // Estados de navegação e dados
  const [currentPage, setCurrentPage] = useState<'login' | 'register' | 'dashboard'>('login');
  const [user, setUser] = useState<User>(INITIAL_USER);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [currentFirebaseUser, setCurrentFirebaseUser] = useState<any>(null);
  
  // Estados da UI
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // Estados do Formulário de Cadastro
  const [formData, setFormData] = useState({
    companyName: '',
    document: '', // CPF ou CNPJ
    phone: ''
  });

  const isTodayView = isSameDay(viewDate, new Date());
  
  // --- Auth State Listener ---
  useEffect(() => {
    let isMounted = true;
    
    const unsubscribe = authStateListener(async (firebaseUser) => {
      if (!isMounted) return;
      
      if (firebaseUser) {
        console.log("User logged in:", firebaseUser.email);
        setCurrentFirebaseUser(firebaseUser);
        
        const userData = {
          name: firebaseUser.displayName || "Usuário",
          email: firebaseUser.email || "",
          avatarUrl: firebaseUser.photoURL || ""
        };
        setUser(userData);
        
        // Immediately navigate based on a quick check
        // Then load data in the background
        let shouldGoToDashboard = false;
        
        try {
          // Quick check for profile - don't wait too long
          const profilePromise = getUserProfile(firebaseUser.uid);
          const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 500));
          const userProfile = await Promise.race([profilePromise, timeoutPromise]) as any;
          
          if (userProfile && userProfile.companyName) {
            shouldGoToDashboard = true;
            if (isMounted) {
              setUser(prev => ({
                ...prev,
                companyName: userProfile.companyName,
                companyDocument: userProfile.companyDocument,
                phone: userProfile.phone
              }));
              setFormData({
                companyName: userProfile.companyName || '',
                document: userProfile.companyDocument || '',
                phone: userProfile.phone || ''
              });
            }
          }
        } catch (error) {
          console.error("Error checking profile:", error);
        }
        
        // Navigate immediately
        if (isMounted) {
          setCurrentPage(shouldGoToDashboard ? 'dashboard' : 'register');
        }
        
        // Load transactions in background (don't block navigation)
        getUserTransactions(firebaseUser.uid)
          .then(savedTransactions => {
            if (isMounted && savedTransactions && savedTransactions.length > 0) {
              setTransactions(savedTransactions);
            }
          })
          .catch(error => {
            console.error("Error loading transactions:", error);
          });
      } else {
        console.log("User logged out");
        setCurrentFirebaseUser(null);
      }
    });
    
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // --- Handlers ---

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      // The authStateListener will handle the redirect
    } catch (error) {
      console.error("Login failed:", error);
      alert("Falha ao fazer login com Google. Tente novamente.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validar se campos estão preenchidos (básico)
    if (!formData.companyName || !formData.document || !formData.phone) return;

    setUser(prev => ({
      ...prev,
      companyName: formData.companyName,
      companyDocument: formData.document,
      phone: formData.phone
    }));
    // Save user profile to Firestore
    if (currentFirebaseUser) {
      saveUserProfile(currentFirebaseUser.uid, {
        name: user.name,
        email: user.email,
        companyName: formData.companyName,
        companyDocument: formData.document,
        phone: formData.phone
      }).catch(error => {
        console.error("Error saving profile:", error);
        alert("Erro ao salvar perfil. Tente novamente.");
      });
    }
    setCurrentPage('dashboard');
  };

  const handleAddTransaction = async (description: string, amount: number, type: TransactionType) => {
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      description,
      amount,
      type,
      date: new Date(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    
    // Save to Firestore
    if (currentFirebaseUser) {
      try {
        await saveTransaction(currentFirebaseUser.uid, newTransaction);
      } catch (error) {
        console.error("Error saving transaction to Firestore:", error);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    
    // Delete from Firestore
    if (currentFirebaseUser) {
      try {
        await deleteTransactionFromFirestore(currentFirebaseUser.uid, id);
      } catch (error) {
        console.error("Error deleting transaction from Firestore:", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setCurrentPage('login');
      setViewDate(new Date());
      setTimeRange('today');
      setUser(INITIAL_USER);
      setFormData({ companyName: '', document: '', phone: '' });
      setCurrentFirebaseUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Falha ao fazer logout. Tente novamente.");
    }
  };

  // --- Lógica de Filtros ---
  let displayTransactions: Transaction[] = [];
  if (!isTodayView) {
    displayTransactions = transactions.filter(t => isSameDay(new Date(t.date), viewDate));
  } else {
    displayTransactions = filterTransactionsByRange(transactions, timeRange);
  }
  displayTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- Renderização das Páginas ---

  if (currentPage === 'login') {
    return (
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop")' }}
        >
          <div className="absolute inset-0 bg-orange-900/40 backdrop-blur-[2px]"></div>
        </div>

        <div className="relative z-10 bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-4 border-orange-500 animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
             <div className="bg-orange-50 p-4 rounded-full shadow-inner">
                <Wallet className="w-16 h-16 text-orange-500" />
             </div>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 mb-2 tracking-tight">FlowCash</h1>
          <p className="text-gray-500 font-medium text-lg mb-8">Fluxo de caixa facilitado</p>
          
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            <GoogleIcon />
            <span>Entrar com Google</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentPage === 'register') {
    return (
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-gray-50">
         <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop")' }}
        ></div>

        <div className="relative z-10 bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-lg w-full border border-gray-100 animate-in slide-in-from-right duration-300">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">Conclua seu cadastro</h2>
            <p className="text-orange-500 mt-2 text-sm">Preencha os dados da sua empresa para continuar</p>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Building2 size={16} className="text-orange-500" />
                Nome da Empresa
              </label>
              <input 
                type="text" 
                required
                value={formData.companyName}
                onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Ex: Minha Loja Ltda"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-orange-500" />
                CPF ou CNPJ
              </label>
              <input 
                type="text" 
                required
                value={formData.document}
                onChange={e => setFormData({...formData, document: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Phone size={16} className="text-orange-500" />
                Telefone
              </label>
              <input 
                type="tel" 
                required
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="(00) 00000-0000"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Finalizar e Acessar
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Page
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <main className="flex-1 overflow-hidden relative">
        <div className="h-full max-w-7xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {user.companyName ? user.companyName : "Dashboard"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {isTodayView ? 'Visão Geral' : `Histórico: ${formatDate(viewDate)}`}
                </p>
              </div>
              
              {isTodayView && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full shadow-lg shadow-orange-200 transition-all font-semibold"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Adicionar Atividade</span>
                </button>
              )}
            </div>

            <div className="bg-transparent flex-1 overflow-hidden">
               <TransactionList 
                 transactions={displayTransactions} 
                 onDelete={handleDeleteTransaction}
                 readOnly={!isTodayView} 
               />
            </div>
          </div>

          <div className="lg:col-span-1 h-full pb-16 lg:pb-0">
            <SummaryChart 
              transactions={displayTransactions} 
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              isHistoricalView={!isTodayView}
            />
          </div>
        </div>

        <div className="absolute bottom-6 right-6 z-30">
          <button 
            onClick={() => setIsCalendarOpen(true)}
            className="bg-white border-2 border-orange-100 p-4 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all text-orange-500 hover:text-orange-600 flex flex-col items-center justify-center group"
            title="Ver Histórico"
          >
            <CalendarIcon size={28} />
          </button>
        </div>
      </main>

      <footer className="bg-orange-500 h-8 flex items-center justify-center">
        <span className="text-white/60 text-xs font-light tracking-widest">
          G-Software DEV
        </span>
      </footer>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddTransaction} 
      />
      
      <CalendarView 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        onSelectDate={(date) => {
          setViewDate(date);
          setIsCalendarOpen(false);
        }} 
      />
    </div>
  );
};

export default App;
