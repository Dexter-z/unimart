"use client"
import { SignUpForm } from '@/components/signup-form';
import { GalleryVerticalEnd } from 'lucide-react';
import React from 'react'


const Signup = () => {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#18181b] p-4">
            <div className="w-full max-w-sm flex flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium text-[#ff8800]">
                    <div className="bg-[#ff8800] text-[#18181b] flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4" />
                    </div>
                    UniMart UNN
                </a>
                <SignUpForm />
            </div>
        </div>
    )
}

export default Signup
