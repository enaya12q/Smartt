import React, { useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';

const Referrals = () => {
  const [referralLink, setReferralLink] = useState('https://smartcoin.app/ref/user123');
  const [copySuccess, setCopySuccess] = useState(false);
  
  const referralRewards = [
    { count: 16, reward: '1 دولار (USDT)' },
    { count: 30, reward: '2 دولار' },
    { count: 75, reward: '5 دولار' },
    { count: 100, reward: '7 دولار' },
    { count: 300, reward: '15 دولار' },
    { count: 500, reward: '25 دولار' },
    { count: 1000, reward: '35 دولار' }
  ];
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };
  
  return (
    <div className="referrals-container">
      <div className="referrals-header">
        <h1 className="referrals-title">الإحالات</h1>
        <p className="referrals-subtitle">قم بدعوة أصدقائك للحصول على مكافآت حصرية</p>
      </div>
      
      <div className="referrals-link-box">
        <div className="referrals-link-label">رابط الإحالة الخاص بك:</div>
        <div className="referrals-link-input">
          <input 
            type="text" 
            className="referrals-link-field" 
            value={referralLink} 
            readOnly 
          />
          <button 
            className="referrals-link-copy"
            onClick={copyToClipboard}
          >
            {copySuccess ? 'تم النسخ!' : 'نسخ'}
          </button>
        </div>
        {copySuccess && (
          <div className="notification notification-success mt-2">
            تم نسخ الرابط بنجاح!
          </div>
        )}
      </div>
      
      <div className="referrals-rewards">
        <h2 className="referrals-rewards-title">جدول المكافآت</h2>
        <div>
          <div className="referrals-reward-item">
            <span>1 إلى 15 إحالة</span>
            <span className="referrals-reward-value">لا مكافأة</span>
          </div>
          {referralRewards.map((reward, index) => (
            <div key={index} className="referrals-reward-item">
              <span className="referrals-reward-count">{reward.count} إحالة</span>
              <span className="referrals-reward-value">
                {reward.reward}
                <img src={logo} alt="USDT" className="referrals-reward-icon" />
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="referrals-stats">
        <h2 className="referrals-stats-title">إحصائيات الإحالة</h2>
        <div className="referrals-stats-grid">
          <div className="referrals-stat-item">
            <div className="referrals-stat-value">0</div>
            <div className="referrals-stat-label">إجمالي الإحالات</div>
          </div>
          <div className="referrals-stat-item">
            <div className="referrals-stat-value">0</div>
            <div className="referrals-stat-label">الإحالات النشطة</div>
          </div>
          <div className="referrals-stat-item">
            <div className="referrals-stat-value">0 $</div>
            <div className="referrals-stat-label">إجمالي المكافآت</div>
          </div>
          <div className="referrals-stat-item">
            <div className="referrals-stat-value">16</div>
            <div className="referrals-stat-label">الهدف التالي</div>
          </div>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Referrals;
