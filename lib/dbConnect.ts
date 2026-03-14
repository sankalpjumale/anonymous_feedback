import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to database");
        return
    }

    if(!process.env.MONGODB_URI) {
        throw new Error("MONGODB_URI is not defined in .env file")
    }

    try {
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {})

        connection.isConnected = db.connections[0].readyState

        console.log("DB connected successfully");
        
    } catch (error) {
        console.error("Database connection failed", error);
        throw new Error(`Database connection failed: ${error}`)
        // process.exit(1)
    }
}

export default dbConnect