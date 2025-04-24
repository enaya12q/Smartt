import React, { useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import logo from '../assets/logo.png';

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { 
      id: 1, 
      title: 'متابعة حساب X', 
      description: 'قم بمتابعة حساب Smart Coin على منصة X', 
      url: 'https://x.com/smartcoin179831/status/1911920743597903998',
      reward: 15,
      completed: false,
      icon: 'fab fa-twitter'
    },
    { 
      id: 2, 
      title: 'متابعة إنستغرام', 
      description: 'قم بمتابعة حساب Smart Coin على إنستغرام', 
      url: 'https://www.instagram.com/smarcoin',
      reward: 15,
      completed: false,
      icon: 'fab fa-instagram'
    },
    { 
      id: 3, 
      title: 'متابعة قناة تيليغرام', 
      description: 'قم بمتابعة قناة Smart Coin على تيليغرام', 
      url: 'https://t.me/SMARTCOINCHANNAL',
      reward: 15,
      completed: false,
      icon: 'fab fa-telegram'
    },
    { 
      id: 4, 
      title: 'متابعة يوتيوب', 
      description: 'قم بمتابعة قناة Smart Coin على يوتيوب', 
      url: 'https://youtube.com/@smartcoin-p6o',
      reward: 15,
      completed: false,
      icon: 'fab fa-youtube'
    },
    { 
      id: 5, 
      title: 'مهمة يومية: تسجيل الدخول', 
      description: 'قم بتسجيل الدخول يومياً للحصول على مكافأة', 
      reward: 5,
      completed: true,
      icon: 'fas fa-sign-in-alt',
      daily: true
    },
    { 
      id: 6, 
      title: 'مهمة يومية: التعدين', 
      description: 'قم بالتعدين يومياً للحصول على مكافأة إضافية', 
      reward: 5,
      completed: false,
      icon: 'fas fa-hammer',
      daily: true
    }
  ]);
  
  const handleTaskAction = (taskId) => {
    // في الإنتاج، سنرسل طلب للخادم لتحديث حالة المهمة
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        if (task.url) {
          window.open(task.url, '_blank');
        }
        return { ...task, completed: true };
      }
      return task;
    });
    
    setTasks(updatedTasks);
  };
  
  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1 className="tasks-title">المهام</h1>
        <p className="tasks-subtitle">أكمل المهام للحصول على عملات إضافية</p>
      </div>
      
      <div className="tasks-list">
        {tasks.map(task => (
          <div key={task.id} className="task-item">
            <div className="task-icon">
              <i className={task.icon}></i>
            </div>
            <div className="task-content">
              <h3 className="task-title">{task.title}</h3>
              <p className="task-desc">{task.description}</p>
              <div className="task-reward">
                <span>{task.reward}</span>
                <img src={logo} alt="Smart Coin" className="task-reward-icon" />
              </div>
            </div>
            <div className="task-action">
              <button 
                className={`task-btn ${task.completed ? 'task-btn-completed' : ''}`}
                onClick={() => handleTaskAction(task.id)}
                disabled={task.completed}
              >
                {task.completed ? 'مكتمل' : 'إكمال'}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default Tasks;
