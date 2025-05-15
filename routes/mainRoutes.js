// --------------- NODE LIBRARIES/MODULES IMPORTED ------------------------------- 
const http = require("http"); 
const express = require("express"); 
const fs = require("fs");
const app = express(); 
const path = require("path"); 

// router use with Express.js
const router = express.Router();

const bodyParser = require("body-parser"); 
const { MongoClient, ServerApiVersion } = require("mongodb"); 
const portNumber = 4000;
const axios = require("axios");

// utilize the .env file created
require("dotenv").config({ 
    path: path.resolve(__dirname, ".env"), 
}); 

// home page router
router.get("/", (request, response)=>{
     response.render("homePage.ejs");
})

// popularDestinations route
router.get("/popularDestinations", (request, response)=>{
    const fileRead = fs.readFileSync("./photos.json", 'utf-8');
    const myData = JSON.parse(fileRead);
    response.render("popularDestinations", {destinations : myData["destinations"]});
})

// desired flights route
router.get("/desiredFlights", (request, response)=>{
    response.render("desiredFlights");
})

module.exports = router;