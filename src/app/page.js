// app/page.js (Server Component)
"use client";
import Image from "next/image";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useSignUp } from "@clerk/nextjs";
import * as z from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
export default function SignUp() {
  const router = useRouter();
  const { signUp } = useSignUp();
  //const { isSignedIn } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [inputError, setInputError] = useState("");
  const { isLoaded, isSignedIn } = useUser();
  const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return (
      <div className="h-screen bg-smoke flex justify-center items-center">
        <p className="text-2xl text-electric-blue">Loading...</p>
      </div>
    );
  }


  const handleVerifyEmail = async () => {
  //Revalidate email on submission

   const validation = emailSchema.safeParse(email);
   if(!validation.success){
    setError(validation.error.issues[0].message);
    return;
   }

    if (!isLoaded) return;
    setIsVerifying(true);
    setError("");

    try {
      const { createdUser } = await signUp.create({
        email_address: email, 
      });

      // Prepare the email address for OTP verification
      await signUp.prepareEmailAddressVerification();

      // Navigate to OTP entry page
      router.push(`/signup/enter-otp?email=${email}`);
    }   catch (err) {
  console.error("Sign-in error:", err);

  // Get the first error from Clerk (it's an array)
  const clerkError = err?.errors?.[0];

  // Use error code to set a custom message
  if (clerkError?.code === "form_identifier_not_found") {
    setError("This email is not registered. Please create an account.");
  } else if (clerkError?.code === "form_param_format_invalid") {
    setError("Please enter a valid email address.");
  } else {
    // Fall back to Clerk's own message or a default
    setError(clerkError?.message || "Something went wrong. Please try again.");
  }
}
  };

  function handleInputChange(e) {
    const value = e.target.value;
    setEmail(value);

    // Validate email input in real-time
    const validation = emailSchema.safeParse(value);
    if (!validation.success) {
      setInputError(validation.error.issues[0].message);
    } else {
      setInputError('');
    }
  }

  const handleKeyDown = (e) => {
    // Check if the Enter key is pressed
    if (e.key === "Enter") {
      handleVerifyEmail();
    }
  };

  return (
    <div className="h-screen  flex flex-col justify-center lg:flex-row overflow-hidden ">
      {/* Left Section for Image */}
      <div className="lg:px-10 lg:py-9 xl:px-10 xl:py-9 2xl:px-10  relative lg:w-1/2 h-screen">
      <Image
        src="/assets/images/signup_background.png"
        alt="Signup Background"
        width={557}
        height={764}
        className=" w-full max-h-[50vh] aspect-auto lg:max-h-full rounded-sm object-fill"
        loading="eager"
        priority
      />

        {/* Signup Frame and Logo */}
  <div className="absolute h-[300px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 2xl:max-lg:left-10 z-10 flex flex-col items-center justify-center ">
    {/* Signup Frame */}
    <Image
      src="/assets/images/signup_frame.svg"
      alt="Signup Frame"
      width={304}
      height={40}
      className="hidden lg:block mx-auto"
      loading="eager"
      priority
    />

    {/* Logo (absolute inside the frame) */}
    <Image
      src="/assets/logo/snatch_white.svg"
      alt="Logo"
      width={220}
      height={50}
      className="absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      loading="eager"
      priority
    />

  </div>

        {/* Mobile Logo */}
        <Image
        src="/assets/logo/snatch_white.svg"
        alt="Mobile Logo"
        width={189}
        height={20}
        className="w-[120px] block lg:hidden mx-auto absolute top-10 left-1/2 transform -translate-x-1/2 z-20"
        loading="eager"
        priority
        />
    </div>


      {/* Right Section for Text */}
      <div className="flex h-[100%] lg:h-full w-full lg:w-1/2 justify-center items-center ">
        <div className="flex flex-col justify-center items-center text-center w-full px-6 sm:px-10">
          <h1 className="text-graphite text-2xl sm:text-5xl mb-8 font-qimano">Sign Up</h1>
          <div className="relative w-full sm:w-[356px]">
            <input
              type="email"
              placeholder="Enter email address"
              className={`w-full bg-transparent rounded-md border py-3 pl-5 text-dark-6 outline-none ${
                inputError ? 'border-red-500' : 'border-stroke'
              }`}
              value={email}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
            />
             {inputError && <p className="text-red-500 mt-2">{inputError}</p>}
          </div>
               <button
            onClick={handleVerifyEmail}
            disabled={isVerifying}
            className={`w-full sm:w-[356px] h-12 rounded-lg mt-4 flex items-center justify-center ${
              isVerifying
                ? "bg-[#809DFF] cursor-not-allowed"
                : "bg-electric-blue hover:bg-[#002ACC]"
            } text-white`}
          >
            Click here: {userId ? "Dashboard" : "Create your account"} page
          </Link>
        </p>

         <div className="flex items-center my-3 w-[300px]">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-4 text-gray-500 text-sm">or</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>
          <div className="mt-2 text-dark-grey">
            Already have an account?
            <Link href="/login">
              <span className="text-electric-blue ml-2 cursor-pointer">Login</span>
            </Link>
          </div>
        </div>
      </div>
  );
}


function Loading() {
  return (
    <div className="h-screen bg-smoke flex justify-center items-center">
      <p className="text-2xl text-electric-blue">Loading...</p>
    </div>
  );
}