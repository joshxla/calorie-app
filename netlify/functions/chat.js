export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' }, body: '' }
  }
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' }
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: 'GROQ_API_KEY not configured.' }) }
  try {
    const { messages, system } = JSON.parse(event.body)
    const groqMessages = [{ role: 'system', content: system }, ...messages]
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: 'llama3-8b-8192', max_tokens: 1024, messages: groqMessages }),
    })
    const data = await response.json()
    return { statusCode: response.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify(data) }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
