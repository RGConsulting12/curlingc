module.exports = (req, res) => {
  if (req.headers.referer !== 'https://curling.lab/docs') {
    res.status(403).send('Missing referer');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ from: 'docs' }));
};
