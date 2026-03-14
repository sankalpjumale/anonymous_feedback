import {auth} from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";


export async function DELETE(request: Request, {params}: {params: Promise<{messageid: string}>}){
    const {messageid} = await params
    await dbConnect()

    const {userId} = await auth()
    if (!userId) {
        return Response.json(
            {success: false, message: "Not Authenticated"},
            {status: 401}
        )
    }

    try {
        const updateResult = await UserModel.updateOne(
            // finding user by clerkId instead of MongoDB _id
            {clerkId: userId},
            {$pull: {messages: {_id: messageid}}}
        )
        if (updateResult.modifiedCount === 0){
            return Response.json(
                {
                    success: false,
                    message: "Message not found or already deleted"
                }, 
                {status: 404}
            )
        }

        return Response.json(
            {
                success: true,
                message: "Message Deleted successfully"
            },
            {status: 200}
        )
    } catch (error) {
        console.log("Error in deleting messages: ", error)
        return Response.json(
            {
                success: false,
                message: "Error in deleting message"
            },
            {status: 500}
        )
    }
}