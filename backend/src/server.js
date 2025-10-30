require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');

// Demo user seed (for one‑click login during review)
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function ensureDemoUser() {
  try {
    const email = process.env.DEMO_EMAIL || 'demo@demo.com';
    const name = process.env.DEMO_NAME || 'Demo User';
    const raw = process.env.DEMO_PASSWORD || '123456';
    let u = await User.findOne({ email });
    if (!u) {
      const passwordHash = await bcrypt.hash(raw, 10);
      u = await User.create({ email, passwordHash, name });
      console.log(`✅ Seeded demo user: ${email}`);
    } else {
      console.log(`ℹ️ Demo user exists: ${email}`);
    }
  } catch (e) {
    console.error('⚠️ Failed to ensure demo user', e);
  }
}

const port = process.env.PORT || 4000;

(async () => {
  await connectDB(process.env.MONGODB_URI);
  await ensureDemoUser();
  app.listen(port, () => console.log(`🚀 API on http://localhost:${port}`));
})();
