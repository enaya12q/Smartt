import TonWeb from 'tonweb';

// عنوان العقد الذكي على شبكة TON
const SMART_CONTRACT_ADDRESS = 'UQAvZYcNUln-dnITyTqWC0ryna5PbYgtNIVW9cM53aJlrgqT';
// عنوان المحفظة الذي سيتم توجيه المدفوعات إليه
const PAYMENT_WALLET_ADDRESS = 'UQAvZYcNUln-dnITyTqWC0ryna5PbYgtNIVW9cM53aJlrgqT';

// تكوين اتصال WebSocket مع شبكة TON
const TON_NODE_URL = 'wss://32e3df1bb58960b9f1da65807c36836f71b71f93363450e2624fecd31bc57c3e@your-ton-node-url';

class TONService {
  constructor() {
    // إنشاء كائن TonWeb
    this.tonweb = new TonWeb(new TonWeb.HttpProvider(TON_NODE_URL));
    this.smartContract = null;
    this.initialized = false;
  }

  // تهيئة الخدمة
  async initialize() {
    try {
      // إنشاء كائن العقد الذكي
      this.smartContract = new TonWeb.Contract(this.tonweb.provider, {
        address: SMART_CONTRACT_ADDRESS,
      });
      this.initialized = true;
      console.log('TON Service initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize TON Service:', error);
      return false;
    }
  }

  // التحقق من حالة التهيئة
  checkInitialized() {
    if (!this.initialized) {
      throw new Error('TON Service is not initialized. Call initialize() first.');
    }
  }

  // الحصول على معلومات العقد الذكي
  async getContractInfo() {
    this.checkInitialized();
    try {
      const result = await this.smartContract.methods.get_contract_info().call();
      return {
        totalSupply: result[0],
        ownerAddress: result[1],
        timestamp: result[2]
      };
    } catch (error) {
      console.error('Failed to get contract info:', error);
      throw error;
    }
  }

  // الحصول على رصيد المستخدم
  async getUserBalance(walletAddress) {
    this.checkInitialized();
    try {
      const result = await this.smartContract.methods.get_balance(walletAddress).call();
      return {
        balance: result[0],
        exists: result[1] === 1
      };
    } catch (error) {
      console.error('Failed to get user balance:', error);
      throw error;
    }
  }

  // شراء حزمة تعدين
  async buyMiningPackage(packageId, userWallet) {
    this.checkInitialized();
    
    // تحديد سعر الحزمة بناءً على معرّف الحزمة
    let packagePrice;
    switch (packageId) {
      case 1:
        packagePrice = '0.1'; // 0.1 TON
        break;
      case 2:
        packagePrice = '0.3'; // 0.3 TON
        break;
      case 3:
        packagePrice = '0.5'; // 0.5 TON
        break;
      default:
        throw new Error('Invalid package ID');
    }
    
    try {
      // إنشاء معاملة لشراء حزمة التعدين
      const transaction = await this.tonweb.payments.createTransaction({
        to: PAYMENT_WALLET_ADDRESS,
        value: packagePrice,
        message: JSON.stringify({
          op: 'buy_mining_package',
          package_id: packageId,
          user_address: userWallet.address
        })
      });
      
      // إرسال المعاملة
      await transaction.send();
      
      return {
        success: true,
        message: 'تم شراء حزمة التعدين بنجاح',
        packageId,
        price: packagePrice
      };
    } catch (error) {
      console.error('Failed to buy mining package:', error);
      throw error;
    }
  }

  // المطالبة بمكافآت التعدين
  async claimMiningRewards(userWallet) {
    this.checkInitialized();
    
    try {
      // إنشاء معاملة للمطالبة بمكافآت التعدين
      const transaction = await this.tonweb.payments.createTransaction({
        to: SMART_CONTRACT_ADDRESS,
        value: '0.01', // رسوم المعاملة
        message: JSON.stringify({
          op: 'claim_rewards',
          user_address: userWallet.address
        })
      });
      
      // إرسال المعاملة
      await transaction.send();
      
      return {
        success: true,
        message: 'تمت المطالبة بمكافآت التعدين بنجاح'
      };
    } catch (error) {
      console.error('Failed to claim mining rewards:', error);
      throw error;
    }
  }

  // إنشاء محفظة TON جديدة
  async createWallet() {
    try {
      // إنشاء زوج مفاتيح جديد
      const keyPair = await this.tonweb.utils.keyPair();
      
      // إنشاء محفظة جديدة
      const wallet = new this.tonweb.Wallets.SimpleWallet(this.tonweb.provider, {
        publicKey: keyPair.publicKey
      });
      
      // الحصول على عنوان المحفظة
      const walletAddress = await wallet.getAddress();
      
      return {
        success: true,
        keyPair,
        wallet,
        address: walletAddress.toString()
      };
    } catch (error) {
      console.error('Failed to create wallet:', error);
      throw error;
    }
  }

  // استيراد محفظة TON موجودة
  async importWallet(mnemonicPhrase) {
    try {
      // التحقق من صحة العبارة المساعدة
      if (!mnemonicPhrase || mnemonicPhrase.split(' ').length !== 24) {
        throw new Error('Invalid mnemonic phrase. Must be 24 words.');
      }
      
      // استخراج زوج المفاتيح من العبارة المساعدة
      const keyPair = await this.tonweb.utils.mnemonicToKeyPair(mnemonicPhrase.split(' '));
      
      // إنشاء كائن المحفظة
      const wallet = new this.tonweb.Wallets.SimpleWallet(this.tonweb.provider, {
        publicKey: keyPair.publicKey
      });
      
      // الحصول على عنوان المحفظة
      const walletAddress = await wallet.getAddress();
      
      return {
        success: true,
        keyPair,
        wallet,
        address: walletAddress.toString()
      };
    } catch (error) {
      console.error('Failed to import wallet:', error);
      throw error;
    }
  }

  // الحصول على رصيد محفظة TON
  async getTONBalance(walletAddress) {
    try {
      const balance = await this.tonweb.getBalance(walletAddress);
      return {
        success: true,
        balance: balance
      };
    } catch (error) {
      console.error('Failed to get TON balance:', error);
      throw error;
    }
  }
}

// تصدير كائن الخدمة
const tonService = new TONService();
export default tonService;
