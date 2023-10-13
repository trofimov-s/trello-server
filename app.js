const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cookieParser());
app.use(express.json());

app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));

const authRouter = require('./routes/auth');
app.use('/api', authRouter);

// ERROR HANDLER
app.use((error, req, res, next) => {
  console.log('error', error);
  const status = error.statusCode || 500;
  const message = error.message || 'Something went wrong';

  res.status(status).json({ message });
});

// DATABASE CONNECTION AND APP RUNNING
mongoose
  .connect(process.env.MONGO_DB_LINK)
  .then(() => {
    console.log('Database connected successfully!');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch(() => console.log('Wrong database connection!'));
