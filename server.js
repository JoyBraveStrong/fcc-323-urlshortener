// third party
var validUrl = require('valid-url');
var Url = require('./models/url');

// config
var mongoUri = "mongodb://fcc-url-shortener:fcc-url-shortener@ds147079.mlab.com:47079/fcc-url-shortener";
var port = process.env.PORT || 3000;
var baseUrl = "https://fcc-323-urlshortener.herokuapp.com/";

var mongoose = require('mongoose');

/* MONGOOSE AND MONGOLAB
 * ----------------------------------------------------------------------------
 * Mongoose by default sets the auto_reconnect option to true.
 * We recommend setting socket options at both the server and replica set level.
 * We recommend a 30 second connection timeout because it allows for
 * plenty of time in most operating environments.
 =============================================================================*/

var mongoOptions = {
  server: {
    socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 }
  },
  replset: {
    socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 }
  }
};

mongoose.connect(mongoUri, mongoOptions);
mongoose.connection.on('error', function(err) {
        console.error('MongoDB connection error: ' + err);
        process.exit(-1);
    }
);

var express = require('express');
var app = express();
var path = require("path");

app.set('port', port);

app.get("/", function(req, res) {
	res.sendFile(path.join(__dirname + "/index.html"));
});

app.get('/new/*', function(req, res) {
    var original = req.url.replace('/new/', '');
    if (!validUrl.isWebUri(original)) {
        return res.json({error: "URL invalid"});
    }
    Url.create({original_url: original}, function(err, created) {
        if (err) return res.status(500).send(err);
        res.json({
            original_url: created.original_url,
            short_url: baseUrl + created.short_id
        });
    });
});

app.get('/:shortUrl', function(req, res) {
    Url.findOne({short_id: req.params.shortUrl}).exec().then(function(found) {
        if (found) {
            res.redirect(found.original_url);
            Url.remove({}, function(err) {
                if (err) console.log(err);
            });
        } else {
            res.send({error: "No short url found for given input"});
        }
    }).catch(function(err) {
        res.redirect("/");
    });
});

app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
