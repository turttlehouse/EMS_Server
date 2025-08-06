import express from 'express';
import { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import './database/connection';


const app: Application = express();
const PORT: number = Number(process.env.PORT) || 5000;

app.get('/', (req: Request, res: Response) => {
    res.send('server connected successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});