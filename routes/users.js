var express = require('express');
var router = express.Router();
var db = require('../mongo');
const bcrypt = require('bcrypt')
// const passport = require('passport')
const tokens = require('../tokens')


async function validatePassword(userObject, password){
  // console.log(userObject)
  // console.log(password)
  return await bcrypt.compare(password, userObject.password);
}

function usernameValid(username){
  if(typeof (username) != 'string')return false;
  return true
}

function passwordValid(password){
  if(typeof (password) != 'string')return false;
  return true;
}

/* GET users listing. */
router.post('/register', async function(req, res, next) {
  let collection = (await db()).collection("Users");

  console.log(req.body.username, req.body.password)
  if(!usernameValid(req.body.username) || !passwordValid(req.body.password)){
    res.status(400).end();
    return;
  }
  console.log("strings ok");
  if((await getUser(req.body.username)) != null){
    res.status(400).end();
    return;
  }
  console.log("all ok");
  req.body.username = req.body.username.toLowerCase();
  let hash = await bcrypt.hash(req.body.password, 10)

  collection.insertOne({username: req.body.username, password: hash, admin: false})
  res.status(200).end();
  console.log("done");


});


router.post('/login', async (req, res, next) => {
  if(typeof (req.body.username) === "undefined" || typeof (req.body.password) === "undefined" ){
    res.status(400).end();
    return;
  }
  req.body.username = req.body.username.toLowerCase();
  let user = await getUser(req.body.username);
  if(!user){
    res.status(403).end();
    return;
  }

  // console.log(user);

  if(!(await validatePassword(user, req.body.password))){
    res.status(403).end();
    return;
  }

  res.json({token: await tokens.generate(req.body.username)}).status(200).end();
});

async function getUser(username){
  let collection = (await db()).collection("Users");
  // console.log(user)
  return await collection.findOne({username: username});
}

async function needLogin(req, res, next){
  let token = req.body.token;
  if(!token){
    res.status(403).end();
    return;
  }
  let username = await tokens.getUsername(token);
  if(!username){
    res.status(403).end();
    return;
  }
  let user = await getUser(username);
  if(!user){
    res.status(403).end();
    return;
  }
  // console.log(user);
  req.user = user;
  next()
}



router.post('/userinfo', needLogin, async (req, res) => {
  // let username = req.body.username;
  // if(!username){
  //   res.status(400).end();
  //   return;
  // }
  // console.log(username);
  // let user = await getUser(username);
  // if(!user){
  //   res.status(400).end();
  //   return;
  // }
  // // console.log(user);
  let user = req.user;
  user.password = undefined;
  user._id = undefined;
  res.json(user).end();
})

router.post('/update_user', needLogin, async (req, res) => {
  let fields = ["first_name", "last_name", "father_name", "phone", "about"];
  let updateData = {};
  for(let field in req.body){
    console.log(field);
    if(fields.includes(field)){
      updateData[field] = req.body[field];
    }
  }

  let collection = (await db()).collection("Users");
  collection.updateOne({username: req.user.username}, {$set: updateData});

  res.status(200).end();
  // res.json(updateData).end();
})

router.post('/logout', needLogin, async (req, res)=>{
  let collection = (await db()).collection("Tokens");
  collection.deleteMany({username: req.user.username});
  res.status(200).end();
});



module.exports = {getUser, validatePassword, router}



