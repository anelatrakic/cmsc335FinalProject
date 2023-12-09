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




app.post("/SearchMovies", async (request, response) => {
    const { name, email, title } = request.body;
    const type = "Movie";
    postMovie({ name, email, title, type }).catch(console.error);
    const data = await getInfo(title).catch(console.error);
    const infoArray = data.result;
    let table = generateMovieTable(infoArray);
    response.render("displayCurrentSearch", { name, email, title, table });
});

function generateMovieTable(infoArray) {
    let table = "<table><tr><th>Movie Title</th><th>Description</th><th>Streaming Services</th></tr>";
    for(i = 0; i < infoArray.length; i++) {
        if(infoArray[i].type == "movie") {
                table += `<tr><td>${infoArray[i].title}</td>`;
                const genreArray = infoArray[i].genres;
                let genreString = genreArray[0].name;
                for(j = 1; j < genreArray.length; j++) {
                    genreString += ", " + genreArray[j].name;
                }
                const directorArray = infoArray[i].directors;
                let directorString = directorArray[0];
                for(j = 1; j < directorArray.length; j++) {
                    directorString += ", " + directorArray[j];
                }
                if(directorArray.length == 1) {
                    table += `<td>Genres: ${genreString}<br>Director: ${directorString}</td>`;
                }else{
                    table += `<td>Genres: ${genreString}<br>Directors: ${directorString}</td>`;
                }
                const serviceArray = infoArray[i].streamingInfo.us;
                let serviceString = "";
                let serviceMap = {};
                if(serviceArray == undefined) {
                    serviceString = "Not available";
                } else {
                    for(j = 0; j < serviceArray.length; j++) {
                        if(serviceMap[serviceArray[j].service] == true) {
                            continue;
                        }else{
                        currentService = serviceArray[j];
                        serviceLink = (currentService.service.charAt(0).toUpperCase() + currentService.service.slice(1));
                        serviceString += `<a href="${currentService.link}">${serviceLink}</a><br>`
                        serviceMap[currentService.service] = true;
                        }
                    }
                }
                table += `<td>${serviceString}</td>`;
        }
    }
    table += "</table>";
    return table;
}




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




app.post("/SearchShows", async (request, response) => {
    const { name, email, title } = request.body;
    const type = "show";
    postMovie({ name, email, title, type }).catch(console.error);
    const data = await getInfo(title).catch(console.error);
    const infoArray = data.result;
    let table = generateShowTable(infoArray);
    response.render("displayCurrentSearch", { name, email, title, table });
});

function generateShowTable(infoArray) {
    let table = "<table><tr><th>Show Title</th><th>Description</th><th>Streaming Services</th></tr>";
    for(i = 0; i < infoArray.length; i++) {
        if(infoArray[i].type == "series") {
                table += `<tr><td>${infoArray[i].title}</td>`;
                const genreArray = infoArray[i].genres;
                let genreString = genreArray[0].name;
                for(j = 1; j < genreArray.length; j++) {
                    genreString += ", " + genreArray[j].name;
                }
                const creatorArray = infoArray[i].creators;
                let creatorString = creatorArray[0];
                for(j = 1; j < creatorArray.length; j++) {
                    creatorString += ", " + creatorString[j];
                }
                const seasonCount = infoArray[i].seasonCount;
                const episodeCount = infoArray[i].episodeCount;
                table += `<td>Genres: ${genreString}<br>Creators: ${creatorString}
                <br>Seasons: ${seasonCount}<br>Episodes: ${episodeCount}</td>`;
                const serviceArray = infoArray[i].streamingInfo.us;
                let serviceString = "";
                let serviceMap = {};
                if(serviceArray == undefined) {
                    serviceString = "Not available";
                } else {
                    for(j = 0; j < serviceArray.length; j++) {
                        if(serviceMap[serviceArray[j].service] == true) {
                            continue;
                        }else{
                        currentService = serviceArray[j];
                        serviceLink = (currentService.service.charAt(0).toUpperCase() + currentService.service.slice(1));
                        serviceString += `<a href="${currentService.link}">${serviceLink}</a><br>`
                        serviceMap[currentService.service] = true;
                        }
                    }
                }
                table += `<td>${serviceString}</td>`;
        }
    }
    table += "</table>";
    return table;
}






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




const axios = require('axios');
const { table, info } = require('console');




const options = {
    method: 'GET',
    url: 'https://streaming-availability.p.rapidapi.com/search/title',
    params: {
      title: '<REQUIRED>',
      country: 'us',
      show_type: 'all',
      output_language: 'en'
    },
    headers: {
      'X-RapidAPI-Key': 'd55f2512a6msha2c85bd1336ba30p17a59djsn85f9d8785fd8',
      'X-RapidAPI-Host': 'streaming-availability.p.rapidapi.com'
    }
  };
 
 async function getInfo(title) {
    options.params.title = title;
    const response = await axios.request(options);
    console.log(response.data);
    return response.data;
 }

















