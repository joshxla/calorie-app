import { useState, useRef, useEffect } from 'react'
import useStore from '../store/useStore'
import { today, parseLogBlock, stripLogBlock } from '../lib/utils'

const SYSTEM = `You are a calorie and nutrition assistant for Josh Huang, who is on a body recomposition journey.

JOSH'S PROFILE:
- Daily goals: 1,500 cal / 150g protein
- Current weight: ~150.4 lbs, ~14.9% body fat
- Starting weight: 154.4 lbs, 15.9% BF (Mar 6, 2026)
- Progress: −4.0 lbs in ~5 weeks

JOSH'S RECURRING FOODS (for context):
- Chicken cheese burrito: 540 cal, 38g protein
- Cheesy chicken broccoli rice (full): 635 cal, 69g protein
- Grande cappuccino (whole milk): 120 cal, 5g protein
- Chobani yogurt (2/3 cup): 120 cal, 15g protein
- Banana: 105 cal, 1g protein
- Ruffles chips (10 pc): 85 cal, 1g protein
- String cheese: 80 cal, 8g protein

YOUR ROLE:
1. Answer questions about calorie/protein content of any food, concisely.
2. When Josh says he ate something, extract the name, calories, and protein and include at the end of your response a <log> JSON block so the app can offer to log it:
   <log>{"name": "food name", "calories": 000, "protein": 00}</log>
3. Give brief, practical nutrition advice when asked.
4. Keep responses short — 1-3 sentences unless asked for detail.

NEVER include the <log> block for general questions. ONLY include it when Josh is reporting he ate something.`

const SUGGESTIONS = [
  'How many calories in a chicken burrito bowl?',
  'What should I eat to hit 150g protein today?',
  'I had 2 scrambled eggs and toast',
  'How am I tracking this week?',
]

export default function AIChat() {
  const { addFoodEntry, getTodayLog } = useStore()
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hey Josh 👋 Ask me about calories in any food, or tell me what you ate and I'll help you log it.",
      logData: null,
    },
  ])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const msg = text.trim()
    if (!msg || loading) return
    setInput('')

    const userMsg = { role: 'user', text: msg }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    const chatHistory = messages.slice(1)
    const apiMessages = [...chatHistory, userMsg]
      .map(m => ({ role: m.role, content: m.text }))

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, system: SYSTEM }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      const data    = await res.json()
      const rawText = data?.choices?.[0]?.message?.content || 'Sorry, I couldn\'t get a response.'
      const logData = parseLogBlock(rawText)
      const cleanText = stripLogBlock(rawText)

      setMessages(prev => [...prev, { role: 'assistant', text: cleanText, logData }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: err.message.includes('ANTHROPIC_API_KEY')
          ? '⚠️ Add your Anthropic API key to Netlify environment variables (ANTHROPIC_API_KEY) to enable AI features.'
          : `⚠️ Couldn't reach the AI: ${err.message}`,
        logData: null,
      }])
    } finally {
      setLoading(false)
    }
  }

  const logEntry = async (logData, msgIndex) => {
    // Mark as logging (pending state)
    setMessages(prev => prev.map((m, i) =>
      i === msgIndex ? { ...m, logging: true } : m
    ))
    try {
      await addFoodEntry(today(), logData)
      setMessages(prev => prev.map((m, i) =>
        i === msgIndex ? { ...m, logged: true, logging: false } : m
      ))
    } catch (err) {
      setMessages(prev => prev.map((m, i) =>
        i === msgIndex ? { ...m, logError: true, logging: false } : m
      ))
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <div className="page-title">AI Assistant</div>
        <div className="page-subtitle">Ask about calories or log food</div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Suggestions (shown when only opening message) */}
        {messages.length === 1 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '4px 0 8px' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)}
                style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  borderRadius: 20, padding: '7px 13px', fontSize: 13,
                  color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font)',
                }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 6 }}>
            <div className={`chat-bubble ${msg.role}`}>
              {msg.text.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.text.split('\n').length - 1 ? <br /> : null}</span>
              ))}
            </div>

            {/* Log suggestion card */}
            {msg.logData && !msg.logged && (
              <div style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: 12, padding: '10px 14px', maxWidth: '85%',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{msg.logData.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                    {msg.logData.calories} cal · {msg.logData.protein}g protein
                  </div>
                  {msg.logError && (
                    <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 4 }}>
                      ⚠️ Failed to save — tap to retry
                    </div>
                  )}
                </div>
                <button className="btn btn-primary" style={{ padding: '7px 14px', fontSize: 13 }}
                  onClick={() => logEntry(msg.logData, i)}
                  disabled={msg.logging}>
                  {msg.logging ? '…' : msg.logError ? 'Retry' : 'Log it'}
                </button>
              </div>
            )}

            {msg.logged && (
              <div style={{ fontSize: 12, color: 'var(--success)' }}>✓ Logged to today</div>
            )}
          </div>
        ))}

        {loading && (
          <div className="chat-bubble assistant" style={{ color: 'var(--text-secondary)' }}>
            <span style={{ animation: 'pulse 1.2s ease-in-out infinite' }}>Thinking…</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg)',
        display: 'flex',
        gap: 8,
        flexShrink: 0,
      }}>
        <input
          className="input"
          style={{ flex: 1, borderRadius: 22, padding: '10px 16px', fontSize: 15 }}
          placeholder="Ask about food or log what you ate…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send(input)}
          disabled={loading}
        />
        <button
          className="btn btn-primary"
          style={{ borderRadius: 22, padding: '10px 18px', minWidth: 56, fontSize: 17 }}
          onClick={() => send(input)}
          disabled={loading || !input.trim()}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
