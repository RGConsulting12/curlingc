const { parseCookies, json } = require('../../lib/api');

module.exports = (req, res) => {
  const cookies = parseCookies(req);
  if (cookies.session !== 'abc123' || cookies.theme !== 'dark') {
    res.status(401).send('Missing preferences cookies');
    return;
  }
  json(res, 200, { theme: cookies.theme, notifications: true });
};
