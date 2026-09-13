module.exports = (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(JSON.stringify({ message: 'Hello from Curling!' }));
};
