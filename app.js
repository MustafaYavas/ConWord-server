require('dotenv').config()
const express = require('express');
const fileUpload = require('express-fileupload');
const convertapi = require('convertapi')(process.env.API_KEY);
const open = require('open');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 5000;

app.use(fileUpload());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.post('/upload', (req, res) => {
    if (req.files === null) return res.status(400).json({ msg: 'No file uploaded' });

    if (!fs.existsSync(__dirname+'/public')) {
        fs.mkdirSync(__dirname+'/public');
        fs.mkdirSync(__dirname+'/public/uploads');
        fs.mkdirSync(__dirname+'/public/outputs');
    }

    const file = req.files.file;
    
    file.mv(`${__dirname}/public/uploads/${file.name}`, err => {
        if (err) {
            console.error(err);
            return res.status(500).send(err);
        }

        res.json({ msg: 'File moved!' });
    });

    convertapi.convert('pdf', { File: path.resolve(`${__dirname}/public/uploads/${file.name}`) })
    .then(function(result) {
        open(result.file.url)
        return result.file.save(path.resolve(`${__dirname}/public/outputs/${file.name.split('.')[0]}.pdf`));
    })
    .then(function(file) {
        console.log('File saved!');
    })
    .catch(function(e) {
        console.error(e.toString());
    });

});


app.listen(port, () => {
    console.log(`Server is up on port: ${port}`)
})