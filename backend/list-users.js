const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const User = require('./models/User');
(async () => {
    await connectDB();
    const users = await User.find({}).select('name email role').sort('email');
    console.log('Total users:', users.length);
    users.forEach(u => console.log(`- ${u.email}  | ${u.role}  | ${u.name}`));
    process.exit(0);
})();
