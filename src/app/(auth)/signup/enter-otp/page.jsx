// src/app/(auth)/signup/enter-otp/page.jsx

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

  // So the benefit of the debounce is specifically to avoid invalid_action errors (caused by session/timing issues), while better error handling helps you show the user why it failed.
  
  const verifyOtp = async () => {
    // if (!isLoaded || !email) return;
    if (!isLoaded || !email || hasSubmitted) return;
    setIsLoading(true);
    setError("");

    try {
      const signInAttempt = await signUp.attemptEmailAddressVerification({
        code: otp.join(""),
      });

      if (signInAttempt.status === "complete") {
        setHasSubmitted(true)  // ✅ lock interaction
        await setActive({ session: signInAttempt.createdSessionId });
        router.push("/onboarding/step-1");
         // optional: small delay to keep button disabled during route change
          // setTimeout(() => {
          //   router.push("/onboarding/step-1");
          // }, 300);
      } else {
        setError("OTP verification failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during OTP verification:", err);
      setError(
        err.errors?.[0]?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") verifyOtp();
  };

  const handleResendOtp = async () => {
    if (!isLoaded || !signUp) return;

    setIsResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setResendSuccess(true);
      setResendTimer(60);
    } catch (err) {
      console.error("Resend OTP error:", err);
      setError(err.errors?.[0]?.message || "Failed to resend OTP. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = () => {
    router.push("/");
  };

  return (
    <div className="h-screen flex flex-col justify-center lg:flex-row overflow-hidden">
      {/* Left Section */}
      <div className="lg:px-10 lg:py-9 xl:px-10 xl:py-9 2xl:px-10 lg:absolute lg:right-1/2 lg:w-1/2 h-screen">
        <Image
          src="/assets/images/signup_background.png"
          alt="Signup Background"
          width={557}
          height={764}
          className="w-full max-h-[50vh] aspect-auto lg:max-h-full rounded-sm object-fill"
          priority
        />
        <div className="absolute h-[300px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 2xl:max-lg:left-10 z-10 flex flex-col items-center justify-center">
          <Image
            src="/assets/images/signup_frame.svg"
            alt="Signup Frame"
            width={304}
            height={40}
            className="hidden lg:block mx-auto"
            priority
          />
          <Image
            src="/assets/logo/snatch_white.svg"
            alt="Logo"
            width={220}
            height={50}
            className="absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            priority
          />
        </div>
        <Image
          src="/assets/logo/snatch_white.svg"
          alt="Mobile Logo"
          width={189}
          height={20}
          className="w-[120px] block lg:hidden mx-auto absolute top-10 left-1/2 transform -translate-x-1/2 z-20"
          priority
        />
      </div>

      {/* Right Section */}
      <div className="lg:absolute flex flex-col h-screen w-full lg:w-1/2 justify-center items-center">
        <div className="lg:relative lg:left-1/2 lg:mt-32 flex flex-col justify-center items-center text-center w-full px-6 sm:px-10">
          
          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl font-qimano mb-2">
            OTP Verification
          </h1>

          {/* Subheading */}
          {email && (
            <p className="text-gray-400 text-sm mb-8 font-apfel-grotezk-regular">
              Enter the 6 digit code sent to{" "}
              <span className="font-medium font-graphite">{email}</span>
            </p>
          )}

          {/* OTP Input */}
          <Otp otp={otp} setOtp={setOtp} onKeyDown={handleKeyDown} />

          {/* Resend Section */}
          <div className="mt-4 font-apfel-grotezk-regular text-sm">
            {resendTimer > 0 ? (
              <p className="text-gray-500">
                Didn’t receive the code?{" "}
                <span className="font-medium text-gray-700">
                  Resend OTP
                </span>{" "}
                in {resendTimer}s
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

          {/* Verify Button */}
          <button
            onClick={verifyOtp}
            disabled={isLoading || hasSubmitted}
            className={`w-full sm:w-[356px] h-12 rounded-lg mt-6 flex items-center justify-center text-white text-base font-medium ${
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
            className="mt-4 text-electric-blue text-sm underline"
          >
            Change the email address
          </button>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <p className="text-md lg:relative lg:left-1/2 lg:-bottom-5 lg:mt-10 max-w-80 text-center font-apfel-grotezk-regular">
          Tip: Can't find the OTP email? Check the{" "}
          <span className="text-electric-blue">Promotions section</span>
        </p>
      </div>
    </div>
  );
}
