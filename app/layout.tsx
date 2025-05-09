import type { Metadata } from "next";
import { IBM_Plex_Sans_Devanagari } from "next/font/google";
import './globals.css'
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import Header from "@/components/Header";
// import Footer from "@/components/Footer";
import { FB_PIXEL_ID } from "@/lib/fpixel";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { getMetadata } from "./api/metadata";

const ibmPlexSansDevanagari = IBM_Plex_Sans_Devanagari({
  variable: "--font-ibm-plex-sans-devanagari",
  subsets: ["devanagari", "latin"],
  weight: "400",
});

export async function generateMetadata(): Promise<Metadata> {
  const metadata = await getMetadata();
  return {
    ...metadata,
    description: " ", // Keeping the existing empty description
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  
  return (
    <html lang="fr">
      <head>
        {/* Facebook Pixel Script */}
        <Script
          id="fb-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s) {
                if(f.fbq) return;
                n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq) f._fbq=n;
                n.push=n;
                n.loaded=!0;
                n.version='2.0';
                n.queue=[];
                t=b.createElement(e);
                t.async=!0;
                t.src=v;
                s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)
              }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

              fbq('init', '${FB_PIXEL_ID}');
              fbq('track', 'PageView');
            `,
          }}
        />
        
        {/* NoScript fallback for Facebook Pixel */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          />
        </noscript>
      </head>
      <body className={`${ibmPlexSansDevanagari.variable} antialiased bg-[#d1d9e6]`}>
          <ConvexClientProvider>
              <Header />
              <main className="min-h-screen">
                {children}
              </main>
              {/* <Footer /> */}
              <Toaster />
              <SonnerToaster richColors position="top-right" />
          </ConvexClientProvider>
      </body>
    </html>
  );
}
