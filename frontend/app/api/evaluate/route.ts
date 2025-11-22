export async function POST(request: Request) {
  try {
    const body = await request.json();
    const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
    
    const response = await fetch(`${base}/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Backend error:", response.status, errorText);
      return Response.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error("Evaluate API error:", error);
    return Response.json(
      { error: "Failed to evaluate response. Please check backend connection." },
      { status: 500 }
    );
  }
}

