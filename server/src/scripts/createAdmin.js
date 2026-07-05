import '../config/env.js';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';

const [, , email, password, name = 'VaultShare Admin'] = process.argv;
if (!email || !password) {
  console.error('Usage: npm run admin:create --workspace server -- admin@example.com AdminPass#123');
  process.exit(1);
}

await connectDatabase();
const user = await User.findOne({ email }).select('+password');
if (user) {
  user.role = 'admin';
  user.status = 'active';
  if (password) user.password = password;
  await user.save();
  console.log(`Admin updated: ${email}`);
} else {
  await User.create({ name, email, password, role: 'admin', status: 'active', emailVerifiedAt: new Date() });
  console.log(`Admin created: ${email}`);
}
process.exit(0);