"use client"
import React from 'react'

import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="dark min-h-screen flex">
            <SidebarProvider>
                <AppSidebar />
                <div className="flex-1 flex flex-col">
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
                            <div className="flex items-center gap-2 px-3">
                                <SidebarTrigger />
                                <Separator orientation="vertical" className="mr-2 h-4" />
                            </div>
                        </header>
                    </SidebarInset>
                    <main className="flex-1 overflow-auto">
                        {children}
                    </main>
                </div>
            </SidebarProvider>
        </div>
    )
}

export default Layout