const { readBody, json } = require('../lib/api');

module.exports = async (req, res) => {
  const body = await readBody(req);
  const params = new URLSearchParams(body);
  if (params.get('user') === 'admin' && params.get('pass') === 'secret') {
    json(res, 200, { ok: true, token: 'session-issued' });
    return;
  }
  json(res, 401, { ok: false, error: 'invalid credentials' });
};
