module.exports = (req, res) => {
  const step = req.query.step || '1';
  if (step === '1') {
    res.setHeader('Location', '/api/hop?step=2');
    res.status(302).end();
    return;
  }
  if (step === '2') {
    res.setHeader('Location', '/api/hello');
    res.status(302).end();
    return;
  }
  res.status(404).end();
};
