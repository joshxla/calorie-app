const TARGET = 'http://62.238.2.195:3001/api/log-food'
const ALLOWED = ['GET', 'POST', 'DELETE']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: corsHeaders, body: '' }
  if (!ALLOWED.includes(event.httpMethod)) return { statusCode: 405, headers: corsHeaders, body: 'Method Not Allowed' }

  const apiKey = process.env.FOOD_API_KEY
  if (!apiKey) return { statusCode: 500, headers: corsHeaders, body: JSON.stringify({ error: 'FOOD_API_KEY not configured.' }) }

  const qs = new URLSearchParams(event.queryStringParameters || {}).toString()
  const url = qs ? `${TARGET}?${qs}` : TARGET

  const init = {
    method: event.httpMethod,
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
  }
  if (event.httpMethod === 'POST' && event.body) init.body = event.body

  try {
    const res = await fetch(url, init)
    const text = await res.text()
    return {
      statusCode: res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: text,
    }
  } catch (err) {
    return { statusCode: 502, headers: corsHeaders, body: JSON.stringify({ error: 'Proxy request failed', detail: err.message }) }
  }
}
