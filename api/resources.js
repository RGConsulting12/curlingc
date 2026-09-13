const { readBody, json } = require('../lib/api');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.status(204).end();
    return;
  }

  if (req.method === 'POST') {
    const body = JSON.parse((await readBody(req)) || '{}');
    if (body.name && body.weight) {
      json(res, 201, { id: 99, ...body });
      return;
    }
    res.status(400).send('Invalid resource');
    return;
  }

  json(res, 200, { resources: [{ id: 1, name: 'Red' }] });
};
