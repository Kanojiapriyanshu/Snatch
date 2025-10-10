//components/NextButton.jsx
"use client";
import { useRouter, usePathname } from "next/navigation";
import { useFormContext } from "@/app/onboarding/context";
import { useAuth } from "@clerk/nextjs";
import { handler } from "@/app/actions/onboarding";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const NextButton = () => {
  const [response, setResponse] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { formData, locationEnsureRef } = useFormContext();
  const { userId } = useAuth();
  const queryClient = useQueryClient();

  const handleNextClick = async () => {
    if (!userId) {
      alert("User ID is missing. Please log in.");
      return;
    }

    // // Ensure location is valid and synced before validation
    //   if (locationEnsureRef.current) {
    //     await locationEnsureRef.current();

    //     // Wait a tick to allow React state/context to update formData.location
    //     await new Promise((resolve) => setTimeout(resolve, 100));
    //   }


    if (pathname === "/onboarding/step-2") {
      const {
        username,
        industry,
        languages,
        compensation,
        post,
        story,
        reels,
        dateOfBirth,
      } = formData;

      const missingFields = [];

      if (!username?.trim()) missingFields.push("Username");
      if (!dateOfBirth?.trim()) missingFields.push("Date of Birth");
      if (!Array.isArray(industry) || industry.length === 0) missingFields.push("Industry");
      if (!Array.isArray(languages) || languages.length === 0) missingFields.push("Languages");
      if (!Array.isArray(compensation) || compensation.length === 0) missingFields.push("Compensation");
      if (post === 0) missingFields.push("Post Count");
      if (story === 0) missingFields.push("Story Count");
      if (reels === 0) missingFields.push("Reels Count");

      if (missingFields.length > 0) {
        toast.error(
          `Please complete the following field(s): ${missingFields.join(", ")}`
        );
        return;
      }

      try {
        setIsSubmitting(true);
        router.push('/onboarding/loading')

        const res = await fetch("/api/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, formData }),
        });

        const data = await res.json();
        setResponse(data);

        if (!res.ok) {
          throw new Error(data.message || "Failed to submit onboarding");
        }

        if (!data.success) {
          throw new Error(data.message || "Unexpected server response");
        }

        // Prefetch dashboard queries
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ["analytics", formData.username],
            queryFn: async () => {
              const r = await fetch(`/api/analytics?username=${formData.username}`);
              if (!r.ok) throw new Error("Failed to fetch analytics");
              return r.json();
            },
          }),
          queryClient.prefetchQuery({
            queryKey: ["instagramConnection", formData.username],
            queryFn: async () => {
              const r = await fetch("/api/auth/check-instagram-connection");
              return r.json();
            },
          }),
          queryClient.prefetchQuery({
            queryKey: ["influencerRequests", formData.username],
            queryFn: async () => {
              const r = await fetch(`/api/influencer-requests?username=${formData.username}`);
              return r.json();
            },
          }),
        ]);

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Optional smooth transition
        // Only navigate after everything succeeds
        router.push(`/dashboard/${formData.username}`);
      } catch (error) {
        console.error("Error completing onboarding:", error);
        console.error("An error occurred while submitting your data. Please try again.");
      } finally {
        setIsSubmitting(false);
      }

    } 
    
    else if (pathname === "/onboarding/step-1") {
      const {
        firstName,
        lastName,
        gender,
        dateOfBirth,
        location,
        instagram,
        profilePicture,
      } = formData;

      const missingFields = [];

      if (!firstName?.trim()) missingFields.push("First Name");
      if (!lastName?.trim()) missingFields.push("Last Name");
      if (!gender) missingFields.push("Gender");
      if (!dateOfBirth) missingFields.push("Date of Birth");
      if (!location?.trim()) missingFields.push("Location");
      if (!instagram?.trim()) missingFields.push("Instagram  username is mandatory");
      if (!profilePicture) missingFields.push("Profile Picture");

      if (missingFields.length > 0) {
        toast.error(
          `Please fill in the following required field(s): ${missingFields.join(", ")}`
        );
        return;
      }

      router.push("/onboarding/step-2");
    }
  };

  return (
    <button
      onClick={handleNextClick}
      disabled={isSubmitting}
      className={` h-[37px] border z-50 rounded-md text-center font-medium 
        ${isSubmitting 
          ? "w-[100px] bg-[#809DFF] text-white cursor-not-allowed" 
          : "w-[74px] bg-white text-electric-blue border-electric-blue hover:bg-electric-blue hover:text-white"}`}
    >
      {isSubmitting ? "Submitting..." : "Next"}
    </button>
  );
};

export default NextButton;


// FOR FIRST TIME, IT TOOK ME FROM STEP-2  TO LOADING TO STEP-1 THEN AFTER 2 SECS TO DASHBOARD  -> BECUASE STEP-2 FIELDS ARE STILL EMPTY