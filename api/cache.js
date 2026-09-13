module.exports = (req, res) => {
  const etag = req.headers['if-none-match'];
  res.setHeader('ETag', '"v1"');
  if (etag === '"v1"') {
    res.status(304).end();
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ version: 1, payload: 'fresh' }));
};
