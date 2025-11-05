import mongoose from 'mongoose';


const transactionSchema = new mongoose.Schema({
userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
type: { type: String, enum: ['income','expense'], required: true },
category: { type: String, default: '' },
amount: { type: Number, required: true },
note: { type: String, default: '' },
period: { type: String, enum: ['monthly','yearly'], default: 'monthly' },
month: { type: Number, required: true },
year: { type: Number, required: true },
createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Transaction', transactionSchema);