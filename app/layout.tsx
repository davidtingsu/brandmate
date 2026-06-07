import type { Metadata } from "next";
import "@copilotkit/react-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BrandMate — LinkedIn Brand Coach",
  description:
    "Your LinkedIn brand coach that learns from every draft. Chat-only CopilotKit UI with Redis memory and W&B Weave tracing.",
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
