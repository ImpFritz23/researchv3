// const express = require('express');

// const mysql = require('mysql2');
// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcrypt');

const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLNonNull } = require('graphql');
const mysql = require('mysql2/promise');

// Create MySQL connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'graphql',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Define the GraphQL types
const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
      id: { type: GraphQLString },
      name: { type: GraphQLString },
      username: { type: GraphQLString },
    }),
});

// Define the root query
const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
      users: {
        type: new GraphQLList(UserType),
        resolve: async () => {
          const [rows] = await pool.query('SELECT * FROM users');
          return rows;
        },
      },
    },
  });

// Define the root mutation
const RootMutation = new GraphQLObjectType({
    name: 'RootMutation',
    fields: {
      addUser: {
        type: UserType,
        args: {
          name: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (parent, args) => {
          const [result] = await pool.query('INSERT INTO users (name, email) VALUES (?, ?)', [args.name, args.email]);
          const [user] = await pool.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
          return user[0];
        },
      },
    },
});

// Create the schema
const schema = new GraphQLSchema({
    query: RootQuery,
    mutation: RootMutation,
});

// Create the Express server
const app = express();

// Set up GraphQL route
app.use(
    '/graphql',
    graphqlHTTP({
      schema: schema,
      graphiql: true,
    })
);

const bodyParser = require('body-parser');

// const app = express();
const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json());

app.get('/public', (req, res) => {
    res.json({ message: 'ExpressJS Backend Using ExpressJS...' });
});

app.get('/test', (req, res) => {
    res.json({ message: 'ExpressJS Backend Using ExpressJS...' });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// comment