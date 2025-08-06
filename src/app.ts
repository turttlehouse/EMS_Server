import express from 'express';
import { Application, Request, Response } from 'express';
const app: Application = express();
const PORT: number = 5000;


app.get('/', (req: Request, res: Response) => {
    res.send('server connected successfully!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});