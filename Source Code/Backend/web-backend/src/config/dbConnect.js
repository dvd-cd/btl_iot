import mongoose from "mongoose";

const dbConnect = async () => {
    try {
        const dbURI = process.env.MONGODB_URI;

        if (!dbURI) {
            console.error("[dbConnect.js] Error: MONGODB_URI is not existing in .env")
            process.exit(1);
        }

        const conn = await mongoose.connect(dbURI);

        console.log(`[dbConnect.js] MongoDB connected to db: ${conn.connection.db.databaseName}`);
    } catch (error) {
        console.error(`[dbConnect.js] Error: Connect to db failed, message: ${error.message}`);
        process.exit(1);
    }

}

export default dbConnect;