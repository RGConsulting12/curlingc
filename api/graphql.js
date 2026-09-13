const { readBody, json } = require('../lib/api');

module.exports = async (req, res) => {
  const body = await readBody(req);
  let payload = {};
  try {
    payload = JSON.parse(body || '{}');
  } catch {
    res.status(400).send('Invalid JSON');
    return;
  }

  const query = String(payload.query || '');
  if (query.includes('stones')) {
    json(res, 200, { data: { stones: ['Blue', 'Red'] } });
    return;
  }
  if (query.includes('mutation') && query.includes('Nova')) {
    json(res, 200, { data: { setSkip: { name: 'Nova' } } });
    return;
  }
  res.status(400).send('Unknown GraphQL operation');
};
