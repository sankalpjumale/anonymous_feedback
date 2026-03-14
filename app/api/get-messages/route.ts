import {auth} from "@clerk/nextjs/server";
import dbConnect from "@/lib/dbConnect";
import UserModel, {Message} from "@/models/User";


export async function GET(request: Request){
    await dbConnect()

    const {userId} = await auth()

    if(!userId) {
        return Response.json(
            {success: false, message: "Not Authenticated"},
            {status: 401}
        )
    }

    try {
        const userWithMessages = await UserModel.aggregate([
            { $match: {clerkId: userId}},
            { $unwind: {path: '$messages', preserveNullAndEmptyArrays: true}},
            { $sort: {'messages.createdAt' : -1}},
            { $group: {_id: '$_id', messages: {$push: '$messages'}}}
        ]).exec()

        if (!userWithMessages || userWithMessages.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                }, {status: 404}
            )
        }

        const messages = (userWithMessages[0].messages as (Message | null)[])
        .filter((m:any) => m !== null)

        return Response.json(
            {
                success: true,
                messages: userWithMessages[0].messages
            }, {status: 200}
        )
    } catch (error) {
        console.error('Error in getting messages: ', error)
        return Response.json(
            {
                success: false,
                message: 'Error in getting message'
            }, {status: 500}
        )
    }


}