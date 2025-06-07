import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { priority, skill, budget, time } = req.body;
    const prompt = `Create a personalized 30-day automation roadmap for:
    - Challenge: ${priority}
    - Skill: ${skill}
    - Budget: ${budget}
    - Time/week: ${time}

    Respond with JSON only.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an automation roadmap expert. Output valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.7
      })
    });
    if (!openaiRes.ok) throw await openaiRes.json();
    const { choices } = await openaiRes.json();
    let roadmap;
    try { roadmap = JSON.parse(choices[0].message.content); }
    catch { roadmap = { error: 'Invalid JSON from AI', raw: choices[0].message.content }; }
    res.status(200).json({ roadmap });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error?.message || err.message });
  }
}
