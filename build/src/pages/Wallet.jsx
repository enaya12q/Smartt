import React, { useState, useEffect } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import logo from '../assets/logo.png';
import tonService from '../services/ton';

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [tonBalance, setTonBalance] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState({
    days: 37,
    hours: 12,
    minutes: 45,
    seconds: 30
  });
  
  const [transactions, setTransactions] = useState([
    { 
      id: 1, 
      title: 'مكافأة التعدين اليومية', 
      amount: 15, 
      type: 'income',
      date: '23 أبريل 2025',
      icon: 'fas fa-hammer'
    },
    { 
      id: 2, 
      title: 'مكافأة إكمال المهام', 
      amount: 15, 
      type: 'income',
      date: '22 أبريل 2025',
      icon: 'fas fa-tasks'
    }
  ]);

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userData = JSON.parse(localStorage.getItem('smartCoinUser') || '{}');
    if (userData.balance) {
      setBalance(userData.balance);
    }

    // التحقق من وجود محفظة TON مخزنة
    const storedWallet = localStorage.getItem('tonWallet');
    if (storedWallet) {
      const wallet = JSON.parse(storedWallet);
      setWalletConnected(true);
      setWalletAddress(wallet.address);
      
      // تهيئة خدمة TON
      initializeTONService();
    }

    // حساب العد التنازلي للسحب
    if (userData.created_at) {
      const registrationDate = new Date(userData.created_at);
      const withdrawalDate = new Date(registrationDate);
      withdrawalDate.setDate(withdrawalDate.getDate() + 37);
      
      updateCountdown(withdrawalDate);
    }
  }, []);

  const initializeTONService = async () => {
    try {
      await tonService.initialize();
      
      // الحصول على رصيد المحفظة إذا كانت متصلة
      if (walletConnected && walletAddress) {
        const balanceResult = await tonService.getTONBalance(walletAddress);
        if (balanceResult.success) {
          setTonBalance(balanceResult.balance);
        }
      }
    } catch (error) {
      console.error('Failed to initialize TON service:', error);
      setError('فشل في الاتصال بشبكة TON. يرجى المحاولة مرة أخرى.');
    }
  };

  const updateCountdown = (targetDate) => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  };
  
  const handleWithdraw = async () => {
    // التحقق من إمكانية السحب
    const userData = JSON.parse(localStorage.getItem('smartCoinUser') || '{}');
    const registrationDate = new Date(userData.created_at || Date.now());
    const currentDate = new Date();
    const daysSinceRegistration = Math.floor((currentDate - registrationDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceRegistration < 37) {
      setError('لا يمكن سحب العملات إلا بعد مرور 37 يوم من التسجيل');
      return;
    }

    // التحقق من اتصال المحفظة
    if (!walletConnected) {
      setError('يرجى ربط محفظة TON أولاً');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // في الإنتاج، سنرسل طلب للخادم لسحب العملات إلى محفظة TON
      // هنا نقوم بمحاكاة عملية السحب
      
      setTimeout(() => {
        setSuccess('تم إرسال طلب السحب بنجاح! سيتم معالجة طلبك خلال 24 ساعة.');
        
        // إضافة المعاملة إلى قائمة المعاملات
        const newTransaction = {
          id: transactions.length + 1,
          title: 'سحب العملات',
          amount: balance,
          type: 'outcome',
          date: new Date().toLocaleDateString('ar-EG'),
          icon: 'fas fa-arrow-up'
        };
        
        setTransactions([newTransaction, ...transactions]);
        
        // تحديث الرصيد
        setBalance(0);
        
        // تحديث معلومات المستخدم في التخزين المحلي
        const userData = JSON.parse(localStorage.getItem('smartCoinUser') || '{}');
        userData.balance = 0;
        localStorage.setItem('smartCoinUser', JSON.stringify(userData));
        
        setIsLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Failed to withdraw coins:', error);
      setError('فشل في سحب العملات. يرجى المحاولة مرة أخرى.');
      setIsLoading(false);
    }
  };
  
  const handleConnectWallet = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // إنشاء محفظة جديدة
      const walletResult = await tonService.createWallet();
      
      if (walletResult.success) {
        // تخزين معلومات المحفظة في التخزين المحلي
        localStorage.setItem('tonWallet', JSON.stringify({
          address: walletResult.address,
          keyPair: walletResult.keyPair
        }));
        
        setWalletConnected(true);
        setWalletAddress(walletResult.address);
        setSuccess('تم إنشاء محفظة TON بنجاح! يرجى تمويل محفظتك لاستخدام ميزات التطبيق.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('فشل في إنشاء محفظة TON. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportWallet = async (mnemonicPhrase) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // استيراد محفظة موجودة
      const walletResult = await tonService.importWallet(mnemonicPhrase);
      
      if (walletResult.success) {
        // تخزين معلومات المحفظة في التخزين المحلي
        localStorage.setItem('tonWallet', JSON.stringify({
          address: walletResult.address,
          keyPair: walletResult.keyPair
        }));
        
        setWalletConnected(true);
        setWalletAddress(walletResult.address);
        
        // الحصول على رصيد المحفظة
        const balanceResult = await tonService.getTONBalance(walletResult.address);
        if (balanceResult.success) {
          setTonBalance(balanceResult.balance);
        }
        
        setSuccess('تم استيراد محفظة TON بنجاح!');
      }
    } catch (error) {
      console.error('Failed to import wallet:', error);
      setError('فشل في استيراد محفظة TON. يرجى التحقق من العبارة المساعدة والمحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <h1 className="wallet-title">المحفظة</h1>
      </div>
      
      <div className="wallet-card">
        <div className="wallet-card-content">
          <div className="wallet-balance">
            <div className="wallet-balance-label">رصيدك الحالي</div>
            <div className="wallet-balance-value">
              {balance}
              <img src={logo} alt="Smart Coin" className="wallet-balance-icon" />
            </div>
          </div>
          
          <div className="wallet-actions">
            <button 
              className="wallet-action-btn" 
              onClick={handleWithdraw}
              disabled={isLoading || countdown.days > 0}
            >
              <i className="fas fa-arrow-up wallet-action-icon"></i>
              <span>سحب</span>
            </button>
            {!walletConnected ? (
              <button 
                className="wallet-action-btn" 
                onClick={handleConnectWallet}
                disabled={isLoading}
              >
                <i className="fas fa-link wallet-action-icon"></i>
                <span>ربط محفظة</span>
              </button>
            ) : (
              <button className="wallet-action-btn">
                <i className="fas fa-wallet wallet-action-icon"></i>
                <span>محفظة TON</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {walletConnected && (
        <div className="wallet-ton-info">
          <h2 className="wallet-section-title">محفظة TON</h2>
          <div className="wallet-ton-address">
            <span className="wallet-ton-label">العنوان:</span>
            <span className="wallet-ton-value">{walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 5)}</span>
          </div>
          <div className="wallet-ton-balance">
            <span className="wallet-ton-label">الرصيد:</span>
            <span className="wallet-ton-value">{tonBalance} TON</span>
          </div>
        </div>
      )}
      
      {error && <div className="notification notification-error">{error}</div>}
      {success && <div className="notification notification-success">{success}</div>}
      
      <div className="wallet-countdown">
        <h2 className="wallet-countdown-title">الوقت المتبقي للسحب</h2>
        <div className="wallet-countdown-timer">
          <div className="wallet-countdown-item">
            <div className="wallet-countdown-value">{countdown.days}</div>
            <div className="wallet-countdown-label">يوم</div>
          </div>
          <div className="wallet-countdown-item">
            <div className="wallet-countdown-value">{countdown.hours}</div>
            <div className="wallet-countdown-label">ساعة</div>
          </div>
          <div className="wallet-countdown-item">
            <div className="wallet-countdown-value">{countdown.minutes}</div>
            <div className="wallet-countdown-label">دقيقة</div>
          </div>
          <div className="wallet-countdown-item">
            <div className="wallet-countdown-value">{countdown.seconds}</div>
            <div className="wallet-countdown-label">ثانية</div>
          </div>
        </div>
      </div>
      
      <div className="wallet-transactions">
        <h2 className="wallet-transactions-title">آخر المعاملات</h2>
        {transactions.length > 0 ? (
          transactions.map(transaction => (
            <div key={transaction.id} className="wallet-transaction-item">
              <div className="wallet-transaction-icon">
                <i className={transaction.icon}></i>
              </div>
              <div className="wallet-transaction-content">
                <div className="wallet-transaction-title">{transaction.title}</div>
                <div className="wallet-transaction-date">{transaction.date}</div>
              </div>
              <div className={`wallet-transaction-amount ${transaction.type === 'income' ? 'positive' : 'negative'}`}>
                {transaction.type === 'income' ? '+' : '-'}{transaction.amount}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">لا توجد معاملات حتى الآن</p>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Wallet;
