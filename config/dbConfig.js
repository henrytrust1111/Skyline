const mongoose = require('mongoose');
require("dotenv").config();

const url = process.env.MONGO_URI;

mongoose.connect(url)
.then(() => {
    console.log('Connection to database successfully established');
})
.catch ((error) => {
    console.log("Error connecting to database: ", error.message);
})