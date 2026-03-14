'use client';
import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import messages from "@/messages.json"
import Autoplay from "embla-carousel-autoplay"
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { useAuth } from "@clerk/nextjs";

export default function Home(){
  const {isSignedIn} = useAuth()
  return (
    <>
    <main className='flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gray-800 text-white'>
      <section className='text-center mb-8 md:mb-12'>
        <h1 className='text-3xl md:text-5xl font-bold'>Dive into the world of Messages</h1>
        <p className='mt-3 md:mt-4 text-base md:text-lg'>Explore Anonymous Message - Where you have secret identity</p>

         {/* ✅ Added auth buttons so users can sign in/up from home page */}
          <div className="mt-6 flex gap-4 justify-center">
            {/* Show when logged OUT */}
            <SignUpButton mode="modal">
                  <Button className="bg-white text-gray-800 hover:bg-gray-100">
                    Get Started
                  </Button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <Button variant="outline" className="border-white text-gray-800 hover:bg-gray-100">
                    Sign In
                  </Button>
                </SignInButton>

            {/* Show when logged IN */}
            {isSignedIn && (
              <Link href="/dashboard">
                <Button className="bg-white text-gray-800 hover:bg-gray-100">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
      </section>

      <Carousel plugins={[Autoplay({delay: 2000})]} opts={{ loop: true }} className="w-full max-w-lg md:max-w-xl">
        <CarouselContent>
          {
            messages.map((message, index) => (
              <CarouselItem key={index}>
                <div className="p-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>{message.title}</CardTitle>
                    </CardHeader>

                    <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                      <Mail className='flex-shrink-0'/>
                      <div>
                        <p>{message.content}</p>
                        <p className="text-xs text-muted-foreground">{message.received}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))
          }
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </main>
    <footer className="text-center p-4 md:p-6 bg-gray-900 text-white">
       ©2026 Anonymous Message. All rights reserved.
    </footer>
    </>
  )
}

