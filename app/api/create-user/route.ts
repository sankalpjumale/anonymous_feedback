import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { auth, currentUser } from "@clerk/nextjs/server";



export async function GET() {
    await dbConnect()

    const {userId} = await auth()
    const clerkUser = await currentUser()

    if (!userId || !clerkUser) {
        return Response.json(
            {success: false, message: "Not logged in"},
            {status: 401}
        )
    }

    const existingUser = await UserModel.findOne({clerkId: userId})
    if (existingUser) {
        return Response.json(
            {success: true, message: "User already exists", user: existingUser}
        )
    }

    const newUser = await UserModel.create({
        clerkId: userId,
        username: clerkUser.username ?? clerkUser.emailAddresses[0]?.emailAddress,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        isAcceptingMessage: true,
        messages: []
    })

    return Response.json(
        {success: true, message: "User created in MongoDB", user: newUser}
    )
}
