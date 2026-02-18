import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "TrueHire — Find Freelancers & Jobs",
    template: "%s | TrueHire",
  },
  description:
    "Connect clients with skilled freelancers. Post jobs, browse freelancer profiles, send proposals, and manage contracts in one place.",
  keywords: ["freelance", "freelancers", "jobs", "hire", "contract", "remote work"],
  openGraph: {
    title: "TrueHire — Find Freelancers & Jobs",
    description:
      "Connect clients with skilled freelancers. Post jobs, browse profiles, and manage contracts.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Header />
          <div className="main-container">{children}</div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
