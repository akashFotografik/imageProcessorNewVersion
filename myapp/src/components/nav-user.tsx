// components/NavUser.tsx
"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppDispatch } from "@/redux/hooks"; // Import useAppDispatch
import { logoutUser } from "@/redux/slices/authSlice"; // Import logoutUser thunk
import { toast } from "sonner";

export function NavUser({
  user,
}: {
  user: {
    fullName: string;
    email: string;
    avatar: string;
    role: string; // Assuming role is a string, adjust as necessary
  };
}) {
  const { isMobile } = useSidebar();
  const dispatch = useAppDispatch(); // Initialize dispatch

  // Handle logout click
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap(); // Dispatch logoutUser and wait for completion
      window.location.href = '/auth/login'; // Redirect to login page after successful logout
      toast('Logout successful!')
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally, show an error message to the user
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarImage src={user.avatar} alt={user.fullName} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.fullName} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
                {user.role === 'SUPER_ADMIN' && (
                <DropdownMenuItem onClick={() => window.location.href = '/panels/superAdminPanel'}>
                  <IconUserCircle />
                  Super Admin Panel
                </DropdownMenuItem>
                )}
              {user.role === 'ADMIN' && (
                <DropdownMenuItem onClick={() => window.location.href = '/panels/adminPanel'}>
                <IconUserCircle />
                Admin Panel
              </DropdownMenuItem>
              )}
              {user.role === 'DIRECTOR' && (
                <DropdownMenuItem onClick={() => window.location.href = '/panels/directorPanel'}>
                <IconUserCircle />
                Director Panel
              </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}