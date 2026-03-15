import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { emit } from 'process';


export async function POST(request: Request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        return Response.json(
            {success: false, message: 'Webhook secret not set'},
            {status: 500}
        )
    }

    // verifying the webhook is genuinely from clerk
    const headerPayload = await headers();
    const svix_id = headerPayload.get("svix-id")
    const svix_timestamp = headerPayload.get("svix-timestamp")
    const svix_signature = headerPayload.get("svix-signature")

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return Response.json(
            {success: false, message: 'Missing svix headers'},
            {status: 400}
        )
    }

    const payload = await request.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(WEBHOOK_SECRET)
    let event: WebhookEvent

    try {
        event = wh.verify(body, {
            "svix-id": svix_id,
            "svix-timestamp": svix_timestamp,
            "svix-signature": svix_signature
        }) as WebhookEvent
    } catch (error) {
        console.error('Webhook verification failed: ', error)
        return Response.json(
            {success: false, message: 'Invalid webhook signature'},
            {status: 400}
        )
    }

    await dbConnect()

    // handle user.created event
    // this fires when a user successfully signs up via clerk
    if(event.type === 'user.created') {
        // await dbConnect()

        const {id, username, email_addresses} = event.data
        const email = email_addresses[0]?.email_address

        try {
            await UserModel.create({
                clerkId: id,   //link db to clerk
                username: username ?? email, //if no username then email
                email,
                isAcceptingMessage: true,
                messages: []
            })

            return Response.json(
                {success: true, message: 'User created in database'},
                {status: 201}
            )
        } catch (error) {
            console.error('Error creating user in DB: ', error)
            return Response.json(
                {success: false, message: 'Error saving user to database'},
                {status: 500}
            )
        }
    }

    // handle user.updated event
    if(event.type === 'user.updated') {
        const {id, username, email_addresses} = event.data
        const email = email_addresses[0]?.email_address

        try {
            await UserModel.findOneAndUpdate(
                {clerkId: id},
                {username: username ?? email, email},
                {new: true}
            )

            return Response.json(
                {success: true, message: 'User updated'},
                {status: 200}
            )
        } catch (error) {
            console.error('Error updating user: ', error)
            return Response.json(
                {success: false, message: 'Error updating user'},
                {status: 500}
            )
        }
    }

    // handle user.deleted ebent
    //this fires when a user deletes their clerk account
    if(event.type === 'user.deleted') {
        // await dbConnect()


        try {
            await UserModel.findOneAndDelete({clerkId: event.data.id})
            return Response.json(
                {success: true, message: 'User deleted from database'},
                {status: 200}
            )
        } catch (error) {
            console.error('Error in deleting user from DB: ', error)
            return Response.json(
                {success: false, message: 'Error in deleting user from database'},
                {status: 500}
            )
        }
    }

    return Response.json(
        {success: true, message: 'Webhook received'},
        {status: 200}
    )
}