require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// إعداد بوت التيليغرام
const token = process.env.TELEGRAM_BOT_TOKEN || '7519072707:AAE-Jn9vGSorlh1OPEkNNQcxQcTYLcfgQjQ';
const bot = new TelegramBot(token, { polling: true });

// إعداد Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const supabase = createClient(supabaseUrl, supabaseKey);

// تخزين رموز التحقق المؤقتة
const verificationCodes = {};

// استقبال أي رسالة
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  // التحقق من وجود المستخدم في قاعدة البيانات
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', chatId)
    .single();
  
  // إذا كانت الرسالة هي /start أو /help
  if (msg.text === '/start' || msg.text === '/help') {
    bot.sendMessage(chatId, 
      'مرحبًا بك في بوت Smart Coin!\n' +
      'تحقق من حسابك للوصول إلى محفظتك.\n' +
      'استخدم الأمر /verify للبدء.'
    );
  }
  
  // إذا كانت الرسالة هي /verify
  else if (msg.text === '/verify') {
    // إنشاء رمز تحقق عشوائي من 6 أرقام
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // تخزين رمز التحقق مؤقتًا
    verificationCodes[username] = {
      code: verificationCode,
      timestamp: Date.now()
    };
    
    bot.sendMessage(chatId, 
      `رمز التحقق الخاص بك هو: ${verificationCode}\n` +
      'أدخل هذا الرمز في تطبيق Smart Coin للتحقق من حسابك.\n' +
      'ينتهي صلاحية هذا الرمز بعد 5 دقائق.'
    );
    
    // إذا لم يكن المستخدم موجودًا في قاعدة البيانات، قم بإنشاء سجل جديد
    if (error || !user) {
      const { data, error: insertError } = await supabase
        .from('users')
        .insert([
          { 
            telegram_id: chatId,
            username: username,
            created_at: new Date(),
            balance: 0,
            mining_rate: 15,
            last_mining: null,
            withdrawal_available_at: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000) // بعد 37 يوم
          }
        ]);
      
      if (insertError) {
        console.error('Error creating user:', insertError);
      }
    }
  }
  
  // أي رسالة أخرى
  else {
    bot.sendMessage(chatId, 
      'مرحبًا بك في بوت Smart Coin!\n' +
      'تحقق من حسابك للوصول إلى محفظتك.\n' +
      'استخدم الأمر /verify للبدء.'
    );
  }
});

// دالة للتحقق من رمز التحقق
const verifyCode = (username, code) => {
  const verification = verificationCodes[username];
  
  if (!verification) {
    return { success: false, message: 'لم يتم طلب رمز تحقق لهذا المستخدم' };
  }
  
  // التحقق من صلاحية الرمز (5 دقائق)
  const isExpired = Date.now() - verification.timestamp > 5 * 60 * 1000;
  
  if (isExpired) {
    delete verificationCodes[username];
    return { success: false, message: 'انتهت صلاحية رمز التحقق' };
  }
  
  if (verification.code !== code) {
    return { success: false, message: 'رمز التحقق غير صحيح' };
  }
  
  // إذا كان الرمز صحيحًا، قم بحذفه من التخزين المؤقت
  delete verificationCodes[username];
  
  return { success: true, message: 'تم التحقق بنجاح' };
};

// إنشاء API للتحقق من الرمز
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// مسار للتحقق من رمز التحقق
app.post('/api/verify', async (req, res) => {
  const { username, code } = req.body;
  
  if (!username || !code) {
    return res.status(400).json({ success: false, message: 'يجب توفير اسم المستخدم ورمز التحقق' });
  }
  
  const result = verifyCode(username, code);
  
  if (result.success) {
    // الحصول على معلومات المستخدم من قاعدة البيانات
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error || !user) {
      return res.status(404).json({ success: false, message: 'لم يتم العثور على المستخدم' });
    }
    
    return res.json({ success: true, message: 'تم التحقق بنجاح', user });
  }
  
  return res.status(400).json(result);
});

// مسار للحصول على معلومات المستخدم
app.get('/api/user/:username', async (req, res) => {
  const { username } = req.params;
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !user) {
    return res.status(404).json({ success: false, message: 'لم يتم العثور على المستخدم' });
  }
  
  return res.json({ success: true, user });
});

// مسار لتحديث رصيد المستخدم (التعدين)
app.post('/api/mine', async (req, res) => {
  const { username } = req.body;
  
  if (!username) {
    return res.status(400).json({ success: false, message: 'يجب توفير اسم المستخدم' });
  }
  
  // الحصول على معلومات المستخدم
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single();
  
  if (error || !user) {
    return res.status(404).json({ success: false, message: 'لم يتم العثور على المستخدم' });
  }
  
  // التحقق من إمكانية التعدين (مرة واحدة كل 24 ساعة)
  const lastMining = user.last_mining ? new Date(user.last_mining) : null;
  const now = new Date();
  
  if (lastMining && (now - lastMining) < 24 * 60 * 60 * 1000) {
    return res.status(400).json({ 
      success: false, 
      message: 'لا يمكنك التعدين الآن، يرجى الانتظار 24 ساعة بين عمليات التعدين',
      nextMining: new Date(lastMining.getTime() + 24 * 60 * 60 * 1000)
    });
  }
  
  // تحديث رصيد المستخدم وتاريخ آخر تعدين
  const { data, error: updateError } = await supabase
    .from('users')
    .update({ 
      balance: user.balance + user.mining_rate,
      last_mining: now
    })
    .eq('username', username);
  
  if (updateError) {
    return res.status(500).json({ success: false, message: 'حدث خطأ أثناء تحديث الرصيد' });
  }
  
  return res.json({ 
    success: true, 
    message: `تم إضافة ${user.mining_rate} عملة إلى رصيدك`,
    newBalance: user.balance + user.mining_rate,
    nextMining: new Date(now.getTime() + 24 * 60 * 60 * 1000)
  });
});

// تشغيل الخادم
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

console.log('Smart Coin Telegram Bot is running...');
