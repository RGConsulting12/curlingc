module.exports = (req, res) => {
  if (req.headers['user-agent'] !== 'CurlingLab/1.0') {
    res.status(403).send('Untrusted agent');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ trusted: true }));
};
