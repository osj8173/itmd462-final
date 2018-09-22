var express = require('express');
var router = express.Router();
let mongoose = require('mongoose');
let Menu = require('../models/menu');
let ChosenMeal = require('../models/chosenMeal')

/* GET the UI for manager. */
router.get('/', function(req, res, next) {
  res.render('manager', {
    title: 'Menu Manager'
  });
});

router.get('/menu/new', function(req, res, next) {
  var newMenu = new Menu({date:"new", jstree:[{"id":"j1_1","text":"Menu","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_1_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"data":{},"children":[{"id":"j1_2","text":"Breakfast","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_2_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]},{"id":"j1_3","text":"Lunch","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_3_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]},{"id":"j1_4","text":"Dinner","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_4_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"data":{},"children":[]}]}]});
  res.send(newMenu);
});

router.get('/menu/:id', function(req, res, next) {
  Menu.findOne({date: req.params["id"]}, function(err, menu) {
    if (err) return next(err);
    if (menu)  {//if exists
      
      //set sum to 0
      menu.jstree.forEach(function(item){
        initializeSumToZero(item, 0);
      })
      //calculate sum
      ChosenMeal.find({date: menu.date}, function (err, chosenMeals)  {
        if(err) return console.error(err);
        chosenMeals.forEach(function(chosenMeal) {
          increaseSum(chosenMeal, menu.jstree[0], 0);
        })
        res.send(menu)
      })


    }else {//if doesn't exist
      res.redirect('/manager/menu/new');
    }
  });
});

router.post('/menu/:id', function (req, res) {
  //Insert if it doesn't exists, update otherwise-upsert:true option
  //Get the new document as a return value-new: true option
  Menu.findOneAndUpdate({date: req.params["id"]}, req.body, { upsert: true , new: true}, function(err, menu) {
    if(err) return res.status(500).send({error: err});

    //  console.log(JSON.parse(menu.jstree));
    res.send(menu);
  });
});

router.delete('/menu/:id', function(req, res, next) {
  Menu.deleteOne({date: req.params["id"]}, function(err, menu) {
    if (err) return next(err);
    res.status(204).send();
  });
});

module.exports = router;
function increaseSum(chosenMeal, jstree, depth) {
  //increase sum of items while traversing and comparing two trees of user chosen meal and menu
  var childrenOfChosenMeal = chosenMeal.children;
  var childrenOfJstree = jstree.children;

  for (var i = 0; i < childrenOfChosenMeal.length; i++) {
    var j = 0;
    while(j < childrenOfJstree.length)  {
      if(childrenOfChosenMeal[i].text == childrenOfJstree[j].text)  {
        if(depth == 2) {
          childrenOfJstree[j].data.sum++;
          //console.log(childrenOfJstree[j].text + " sum :" + childrenOfJstree[j].data.sum)
        }
        break;
      }
      j++;
    }
    if(depth < 3) {
      increaseSum(childrenOfChosenMeal[i], childrenOfJstree[j], depth + 1);
    }
  }
}
function initializeSumToZero(current, depth) {
  var children = current.children;
  //initialize data to 0
  if(depth == 3)  {
    current.data.sum = 0;
    return;
  }
  for (var i = 0, len = children.length; i < len; i++) {
    initializeSumToZero(children[i], depth + 1);
  }
}