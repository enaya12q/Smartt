// هذا الملف يحتوي على نماذج قاعدة البيانات لتطبيق Smart Coin

// نموذج المستخدم
const userSchema = {
  id: 'uuid', // معرف فريد للمستخدم
  telegram_username: 'string', // اسم المستخدم على تيليغرام
  coins: 'number', // عدد العملات
  mining_rate: 'number', // معدل التعدين اليومي
  last_mining: 'timestamp', // وقت آخر عملية تعدين
  referral_code: 'string', // رمز الإحالة الخاص بالمستخدم
  referred_by: 'uuid', // معرف المستخدم الذي قام بالإحالة
  created_at: 'timestamp' // وقت إنشاء الحساب
};

// نموذج رموز التحقق
const verificationCodeSchema = {
  id: 'uuid', // معرف فريد لرمز التحقق
  username: 'string', // اسم المستخدم على تيليغرام
  code: 'string', // رمز التحقق
  created_at: 'timestamp' // وقت إنشاء الرمز
};

// نموذج سجل التعدين
const miningHistorySchema = {
  id: 'uuid', // معرف فريد للسجل
  user_id: 'uuid', // معرف المستخدم
  amount: 'number', // كمية العملات المعدنة
  timestamp: 'timestamp' // وقت التعدين
};

// نموذج المشتريات
const purchaseSchema = {
  id: 'uuid', // معرف فريد للمشتراة
  user_id: 'uuid', // معرف المستخدم
  package_id: 'number', // معرف حزمة التعدين
  price: 'number', // سعر الحزمة
  transaction_hash: 'string', // هاش المعاملة على شبكة TON
  timestamp: 'timestamp' // وقت الشراء
};

// نموذج الإحالات
const referralSchema = {
  id: 'uuid', // معرف فريد للإحالة
  referrer_id: 'uuid', // معرف المستخدم المحيل
  referred_id: 'uuid', // معرف المستخدم المحال
  timestamp: 'timestamp' // وقت الإحالة
};

// نموذج المهام المكتملة
const completedTaskSchema = {
  id: 'uuid', // معرف فريد للمهمة
  user_id: 'uuid', // معرف المستخدم
  task_type: 'string', // نوع المهمة
  reward: 'number', // المكافأة
  proof: 'string', // دليل إكمال المهمة
  timestamp: 'timestamp' // وقت إكمال المهمة
};

// نموذج عمليات السحب
const withdrawalSchema = {
  id: 'uuid', // معرف فريد لعملية السحب
  user_id: 'uuid', // معرف المستخدم
  amount: 'number', // كمية العملات المسحوبة
  wallet_address: 'string', // عنوان المحفظة
  status: 'string', // حالة السحب (معلق، مكتمل، مرفوض)
  timestamp: 'timestamp' // وقت طلب السحب
};

// تصدير النماذج
module.exports = {
  userSchema,
  verificationCodeSchema,
  miningHistorySchema,
  purchaseSchema,
  referralSchema,
  completedTaskSchema,
  withdrawalSchema
};
