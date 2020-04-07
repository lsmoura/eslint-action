const https = require('https');

function request(url, options) {
  console.log('request', url, JSON.stringify(options));
  return new Promise((accept, reject) => {
    const req = https
      .request(url, options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          if (res.statusCode >= 400) {
            const err = new Error(`Received status code ${res.statusCode}`)
            err.response = res;
            err.data = data;
            reject(err);
          } else {
            accept({ res, data: JSON.parse(data) });
          }
        });
      })
      .on('error', reject);
    
    if (options.body) {
      req.end(JSON.stringify(options.body));
    } else {
      req.end();
    }
  });
}

module.exports = request;
