import bodyParser from "express";
import databaseConnections from "./services/database";
import router from "./routes";
import cors from "cors";

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
databaseConnections.connectToDatabase();
const app = express();
app.use(logger('dev'));
app.use(express.json())
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(router);
app.set('view engine', 'jade');

process.once('SIGUSR2', async () => {
  await databaseConnections.closeDatabaseConnection();
  process.kill(process.pid, 'SIGUSR2');
});

process.on('SIGINT', async () => {
  await databaseConnections.closeDatabaseConnection();
  process.exit();
});

app.use(function (req, res, next) {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    status: "error",
    message: err.message,
    errors: err.errors,
  });
});


module.exports = app;
