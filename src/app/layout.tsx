import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";

export const metadata: Metadata = {
  title: "Vriksha - Cultural Gift Shop",
  description: "Unique Indian Decor & Customised Creative Services",

  icons: {
    icon: [
      { url: "/icons/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}