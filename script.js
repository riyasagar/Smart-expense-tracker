const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const highestEl = document.getElementById("highest");
const averageEl = document.getElementById("average");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const sortSelect = document.getElementById("sort");
const clearAllBtn = document.getElementById("clearAll");
const exportCSV = document.getElementById("exportCSV");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// Chart.js setup
const ctx = document.getElementById("expenseChart").getContext("2d");
let expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
        labels: ["Food", "Travel", "Shopping", "Bills", "Other"],
        datasets: [{
            data: [0, 0, 0, 0, 0],
            backgroundColor: ["#e63946", "#457b9d", "#f4a261", "#2a9d8f", "#a8dadc"]
        }]
    }
});

// Helper for emojis
function getCategoryEmoji(category) {
    switch (category) {
        case "Food": return "🍔";
        case "Travel": return "✈️";
        case "Shopping": return "🛍";
        case "Bills": return "💡";
        case "Other": return "📝";
        default: return "";
    }
}

// Update chart
function updateChart() {
    const categoryTotals = { Food: 0, Travel: 0, Shopping: 0, Bills: 0, Other: 0 };
    expenses.forEach(exp => categoryTotals[exp.category] += parseFloat(exp.amount));
    expenseChart.data.datasets[0].data = Object.values(categoryTotals);
    expenseChart.update();
}

// Render expenses
function renderExpenses() {
    expenseList.innerHTML = "";
    let total = 0;
    let highest = 0;

    // Filtered expenses based on search and category
    let filtered = expenses.filter(exp => {
        if (filterSelect.value !== "All" && exp.category !== filterSelect.value) return false;
        if (searchInput.value && !exp.title.toLowerCase().includes(searchInput.value.toLowerCase())) return false;
        return true;
    });

    // Sort
    if (sortSelect.value === "amount") filtered.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    else if (sortSelect.value === "date") filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortSelect.value === "category") filtered.sort((a, b) => a.category.localeCompare(b.category));

    filtered.forEach((exp, index) => {
        const amount = parseFloat(exp.amount);
        total += amount;
        if (amount > highest) highest = amount;

        const li = document.createElement("li");
        li.innerHTML = `
            <span>
                ${getCategoryEmoji(exp.category)} ${exp.title} - ₹${exp.amount} (${exp.category}, ${exp.payment}, ${exp.date}) ${exp.recurring ? "🔁" : ""}
            </span>
            <span class="actions">
                <button onclick="editExpense(${index})">✏ Edit</button>
                <button onclick="deleteExpense(${index})">❌ Delete</button>
            </span>
        `;
        expenseList.appendChild(li);
    });

    totalEl.textContent = `₹${total}`;
    highestEl.textContent = `₹${highest}`;
    averageEl.textContent = filtered.length ? `₹${(total / filtered.length).toFixed(2)}` : `₹0`;

    localStorage.setItem("expenses", JSON.stringify(expenses));
    updateChart();
}

// Add or update expense
function addExpense(e) {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const payment = document.getElementById("payment").value;
    const date = document.getElementById("date").value;
    const recurring = document.getElementById("recurring").checked;
    const editIndex = document.getElementById("editIndex").value;

    if (!title || !amount || !category || !payment || !date) return alert("Fill all fields!");

    const expense = { title, amount, category, payment, date, recurring };

    if (editIndex) expenses[editIndex] = expense;
    else expenses.push(expense);

    if (recurring) {
        const nextMonth = new Date(date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        expenses.push({ ...expense, date: nextMonth.toISOString().split('T')[0] });
    }

    expenseForm.reset();
    document.getElementById("editIndex").value = "";
    renderExpenses();
}

// Edit expense
function editExpense(index) {
    const exp = expenses[index];
    document.getElementById("title").value = exp.title;
    document.getElementById("amount").value = exp.amount;
    document.getElementById("category").value = exp.category;
    document.getElementById("payment").value = exp.payment;
    document.getElementById("date").value = exp.date;
    document.getElementById("recurring").checked = exp.recurring;
    document.getElementById("editIndex").value = index;
}

// Delete expense
function deleteExpense(index) {
    expenses.splice(index, 1);
    renderExpenses();
}

// Clear all expenses
function clearAll() {
    if (confirm("Clear all expenses?")) {
        expenses = [];
        renderExpenses();
    }
}

// Export CSV
function downloadCSV() {
    let csv = "Title,Amount,Category,Payment,Date,Recurring\n";
    expenses.forEach(exp => {
        csv += `${exp.title},${exp.amount},${exp.category},${exp.payment},${exp.date},${exp.recurring}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expenses.csv";
    a.click();
}

// Event Listeners
expenseForm.addEventListener("submit", addExpense);
searchInput.addEventListener("input", renderExpenses);
filterSelect.addEventListener("change", renderExpenses);
sortSelect.addEventListener("change", renderExpenses);
clearAllBtn.addEventListener("click", clearAll);
exportCSV.addEventListener("click", downloadCSV);

// Initialize
renderExpenses();
