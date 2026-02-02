// Quick script to fix the database index issue
// Run this once: node backend/fix-db.js

require('dotenv').config({ path: './backend/.env' });
const mongoose = require('mongoose');

async function fixDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        
        // Drop the incorrect userId index from users collection
        try {
            await db.collection('users').dropIndex('userId_1');
            console.log('✅ Dropped userId_1 index from users collection');
        } catch (err) {
            console.log('Index userId_1 does not exist or already dropped');
        }

        // List all indexes to verify
        const indexes = await db.collection('users').indexes();
        console.log('\nCurrent indexes on users collection:');
        console.log(JSON.stringify(indexes, null, 2));

        await mongoose.connection.close();
        console.log('\n✅ Database fixed! You can now signup.');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixDatabase();
