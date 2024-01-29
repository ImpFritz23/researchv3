const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const secret = require("../config/auth.config.js");

const db = mysql.createConnection(require("../config/db.config.js"));

const authJwt = require("../middleware/");

module.exports = function(app) {
    
    app.use(function(req, res, next) {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });

    app.use(bodyParser.json());

    app.get('/api/term/public', (req, res) => {
        
        res.json({ message: 'API Term Public access ...' });
    });

    app.get('/api/terms', authJwt.AuthenticateToken, (req, res) => {
 
        try {
            
            db.query('SELECT * FROM terms', (err, result) => {
                
                if (err) {
                    console.error('Error fetching items:', err);
                    res.status(500).json({ message: 'Error fetching items' });
                } else {
                   
                    return res.send(result);
                }
            });
        
        } catch (error) {
            
            console.error('Error loading users:', error);
            res.status(500).json({ error: 'Error loading users' });
        }
    });

};