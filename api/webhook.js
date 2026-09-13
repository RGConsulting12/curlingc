const { readBody, json } = require('../lib/api');

module.exports = async (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'Bearer lab-token-42') {
    res.status(401).send('Unauthorized webhook');
    return;
  }

  const body = JSON.parse((await readBody(req)) || '{}');
  if (body.event === 'score') {
    json(res, 200, { delivered: true, event: body.event });
    return;
  }
  res.status(400).send('Unknown event');
};
