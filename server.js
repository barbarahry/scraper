var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();
/////////
// Serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

/////////
// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));

// // Use body-parser for handling form submissions
// app.use(bodyParser.urlencoded({ extended: true }));
// // Use express.static to serve the public folder as a static directory
// app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://heroku_d6xv6kqf:f03sdv6f7g0srfp5ct5fcnhdq@ds151382.mlab.com:51382/heroku_d6xv6kqf");
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);



// Routes


// A GET route for scraping the NYT website
app.get("/", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", dbArticle);
      
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});  //  end of app.get("/"

app.get("/savedpage", function(req, res) {
  //to do: GO to savedpages where you can view  saved articles in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("savedpage", dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});  //  app.get("/savedpage"

app.get("/scrape", function(req, res) {
  var results = [];
  // First, we grab the body of the html with request
  axios.get("http://www.nytimes.com").then(function(response) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(response.data);

    // Now, we grab every h2 within an article tag, and do the following:
    $("article").each(function(i, element) {
      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(element).find("h2").text();
      result.link = $(element).find("a").attr("href");
      result.pbody = $(element).find("p").text();
      //  console.log("\n title" + result.title);
      if(result.title) {
        console.log("\n SAving title: " + result.title);
              // Create a new Article using the `result` object built from scraping
      db.Article.create(result)
      .then(function(dbArticle) {
        console.log(dbArticle);
      })
      .catch(function(err) {  //  If an error occurred, send it to the client
        return res.json(err);
      });  //  end of db.Article.create
      };
          
    //results.push({ title: result.title, link: result.link, pbody: result.pbody });
     });  //  end of $("article")
   
    //var ScrapedNum = results.length;

    //console.log(":::::::::::::::::ScrapedNum:::::::::::::::::" + ScrapedNum);
    //res.render("savedpage",  results);  //  This should display savedpage with scraped material
   //res.send("<a class="p-2 text-muted" href="/savedpage">Saved Articles</a>"");
   //res.render("savedpage", results);
   res.render("scrapedpage");
  });  //  end of axios.get
});  //  app.get("/scrape"

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving Article to the db
app.put("/articles", function(req, res) {
      //  Create a new Article using the `result` object built from scraping
      console.log(":::::::::::::::::Create a new Article:::::::::::::::::" + req.body);
      db.Article.create(req.body)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log("\nView the added result in the console: ");
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          console.log("\n Not Putting");
          return res.json(err);
        });  //  end of db.Article.create
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

//////// Route for deleting an Article's associated Note?
//app.delete("/articles/:id", function(req, res) {
app.delete("/notes/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry //delete?
  db.Note.findByIdAndRemove({ _id: req.params.id })
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Note.findByIdAndRemove({ _id: req.params.id });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


//////// Route for deleting an Article?
app.delete("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry //delete?
  db.Article.findByIdAndRemove({ _id: req.params.id })
    .then(function() {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      db.Article.findByIdAndRemove({ _id: req.params.id });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
