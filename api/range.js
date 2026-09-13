module.exports = (req, res) => {
  const range = req.headers.range || '';
  const payload = 'curling-lab-range-bytes';
  if (range === 'bytes=0-3') {
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Range', `bytes 0-3/${payload.length}`);
    res.status(206).send(payload.slice(0, 4));
    return;
  }
  res.status(416).send('Range not satisfiable');
};
