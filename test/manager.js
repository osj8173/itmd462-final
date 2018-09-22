let mongoose = require("mongoose");
let Menu = require('../models/menu');
let ChosenMeal = require('../models/chosenMeal')
let chai = require('chai');
let chaiHttp = require('chai-http');
let app = require('../app');
let http = require('http');

let server = http.createServer(app);
let should = chai.should();

chai.use(chaiHttp);

describe('Manager', () => {
  before(done => {
    // Start the server
    server.listen(0);
    done();
  });

  beforeEach(done => { 
    // Before each test we empty the database
    Menu.remove({}, (err) => { 
      done();         
    });

  });

  after(done => {
    // After all tests we close the server and disconnect from the database
    server.close();
    mongoose.disconnect();
    done();
  });

  describe('GET /manager/menu/new', () => {
    it('it should GET a new menu', (done) => {
      //Bug-empty Json data :{} gets deleted
      var expectedMenu = new Menu({date:"new", jstree:[{"id":"j1_1","text":"Menu","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_1_anchor"},"state":{"loaded":true,"opened":true,"selected":false,"disabled":false},"children":[{"id":"j1_2","text":"Breakfast","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_2_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"children":[]},{"id":"j1_3","text":"Lunch","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_3_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"children":[]},{"id":"j1_4","text":"Dinner","icon":true,"li_attr":{"id":false},"a_attr":{"href":"#","id":"j1_4_anchor"},"state":{"loaded":true,"opened":false,"selected":false,"disabled":false},"children":[]}]}]});
      chai.request(server)
        .get('/manager/menu/new')
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property("date").eql(expectedMenu.date);
          //attributes that have empty json value get deleted due to JSON parser (body-parser)
          res.body.should.have.property("jstree");
          done();
        });
    });
  });


  describe('GET /manager/menu/:id', () => {
    it('it should get an existing menu', (done) => {
      let existingMenu = new Menu({
        "date": "test",
        "jstree": [{"text" : "test", "children": []}]
      });

      existingMenu.save(function (err, menu) {
        if (err) return console.error(err);
        chai.request(server)
          .get('/manager/menu/' + existingMenu.date)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("date").eql(existingMenu.date);
            res.body.should.have.property("jstree").eql(existingMenu.jstree);
            done();
          });
      });
    });
  });

  describe('POST /manager/menu/:id', () => {
    it('it should insert a new menu or update an existing menu', (done) => {
      let expectedMenu = new Menu({
        date: "test",
        jstree: [{"text" : "test", "children": []}]
      });
      //First post
      chai.request(server)
          .post('/manager/menu/' + expectedMenu.date)
          .send(expectedMenu)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("date").eql(expectedMenu.date);
            res.body.should.have.property("jstree").eql(expectedMenu.jstree);

            expectedMenu.jstree = [{"text" : "changed text", "children": []}]
            //Second post(update)
            chai.request(server)
              .post('/manager/menu/' + expectedMenu.date)
              .send(expectedMenu)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property("date").eql(expectedMenu.date);
                res.body.should.have.property("jstree").eql(expectedMenu.jstree);
                done();
              });
          })
    });
  }); 
  describe('DELETE /manager/menu/:id', () => {
    it('it should delete an existing menu', (done) => {
      let existingMenu = new Menu({
        "date": "test",
        "jstree": [{"text" : "test", "children": []}]
      });

      existingMenu.save(function (err, menu) {
        if (err) return console.error(err);
        chai.request(server)
          .delete('/manager/menu/' + menu.date)
          .end((err, res) => {
            res.should.have.status(204);
            res.body.should.be.empty;

            Menu.findOne({date: existingMenu.date}, function(err, menu) {
              if (err) return console.error(err);
              should.not.exist(menu);
              done();
            })
          });
      });
    });
  });

  describe('POST /chosenMeals', () => {
    it('it should insert a new meal order', (done) => {
      let expectedChosenMeal = new ChosenMeal({
        date: "test date",
        name: "test name",
        children: [{"text" : "test", "children": []}]
      });
      chai.request(server)
          .post('/chosenMeals')
          .send(expectedChosenMeal)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property("date").eql(expectedChosenMeal.date);
            res.body.should.have.property("name").eql(expectedChosenMeal.name);
            res.body.should.have.property("children").eql(expectedChosenMeal.children);

            done();
          })
    });
  }); 
});