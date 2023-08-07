import 'path';
import { fileURLToPath } from 'url';
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import influencerRouter from './routes/influencer.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/influencer', influencerRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// start the Express server
app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});

// module.exports = app;

export default app;
