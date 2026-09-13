const { readBody, parseBasicAuth, json } = require('../lib/api');

module.exports = async (req, res) => {
  const auth = parseBasicAuth(req);
  if (!auth || auth.user !== 'curl-lab' || auth.pass !== 'rocks') {
    res.status(401).send('Unauthorized');
    return;
  }

  if (req.method === 'POST') {
    const body = await readBody(req);
    const params = new URLSearchParams(body);
    json(res, 200, { stored: params.get('note') ?? null });
    return;
  }

  json(res, 200, { vault: 'classified-data', level: 'read' });
};
