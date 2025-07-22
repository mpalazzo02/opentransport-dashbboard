import { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const accountId = searchParams.get("account_id")
	const year = searchParams.get("year")
	const month = searchParams.get("month")
	const apiKey = process.env.API_GATEWAY_KEY

	const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/purchases?account_id=${accountId}&year=${year}&month=${month}`

  try {
	const apiRes = await fetch(url, {
	  headers: {
		"x-api-key": apiKey as string,
		"Content-Type": "application/json",
	  },
	})
	const data = await apiRes.json()
	let result = data;
	if (typeof data === 'object' && data !== null && 'body' in data && typeof data.body === 'string') {
	  try {
		result = JSON.parse(data.body);
	  } catch (e) {
		result = data.body;
	  }
	}
	if (!apiRes.ok) {
	  console.error("External API error:", apiRes.status, data)
	  return new Response(JSON.stringify({ error: "External API error", status: apiRes.status, details: data }), { status: apiRes.status })
	}
	return new Response(JSON.stringify(result), { status: apiRes.status, headers: { 'Content-Type': 'application/json' } })
  } catch (err) {
	console.error("Fetch failed:", err)
	return new Response(JSON.stringify({ error: "Failed to fetch purchases", details: String(err) }), { status: 500 })
  }
}