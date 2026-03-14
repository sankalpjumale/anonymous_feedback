import mongoose, { Schema, Document } from "mongoose";

export interface MessageType {
    _id: string;
    content: string;
    createdAt: string
}

export interface Message extends Document {
    content: string;
    createdAt: Date;
}

const MessageSchema: Schema<Message> = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
});

export interface User extends Document {
    // ✅ clerkId links your DB user to Clerk's user
    // Use this instead of managing your own auth
    clerkId: string;

    // ✅ Keep username — this is your app's own feature
    username: string;

    // ✅ Keep email — useful for sending messages, querying, etc.
    email: string;

    // ✅ Keep — your app's own feature
    isAcceptingMessage: boolean;
    messages: Message[];
}

const UserSchema: Schema<User> = new mongoose.Schema({
    // ✅ clerkId — the unique ID Clerk assigns to every user
    // Get it from auth() or currentUser() and save it here
    // Use this to link Clerk user →  database user
    clerkId: {
        type: String,
        required: [true, "Clerk ID is required"],
        unique: true
    },

    username: {
        type: String,
        required: [true, "Username is required"],
        trim: true,
        unique: true
    },

    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        match: [/.+\@.+\..+/, "Please use a valid email address"]
    },

    isAcceptingMessage: {
        type: Boolean,
        default: true
    },

    messages: [MessageSchema]
});

const UserModel =
    (mongoose.models.User as mongoose.Model<User>) ||
    mongoose.model<User>("User", UserSchema);

export default UserModel;