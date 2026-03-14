import {auth} from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

export async function POST(request: Request) {
    await dbConnect()
    const {userId} = await auth()
    if(!userId) {
        return Response.json(
            {success: false, message: 'Not Authenticated'},
            {status: 401}
        )
    }
    const {acceptMessages} = await request.json()

    try {
        //find user by clerkId instead of MongoDB_id
        const updatedUser = await UserModel.findOneAndUpdate(
            {clerkId: userId},
            { isAcceptingMessage: acceptMessages},
            {new: true}
        )
        if (!updatedUser){
            return Response.json(
                {
                    success: false,
                    message: 'Failed to update user status to accept messages',
                    // updatedUser
                }, {status: 404}
            )
        }

        return Response.json(
            {
                success: true,
                message: 'Message acceptance status updated successfully',
                updatedUser
            }, {status: 200}
        )
    } catch (error) {
        console.error('Failed to update user status to accept messages', error)
        return Response.json(
            {
                success: false,
                message: 'Failed to update user status to accept messages'
            }, {status: 500}
        )
    }
}

export async function GET(request: Request) {
    await dbConnect()
    const {userId} = await auth()
    if(!userId) {
        return Response.json(
            {success: false, message: 'Not Authenticated'},
            {status: 401}
        )
    }

    try {
        // find user by clerkId instead of MongoDB _id
        const foundUser = await UserModel.findOne({clerkId: userId})
        if (!foundUser){
            return Response.json(
                {
                    success: false,
                    message: 'User not found'
                }, {status: 404}
            )
        }
    
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage
            }, {status: 200}
        )
    } catch (error) {
        console.error('Error is getting message acceptance status', error)
        return Response.json(
            {
                success: false,
                message: 'Error is getting message acceptance status'
            }, {status: 500}
        )
    }
}