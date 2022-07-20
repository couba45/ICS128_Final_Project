// get the items
const createItems = (items, numItems) => {
  for (let i = 0; i < numItems; i++) {
    const { id, image, title, price, description } = items[i];
    console.log(image);
    $("#items").append(`<div class="card" id="${id}_card" style="width: 26rem">
                            <div class="p-5"><img src="${image}" class="card-img-top" alt="..." /></div>
                            <div class="card-body">
                            <div class="price fs-3 my-5">Price: $${price}</div>
                            <h5 class="card-title">${title}</h5>
                            <p class="card-text">
                                ${description}
                            </p>
                            <button id="${id}_button" class="btn btn-primary add-cart" data-item="${title}" data-price="${price}" data-id="${id}">Add to cart</a>
                            </div>
                        </div>`);
  }
};

//delete item

// add item
let items = [];
let counter = 0;

const createButtons = () => {
  $("#button-container").html(
    `<button class="btn btn-warning">Delete all items</button><button class="btn btn-success">Continue</button>`
  );
};

const getCounterItem = (itemsArr, id) => {
  let counterItem = 1;
  for (let i = 1; i < itemsArr.length; i++) {
    if (itemsArr[i - 1].id === id) {
      counterItem++;
    }
  }
  return counterItem;
};

const getTotalPrice = () => {
  const itemsInCart = $(".price-item");
  let totalPrice = 0;
  for (let i = 0; i < itemsInCart.length; i++) {
    totalPrice += parseFloat(itemsInCart[i].innerHTML.split("$")[1]);
  }
  $("#total-price").html("$" + totalPrice.toFixed(2));
};

const createTable = () => {
  $("#table-container").html(` <table class="table" id="delete-item">
                                    <thead>
                                    <tr>
                                        <th></th>
                                        <th scope="col">Item</th>
                                        <th scope="col">Qty</th>
                                        <th scope="col">Price</th>
                                        <th scope="col">Total</th>
                                    </tr>
                                    </thead>
                                    <tbody id="table-body"></tbody>
                                    <tfoot id="table-footer">
                                      <th>Subtotal</th>
                                      <td></td>
                                      <td></td>
                                      <td></td>
                                      <td id="total-price"><td>
                                    </tfoot>
                                </table>
                                <div id="button-container" class="w-100 d-flex justify-content-between"></div>`);
  createButtons();

  // event handler
  $("#delete-item").on("click", ".delete-element", function (event) {
    let itemId = $(this).attr("data-item-id");
    items = items.filter((item) => item.id !== itemId);
    console.log(items);
    counter = items.length;
    $("#counter").html(`${counter}`);
    displayItems();
  });
};

const displayItems = () => {
  if (items.length === 0) {
    $("#button-container").addClass("d-none");
    $("#counter").hide();
    $("#delete-item").hide();

    $("#dummy-text").show();
  } else {
    $("#counter").show();
    $("#dummy-text").hide();
    createTable();
    for (const key in items) {
      console.log(key);
      const { name, price, id, counterItem } = items[key];
      if (counterItem >= 2) {
        $(`#${id}`).html(`
                <th><svg xmlns="http://www.w3.org/2000/svg" style="height: 2rem; cursor:pointer;" class="text-danger delete-element cursor-pointer" viewBox="0 0 20 20" fill="currentColor" data-item-id="${id}">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                </svg></th>
            <th scope="row">${name}</th>
            <td>${counterItem}</td>
            <td>$${price}</td>
            <td class="price-item">$${counterItem * price}</td>`);
      } else {
        $("#table-body").append(`<tr id="${id}">
                                        <th><svg xmlns="http://www.w3.org/2000/svg" style="height: 2rem; cursor:pointer;" class="text-danger delete-element cursor-pointer" viewBox="0 0 20 20" fill="currentColor" data-item-id="${id}">
                                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                                        </svg></th>
                                    <th scope="row">${name}</th>
                                    <td>${counterItem}</td>
                                    <td>$${price}</td>
                                    <td class="price-item">$${
                                      counterItem * price
                                    }</td>
                                </tr>`);
      }
    }
    getTotalPrice();
  }
};
$("#items").on("click", ".add-cart", function (event) {
  const itemName = $(this).attr("data-item");
  const itemPrice = $(this).attr("data-price");
  const itemId = $(this).attr("data-id");
  let repeatItem = false;
  items[counter] = {
    name: itemName,
    price: itemPrice,
    id: itemId,
    counterItem: 0,
  };
  let counterItem = getCounterItem(items, itemId);
  items[counter].counterItem = counterItem;
  items[counter].repeatItem = repeatItem;
  counter++;
  console.log(items);
  displayItems();

  $("#counter").html(`${counter}`);
});

function getCardInformation() {
  fetch(`https://fakestoreapi.com/products`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
      throw new Error("Something went wrong");
    })
    .then((data) => {
      createItems(data, 5);
    })
    .catch((error) => {
      $("#items").html(`<div class="fs-1 text-danger">${error}</div>`);
    });
}
$(document).ready(function () {
  getCardInformation();
});
