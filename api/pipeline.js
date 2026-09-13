module.exports = (_req, res) => {
  res.setHeader('Location', '/api/webhook');
  res.status(307).end();
};
