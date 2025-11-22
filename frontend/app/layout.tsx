export const metadata = {
  title: "TrustScore",
  description: "LLM Response Reliability Evaluation",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body style={{ margin: 0, fontFamily: 'system-ui, Arial, sans-serif', background: '#0f172a', color: '#e2e8f0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: 24 }}>{children}</div>
      </body>
    </html>
  );
}

