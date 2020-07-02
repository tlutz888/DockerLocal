//https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
export {};
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
const express = require("express");
const path = require("path");
const passportSetup = require("../../src/server/config/passport-setup");
const passport = require("passport");
require("dotenv/config");
const app = express();
const cookieParser = require("cookie-parser");

const apiController = require("./controllers/apiController");
const authController = require("./controllers/authController");
const gitController = require("./controllers/gitController");
const sshKeyController = require("./controllers/sshKeyController");


const cors = require('cors')
app.use(cors())

// Bring in routes
const authRoute = require("../../src/server/routes/auth-route");
const apiRoute = require("../../src/server/routes/api-route");

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cookieParser());

// Use routes
app.use("/auth", authRoute);
app.use("/api", apiRoute);

// Serve static files
app.use(express.static("assets"));

// Home endpoint
app.post("/write",   
authController.getNameAndTokenFromCookies,
apiController.getUserRepos,
sshKeyController.createSSHkey,
sshKeyController.addSSHkeyToGithub,
gitController.cloneRepo,
sshKeyController.deleteSSHkey,
(req: Request, res: Response) => res.status(200).json(res.locals.repos)

);

// Handle redirections
app.get("*", (req: Request, res: Response) => res.sendStatus(200));

// Failed auth redirect
app.get("/fail", (req: Request, res: Response) =>
  res.status(200).send("❌ FAILURE TO AUTHENTICATE ❌")
);

// Global Error handler
app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    // Set up default error
    const defaultError = {
      log: "Error caught in global error handler",
      status: 500,
      msg: {
        err: err,
      },
    };

    // Update default error message with provided error if there is one
    const output = Object.assign(defaultError, err);
    res.send(output);
  }
);

const PORT = 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
