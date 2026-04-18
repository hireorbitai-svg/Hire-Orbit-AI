/**
 * API Proxy: /api/ai-insight
 * Forwards POST to the Express backend /api/ai-insight (Google Gemma powered)
 */
export async function POST(req) {
  try {
    const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5001";
    const authHeader = req.headers.get("Authorization") || "";
    const body = await req.json();

    const backendRes = await fetch(`${BACKEND}/api/ai-insight`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return Response.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("ai-insight proxy error:", err.message);
    return Response.json({ error: "Failed to fetch AI insight" }, { status: 500 });
  }
}
