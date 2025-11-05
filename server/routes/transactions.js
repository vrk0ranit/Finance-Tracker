import express from 'express';
import * as ctrl from '../controllers/transactionsController.js';
const router = express.Router();


router.post('/income', ctrl.addIncome);
router.post('/expense', ctrl.addExpense);
router.get('/current', ctrl.getCurrent);
router.post('/insight', ctrl.insight);


// dev-only reset
router.delete('/reset', ctrl.resetAll);


export default router;