// --------------- NODE LIBRARIES/MODULES IMPORTED ------------------------------- 
const http = require("http"); 
const express = require("express"); 
const app = express(); 
const path = require("path"); 
const bodyParser = require("body-parser"); 
const { MongoClient, ServerApiVersion } = require("mongodb"); 
const portNumber = 4000;
const axios = require("axios");


// utilize the .env file created
require("dotenv").config({ 
    path: path.resolve(__dirname, ".env"), 
}); 


// set the engine and the templates folder directory 
app.set("view engine", "ejs"); 
app.set("views", path.resolve(__dirname, "templates")); 
/* use body parser for post */ 
app.use(bodyParser.urlencoded({ extended: false })); 

app.use(express.static(path.join(__dirname, 'public')));
// listen on this port 
app.listen(portNumber); 

const connection_str = process.env.MONGO_CONNECTION_STRING;
const databaseName = process.env.MONGO_DB_NAME;
const collectionName = process.env.MONGO_COLLECTION;
const apiKey = process.env.FLIGHT_API_KEY;

const client = new MongoClient(connection_str);
// await client.connect(); // give me a problem

app.get("/", (request, response) => {
    response.render("homePage.ejs", null);
});

// app.get("/change_this_to_proper_name", (request, response) => {
//     response.render("change_this_to_proper_name.ejs", null);
// })

app.get("/travel_info", async (request, response) => {

    try {
            
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);

        const departureChoices = await collection.distinct("departure.iata");
        const arrivalChoices = await collection.distinct("arrival.iata");

        const variables = {
            departureChoices: departureChoices,
            arrivalChoices: arrivalChoices,
        };

        response.render("travel_info.ejs", variables);
    }
    catch (error) {
        console.error(error);
    }
    
})

app.post("/get_flights", async (request, response) => {

    try {

        const neededDeparture = request.body.selectedDep;
        const neededArrival = request.body.selectedArr;

        console.log("Depart: ", neededDeparture);
        console.log("Arrival: ", neededArrival);

        // const client = new MongoClient(connection_str);
        const database = client.db(databaseName);
        const collection = database.collection(collectionName);
    
        /* Looking for several */
        filter = { 'departure.iata': neededDeparture, 'arrival.iata': neededArrival};
        const cursor = collection.find(filter);
        result = await cursor.toArray();
        console.log(result);

        console.log("Matched Flights Found: ", result.length);

       

        const variables = {
            departure: neededDeparture,
            arrival: neededArrival,
            matching_flights: result,
        };

        

        response.render("get_flights.ejs", variables);
        
    }

    catch (error) {
        console.error("Flight API error:", error);
    }

});

process.stdin.setEncoding("utf8");
process.stdin.on('readable', async () => {
    const dataInput = process.stdin.read();
    if (dataInput !== null) {
        const command = dataInput.trim();
        if (command === "stop") {
            // copied from lecture code
            try {
                const database = client.db(databaseName);
                const collection = database.collection(collectionName);

                const filter = {}; // filter = {} deletes them all
                const result = await collection.deleteMany(filter);
                console.log(`Entries deleted ${result.deletedCount}`);
            }
            catch (error) {
                console.error(error);
            }
            finally {
               await client.close();
            }
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

const server = app.listen(portNumber, async () => {
    console.log(`Web server is running at http://localhost:${portNumber}`);
    await get_all_flights();
    console.log("Stop to shutdown the server: ");
});

async function get_all_flights() {
    try {
        await client.connect();
        const params = new URLSearchParams({
            access_key: apiKey,
            flight_status: 'scheduled',
        });

        const api_res = await axios.get('https://api.aviationstack.com/v1/flights?', {params});

        const all_scheduled_flights = api_res.data.data.map(flight => ({
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
        // const client = new MongoClient(connection_str);
        
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