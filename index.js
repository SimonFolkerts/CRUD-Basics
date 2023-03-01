// import express
const express = require("express");
const fs = require("fs");

// instantiate an express server object
const app = express();

// apply middleware to enable reading of incoming request bodies
app.use(express.json());

// -------------------------------
// ROUTES

// get all
app.get("/", (req, res) => {
  // read file contents off of disk, returns buffer containing user JSON data encoded in binary
  const rawData = fs.readFileSync("./data.json");

  // decode buffer to JS to get the user array
  const array = JSON.parse(rawData);

  // send JS as JSON using .json();
  res.json(array);
});

// -------------------------------

// post new. We want to create a new object in the array from the data sent to the server
app.post("/", (req, res) => {
  // read file contents off of disk, returns buffer containing user JSON data encoded in binary
  const rawData = fs.readFileSync("./data.json");

  // decode buffer to JS to get the user array
  const array = JSON.parse(rawData);

  /*
  Now that we have the array, we want to construct a new object using the data from the client to push into the array.
  We could just push the data from the client (an object representing a user) into the array, but we need to add an ID to it so it can be updated and deleted.
  It is standard practice for the back end to handle assigning IDs to data it receives, if it was up to the clients it would be a mess
  */

  const newUser = {
    id: Math.random(), // <-- lets just use a random number for the ID. A real database has a proper system for ids, we will cover this soon)
    name: req.body.name, // <-- copy the client name into the new object's name property
    role: req.body.role, // <-- copy the client role into the new object's role property
  };

  // push the new data to the array
  array.push(newUser);

  // overwrite old file with new data
  fs.writeFileSync("./data.json", JSON.stringify(array));

  // end interaction
  res.end();
});

// -------------------------------

// get one by id. We want to be able to get information on a specific user by using their id, so we have a dynamic segment to allow the client to pass it up in the request
app.get("/:userId", (req, res) => {
  // read file contents off of disk, returns buffer containing user JSON data encoded in binary
  const rawData = fs.readFileSync("./data.json");
  // decode buffer to JS to get the user array
  const array = JSON.parse(rawData);

  // find the user object in the array by checking the id. Note, the url parameters are always strings, so we need to do loose comparison (==) not (===)
  const requestedUser = array.find((user) => user.id == req.params.userId);
  // send user as JSON using .json();
  res.json(requestedUser);
});

// -------------------------------

// update existing user. We need to know the id of the user that is going to be updated, so we have a dynamic segment to allow it to be passed up to the server
app.put("/:userId", (req, res) => {
  // first we need to read our data:
  // read file contents off of disk, returns buffer containing user JSON data encoded in binary
  const rawData = fs.readFileSync("./data.json");
  // decode buffer to JS to get the user array
  const array = JSON.parse(rawData);

  // next we need to find the user that is to be updated. We can use .find() for this:
  const requestedUser = array.find((user) => user.id == req.params.userId);
  /* NOTE: objects aren't copied when they are assigned to variables.
  When you assign an object to a variable, that variable now 'points to' or 'references' the original object.
  For example if we have an object { name: "simon" } stored in a variable called myObject, and we assign myObject to a new variable like this:

    const newVariable = myObject;

  both newVariable and myObject contain the same object, not two separate copies. If we alter the object in one, e.g.:

    newVariable.name = "bob";

  Then that change is also reflected in the other:
  
    console.log(myObject.name);
    outputs: bob
  
  This is because objects and arrays are passed by reference, not by value, unlike primiteves (numbers, strings, booleans).
  What this means is that if we find the object in the array, we can simply assign it to a variable such as requestedUser above,
  and then modify it directly. This means we don't have to splice the array and replace it with a new one, or find the index of the object
  and modify the element in the array using the index to directly target it. We simpley create a new reference to it and modity the reference, which updates the original.
*/

  // update the object values (this works becuase objects are passed by reference not value, so we aren't just modifying a copy, but the original object in the array)
  requestedUser.name = req.body.name;
  requestedUser.role = req.body.role;

  // confirm that item was updated by logging the array, once we know it's working, we can remove this
  console.log(array);

  // finally, overwrite the old file contents with the new updated array by stringifying (converting to JSON) and writing the array to the file
  fs.writeFileSync("./data.json", JSON.stringify(array));

  // don't forget to finish the HTTP interaction (usually we would send back a redirect or a refresh response)
  res.end();
});

// -------------------------------

// delete by id. In this instance, we want to remove an object from the array entirely. We can use .splice() for this
app.delete("/:userId", (req, res) => {
  const rawData = fs.readFileSync("./data.json");
  // decode buffer to JS to get the user array
  const array = JSON.parse(rawData);

  // now that we have the array, we need to be able to splice out the entry we want to get rid of. For that, we need the index of the item
  // we can use .findIndex() for this (it returns the index of the matching element in the array)
  const deleteUserIndex = array.findIndex(
    (user) => user.id == req.params.userId
  );

  /*
  So we have the index of the object that is to be deleted, we can now use .splice() to remove it.
  .splice() needs at least two things to do this, a start position in the array, and the number of things to delete.
  We want to delete one (1) item, at the index of the target element.
  Note: splice doesn't create a   modified copy, it modifies the original array, so no return value needed to be captured in a variable here
  */
  array.splice(deleteUserIndex, 1); // <-- start at the index of the target element and delete 1 thing (the target element)

  // confirm that item was removed by logging the array, once we know it's working, we can remove this
  console.log(array);

  // finally, overwrite the old file contents with the new updated array by stringifying (converting to JSON) and writing the array to the file
  fs.writeFileSync("./data.json", JSON.stringify(array));

  // don't forget to finish the HTTP interaction (usually we would send back a redirect or a refresh response)
  res.end();
});

// -------------------------------
// START LISTEN

// initialize listening on specified port
const port = 3000;
app.listen(port, () => {
  console.log("listening on port " + port);
});
