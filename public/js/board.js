var cart = [];
var total = 0;

function addToCart(btn) {
  var row = btn.closest('.board-item-row');
  var name = row.dataset.name;
  var price = parseInt(row.dataset.price, 10);

  var existing = cart.find(function(i) { return i.name === name; });
  if (existing) {
    existing.qty += 1;
    existing.total += price;
  } else {
    cart.push({ name: name, price: price, qty: 1, total: price });
  }
  total += price;
  renderCart();
}

function removeFromCart(index) {
  var item = cart[index];
  total -= item.price;
  if (item.qty > 1) {
    item.qty -= 1;
    item.total -= item.price;
  } else {
    cart.splice(index, 1);
  }
  renderCart();
}

function renderCart() {
  var tbody = document.getElementById('cart-items');
  tbody.innerHTML = '';
  cart.forEach(function(item, i) {
    var row = document.createElement('div');
    row.className = 'menu-row';
    row.innerHTML =
      '<span>' + item.name + '</span>' +
      '<span>' + item.qty + '</span>' +
      '<span>' + item.total + ' грн.</span>' +
      '<span><button class="del-btn" onclick="removeFromCart(' + i + ')">' +
        '<img src="/img/icon/delete.svg" alt="видалити">' +
      '</button></span>';
    tbody.appendChild(row);
  });
  document.getElementById('totalPrice').textContent = total;
}

document.getElementById('resetBtn').addEventListener('click', function() {
  cart = [];
  total = 0;
  renderCart();
});
