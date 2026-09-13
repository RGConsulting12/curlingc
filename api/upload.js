const { json } = require('../lib/api');

module.exports = (req, res) => {
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    res.status(400).send('Expected multipart upload');
    return;
  }
  json(res, 200, { uploaded: true, note: 'multipart received' });
};
