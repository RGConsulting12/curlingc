module.exports = (req, res) => {
  const accept = req.headers.accept ?? '';
  if (!accept.includes('application/json')) {
    res.status(406).send('Send Accept: application/json');
    return;
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(
    JSON.stringify({
      displayName: 'Curl Learner',
      level: 1,
      streak: 0,
    }),
  );
};
