const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const postRouter=require('./routes/posts');
const userRouter=require('./routes/user');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//it allows use to access the /images folder using static
//means url of /images would be redirected to backend/images
app.use("/images", express.static(path.join("backend/images")));

mongoose.connect('mongodb://localhost/post', { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => { console.log("connected") });


//this code is wriiten to disable CORS(cross-origin-resource-sharing)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-Width, Content-Type, authorization, Accept"//here the authorization header is the header we added in auth-interceptor.ts 
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS "
    );
    next();

})

app.use("/api/posts",postRouter);
app.use("/api/user",userRouter);


module.exports = app
