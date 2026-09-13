module.exports = (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Lab-Health', 'ok');
  res.status(200).end();
};
