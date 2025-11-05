import Transaction from "../models/Transaction.js";
import axios from "axios";

// 🕒 Utility to get current month & year
const getCurrentMonth = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

// 🟢 Add Income (Monthly or Yearly)
export const addIncome = async (req, res) => {
  try {
    const { amount, period = "monthly", note = "" } = req.body;
    if (!amount)
      return res.status(400).json({ error: "Income amount is required." });

    const { month, year } = getCurrentMonth();

    // Check if income already exists for this month
    const existing = await Transaction.findOne({
      type: "income",
      month,
      year,
      period,
    });

    if (existing) {
      existing.amount = amount;
      existing.note = note;
      await existing.save();
      return res.json({
        message: "Income updated successfully.",
        data: existing,
      });
    }

    // Add new income
    const income = new Transaction({
      type: "income",
      category:
        period === "monthly" ? "Monthly Income" : "Yearly Income",
      amount,
      note,
      period,
      month,
      year,
    });

    await income.save();
    res.status(201).json({
      message: "Income added successfully.",
      data: income,
    });
  } catch (err) {
    console.error("Add Income Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 🔴 Add Expense
export const addExpense = async (req, res) => {
  try {
    const { category, amount, note = "" } = req.body;
    if (!category || !amount)
      return res
        .status(400)
        .json({ error: "Category and amount are required." });

    const { month, year } = getCurrentMonth();

    const expense = new Transaction({
      type: "expense",
      category,
      amount,
      note,
      month,
      year,
    });

    await expense.save();
    res.status(201).json({
      message: "Expense added successfully.",
      data: expense,
    });
  } catch (err) {
    console.error("Add Expense Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 📅 Get All Transactions for Current Month
export const getCurrent = async (req, res) => {
  try {
    const { month, year } = getCurrentMonth();
    const docs = await Transaction.find({ month, year }).sort({
      createdAt: -1,
    });
    res.json(docs);
  } catch (err) {
    console.error("Fetch Current Transactions Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// 💡 Get AI Financial Insight (Gemini 2.5 Flash)
export const insight = async (req, res) => {
  try {
    const { month, year } = getCurrentMonth();
    const docs = await Transaction.find({ month, year });

    if (docs.length === 0)
      return res.status(400).json({
        error: "No transactions found for this month to analyze.",
      });

    const income = docs
      .filter((d) => d.type === "income")
      .reduce((s, d) => s + d.amount, 0);
    const expenses = docs.filter((d) => d.type === "expense");

    const group = {};
    expenses.forEach((e) => {
      group[e.category] = (group[e.category] || 0) + e.amount;
    });

    const prompt = `
You are a personal finance advisor for an Indian user.
This month's total income: ₹${income}.
Expenses by category: ${Object.entries(group)
      .map(([k, v]) => `${k}: ₹${v}`)
      .join(", ")}.
Give a short summary (2-4 sentences) and 3 actionable saving tips in plain English.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await axios.post(
      url,
      { contents: [{ parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const ai =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No insight generated. Try again later.";

    res.json({ insight: ai });
  } catch (err) {
    console.error("Gemini AI Error:", err.response?.data || err.message);
    res.status(500).json({
      error: "Failed to generate AI insight.",
      details: err.response?.data || err.message,
    });
  }
};

// 🧹 Reset All Data (Dev Only)
export const resetAll = async (req, res) => {
  try {
    await Transaction.deleteMany({});
    res.json({ message: "All transactions cleared successfully." });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ error: err.message });
  }
};
