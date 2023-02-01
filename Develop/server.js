
const express = require('express');

const path = require('path');
const PORT = "3001";
const app = express();

const fs = require('fs');

app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(express.static('public'));

let id = 1;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index'));
});

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/notes.html"));
});

app
    .route("/api/notes") 
    .get((req, res) => {res.sendFile(path.join(__dirname, "./db/db.json"))})
    .post((req, res) => {
        console.info(`{req.method} request recieved to add a note`)
        // console.info(req.body);

        let dbArrayRaw = fs.readFileSync("./db/db.json");
        let dbArray = JSON.parse(dbArrayRaw);
        // console.log(dbArray);
        

        const { title, text } = req.body;
        
        let newNote;
        if (title && text){
                newNote = {
                title,
                text,
                id
            };
        };

        dbArray.push(newNote);
        // console.log(dbArray);
        const StringifiedArray = JSON.stringify(dbArray);

        fs.writeFile('./db/db.json', StringifiedArray, (err) => {
            err 
                ? console.error(err)
                : console.log(`New note added to database`);
        });
        res.json(newNote);
        id += 1;
    }); 

app.delete(`/api/notes/:id`,(req, res) => {
    let dbArrayRaw = fs.readFileSync("./db/db.json");
    let dbArray = JSON.parse(dbArrayRaw);

    let filteredArray = [];

    for (i=0; i < dbArray.length; i++){
        if (dbArray[i].id != req.params.id){
            filteredArray.push(dbArray[i]);
        };
    };


    let StringifiedArray = JSON.stringify(filteredArray);

    fs.writeFile('./db/db.json', StringifiedArray, (err) => {
        err 
            ? console.error(err)
            : console.log(`note deleted`);
    });
    res.sendStatus(200);
})

app.listen(PORT, () =>{
    console.log(`app listening at port: ${PORT}`);
});