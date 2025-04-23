import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyDXuWGUkvqjfZKeqxkJYBqP1Wn0HefafQ8");

export async function getFinanceTips(expenses, budget, accountBalance, income) {
  try {
    console.log('Expenses:', expenses, 'Type:', typeof expenses);
    console.log('Budget:', budget, 'Type:', typeof budget);
    console.log('Account Balance:', accountBalance, 'Type:', typeof accountBalance);
    console.log('Income:', income, 'Type:', typeof income);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Based on the following financial data:
      - Expenses: ${expenses}
      - Budget: ${budget}
      - Account Balance: ${accountBalance}
      - Income: ${income}
      
      Provide some financial tips to help manage finances better. Max 200-300 words, please.
    `;

    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = await response.text();
    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    return cleanedText.split('\n').filter(tip => tip.trim() !== '');
  } catch (error) {
    console.error('Error fetching finance tips:', error.message);
    return ["Save at least 20% of your income.", "Track your expenses regularly."];
  }
}