const express = require('express')
const app = express()
const server = require("http").createServer(app);
const mongoose = require("mongoose");
const cors = require("cors");
const env = require("dotenv");
env.config();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017',{
    useNewUrlParser:true,
    useUnifiedTopology:true
  } ,() => {
    console.log("connect to db");
  });
app.get('/',(req , res)=>{
    return res.send('hi')
} )


server.listen(3000 , ()=> console.log('connect'))