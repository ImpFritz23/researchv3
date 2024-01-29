const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const { Sequelize } = require('sequelize');
const { DataTypes } = require('sequelize');

const sequelize = new Sequelize('research', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

const Role = sequelize.define('Role', {
    role_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
});

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
    console.log('Database synced');
});

app.get('/roles', async (req, res) => {
    try {
      const roles = await Role.findAll({attributes: ['id', 'role_code', 'role_name']});
      res.json(roles);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
});

app.post('/tasks', async (req, res) => {
    try {
      const { title, description } = req.body;
      const task = await Task.create({ title, description });
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
});
  
app.get('/tasks', async (req, res) => {
    try {
      const tasks = await Task.findAll();
      res.json(tasks);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
});
  
app.put('/tasks/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).send('Task not found');
      }
      task.title = title;
      task.description = description;
      await task.save();
      res.json(task);
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
});
  
app.delete('/tasks/:id', async (req, res) => {

    try {
      const { id } = req.params;
      const task = await Task.findByPk(id);
      if (!task) {
        return res.status(404).send('Task not found');
      }
      await task.destroy();
      res.send('Task deleted successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server Error');
    }
});

app.get('/', (req, res) => {
    res.json({ message: 'ExpressJS Restful API Backend Sequelize ORM' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
