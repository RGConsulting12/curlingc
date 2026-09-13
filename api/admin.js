module.exports = (req, res) => {
  const auth = req.headers.authorization || '';
  if (auth !== 'Bearer lab-token-42') {
    res.status(401).send('Missing bearer token');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ role: 'admin', access: 'granted' }));
};
