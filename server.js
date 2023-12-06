const http = require('http');
const fs = require('fs');
const app = express();

// Needed for templates
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

// Allows CSS file use
app.use(express.static("public"));

app.get("/", (request, response) => {
    response.render("index");
});

app.get("/SearchMovies", (request, response) => {
    response.render("SearchMovies");
});

app.get("/SearchShows", (request, response) => {
    response.render("SearchShows");
});
