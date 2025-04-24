import React, { useState, useEffect } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import logo from '../assets/logo.png';
import tonService from '../services/ton';

const Store = () => {
  const [activeCategory, setActiveCategory] = useState('packages');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [tonBalance, setTonBalance] = useState(0);
  
  const categories = [
    { id: 'packages', name: 'حزم التعدين' },
    { id: 'cards', name: 'بطاقات جوجل بلاي' },
    { id: 'gifts', name: 'هدايا رقمية' }
  ];
  
  const miningPackages = [
    { id: 1, title: 'حزمة أساسية', price: '0.1 TON', coins: 60, dailyRate: 60, image: 'https://via.placeholder.com/150' },
    { id: 2, title: 'حزمة متوسطة', price: '0.3 TON', coins: 90, dailyRate: 90, image: 'https://via.placeholder.com/150' },
    { id: 3, title: 'حزمة متقدمة', price: '0.5 TON', coins: 200, dailyRate: 200, image: 'https://via.placeholder.com/150' },
    { id: 4, title: '3000 عملة', price: '0.1 TON', coins: 3000, dailyRate: null, image: 'https://via.placeholder.com/150' }
  ];
  
  const googlePlayCards = [
    { id: 5, title: 'بطاقة 5$', price: '500 عملة', image: 'https://via.placeholder.com/150' },
    { id: 6, title: 'بطاقة 10$', price: '1000 عملة', image: 'https://via.placeholder.com/150' },
    { id: 7, title: 'بطاقة 25$', price: '2500 عملة', image: 'https://via.placeholder.com/150' }
  ];
  
  const digitalGifts = [
    { id: 8, title: 'نتفلكس شهر', price: '1500 عملة', image: 'https://via.placeholder.com/150' },
    { id: 9, title: 'سبوتيفاي شهر', price: '800 عملة', image: 'https://via.placeholder.com/150' },
    { id: 10, title: 'يوتيوب بريميوم', price: '1200 عملة', image: 'https://via.placeholder.com/150' }
  ];

  useEffect(() => {
    // التحقق من وجود محفظة TON مخزنة
    const storedWallet = localStorage.getItem('tonWallet');
    if (storedWallet) {
      const wallet = JSON.parse(storedWallet);
      setWalletConnected(true);
      setWalletAddress(wallet.address);
      
      // تهيئة خدمة TON
      initializeTONService();
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

  const connectWallet = async () => {
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
        setSuccess('تم إنشاء محفظة TON بنجاح! يرجى تمويل محفظتك لشراء حزم التعدين.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setError('فشل في إنشاء محفظة TON. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  const importWallet = async (mnemonicPhrase) => {
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
  
  const getItems = () => {
    switch (activeCategory) {
      case 'packages':
        return miningPackages;
      case 'cards':
        return googlePlayCards;
      case 'gifts':
        return digitalGifts;
      default:
        return miningPackages;
    }
  };
  
  const handlePurchase = async (item) => {
    // التحقق من مرور 40 يوم من التسجيل
    const userData = JSON.parse(localStorage.getItem('smartCoinUser') || '{}');
    const registrationDate = new Date(userData.created_at || Date.now());
    const currentDate = new Date();
    const daysSinceRegistration = Math.floor((currentDate - registrationDate) / (1000 * 60 * 60 * 24));
    
    if (daysSinceRegistration < 40 && activeCategory !== 'packages') {
      setError('الشراء متاح فقط بعد مرور 40 يوم من التسجيل');
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
      // الحصول على معلومات المحفظة من التخزين المحلي
      const storedWallet = JSON.parse(localStorage.getItem('tonWallet'));
      
      if (activeCategory === 'packages') {
        // شراء حزمة تعدين باستخدام TON
        const result = await tonService.buyMiningPackage(item.id, storedWallet);
        
        if (result.success) {
          setSuccess(`تم شراء ${item.title} بنجاح!`);
          
          // تحديث رصيد المحفظة
          const balanceResult = await tonService.getTONBalance(walletAddress);
          if (balanceResult.success) {
            setTonBalance(balanceResult.balance);
          }
        }
      } else {
        // شراء بطاقات أو هدايا باستخدام عملات Smart Coin
        // التحقق من رصيد المستخدم
        if (userData.balance < parseInt(item.price)) {
          setError('رصيد غير كافٍ');
          setIsLoading(false);
          return;
        }
        
        // في الإنتاج، سنرسل طلب للخادم لشراء العنصر
        setSuccess(`تم شراء ${item.title} بنجاح!`);
      }
    } catch (error) {
      console.error('Failed to purchase item:', error);
      setError('فشل في إتمام عملية الشراء. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="store-container">
      <div className="store-header">
        <h1 className="store-title">المتجر</h1>
        
        {!walletConnected ? (
          <div className="wallet-connect-box">
            <p>لشراء حزم التعدين، يرجى ربط محفظة TON الخاصة بك</p>
            <button 
              className="btn btn-primary btn-block"
              onClick={connectWallet}
              disabled={isLoading}
            >
              {isLoading ? 'جاري الإنشاء...' : 'إنشاء محفظة TON'}
            </button>
          </div>
        ) : (
          <div className="wallet-info-box">
            <p>محفظة TON متصلة</p>
            <p className="wallet-address">{walletAddress.substring(0, 10)}...{walletAddress.substring(walletAddress.length - 5)}</p>
            <p className="wallet-balance">الرصيد: {tonBalance} TON</p>
          </div>
        )}
        
        <div className="notification notification-info">
          الشراء متاح فقط بعد مرور 40 يوم من التسجيل
        </div>
        
        {error && <div className="notification notification-error">{error}</div>}
        {success && <div className="notification notification-success">{success}</div>}
      </div>
      
      <div className="store-categories">
        {categories.map(category => (
          <div 
            key={category.id}
            className={`store-category ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
          >
            {category.name}
          </div>
        ))}
      </div>
      
      <div className="store-items">
        {getItems().map(item => (
          <div key={item.id} className="store-item">
            <img src={item.image} alt={item.title} className="store-item-img" />
            <div className="store-item-content">
              <h3 className="store-item-title">{item.title}</h3>
              <div className="store-item-price">
                <span>{item.price}</span>
                {activeCategory !== 'packages' && (
                  <img src={logo} alt="Smart Coin" className="store-item-price-icon" />
                )}
              </div>
              {item.dailyRate && (
                <div className="store-item-daily-rate">
                  {item.dailyRate} عملة/يوم
                </div>
              )}
              <button 
                className="btn btn-primary btn-block mt-2"
                onClick={() => handlePurchase(item)}
                disabled={isLoading}
              >
                {isLoading ? 'جاري الشراء...' : 'شراء'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Store;
