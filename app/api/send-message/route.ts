import dbConnect from "@/lib/dbConnect";
import UserModel, { Message } from "@/models/User";

export async function POST(request: Request) {
    await dbConnect()

    const {username, content} = await request.json()

    // check for missing fields
    if (!username || !content) {
        return Response.json(
            {success: false, message: "Username and Content are required"},
            {status: 400}
        )
    }

    if (content.length < 10 || content.length > 300) {
        return Response.json(
            {success: false, message: "Message must be between 10 and 300 characters"},
            {status: 400}
        )
    }

    try {
        const user = await UserModel.findOne({username}).exec()

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: 'User not found'
                }, {status: 404}
            )
        }

        //is user appecting messages
        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages"
                }, {status: 403}
            )
        }

        const newMessage = {content, createdAt: new Date()}
        user.messages.push(newMessage as Message)
        await user.save()

        return Response.json(
            {
                success: true,
                message: 'Message sent successfully' 
            }, {status: 201}
        )
    } catch (error) {
        console.error('Error in sending message: ', error)
        return Response.json(
            {
                success: false,
                message: 'Error in sending message'
            }, {status: 500}
        )
    }
}