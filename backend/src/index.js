const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const axios = require('axios');

// تحميل متغيرات البيئة
dotenv.config();

// إنشاء تطبيق Express
const app = express();
const PORT = process.env.PORT || 3000;

// إعداد Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// إعداد Middleware
app.use(cors());
app.use(express.json());

// التحقق من التوكن
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'غير مصرح' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'توكن غير صالح' });
    }
    req.user = user;
    next();
  });
};

// مسارات API

// مسار الترحيب
app.get('/', (req, res) => {
  res.json({ message: 'مرحباً بك في خادم Smart Coin API' });
});

// التحقق من رمز التيليغرام
app.post('/api/verify-telegram', async (req, res) => {
  try {
    const { username, verificationCode } = req.body;
    
    if (!username || !verificationCode) {
      return res.status(400).json({ error: 'اسم المستخدم ورمز التحقق مطلوبان' });
    }
    
    // التحقق من الرمز في قاعدة البيانات
    const { data, error } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('username', username)
      .eq('code', verificationCode)
      .single();
    
    if (error || !data) {
      return res.status(400).json({ error: 'رمز التحقق غير صالح' });
    }
    
    // التحقق من صلاحية الرمز (10 دقائق)
    const createdAt = new Date(data.created_at);
    const now = new Date();
    const diffInMinutes = (now - createdAt) / (1000 * 60);
    
    if (diffInMinutes > 10) {
      return res.status(400).json({ error: 'انتهت صلاحية رمز التحقق' });
    }
    
    // البحث عن المستخدم أو إنشاء مستخدم جديد
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('telegram_username', username)
      .single();
    
    if (userError || !user) {
      // إنشاء مستخدم جديد
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([
          { 
            telegram_username: username,
            coins: 0,
            mining_rate: 15, // معدل التعدين الافتراضي
            last_mining: new Date().toISOString(),
            referral_code: generateReferralCode(username),
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (createError) {
        return res.status(500).json({ error: 'فشل في إنشاء المستخدم' });
      }
      
      user = newUser;
    }
    
    // إنشاء توكن JWT
    const token = jwt.sign(
      { id: user.id, username: user.telegram_username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // حذف رمز التحقق المستخدم
    await supabase
      .from('verification_codes')
      .delete()
      .eq('id', data.id);
    
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.telegram_username,
        coins: user.coins,
        mining_rate: user.mining_rate,
        referral_code: user.referral_code
      }
    });
    
  } catch (error) {
    console.error('خطأ في التحقق من رمز التيليغرام:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// الحصول على معلومات المستخدم
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error || !data) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    res.json({
      id: data.id,
      username: data.telegram_username,
      coins: data.coins,
      mining_rate: data.mining_rate,
      last_mining: data.last_mining,
      referral_code: data.referral_code,
      created_at: data.created_at
    });
    
  } catch (error) {
    console.error('خطأ في الحصول على معلومات المستخدم:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// تنفيذ عملية التعدين
app.post('/api/mine', authenticateToken, async (req, res) => {
  try {
    // الحصول على معلومات المستخدم
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    // التحقق من وقت التعدين الأخير
    const lastMining = new Date(user.last_mining);
    const now = new Date();
    const diffInHours = (now - lastMining) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      const remainingHours = 24 - diffInHours;
      return res.status(400).json({
        error: 'لا يمكنك التعدين الآن',
        remainingTime: Math.ceil(remainingHours * 60 * 60), // بالثواني
        message: `يمكنك التعدين مرة أخرى بعد ${Math.ceil(remainingHours)} ساعة`
      });
    }
    
    // تحديث عملات المستخدم ووقت التعدين الأخير
    const { data, error } = await supabase
      .from('users')
      .update({
        coins: user.coins + user.mining_rate,
        last_mining: now.toISOString()
      })
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'فشل في تحديث عملات المستخدم' });
    }
    
    // إضافة سجل للتعدين
    await supabase
      .from('mining_history')
      .insert([
        {
          user_id: user.id,
          amount: user.mining_rate,
          timestamp: now.toISOString()
        }
      ]);
    
    res.json({
      success: true,
      coins: data.coins,
      mined: user.mining_rate,
      next_mining: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()
    });
    
  } catch (error) {
    console.error('خطأ في عملية التعدين:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// شراء حزمة تعدين
app.post('/api/buy-mining-package', authenticateToken, async (req, res) => {
  try {
    const { packageId, transactionHash } = req.body;
    
    if (!packageId || !transactionHash) {
      return res.status(400).json({ error: 'معرف الحزمة وهاش المعاملة مطلوبان' });
    }
    
    // التحقق من المعاملة على شبكة TON (محاكاة)
    // في التطبيق الحقيقي، يجب التحقق من المعاملة على شبكة TON
    
    // تحديد معدل التعدين الجديد بناءً على الحزمة
    let newMiningRate;
    let packagePrice;
    
    switch (packageId) {
      case 1:
        newMiningRate = 60;
        packagePrice = 0.1; // 0.1 TON
        break;
      case 2:
        newMiningRate = 90;
        packagePrice = 0.3; // 0.3 TON
        break;
      case 3:
        newMiningRate = 200;
        packagePrice = 0.5; // 0.5 TON
        break;
      default:
        return res.status(400).json({ error: 'معرف الحزمة غير صالح' });
    }
    
    // تحديث معدل التعدين للمستخدم
    const { data, error } = await supabase
      .from('users')
      .update({ mining_rate: newMiningRate })
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) {
      return res.status(500).json({ error: 'فشل في تحديث معدل التعدين' });
    }
    
    // إضافة سجل للشراء
    await supabase
      .from('purchases')
      .insert([
        {
          user_id: req.user.id,
          package_id: packageId,
          price: packagePrice,
          transaction_hash: transactionHash,
          timestamp: new Date().toISOString()
        }
      ]);
    
    res.json({
      success: true,
      mining_rate: newMiningRate,
      message: `تم شراء حزمة التعدين بنجاح. معدل التعدين الجديد: ${newMiningRate} عملة/يوم`
    });
    
  } catch (error) {
    console.error('خطأ في شراء حزمة التعدين:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// استخدام رمز الإحالة
app.post('/api/use-referral', authenticateToken, async (req, res) => {
  try {
    const { referralCode } = req.body;
    
    if (!referralCode) {
      return res.status(400).json({ error: 'رمز الإحالة مطلوب' });
    }
    
    // التحقق من وجود المستخدم الحالي
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (currentUserError || !currentUser) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    // التحقق من أن المستخدم لم يستخدم رمز إحالة من قبل
    if (currentUser.referred_by) {
      return res.status(400).json({ error: 'لقد استخدمت رمز إحالة بالفعل' });
    }
    
    // البحث عن المستخدم صاحب رمز الإحالة
    const { data: referrer, error: referrerError } = await supabase
      .from('users')
      .select('*')
      .eq('referral_code', referralCode)
      .single();
    
    if (referrerError || !referrer) {
      return res.status(404).json({ error: 'رمز الإحالة غير صالح' });
    }
    
    // التحقق من أن المستخدم لا يحاول استخدام رمز الإحالة الخاص به
    if (referrer.id === currentUser.id) {
      return res.status(400).json({ error: 'لا يمكنك استخدام رمز الإحالة الخاص بك' });
    }
    
    // تحديث المستخدم الحالي
    const { error: updateError } = await supabase
      .from('users')
      .update({ referred_by: referrer.id })
      .eq('id', currentUser.id);
    
    if (updateError) {
      return res.status(500).json({ error: 'فشل في تحديث المستخدم' });
    }
    
    // إضافة مكافأة للمستخدم الحالي (10 عملات)
    const { error: updateCurrentUserError } = await supabase
      .from('users')
      .update({ coins: currentUser.coins + 10 })
      .eq('id', currentUser.id);
    
    if (updateCurrentUserError) {
      return res.status(500).json({ error: 'فشل في إضافة المكافأة للمستخدم' });
    }
    
    // إضافة مكافأة للمستخدم صاحب رمز الإحالة (20 عملات)
    const { error: updateReferrerError } = await supabase
      .from('users')
      .update({ coins: referrer.coins + 20 })
      .eq('id', referrer.id);
    
    if (updateReferrerError) {
      return res.status(500).json({ error: 'فشل في إضافة المكافأة لصاحب رمز الإحالة' });
    }
    
    // إضافة سجل للإحالة
    await supabase
      .from('referrals')
      .insert([
        {
          referrer_id: referrer.id,
          referred_id: currentUser.id,
          timestamp: new Date().toISOString()
        }
      ]);
    
    res.json({
      success: true,
      message: 'تم استخدام رمز الإحالة بنجاح',
      bonus: 10
    });
    
  } catch (error) {
    console.error('خطأ في استخدام رمز الإحالة:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// الحصول على قائمة الإحالات
app.get('/api/referrals', authenticateToken, async (req, res) => {
  try {
    // الحصول على قائمة المستخدمين الذين تمت إحالتهم
    const { data, error } = await supabase
      .from('users')
      .select('id, telegram_username, created_at')
      .eq('referred_by', req.user.id);
    
    if (error) {
      return res.status(500).json({ error: 'فشل في الحصول على قائمة الإحالات' });
    }
    
    res.json({
      success: true,
      referrals: data,
      count: data.length
    });
    
  } catch (error) {
    console.error('خطأ في الحصول على قائمة الإحالات:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// إكمال مهمة اجتماعية
app.post('/api/complete-task', authenticateToken, async (req, res) => {
  try {
    const { taskType, proof } = req.body;
    
    if (!taskType || !proof) {
      return res.status(400).json({ error: 'نوع المهمة والدليل مطلوبان' });
    }
    
    // التحقق من صحة نوع المهمة
    const validTaskTypes = ['follow_twitter', 'follow_instagram', 'join_telegram', 'subscribe_youtube'];
    
    if (!validTaskTypes.includes(taskType)) {
      return res.status(400).json({ error: 'نوع المهمة غير صالح' });
    }
    
    // التحقق من أن المستخدم لم يكمل هذه المهمة من قبل
    const { data: existingTask, error: existingTaskError } = await supabase
      .from('completed_tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('task_type', taskType)
      .single();
    
    if (existingTask) {
      return res.status(400).json({ error: 'لقد أكملت هذه المهمة بالفعل' });
    }
    
    // تحديد مكافأة المهمة
    let reward;
    
    switch (taskType) {
      case 'follow_twitter':
        reward = 5;
        break;
      case 'follow_instagram':
        reward = 5;
        break;
      case 'join_telegram':
        reward = 10;
        break;
      case 'subscribe_youtube':
        reward = 15;
        break;
      default:
        reward = 5;
    }
    
    // الحصول على معلومات المستخدم
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    // إضافة المكافأة للمستخدم
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: user.coins + reward })
      .eq('id', user.id);
    
    if (updateError) {
      return res.status(500).json({ error: 'فشل في إضافة المكافأة للمستخدم' });
    }
    
    // إضافة سجل للمهمة المكتملة
    await supabase
      .from('completed_tasks')
      .insert([
        {
          user_id: user.id,
          task_type: taskType,
          reward,
          proof,
          timestamp: new Date().toISOString()
        }
      ]);
    
    res.json({
      success: true,
      message: 'تم إكمال المهمة بنجاح',
      reward,
      total_coins: user.coins + reward
    });
    
  } catch (error) {
    console.error('خطأ في إكمال المهمة:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// سحب العملات
app.post('/api/withdraw', authenticateToken, async (req, res) => {
  try {
    const { amount, wallet_address } = req.body;
    
    if (!amount || !wallet_address) {
      return res.status(400).json({ error: 'المبلغ وعنوان المحفظة مطلوبان' });
    }
    
    // التحقق من أن المبلغ عدد صحيح موجب
    if (!Number.isInteger(amount) || amount <= 0) {
      return res.status(400).json({ error: 'يجب أن يكون المبلغ عدداً صحيحاً موجباً' });
    }
    
    // الحصول على معلومات المستخدم
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'المستخدم غير موجود' });
    }
    
    // التحقق من أن المستخدم لديه عملات كافية
    if (user.coins < amount) {
      return res.status(400).json({ error: 'ليس لديك عملات كافية' });
    }
    
    // التحقق من أن المستخدم قد مر على إنشاء حسابه 37 يوماً على الأقل
    const createdAt = new Date(user.created_at);
    const now = new Date();
    const diffInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
    
    if (diffInDays < 37) {
      const remainingDays = Math.ceil(37 - diffInDays);
      return res.status(400).json({
        error: 'لا يمكنك سحب العملات الآن',
        remainingDays,
        message: `يمكنك سحب العملات بعد ${remainingDays} يوم`
      });
    }
    
    // خصم العملات من المستخدم
    const { error: updateError } = await supabase
      .from('users')
      .update({ coins: user.coins - amount })
      .eq('id', user.id);
    
    if (updateError) {
      return res.status(500).json({ error: 'فشل في خصم العملات من المستخدم' });
    }
    
    // إضافة سجل للسحب
    await supabase
      .from('withdrawals')
      .insert([
        {
          user_id: user.id,
          amount,
          wallet_address,
          status: 'pending',
          timestamp: new Date().toISOString()
        }
      ]);
    
    res.json({
      success: true,
      message: 'تم تقديم طلب السحب بنجاح',
      amount,
      remaining_coins: user.coins - amount
    });
    
  } catch (error) {
    console.error('خطأ في سحب العملات:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// الحصول على سجل المعاملات
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    // الحصول على سجل التعدين
    const { data: miningHistory, error: miningError } = await supabase
      .from('mining_history')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false });
    
    // الحصول على سجل المشتريات
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false });
    
    // الحصول على سجل السحب
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from('withdrawals')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false });
    
    // الحصول على سجل المهام المكتملة
    const { data: completedTasks, error: tasksError } = await supabase
      .from('completed_tasks')
      .select('*')
      .eq('user_id', req.user.id)
      .order('timestamp', { ascending: false });
    
    // دمج جميع المعاملات وترتيبها حسب الوقت
    const transactions = [
      ...(miningHistory || []).map(item => ({
        type: 'mining',
        amount: item.amount,
        timestamp: item.timestamp,
        details: 'تعدين يومي'
      })),
      ...(purchases || []).map(item => ({
        type: 'purchase',
        amount: -item.price,
        timestamp: item.timestamp,
        details: `شراء حزمة تعدين ${item.package_id}`
      })),
      ...(withdrawals || []).map(item => ({
        type: 'withdrawal',
        amount: -item.amount,
        timestamp: item.timestamp,
        details: `سحب إلى ${item.wallet_address.substring(0, 8)}...`,
        status: item.status
      })),
      ...(completedTasks || []).map(item => ({
        type: 'task',
        amount: item.reward,
        timestamp: item.timestamp,
        details: `إكمال مهمة ${item.task_type}`
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      success: true,
      transactions
    });
    
  } catch (error) {
    console.error('خطأ في الحصول على سجل المعاملات:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

// وظائف مساعدة

// إنشاء رمز إحالة فريد
function generateReferralCode(username) {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${username.substring(0, 4).toUpperCase()}${randomPart}`;
}

// تشغيل الخادم
app.listen(PORT, () => {
  console.log(`الخادم يعمل على المنفذ ${PORT}`);
});

module.exports = app;
