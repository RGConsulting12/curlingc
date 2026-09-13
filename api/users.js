module.exports = (_req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(
    JSON.stringify({
      users: [
        { id: 1, name: 'Ada' },
        { id: 2, name: 'Grace' },
      ],
    }),
  );
};
