// Grab the articles as a json
$.getJSON("/articles", function(data) {
  var leadLink = "https://www.nytimes.com";
  // For each one
  for (var i = 1; i < data.length; i++) {
    // Display the apropos information on the page
    //var fullLink = "https://www.nytimes.com"+ data[i].link;
    var fullLink = leadLink + data[i].link;
   // $("#articles").append("<br />" + data[i].pbody);
   // $("#articles").append("<a href="+ fullLink +"><h6 class='mb-0' data-id='" + data[i]._id + "'>" + data[i].title +"</h6></a><p>" + data[i].pbody + "</p><br /><a class='btn btn-sm btn-outline-secondary' href='#'>Save Article</a><p >Article Saved</p><hr>");
    $("#articles").append("<a href="+ fullLink +"><h6 class='mb-0'>" + data[i].title +"</h6></a>" + data[i].pbody + "<p data-id='" + i + "' data-title='" + data[i].title + "' data-link='" + data[i].link + "' data-pbody='" + data[i].pbody + "'><br /><a class='btn btn-sm btn-outline-secondary' href='#'>Save Article</a></p><hr>");
    // $("#title").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    
  }
});

// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Save article for later
//  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");
  console.log("\n Clicked Save Article::::::::::::::::::" + thisId);
// Save an empty result object
var result = {};

// Add the text and href of every link, and save them as properties of the result object
//result.title = data[thisId].title;
result.title = $(this).attr("data-title");
result.link = $(this).attr("data-link");
result.pbody = $(this).attr("data-pbody");

 console.log("\n Clicked result link ::::::::::::::::::" + result.link);
 
 $.ajax({
  method: "PUT",
  url: "/articles/" ,
  data: {
    // Value taken from title input
    title: result.title,
    link: result.link,
    pbody: result.pbody
  }
  });


// Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});  //  end Whenever someone clicks a p tag

// When you click the savenote button
$(document).on("click", "#savenote", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the note, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from note textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .then(function(data) {
      // Log the response
      console.log(data);
      // Empty the notes section
      $("#notes").empty();
    });

  // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
