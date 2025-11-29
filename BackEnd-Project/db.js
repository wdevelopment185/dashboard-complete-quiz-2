require('dotenv').config();
const myMongoose = require('mongoose');

// Use environment variable for MongoDB URI.
// Support both MONGO_URI (used by tests / some docs) and MONGODB_URI (used in .env.example)
const mongoURL = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/document_optimizer';

// Creating a function to connect to MongoDB
const connectToMongo = async () => {
    try {
        await myMongoose.connect(mongoURL, {
            // useNewUrlParser and useUnifiedTopology are defaults in mongoose 6+
        });
        console.log('Connected to MongoDB');
    } catch (e) {
        console.error('Error connecting to MongoDB:', e.message);
        throw e; // rethrow so callers can detect failure
    }
};

module.exports = connectToMongo;