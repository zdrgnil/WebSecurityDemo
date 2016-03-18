var express = require('../node_modules/express');
var session = require('../node_modules/express-session');
var bodyParser = require('../node_modules/body-parser');
var app = express();
var db = require('./database');
var fs = require("fs");

app.use(express.static('static'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(session({secret: 'ssshhhhh'}));

// This responds with "Hello World" on the homepage
app.post('/addUser', function (req, res) {
  console.log(req.body);
  var resp = function(state){
    if(state)
      res.send('success');
    else
      res.send('fail');
  }
  db.addUser(req.body.username, req.body.password, req.body.email, resp);
})

// This responds with "Hello World" on the homepage
app.get('/', isAuth, function (req, res) {
  db.getInfo(req.session.user_id, function(data){
    if(data){
      req.session.coins = data.coin;
      res.render('main.jade',{"username": req.session.user_id, "coin":req.session.coins, "token":req.session.secret_token});
    }else{
      res.render('main.jade',{"username": req.session.user_id, "coin":'nah', "token":req.session.secret_token});      
    }
  });
  // res.sendFile( __dirname + '/views/main.html');
})

// This responds with "Hello World" on the homepage
app.get('/login', function (req, res) {
  res.sendFile( __dirname + '/static/login.html');
})


// This responds a POST request for the homepage
app.post('/login', function (req, res) {
  var resp = function(isLogin){
    if(isLogin){
      req.session.user_id = req.body.username;
      req.session.secret_token = Math.random();
      res.redirect('/');
    }else{      
      var data = fs.readFileSync(__dirname+'/views/login_template.html');
      data = data.toString().replace('@replace2','Invalid login info for user"'+req.body.username+'"');
      data = data.replace("@replace1",req.body.username);
      res.send(data);
      // res.render('login_template.jade',{"username": req.body.username, "message":'Invalid Login info for user \''+req.body.username+'\'.'});
    }
  }
  db.findUser(req.body.username, req.body.password,resp);
})

app.get('/trans', isAuth, function (req, res) {
  // Technique to prevent XSFR
  if(req.session.secret_token!=req.query.token){
    res.redirect('/');
    return;
  }
  var resp = function(isSuccess){
    if(isSuccess){
      res.redirect('/');
    }else{
      res.redirect('/');
    }
  }
  db.transCoin(req.session.user_id, req.query.receiver, req.query.coins, resp);
})

app.get('/script', isAuth, function (req, res) {
  // Technique to prevent XSFR
  // if(req.session.secret_token!=req.query.token){
  //   res.redirect('/');
  //   return;
  // }
  res.send('var coin = ' + req.session.coins + '; var username ="' + req.session.user_id + '" ;');
})

app.get('/logout', isAuth, function (req, res) {
  req.session.destroy();
  res.redirect('/login');
});


var server = app.listen(8099, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

})

function isAuth(req, res, next) {
  if (!req.session.user_id) {
    res.sendFile( __dirname + '/static/login.html');
  }else{
    next();
  }
}
