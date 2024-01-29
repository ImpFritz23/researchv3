const jwt = require("jsonwebtoken");
const secret = require("../config/auth.config.js");

const AuthenticateToken = (req, res, next) => {
    
    const token = req.headers.authorization;
    
    if (!token) {
        
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, secret.secretKey, (err, user) => {
    
        if (err) {
            return res.status(403).json({ error: 'Forbidden' });
    }

    req.user = user;

    next();

    });
}

module.exports = {

    AuthenticateToken
}; 