export const metadata = {
  title: "TrustScore",
  description: "LLM Response Reliability Evaluation",
};

import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-slate-900 text-slate-200">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </body>
    </html>
  );
}

