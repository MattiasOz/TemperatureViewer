const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors({
  origin: '*',
}));

const sequelize = new Sequelize('temperature_database', 'bob', 'bob', 
  {
    host: 'database',
    dialect: 'mysql'
  }
);

sequelize.authenticate()
  .then( () => console.log('Database connected...'))
  .catch( err => console.log('Error: ' + err));

app.get('/', (req, res) => res.send('Hello World!'));


const Entry = sequelize.define(
  'Entry',
  {
    time: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    temperature: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    humidity: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    perceived_temperature: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }
);

sequelize.sync()
  .then(() => console.log('Database synced...'))
  .catch(err => console.log('Failed database sync: ' + err));

app.post(
  '/entries', 
  async (req, res) => {
    try {
      const { time, temperature, humidity, perceived_temperature } = req.body;
      const newEntry = await Entry.create({time, temperature, humidity, perceived_temperature});
      res.status(201).json(newEntry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'failed to create a new entry\n' + error});
    }
  }
)

app.get(
  '/entries',
  async (req, res) => {
    try {
      const entries = await Entry.findAll();
      res.status(200).json(entries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'failed to get entries\n' + error});
    }
  }
)

// insertIntoDb(2525);
// getDb();

app.listen(port, () => console.log('Server running on port ${port}'));
