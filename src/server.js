import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import postRouter from "./api/blog/index.js";
import usersRouter from "./api/user/index.js";
import passport from "passport";
import googleStrategy from "./lib/auth/google.js";
import {
  forbiddenErrorHandler,
  genericErroHandler,
  notFoundErrorHandler,
  unauthorizedErrorHandler,
} from "./errorHandles.js";

const server = express();
const port = process.env.PORT || 3001;
passport.use("google", googleStrategy);

//.....................middleware......................
server.use(cors());
server.use(express.json());
server.use(passport.initialize());
///........................endpoints...................

server.use("/post", postRouter);
server.use("/user", usersRouter);
////......................Errrorhandlers..............
server.use(notFoundErrorHandler);
server.use(unauthorizedErrorHandler);
server.use(forbiddenErrorHandler);
server.use(genericErroHandler);

mongoose.connect(process.env.MONGOOSE_URL);

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server is running on port ${port}`);
  });
});
