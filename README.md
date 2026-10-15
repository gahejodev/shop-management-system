# ShopDesk

A small shop-management demo that runs in the browser. I built it with plain HTML, CSS and JavaScript so it can be tried without installing anything or setting up a server.

## What you can try

- Add products with their cost, selling price and available stock.
- Search the product list and remove an item.
- Record a sale. The app checks the available stock and updates it when the sale is saved.
- See the stock value, recorded revenue and estimated gross profit.
- Download the current data as a JSON backup.

## Run it

Open `index.html` in a recent browser. The app saves its data in that browser using localStorage.

## A few things to know

This is a demo, not a multi-user shop system. Data stays in the current browser and is not sent to a server. If browser storage is cleared, the saved data can be lost, so export a backup if you want to keep it. Backup import is not implemented yet. The profit figure is based on product cost and selling price only; it does not include rent, salaries or other expenses.

## Built with

HTML, CSS, JavaScript and localStorage.

## License

MIT. See [LICENSE](LICENSE).