const http = require('http');
const fs = require('fs');
const express = require("express"); 
const app = express();

const path = require("path");
const bodyParser = require("body-parser"); 
const portNumber = 4000;

// Needed for templates
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

/* this is for mongoDB */
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 
const uri = `mongodb+srv://${process.env.MONGO_DB_USERNAME}:${process.env.MONGO_DB_PASSWORD}@cluster0.fkwfb4a.mongodb.net/?retryWrites=true&w=majority`; 
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION};
const { MongoClient, ServerApiVersion } = require('mongodb');

/* needed for post */
app.use(bodyParser.urlencoded({extended:false}));

// Allows CSS file use
app.use(express.static("public"));

app.get("/", (request, response) => {
    response.render("index");
});

/* get user movie info and INSERT into the database */
app.get("/SearchMovies", (request, response) => {
    response.render("SearchMovies");
});

async function postMovie(formData) {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        await insertData(client, databaseAndCollection, formData);
    } catch (e) {
        throw e;
    } finally {
        await client.close();
    }
}

app.post("/SearchMovies", (request, response) => {
    const { name, email, title } = request.body;
    const type = "Movie"; 
    postMovie({ name, email, title, type }).catch(console.error);
    response.render("displayCurrentSearch", { name, email, title });
});

async function insertData(client, databaseAndCollection, d) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(d);
}

/* now doing similar process for shows */
/* get user show info and INSERT into the database */
app.get("/SearchShows", (request, response) => {
    response.render("SearchShows");
});

async function postShow(formData) {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        await insertData(client, databaseAndCollection, formData);
    } catch (e) {
        throw e;
    } finally {
        await client.close();
    }
}

app.post("/SearchShows", (request, response) => {
    const { name, email, title } = request.body;
    const type = "Show"; 
    postShow({ name, email, title, type }).catch(console.error);
    response.render("displayCurrentSearch", { name, email, title });
});

app.get("/ViewYourRecentSearches", (request, response) => {
  response.render("DisplayYourData");
});

app.post("/DisplayYourData", async (request, response) => {
    const { name } = request.body;
    const userData = await allEntries().catch(console.error);    
    let s = ""; 
    userData.forEach(entry => {
        if(entry.name === name ) {
            s += `<tr><td>${entry.name}</td><td>${entry.email}</td>`;
            s += `<td>${entry.type}</td><td>${entry.title}</td></tr>`;
        }
    });
    const variables = {
        restOfTable: s
    };
    response.render("DisplayAllData", variables);
}); 

app.get("/displayAllData", async (request, response) => {
    const entries = await allEntries().catch(console.error);
    let restOfTable = ""; 
    entries.forEach(entry => {
        restOfTable += `<tr><td>${entry.name}</td><td>${entry.email}</td>`;
        restOfTable += `<td>${entry.type}</td><td>${entry.title}</td></tr>`;
    });
    response.render("DisplayAllData", { restOfTable } );
  });

async function allEntries() {
    const client = new MongoClient(uri, { serverApi: ServerApiVersion.v1 });
    try {
        await client.connect();
        const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find({});
        const result = await cursor.toArray();
        console.log(result);
        return result; 
    } catch (e) {
        console.error(e);
    } finally {
        await client.close(); 
    }
}

/* terminates if user enters stop */
app.listen(portNumber, () => { 
    console.log(`Web server started and running at http://localhost:4000`);
    process.stdout.write("Stop to shutdown the server: ");
    process.stdin.setEncoding("utf8");
    process.stdin.on('readable', () => {  
    let dataInput = process.stdin.read();
        if (dataInput !== null) {
            let command = dataInput.trim();
            if (command === "stop") {
                console.log("Shutting down the server");
                process.exit(0); 
            } 
        }
    });
});
