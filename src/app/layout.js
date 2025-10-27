// SRC/app/layout.js
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import Script from "next/script";
import AnalyticsProvider from "./analytics-provider";
import { Suspense } from "react";
// ✅ Font setup
const apfelGrotezkMittel = localFont({
  src: [{ path: "./fonts/ApfelGrotezk-Mittel.otf", weight: "400", style: "normal" }],
  variable: "--font-apfel-grotezk-mittel",
});

const apfelGrotezkRegular = localFont({
  src: [{ path: "./fonts/ApfelGrotezk-Regular.otf", weight: "400", style: "normal" }],
  variable: "--font-apfel-grotezk-regular",
});

const qimano = localFont({
  src: [{ path: "./fonts/Qimano-aYxdE.otf", weight: "400", style: "normal" }],
  variable: "--font-qimano",
});

// ✅ Metadata export will work now
export const metadata = {
  title: "Snatch",
  description: "Connecting Influencers",
  viewport: { width: "device-width", initialScale: 1 },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`
          ${apfelGrotezkMittel.variable}
          ${apfelGrotezkRegular.variable}
          ${qimano.variable}
          antialiased
        `}
      >
        <Providers>
           <Suspense fallback={null}>
              <AnalyticsProvider />
            </Suspense>
           <Toaster position="top-center" />
          {children}
        </Providers>

          {/* ✅ Google Analytics Scripts */}
         <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_path: window.location.pathname,
                send_page_view: false
              });
            `,
          }}
        />

      </body>
    </html>
    </ClerkProvider>
  );
}

  {/* ✅ Feedbask Widget Script */}
        //  <Script
        //   id="feedbask-widget-script"
        //   strategy="lazyOnload"
        //   src="https://cdn.feedbask.com/widget.js"
        //   data-client-key="d847c202-9bd5-4a9d-8e3a-8ec8f95ce897"
        // />
