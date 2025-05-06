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

const connection_str = process.env.MONGO_CONNECTION_STRING;
const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const api_key = process.env.FLIGHT_API_KEY;


app.get("/", (request, response) => {
    response.render("homePage.ejs", null);
});

app.get("/change_this_to_proper_name", (request, response) => {
    response.render("change_this_to_proper_name.ejs", null);
})

app.get("/change_this_to_proper_name", (request, response) => {
    response.render("change_this_to_proper_name.ejs", null);
})

process.stdin.setEncoding("utf8");
process.stdin.on('readable', () => {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            process.stdout.write("Shutting down the server");
            server.close(() => process.exit(0));
        }
        else {
            process.stdout.write(`Invalid command: ${command}\n`);
            console.log("Stop to shutdown the server: ");
        }
        process.stdin.resume();
    }

});

const server = app.listen(portNumber, () => {
    console.log(`Web server is running at http://localhost:${portNumber}`);
    console.log("Stop to shutdown the server: ");
});