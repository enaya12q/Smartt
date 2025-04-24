import React, { useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';

const FAQ = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);
  
  const faqs = [
    {
      id: 1,
      question: 'ما هو تطبيق Smart Coin؟',
      answer: 'Smart Coin هو تطبيق للعملات الرقمية يتيح للمستخدمين كسب العملات من خلال التعدين اليومي، وإكمال المهام، ودعوة الأصدقاء. يمكن استخدام هذه العملات لشراء بطاقات Google Play وهدايا رقمية أخرى.'
    },
    {
      id: 2,
      question: 'كيف يمكنني البدء في التعدين؟',
      answer: 'بعد تسجيل الدخول، انتقل إلى صفحة التعدين واضغط على زر "ابدأ التعدين". ستحصل على 15 عملة يومياً، ويمكنك التعدين مرة واحدة كل 24 ساعة.'
    },
    {
      id: 3,
      question: 'متى يمكنني سحب العملات؟',
      answer: 'يمكنك سحب العملات بعد مرور 37 يوم من تاريخ التسجيل. ستظهر لك عداد تنازلي في صفحة المحفظة يوضح الوقت المتبقي.'
    },
    {
      id: 4,
      question: 'كيف يمكنني زيادة معدل التعدين؟',
      answer: 'يمكنك شراء حزم زيادة التعدين من المتجر باستخدام محفظة TON. هناك ثلاث حزم متاحة: حزمة 1$ (60 عملة/يوم)، حزمة 3$ (90 عملة/يوم)، وحزمة 5$ (200 عملة/يوم).'
    },
    {
      id: 5,
      question: 'كيف يعمل نظام الإحالات؟',
      answer: 'لكل مستخدم رابط إحالة خاص يمكنه مشاركته مع الأصدقاء. عندما يسجل شخص ما باستخدام رابط الإحالة الخاص بك، تتم إضافته إلى قائمة الإحالات الخاصة بك. تبدأ المكافآت من 16 إحالة وتزداد مع زيادة عدد الإحالات.'
    },
    {
      id: 6,
      question: 'ما هي المهام الاجتماعية؟',
      answer: 'المهام الاجتماعية هي مهام تتضمن متابعة حسابات Smart Coin على منصات التواصل الاجتماعي مثل X وإنستغرام وتيليغرام ويوتيوب. ستحصل على 15 عملة لكل مهمة تكملها.'
    },
    {
      id: 7,
      question: 'متى يمكنني شراء العناصر من المتجر؟',
      answer: 'يمكنك شراء العناصر من المتجر بعد مرور 40 يوم من تاريخ التسجيل. يمكنك شراء بطاقات Google Play وهدايا رقمية أخرى باستخدام عملات Smart Coin.'
    },
    {
      id: 8,
      question: 'كيف يمكنني ربط محفظة TON؟',
      answer: 'يمكنك ربط محفظة TON الخاصة بك من صفحة المحفظة في التطبيق. اضغط على زر "ربط محفظة" واتبع التعليمات لإكمال عملية الربط.'
    },
    {
      id: 9,
      question: 'هل يمكنني استخدام التطبيق على الهاتف المحمول؟',
      answer: 'نعم، تطبيق Smart Coin متوافق مع جميع الأجهزة بما في ذلك الهواتف المحمولة والأجهزة اللوحية وأجهزة الكمبيوتر.'
    },
    {
      id: 10,
      question: 'كيف يمكنني التواصل مع فريق الدعم؟',
      answer: 'يمكنك التواصل مع فريق الدعم من خلال قناة التيليغرام الرسمية أو من خلال البريد الإلكتروني support@smartcoin.app.'
    }
  ];
  
  const toggleQuestion = (id) => {
    if (activeQuestion === id) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion(id);
    }
  };
  
  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1 className="faq-title">الأسئلة الشائعة</h1>
        <p className="faq-subtitle">إجابات على الأسئلة الأكثر شيوعاً</p>
      </div>
      
      <div className="faq-list">
        {faqs.map(faq => (
          <div key={faq.id} className="faq-item">
            <div className="faq-question" onClick={() => toggleQuestion(faq.id)}>
              <div className="faq-question-text">{faq.question}</div>
              <div className="faq-question-icon">
                <i className={`fas fa-chevron-${activeQuestion === faq.id ? 'up' : 'down'}`}></i>
              </div>
            </div>
            {activeQuestion === faq.id && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default FAQ;
