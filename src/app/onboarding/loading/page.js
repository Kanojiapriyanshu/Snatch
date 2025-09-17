"use client";
import Image from "next/image";
import { useSession, useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoadingTransition() {
   const { session } = useSession();
  const router = useRouter();

  const auth = useAuth();
  console.log("Auth object:", auth);

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="animate-pulse mb-4">
        <Image
          src="/assets/images/loading.svg"
          alt="Loading"
          width={64}
          height={64}
          className="w-16 h-16"
        />
      </div>
      <p className="text-electric-blue font-qimano text-md lg:text-2xl animate-pulse text-center">
        Welcome to Snatch! We’re setting things up for you…
      </p>
    </div>
  );
}
