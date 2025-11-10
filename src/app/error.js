"use client"
import { usePathname } from "next/navigation";
import ErrorPage from "@/components/ui/ErrorPage";

export default function GlobalError({ error }) {
  const pathname = usePathname();
  let title = "Something went wrong";
  let message = "Please try refreshing.";
  let buttonText = "Refresh page";

  if (pathname.startsWith("/dashboard")) {
    title = "Oops, looks like something’s wrong";
    message = "It’s taking a bit? Hit refresh, we’re a tiny team doing our best🥹";
    
  } else if (pathname.startsWith("/login")) {
    title = "Oops, looks like something’s wrong";
    message = "We blinked and missed your login 😅 give it another go?";
  }
  else if (pathname.startsWith("/profile" || "/manage-projects")) {
    title = "Oops, looks like something’s wrong";
    message = "Page’s being moody, head back to dashboard and refresh?"
  }
 
  return (
    <ErrorPage
      title={title}
      message={message}
      buttonText={buttonText}
      buttonHref="/dashboard"
    />
  );
}
