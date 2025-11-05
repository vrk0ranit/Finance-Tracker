import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import transactions from './routes/transactions.js';


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log('MongoDB connected'))
.catch(e=>console.error('Mongo error', e.message));


app.use('/api/transactions', transactions);


const PORT = process.env.PORT || 5000;
app.listen(PORT, ()=>console.log('Server running on', PORT));