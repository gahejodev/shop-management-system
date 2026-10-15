'use strict';

const STORAGE_KEY = 'shopdesk-v1';
const EMPTY_DATA = { products: [], sales: [] };

const $ = (id) => document.getElementById(id);

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

    if (saved && Array.isArray(saved.products) && Array.isArray(saved.sales)) {
      return saved;
    }
  } catch {
    // Start with an empty shop if the saved data cannot be read.
  }

  return structuredClone(EMPTY_DATA);
}

let shop = loadData();

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shop));
    return true;
  } catch (error) {
    console.error('ShopDesk could not save its data.', error);
    alert('ShopDesk could not save this change in your browser. Check available storage and export a backup before continuing.');
    return false;
  }
}

function formatMoney(value) {
  return 'Rs ' + Number(value).toLocaleString('en-PK', {
    maximumFractionDigits: 2
  });
}

function makeCell(value) {
  const cell = document.createElement('td');
  cell.textContent = String(value);
  return cell;
}

function renderInventory() {
  const searchTerm = $('search').value.trim().toLowerCase();
  const inventory = $('inventory');

  inventory.replaceChildren();

  const matchingProducts = shop.products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm)
  );

  for (const product of matchingProducts) {
    const row = document.createElement('tr');

    [
      product.name,
      formatMoney(product.cost),
      formatMoney(product.price),
      product.stock
    ].forEach((value) => row.append(makeCell(value)));

    const actionCell = makeCell('');
    const deleteButton = document.createElement('button');

    deleteButton.textContent = 'Delete';
    deleteButton.className = 'danger';
    deleteButton.addEventListener('click', () => {
      const confirmed = confirm(
        `Delete ${product.name}? Previous sales will remain in the history.`
      );

      if (!confirmed) return;

      const productIndex = shop.products.findIndex((item) => item.id === product.id);
      if (productIndex === -1) return;

      const [removedProduct] = shop.products.splice(productIndex, 1);
      if (!saveData()) {
        shop.products.splice(productIndex, 0, removedProduct);
        return;
      }

      render();
    });

    actionCell.append(deleteButton);
    row.append(actionCell);
    inventory.append(row);
  }
}

function renderSaleProductOptions() {
  const select = $('saleProduct');
  select.replaceChildren();

  for (const product of shop.products) {
    const option = document.createElement('option');
    option.value = product.id;
    option.textContent = `${product.name} (${product.stock} in stock)`;
    select.append(option);
  }
}

function renderRecentSales() {
  const salesTable = $('sales');
  salesTable.replaceChildren();

  for (const sale of [...shop.sales].reverse().slice(0, 25)) {
    const row = document.createElement('tr');

    [
      new Date(sale.date).toLocaleString(),
      sale.name,
      sale.quantity,
      formatMoney(sale.revenue),
      formatMoney(sale.profit)
    ].forEach((value) => row.append(makeCell(value)));

    salesTable.append(row);
  }
}

function renderSummary() {
  $('productsCount').textContent = shop.products.length;

  const stockValue = shop.products.reduce(
    (total, product) => total + product.cost * product.stock,
    0
  );
  const revenue = shop.sales.reduce((total, sale) => total + sale.revenue, 0);
  const grossProfit = shop.sales.reduce((total, sale) => total + sale.profit, 0);

  $('stockValue').textContent = formatMoney(stockValue);
  $('revenue').textContent = formatMoney(revenue);
  $('profit').textContent = formatMoney(grossProfit);
}

function render() {
  renderSummary();
  renderInventory();
  renderSaleProductOptions();
  renderRecentSales();
}

$('productForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const name = $('name').value.trim();
  const cost = Number($('cost').value);
  const price = Number($('price').value);
  const stock = Number($('stock').value);

  const validNumbers = [cost, price, stock].every(Number.isFinite);
  const validStock = Number.isInteger(stock) && stock >= 0;

  if (!name || !validNumbers || cost < 0 || price < 0 || !validStock) {
    alert('Enter valid product details.');
    return;
  }

  const product = {
    id: crypto.randomUUID(),
    name,
    cost,
    price,
    stock
  };
  shop.products.push(product);

  if (!saveData()) {
    shop.products.pop();
    return;
  }

  event.target.reset();
  render();
});

$('saleForm').addEventListener('submit', (event) => {
  event.preventDefault();

  const productId = $('saleProduct').value;
  const product = shop.products.find((item) => item.id === productId);
  const quantity = Number($('quantity').value);
  const message = $('message');

  if (
    !product ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > product.stock
  ) {
    message.textContent = 'Invalid quantity or insufficient stock.';
    return;
  }

  product.stock -= quantity;

  const sale = {
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    name: product.name,
    quantity,
    revenue: quantity * product.price,
    profit: quantity * (product.price - product.cost)
  };
  shop.sales.push(sale);

  if (!saveData()) {
    product.stock += quantity;
    shop.sales.pop();
    return;
  }

  event.target.reset();
  $('quantity').value = '1';
  render();
  message.textContent = 'Sale recorded successfully.';
});

$('search').addEventListener('input', renderInventory);

$('export').addEventListener('click', () => {
  const backup = new Blob([JSON.stringify(shop, null, 2)], {
    type: 'application/json'
  });
  const downloadUrl = URL.createObjectURL(backup);
  const link = document.createElement('a');

  link.href = downloadUrl;
  link.download = `shopdesk-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
});

render();
