const express = require('express')
const app = express()
const server = require("http").createServer(app);
const authRoute = require('./Routes/Auth')
const productsRoute = require('./Routes/Products')
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
app.use('/auth' , authRoute)
app.use('/products' , productsRoute )

server.listen(3000 , ()=> console.log('connect'))