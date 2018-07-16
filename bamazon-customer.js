var inquirer = require('inquirer');
var mysql = require('mysql');
var columnify = require('columnify')

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'bamazon'
});

connection.connect();

connection.query('SELECT * FROM products', function (err, res) {
  if (err) throw err;
  var data = res;
  console.log(columnify(res, {
    columnSplitter: ' |'
  }));
  inquirer
    .prompt([
      {
        type: 'input',
        name: 'itemId',
        message: "Please enter the ID of the item you wish to buy.",
        validate: (value) => {
          if (isNaN(Number(value))) {
            return 'That\'s not a number'
          }
          else if (value > data.length) {
            return 'Item does not exist. Please pick a different item.'
          }
          else {
            return true;
          }
        }
      },
      {
        type: 'input',
        name: 'quantity',
        message: "How many would you like to buy?"
      },
    ])
    .then(function (answer) {
      var item = data.find((element) => {
        return element.item_id === Number(answer.itemId);
      })
      if (item.stock_quantity < answer.quantity) {
        console.log('We don\'t have enough. . . ');
        connection.end();
      }
      else {
        console.log(`All right! That will cost $${answer.quantity * item.price}.\nThank you for your muneez!`);
        connection.query(
          `UPDATE products SET stock_quantity = \'${(item.stock_quantity - answer.quantity)}\' WHERE item_id = ${item.item_id};`,
          function (err, res) {
            if (err) throw err;
            console.log('New quantity = ' + (item.stock_quantity - answer.quantity));
            connection.end();
          }
        );

      }
    });
});




