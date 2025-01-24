const express = require("express");
require('./config/dbConfig');
const bodyParser = require('body-parser');
const userRouter = require("./routers/userRouter");
const transactionRouter = require("./routers/transactionRouter");
const adminRouter = require("./routers/adminRouter");
const messageRouter = require("./routers/messageRouter");
const cors = require('cors');

const app = express()

app.use(cors("*"))

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    return res.send("Welcome to The Banking World!");
})

app.use(userRouter);
app.use (transactionRouter);
app.use(adminRouter);
app.use(messageRouter);


// Add error handling middleware for JSON parsing errors
app.use((err, req, res, next) => { 
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        // Handle JSON parsing error
        return res.status(400).json({ error: 'Invalid JSON' });
    }
    res.status(500).json({ message: 'Internal Server Error: ' + err });
    next();
});

const PORT = process.env.PORT;

app.listen(PORT,() => {
    console.log(`Server is Listening on port: ${PORT}`);
})
