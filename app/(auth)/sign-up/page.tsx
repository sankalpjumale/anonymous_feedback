'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form"
import * as z from "zod"
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from 'usehooks-ts'
import { toast } from "sonner"
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schemas/signUpSchema";
import { ApiResponse } from "@/types/ApiResponse";
import axios, { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const page = () => {

    const [username, setUsername] = useState('')
    const [usernameMessage, setUsernameMessage] = useState('')
    const [isCheckingUsername, setIsCheckingUsername] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const debounced = useDebounceCallback(setUsername, 300)
    // const debouncedUsername = useDebounce(username, 300)
    const router = useRouter()

    // zod implementation
    const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
        username: '',
        email: '',
        password: ''
    }
    })

    useEffect(() => {
        const checkUsernameUnique = async () => {
            if (debounced) {
                setIsCheckingUsername(true)
                setUsernameMessage('') //reset message
                try {
                    const response = await axios.get<ApiResponse>(`/api/check-username-unique?username=${debounced}`)
                    setUsernameMessage(response.data.message)
                } catch (error) {
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error in checking username"
                    )
                } finally {
                    setIsCheckingUsername(false)
                }
            }
        }
        checkUsernameUnique()
    }, [debounced])

    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true)
        try {
            const response = await axios.post<ApiResponse>('/api/sign-up', data)
            toast.success(response.data.message)
            router.replace(`/verify/${username}`)
            setIsSubmitting(false)
        } catch (error) {
            console.error("Error in signup of user", error)
            const axiosError = error as AxiosError<ApiResponse>;
            let errorMessage = axiosError.response?.data.message
            toast("Signup failed",{
                description: errorMessage
            })
            setIsSubmitting(false)
        }
    }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl md-6">Join Message from Anonymous</h1>
                <p className="md-4">Sign up to start your anonymous journey</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField 
                        name="username"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                    <Input 
                                        placeholder='username' 
                                        {...field}
                                        onChange={(e) => {
                                            field.onChange(e)
                                            setUsername(e.target.value)
                                        }}
                                    />
                                {isCheckingUsername && <Loader2 className="animate-spin"/>}
                                <p className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>{usernameMessage}</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField 
                        name="email"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <Input 
                                    placeholder='email' 
                                    {...field}
                                />
                                <p className="text-muted text-gray-400 text-sm">We shall send you verification code</p>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField 
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                    <Input 
                                        type="password"
                                        placeholder='password' 
                                        {...field}
                                    />
                                <FormMessage />
                            </FormItem>

                        )}
                    />

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {
                            isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin"/> Please wait
                                </>
                            ) : ('Signup')
                        }
                    </Button>
                </form>
            </Form>
            <div className="text-center mt-4">
                <p>
                    Already a member?{''}
                    <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">Sign in</Link>
                </p>
            </div>
        </div>
    </div>
  )
}

export default page