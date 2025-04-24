import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import logo from '../assets/logo.png';

const Dashboard = () => {
  const [user, setUser] = useState({
    name: 'المستخدم',
    balance: 30,
    miningRate: 15,
    nextMining: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'مرحباً بك في التحديث الجديد!',
      icon: 'fas fa-bell'
    },
    {
      id: 2,
      title: 'قم بدعوة أصدقائك للحصول على عملات إضافية.',
      icon: 'fas fa-users'
    },
    {
      id: 3,
      title: 'تم إطلاق نظام المكافآت الأسبوعية',
      icon: 'fas fa-gift'
    },
    {
      id: 4,
      title: 'مرحباً بك في سمارت كوين!',
      icon: 'fas fa-coins'
    }
  ]);
  
  const quickActions = [
    {
      id: 1,
      title: 'التعدين',
      icon: 'fas fa-hammer',
      link: '/mining',
      color: '#ffd700'
    },
    {
      id: 2,
      title: 'المتجر',
      icon: 'fas fa-store',
      link: '/store',
      color: '#4caf50'
    },
    {
      id: 3,
      title: 'المهام',
      icon: 'fas fa-tasks',
      link: '/tasks',
      color: '#2196f3'
    },
    {
      id: 4,
      title: 'الإحالات',
      icon: 'fas fa-users',
      link: '/referrals',
      color: '#ff9800'
    }
  ];
  
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <img src={logo} alt="Smart Coin Logo" className="dashboard-logo" />
        <h1 className="dashboard-title">Smart Coin</h1>
        <p className="dashboard-subtitle">المستقبل الذكي للعملات الرقمية</p>
      </div>
      
      <div className="dashboard-balance-card">
        <div className="dashboard-balance-title">رصيدك الحالي</div>
        <div className="dashboard-balance-value">
          {user.balance}
          <img src={logo} alt="Smart Coin" className="dashboard-balance-icon" />
        </div>
        <div className="dashboard-balance-info">
          معدل التعدين: {user.miningRate} عملة/يوم
        </div>
        <Link to="/mining" className="btn btn-primary dashboard-mining-btn">
          ابدأ التعدين
        </Link>
      </div>
      
      <div className="dashboard-quick-actions">
        <h2 className="dashboard-section-title">الوصول السريع</h2>
        <div className="dashboard-quick-actions-grid">
          {quickActions.map(action => (
            <Link key={action.id} to={action.link} className="dashboard-quick-action-item">
              <div className="dashboard-quick-action-icon" style={{ backgroundColor: action.color }}>
                <i className={action.icon}></i>
              </div>
              <div className="dashboard-quick-action-title">{action.title}</div>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="dashboard-notifications">
        <h2 className="dashboard-section-title">الإشعارات</h2>
        <div className="dashboard-notifications-list">
          {notifications.map(notification => (
            <div key={notification.id} className="dashboard-notification-item">
              <div className="dashboard-notification-icon">
                <i className={notification.icon}></i>
              </div>
              <div className="dashboard-notification-content">
                <div className="dashboard-notification-title">{notification.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
