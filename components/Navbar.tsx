'use client';
import React from 'react'
import Link from 'next/link';
import { Button } from './ui/button';
import { useAuth, useUser, useClerk, SignInButton } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';


const Navbar = () => {
    const {isSignedIn, isLoaded} = useAuth()
    const {user} = useUser()
    if (!isLoaded) return null; //don't render anything until Clerk has loaded

  return (
    <nav className='p-4 md:p-6 shadow-md bg-gray-900 text-white'>
        <div className='container mx-auto flex flex-col md:flex-row justify-between items-center'>
            <Link className='text-xl font-bold mb-4 md:mb-0' href="#">Messaging Journey</Link>
            {
                isSignedIn ? (
                    <div className='flex items-center gap-4'>
                        <span>
                        Welcome, {user?.username ?? user?.primaryEmailAddress?.emailAddress}
                        </span>
                        <UserButton />
                    </div>
                ) : (
                    <SignInButton mode="modal">
                        <Button
                        className='w-full md:w-auto bg-slate-100 text-black'
                        variant='outline'
                        >
                        Login
                        </Button>
                    </SignInButton>
                )
            }
        </div>
    </nav>
  )
}

export default Navbar