import React, { useState, useEffect } from 'react';
import api from './api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomePeriod, setIncomePeriod] = useState('monthly');
  const [expense, setExpense] = useState({ category: '', amount: '', note: '' });
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch transactions on mount
  useEffect(() => {
    fetchCurrent();
  }, []);

  const fetchCurrent = async () => {
    try {
      const res = await api.get('/api/transactions/current');
      setTransactions(res.data);
    } catch (e) {
      console.error(e);
      alert('⚠️ Backend not reachable. Please start your server.');
    }
  };

  const addIncome = async () => {
    if (!incomeAmount) return alert('Please enter income amount.');
    try {
      await api.post('/api/transactions/income', {
        amount: Number(incomeAmount),
        period: incomePeriod,
      });
      setIncomeAmount('');
      fetchCurrent();
    } catch (e) {
      console.error('Add Income Error:', e);
      alert('Failed to add income.');
    }
  };

  const addExpense = async () => {
    if (!expense.category || !expense.amount)
      return alert('Please fill category and amount.');
    try {
      await api.post('/api/transactions/expense', {
        category: expense.category,
        amount: Number(expense.amount),
        note: expense.note,
      });
      setExpense({ category: '', amount: '', note: '' });
      fetchCurrent();
    } catch (e) {
      console.error('Add Expense Error:', e);
      alert('Failed to add expense.');
    }
  };

  const getInsight = async () => {
    setLoading(true);
    setInsight('');
    try {
      const res = await api.post('/api/transactions/insight');
      setInsight(res.data.insight);
    } catch (e) {
      console.error('AI Error:', e);
      alert('AI insight generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const categories = [
    ...new Set(transactions.filter((t) => t.type === 'expense').map((t) => t.category)),
  ];

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Expenses',
        data: categories.map((c) =>
          transactions
            .filter((t) => t.type === 'expense' && t.category === c)
            .reduce((sum, t) => sum + t.amount, 0)
        ),
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Expense Breakdown by Category' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
        {/* Header */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-blue-600 mb-6 flex justify-center items-center gap-2 flex-wrap">
          💰 Personal Finance Tracker
        </h1>

        {/* Summary Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-100 p-4 rounded-xl mb-6 shadow-sm text-center">
          <p className="text-green-600 font-semibold text-lg">
            Income: ₹{totalIncome.toLocaleString()}
          </p>
          <p className="text-red-600 font-semibold text-lg">
            Expense: ₹{totalExpense.toLocaleString()}
          </p>
          <p
            className={`font-semibold text-lg ${
              balance >= 0 ? 'text-green-700' : 'text-red-700'
            }`}
          >
            Balance: ₹{balance.toLocaleString()}
          </p>
        </div>

        {/* Income Section */}
        <div className="mb-8 bg-green-50 p-5 rounded-xl shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-green-700 mb-4">🟢 Add Income</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="number"
              placeholder="Income Amount"
              value={incomeAmount}
              onChange={(e) => setIncomeAmount(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full sm:w-40"
            />
            <select
              value={incomePeriod}
              onChange={(e) => setIncomePeriod(e.target.value)}
              className="border px-3 py-2 rounded-lg w-full sm:w-40"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            <button
              onClick={addIncome}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md w-full sm:w-auto"
            >
              ➕ Add Income
            </button>
          </div>
        </div>

        {/* Expense Section */}
        <div className="mb-8 bg-red-50 p-5 rounded-xl shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold text-red-700 mb-4">🔴 Add Expense</h2>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <input
              type="text"
              placeholder="Category (e.g. Rent, Food)"
              value={expense.category}
              onChange={(e) => setExpense({ ...expense, category: e.target.value })}
              className="border px-3 py-2 rounded-lg w-full"
            />
            <input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={(e) => setExpense({ ...expense, amount: e.target.value })}
              className="border px-3 py-2 rounded-lg w-full sm:w-32"
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={expense.note}
              onChange={(e) => setExpense({ ...expense, note: e.target.value })}
              className="border px-3 py-2 rounded-lg w-full"
            />
            <button
              onClick={addExpense}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md w-full sm:w-auto"
            >
              ➕ Add Expense
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white border rounded-xl shadow-sm p-4 mb-8 h-64 sm:h-80">
          {categories.length ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-gray-500 text-center py-8">
              Add expenses to view your category chart.
            </p>
          )}
        </div>

        {/* AI Insight Section */}
        <div className="text-center mb-6">
          <button
            onClick={getInsight}
            disabled={loading}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-semibold shadow-md ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? '⏳ Analyzing...' : '💡 Get AI Budget Advice'}
          </button>
        </div>

        {/* AI Insight Output */}
        {insight && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-300 rounded-lg p-4 sm:p-6 shadow-md">
            <h2 className="text-lg sm:text-xl font-bold text-yellow-800 mb-2 flex items-center gap-2">
              🧠 AI Insight
            </h2>
            <p className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-base">
              {insight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
