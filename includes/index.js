// get the items

class Catalog {
  shippingCost = 20;
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
    this.useCookies();
    this.createExpYears();
    this.addUsProvinces();
  }
  useCookies() {
    if (get_cookie("shopping_cart_list") !== undefined) {
      this.setCounter();
      $("#button-container").removeClass("d-none");
      $("#button-container").addClass("d-flex");
    }
  }
  addGeocoder() {
    $(".geo-autocomplete").on("input", function () {
      let $element = $(this);
      let addressInfo = $(this).val().split(" ");
      let addressString;
      if (addressInfo.length === 1) {
        addressString = "Some";
      } else {
        addressString = addressInfo[1];
      }
      console.log(addressString);
      fetch(
        `https://geocoder.ca/?autocomplete=1&geoit=xml&auth=test&json=1&locate=${addressInfo[0]}%20${addressString}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Currency not working");
        })
        .then((data) => {
          let streetDataList = "#" + $element.attr("list");
          let options;
          let addrs = [];
          let streets = data.streets.street;
          console.log(typeof streets);
          if (typeof streets === "object") {
            for (let i = 0; i < streets.length; i++) {
              addrs[i] = streets[i].split(", ");
              options += `<option class="street-opt" value="${addrs[i][0]}" data-city="${addrs[i][1]}" data-prov="${addrs[i][2]}" data-pc="${addrs[i][3]}">${addrs[i][0]}</option>`;
            }
          } else {
            addrs[0] = streets.split(", ");
            options = `<option class="street-opt" value="${
              addrs[0][0]
            }" data-city="${addrs[0][1]}" data-prov="${addrs[0][2]}" data-pc="${
              addrs[0][3]
            }">${addrs[0][0] + " " + addrs[0][1]}</option>`;
          }
          let opt = $('option[value="' + $(this).val() + '"]');
          if (opt.attr("data-city") !== undefined) {
            let userCity = opt.attr("data-city");
            let userProv = opt.attr("data-prov");
            let userPC = opt.attr("data-pc");
            let cityInput = $(this).attr("data-city-user");
            let provinceInput = $(this).attr("data-province-user");
            let postalCode = $(this).attr("data-postal-code");
            let country = $(this).attr("data-country");
            $(cityInput).attr("value", userCity);
            $(provinceInput).attr("value", userProv);
            $(postalCode).attr("value", userPC);
            $(country).val("CA");
          }
          $(streetDataList).html(options);
        })
        .catch((e) => {
          console.log("autocompletion not working");
        });
    });
  }
  addUsProvinces() {
    $(".city-user").on("change", function (e) {
      let datalist = $(this).attr("data-prov-shipping");
      let canadianProv = $(this).attr("data-ca-shipping");
      let usProv = $(this).attr("data-us-shipping");
      if ($(this).val() === "US") {
        $(datalist).attr("list", usProv);
      } else if ($(this).val() === "CA") {
        $(datalist).attr("list", canadianProv);
      }
    });
  }

  renderOrderTable() {
    let itemArr = get_cookie("shopping_cart_items");
    let idProducts = Object.keys(itemArr);
    let total = 0;
    let taxes = 0;
    let numProducts = `<thead><tr>
    <th scope="col">Item</th>
    <th scope="col">Qty</th>
    <th scope="col">Price</th>
    <th scope="col">Total</th>
    </tr></thead>`;
    numProducts += "<tbody>";

    idProducts.forEach((id) => {
      let { title, price } = this.items_catalog[id - 1];
      let priceItems = (price * this.change_currency).toFixed(2);
      total += itemArr[id] * priceItems;
      numProducts += `<tr>
        <td>${title}</td>
        <td>${itemArr[id]}</td>
        <td>${this.currency_symbol}${priceItems}</td>
        <td>${this.currency_symbol}${(itemArr[id] * priceItems).toFixed(2)}</td>
      <tr>`;
    });
    numProducts += "</tbody>";
    let tableSubtotal = `<tr>
                <th scope="col">Subtotal</th>
                <td></td>
                <td></td>
                <td>${this.currency_symbol}${total.toFixed(2)}</td>
    </tr>`;
    let orderShipping = `<tr>
                        <th scope="col">Shipping</th>
                        <td></td>
                        <td></td>
                        <td>${this.currency_symbol}${(
      this.shippingCost * this.change_currency
    ).toFixed(2)}</td>
                    </tr>`;
    let tableTaxes = `<tr>
                            <th scope="col">Taxes</th>
                            <td></td>
                            <td></td>
                            <td>${this.currency_symbol}${taxes}</td>
                        </tr>`;

    let orderTotal = `<tr>
                              <th scope="col">Total</th>
                              <td></td>
                              <td></td>
                              <td>${this.currency_symbol}${(
      total +
      taxes +
      +this.shippingCost * this.change_currency
    ).toFixed(2)}</td>
                          </tr>`;
    numProducts += tableSubtotal + orderShipping + tableTaxes + orderTotal;
    $("#final-table").html(numProducts);
  }
  // handle modal
  createExpYears() {
    let today = new Date();
    let newYear = today.getFullYear();
    let optionYears = '<option value="0">YYYY</option>';
    for (let i = 0; i < 10; i++) {
      optionYears += `<option value="${newYear + i}">${newYear + i}</option>`;
    }
    $("#expiration-year").html(optionYears);
  }

  verifyExMonth(expireMonth, expireYear, today) {
    console.log(today.getFullYear());
    if (expireYear == today.getFullYear()) {
      if (expireMonth > today.getMonth() + 1) {
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
    } else if (expireYear == 0) {
      $("#expiration-month").addClass("is-invalid");
      $("#expiration-month").removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#expiration-month", {
        title: "Invalid month",
      });
      return false;
    } else {
      $("#expiration-month").removeClass("is-invalid");
      $("#expiration-month").addClass("is-valid");
      if ($("#expiration-month").tooltip != undefined) {
        $("#expiration-month").tooltip("dispose");
      }
      return true;
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
    let expireMonth = $("#expiration-month option:selected").val();

    let expireYear = $("#expiration-year option:selected").val();
    let resultYear = this.verifyExYear(expireYear, today);
    let resultMonth = this.verifyExMonth(expireMonth, expireYear, today);

    return resultMonth && resultYear;
  }

  validateCardNum() {
    let cardNumber = $("#card-number");
    let num = cardNumber.val();
    /*
    let ccNumArr = cardNumber.val().split(" ");
    console.log(ccNumArr);
    let ccNum = ccNumArr.join("");
    if (!(ccNumArr.length <= 4 && ccNumArr.length >= 3)) {
      cardNumber.addClass("is-invalid");
      cardNumber.removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#card-number", {
        title:
          "Please enter card number in the format #### #### #### #### or if it is amex #### ###### #####",
      });
      return false;
    }
    */
    let visa = /^4[0-9]{3}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}$/;
    let amex = /^3[47][0-9]{2}[ ][0-9]{6}[ ][0-9]{5}$/;
    let masterCard =
      /^(5[1-5][0-9]{2}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|2(22[1-9][ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|2[3-9][0-9][ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|[3-6][0-9]{2}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|7[0-1][0-9]{1}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|720[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}))$/;
    if (num.match(visa) || num.match(amex) || num.match(masterCard)) {
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
        title:
          "Please enter the card number in the format #### #### #### #### or #### ###### ##### (American Express)",
      });
      return false;
    }
  }
  validateSecurityCode() {
    let validCVV = /\b[0-9]{4}\b/;
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

  validateCountry(userCountry) {
    let countrySelected = userCountry + " :selected";
    if ($(countrySelected).val() != 0) {
      $(userCountry).removeClass("is-invalid");
      $(userCountry).addClass("is-valid");
      if ($(userCountry).tooltip != undefined) {
        $(userCountry).tooltip("dispose");
      }
      return true;
    } else {
      $(userCountry).addClass("is-invalid");
      $(userCountry).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userCountry, {
        title: "Value should be greater than 2 characters.",
      });
      return false;
    }
  }
  validateInputs(inputs, general) {
    if ($(inputs).val().match(general)) {
      $(inputs).removeClass("is-invalid");
      $(inputs).addClass("is-valid");
      if ($(inputs).tooltip != undefined) {
        $(inputs).tooltip("dispose");
      }
      return true;
    } else {
      $(inputs).addClass("is-invalid");
      $(inputs).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(inputs, {
        title: "Value should be greater than 2 characters.",
      });
      return false;
    }
  }
  validatePC(userPC) {
    let userPostal = $(userPC).val();
    let postalCodeString =
      /^[^DFIOQUWZa-z][0-9][^DFIOQUa-z] ?[0-9][^DFIOQUa-z][0-9]$/;
    // The format is LNLNLN or LNL NLN
    // Invalid letters D,F,I,O,Q,and U
    // The postal code cannot start with W or Z
    // If the letters are in lower case, it will not match
    // The ? means that the whitespace is optional
    let invalidPostalCode = /[a-z]+/;
    if (userPostal.match(postalCodeString)) {
      $(userPC).removeClass("is-invalid");
      $(userPC).addClass("is-valid");
      if ($(userPC).tooltip != undefined) {
        $(userPC).tooltip("dispose");
      }
      return true;
    }
    // if postal code is empty
    if (userPostal === "") {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: "Please enter a postal code",
      });
      return false;
    }
    // if W or Z are at the start of the postal code, we will provide this message to the user
    if (userPostal[0] === "W" || userPostal[0] === "Z") {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: 'Postal code cannot start with "W" or "Z"',
      });
      return false;
    }

    // if there is a lower case letter in the postal code
    if (userPostal.match(invalidPostalCode)) {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: "Postal code should be in upper case",
      });
      return false;
    }
    console.log(userPostal.length);
    if (!(userPostal.length > 5 && userPostal.length < 8)) {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: "Postal code is too long",
      });
      return false;
    }
    $(userPC).addClass("is-invalid");
    $(userPC).removeClass("is-valid");
    let tooltip = new bootstrap.Tooltip(userPC, {
      title: "Postal code cannot contain the letters D, F, I, O, Q, or U",
    });
    return false;
  }
  validateUserInformation(userCountry, userPCInput, ...moreInputs) {
    let general = /[A-Za-z]{2}/;
    console.log(moreInputs);
    let fieldsValidated = [];
    for (let i = 0; i < moreInputs.length; i++) {
      fieldsValidated[i] = this.validateInputs(moreInputs[i], general);
    }
    this.validateCountry(userCountry);
    this.validatePC(userPCInput);
  }
  submitButton() {
    $("#shipping-checkbox").change(() => {
      $("#shipping-address").toggleClass("d-none");
    });
    $("#payment-details").submit((e) => {
      e.preventDefault();
      if (this.validatePayment()) {
        this.validateModal[0] = true;
        console.log(this.validateModal);
      } else {
        this.validateModal[0] = false;
        console.log(this.validateModal);
      }
    });
    $("#validate-payment").click((e) => {
      if (this.validatePayment()) {
        this.validateModal[0] = true;
        $("#pills-profile-tab").click();
      } else {
        this.validateModal[0] = false;
        console.log(this.validateModal);
      }
    });

    // billing address
    $("#billing-info").submit((e) => {
      e.preventDefault();
      this.validateUserInformation(
        "#country",
        "#postal-code",
        "#billing-addrs-01",
        "#user-name",
        "#city",
        "#province-state",
        "#user-lastname"
      );
    });
    $("#validate-billing-addrs").click((e) => {
      $("#pills-contact-tab").click();
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
      this.renderOrderTable();
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
    this.addGeocoder();
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
      this.renderOrderTable();
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
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Currency not working");
      })
      .then((data) => {
        this.addCurrencyEventListener(data);
      })
      .catch((e) => {
        $("#input-currency").hide();
        console.log("Currency changer not working");
      });
  }
}

$(document).ready(function () {
  let catalog = new Catalog();
});
