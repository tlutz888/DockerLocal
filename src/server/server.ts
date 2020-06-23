//https://medium.com/@muravitskiy.mail/cannot-redeclare-block-scoped-variable-varname-how-to-fix-b1c3d9cc8206
export { };
import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
const express = require('express');
const path = require('path');
// const passportSetup = require('./config/passport-setup');
const passport = require('passport');
const cookieParser = require('cookie-parser');
require('dotenv/config');

const app = express();

console.log('inside of server.ts')
// Bring in routes
// const authRoute = require('./routes/auth-route');
// const apiRoute = require('./routes/api-route');

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(cookieParser());

// Use routes
// app.use('/auth', authRoute);
// app.use('/api', apiRoute);


// Home endpoint
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, '../../src/index.html'));
});

//Handle redirections
app.get('*', (req: Request, res: Response) => {
  console.log('HERE HERE', req.cookies)
  res.sendFile(path.resolve(__dirname, '../../src/index.html'));
});



// Global Error handler
app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  // Set up default error
  const defaultError = {
    log: 'Error caught in global error handler',
    status: 500,
    msg: {
      err: 'Check logs for more information',
    },
  };

  // Update default error message with provided error if there is one
  const output = Object.assign(defaultError, err);

  res.send(output);
});

const PORT = 3001;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));