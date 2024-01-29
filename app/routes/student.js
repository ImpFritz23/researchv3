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

    app.get('/api/student/public', (req, res) => {
        
        res.json({ message: 'API Student Public access ...' });
    });

    app.get('/api/student/statements', authJwt.AuthenticateToken, (req, res) => {
 
        try {
            
            db.query('SELECT * FROM statements', (err, result) => {
                
                if (err) {
                    console.error('Error fetching statements:', err);
                    res.status(500).json({ message: 'Error fetching statements' });
                } else {
                   
                    return res.send(result);
                }
            });
        
        } catch (error) {
            
            console.error('Error loading statements:', error);
            res.status(500).json({ error: 'Error loading statements' });
        }
    });

    app.get('/api/student/sub_indicators', (req, res) => {
 
        try {
            
            db.query('SELECT * FROM sub_indicators', (err, result) => {
                
                if (err) {
                    console.error('Error fetching sub_indicators:', err);
                    res.status(500).json({ message: 'Error fetching sub_indicators' });
                } else {
                   
                    return res.send(result);
                }
            });
        
        } catch (error) {
            
            console.error('Error loading sub_indicators:', error);
            res.status(500).json({ error: 'Error loading sub_indicators' });
        }
    });

    app.get('/api/student/indicators', (req, res) => {
 
        try {
            
            db.query('SELECT * FROM indicators', (err, result) => {
                
                if (err) {
                    console.error('Error fetching indicators:', err);
                    res.status(500).json({ message: 'Error fetching indicators' });
                } else {
                   
                    return res.send(result);
                }
            });
        
        } catch (error) {
            
            console.error('Error loading indicators:', error);
            res.status(500).json({ error: 'Error loading indicators' });
        }
    });

};