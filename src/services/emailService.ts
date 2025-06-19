// Email service for sending welcome emails and managing user communications
export interface UserRegistration {
  name: string;
  email: string;
  createdAt: string;
  id: string;
}

// Simulated user database (in real app, this would be a backend database)
class UserDatabase {
  private static instance: UserDatabase;
  private users: UserRegistration[] = [];

  static getInstance(): UserDatabase {
    if (!UserDatabase.instance) {
      UserDatabase.instance = new UserDatabase();
    }
    return UserDatabase.instance;
  }

  addUser(user: Omit<UserRegistration, 'id' | 'createdAt'>): UserRegistration {
    const newUser: UserRegistration = {
      ...user,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  getAllUsers(): UserRegistration[] {
    return [...this.users];
  }

  getUserByEmail(email: string): UserRegistration | undefined {
    return this.users.find(user => user.email === email);
  }

  private saveToStorage(): void {
    localStorage.setItem('foodcheck_all_users', JSON.stringify(this.users));
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('foodcheck_all_users');
      if (stored) {
        this.users = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading users from storage:', error);
      this.users = [];
    }
  }
}

// Email templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to FoodCheck! 🍎',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to FoodCheck!</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 16px;">Your journey to healthier eating starts now</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${name}! 👋</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Thank you for joining FoodCheck! We're excited to help you make better food choices through our comprehensive analysis tools.
          </p>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0;">🚀 Get Started:</h3>
          <ul style="color: #4b5563; line-height: 1.8;">
            <li><strong>📧 Email Analysis:</strong> Send nutrition label photos to <a href="mailto:vrishankjo@gmail.com" style="color: #10b981;">vrishankjo@gmail.com</a></li>
            <li><strong>🤖 AI Vision:</strong> Use our instant camera analysis tool</li>
            <li><strong>💬 Chat Assistant:</strong> Ask our AI about nutrition and health</li>
            <li><strong>⭐ Vish Score:</strong> Get comprehensive nutrition + taste scoring</li>
          </ul>
        </div>

        <div style="background: linear-gradient(135deg, #dbeafe, #ecfdf5); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0;">🎯 What You'll Get:</h3>
          <div style="display: grid; gap: 15px;">
            <div style="display: flex; align-items: center;">
              <span style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">1</span>
              <span style="color: #374151;">Detailed nutrition breakdown</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">2</span>
              <span style="color: #374151;">Personalized health warnings</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background: #8b5cf6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">3</span>
              <span style="color: #374151;">Taste quality evaluation</span>
            </div>
            <div style="display: flex; align-items: center;">
              <span style="background: #f59e0b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; margin-right: 15px; font-weight: bold;">4</span>
              <span style="color: #374151;">Results in 1-20 minutes</span>
            </div>
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}" style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block;">Start Analyzing Food Now</a>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            💡 <strong>Pro Tip:</strong> For the most accurate analysis, make sure your nutrition label photos are clear and well-lit!
          </p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Questions? Reply to this email or contact us at <a href="mailto:vrishankjo@gmail.com" style="color: #10b981;">vrishankjo@gmail.com</a>
          </p>
          <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
            FoodCheck - Empowering better food choices through comprehensive analysis
          </p>
        </div>
      </div>
    `,
    text: `
Hi ${name}!

Welcome to FoodCheck! We're excited to help you make better food choices through our comprehensive analysis tools.

Get Started:
• Email Analysis: Send nutrition label photos to vrishankjo@gmail.com
• AI Vision: Use our instant camera analysis tool  
• Chat Assistant: Ask our AI about nutrition and health
• Vish Score: Get comprehensive nutrition + taste scoring

What You'll Get:
1. Detailed nutrition breakdown
2. Personalized health warnings
3. Taste quality evaluation
4. Results in 1-20 minutes

Start analyzing food now: ${window.location.origin}

Questions? Contact us at vrishankjo@gmail.com

FoodCheck - Empowering better food choices through comprehensive analysis
    `
  }),

  personalHi: (name: string) => ({
    subject: 'Hi from FoodCheck! 👋',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; margin: 0; font-size: 32px;">Hi ${name}! 👋</h1>
          <p style="color: #e0f2fe; margin: 10px 0 0 0; font-size: 18px;">Personal greetings from the FoodCheck team</p>
        </div>
        
        <div style="background: #f8fafc; padding: 25px; border-radius: 10px; margin-bottom: 25px; text-align: center;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Hello there! 🌟</h2>
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
            Just wanted to say <strong>Hi</strong> and let you know we're thinking of you! We hope you're enjoying your FoodCheck experience and making healthier food choices every day.
          </p>
        </div>

        <div style="background: linear-gradient(135deg, #dbeafe, #ecfdf5); padding: 20px; border-radius: 10px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0; text-align: center;">🎉 You're Amazing!</h3>
          <p style="color: #374151; text-align: center; line-height: 1.6;">
            By choosing FoodCheck, you're taking control of your health and making informed decisions about what you eat. That's something to be proud of!
          </p>
        </div>

        <div style="background: white; border: 2px solid #e5e7eb; border-radius: 10px; padding: 25px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin-top: 0; text-align: center;">🚀 Keep Going!</h3>
          <p style="color: #4b5563; text-align: center; line-height: 1.6;">
            Remember, we're here whenever you need us:
          </p>
          <ul style="color: #4b5563; line-height: 1.8; text-align: left; max-width: 400px; margin: 0 auto;">
            <li>📧 Send nutrition labels to <a href="mailto:vrishankjo@gmail.com" style="color: #10b981;">vrishankjo@gmail.com</a></li>
            <li>🤖 Try our AI Vision analysis</li>
            <li>💬 Chat with our AI assistant</li>
            <li>⭐ Get your Vish Score</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${window.location.origin}" style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; display: inline-block; font-size: 16px;">Visit FoodCheck Now</a>
        </div>

        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            💝 <strong>Thank you</strong> for being part of the FoodCheck family!
          </p>
        </div>

        <div style="text-align: center; padding: 20px; border-top: 1px solid #e5e7eb; margin-top: 30px;">
          <p style="color: #6b7280; margin: 0; font-size: 14px;">
            Have a wonderful day! 🌈<br>
            The FoodCheck Team
          </p>
          <p style="color: #9ca3af; margin: 10px 0 0 0; font-size: 12px;">
            <a href="mailto:vrishankjo@gmail.com" style="color: #10b981;">vrishankjo@gmail.com</a>
          </p>
        </div>
      </div>
    `,
    text: `
Hi ${name}! 👋

Hello there! 🌟

Just wanted to say Hi and let you know we're thinking of you! We hope you're enjoying your FoodCheck experience and making healthier food choices every day.

🎉 You're Amazing!
By choosing FoodCheck, you're taking control of your health and making informed decisions about what you eat. That's something to be proud of!

🚀 Keep Going!
Remember, we're here whenever you need us:
• Send nutrition labels to vrishankjo@gmail.com
• Try our AI Vision analysis
• Chat with our AI assistant
• Get your Vish Score

Visit FoodCheck: ${window.location.origin}

💝 Thank you for being part of the FoodCheck family!

Have a wonderful day! 🌈
The FoodCheck Team
vrishankjo@gmail.com
    `
  })
};

