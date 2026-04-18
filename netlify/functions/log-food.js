const { getStore } = require("@netlify/blobs");

const CORS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-api-key",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
};

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };

  const key = event.headers["x-api-key"] || event.queryStringParameters?.key;
  if (key !== process.env.FOOD_LOG_API_KEY) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const store = getStore("food-logs");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" });

  if (event.httpMethod === "GET") {
    const date = event.queryStringParameters?.date || today;
    let logs = [];
    try { logs = (await store.get(date, { type: "json" })) || []; } catch {}
    const totals = logs.reduce((a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein }), { calories: 0, protein: 0 });
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ date, logs, totals }) };
  }

  if (event.httpMethod === "POST") {
    const { name, calories, protein, date } = JSON.parse(event.body || "{}");
    if (!name) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "name is required" }) };

    const logDate = date || today;
    let logs = [];
    try { logs = (await store.get(logDate, { type: "json" })) || []; } catch {}

    const entry = {
      id: Date.now(),
      name,
      calories: Math.round(parseFloat(calories) || 0),
      protein: Math.round(parseFloat(protein) || 0),
      timestamp: new Date().toISOString(),
    };
    logs.push(entry);
    await store.setJSON(logDate, logs);

    const totals = logs.reduce((a, e) => ({ calories: a.calories + e.calories, protein: a.protein + e.protein }), { calories: 0, protein: 0 });
    return {
      statusCode: 200,
      headers: CORS,
      body: JSON.stringify({
        success: true,
        entry,
        totals,
        message: `Logged ${entry.name} (${entry.calories} cal, ${entry.protein}g protein). Today: ${totals.calories} cal / ${totals.protein}g protein`,
      }),
    };
  }

  if (event.httpMethod === "DELETE") {
    const date = event.queryStringParameters?.date || today;
    await store.delete(date);
    return { statusCode: 200, headers: CORS, body: JSON.stringify({ success: true }) };
  }

  return { statusCode: 405, body: "Method Not Allowed" };
};
