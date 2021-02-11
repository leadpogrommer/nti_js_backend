const crypto = require('crypto')
var db = require('./mongo');

let tokens = {}

async function generate(username){
    let token = crypto.randomBytes(64).toString('base64');
    // tokens[token] = username;
    let collection = (await db()).collection("Tokens");

    let findRes = await collection.findOne({username: username});
    if(!findRes){
        console.log("New document")
        collection.insertOne({username, token});
    }else{
        console.log("update document");
        collection.updateOne({username}, {$set: {token}});
    }
    console.log(token);
    return token;
}

async function getUsername(token){
    // let bytes = Buffer.from(token, 'base64');
    // return tokens[bytes]
    let collection = (await db()).collection("Tokens");
    let findRes = await collection.findOne({token});
    if(!findRes)return null;
    // console.log(findRes);
    return findRes.username;
}

// let token = generate("ilya");
// console.log(token);
// console.log(getUsername(token));

module.exports = {generate, getUsername}