// --------------- NODE LIBRARIES/MODULES IMPORTED ------------------------------- 
const http = require("http"); 
const express = require("express"); 
const app = express(); 
const path = require("path"); 
const bodyParser = require("body-parser"); 
const { MongoClient, ServerApiVersion } = require("mongodb"); 
const portNumber = 4000;

// utilize the .env file created
require("dotenv").config({ 
    path: path.resolve(__dirname, "credentialsDontPost/.env"), 
}); 

// set the engine and the templates folder directory 
app.set("view engine", "ejs"); 
app.set("views", path.resolve(__dirname, "templates")); 
/* use body parser for post */ 
app.use(bodyParser.urlencoded({ extended: false })); 


// listen on this port 
app.listen(portNumber); 

