// get the items

class Catalog {
  items = [];
  items_catalog = [];
  cookies = [];
  counter = 0;
  API_URL = "https://fakestoreapi.com/products";
  constructor() {
    this.getCardInformation();
  }
  createItems(items) {
    for (let key of items) {
      const { id, image, title, price, description } = key;
      const html = `<div class="col-lg-4 col-md-6 col-12 mb-4" id="${id}_card">
                      <div class="card">
                        <div class="p-5"><img src="${image}" class="card-img-top" alt="..." /></div>
                        <div class="card-body">
                        <div class="price fs-3 my-5">Price: $${price}</div>
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">
                            ${description}
                        </p>
                        <button id="${id}_button" class="btn btn-primary add-cart" data-item="${title}" data-price="${price}" data-id="${id}">Add to cart</a>
                        </div>
                      </div>
                    </div>`;
      $("#items").append(html);
    }
    let catalog_container = document.getElementById("items"); // assuming your target is <div class='row' id='catalog'>
    $(catalog_container).imagesLoaded(function () {
      let msnry = new Masonry(catalog_container); // this initializes the masonry container AFTER the product images are loaded
    });
    this.add_event_handler();
  }

  //delete item

  // add item

  getCounterItem = (itemsArr, id) => {
    let counterItem = 1;
    for (let i = 1; i < itemsArr.length; i++) {
      if (itemsArr[i - 1].id === id) {
        counterItem++;
      }
    }
    return counterItem;
  };

  add_event_handler() {
    // get total price
    let getTotalPrice = () => {
      const itemsInCart = $(".price-item");
      let totalPrice = 0;
      for (let i = 0; i < itemsInCart.length; i++) {
        totalPrice += parseFloat(itemsInCart[i].innerHTML.split("$")[1]);
      }
      $("#total-price").html("$" + totalPrice.toFixed(2));
    };

    // create table
    let createTable = () => {
      let addButtonEventListeners = () => {
        $("#delete-all-items").click(function () {
          set_cookie("shopping_cart_items", {});
          displayItems();
        });
      };

      //create buttons
      let createButtons = () => {
        $("#button-container").html(
          `<button id="delete-all-items"class="btn btn-warning">Delete all items</button><button class="btn btn-success">Continue</button>`
        );
        addButtonEventListeners();
      };
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
    };

    // display items
    let displayItems = () => {
      createTable();
      let items_in_cart = get_cookie("shopping_cart_items");

      let id_products = Object.keys(items_in_cart);
      id_products.forEach((id) => {
        console.log(items_in_cart);
        let { title, price } = this.items_catalog[id - 1];
        let tableContent = `<tr id="${id}">
                              <th><svg xmlns="http://www.w3.org/2000/svg" style="height: 2rem; cursor:pointer;" class="text-danger delete-element cursor-pointer" viewBox="0 0 20 20" fill="currentColor" data-item-id="${id}">
                                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" />
                              </svg></th>
                              <th scope="row">${title}</th>
                              <td>${items_in_cart[id]}</td>
                              <td>$${price}</td>
                              <td class="price-item">$${
                                items_in_cart[id] * price
                              }</td>
                          </tr>`;
        $("#table-body").append(tableContent);
        // event handler
        $(".delete-element").click(function (event) {
          let itemId = $(this).attr("data-item-id");
          console.log("This is the id for delete button" + itemId);
          let items_in_cart = get_cookie("shopping_cart_items");
          delete items_in_cart[itemId];

          set_cookie("shopping_cart_items", items_in_cart);
          console.log(items_in_cart);
          displayItems();
          if (Object.keys(items_in_cart).length === 0) {
            $("#dummy-text").show();
            $("#delete-item").hide();
            $("#button-container").addClass("d-none");
          }
        });
      });
      let itemsArr = Object.entries(get_cookie("shopping_cart_items"));
      itemsArr = itemsArr.forEach(([key, value]) => (this.counter += value));
      if (this.counter === 0) {
        $("#counter").hide();
      } else {
        $("#counter").show();
        $("#counter").html(this.counter);
      }
      this.counter = 0;
      getTotalPrice();
      if (Object.keys(items_in_cart).length === 0) {
        $("#dummy-text").show();
        $("#delete-item").hide();
        $("#button-container").addClass("d-none");
      }
    };

    // event handler
    $(".add-cart").click(function () {
      $("#dummy-text").hide();
      let product_id = $(this).attr("data-id");
      console.log(product_id);
      let cart_items = get_cookie("shopping_cart_items");

      if (cart_items === null) {
        cart_items = {};
      }
      if (cart_items[product_id] === undefined) {
        cart_items[product_id] = 0;
      }
      cart_items[product_id]++;

      set_cookie("shopping_cart_items", cart_items);
      displayItems();
    });
  }

  // finished
  getCardInformation() {
    fetch(`https://fakestoreapi.com/products`)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Something went wrong");
      })
      .then((data) => {
        this.items_catalog = data;
        console.log(this.items_catalog);
        this.createItems(data);
      })
      .catch((error) => {
        $("#items").html(`<div class="fs-1 text-danger">${error}</div>`);
      });
  }
}

$(document).ready(function () {
  set_cookie("shopping_cart_items", null);
  let catalog = new Catalog();
});
