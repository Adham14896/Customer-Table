const tableData = document.querySelector("#data");
const searchInput = document.querySelector("#search");
const customersUrl = "http://localhost:3000/customers";
const transactionsUrl = "http://localhost:3000/transactions";
const ctx = document.querySelector("#myChart");
const closeBtn = document.querySelector("#closeBtn");

let myChart;
let customers = [];
let transactions = [];

async function getData(url) {
  const response = await fetch(url);
  return await response.json();
}

async function fetchData() {
  const customersData = await getData(customersUrl);
  const transactionsData = await getData(transactionsUrl);
  transactions = [...transactionsData];
  customers = [...customersData];
  console.log(customers);
  console.log(transactions);
  // Filter customers and transactions based on the search term
  const searchTerm = searchInput.value.toLowerCase();
  const filteredCustomers = customersData.filter((customer) =>
    customer.name.toLowerCase().includes(searchTerm)
  );
  const filteredTransactions = transactionsData.filter((transaction) => {
    const customer = filteredCustomers.find(
      (customer) => customer.id === transaction.customer_id
    );
    return customer || transaction.amount.toString().includes(searchTerm);
  });

  // Create a mapping of customer_id to customer name for the filtered transactions
  const customerMap = {};
  filteredCustomers.forEach((customer) => {
    customerMap[customer.id] = customer.name;
  });

  // Update the global variables with the filtered data
  customers = filteredCustomers;
  transactions = filteredTransactions;

  displayData(filteredTransactions, customerMap);

  //   const customersData = await getData(customersUrl);
  //   const transactionsData = await getData(transactionsUrl);
  //   const customerMap = {};
  //   customersData.forEach((customer) => {
  //     customerMap[customer.id] = customer.name;
  //   });

  //   displayData(transactionsData, customerMap);
}

function displayData(transactions, customer) {
  let box = ``;
  transactions.forEach(
    (transaction) =>
      (box += `
        <tr>
      <th scope="row" class='text-white text-center border-end'>${
        transaction.id
      }</th>
      <td class='text-white text-center border-end'>${
        transaction.customer_id
      }</td>
      <td class='text-white text-center border-end'>${
        customer[transaction.customer_id]
      }</td>
      <td class='text-white text-center border-end'>${transaction.date}</td>
      <td class='text-white text-center border-end'>${transaction.amount}</td>
      <td class='text-white text-center border-end'>
      <button type="button" class="btn btn-outline-primary text-primary"  onclick="showDetails(${
        transaction.customer_id
      })">Details</button>
      </td>
        </tr>
        `)
  );
  tableData.innerHTML = box;
}

async function showDetails(customerId) {
  // Fetch transactions for the specific customer
  const customerTransactions = transactions.filter(
    (transaction) => transaction.customer_id === customerId
  );

  // Prepare data for the chart
  const labels = customerTransactions.map((transaction) => transaction.date);
  const data = customerTransactions.map((transaction) => transaction.amount);

  // If chart already exists, destroy it
  if (myChart) {
    myChart.destroy();
  }

  // Create a new chart
  myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: `Transactions for Customer ${customerId}`,
          data: data,
          borderWidth: 1,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });

  document.querySelector(".table").classList.add("d-none");

  document.querySelector(".status").classList.remove("d-none");

  //   document.querySelector(".container").innerHTML = myChart;
}

// function filterData() {
//   const searchTerm = searchInput.value.toLowerCase();
//   const filteredTransactions = transactions.filter((transaction) => {
//     const customer = customers.find(
//       (customer) => customer.id === transaction.customer_id
//     );
//     const customerName = customer ? customer.name.toLowerCase() : "";
//     return (
//       customerName.includes(searchTerm) ||
//       transaction.amount.toString().includes(searchTerm)
//     );
//   });

//   console.log("Filtered Transactions:", filteredTransactions);

//   // Create a mapping of customer_id to customer name for the filtered transactions
//   const customerMap = {};
//   customers.forEach((customer) => {
//     customerMap[customer.id] = customer.name;
//   });

//   displayData(filteredTransactions, customerMap);
// }

// searchInput.addEventListener("input", function () {
//   filterData();
// });

searchInput.addEventListener("input", function () {
  fetchData();
});

closeBtn.addEventListener("click", function () {
  document.querySelector(".status").classList.add("d-none");
  document.querySelector(".table").classList.remove("d-none");
});

fetchData();
