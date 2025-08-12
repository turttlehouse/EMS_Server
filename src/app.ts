import express from 'express';
import { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import './database/connection';
import adminSeeder from './adminSeeder';

// importing Routes
import authRoute from './routes/authRoute/authRoute';
import userRoute from './routes/userRoute/userRoute';
import testRoute from './routes/testRoute/testRoute';
import questionRoute from './routes/questionRoute/questionRoute';

const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

//middleware to parse JSON request bodies
app.use(express.json());

adminSeeder();

// mounting API routes
app.use('/api/auth',authRoute)
app.use('/api',userRoute)
app.use('/api',testRoute)
app.use('/api',questionRoute)

app.get('/', (req: Request, res: Response) => {
    res.send('server connected successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});