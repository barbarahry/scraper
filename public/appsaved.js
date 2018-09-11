// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    var fullLink = "https://www.nytimes.com"+ data[i].link;
   // $("#articles").append("<br />" + data[i].pbody);
    $("#articles").append("<a href="+ fullLink +"><h6 class='mb-0' data-id='" + data[i]._id + "'>" + data[i].title +"</h6></a><p >" + data[i].pbody + "</p><br /><p class='textlink'>" + fullLink + "</p><br /><a class='btn btn-sm btn-outline-warning mr-3 deletearticle' data-id='" + data[i]._id + "'href='#'>Delete Article</a><a class='btn btn-sm btn-outline-success seenotes' data-id='" + data[i]._id + "'href='#'>Article Notes</a><hr>");
    
    
  }
});


// Whenever someone clicks a p tag
$(document).on("click", ".seenotes", function() {
  // Empty the notes from the note section
  $("#notes").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
      console.log(data);
      // The title of the article
      $("#notes").append("<h6>" +  data.title + "</h6>");
      // An input to enter a new title
      $("#notes").append("<input id='titleinput' name='title' class='form-control mb-3'>");
      // A textarea to add a new note body
      $("#notes").append("<textarea id='bodyinput' name='body' class='form-control pb-3'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notes").append("<button data-id='" + data._id + "' id='savenote' class='btn btn-sm btn-outline-success mr-3 mt-3'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {

        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
        $("#notes").append("<button  datanote-id='" + data.note._id + "' class='btn btn-sm btn-outline-danger note-delete  mt-3'>Delete Notes</button>");
        // for (var i = 0; i < data.length; i++) {
        //// Display the apropos information on the page
        //$("#articles").append(" <a class='btn btn-sm btn-outline-primary seenotes2' data-id='" + data[i]._id + "'href='#'>See Notes</a>"); 
        // }
     
        //$(".seenotes").html(" <a class='btn btn-sm btn-outline-primary seenotes2' data-id='" + data._id + "'href='#'>See Notes</a>");
        // window.location.reload();
      }
    });
});

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
///////
  // Now make an ajax call for the Article
  // $.ajax({
  //   method: "GET",
  //   url: "/articles/" + thisId
  // })
  //   // With that done, add the note information to the page
  //   .then(function(data) {
  //     console.log(data);
  //   // If there's a note in the article
  //     if (data.note) {
  //     $(".seenotes").html(" <a class='btn btn-sm btn-outline-primary seenotes2' data-id='" + data._id + "'href='#'>See Notes</a>");
  //       // window.location.reload();
  //     }
  //   });
///////  
    // Also, remove the values entered in the input and textarea for note entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});

// When you click the note-delete button
$(document).on("click", ".note-delete", function() {
  //Grab the id associated with the article from the submit button
  var thisId = $(this).attr("datanote-id");
  console.log("thisId  datanote :   " + thisId);
  //////////Run a DELETE request to remove the note?////////
  $.ajax({
    method: "DELETE",
    url: "/notes/" + thisId
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
  window.location.reload();
});


////////delete article?/////////
 // Whenever someone clicks a p tag
$(document).on("click", ".deletearticle", function() {
  // Empty the notes from the note section
  // $("#articles").empty();
  // $("#notes").empty();
  // Save the id from the p tag
//var thisId = $(this).data("_id");
var thisId = $(this).attr("data-id");
console.log("thisId:   " + thisId);
  // Now make an ajax call for the Article
  $.ajax({
    method: "DELETE",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .then(function(data) {
     
      console.log("erase" + thisId);
      // The title of the article
      
    });
    window.location.reload();
});