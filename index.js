require('dotenv').config();
const express = require('express');
const cors = require('cors');

// importing the db model
const { shortenedUrl, mongoose } = require('./models/shortenedUrls.js')


const app = express();
const bodyParser = express.urlencoded({ extended: false });
const dns = require("node:dns");

// Basic Configuration
const port = process.env.PORT || 3000;
const dbCreds = process.env.DB_CREDENTIALS;

// using necessary middlewares and elements
app.use(cors());
app.use(bodyParser);
app.use('/public', express.static(`${process.cwd()}/public`));


// setting routes
app.get('/', function(_, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(_, res) {
  const testUrl = new shortenedUrl({
    "name": "google",
    "shortUrl": 1
  })
  res.json(testUrl);
});


// API endpoint for generating short url
app.get('/api/shorturl/:shorturl', urlHandler).post('/api/shorturl/', urlHandler2);

function urlHandler(req, res) {
  let shorturl = req.params.shorturl;

  // find corresponding Url
  (async () => {
    let result = await shortenedUrl.findOne(
      { shortUrl: shorturl }, 'name').exec();

    if (!result) {
      res.json({ error: "No such url" })
    } else {
      res.redirect(result.name);
    }
  })();
}

function urlHandler2(req, res) {
  let inputUrl = req.body.url;
  // console.log(inputUrl);
  let hostname = inputUrl.split('/')[2];
  // console.log('\n' + hostname + '\n')

  try {
    dns.lookup(hostname, (err, addr, _) => {
      if (addr == null) {
        return res.json({
          error: "Invalid Url"
        })
      } else {
        (async () => {
          res.json(await shortenUrl(inputUrl));
        })();
      }
    });
  } catch (e) {
    console.log('[Error 2.1]' + e)
  };
}


async function shortenUrl(inputUrl) {
  let result = await shortenedUrl.findOne(
    { name: inputUrl }, 'shortUrl').exec();

  if (!result) {
    // count documents in collection
    let urlCount = await shortenedUrl.countDocuments();

    // save new url to db
    const url = new shortenedUrl({
      name: inputUrl,
      shortUrl: urlCount + 1
    });
    await url.save();

    // return new shortUrl
    result = { 'shortUrl': urlCount + 1 };
  };

  let response = {
    "original_url": inputUrl,
    "short_url": result.shortUrl
  };
  return response;
};


const start = async () => {
  try {
    await mongoose.connect(dbCreds);

    app.listen(port, function() {
      console.log(`Listening on port ${port}`);
    });
  } catch (e) {
    console.log(e.message);
  }
}

start();