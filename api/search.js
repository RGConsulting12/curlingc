module.exports = (req, res) => {
  const { q, page, limit, status } = req.query;
  res.setHeader('Content-Type', 'application/json');
  res.status(200).send(
    JSON.stringify({
      q: q ?? null,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status: status ?? null,
      results: ['stone', 'broom', 'sheet'].filter((item) => !q || item.includes(String(q))),
    }),
  );
};
