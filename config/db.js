const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
    try {
        let uri = process.env.MONGO_URI;
        let isMemory = false;

        if (!uri) {
            mongoServer = await MongoMemoryServer.create();
            uri = mongoServer.getUri();
            isMemory = true;
            console.log('Using in-memory MongoDB');
        }

        const conn = await mongoose.connect(uri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        return { isMemory };
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