// Email service functions
export class EmailService {
  private userDb: UserDatabase;

  constructor() {
    this.userDb = UserDatabase.getInstance();
    this.userDb.loadFromStorage();
  }

  // Register a new user and send welcome email
  async registerUser(name: string, email: string): Promise<UserRegistration> {
    // Check if user already exists
    const existingUser = this.userDb.getUserByEmail(email);
    if (existingUser) {
      throw new Error('User already registered');
    }

    // Add user to database
    const newUser = this.userDb.addUser({ name, email });

    // Send welcome email (simulated)
    await this.sendWelcomeEmail(newUser);

    return newUser;
  }

  // Send welcome email to a user
  async sendWelcomeEmail(user: UserRegistration): Promise<void> {
    const template = emailTemplates.welcome(user.name);
    
    // In a real application, this would use a service like SendGrid, Mailgun, etc.
    console.log('📧 Sending welcome email to:', user.email);
    console.log('Subject:', template.subject);
    console.log('Email content prepared for:', user.name);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, we'll show the email content in console
    console.log('✅ Welcome email sent successfully to', user.email);
  }

  // Send personal "Hi" message to a user
  async sendPersonalHi(user: UserRegistration): Promise<void> {
    const template = emailTemplates.personalHi(user.name);
    
    console.log('👋 Sending personal Hi message to:', user.email);
    console.log('Subject:', template.subject);
    console.log('Personal greeting prepared for:', user.name);
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    console.log('✅ Personal Hi message sent successfully to', user.email);
  }

  // Send welcome emails to all registered users
  async sendWelcomeEmailToAll(): Promise<void> {
    const users = this.userDb.getAllUsers();
    
    if (users.length === 0) {
      console.log('📭 No registered users found');
      return;
    }

    console.log(`📧 Sending welcome emails to ${users.length} users...`);
    
    for (const user of users) {
      try {
        await this.sendWelcomeEmail(user);
        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`❌ Failed to send email to ${user.email}:`, error);
      }
    }
    
    console.log('✅ Finished sending welcome emails to all users');
  }

  // Send personal "Hi" messages to all registered users
  async sendHiToAllUsers(): Promise<void> {
    const users = this.userDb.getAllUsers();
    
    if (users.length === 0) {
      console.log('📭 No registered users found to say Hi to');
      return;
    }

    console.log(`👋 Saying Hi to ${users.length} users...`);
    
    for (const user of users) {
      try {
        await this.sendPersonalHi(user);
        // Add small delay between emails to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 600));
      } catch (error) {
        console.error(`❌ Failed to send Hi message to ${user.email}:`, error);
      }
    }
    
    console.log('✅ Finished saying Hi to all users! 🎉');
  }

  // Get all registered users
  getAllUsers(): UserRegistration[] {
    return this.userDb.getAllUsers();
  }

  // Get user statistics
  getUserStats() {
    const users = this.userDb.getAllUsers();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      total: users.length,
      today: users.filter(u => new Date(u.createdAt) >= today).length,
      thisWeek: users.filter(u => new Date(u.createdAt) >= thisWeek).length,
      thisMonth: users.filter(u => new Date(u.createdAt) >= thisMonth).length,
      emails: users.map(u => u.email)
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();