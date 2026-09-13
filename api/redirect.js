module.exports = (_req, res) => {
  res.setHeader('Location', '/api/hello');
  res.status(302).end();
};
