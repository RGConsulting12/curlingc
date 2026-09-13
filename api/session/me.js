const { parseCookies, json } = require('../../lib/api');

module.exports = (req, res) => {
  const cookies = parseCookies(req);
  if (cookies.session !== 'abc123') {
    res.status(401).send('Invalid session');
    return;
  }
  json(res, 200, { user: 'learner', session: cookies.session });
};
