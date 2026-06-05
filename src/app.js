const express = require('express');
const app = express();
const quizRouter = require("./routes/quiz");
const authRouter = require("./routes/auth");
const path = require("path");
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./lib/errors');
const pinoHttp = require("pino-http");
const logger = require("./lib/logger");

app.use(pinoHttp({logger,
  autoLoggin: {ignore: req => req.url.startsWith("/uplodas")}
}))
app.use(express.static(path.join(__dirname, "..","public")));


// Middleware to parse JSON bodies (will be useful in later steps)
app.use(express.json());
// Routes
app.use("/api/auth",authRouter);
app.use("/api/quiz", quizRouter);

app.use((req,res) =>{
    throw new NotFoundError();
})

app.use(errorHandler);

module.exports = app;
