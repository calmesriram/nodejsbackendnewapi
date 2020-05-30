const express = require("express");
const bodyparser = require("body-parser");
const cors = require("cors");
const cloudinary = require('cloudinary').v2;
const dotent = require('dotenv')
const newssch = require('./schema/news')
const app = express();
const path = require("path");
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
const upload = require('./multerconfig');
dotent.config();
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

mongoose.Promise = global.Promise;
mongoose.connection.on('connected', function () {
    console.log('Connection to Mongo established.');
    if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
        mongoose.connection.db = mongoose.connection.client.db(process.env.DBNAME);
    }
});
mongoose.connect(process.env.MONGODBURL, { dbName: process.env.DBNAME, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false, useUnifiedTopology: true }).catch(err => {
    if (err) {

        console.log("TEST", err)
        return err;
    }
})

app.get("/", (req, res) => {
    res.json("Connected");
    res.end();
});

app.post("/addnews", upload.single('file'), (req, res) => {
    let myarray = [];
    // console.log(JSON.parse(req.body.pdata))
    myarray.push(JSON.parse(req.body.pdata));
    console.log(myarray, "sriram aray")

    if (!req.file) {
        res.status(500);
        res.json('file not found');
    }
    cloudinary.uploader.upload(req.file.path, (err, data) => {
        if (err) {
            console.log("err on cloudinary", err)
            res.end();
        }
        if (data) {
            // console.log(data)
            news = new newssch({

                newsid: (myarray[0].title).substring(0, 3) + Date.now(),
                title: myarray[0].title,
                description: myarray[0].description,
                imageid: data["public_id"],
                tags: myarray[0].tag,
                imageurl: data["secure_url"],
                imagedet: data
            });

            news.save().then(result => {
                res.json({ "status": true, "msg": "Record Insertion Success" });
                res.end();
            }).catch(e => {
                console.log(e)
                res.json({ "status": false, "msg": "Record Insertion UnSuccess", "Error": e });
                res.end();
            })
        }
    })


})

app.get('/allnews', (req, res) => {
    newssch.find().then(result => {
        // console.log(result)
        res.json({ "status": true, "data": result });
        res.end();
    }).catch(e => {
        console.log(e)
        res.json({ "status": false, "Error": e });
        res.end();
    });
})

app.put("/updatenews", upload.single('file'), (req, res) => {
    let myarray = [];
    // console.log(JSON.parse(req.body.pdata))
    myarray.push(JSON.parse(req.body.pdata));
    // console.log(myarray, "sriram aray")

    if (!req.file) {
        newssch.findOneAndUpdate(
            { "newsid": myarray[0].newsid },
            {
                "title": myarray[0].title,
                "tags": myarray[0].tag,
                "description": myarray[0].description
            }).then(result => {
                res.json({ "status": true, "msg": "Record updation Success" });
                res.end();
            }).catch(e => {
                console.log(e)
                res.json({ "status": false, "msg": "Record updation UnSuccess", "Error": e });
                res.end();
            })
    }
    if (req.file) {
        cloudinary.uploader.upload(req.file.path, (err, data) => {
            if (err) {
                res.json({ "status": false, "msg": "Error on Cloudinary" });
                res.end();
            }
            if (data) {
                newssch.findOneAndUpdate(
                    { "newsid": myarray[0].newsid },
                    {
                        "title": myarray[0].title,
                        "tags": myarray[0].tag,
                        "description": myarray[0].description,
                        "imageid": data["public_id"],
                        "imageurl": data["secure_url"],
                        "imagedet": data
                    }).then(result => {
                        res.json({ "status": true, "msg": "Record updation Success" });
                        res.end();
                    }).catch(e => {
                        console.log(e)
                        res.json({ "status": false, "msg": "Record updation UnSuccess", "Error": e });
                        res.end();
                    })
            }
        })
    }


})

app.delete('/deletenews/:newsid', (req, res) => {
    newssch.findOneAndDelete({ "newsid": req.params.newsid })
        .then(result => {
            console.log(result)
            res.json({ "status": true, "msg": "News Deleted Successfully" });
            res.end();
        }).catch(e => {
            console.log(e)
            res.json({ "status": false, "Error": e });
            res.end();
        });
})
var port = process.env.PORT || 3000;
app.listen(port, (err) => {
    if (!err) {
        console.log("Port is Listening on " + port);
    }
    return err;

})
