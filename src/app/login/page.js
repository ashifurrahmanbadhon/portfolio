"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import CentralLoginPanel from "@/components/CentralLoginPanel";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, loading, router]);

  return <CentralLoginPanel />;
}
