//  src/app/(auth)/signup/enter-otp/page.jsx

"use client";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Otp from "@/components/Otp";

export default function EnterOtp() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [otp, setOtp] = useState(Array(6).fill("")); 
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);

  console.log("signUp", signUp);

  useEffect(() => {
    // Get the email from the query string on page load
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get("email");
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, []);

  useEffect(() => {
  let timer;
  if (resendTimer > 0) {
    timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
  }
  return () => clearTimeout(timer);
}, [resendTimer]);


  const verifyOtp = async () => {
    if (!isLoaded || !email) return;
    setIsVerifying(true);
    setError("");
  
    console.log("enter-otp login email", email)
    try {
      console.log("Attempting OTP verification with code:", otp.join(""));
      const signInAttempt = await signUp.attemptEmailAddressVerification({ code: otp.join("") });
    
      console.log("sign attempt status", signInAttempt.status); //done
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/onboarding/step-1");
      } 
    } catch (err) {
      console.error("Error during OTP verification:", err);
      setError(err.errors && err.errors[0]?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    } 
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      verifyOtp();
    }
  };

const handleResendOtp = async () => {
  if (!isLoaded || !signUp) return;

  setIsResending(true);
  setError("");
  setResendSuccess(false);

  try {
    await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
    setResendSuccess(true);
    setResendTimer(60); // reset cooldown
  } catch (err) {
    console.error("Resend OTP error:", err);
    setError(err.errors?.[0]?.message || "Failed to resend OTP. Try again.");
  } finally {
    setIsResending(false);
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
      <h1 className="text-graphite text-2xl sm:text-5xl mb-8 font-qimano">Enter OTP</h1>
      <Otp otp={otp} setOtp={setOtp}  onKeyDown={handleKeyDown}/> 
      {email && (
  <p className="text-[#f7f7f7] text-sm mb-6 font-apfel-grotezk-regular">
    OTP has been sent to{" "}
    <span className="font-medium text-black">{email}</span>
  </p>
      )}
       <div className="mt-4 mb-1 font-apfel-grotezk-regular">
        {resendTimer > 0 ? (
          <p className="text-gray-500 text-sm">
            You can resend OTP in {resendTimer}s
          </p>
        ) : (
          <button
            onClick={handleResendOtp}
            disabled={isResending}
            className="text-sm text-electric-blue hover:underline disabled:text-gray-400"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </button>
        )}
        {resendSuccess && (
          <p className="text-green-500 text-sm mt-1">OTP resent successfully!</p>
        )}
      </div>
       <button
            onClick={verifyOtp}
            disabled={isVerifying}
            className={`w-full sm:w-[356px] h-12 rounded-lg mt-4 flex items-center justify-center ${
              isVerifying
                ? "bg-[#809DFF] cursor-not-allowed"
                : "bg-electric-blue hover:bg-[#002ACC]"
            } text-white`}
          >
            {isVerifying ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying...
              </div>
            ) : (
              "Verify OTP"
            )}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}     
      </div>
    </div>
  </div>
  );
}
