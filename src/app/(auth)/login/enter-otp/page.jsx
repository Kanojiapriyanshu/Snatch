"use client";
import { useSignIn, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Otp from "@/components/Otp";
import { initializeUserMetadata } from "@/app/actions/initializeMetadata";

export default function EnterOtp() {
  const { isLoaded, signIn } = useSignIn();
  const { session } = useSession();
  const router = useRouter();

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const emailFromUrl = urlParams.get("email");
    if (emailFromUrl) setEmail(emailFromUrl);
  }, []);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  useEffect(() => {
  if (session) {
    router.push("/dashboard");
  }
}, [session, router]);


  const verifyOtp = async () => {
  if (!isLoaded || !email || hasSubmitted) return;

  setIsLoading(true);
  setError("");

  try {
    const result = await signIn.attemptFirstFactor({
      strategy: "email_code",
      code: otp.join(""),
    });

    if (result.status === "complete") {
       setHasSubmitted(true); // ✅ lock interaction
      // No manual reload required!
        // call server action
      await initializeUserMetadata(result.createdSessionId.userId);
      window.location.href = "/onboarding/loading";
    } else {
      setError("OTP verification failed. Please try again.");
    }
  } catch (err) {
    setError(err.message || "Invalid OTP. Please try again.");
    //might need to throw error for global error page trigger
  } finally {
    setIsLoading(false);
  }
};

  const handleKeyDown = (e) => {
    if (e.key === "Enter") verifyOtp();
  };

  const handleResendOtp = async () => {
    if (!isLoaded || !email) return;

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await signIn.prepareFirstFactor({
        strategy: "email_code",
        emailAddressId: signIn.supportedFirstFactors[0]?.emailAddressId,
      });

      setResendSuccess(true);
      setResendTimer(60); // reset cooldown
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    router.push("/login");
  };

  return (
    <div className="h-screen flex flex-col justify-center lg:flex-row overflow-hidden bg-smoke relative w-screen">
      {/* Left Section */}
      <div className="lg:px-10 lg:py-9 xl:px-10 xl:py-9 2xl:px-10 lg:w-1/2 h-screen">
        
        {/* NEW: height limited wrapper */}
        <div className="relative h-full">
          <Image
            src="/assets/images/signup_background.png"
            alt="Signup Background"
            width={557}
            height={764}
            className="w-full h-full object-fill rounded-sm"
            priority
          />

          {/* overlay stays unchanged */}
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="relative flex flex-col items-center">
              <Image
                src="/assets/images/signup_frame.svg"
                alt="Signup Frame"
                width={304}
                height={40}
                className="hidden lg:block"
              />
              <Image
                src="/assets/logo/snatch_white.svg"
                alt="Logo"
                width={220}
                height={50}
                className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </div>
          </div>
        </div>
      </div>


      {/* Right Section */}
      <div className="relative flex flex-col h-screen w-full lg:w-1/2  justify-center items-center">
        <div className="  lg:mt-32 flex  flex-col justify-center items-center text-center w-full px-6 sm:px-10">
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-qimano mb-2">
            OTP Verification
          </h1>

          {/* Subheading */}
          {email && (
            <p className="text-gray-400 text-sm mb-8 font-apfel-grotezk-regular">
              Enter the 6 digit code sent to <span className="font-medium text-graphite">{email}</span>
            </p>
          )}

          {/* OTP Input */}
          <Otp otp={otp} setOtp={setOtp} onKeyDown={handleKeyDown} />

          {/* Resend Section */}
          <div className="mt-4 font-apfel-grotezk-regular text-sm">
            {resendTimer > 0 ? (
              <p className="text-gray-400">
                Didn’t receive the code? <span className="font-medium text-gray-700">Resend OTP</span> in {resendTimer}s
              </p>
            ) : (
              <p>
                Didn’t receive the code?{" "}
                <button
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-electric-blue hover:underline disabled:text-gray-400 font-medium"
                >
                  {isResending ? "Resending..." : "Resend OTP"}
                </button>
              </p>
            )}
            {resendSuccess && (
              <p className="text-green-500 text-sm mt-1">
                OTP resent successfully!
              </p>
            )}
          </div>

          {/* Verify Email Button */}
          <button
            onClick={verifyOtp}
            disabled={isLoading || hasSubmitted}
            className={`w-full sm:w-[356px] h-12 rounded-lg mt-6 flex items-center justify-center text-white text-base font-apfel-grotezk-regular ${
              isLoading || hasSubmitted
                ? "bg-[#BFCFFF] cursor-not-allowed"
                : "bg-electric-blue hover:bg-[#002ACC]"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Verifying...
              </div>
            ) : (
              "Verify Email"
            )}
          </button>

          {/* Change email link */}
          <button
            onClick={handleChangeEmail}
            className="mt-4 text-electric-blue text-md underline font-apfel-grotezk-regular"
          >
            Change the email address
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

          <p className="hidden text-md lg:block absolute bottom-10 max-w-96 text-center font-apfel-grotezk-regular bg-[#FAFAFA]/10">Tip: Can't find the OTP email? Check the <span className="text-electric-blue">Promotions tab</span></p>
      
      </div> 

    </div>
  );
}
