module.exports = (req, res) => {
  if (req.headers['x-api-key'] !== 'lab-key-99') {
    res.status(401).send('Invalid API key');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ uptime: 99.9, requests: 1204 }));
};
