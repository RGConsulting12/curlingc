module.exports = (req, res) => {
  if (req.headers['x-lab-client'] !== 'curling') {
    res.status(403).send('Unknown client');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ client: 'curling', status: 'registered' }));
};
