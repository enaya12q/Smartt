import React, { useState, useEffect } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import { performMining } from '../services/api';

const Mining = () => {
  const [isMining, setIsMining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    // استرجاع معلومات المستخدم من التخزين المحلي
    const userData = JSON.parse(localStorage.getItem('smartCoinUser') || '{}');
    setUser(userData);

    // التحقق من وقت التعدين التالي
    if (userData.next_mining) {
      const nextMining = new Date(userData.next_mining);
      updateCountdown(nextMining);
    }
  }, []);

  const updateCountdown = (targetDate) => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setIsMining(false);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  };

  const handleStartMining = async () => {
    if (!user || !user.username) {
      setError('يرجى تسجيل الدخول أولا');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await performMining(user.username);

      if (response.success) {
        setSuccess(response.message);

        // تحديث معلومات المستخدم في التخزين المحلي
        const updatedUser = {
          ...user,
          balance: response.newBalance,
          next_mining: response.nextMining
        };

        localStorage.setItem('smartCoinUser', JSON.stringify(updatedUser));
        setUser(updatedUser);

        // تحديث العد التنازلي
        updateCountdown(new Date(response.nextMining));
      } else {
        setError(response.message);

        if (response.nextMining) {
          updateCountdown(new Date(response.nextMining));
        }
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء التعدين، يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mining-container">
      <div className="mining-header">
        <h1 className="mining-title">Smart Coin</h1>
        <p className="mining-subtitle">المستقبل الذكي للعملات الرقمية</p>
      </div>

      <div className="mining-stats">
        <div className="mining-stat-item">
          <div className="mining-stat-value">{timeLeft.days}</div>
          <div className="mining-stat-label">يوم</div>
        </div>
        <div className="mining-stat-item">
          <div className="mining-stat-value">{timeLeft.hours}</div>
          <div className="mining-stat-label">ساعة</div>
        </div>
        <div className="mining-stat-item">
          <div className="mining-stat-value">{timeLeft.minutes}</div>
          <div className="mining-stat-label">دقيقة</div>
        </div>
        <div className="mining-stat-item">
          <div className="mining-stat-value">{timeLeft.seconds}</div>
          <div className="mining-stat-label">ثانية</div>
        </div>
      </div>

      <button  
        className={`btn ${isMining ? 'btn-secondary' : 'btn-primary'} mining-btn`}  
        onClick={handleStartMining}  
        disabled={isMining || isLoading}  
      >  
        {isLoading ? (  
          <span>جاري التحميل...</span>  
        ) : isMining ? (  
          <span>جاري التعدين...</span>  
        ) : (  
          <span>ابدأ التعدين</span>  
        )}  
      </button>  

      {isMining && (  
        <p className="text-center mt-2">  
          ستحصل على {user?.mining_rate || 15} عملة يوميا. يمكنك التعدين مرة أخرى بعد 24 ساعة.  
        </p>  
      )}  

      <div className="mining-features">  
        <div className="mining-feature-item">  
          <div className="mining-feature-icon">  
            <i className="fas fa-globe"></i>  
          </div>  
          <div className="mining-feature-content">  
            <h3 className="mining-feature-title">عالمية</h3>  
            <p className="mining-feature-desc">تداول بحرية في أي مكان حول العالم بدون قيود</p>  
          </div>  
        </div>  

        <div className="mining-feature-item">  
          <div className="mining-feature-icon">  
            <i className="fas fa-chart-line"></i>  
          </div>  
          <div className="mining-feature-content">  
            <h3 className="mining-feature-title">نمو سريع</h3>  
            <p className="mining-feature-desc">استثمر في مستقبل العملات الرقمية مع إمكانية نمو</p>  
          </div>  
        </div>  
        <div className="mining-feature-item">  
          <div className="mining-feature-icon">  
            <i className="fas fa-lock"></i>  
          </div>  
          <div className="mining-feature-content">  
            <h3 className="mining-feature-title">آمنة تماما</h3>  
            <p className="mining-feature-desc">تقنية بلوكتشين متطورة لحماية أموالك الرقمية</p>  
          </div>  
        </div>  
      </div>  

      <BottomNavigation />  
    </div>  
  );  
};  
  
export default Mining;
