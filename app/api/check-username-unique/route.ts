import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import {z} from "zod";
import {Redis} from "@upstash/redis";



const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN
})

const MAX_CHECK = 20; //max 20 request
const RATE_WINDOW = 60 //per 60 second

// username validation
const usernameValidation = z
    .string()
    .min(2, "Username must be at least 2 characters")
    .max(20, "username must be not more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters")

const UsernameQuerySchema = z.object({
    username: usernameValidation
})

// Upstash rate limiter
async function checkRateLimit(ip: string): Promise<boolean> {
    const key = `rate_limit:username_check:${ip}` //key format

    // increment the counter for this ip and if key doesn't exist, then Upstash creates it starting at 1
    const count = await redis.incr(key)

    // on first request, set expiry of 60 seconds and after 60 sec key is deleted and counts reset
    if (count === 1){
        await redis.expire(key, RATE_WINDOW)
    }

    // return false
    return count <= MAX_CHECK
}

export async function GET(request: Request) {
    await dbConnect()

    try {
        // get Ip from request headers
        const ip = 
            request.headers.get('x-forwarded-for') ||
            request.headers.get('x-real-ip') ||
            'unknown'
        
        // Check rate limit
        const allowed = await checkRateLimit(ip)

        if (!allowed){
            return Response.json(
                {success: false, message: "Too many requests. Please try again later."},
                {status: 429}
            )
        }

        // extract and decode username from query params
        const {searchParams} = new URL(request.url)
        const rawUsername = searchParams.get('username')
        const decodedUsername = rawUsername
            ? decodeURIComponent(rawUsername)
            : null
        
        // validate username format
        const result = UsernameQuerySchema.safeParse({
            username: decodedUsername
        }) 

        if (!result.success) {
            const usernameErrors = result.error.format().username?._error || []
            return Response.json(
                {   success: false, 
                    message: 
                        usernameErrors.length > 0
                        ? usernameErrors.join(', ')
                        : 'Invalid username format'

                }, {status: 400}
            )
        }

        const {username} = result.data

        const existingUser = await UserModel.findOne({
            username: {$regex: new RegExp(`^${username}$`, 'i')}
        })

        // check username is taken (case-sensitive)
        if (existingUser) {
            return Response.json(
                {success: false, message: 'Username is already taken'},
                {status: 409}
            )
        }

        return Response.json(
            {success: true, message: 'Username is available'},
            {status: 200}
        )
    } catch (error) {
        console.error('Error in checking username: ', error)
        return Response.json(
            {success: false, message: "Error in checking username"},
            {status: 500}
        )
    }
}