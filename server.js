const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;



require('./app/routes/user')(app);
require('./app/routes/term')(app);
require('./app/routes/teacher')(app);
require('./app/routes/student')(app);



app.get('/', (req, res) => {
    res.json({ message: 'Restful API Backend Using ExpressJS' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
