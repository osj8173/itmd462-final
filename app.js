var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
let Menu = require('./models/menu');
let ChosenMeal = require('./models/chosenMeal')
mongoose.connect('mongodb://localhost/test');

var manager = require('./routes/manager');
var chosenMeals = require('./routes/chosenMeals');

var app = express();
app.disable('etag');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var mustacheExpress = require('mustache-express');
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
//serving static files 
app.use(express.static('public'));

app.use('/manager', manager);
app.use('/chosenMeals', chosenMeals);

//Patient Meal Ordering Screen
//Converts tomorrow's menu to html and render it
app.get('/', function (req, res, next) {
  var date = new Date();
  //add leading zero
  function addZ(n){return n<10? '0'+n:''+n;}
  var tomorrow = addZ(date.getMonth()+1) + '-' + addZ(date.getDate()+1) + '-' + date.getFullYear();
  
  Menu.findOne({date: tomorrow}, function(err, menu) {
    if (err) return next(err);
    var html = "";
    if (menu)  {//if exists
      menu.jstree.forEach(function(item) {
        html += jsonToHtml(item, 0);
      })
    }else {//if doesn't exist
      html = '<div id="carousel"><div class="slide">Error: Menu is not ready yet.</div></div>';
    }
    res.render('client', {
      content: html
    });
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

function jsonToHtml(current, depth) {
    var children = current.children;
    var str = "";
    
    if(depth == 0) {
      str += '<div id="carousel">';
    }else if(depth == 1) {
      str += '<div class="slide">';
      str += '<h3>Please complete your meal selection.</h3>'
      str += '<h1>' + current.text + '</h1>';
    }else if(depth == 2)  {
      str += '<button class="collapsible">' + current.text + '</button>';
      str += '<ul class="selectable">';
    }else if(depth ==3 ) {
      str += "<li>"
      str += current.text;
    }
    //console.log(current.text;
    for (var i = 0, len = children.length; i < len; i++) {
        str += jsonToHtml(children[i], depth + 1);
    }
    if(depth == 0) {
      str += "</div>";
    }else if(depth == 1) {
      str += "</div>";
    }else if(depth == 2)  {
      str += "</ul>";
    }else if(depth ==3 ) {
      str += "</li>";
    }
    return str;
}