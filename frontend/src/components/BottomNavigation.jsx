import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

const BottomNavigation = () => {
  return (
    <div className="bottom-nav">
      <Link to="/wallet" className="bottom-nav-item">
        <i className="fas fa-wallet bottom-nav-icon"></i>
        <span>المحفظة</span>
      </Link>
      <Link to="/store" className="bottom-nav-item">
        <i className="fas fa-store bottom-nav-icon"></i>
        <span>المتجر</span>
      </Link>
      <Link to="/mining" className="bottom-nav-item">
        <i className="fas fa-hammer bottom-nav-icon"></i>
        <span>التعدين</span>
      </Link>
      <Link to="/referrals" className="bottom-nav-item">
        <i className="fas fa-users bottom-nav-icon"></i>
        <span>الإحالات</span>
      </Link>
      <Link to="/profile" className="bottom-nav-item">
        <i className="fas fa-user bottom-nav-icon"></i>
        <span>الملف</span>
      </Link>
    </div>
  );
};

export default BottomNavigation;
