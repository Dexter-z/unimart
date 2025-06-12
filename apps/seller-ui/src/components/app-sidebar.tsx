"use client"
import * as React from "react"
import { BellPlus, CalendarPlus, GalleryVerticalEnd, Home, List, PackageSearch, SquarePlus, Wallet } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import useSeller from "@/hooks/useSeller"
import { usePathname } from "next/navigation"

type SidebarSubItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  isActive?: boolean;
};

type SidebarItem = {
  title: string;
  url: string;
  icon?: React.ReactNode;
  items?: SidebarSubItem[];
};

// This is sample data.
const data: { navMain: SidebarItem[] } = {
  navMain: [
    {
      title: "Home",
      url: "/dashboard",
      icon: <Home />
    },

    {
      title: "Main Menu",
      url: "",
      items: [
        {
          icon: <List />,
          title: "Orders",
          url: "/dashboard/orders",
        },

        {
          icon: <Wallet />,
          title: "Payments",
          url: "/dashboard/payments",
        },
      ],
    },

    {
      title: "Products",
      url: "",
      items: [
        {
          icon: <SquarePlus />,
          title: "Create Product",
          url: "/dashboard/create-product",
        },

        {
          icon: <PackageSearch />,
          title: "All Products",
          url: "/dashboard/all-products",
        },
      ],
    },

    {
      title: "Events",
      url: "",
      items: [
        {
          icon: <CalendarPlus />,
          title: "Create Event",
          url: "/dashboard/create-event",
        },

        {
          icon: <BellPlus />,
          title: "All Events",
          url: "/dashboard/all-events",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathName = usePathname()
  const { seller } = useSeller()

  console.log(seller)

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/dashboard">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                  {/*Store logo goes above here*/}
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">{seller?.shop?.name}</span>
                  <h5 className="font-medium text-xs whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                    {seller?.shop?.address}
                  </h5>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                {/* Only render a button if item.url exists */}
                {item.url ? (
                  <SidebarMenuButton asChild>
                    <a href={item.url} className="font-medium flex items-center gap-2 hover:!text-blue-600 transition-colors">
                      {item.icon && <span className="mr-2">{item.icon}</span>}
                      {item.title}
                    </a>
                  </SidebarMenuButton>
                ) : (
                  // Render just the title for section headers like "Main Menu"
                  <div className="font-medium flex items-center gap-2 hover:!text-blue-600 transition-colors">
                    {item.title}
                  </div>)}
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton asChild isActive={!!subItem.isActive}>
                          <a href={subItem.url} className="flex items-center gap-2 hover:!text-blue-600 transition-colors">
                            {subItem.icon && <span className="mr-2">{subItem.icon}</span>}
                            {subItem.title}
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
