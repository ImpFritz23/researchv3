const express = require('express');

const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const app = express();

const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 3000;

const secretKey = 'fritz-secret-key';

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'mydatabase',
});

db.connect((err) => {
  
    if (err) {
        console.error('Error connecting to MySQL:', err);
    } else {
        console.log('Connected to MySQL');
    }
});

app.use(bodyParser.json());

require('./app/routes/user')(app);

app.post('/register', async (req, res) => {
  
    try {
    
        const {name, username, password} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const insertUserQuery = 'INSERT INTO users (name, username, password) VALUES (?, ?, ?)';
        await db.promise().execute(insertUserQuery, [name, username, hashedPassword]);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
    
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/login', async (req, res) => {

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

    const token = jwt.sign({ userId: user.id, username: user.username }, secretKey, { expiresIn: '1h' });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/public', (req, res) => {
    
    res.json({ message: 'Public access ...' });
});

app.get('/protected', authenticateToken, (req, res) => {
    
    res.json({ message: 'Protected route accessed successfully' });
});

function authenticateToken(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, secretKey, (err, user) => {
    
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        req.user = user;
        next();
    });
}

app.get('/users', authenticateToken, (req, res) => {
    
    try {
    
        db.query('SELECT id, name, username FROM users', (err, result) => {
        
            if (err) {
                console.error('Error fetching items:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });

    } catch (error) {
    
        console.error('Error loading users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/user/:id', authenticateToken, (req, res) => {
    
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

app.delete('/user/:id', authenticateToken, (req, res) => {
    
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

app.put('/user/:id', authenticateToken, async (req, res) => {

    let user_id = req.params.id;

    const {name, username, password} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    if (!user_id || !name || !username || !password) {
        return res.status(400).send({ error: user, message: 'Please provide name, username and password' });
    }

    try {
    
        db.query('UPDATE users SET name = ?, username = ?, password = ? WHERE id = ?', [name, username, hashedPassword, user_id], (err, result, fields) => {
        
            if (err) {
                console.error('Error updating item:', err);
                res.status(500).json({ message: 'Internal Server Error' });
            } else {
                res.status(200).json(result);
            }
        });

    } catch (error) {
    
        console.error('Error loading user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

    res.json({user_id, name, username, hashedPassword});

});



// app.get('/public_users', (req, res) => {
 
//     try {
    
//         db.query('SELECT id, name, username FROM users', (err, result) => {
        
//             if (err) {
//                 console.error('Error fetching items:', err);
//                 res.status(500).json({ message: 'Internal Server Error' });
//             } else {
           
//                 return res.send(result);
//             }
//         });

//     } catch (error) {
    
//         console.error('Error loading users:', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

app.listen(PORT, () => {
    
    console.log(`Server is running on http://localhost:${PORT}`);
});
