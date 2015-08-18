var express = require('express'),
    stylus = require('stylus'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

var port = process.env.PORT || 3030;
var environment = process.env.NODE_ENV || 'development';

var app = express();

app.set('view engine', 'jade');
app.set('views', __dirname + '/server/views');
app.use(bodyParser());
app.use(stylus.middleware(
    {
        src: __dirname + 'public',
        compile: function(str, path) {
            return stylus(str).set('filename', path);
        }
    }
));

app.use(express.static(__dirname + '/public'));

if (environment == 'development') {
    mongoose.connect('mongodb://localhost/testDb');
} else {
    mongoose.connect('mongodb://admin:kostaa@ds055822.mongolab.com:55822/testdb');
}

var database = mongoose.connection;

database.once('open', function(err) {
    if (err) {
        console.log('Database could not be opened:\n' + err);
        return;
    }
    console.log('Database up and running...');
});

database.on('error', function(err) {
    console.log('Database error:\n' + err);
});

var messageSchema = mongoose.Schema({
    message: String
});

var Message = mongoose.model('Message', messageSchema);
var messageFromDB;


Message.remove({})
    .exec(function(err) {
        if (err) {
            console.log('Messages could not be cleared:\n' + err);
            return;
        }
        console.log('Messages deleted...');

        Message.create({message: 'Hi from Mongoose'})
            .then(function(model) {
                messageFromDB = model.message;
            });
    });



app.get('/partials/:partialName', function(req, res) {
    res.render('partials/' + req.params.partialName)
});
app.get('*', function (req, res) {
    res.render('index', {message: messageFromDB});
});

app.listen(port);
console.log('Server running on port: ' + port);
console.log('Environment type: %s', environment);