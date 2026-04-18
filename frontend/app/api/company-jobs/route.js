export async function GET(req) {
  try {
    const BACKEND = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5001";
    const { searchParams } = new URL(req.url);
    const company = searchParams.get("company") || "";
    const location = searchParams.get("location") || "India";

    const backendRes = await fetch(
      `${BACKEND}/api/company-jobs?company=${encodeURIComponent(company)}&location=${encodeURIComponent(location)}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    );

    const data = await backendRes.json();
    return Response.json(data, { status: backendRes.status });
  } catch (err) {
    console.error("company-jobs proxy error:", err.message);
    return Response.json({ jobs: [], error: err.message }, { status: 500 });
  }
}
