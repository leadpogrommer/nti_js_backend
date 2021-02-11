const MongoClient = require("mongodb").MongoClient;

let client = new MongoClient("mongodb://127.0.0.1")

let ready = false;

let promise = client.connect()
let connection = null;

async function db(){
    if(!ready) {
        connection = await promise;
        ready = true;
    }
    return connection.db("NTI");
}


module.exports = db