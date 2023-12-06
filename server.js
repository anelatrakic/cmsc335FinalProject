const http = require('http');
const fs = require('fs');
const app = express();

// Needed for templates
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
