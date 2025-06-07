import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { industry, task, timeSpent, currentTools } = req.body;
    const prompt = `As an AI automation expert, analyze this task for automation potential:

    TASK DETAILS:
    - Industry: ${industry}
    - Task: ${task}
    - Weekly time: ${timeSpent} hours
    - Current tools: ${currentTools || 'Not specified'}

    Format your response as markdown.`;

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an expert AI automation consultant.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    });
    if (!openaiRes.ok) throw await openaiRes.json();
    const { choices } = await openaiRes.json();
    res.status(200).json({ analysis: choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.error?.message || err.message });
  }
}
