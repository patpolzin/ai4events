export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topic, audience, mode, speakers } = req.body;

  if (!topic || !audience || !mode || !speakers) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const prompt = `You are an expert event planner. Create a ${mode} event with the following details:\n\nTopic: ${topic}\nAudience: ${audience}\nNumber of Speakers: ${speakers}\n\nReturn a creative event name, a short description, speaker bios, and three session titles.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openchat/openchat-3.5",
        messages: [
          { role: "system", content: "You are a creative event planner AI." },
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      return res.status(500).json({ error: 'Invalid AI response format' });
    }

    return res.status(200).json({ output: data.choices[0].message.content });

  } catch (error) {
    return res.status(500).json({ error: 'AI request failed', details: error.message });
  }
}