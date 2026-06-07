import type { Metadata } from "next";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandMate — LinkedIn Brand Coach",
  description:
    "Your LinkedIn brand coach that learns from every draft. Structured forms, Redis memory, and W&B Weave tracing.",
  icons: {
    icon: "/brandmate-logo.png",
    apple: "/brandmate-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
