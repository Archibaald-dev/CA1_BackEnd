const express = require("express");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");

// Place your Atlas connection string here
const url = ""
const client = new MongoClient(url, { useUnifiedTopology: true });

//The database to use (Db : gundam-db , collection name : gundam)
const dbName = "gundam-db";

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

let db, gundamDb;

run().catch(console.dir);

//home page route
app.get("/", (req, res) => {
  res.send(
    "Hello and welcome to the home page of the gundams app. The different routes are : Get one : /gundam/id . Get all : /gundam"
  );
});
//get one gundam
app.get("/gundam/:id", (req, res) => {
  console.log("User is getting one gundam");
  let id = req.params.id;
  async function findGundam() {
    try {
      const foundGundam = await gundamDb.findOne({ _id: ObjectId(id) });
      res.json(foundGundam);
    } catch (err) {
      res.send("Invalid object ID");
    }
  }
  findGundam();
});

//get all gundams
app.get("/gundam", (req, res) => {
  console.log("User is getting all gundams");
  async function getAllGundams() {
    let gundams = [];
    const gundamCursor = gundamDb.find();
    await gundamCursor.forEach((gundam) => {
      gundams.push(gundam);
    });
    res.send(gundams);
  }
  getAllGundams();
});

//post a gundam
app.post("/gundam", (req, res) => {
  console.log("I have received a post request in the /gundam route");
  //create a gundam object
  let gundam = new Gundam(
    req.body.name,
    req.body.constructor,
    req.body.sheildingType,
    req.body.pilot
  );
  //insert it to the database
  gundamDb.insertOne(gundam);
  res.sendStatus(200);
});
//update a gundam
app.put("/gundam", (req, res) => {
  console.log("I have received an update request");
  async function findGundam() {
    try {
      const foundGundam = await gundamDb.findOne({
        _id: ObjectId(req.body.id),
      });
      //if the gundam is found edit it and send a message to the user
      if (foundGundam !== null) {
        let gundam = new Gundam(
          foundGundam.name,
          foundGundam.constructor,
          foundGundam.sheildingType,
          foundGundam.pilot
        );
        gundam.name = req.body.name;
        try {
          const updateResult = await gundamDb.updateOne(
            { _id: ObjectId(req.body.id) },
            { $set: gundam }
          );
        } catch (err) {
          console.log(err.stack);
        }
        console.log(updateResult.modifiedCount);
        res.send("The gundam was updated");
      } else {
        //if the gundam is not found send a message to the user saying that this entry does not exist
        res.send("The gundam was not updated because it was not found ");
      }
    } catch (err) {
      res.send("Object id is invalid");
    }
  }
  findGundam();
});
//delete a gundam
app.delete("/gundam", (req, res) => {
  console.log("I have received a delete request");
  console.log(req.body.id);
  gundamDb.deleteOne({ _id: ObjectId(req.body.id) });
  async function findGundam() {
    const foundGundam = await gundamDb.findOne({ _id: ObjectId(req.body.id) });
    if (foundGundam !== null) {
      res.send("The entry was not deleted");
    }
    res.send("The entry was deleted");
  }
  findGundam();
});

//Start the application
async function run() {
  //try to start the application only if the database is connected correctly
  try {
    //connect to the database
    await client.connect();

    //connect to the right database
    db = client.db(dbName);

    //get reference to our gundam "table"
    gundamDb = db.collection("gundam");

    //start listening to requests (get/post/etc.)
    app.listen(3000);
  } catch (err) {
    //in case we couldn't connect to our database throw the error in the console
    console.log(err.stack);
  }
}

//Gundam class
class Gundam {
  constructor(name, constructor, sheildingType, pilot) {
    this.name = name;
    this.constructor = constructor;
    this.sheildingType = sheildingType;
    this.pilot = pilot;
  }
  printValues() {
    console.log(this.name, this.constructor, this.sheildingType, this.pilot);
  }
}
