module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!req.body) {
    return res.status(400).json({ error: 'Request body is empty or not parsed.' });
  }

  const { model, imageBase64, mimeType } = req.body;
  const apiKey = process.env.HF_TOKEN;

  if (!apiKey) {
    return res.status(500).json({ error: 'HF_TOKEN environment variable not set.' });
  }

  if (!model || !imageBase64 || !mimeType) {
    return res.status(400).json({ error: 'Missing model, imageBase64, or mimeType.' });
  }

  try {
    const buffer = Buffer.from(imageBase64, 'base64');

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': mimeType
        },
        body: buffer
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

module.exports.config = { api: { bodyParser: { sizeLimit: '10mb' } } };
