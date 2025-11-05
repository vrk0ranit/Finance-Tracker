import cron from 'node-cron';
import Transaction from '../models/Transaction.js';


cron.schedule('0 2 1 * *', async ()=>{ // 02:00 AM on 1st of each month
try {
const now = new Date();
const prev = new Date(now.getFullYear(), now.getMonth()-1, 1);
const month = prev.getMonth()+1; const year = prev.getFullYear();
const rows = await Transaction.find({ month, year });
// TODO: Move to S3 or `archive` collection. For now just log count
console.log('Archiving', rows.length, 'transactions for', month, year);
// Optionally: await Archive.insertMany(rows); await Transaction.deleteMany({ month, year });
} catch (err) { console.error('Archive job failed', err); }
});