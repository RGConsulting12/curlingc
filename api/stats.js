module.exports = (req, res) => {
  const encoding = req.headers['accept-encoding'] || '';
  res.setHeader('Content-Type', 'application/json');
  if (encoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  res.status(200).send(JSON.stringify({ stones: 8, ends: 10 }));
};
