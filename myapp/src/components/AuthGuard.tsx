"use client";

import { useIsAuthenticated } from "@/redux/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useIsAuthenticated();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated === false) {
      // Redirect to /login with optional ?next=... query
      router.replace(`/auth/login`);
      toast('Login First to access this page')
    }
  }, [isAuthenticated, router, pathname]);

  // Optional: you can show a loading spinner while checking
  if (isAuthenticated === false) {
    return null; // or <Spinner />
  }

  return <>{children}</>;
}
