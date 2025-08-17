const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalEl = document.getElementById("total");
const searchInput = document.getElementById("search");
const filterSelect = document.getElementById("filter");
const clearAllBtn = document.getElementById("clearAll");
const themeToggle = document.getElementById("themeToggle");
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

function updateChart() {
  const categoryTotals = { Food: 0, Travel: 0, Shopping: 0, Bills: 0, Other: 0 };
  expenses.forEach(exp => categoryTotals[exp.category] += parseFloat(exp.amount));
  expenseChart.data.datasets[0].data = Object.values(categoryTotals);
  expenseChart.update();
}

function renderExpenses() {
  expenseList.innerHTML = "";
  let total = 0;

  let filtered = expenses.filter(exp => {
    if (filterSelect.value !== "All" && exp.category !== filterSelect.value) return false;
    if (searchInput.value && !exp.title.toLowerCase().includes(searchInput.value.toLowerCase())) return false;
    return true;
  });

  filtered.forEach((exp, index) => {
    total += parseFloat(exp.amount);
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${exp.title} - ₹${exp.amount} [${exp.category}] (${exp.date})</span>
      <span class="actions">
        <button onclick="editExpense(${index})">✏ Edit</button>
        <button onclick="deleteExpense(${index})">❌ Delete</button>
      </span>
    `;
    expenseList.appendChild(li);
  });

  totalEl.textContent = `₹${total}`;
  localStorage.setItem("expenses", JSON.stringify(expenses));
  updateChart();
}

function addExpense(e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const amount = document.getElementById("amount").value;
  const category = document.getElementById("category").value;
  const date = document.getElementById("date").value;
  const editIndex = document.getElementById("editIndex").value;

  if (!title || !amount || !category || !date) return alert("Fill all fields");

  const expense = { title, amount, category, date };

  if (editIndex) {
    expenses[editIndex] = expense; // update
  } else {
    expenses.push(expense); // new
  }

  document.getElementById("expense-form").reset();
  document.getElementById("editIndex").value = "";
  renderExpenses();
}

function editExpense(index) {
  const exp = expenses[index];
  document.getElementById("title").value = exp.title;
  document.getElementById("amount").value = exp.amount;
  document.getElementById("category").value = exp.category;
  document.getElementById("date").value = exp.date;
  document.getElementById("editIndex").value = index;
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  renderExpenses();
}

function clearAll() {
  if (confirm("Clear all expenses?")) {
    expenses = [];
    renderExpenses();
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  isDark = !isDark;
  themeToggle.textContent = isDark ? "☀ Light Mode" : "🌙 Dark Mode";
}

function downloadCSV() {
  let csv = "Title,Amount,Category,Date\n";
  expenses.forEach(exp => {
    csv += `${exp.title},${exp.amount},${exp.category},${exp.date}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "expenses.csv";
  a.click();
}

// Events
expenseForm.addEventListener("submit", addExpense);
searchInput.addEventListener("input", renderExpenses);
filterSelect.addEventListener("change", renderExpenses);
clearAllBtn.addEventListener("click", clearAll);
themeToggle.addEventListener("click", toggleTheme);
exportCSV.addEventListener("click", downloadCSV);

// Init
renderExpenses();
