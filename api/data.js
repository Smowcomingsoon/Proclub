const fs = require('node:fs');
const path = require('node:path');

module.exports = (req, res) => {
  const file = path.join(process.cwd(), 'data', 'data.json');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=3600');
  res.status(200).send(fs.readFileSync(file, 'utf8'));
};
