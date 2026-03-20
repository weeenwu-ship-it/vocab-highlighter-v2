export const config = {
  maxDuration: 60,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const BAIDU_API_KEY = process.env.BAIDU_API_KEY;
  if (!BAIDU_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const body = req.body;

    const response = await fetch(
      'https://qianfan.baidubce.com/v2/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BAIDU_API_KEY}`,
        },
        body: JSON.stringify({
          model: body.model || 'ernie-4.5-turbo-vl',
          messages: body.messages,
          max_tokens: body.max_tokens || 3000,
          temperature: body.temperature ?? 0.3,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
