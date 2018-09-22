var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let ChosenMeal = require('../models/chosenMeal')

/* GET the list of chosen meals for the specified date. */
router.get('/:id', function(req, res, next) {
  ChosenMeal.find({date: req.params["id"]}, function(err, chosenMeals) {
    if (err) return next(err);
    var html = "";
    chosenMeals.forEach(function(chosenMeal) {
      html += jsonToHtml(chosenMeal, 0);
      //console.log(jsonToHtml(chosenMeal, 0))
    })
    //console.log(html);
    res.render('chosenMeals', {
      title: 'Patient Meal Order List for ' + req.params["id"],
      content: html
    });
  });
});

//receive chosen meals
router.post('/', function (req, res) {
  var chosenMeal = new ChosenMeal(req.body);
  //console.log(chosenMeal);
  chosenMeal.save(function(err, chosenMeal) {
    res.status(200).send(chosenMeal);
  })
});
module.exports = router;

function jsonToHtml(current, depth) {
    var children = current.children;
    var str = "";
    
    if(depth == 0) {
      str += '<a tabindex="0" class="btn btn-lg btn-danger" role="button" data-toggle="popover" data-trigger="focus" title="Meal" data-content="';
    }else if(depth == 1) {
      str += '<ul>' + current.text;
    }else if(depth == 2)  {
    }else if(depth ==3 ) {
      str += "<li>"
      str += current.text;
    }
    //console.log(current.text;
    for (var i = 0, len = children.length; i < len; i++) {
        str += jsonToHtml(children[i], depth + 1);
    }
    if(depth == 0) {
      str += '">' + current.name + '</a><br/>';
    }else if(depth == 1) {
      str += "</ul>";
    }else if(depth == 2)  {
    }else if(depth ==3 ) {
      str += "</li>";
    }
    return str;
}