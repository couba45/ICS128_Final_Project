// get the items

class Catalog {
  validateModal = [false, false, false, false];
  currency_symbol = "$";
  change_currency = 1;
  items = [];
  items_catalog = [];
  cookies = [];
  counter = 0;
  API_URL = "https://fakestoreapi.com/products";
  BACK_UP_API_URL =
    "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
  CURR_API =
    "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json";
  constructor() {
    this.getCardInformation();
    this.getCurrencyInformation();
    this.submitButton();
  }
  // handle modal

  luhnAlgorithm(creditCardNumber) {
    const lengthNum = creditCardNumber.length;
    let sum = 0;
    let tmp;
    for (let i = lengthNum - 1; i >= 0; i--) {
      tmp = parseInt(creditCardNumber[i]);
      if ((i + 2) % 2 === 0) {
        tmp = tmp * 2;
        if (tmp > 9) {
          tmp -= 9;
        }
      }
      sum += tmp;
    }
    return sum % 10 === 0;
  }
  verifyExMonth(expireMonth, expireYear, today) {
    if (
      expireYear >= today.getFullYear() &&
      expireMonth <= 12 &&
      expireMonth > today.getMonth() + 1
    ) {
      $("#expiration-month").removeClass("is-invalid");
      $("#expiration-month").addClass("is-valid");
      if ($("#expiration-month").tooltip != undefined) {
        $("#expiration-month").tooltip("dispose");
      }
      return true;
    } else {
      $("#expiration-month").addClass("is-invalid");
      $("#expiration-month").removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#expiration-month", {
        title: "Invalid month",
      });
      return false;
    }
  }
  verifyExYear(expireYear, today) {
    if (expireYear >= today.getFullYear()) {
      $("#expiration-year").removeClass("is-invalid");
      $("#expiration-year").addClass("is-valid");
      if ($("#expiration-year").tooltip != undefined) {
        $("#expiration-year").tooltip("dispose");
      }
      return true;
    } else {
      $("#expiration-year").addClass("is-invalid");
      $("#expiration-year").removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#expiration-year", {
        title: "Invalid year",
      });
      return false;
    }
  }
  validateExpirationDate() {
    let today = new Date();
    let expireMonth = Number($("#expiration-month").val());
    let expireYear = Number($("#expiration-year").val());
    let resultMonth = this.verifyExMonth(expireMonth, expireYear, today);
    let resultYear = this.verifyExYear(expireYear, today);
    return resultMonth && resultYear;
  }

  validateCardNum() {
    let cardNumber = $("#card-number");
    let ccNum = cardNumber.val().split(" ").join("");
    let visa = /^4[0-9]{12}(?:[0-9]{3})?$/;
    let amex = /^3[47][0-9]{13}$/;
    let masterCard =
      /^(5[1-5][0-9]{14}|2(22[1-9][0-9]{12}|2[3-9][0-9]{13}|[3-6][0-9]{14}|7[0-1][0-9]{13}|720[0-9]{12}))$/;
    if (
      (ccNum.match(visa) || ccNum.match(amex) || ccNum.match(masterCard)) &&
      this.luhnAlgorithm(ccNum)
    ) {
      cardNumber.removeClass("is-invalid");
      cardNumber.addClass("is-valid");
      if (cardNumber.tooltip != undefined) {
        cardNumber.tooltip("dispose");
      }
      return true;
    } else {
      cardNumber.addClass("is-invalid");
      cardNumber.removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#card-number", {
        title: "Please enter a valid card number",
      });
      return false;
    }
  }
  validateSecurityCode() {
    let validCVV = /\b[0-9]{3}\b/;
    let CVV = $("#security-code").val();
    if (CVV.match(validCVV)) {
      $("#security-code").removeClass("is-invalid");
      $("#security-code").addClass("is-valid");
      if ($("#security-code").tooltip != undefined) {
        $("#security-code").tooltip("dispose");
      }
      return true;
    }
    $("#security-code").addClass("is-invalid");
    $("#security-code").removeClass("is-valid");
    let tooltip = new bootstrap.Tooltip("#security-code", {
      title: "It should contain just 3 digits",
    });
    return false;
  }
  validatePayment() {
    let validateCard = this.validateCardNum();
    let validateExpDate = this.validateExpirationDate();
    let validateSecurityCode = this.validateSecurityCode();

    let validation = validateCard && validateExpDate && validateSecurityCode;
    return validation;
  }
  submitButton() {
    $("#validate-payment").click((e) => {
      e.preventDefault();
      if (this.validatePayment()) {
        $("#pills-profile-tab").click();
        this.validateModal[0] = true;
        console.log(this.validateModal);
      } else {
        this.validateModal[0] = false;
        console.log(this.validateModal);
      }
    });
  }

  // create items in the website
  createItems(items) {
    for (let key of items) {
      const { id, image, title, price, description } = key;
      const html = `<div class="col-lg-4 col-md-6 col-12 mb-4" id="${id}_card">
                      <div class="card">
                        <div class="p-5"><img src="${image}" class="card-img-top" alt="..." /></div>
                        <div class="card-body">
                        <div class="fs-3 my-5">Price: <span class="currency-symbol">$</span><span id="${id}_product_price" class="price" data-price-product="${price.toFixed(
        2
      )}">${price.toFixed(2)}</span></div>
                        <h5 class="card-title">${title}</h5>
                        <p class="card-text">
                            ${description}
                        </p>
                        <button id="${id}_button" 
                                class="btn btn-primary add-cart" data-item="${title}" 
                                data-id="${id}">Add to Cart</button>
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
  getTotalPrice = () => {
    const itemsInCart = $(".price-item");
    let totalPrice = 0;
    itemsInCart.each(function () {
      totalPrice += parseFloat($(this).text());
    });
    $("#total-price").html(this.currency_symbol + totalPrice.toFixed(2));
  };

  // create table
  addButtonEventListeners = () => {
    $("#delete-all-items").click(() => {
      set_cookie("shopping_cart_items", {});
      this.displayItems();
    });
  };

  /*createButtons = () => {
    
    this.addButtonEventListeners();
  };*/

  createTable = () => {
    //create buttons

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
                                  `);
    this.addButtonEventListeners();
  };

  // display items
  displayItems = () => {
    this.createTable();
    let items_in_cart = get_cookie("shopping_cart_items");

    let id_products = Object.keys(items_in_cart);
    id_products.forEach((id) => {
      console.log(items_in_cart);
      let { title, price } = this.items_catalog[id - 1];
      let priceItems = (price * this.change_currency).toFixed(2);
      let tableContent = `<tr id="${id}">
                            <th class="delete-element"><svg xmlns="http://www.w3.org/2000/svg" style="height: 2rem; cursor:pointer;" class="text-danger cursor-pointer" viewBox="0 0 20 20" fill="currentColor" data-item-id="${id}">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clip-rule="evenodd" data-item-id="${id}"/>
                            </svg></th>
                            <th scope="row">${title}</th>
                            <td>${items_in_cart[id]}</td>
                            <td>
                              <span class="currency-symbol">${
                                this.currency_symbol
                              }</span><span class="price" data-price-product="${price}">${priceItems}</span></td>
                            <td>
                              <span class="currency-symbol">${
                                this.currency_symbol
                              }</span><span class="price-item price" data-price-product="${
        items_in_cart[id] * price
      }">${(items_in_cart[id] * priceItems).toFixed(2)}
                              </span>
                            </td>
                        </tr>`;
      $("#table-body").append(tableContent);
      // event handler
      $(".delete-element").click((event) => {
        let itemId = event.target.getAttribute("data-item-id");
        console.log("This is the id for delete button" + itemId);
        let items_in_cart = get_cookie("shopping_cart_items");
        delete items_in_cart[itemId];

        set_cookie("shopping_cart_items", items_in_cart);
        console.log(items_in_cart);
        this.displayItems();
        if (Object.keys(items_in_cart).length === 0) {
          $("#dummy-text").show();
          $("#delete-item").hide();
          $("#button-container").addClass("d-none");
        }
      });
    });
    this.setCounter();
    this.getTotalPrice();
    if (Object.keys(items_in_cart).length === 0) {
      $("#dummy-text").show();
      $("#delete-item").hide();
      $("#button-container").addClass("d-none");
    }
  };
  setCounter = () => {
    let itemsArr = Object.entries(get_cookie("shopping_cart_items"));
    itemsArr = itemsArr.forEach(([key, value]) => (this.counter += value));
    if (this.counter === 0) {
      $("#counter").hide();
    } else {
      $("#counter").show();
      $("#counter").html(this.counter);
    }
    this.counter = 0;
  };
  add_event_handler() {
    // get total price

    // event handler
    $(".add-cart").click((e) => {
      $("#dummy-text").hide();
      $("#button-container").removeClass("d-none");
      $("#button-container").addClass("d-flex");
      let product_id = e.target.getAttribute("data-id");
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
      this.setCounter();
    });
    // view cart event handler
    $("#view-cart").click(() => {
      let cart_items = get_cookie("shopping_cart_items");
      if (Object.keys(cart_items).length > 0) {
        this.displayItems();
      }
    });
  }
  addCurrencyEventListener(currencyArr) {
    $("#input-currency").on("change", (e) => {
      let currency_val = e.target.value;
      let value_currency = currencyArr.cad[currency_val];

      this.change_currency = value_currency;
      $(".price").each(function (index) {
        let price_product = $(this).attr("data-price-product");
        let final_price = price_product * value_currency;
        $(this).html(final_price.toFixed(2));
      });

      if (currency_val === "gbp") {
        this.currency_symbol = "£";
        $(".currency-symbol").html("£");
      } else {
        this.currency_symbol = "$";
        $(".currency-symbol").html("$");
      }

      this.getTotalPrice();
    });
  }

  // finished
  displayLoading() {
    $("#loading").addClass("display");
    // to stop loading after some time
  }
  getBackupInformation() {
    fetch(this.BACK_UP_API_URL)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw new Error("Something went wrong");
      })
      .then((data) => {
        $("#loading").removeClass("display");
        $("#loading-container").addClass("d-none");
        this.items_catalog = data;
        this.createItems(data);
      })
      .catch((error) => {
        $("#items").html(`<div class="fs-1 text-danger">${error}</div>`);
      });
  }
  getCardInformation() {
    this.displayLoading();
    fetch(this.API_URL)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Something went wrong");
      })
      .then((data) => {
        $("#loading").removeClass("display");
        $("#loading-container").addClass("d-none");

        this.items_catalog = data;
        console.log(this.items_catalog);
        this.createItems(data);
      })
      .catch((error) => {
        this.getBackupInformation();
      });
  }

  getCurrencyInformation() {
    fetch(this.CURR_API)
      .then((response) => response.json())
      .then((data) => {
        this.addCurrencyEventListener(data);
      });
  }
}

$(document).ready(function () {
  set_cookie("shopping_cart_items", null);
  let catalog = new Catalog();
});
