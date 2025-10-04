require('dotenv').config();
const connectDB = require('./config/db');
const app = require('./app');


const port = process.env.PORT || 4000;


(async () => {
await connectDB(process.env.MONGODB_URI);
app.listen(port, () => console.log(`🚀 API on http://localhost:${port}`));
})();