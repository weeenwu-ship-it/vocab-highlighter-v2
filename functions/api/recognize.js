// Provider routing: Baidu (ernie) vs DashScope (qwen)
const PROVIDERS = {
  baidu: {
    url: 'https://qianfan.baidubce.com/v2/chat/completions',
    keyEnv: 'BAIDU_API_KEY',
    defaultModel: 'ernie-4.5-turbo-vl',
  },
  dashscope: {
    url: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    keyEnv: 'DASHSCOPE_API_KEY',
    defaultModel: 'qwen-vl-max',
  },
};

function getProvider(model) {
  if (model && model.startsWith('qwen')) return 'dashscope';
  return 'baidu';
}

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    const providerName = getProvider(body.model);
    const provider = PROVIDERS[providerName];

    const apiKey = context.env[provider.keyEnv];
    if (!apiKey) {
      return new Response(JSON.stringify({ error: `${provider.keyEnv} not configured` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: body.model || provider.defaultModel,
        messages: body.messages,
        max_tokens: body.max_tokens || 3000,
        temperature: body.temperature ?? 0.3,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return new Response(JSON.stringify({ error: err }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
