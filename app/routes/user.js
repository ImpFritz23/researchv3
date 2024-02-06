const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const secret = require("../config/auth.config.js");

const db = mysql.createPool(require("../config/db.config.js"));

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

    app.get('/api/user/public', (req, res) => {
        
        res.json({ message: 'API User Public access ...' });
    });

    app.get('/api/users', authJwt.AuthenticateToken, (req, res) => {
 
        try {
            
            db.query('SELECT id, name, username FROM users', (err, result) => {
                
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

    app.get('/api/user/:id', authJwt.AuthenticateToken, (req, res) => {
    
        let user_id = req.params.id;
    
        if (!user_id) {
            return res.status(400).send({ error: true, message: 'Please provide user_id' });
        }
        
        try {
        
            db.query('SELECT id, name, username FROM users WHERE id = ?', user_id, (err, result) => {
            
                if (err) {
                    console.error('Error fetching items:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result);
                }
            });
    
        } catch (error) {
        
            console.error('Error loading user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.put('/api/user/:id', authJwt.AuthenticateToken, async (req, res) => {

        let user_id = req.params.id;
    
        const {name, username, password, role_id} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
    
        if (!user_id || !name || !username || !password) {
            return res.status(400).send({ error: user, message: 'Please provide name, username and password' });
        }
    
        try {
        
            db.query('UPDATE users SET name = ?, username = ?, password = ?, role_id = ? WHERE id = ?', [name, username, hashedPassword, role_id, user_id], (err, result, fields) => {
            
                if (err) {
                    console.error('Error updating item:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result);
                }
            });
    
        } catch (error) {
        
            console.error('Error loading user:', error);
            res.status(500).json({ error: 'Internal Server ErrorX' });
        }
    });

    app.delete('/api/user/:id', authJwt.AuthenticateToken, (req, res) => {
    
        let user_id = req.params.id;
    
        if (!user_id) {
            return res.status(400).send({ error: true, message: 'Please provide user_id' });
        }
        
        try {
        
            db.query('DELETE FROM users WHERE id = ?', user_id, (err, result, fields) => {
            
                if (err) {
                    console.error('Error deleting item:', err);
                    res.status(500).json({ message: 'Internal Server Error' });
                } else {
                    res.status(200).json(result);
                }
            });
    
        } catch (error) {
        
            console.error('Error loading user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/api/user', async (req, res) => {
  
        try {
        
            const {name, username, password, role_id} = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
    
            const insertUserQuery = 'INSERT INTO users (name, username, password, role_id) VALUES (?, ?, ?, ?)';
            await db.promise().execute(insertUserQuery, [name, username, hashedPassword, role_id,]);
    
            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
        
            console.error('Error registering user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    app.post('/api/user/login', async (req, res) => {

        try {
          const { username, password } = req.body;
      
          const getUserQuery = 'SELECT * FROM users WHERE username = ?';
          const [rows] = await db.promise().execute(getUserQuery, [username]);
      
          if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
          }
      
          const user = rows[0];
          const passwordMatch = await bcrypt.compare(password, user.password);
      
          if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
          }
      
          const token = jwt.sign({ id: user.id, username: user.username, name: user.name }, secret.secretKey, { expiresIn: '1h' });
      
          res.status(200).json({token});
      
        } catch (error) {
            
            console.error('Error logging in user:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

    // app.get('/api/userss', (req, res) => {
 
        

    //     res.json("Test");
    // });
};