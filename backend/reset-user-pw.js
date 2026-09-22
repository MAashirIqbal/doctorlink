// One-off: reset an app user's password. Run: node reset-user-pw.js
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./config/db');
const User = require('./models/User');

const EMAIL = process.argv[2];
const NEW_PW = process.argv[3];

(async () => {
    try {
        await connectDB();
        const user = await User.findOne({ email: EMAIL.toLowerCase() }).select('+password');
        if (!user) {
            console.log('NOT_FOUND: no user with email', EMAIL);
            process.exit(1);
        }
        console.log('Found user:', user.name, '| role:', user.role, '| id:', String(user._id));
        user.password = NEW_PW;      // pre-save hook hashes it
        await user.save();
        // verify
        const check = await User.findById(user._id).select('+password');
        const ok = await check.matchPassword(NEW_PW);
        console.log('Password updated. Verify matchPassword:', ok);
        process.exit(ok ? 0 : 2);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(3);
    }
})();
