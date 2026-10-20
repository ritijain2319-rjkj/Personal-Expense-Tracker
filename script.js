$(document).ready(function () {

    /* =====================================================
       DATA
       ===================================================== */

    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

    let monthlyBudget =
        parseFloat(localStorage.getItem("monthlyBudget")) || 0;


    /* =====================================================
       CATEGORY COLORS
       ===================================================== */

    const categoryColors = {
        Food: "#7c5cff",
        Transport: "#20a477",
        Shopping: "#e98742",
        Education: "#e45a82",
        Entertainment: "#4f9cf9",
        Bills: "#a65ee8",
        Health: "#ef6079",
        Other: "#9292a4"
    };


    /* =====================================================
       INITIAL SETUP
       ===================================================== */

    $("#date").val(getToday());

    $("#budget").val(monthlyBudget || "");


    displayExpenses();
    updateDashboard();
    updateBudget();
    updateChart();
    updateInsights();


    /* =====================================================
       GET TODAY'S DATE
       ===================================================== */

    function getToday() {

        const today = new Date();

        const year = today.getFullYear();

        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }


    /* =====================================================
       SAVE DATA
       ===================================================== */

    function saveExpenses() {

        localStorage.setItem(
            "expenses",
            JSON.stringify(expenses)
        );

    }


    /* =====================================================
       ADD / EDIT EXPENSE
       ===================================================== */

    $("#expenseForm").on("submit", function (event) {

        event.preventDefault();


        const name =
            $("#expenseName").val().trim();

        const amount =
            parseFloat($("#amount").val());

        const category =
            $("#category").val();

        const date =
            $("#date").val();

        const editId =
            $("#expenseId").val();


        /* ---------- VALIDATION ---------- */

        if (
            name === "" ||
            isNaN(amount) ||
            amount <= 0 ||
            category === "" ||
            date === ""
        ) {

            showToast(
                "Please fill all fields correctly.",
                "error"
            );

            return;
        }


        /* ---------- EDIT EXISTING ---------- */

        if (editId) {

            const expenseIndex =
                expenses.findIndex(
                    expense =>
                        expense.id == editId
                );


            if (expenseIndex !== -1) {

                expenses[expenseIndex] = {

                    id: Number(editId),

                    name: name,

                    amount: amount,

                    category: category,

                    date: date

                };

            }


            showToast(
                "Expense updated successfully!"
            );

            resetForm();

        }


        /* ---------- ADD NEW ---------- */

        else {

            const newExpense = {

                id: Date.now(),

                name: name,

                amount: amount,

                category: category,

                date: date

            };


            expenses.push(newExpense);


            showToast(
                "Expense added successfully!"
            );


            $("#expenseForm")[0].reset();

            $("#date").val(getToday());

        }


        saveExpenses();

        displayExpenses();

        updateDashboard();

        updateBudget();

        updateChart();

        updateInsights();

    });


    /* =====================================================
       DISPLAY EXPENSES
       ===================================================== */

    function displayExpenses() {

        const tbody =
            $("#expenseTableBody");

        tbody.empty();


        let filteredExpenses =
            [...expenses];


        /* ---------- SEARCH ---------- */

        const search =
            $("#searchInput")
                .val()
                .toLowerCase()
                .trim();


        if (search !== "") {

            filteredExpenses =
                filteredExpenses.filter(
                    expense =>
                        expense.name
                            .toLowerCase()
                            .includes(search) ||

                        expense.category
                            .toLowerCase()
                            .includes(search)
                );

        }


        /* ---------- CATEGORY FILTER ---------- */

        const selectedCategory =
            $("#filterCategory").val();


        if (
            selectedCategory &&
            selectedCategory !== "All"
        ) {

            filteredExpenses =
                filteredExpenses.filter(
                    expense =>
                        expense.category ===
                        selectedCategory
                );

        }


        /* ---------- SORT ---------- */

        const sortOption =
            $("#sortExpenses").val();


        if (sortOption === "newest") {

            filteredExpenses.sort(
                (a, b) =>
                    new Date(b.date) -
                    new Date(a.date)
            );

        }


        else if (sortOption === "oldest") {

            filteredExpenses.sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            );

        }


        else if (sortOption === "high") {

            filteredExpenses.sort(
                (a, b) =>
                    b.amount - a.amount
            );

        }


        else if (sortOption === "low") {

            filteredExpenses.sort(
                (a, b) =>
                    a.amount - b.amount
            );

        }


        else if (sortOption === "name") {

            filteredExpenses.sort(
                (a, b) =>
                    a.name.localeCompare(b.name)
            );

        }


        /* ---------- EMPTY STATE ---------- */

        if (filteredExpenses.length === 0) {

            $("#emptyMessage").show();

            return;

        }


        $("#emptyMessage").hide();


        /* ---------- TABLE ROWS ---------- */

        filteredExpenses.forEach(function (expense) {

            const formattedDate =
                formatDate(expense.date);


            const row = `

                <tr>

                    <td class="expense-name">

                        <i class="bi bi-receipt me-2"></i>

                        ${escapeHTML(expense.name)}

                    </td>


                    <td class="amount-cell">

                        ₹${expense.amount.toFixed(2)}

                    </td>


                    <td>

                        <span class="category-badge">

                            ${escapeHTML(expense.category)}

                        </span>

                    </td>


                    <td>

                        ${formattedDate}

                    </td>


                    <td>

                        <button
                            class="action-btn edit-btn"
                            data-id="${expense.id}"
                            title="Edit"
                        >

                            <i class="bi bi-pencil"></i>

                        </button>


                        <button
                            class="action-btn delete-btn"
                            data-id="${expense.id}"
                            title="Delete"
                        >

                            <i class="bi bi-trash3"></i>

                        </button>

                    </td>

                </tr>

            `;


            tbody.append(row);

        });

    }


    /* =====================================================
       FORMAT DATE
       ===================================================== */

    function formatDate(dateString) {

        const date =
            new Date(dateString + "T00:00:00");


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       UPDATE DASHBOARD
       ===================================================== */

    function updateDashboard() {

        const total =
            expenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );


        const count =
            expenses.length;


        const average =
            count > 0
                ? total / count
                : 0;


        const highest =
            count > 0
                ? Math.max(
                    ...expenses.map(
                        expense =>
                            Number(expense.amount)
                    )
                )
                : 0;


        $("#totalAmount").text(
            formatCurrency(total)
        );


        $("#expenseCount").text(count);


        $("#averageAmount").text(
            formatCurrency(average)
        );


        $("#highestAmount").text(
            formatCurrency(highest)
        );

    }


    /* =====================================================
       FORMAT CURRENCY
       ===================================================== */

    function formatCurrency(amount) {

        return "₹" +
            Number(amount).toLocaleString(
                "en-IN",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    /* =====================================================
       DELETE EXPENSE
       ===================================================== */

    $(document).on(
        "click",
        ".delete-btn",
        function () {

            const id =
                Number($(this).data("id"));


            const expense =
                expenses.find(
                    item => item.id === id
                );


            if (!expense) {
                return;
            }


            const confirmed =
                confirm(
                    `Delete "${expense.name}"?`
                );


            if (!confirmed) {
                return;
            }


            expenses =
                expenses.filter(
                    item => item.id !== id
                );


            saveExpenses();

            displayExpenses();

            updateDashboard();

            updateBudget();

            updateChart();

            updateInsights();


            showToast(
                "Expense deleted."
            );

        }
    );


    /* =====================================================
       EDIT EXPENSE
       ===================================================== */

    $(document).on(
        "click",
        ".edit-btn",
        function () {

            const id =
                Number($(this).data("id"));


            const expense =
                expenses.find(
                    item => item.id === id
                );


            if (!expense) {
                return;
            }


            $("#expenseId").val(expense.id);

            $("#expenseName")
                .val(expense.name);

            $("#amount")
                .val(expense.amount);

            $("#category")
                .val(expense.category);

            $("#date")
                .val(expense.date);


            $("#formTitle")
                .text("Edit Expense");


            $("#submitBtn")
                .html(
                    '<i class="bi bi-check-circle"></i> Update Expense'
                );


            $("#cancelEdit").show();


            $("html, body").animate(
                {
                    scrollTop:
                        $("#expenseForm").offset().top - 120
                },
                400
            );

        }
    );


    /* =====================================================
       CANCEL EDIT
       ===================================================== */

    $("#cancelEdit").on(
        "click",
        function () {

            resetForm();

        }
    );


    function resetForm() {

        $("#expenseForm")[0].reset();

        $("#expenseId").val("");

        $("#date").val(getToday());

        $("#formTitle")
            .text("Add New Expense");

        $("#submitBtn")
            .html(
                '<i class="bi bi-plus-circle"></i> Add Expense'
            );

        $("#cancelEdit").hide();

    }


    /* =====================================================
       SEARCH
       ===================================================== */

    $("#searchInput").on(
        "input",
        function () {

            displayExpenses();

        }
    );


    /* =====================================================
       CATEGORY FILTER
       ===================================================== */

    $("#filterCategory").on(
        "change",
        function () {

            displayExpenses();

        }
    );


    /* =====================================================
       SORT
       ===================================================== */

    $("#sortExpenses").on(
        "change",
        function () {

            displayExpenses();

        }
    );


    /* =====================================================
       BUDGET
       ===================================================== */

    $("#saveBudget").on(
        "click",
        function () {

            const budget =
                parseFloat(
                    $("#budget").val()
                );


            if (
                isNaN(budget) ||
                budget <= 0
            ) {

                showToast(
                    "Enter a valid budget.",
                    "error"
                );

                return;

            }


            monthlyBudget = budget;


            localStorage.setItem(
                "monthlyBudget",
                monthlyBudget
            );


            updateBudget();


            showToast(
                "Monthly budget saved!"
            );

        }
    );


    function updateBudget() {

        const total =
            expenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );


        $("#budgetSpent").text(
            formatCurrency(total)
        );


        $("#budgetTotal").text(
            monthlyBudget > 0
                ? formatCurrency(monthlyBudget)
                : "₹0.00"
        );


        if (monthlyBudget <= 0) {

            $("#budgetProgress")
                .css("width", "0%");

            $("#budgetMessage")
                .text(
                    "Set a budget to start tracking your progress."
                );

            return;

        }


        const percentage =
            (total / monthlyBudget) * 100;


        $("#budgetProgress")
            .css(
                "width",
                Math.min(percentage, 100) + "%"
            );


        if (percentage > 100) {

            $("#budgetMessage")
                .text(
                    "⚠️ You have exceeded your monthly budget."
                );

        }

        else if (percentage >= 80) {

            $("#budgetMessage")
                .text(
                    "⚠️ You are close to your monthly budget."
                );

        }

        else {

            $("#budgetMessage")
                .text(
                    `${Math.round(percentage)}% of your budget used.`
                );

        }

    }


    /* =====================================================
       CATEGORY CHART
       ===================================================== */

    function updateChart() {

        const categoryTotals = {};


        expenses.forEach(function (expense) {

            if (
                !categoryTotals[
                    expense.category
                ]
            ) {

                categoryTotals[
                    expense.category
                ] = 0;

            }


            categoryTotals[
                expense.category
            ] += Number(expense.amount);

        });


        const categories =
            Object.keys(categoryTotals);


        const total =
            Object.values(categoryTotals)
                .reduce(
                    (sum, value) =>
                        sum + value,
                    0
                );


        $("#chartTotal").text(
            formatCurrency(total)
        );


        const legend =
            $("#categoryLegend");


        legend.empty();


        if (categories.length === 0) {

            $("#categoryChart").css(
                "background",
                "#eeeeF5"
            );

            return;

        }


        let currentAngle = 0;

        const gradients = [];


        categories.forEach(function (category) {

            const percentage =
                (categoryTotals[category] / total) * 100;


            const startAngle =
                currentAngle;


            const endAngle =
                currentAngle + percentage;


            gradients.push(
                `${categoryColors[category] || "#9292a4"} ${startAngle}% ${endAngle}%`
            );


            currentAngle = endAngle;


            const legendItem = `

                <div class="legend-item">

                    <span
                        class="legend-dot"
                        style="
                            background:
                            ${categoryColors[category] || "#9292a4"};
                        "
                    ></span>

                    <span>
                        ${escapeHTML(category)}
                    </span>

                    <strong>
                        ${percentage.toFixed(0)}%
                    </strong>

                </div>

            `;


            legend.append(legendItem);

        });


        /*
         * CSS conic-gradient expects angles/percentages.
         */

        let degree = 0;

        const degreeGradients = [];


        categories.forEach(function (category) {

            const percentage =
                (categoryTotals[category] / total) * 100;


            const start =
                degree;


            degree +=
                percentage * 3.6;


            degreeGradients.push(
                `${categoryColors[category] || "#9292a4"} ${start}deg ${degree}deg`
            );

        });


        $("#categoryChart").css(
            "background",
            `conic-gradient(${degreeGradients.join(", ")})`
        );

    }


    /* =====================================================
       SPENDING INSIGHTS
       ===================================================== */

    function updateInsights() {

        if (expenses.length === 0) {

            $("#insightText")
                .text(
                    "Add some expenses to receive a spending insight."
                );

            $("#topCategory")
                .text("No data yet");

            $("#recentExpense")
                .text("No data yet");

            $("#largestExpense")
                .text("No data yet");

            return;

        }


        /* ---------- CATEGORY TOTALS ---------- */

        const categoryTotals = {};


        expenses.forEach(function (expense) {

            categoryTotals[expense.category] =
                (categoryTotals[expense.category] || 0) +
                Number(expense.amount);

        });


        const topCategory =
            Object.entries(categoryTotals)
                .sort(
                    (a, b) =>
                        b[1] - a[1]
                )[0];


        $("#topCategory").text(
            `${topCategory[0]} (${formatCurrency(topCategory[1])})`
        );


        /* ---------- RECENT EXPENSE ---------- */

        const recent =
            [...expenses]
                .sort(
                    (a, b) =>
                        new Date(b.date) -
                        new Date(a.date)
                )[0];


        $("#recentExpense").text(
            `${recent.name} • ${formatCurrency(recent.amount)}`
        );


        /* ---------- LARGEST EXPENSE ---------- */

        const largest =
            [...expenses]
                .sort(
                    (a, b) =>
                        b.amount - a.amount
                )[0];


        $("#largestExpense").text(
            `${largest.name} • ${formatCurrency(largest.amount)}`
        );


        /* ---------- SMART MESSAGE ---------- */

        const total =
            expenses.reduce(
                (sum, expense) =>
                    sum + Number(expense.amount),
                0
            );


        const average =
            total / expenses.length;


        let message;


        if (topCategory[1] > total * 0.5) {

            message =
                `More than half of your recorded spending is in ${topCategory[0]}. Keep an eye on this category.`;

        }

        else if (
            monthlyBudget > 0 &&
            total > monthlyBudget
        ) {

            message =
                "Your recorded expenses have crossed your monthly budget. Consider reviewing your recent transactions.";

        }

        else if (average > 1000) {

            message =
                "Your average transaction is relatively high. Tracking larger expenses can help with budgeting.";

        }

        else {

            message =
                `You have recorded ${expenses.length} transaction${expenses.length > 1 ? "s" : ""} with total spending of ${formatCurrency(total)}.`;

        }


        $("#insightText").text(message);

    }


    /* =====================================================
       EXPORT CSV
       ===================================================== */

    $("#exportBtn").on(
        "click",
        function () {

            if (expenses.length === 0) {

                showToast(
                    "There are no expenses to export.",
                    "error"
                );

                return;

            }


            let csv =
                "Expense Name,Amount,Category,Date\n";


            expenses.forEach(function (expense) {

                csv +=
                    `"${escapeCSV(expense.name)}",` +
                    `"${expense.amount}",` +
                    `"${escapeCSV(expense.category)}",` +
                    `"${expense.date}"\n`;

            });


            const blob =
                new Blob(
                    [csv],
                    {
                        type: "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href = url;

            link.download =
                "expense-report.csv";


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);


            URL.revokeObjectURL(url);


            showToast(
                "Expense report exported!"
            );

        }
    );


    /* =====================================================
       CLEAR ALL
       ===================================================== */

    $("#clearAll").on(
        "click",
        function () {

            if (expenses.length === 0) {

                showToast(
                    "There are no expenses to clear.",
                    "error"
                );

                return;

            }


            const confirmed =
                confirm(
                    "Are you sure you want to delete all expenses?"
                );


            if (!confirmed) {
                return;
            }


            expenses = [];


            saveExpenses();


            displayExpenses();

            updateDashboard();

            updateBudget();

            updateChart();

            updateInsights();


            showToast(
                "All expenses have been cleared."
            );

        }
    );


    /* =====================================================
       DARK MODE
       ===================================================== */

    $("#themeToggle").on(
        "click",
        function () {

            $("body")
                .toggleClass("dark-mode");


            const isDark =
                $("body")
                    .hasClass("dark-mode");


            localStorage.setItem(
                "darkMode",
                isDark
            );


            if (isDark) {

                $(this)
                    .html(
                        '<i class="bi bi-sun-fill"></i>'
                    );

            }

            else {

                $(this)
                    .html(
                        '<i class="bi bi-moon-fill"></i>'
                    );

            }

        }
    );


    /* ---------- LOAD DARK MODE ---------- */

    if (
        localStorage.getItem("darkMode") === "true"
    ) {

        $("body").addClass("dark-mode");

        $("#themeToggle")
            .html(
                '<i class="bi bi-sun-fill"></i>'
            );

    }


    /* =====================================================
       TOAST NOTIFICATION
       ===================================================== */

    function showToast(
        message,
        type = "success"
    ) {

        $("#toastMessage")
            .text(message);


        const icon =
            type === "error"
                ? "bi-exclamation-circle-fill"
                : "bi-check-circle-fill";


        $(".toast-body i")
            .attr(
                "class",
                `bi ${icon}`
            );


        const toastElement =
            document.getElementById(
                "appToast"
            );


        const toast =
            bootstrap.Toast.getOrCreateInstance(
                toastElement,
                {
                    delay: 2500
                }
            );


        toast.show();

    }


    /* =====================================================
       SECURITY HELPERS
       ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function escapeCSV(value) {

        return String(value)
            .replace(/"/g, '""');

    }

});