import "./globals.css";
import Script from "next/script";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import HideOnLp from "@/components/HideOnLp";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import LoadingScreen from "@/components/LoadingScreen";
import Chatbot from "@/components/Chatbot";
import HashtagGeneratorPopup from "@/components/HashtagGeneratorPopup";
import PageTracker from "@/components/PageTracker";

export const metadata = {
  title: "Vows & Vedas — Luxury Destination Weddings",
  description: "Crafting timeless ceremonies across the world's most extraordinary destinations.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "256x256", type: "image/x-icon" },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="77rRdqy1zmfvQTlzvhDAFGL6hEn33IwIpjptMlBCdPE" />
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','GTM-PX8XXL2T');`}</Script>
        {/* End Google Tag Manager */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PX8XXL2T" height="0" width="0" style={{display:'none',visibility:'hidden'}}></iframe></noscript>
        {/* End Google Tag Manager (noscript) */}
        <div id="progress-bar"></div>
        <PageTracker />
        <LoadingScreen />
        <CustomCursor />
        <Chatbot />
        <HashtagGeneratorPopup />
        <SmoothScroll>
          <Navigation />
          <main>{children}</main>
          {/* Gated client-side so Footer itself stays a Server Component;
              landing pages (/lp/*) render their own minimal footer */}
          <HideOnLp>
            <Footer />
          </HideOnLp>
        </SmoothScroll>
      </body>
    </html>
  );
}
