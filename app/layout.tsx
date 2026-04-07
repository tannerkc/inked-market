import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navigation } from "@/components/layout/navigation";
import { Footer } from "@/components/layout/footer";
import { MainWrapper } from "@/components/layout/main-wrapper";

export const metadata: Metadata = {
  title: "Inked Market - Discover Tattoo Artists & Studios",
  description: "Connect with talented tattoo artists and professional studios. Browse portfolios, read reviews, and book your next tattoo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("inked-theme");if(t==="dark"||t==="light"){document.documentElement.dataset.theme=t}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider>
            <Navigation />
            <MainWrapper>{children}</MainWrapper>
            <Footer />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
