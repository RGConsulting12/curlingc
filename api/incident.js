const { parseBasicAuth, parseCookies, json } = require('../lib/api');

module.exports = (req, res) => {
  const auth = parseBasicAuth(req);
  const cookies = parseCookies(req);
  const incident = req.query.incident;

  if (!auth || auth.user !== 'curl-lab' || auth.pass !== 'rocks') {
    res.status(401).send('Unauthorized');
    return;
  }
  if (cookies.session !== 'abc123') {
    res.status(401).send('Invalid session');
    return;
  }
  if (incident !== '42') {
    res.status(400).send('Missing incident id');
    return;
  }

  json(res, 200, { incident: 42, status: 'mitigated' });
};
