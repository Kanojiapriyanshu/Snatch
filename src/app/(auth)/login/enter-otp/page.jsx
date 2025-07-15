"use client";
import { useSignIn, useSession } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Otp from "@/components/Otp";

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

  const verifyOtp = async () => {
    if (!isLoaded || !email) return;

    setIsLoading(true);
    setError("");

    try {
      await signIn.attemptFirstFactor({
        strategy: "email_code",
        code: otp.join(""),
      });

      await signIn.reload();
      window.location.reload();
    } catch (err) {
      setError(err.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) router.push("/dashboard");
  }, [session, router]);

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

  return (
    <div className="h-screen flex flex-col justify-center lg:flex-row overflow-hidden">
      {/* Left Section */}
      <div className="lg:px-10 lg:py-9 xl:px-10 xl:py-9 2xl:px-10 relative lg:w-1/2 h-screen">
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
      <div className="flex h-full w-full lg:w-1/2 justify-center items-center">
        <div className="flex flex-col justify-center items-center text-center w-full px-6 sm:px-10">
          <h1 className="text-graphite text-2xl sm:text-5xl mb-8 font-qimano">
            Enter OTP
          </h1>
          <Otp otp={otp} setOtp={setOtp} onKeyDown={handleKeyDown} />

          {/* Resend */}
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
              <p className="text-green-500 text-sm mt-1">
                OTP resent successfully!
              </p>
            )}
          </div>

          <button
            onClick={verifyOtp}
            disabled={isLoading}
            className="w-full sm:w-[356px] h-12 bg-[#0037EB] text-white rounded-lg mt-4 disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify OTP"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}
