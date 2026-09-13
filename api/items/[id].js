const { readBody, json } = require('../../lib/api');

module.exports = async (req, res) => {
  const id = req.query.id;

  if (req.method === 'PUT') {
    const body = JSON.parse((await readBody(req)) || '{}');
    if (body.name) {
      json(res, 200, { id, name: body.name, updated: true });
      return;
    }
    res.status(400).send('Missing name');
    return;
  }

  if (req.method === 'PATCH') {
    const body = JSON.parse((await readBody(req)) || '{}');
    if (body.weight !== undefined) {
      json(res, 200, { id, weight: body.weight, patched: true });
      return;
    }
    res.status(400).send('Missing weight');
    return;
  }

  if (req.method === 'DELETE') {
    res.status(204).end();
    return;
  }

  json(res, 200, { id, name: 'Granite' });
};
