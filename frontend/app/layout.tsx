export const metadata = {
  title: "TrustScore",
  description: "LLM Response Reliability Evaluation",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-[#0f172a] text-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</div>
      </body>
    </html>
  );
}

