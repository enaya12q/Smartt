import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyTelegramCode } from '../services/api';
import logo from '../assets/logo.png';

const Login = () => {
  const [step, setStep] = useState('initial'); // initial, verification, loading
  const [username, setUsername] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleTelegramLogin = () => {
    // فتح بوت التيليغرام في نافذة جديدة
    window.open('http://t.me/SMARTCOINAPPbot', '_blank');
    setStep('verification');
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    
    if (!username) {
      setError('الرجاء إدخال اسم المستخدم على تيليغرام');
      return;
    }

    if (!verificationCode) {
      setError('الرجاء إدخال رمز التحقق');
      return;
    }

    setError('');
    setStep('loading');

    try {
      // إرسال طلب التحقق إلى الخادم
      const response = await verifyTelegramCode(username, verificationCode);
      
      if (response.success) {
        // تخزين معلومات المستخدم في التخزين المحلي
        localStorage.setItem('smartCoinUser', JSON.stringify({
          username,
          isAuthenticated: true,
          ...response.user
        }));
        
        navigate('/mining');
      } else {
        setError(response.message || 'فشل التحقق، الرجاء المحاولة مرة أخرى');
        setStep('verification');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء التحقق، الرجاء المحاولة مرة أخرى');
      setStep('verification');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logo} alt="Smart Coin Logo" className="login-logo" />
        <h1 className="login-title">تسجيل الدخول</h1>

        {step === 'initial' && (
          <div>
            <button 
              className="btn btn-primary btn-block login-telegram-btn" 
              onClick={handleTelegramLogin}
            >
              <i className="fas fa-paper-plane"></i>
              تسجيل الدخول بتيليجرام
            </button>
            <p className="login-footer mt-3">
              ليس لديك حساب؟ <a href="#" onClick={handleTelegramLogin}>إنشاء حساب جديد</a>
            </p>
          </div>
        )}

        {step === 'verification' && (
          <form onSubmit={handleVerification}>
            <div className="form-group">
              <label htmlFor="username">اسم المستخدم على تيليجرام</label>
              <input
                type="text"
                id="username"
                className="form-control"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم الخاص بك"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="verificationCode">رمز التحقق</label>
              <input
                type="text"
                id="verificationCode"
                className="form-control"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="أدخل رمز التحقق المرسل إليك"
                required
              />
            </div>
            {error && <div className="notification notification-error">{error}</div>}
            <button type="submit" className="btn btn-primary btn-block">
              تحقق وتسجيل الدخول
            </button>
            <button 
              type="button" 
              className="btn btn-secondary btn-block mt-2"
              onClick={() => setStep('initial')}
            >
              رجوع
            </button>
          </form>
        )}

        {step === 'loading' && (
          <div className="text-center">
            <div className="loading-spinner mb-3"></div>
            <p>جاري التحقق من بياناتك...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
