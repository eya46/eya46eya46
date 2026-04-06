import type { APIRoute } from "astro";
import { fetchUptimeData } from "../../utils/uptime";

export const GET: APIRoute = async () => {
  try {
    const data = await fetchUptimeData();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
