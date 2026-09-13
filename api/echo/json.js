const { readBody, json } = require('../../lib/api');

module.exports = async (req, res) => {
  try {
    const parsed = JSON.parse((await readBody(req)) || '{}');
    json(res, 200, { echoed: parsed });
  } catch {
    res.status(400).send('Invalid JSON');
  }
};
