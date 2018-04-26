const axios = require('axios');
const cheerio = require('cheerio');
const http = require('http');
const xml2js = require('xml2js');

const keepAliveAgent = new http.Agent({ keepAlive: true });
const xml = new xml2js.Builder();

const httpClient = axios.create({
  baseURL: 'http://www.etf.com',
  timeout: 10000,
});

function parse(html) {
  const $ = cheerio.load(html);
  const overviewContext = '#form-reports-overview > div.right > div:nth-child(1) > div';
  const efficiencyContext = '#form-reports-efficiency > div.right > div:nth-child(1) > div';
  return {
    expanseRatio: $('label:contains("Expense Ratio")', overviewContext).siblings('span').first().text(),
    avgDailyVolume: $('label:contains("Average Daily $ Volume")', overviewContext).siblings('span').first().text(),
    avgSpread: $('label:contains("Average Spread")', overviewContext).siblings('span').first().text(),
    trackingDiff: $('label:contains("Median Tracking Difference")', efficiencyContext).siblings('span').first().text(),
  };
}

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.get = (req, res) => {
  const options = {
    httpAgent: keepAliveAgent,
    responseType: 'text',
  };

  const { ticket, out = 'json' } = req.query;
  console.log(`[ETF] ticket: ${ticket} out: ${out}`);

  httpClient.get(`/${ticket}`, options)
    .then((result) => {
      const data = parse(result.data);
      if (out === 'xml') {
        res.set('Content-Type', 'text/xml');
        res.send(xml.buildObject(data));
      } else {
        res.json(data);
      }
    })
    .catch((err) => {
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('[ETF] unexpected status: ', err.response.status);
        res.sendStatus(500);
      } else if (err.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('[ETF] no response for request: ', err.request);
        res.sendStatus(500);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[ETF] error: ', err.message);
        res.sendStatus(500);
      }
    });
};
