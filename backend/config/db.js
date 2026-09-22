const mongoose = require('mongoose');
const dns = require('dns');

// On some Windows setups the default DNS resolver is a local one (e.g. 127.0.0.1)
// that refuses SRV queries, breaking mongodb+srv:// connections with
// "querySrv ECONNREFUSED". Force a public resolver for the SRV lookup.
try {
    const servers = dns.getServers();
    const hasPublic = servers.some((s) => !/^(127\.|::1)/.test(s));
    if (!hasPublic) {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
    }
} catch (e) {
    // ignore - fall back to system resolver
}

let cached = global._mongooseConnection;

const connectDB = async () => {
    if (cached && cached.readyState === 1) {
        return cached;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        cached = conn.connection;
        global._mongooseConnection = cached;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`MongoDB Error: ${error.message}`);
        throw error;
    }
};

module.exports = connectDB;
