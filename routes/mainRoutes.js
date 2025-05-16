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


const connection_str = process.env.MONGO_CONNECTION_STRING;
const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const apiKey = process.env.FLIGHT_API_KEY;

const client = new MongoClient(connection_str);

// utilize the .env file created
require("dotenv").config({ 
    path: path.resolve(__dirname, ".env"), 
}); 

// home page router
router.get("/", async (request, response)=>{

    try {
        await client.connect();
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        const count = await collection.countDocuments();
            
        if (count === 0) {
            await get_all_flights();
        }

        response.render("homePage.ejs");
    }
    catch (error) {
        console.error(error);
    }
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

async function get_all_flights() {
    try {
        await client.connect();
        const params = new URLSearchParams({
            access_key: apiKey,
            flight_status: 'scheduled',
        });

        const api_res = await axios.get('https://api.aviationstack.com/v1/flights?', {params});

        // num to keep track of the contents
        const all_scheduled_flights = api_res.data.data.map((flight, num) => ({

            uniqueNum: num+1,
            airline: {
                name: flight.airline.name ? flight.airline.name : "Not Listed",
                iata: flight.airline.iata ? flight.airline.iata : "Not Listed",
            },
            flight: {
                number: flight.flight.number ? flight.flight.number : "Not Listed",
            },
            departure: {
                airport: flight.departure.airport ? flight.departure.airport : "Not Listed",
                timezone: flight.departure.timezone ? flight.departure.timezone : "Not Listed",
                iata: flight.departure.iata ? flight.departure.iata : "Not Listed",
                scheduled: flight.departure.scheduled ? flight.departure.scheduled : "Not Listed",
                terminal: flight.departure.terminal ? flight.departure.terminal : "Not Listed",
                gate: flight.departure.gate ? flight.departure.gate : "Not Listed",
            },
            arrival: {
                airport: flight.arrival.airport ? flight.arrival.airport : "Not Listed",
                timezone: flight.arrival.timezone ? flight.arrival.timezone : "Not Listed",
                iata: flight.arrival.iata ? flight.arrival.iata : "Not Listed",
                scheduled: flight.arrival.scheduled ? flight.arrival.scheduled : "Not Listed",
                terminal: flight.arrival.terminal ? flight.arrival.terminal : "Not Listed",
                gate: flight.arrival.gate ? flight.arrival.gate : "Not Listed",
            },
        }))  || [];

        // for mongodb
        
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        const insertResult = await collection.insertMany(all_scheduled_flights);
  
        // fin mongobd code


        console.log("Accessing API with the URL:", `https://api.aviationstack.com/v1/flights?${params}`);

        all_scheduled_flights.forEach(flight => {
            console.log('Departure IATA', flight.departure.iata);
            console.log('Arrival IATA', flight.arrival.iata);
            console.log(' ');
        });

        console.log("All Flights Found: ", all_scheduled_flights.length);

    }
    catch(error) {
        return [];
    }
}