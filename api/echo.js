const { readBody, json } = require('../lib/api');

module.exports = async (req, res) => {
  const body = await readBody(req);
  const params = new URLSearchParams(body);
  const payload = Object.fromEntries(params.entries());
  json(res, 200, { echoed: payload });
};
