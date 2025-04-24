import React, { useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import logo from '../assets/logo.png';

const Profile = () => {
  const [user, setUser] = useState({
    name: 'المستخدم',
    username: '@user123',
    level: 'مبتدئ',
    joinDate: '23 أبريل 2025',
    totalCoins: 30,
    totalReferrals: 0
  });
  
  const achievements = [
    { 
      id: 1, 
      title: 'أول تعدين', 
      description: 'قمت بالتعدين لأول مرة', 
      icon: 'fas fa-hammer',
      completed: true
    },
    { 
      id: 2, 
      title: 'أول إحالة', 
      description: 'قمت بدعوة صديق للانضمام', 
      icon: 'fas fa-user-plus',
      completed: false
    },
    { 
      id: 3, 
      title: 'مهام اجتماعية', 
      description: 'أكملت جميع المهام الاجتماعية', 
      icon: 'fas fa-tasks',
      completed: false
    },
    { 
      id: 4, 
      title: 'أول سحب', 
      description: 'قمت بسحب عملات لأول مرة', 
      icon: 'fas fa-wallet',
      completed: false
    }
  ];
  
  const handleLogout = () => {
    // في الإنتاج، سنقوم بتسجيل الخروج وإزالة بيانات المستخدم من التخزين المحلي
    localStorage.removeItem('smartCoinUser');
    window.location.href = '/login';
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          <i className="fas fa-user"></i>
        </div>
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-username">{user.username}</p>
        <span className="profile-level">{user.level}</span>
      </div>
      
      <div className="profile-stats">
        <div className="profile-stat-item">
          <div className="profile-stat-value">{user.totalCoins}</div>
          <div className="profile-stat-label">إجمالي العملات</div>
        </div>
        <div className="profile-stat-item">
          <div className="profile-stat-value">{user.totalReferrals}</div>
          <div className="profile-stat-label">إجمالي الإحالات</div>
        </div>
        <div className="profile-stat-item">
          <div className="profile-stat-value">{user.joinDate}</div>
          <div className="profile-stat-label">تاريخ الانضمام</div>
        </div>
      </div>
      
      <div className="profile-section">
        <h2 className="profile-section-title">الإنجازات</h2>
        <div className="profile-achievements">
          {achievements.map(achievement => (
            <div key={achievement.id} className={`profile-achievement-item ${achievement.completed ? 'completed' : ''}`}>
              <div className="profile-achievement-icon">
                <i className={achievement.icon}></i>
              </div>
              <div className="profile-achievement-title">{achievement.title}</div>
              <div className="profile-achievement-desc">{achievement.description}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="profile-section">
        <h2 className="profile-section-title">الإعدادات</h2>
        <div className="profile-menu">
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <i className="fas fa-bell"></i>
            </div>
            <div className="profile-menu-text">الإشعارات</div>
            <div className="profile-menu-arrow">
              <i className="fas fa-chevron-left"></i>
            </div>
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div className="profile-menu-text">الأمان والخصوصية</div>
            <div className="profile-menu-arrow">
              <i className="fas fa-chevron-left"></i>
            </div>
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <i className="fas fa-question-circle"></i>
            </div>
            <div className="profile-menu-text">الأسئلة الشائعة</div>
            <div className="profile-menu-arrow">
              <i className="fas fa-chevron-left"></i>
            </div>
          </div>
          <div className="profile-menu-item">
            <div className="profile-menu-icon">
              <i className="fas fa-info-circle"></i>
            </div>
            <div className="profile-menu-text">عن التطبيق</div>
            <div className="profile-menu-arrow">
              <i className="fas fa-chevron-left"></i>
            </div>
          </div>
        </div>
        
        <button className="profile-logout-btn" onClick={handleLogout}>
          تسجيل الخروج
        </button>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Profile;
