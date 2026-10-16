const express = require("express");
const DBMSconnection = require("./db/db.config");
const routes = require("./routes/mainroutes");
const errorHandler = require("./middleware/error");
const PORT = process.env.PORT || 3000;
const cors = require("cors");

const app = express();

app.use(cors());

// Body parser middleware. we need to wrap all our middlewares inside app.use(middleware) to use them.
app.use(express.json()); // being able to submit raw json. Parses json data sent through the body.
app.use(express.urlencoded({ extended: false })); // this will allow us to send a form data from html.

// Routes
app.use("/api/chat/conversations", routes); //Express prefixes all routes inside that router with /api/chat/conversations. telling the router its root is /api/chat/conversations.

//Error handler middleware
app.use(errorHandler); //use the errorHandler bellow the routes to avoid conflicts.

async function startServer() {
  try {
    const connection = await DBMSconnection.getConnection();
    connection.release();
    console.log("database connected");

    app.listen(PORT, (err) => {
      if (err) {
        throw err;
      }
      console.log(`server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1); // <— important
  }
}

startServer();
