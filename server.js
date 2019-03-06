const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const users = require('./routes/api/users');
const profile = require('./routes/api/profile');
const posts = require('./routes/api/posts');

const app = express();

const db = require('./config/keys').mongoURI;

//body-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
  .connect(db)
  .then(() => console.log('Connected successfully!'))
  .catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Hello Developer, Welcome to devConnector!');
});

//use routes
app.use('/api/users', users);
app.use('/api/profile', profile);
app.use('/api/posts', posts);

const port = process.env.port || 5000;
app.listen(port, () => console.log(`Service running on port: ${port}`));
