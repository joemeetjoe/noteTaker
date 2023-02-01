// express requirements
const express = require('express');
// path requirements, because we are targetting outside the public file
const path = require('path');
// defining the port to listen to
const PORT = "3001";
// epress requirements
const app = express();
// file system requirements
const fs = require('fs');
// express middleware, and targetting the public folder
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

// ticker for the IDs that will be used
let id = 1;
// this is for the fetching of the home page.
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index'));
});
// this is for navigating to the notes page
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"));
});
// interacting with the database to get, post, and delete
app
    .route("/api/notes") 
    // fetches the data from the database
    .get((req, res) => {res.sendFile(path.join(__dirname, "./db/db.json"))})
    // posts data from the user
    .post((req, res) => {
        // adding some feedback to let the user know that the backend has recieved the info
        console.info(`{req.method} request recieved to add a note`)
        
        // pulling the array from the current database and parsing it
        let dbArrayRaw = fs.readFileSync("./db/db.json");
        let dbArray = JSON.parse(dbArrayRaw);
        
        // pulling the values needed out of the data sent from the user
        const { title, text } = req.body;
        // making a new object with the new notes, and an id from the ticker
        let newNote;
        if (title && text){
                newNote = {
                title,
                text,
                id
            };
        };
        // pushing the new data to the existing array and stringifying it
        dbArray.push(newNote);
        const StringifiedArray = JSON.stringify(dbArray);
        //overwrite the exsiting file to the database, tick up the id by 1, and return to the front end so processes can continue
        fs.writeFile('./db/db.json', StringifiedArray, (err) => {
            err 
                ? console.error(err)
                : console.log(`New note added to database`);
        });
        res.json(newNote);
        id += 1;
    }); 

// delete call for specific ids
app.delete(`/api/notes/:id`,(req, res) => {
    // pulling the array from the existing database and parsing it
    let dbArrayRaw = fs.readFileSync("./db/db.json");
    let dbArray = JSON.parse(dbArrayRaw);
    
    // setting an empty global variable
    let filteredArray = [];
    // for the length of the existing array, push everything that does not match with the one the user intended to delete
    // and push that to a fresh array.
    for (i=0; i < dbArray.length; i++){
        if (dbArray[i].id != req.params.id){
            filteredArray.push(dbArray[i]);
        };
    };
    // stringify the fresh array
    let StringifiedArray = JSON.stringify(filteredArray);
    // overwite the existing file and return a status so the front end can continue processes
    fs.writeFile('./db/db.json', StringifiedArray, (err) => {
        err 
            ? console.error(err)
            : console.log(`note deleted`);
    });
    res.sendStatus(200);
})
// listen to the correct port
app.listen(PORT, () =>{
    console.log(`app listening at port: ${PORT}`);
});