/* 


  This is the final project for ICS128 where we had to develop an online store using our knowledge about javascript and libraries such as Bootstrap and jQuery.
   - The website has basic functionalities like an add-to-cart button which renders a table on the user's shopping cart with the items previously selected by the user. 
   -It also has a currency changer which will change the price value with its equivalent currency.
   -The shopping cart will contain the table with the user's items and the quantity for that specific item based on how many times that item's add-to-cart was cliked.
   =The shopping cart also counts with a continue button that will trigger a modal showing a standar checkout form which later will be sent to deepblue.



*/

// get the items

class Catalog {
  taxes = 0;
  typeOfCard = "";
  shippingCost = 20;
  validatedBlocks = [false, false, true]; // This array will check if each block has been validated and if there is an error the program will jump back to that block
  validatePhoneAndPc = [false, false]; // The JSON object should be provided with a valid phone and postal code otherwise the website will prompt a meaningful error message
  currency_symbol = "$"; // currency chosen by the user
  change_currency = 1; // change currency value
  items = [];
  items_catalog = [];
  cookies = [];
  counter = 0;

  // APIS
  API_URL = "https://fakestoreapi.com/products";
  BACK_UP_API_URL =
    "https://deepblue.camosun.bc.ca/~c0180354/ics128/final/fakestoreapi.json";
  CURR_API =
    "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/cad.json";

  // The constructor will call all the methods necessary for rendering the website
  constructor() {
    this.getCardInformation(); // will be in charge of fetching the items' information
    this.getCurrencyInformation(); // will enable the currency changer functionality
    this.submitButton(); // will create the event handlers for the modal and shopcart buttons
    this.useCookies(); // will render the shopping cart table depending on the cookies
    this.createExpYears(); // will create the experation years starting from the current year
    this.addUsProvinces(); // if the user is from USA then the datalist for the address will change
    this.findTaxesRate(); // taxes vary depending on the province entered by the user
  }

  /* 
    This method will calculate the tax rate depending on the user province. 
    Note: This method will only work with canadian provinces, if the user is from the US the tax rate will be set automatically to 0
  */
  calculateTaxes() {
    let province = $("#province-state").val();
    // If the shipping address is different than the billing address then we will use the province from the shipping address
    if (!$("#shipping-checkbox").is(":checked")) {
      province = $("#province-state-shipping").val();
      // if the country is not canada the tax rate will be 0
      if ($("#country-shipping :selected").val() === "US") {
        this.taxes = 0;
        this.renderOrderTable(); // the Order table will get re-rendered
        return;
      }
    } else {
      // if the country is not canada the tax rate will be 0
      if ($("#country :selected").val() === "US") {
        this.taxes = 0;
        this.renderOrderTable();
        return;
      }
    }
    // I applied a switch statement since an If else condition would be more difficult to read
    switch (province) {
      case "AB":
        this.taxes = 0.05;
        break;
      case "BC":
        this.taxes = 0.12;
        break;
      case "MB":
        this.taxes = 0.12;
        break;
      case "NB":
        this.taxes = 0.15;
        break;
      case "NL":
        this.taxes = 0.15;
        break;
      case "NT":
        this.taxes = 0.05;
        break;
      case "NS":
        this.taxes = 0.15;
        break;
      case "NU":
        this.taxes = 0.05;
        break;
      case "ON":
        this.taxes = 0.13;
        break;
      case "PE":
        this.taxes = 0.15;
        break;
      case "QC":
        this.taxes = 0.149;
        break;
      case "SK":
        this.taxes = 0.11;
        break;
      case "YT":
        this.taxes = 0.05;
        break;
      default:
        this.taxes = 0;
        break;
    }
    this.renderOrderTable(); // once we have the exact tax rate we will render the order table with the tax amount already calculated
  }
  // this function adds an onChange event to the city selection field so the tax amount is correctly calculated
  findTaxesRate() {
    $(".city-user").change((e) => {
      if (!$("#shipping-checkbox").is(":checked")) {
        if ($("#country-shipping :selected").val() === "US") {
          this.taxes = 0;
          this.renderOrderTable();
          return;
        }
      }
      if ($("#country :selected").val() === "US") {
        this.taxes = 0;
        this.renderOrderTable();

        return;
      }
    });
  }

  // This function will render the user shopping cart with the items they previously selected. If no items where selected then we will not handle anything
  useCookies() {
    // if the cookies are empty then we will not change the shopping cart
    if (jQuery.isEmptyObject(get_cookie("shopping_cart_items"))) {
      return;
    }
    if (get_cookie("shopping_cart_items") !== null) {
      this.setCounter(); // set the number of elements at the top right corner of the shopping button
      $("#button-container").removeClass("d-none"); // display the two buttons at the bottom of the shopping cart
      $("#button-container").addClass("d-flex"); // since we hid this container with the "d-none" we need to make show up and also have a flex display property
      $("#dummy-text").hide();
    }
  }

  // this function creates the address autocompletion through the geocoder api
  addGeocoder() {
    // This handler will make a called to the api everytime the element with the class ".geo-autocomplete" changes
    // the reason why I did not use a onChange eventhandler is because then the api would be called everytime the form is submitted
    // but the goal is to show the user the address with every word enter on the input field
    $(".geo-autocomplete").on("input", function () {
      // Get the option selected by the user and get its information through the data attributes which contain all the
      // address information but stripped into elements that are going to be placed on their respective input field in the form
      let opt = $('option[value="' + $(this).val() + '"]');

      if (opt.attr("data-city") !== undefined) {
        // if any of opt's data attributes is undefined then it means that the address does not exist or did not get to be rendered.
        // In this case I am using a random data attribute to check if that option exist

        let userCity = opt.attr("data-city"); // get the city from the data attribute
        let userProv = opt.attr("data-prov"); // get the province
        let userPC = opt.attr("data-pc"); // get the postal code

        // As i did with the options in the datalist, I had to create data attributes in the address element to store
        // the id's of the elements where all the address information would go to. Since for the billing address and shipping address
        // the input ids are different and i did not want the user to experience a collision with the data entered through the autocomplete functionality
        let cityInput = $(this).attr("data-city-user");
        let provinceInput = $(this).attr("data-province-user");
        let postalCode = $(this).attr("data-postal-code");
        let country = $(this).attr("data-country");

        // Set the address information to the correct input field
        $(cityInput).val(userCity);
        $(provinceInput).val(userProv);
        $(postalCode).val(userPC);
        $(country).val("CA");
      }
      let $element = $(this);

      // Since the address starts with a numeric value and then a string value
      // we need the numeric and string value to make a called to the API, that is why we need to split the address
      let addressInfo = $(this).val().split(" ");
      let addressString;

      // this condition will give the addressString variable a default value if the user has not yet entered an address
      if (addressInfo.length === 1) {
        addressString = "Some";
      } else {
        addressString = addressInfo[1];
      }
      fetch(
        `https://geocoder.ca/?autocomplete=1&geoit=xml&auth=test&json=1&locate=${addressInfo[0]}%20${addressString}`
      )
        .then((response) => {
          if (response.ok) {
            return response.json();
          }
          throw new Error("Server is not working");
        })
        .then((data) => {
          let streetDataList = "#" + $element.attr("list"); // get the datalist id from the "list" data attribute of the address input field
          let options;
          let addrs = [];
          let streets = data.streets.street; // get the streets from data

          // I realized that the streets can be either an array or just a string when there is just one address.
          // So first we need to check if the data is a string with the typeof keyword which will return "object" is an array or "string" if it is a string.

          if (typeof streets === "object") {
            // I am lopping 5 times since I do not want to overwhelm the user with street names
            for (let i = 0; i < 5; i++) {
              addrs[i] = streets[i].split(", "); // split the street name

              // All the data attributes previously mentioned are created here along with the option element
              // since we are splitting all the street names it will become a 2D array due to the split function returning an array
              options += `<option class="street-opt" value="${addrs[i][0]}" data-city="${addrs[i][1]}" data-prov="${addrs[i][2]}" data-pc="${addrs[i][3]}">${addrs[i][0]}</option>`;
            }
          } else {
            // this will happen if the street name is not an array but a String
            addrs[0] = streets.split(", ");
            options = `<option class="street-opt" value="${
              addrs[0][0]
            }" data-city="${addrs[0][1]}" data-prov="${addrs[0][2]}" data-pc="${
              addrs[0][3]
            }">${addrs[0][0] + " " + addrs[0][1]}</option>`;
          }

          $(streetDataList).html(options); // add the options to the datalist which will be shown to the user
        })
        .catch((e) => {
          console.log("autocompletion not working");
        });
    });
  }

  // If the user is from the US then the province options will change
  addUsProvinces() {
    $(".city-user").on("change", function (e) {
      let datalist = $(this).attr("data-prov-shipping");
      let canadianProv = $(this).attr("data-ca-shipping");
      let usProv = $(this).attr("data-us-shipping");

      // I am not rendering the options everytime beacuse that would be inneficient so i decided to create two datalist where
      // the first one contains canadian provinces and the other US states. Therefore, i just need to change the attribute "list" from the input field
      if ($(this).val() === "US") {
        $(datalist).attr("list", usProv); // show US states
      } else if ($(this).val() === "CA") {
        $(datalist).attr("list", canadianProv); // show canadian provinces
      }
    });
  }

  // this function will render the order table
  renderOrderTable() {
    let itemArr = get_cookie("shopping_cart_items");
    let idProducts = Object.keys(itemArr); // The Object.keys will return an array with the key attributes from an object, in this case the cookies
    let total = 0; // this variable will contain the total price
    let shipping = this.shippingCost * this.change_currency; // calculate the shipping cost, applying the currency equivalent if the user changed the currency type

    // create the header of the table
    let numProducts = `<thead><tr>
    <th scope="col">Item</th>
    <th scope="col">Qty</th>
    <th scope="col">Price</th>
    <th scope="col">Total</th>
    </tr></thead>`;
    numProducts += "<tbody>"; // the items information will be between a "tbody" tag

    // loop through the array with the keys obtained from the cookies
    idProducts.forEach((id) => {
      let { title, price } = this.items_catalog[id - 1]; // get the title and price of the items
      let priceItems = (price * this.change_currency).toFixed(2); // convert it to the appropiate currency
      total += itemArr[id] * priceItems; // add the items' price and store it in total

      // create the rows for the order table
      numProducts += `<tr>
        <td>${title}</td>
        <td>${itemArr[id]}</td>
        <td>${this.currency_symbol}${priceItems}</td>
        <td>${this.currency_symbol}${(itemArr[id] * priceItems).toFixed(2)}</td>
      <tr>`;
    });
    // calculate the total tax by multiplying the tax rate with total price
    // NOTE: if the user did not input a province then this.taxes will be 0 by default
    let totalTaxes = this.taxes * total;

    // calculate the total amount including shipping cost and taxes
    let orderPriceTotal =
      total + totalTaxes + this.shippingCost * this.change_currency;
    numProducts += "</tbody>"; // close the table body since we already rendered the items into the table

    // create the row to show the subtotal
    let tableSubtotal = `<tr>
                <th scope="col">Subtotal</th>
                <td></td>
                <td></td>
                <td>${this.currency_symbol}${total.toFixed(2)}</td>
    </tr>`;

    // create the row to  show the shipping cost
    let orderShipping = `<tr>
                        <th scope="col" >Shipping</th>
                        <td></td>
                        <td></td>
                        <td>${
                          this.currency_symbol
                        }<span id="cost-shipping">${shipping.toFixed(
      2
    )}</span></td>
                    </tr>`;
    // create the row to show the tax amount
    let tableTaxes = `<tr>
                            <th scope="col" >Taxes</th>
                            <td></td>
                            <td></td>
                            <td >${
                              this.currency_symbol
                            }<span id="taxes-order">${totalTaxes.toFixed(
      2
    )}</span></td>
                        </tr>`;

    // create the row to show the total amount
    let orderTotal = `<tr>
                              <th scope="col" >Total</th>
                              <td></td>
                              <td></td>
                              <td >${
                                this.currency_symbol
                              }<span id="total-amount-order">${orderPriceTotal.toFixed(
      2
    )}</span></td>
                          </tr>`;
    numProducts += tableSubtotal + orderShipping + tableTaxes + orderTotal; // add all the components
    $("#final-table").html(numProducts);
  }

  // Since I am using a select input for the experation years I decided to show 10 years starting from the current year so that there were less error prompts
  createExpYears() {
    let today = new Date(); // create a Date object which takes the current time
    let newYear = today.getFullYear(); // get the current year from the Date object
    let optionYears = '<option value="0">YYYY</option>'; // create a placeholder for the select field

    for (let i = 0; i < 10; i++) {
      optionYears += `<option value="${newYear + i}">${newYear + i}</option>`;
    }
    $("#expiration-year").html(optionYears);
  }

  // validate the expiration month
  verifyExMonth(expireMonth, expireYear, today) {
    // There will be an error if the expiration year equals the current year and the expiration month is less than the current month
    // so first we check that expiration year is greater than current year. Otherwise, we will verify that condition
    if (expireYear == today.getFullYear()) {
      // Since the getMonth() returns the month zero-based, we need to add 1
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
    }
    // I used the value 0 for the placeholder in the select, so if expireYear is zero it means the user has not selected a expiration year and the form would be incomplete
    else if (expireYear == 0) {
      $("#expiration-month").addClass("is-invalid");
      $("#expiration-month").removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#expiration-month", {
        title: "Please enter an expiration year",
      });
      return false;
    }
    // The same way I did with the expirationYear, if expirationMonth is zero it means the user has not entered a month
    else if (expireMonth == 0) {
      $("#expiration-month").addClass("is-invalid");
      $("#expiration-month").removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#expiration-month", {
        title: "Please enter an expiration month",
      });
      return false;
    }
    // if all the other conditions are not executed then the month is valid
    else {
      $("#expiration-month").removeClass("is-invalid");
      $("#expiration-month").addClass("is-valid");
      if ($("#expiration-month").tooltip != undefined) {
        $("#expiration-month").tooltip("dispose");
      }
      return true;
    }
  }

  // validate the expiration year
  verifyExYear(expireYear, today) {
    // Since the expiration year can be 0 when the user does not enter a year we need to make sure to prompt a meaningful error
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
        title: "Please enter an expiration year",
      });
      return false;
    }
  }

  // This function will called both the expiration year and expiration month validation
  validateExpirationDate() {
    let today = new Date(); // This Date object will be passed to the expiration year and expiration month validation
    let expireMonth = $("#expiration-month option:selected").val(); // get the month that the user selected. If not it will be zero
    let expireYear = $("#expiration-year option:selected").val(); // get the year that the user selected. If not it will be zero

    let resultYear = this.verifyExYear(expireYear, today);
    let resultMonth = this.verifyExMonth(expireMonth, expireYear, today);

    return resultMonth && resultYear; // it will return true if both expiration year and month are validated, false otherwise
  }

  // This function will validate the credit card number input by the user. I changed the Regular Expression so the user will have to enter the credit card number with spaces in between
  validateCardNum() {
    let cardNumber = $("#card-number");
    let num = cardNumber.val(); // get the value entered by the user
    let visa = /^4[0-9]{3}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}$/; // VISA regex
    let amex = /^3[47][0-9]{2}[ ][0-9]{6}[ ][0-9]{5}$/; // AMEX regex
    let masterCard =
      /^(5[1-5][0-9]{2}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|2(22[1-9][ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|2[3-9][0-9][ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|[3-6][0-9]{2}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|7[0-1][0-9]{1}[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}|720[ ][0-9]{4}[ ][0-9]{4}[ ][0-9]{4}))$/; // Master regex
    // If the the value entered by the user matches any of these patterns then the credit card is valid
    if (num.match(visa) || num.match(amex) || num.match(masterCard)) {
      // Check if the credit card is American Express
      if (num.match(amex)) {
        this.typeOfCard = "amex"; // The typeOfCard will be a reference regarding the security code validation. Because AMEX cards have a security code with 4 digits
      } else {
        this.typeOfCard = "others"; // The other cards have a security code with 3 digits
      }
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

  // validate security code
  validateSecurityCode() {
    let validCVV;

    // The typeOfCard will determine if the security code is 4 digits long or 3 digits long
    if (this.typeOfCard === "amex") {
      validCVV = /\b[0-9]{4}\b/;
    } else {
      validCVV = /\b[0-9]{3}\b/;
    }
    let CVV = $("#security-code").val(); // get the security code value
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
      title: "It should contain just 3 digits or 4 if it is American Express",
    });
    return false;
  }

  // This function will call the card, expiration date, and security code validation
  // This function will check whether all the fields in the payment block are valid
  validatePayment() {
    let validateCard = this.validateCardNum();
    let validateExpDate = this.validateExpirationDate();
    let validateSecurityCode = this.validateSecurityCode();

    let validation = validateCard && validateExpDate && validateSecurityCode;
    return validation;
  }

  // This function will validate the country
  // The parameter is the id of the select input, it could be from the billing address form or the shipping address form.
  validateCountry(userCountry) {
    let countrySelected = userCountry + " :selected"; // get the selected input value, if the user did not select any country the value will be 0

    // If the user selected a country
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

  // This function validates most of the input fields. Since the validation occurs after posting the json object to the server
  // the only constraint is that most of the data should be longer than 2 characters. So this function generalize that validation
  // - inputs is the id of the element
  // - general is the regular expression we are going to apply to all these input values
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
  /* 
    This function will validate the postal code which will change the Catalog attribute array from true or false depending on the validation.
    This is beacuse when sending the json object to the server the server will accept any postal or zip code even if it is invalid.
    - The this.validatePhoneAndPc array will check if the postal code is valid otherwise when sending the json Object to the server it will make some changes so the
    user is presented with a meaningful error prompt
    - this.validatePhoneAndPc[1] = true -> valid postal code or zip code
    - this.validatePhoneAndPc[1] = false -> invalid postal code or zip code

  */
  validatePC(userPC, userCountry) {
    let userPostal = $(userPC).val(); // get the postal code value
    let zipCode = /(^\d{5}$)|(^\d{5}-\d{4}$)/; // zip code regex
    let inputCountry = userCountry + " :selected";

    // If the user is from the US then we are not required to check for a valid canadian postal code but a zip code
    if ($(inputCountry).val() === "US") {
      if (userPostal.match(zipCode)) {
        $(userPC).removeClass("is-invalid");
        $(userPC).addClass("is-valid");
        if ($(userPC).tooltip != undefined) {
          $(userPC).tooltip("dispose");
        }
        this.validatePhoneAndPc[1] = true;
        return true;
      } else {
        $(userPC).addClass("is-invalid");
        $(userPC).removeClass("is-valid");
        let tooltip = new bootstrap.Tooltip(userPC, {
          title: "Please enter a valid zip code",
        });
        this.validatePhoneAndPc[1] = false;
        return false;
      }
    }
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
      this.validatePhoneAndPc[1] = true;
      return true;
    }
    // if postal code is empty
    if (userPostal === "") {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: "Please enter a postal code",
      });
      this.validatePhoneAndPc[1] = false;

      return false;
    }
    // if W or Z are at the start of the postal code, we will provide this message to the user
    if (userPostal[0] === "W" || userPostal[0] === "Z") {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: 'Postal code cannot start with "W" or "Z"',
      });
      this.validatePhoneAndPc[1] = false;

      return false;
    }

    // if there is a lower case letter in the postal code
    if (userPostal.match(invalidPostalCode)) {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: "Postal code should be in upper case",
      });
      this.validatePhoneAndPc[1] = false;

      return false;
    }
    // Check if the postal code length is appropiate
    if (!(userPostal.length > 5 && userPostal.length < 8)) {
      $(userPC).addClass("is-invalid");
      $(userPC).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userPC, {
        title: "Postal code is too long",
      });
      this.validatePhoneAndPc[1] = false;

      return false;
    }
    $(userPC).addClass("is-invalid");
    $(userPC).removeClass("is-valid");
    let tooltip = new bootstrap.Tooltip(userPC, {
      title: "Postal code cannot contain the letters D, F, I, O, Q, or U",
    });
    this.validatePhoneAndPc[1] = false;

    return false;
  }

  /* 
    This function will validate the province entered by the user
    - the parameter userProv is the id for the correct input

  */
  validateProv(userProv) {
    let datalistProv = "#" + $(userProv).attr("list") + " option"; // get the selector for the data list options
    let options = $(datalistProv);
    let matchProv = false;

    // if the province is greater than 2 characters an error prompt will be shown to the user
    // the value should be the abbrevation of that specific province or state
    if ($(userProv).val().length > 2) {
      $(userProv).addClass("is-invalid");
      $(userProv).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userProv, {
        title: "Enter the abbreviation of your province or state",
      });

      return false;
    }

    // Loop options.length times to check if the user entered any value equivalent to one option in the datalist
    // If so then the variable matchProv will be set to true
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === $(userProv).val()) {
        matchProv = true;
      }
    }
    // If matchProv is true then it means the user province was found in the datalist and therefore is validated
    if (matchProv) {
      $(userProv).removeClass("is-invalid");
      $(userProv).addClass("is-valid");
      if ($(userProv).tooltip != undefined) {
        $(userProv).tooltip("dispose");
      }

      return true;
    }
    // if postal code is empty or invalid
    else {
      $(userProv).addClass("is-invalid");
      $(userProv).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userProv, {
        title:
          "Please enter a valid state or province depending on the country you chose",
      });

      return false;
    }
  }

  /* 
    This function will validate the user phone number and set the first element in the validatePhoneandPc array to true if it is valid or false.
    -this.validatePhoneAndPc[0] = true -> valid phone number
    -this.validatePhoneAndPc[0] = false -> invalid phone number
  
  */
  validateUserPhoneNumber(userPhone) {
    let phoneNum = $(userPhone).val();
    // the three regular expressions follow the convention ###-###-####, ### ### ####, and ##########
    // the {n} means repetition where the left element is repeated n times
    // the \b sets some boundaries reducing the matches to the ones that follow the criteria
    //      Ex: 234 234 23456 would not match beacuse it has 13 elements in despite of having the 234 234 2345 the 6 is outside the boundary
    let phoneNumber1 = /\b[2-9][0-9]{2}-[2-9][0-9]{2}-[2-9][0-9]{3}\b/;
    let phoneNumber2 = /\b[2-9][0-9]{2} [2-9][0-9]{2} [2-9][0-9]{3}\b/;
    let phoneNumber3 = /\b[2-9][0-9]{2}[2-9][0-9]{2}[2-9][0-9]{3}\b/;
    let areaCode = /\b[2-9]1{2}\b/; // invalid area codes
    let zeroCounter = 0;

    // verify if the phone number follows one of these formats
    if (
      phoneNum.match(phoneNumber1) ||
      phoneNum.match(phoneNumber2) ||
      phoneNum.match(phoneNumber3)
    ) {
      // even if the phone number is valid, we need to make sure the area code is not reserved
      if (phoneNum.substring(0, 3).match(areaCode)) {
        $(userPhone).addClass("is-invalid");
        $(userPhone).removeClass("is-valid");
        let tooltip = new bootstrap.Tooltip(userPhone, {
          title: "Invalid area code, please reenter your phone number",
        });
        this.validatePhoneAndPc[0] = false;
        return false;
      }
      $(userPhone).removeClass("is-invalid");
      $(userPhone).addClass("is-valid");
      if ($(userPhone).tooltip != undefined) {
        $(userPhone).tooltip("dispose");
      }
      this.validatePhoneAndPc[0] = true;

      return true;
    } else {
      // count the number of zeros in the phone number
      for (let i = 0; i < phoneNum.length; i++) {
        if (phoneNum[i] === "0") {
          ++zeroCounter;
        }
      }
      // prompt an error if all the numbers are zeros
      if (zeroCounter >= 10) {
        $(userPhone).addClass("is-invalid");
        $(userPhone).removeClass("is-valid");
        let tooltip = new bootstrap.Tooltip(userPhone, {
          title: "Phone number cannot all be zeros",
        });
        this.validatePhoneAndPc[0] = false;
        return false;
      }

      // if the phone number contains a - or a space, we get rid of them so we can validate the numbers
      // the numbers are stored in "numbers" as an array
      let numbers = phoneNum.split("-");
      if (numbers.length !== 3) {
        numbers = phoneNum.split(" ");
      }

      // when joinning the elements in "numbers" checks if the string is a number
      if (
        !Number(numbers.join("")) ||
        (numbers.length !== 3 && numbers.length !== 1)
      ) {
        $(userPhone).addClass("is-invalid");
        $(userPhone).removeClass("is-valid");
        let tooltip = new bootstrap.Tooltip(userPhone, {
          title:
            "Please enter the number in the format ###-###-#### or ### ### #### or ##########",
        });
        this.validatePhoneAndPc[0] = false;

        return false;
      }

      // verifies if the phone number is too long or too short
      // if "number" length equals 3 means the user used either "-" or " "
      // if "mumber" length equals 1 means the user input just numbers
      if (numbers.length === 3) {
        if (phoneNum.length > 12) {
          $(userPhone).addClass("is-invalid");
          $(userPhone).removeClass("is-valid");
          let tooltip = new bootstrap.Tooltip(userPhone, {
            title: "Number is too long",
          });
          this.validatePhoneAndPc[0] = false;

          return false;
        } else if (phoneNum.length < 12) {
          $(userPhone).addClass("is-invalid");
          $(userPhone).removeClass("is-valid");
          let tooltip = new bootstrap.Tooltip(userPhone, {
            title: "Number is too short",
          });
          this.validatePhoneAndPc[0] = false;

          return false;
        }
      } else if (numbers.length === 1) {
        if (phoneNum.length > 10) {
          $(userPhone).addClass("is-invalid");
          $(userPhone).removeClass("is-valid");
          let tooltip = new bootstrap.Tooltip(userPhone, {
            title: "Number is too long",
          });
          this.validatePhoneAndPc[0] = false;

          return false;
        } else if (phoneNum.length < 10) {
          $(userPhone).addClass("is-invalid");
          $(userPhone).removeClass("is-valid");
          let tooltip = new bootstrap.Tooltip(userPhone, {
            title: "Number is too short",
          });
          this.validatePhoneAndPc[0] = false;

          return false;
        }
      }

      // verify if the start of each block in a phone number starts with a 0 or 1
      if (phoneNum.length === 10) {
        // Ex:2342342345 the start of each block are in indexes 0,3, and 6
        if (
          phoneNum[0] == 0 ||
          phoneNum[0] == 1 ||
          phoneNum[3] == 0 ||
          phoneNum[3] == 1 ||
          phoneNum[6] == 0 ||
          phoneNum[6] == 1
        ) {
          $(userPhone).addClass("is-invalid");
          $(userPhone).removeClass("is-valid");
          let tooltip = new bootstrap.Tooltip(userPhone, {
            title: "Phone number cannot start with 1 or 0",
          });
          this.validatePhoneAndPc[0] = false;

          return false;
        }
      } else {
        // Ex:234-234-2345 the start of each block are in indexes 0,4, and 8
        if (
          phoneNum[0] == 0 ||
          phoneNum[0] == 1 ||
          phoneNum[4] == 0 ||
          phoneNum[4] == 1 ||
          phoneNum[8] == 0 ||
          phoneNum[8] == 1
        ) {
          $(userPhone).addClass("is-invalid");
          $(userPhone).removeClass("is-valid");
          let tooltip = new bootstrap.Tooltip(userPhone, {
            title: "Phone number cannot start with 1 or 0",
          });
          this.validatePhoneAndPc[0] = false;

          return false;
        }
      }
    }
  }
  validateUserEmail(userEmail) {
    let emailString = $(userEmail).val();
    let emailUser = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    // ^ means the start of the string where the characters can be anything but @ or a whitespace
    // there should be a @
    // after the @ the characters allowed cannot be a @ or a whitespace
    // there should be a .
    // $ means the end of the string where the characters can be anything but @ or whitespaces
    if (emailString.match(emailUser)) {
      $(userEmail).removeClass("is-invalid");
      $(userEmail).addClass("is-valid");
      if ($(userEmail).tooltip != undefined) {
        $(userEmail).tooltip("dispose");
      }
      return true;
    }
    $(userEmail).addClass("is-invalid");
    $(userEmail).removeClass("is-valid");
    let tooltip = new bootstrap.Tooltip(userEmail, {
      title: "Please enter a valid email",
    });
    return false;
  }

  /* 
    This function will validate both the billing form and shipping form taking as parameters the ids of their specific input fields and the rest parameter moreInputs will take
    all the generic input fields (the ones that are validated as long as the value is greater than 2 characters)
  
  */
  validateUserInformation(userCountry, userPCInput, userProv, ...moreInputs) {
    let general = /[A-Za-z]{2}/; // gereric regular expression

    // this array will contain all the return values after calling the validateInputs method for all the generic input fields. (if all the elements in the array are true then all the generic fields are valid)
    let fieldsValidated = [];

    // loop the number of elements in the moreInputs array (how many arguments were entered after the userProv argument)
    for (let i = 0; i < moreInputs.length; i++) {
      fieldsValidated[i] = this.validateInputs(moreInputs[i], general); // call the validateInputs for all the generic inputs
    }
    let countryValidated = this.validateCountry(userCountry);
    let pcValidated = this.validatePC(userPCInput, userCountry);
    let provValidated = this.validateProv(userProv);

    // the fieldsValidated.every((field) => field === true) checks that all the elements in the array are true so we make sure all the generic inputs are valid
    return (
      countryValidated &&
      pcValidated &&
      provValidated &&
      fieldsValidated.every((field) => field === true)
    );
  }

  // This function will call all the validation methods for the billing form and return true if each block is valid
  validateBillingForm() {
    let userPhonenumber = this.validateUserPhoneNumber("#user-phone");
    let emailValidated = this.validateUserEmail("#user-email");
    let validatedInputs = this.validateUserInformation(
      "#country",
      "#postal-code",
      "#province-state",
      "#billing-addrs-01",
      "#user-name",
      "#city",
      "#province-state",
      "#user-lastname"
    );
    return userPhonenumber && emailValidated && validatedInputs;
  }

  // this function will call the validateUserInformation method which will return true if each input field in the shipping form is valid
  validateShippingForm() {
    let validatedShippingForm = this.validateUserInformation(
      "#country-shipping",
      "#postal-code-shipping",
      "#province-state-shipping",
      "#shipping-addrs-01",
      "#user-name-shipping",
      "#city-shipping",
      "#province-state-shipping",
      "#user-lastname-shipping"
    );
    return validatedShippingForm;
  }

  // If the user information is sucessfully sent to the server then we are going to delete the previous close button event handler which would
  // send you to the block where the error was found and instead it will delete all items and reload the page
  addCloseHandler() {
    $("#success-modal-close").off("click"); // get rid of the event handler for the #success-modal-close button
    $("#success-modal-close").on("click", (e) => {
      $("#delete-all-items").click();
      location.reload(true); // reload the page
    });
  }

  // This function will add the even handler to the close button when an error occurs while sending the user information to the server
  // The close button will go back to the tab where the error occured by lopping through the validatedBlocks array which has booleans representing
  // whether or not the block was validated beforehand
  addErrorCloseHandler() {
    $("#success-modal-close").on("click", (e) => {
      // loop through the validatedBlocks array
      for (let i = 0; i < this.validatedBlocks.length; i++) {
        // if the value for index i is false then that means that block has not yet been validated
        if (!this.validatedBlocks[i]) {
          $("#checkout-modal").click(); // open the checkout modal
          /* 
            we are going to jump back to the first block that presents an error
            - index 0 -> that would be the payment tab
            - index 1 -> billing information
            -index 2 -> shipping information
          */
          if (i == 0) {
            $("#pills-home-tab").click();
          } else if (i == 1) {
            $("#pills-billing-tab").click();
          } else {
            $("#pills-shipping-tab").click();
          }
          break;
        }
      }
    });
  }
  /* 
    This function will handle the submit information which will make a post request to the server. It will send a json object containing all the user
    information and if there is an invalid value the server will return an object called error with some error messages in it.
    -  if the server returns the error object then this function will prompt an error modal showing the error message returned by the server
    - if the status is SUBMITTED then there will be a success modal letting the user know their information was sucessfully processed by the server
  
  */
  submitData() {
    let itemsToSenc = {}; // this object will store all the items that the user selected
    let itemArr = get_cookie("shopping_cart_items");
    let idProducts = Object.keys(itemArr); // return the key values from the cookies

    // loop through the array to get the id of the item
    idProducts.forEach((id) => {
      let { title } = this.items_catalog[id - 1]; // get the product name
      itemsToSenc[title] = itemArr[id]; // in the object itemsToSenc will store the product name as an attribute with the quantity the user paid for that specific product
    });

    // get the other user information
    let totalAmountOrder = $("#total-amount-order").text();
    let totalTaxes = $("#taxes-order").text();
    let totalShipping = $("#cost-shipping").text();
    let currency = $("#input-currency :selected").val();

    let creditCardNumber = $("#card-number").val().split(" ").join("");
    let expMonth = "0" + $("#expiration-month").val();

    // If the user has not entered a month then the expiration month value will be 0 (since the placeholder option on the select element has a 0 value). However the server accepts this number therefore
    // the expiration month value will be changed to an empty string so the server returns an appropiate error message
    if ($("#expiration-month").val() == 0) {
      expMonth = "";
    }
    let expYear = $("#expiration-year").val();
    let securityCode = $("#security-code").val();
    let userName = $("#user-name").val();
    let userLastName = $("#user-lastname").val();
    let userAddress01 = $("#billing-addrs-01").val();
    let userAddress02 = $("#billing-addrs-02").val();
    let userCity = $("#city").val();
    let userProvince = $("#province-state").val();
    let userCountry = $("#country").val();
    let userPostalCode = $("#postal-code").val();
    let userPhoneNumber = $("#user-phone").val();
    let userEmail = $("#user-email").val();

    // create the billing information object
    let billingAddress = {
      first_name: userName,
      last_name: userLastName,
      address_1: userAddress01,
      address_2: userAddress02,
      city: userCity,
      province: userProvince,
      country: userCountry,
      postal: userPostalCode,
      phone: userPhoneNumber,
      email: userEmail,
    };

    // the shipping information will have the same values as the billing information if the user does not uncheck the shipping information checkbox
    let shippingAddress = {
      first_name: userName,
      last_name: userLastName,
      address_1: userAddress01,
      address_2: userAddress02,
      city: userCity,
      province: userProvince,
      country: userCountry,
      postal: userPostalCode,
    };

    // if shipping information is different than the billing address then the shippingAddress object will be overwritten
    if (!$("#shipping-checkbox").is(":checked")) {
      let userNameShipping = $("#user-name-shipping").val();
      let userLastNameShipping = $("#user-lastname-shipping").val();
      let userAddressShipping01 = $("#shipping-addrs-01").val();
      let userAddressShipping02 = $("#shipping-addrs-02").val();
      let userCityShipping = $("#city-shipping").val();
      let userProvinceShipping = $("#province-state-shipping").val();
      let userCountryShipping = $("#country-shipping").val();
      let userPostalCodeShipping = $("#postal-code-shipping").val();

      shippingAddress = {
        first_name: userNameShipping,
        last_name: userLastNameShipping,
        address_1: userAddressShipping01,
        address_2: userAddressShipping02,
        city: userCityShipping,
        province: userProvinceShipping,
        country: userCountryShipping,
        postal: userPostalCodeShipping,
      };
    }
    /* 
      As mentioned before the server does not validate phone numbers or postal code, so we need to check the values of the validatePhoneAndPc array.
      - if this.validatePhoneAndPc[0] = false then it means the user did not entered a valid phone number therefore we will overwrite the variable storing the phone number to an empty string
      - if the postal code is invalid then both the shipping and billing address will be changed to an empty string so the server returns a meaningful error message if this case occurs
    */

    if (this.validatePhoneAndPc[0] === false) {
      billingAddress.userPhoneNumber = "";
    } else if (this.validatePhoneAndPc[1] === false) {
      billingAddress.userPostalCode = "";
      shippingAddress.userPostalCodeShipping = "";
    }

    // create the object which will be sent to the server
    let submission_data = {
      card_number: creditCardNumber,
      expiry_month: expMonth,
      expiry_year: expYear,
      security_code: securityCode,
      amount: totalAmountOrder,
      taxes: totalTaxes,
      shipping_amount: totalShipping,
      currency: currency,
      items: itemsToSenc,
      billing: billingAddress,
      shipping: shippingAddress,
    };

    let form_data = new FormData();
    // convert the object into a json
    form_data.append("submission", JSON.stringify(submission_data));
    // where 'submission_data' is your JS object.

    fetch("https://deepblue.camosun.bc.ca/~c0180354/ics128/final/", {
      method: "POST",
      cache: "no-cache",
      body: form_data,
    })
      .then((response) => response.json())
      .then((data) => {
        // If the information we sent to the server is not appropiate then the status will be NOT SUBMITTED
        if (data.status === "NOT SUBMITTED") {
          let errors = data.error; // get the error object with the error messages
          let index = 0;
          let errorMessages = [];
          // loop through the object to get the error messages
          // NOTE: the error object can have objects which will contain the error messages for specific input fields
          for (const property in errors) {
            // if the one attribute of the error object is another object then we will loop thorugh that object and get the messages
            if (typeof errors[property] === "object") {
              for (const moreErrors in errors[property]) {
                errorMessages[index] = errors[property][moreErrors]; // get the messages
                index++;
              }
            }
            errorMessages[index] = errors[property]; // get the messages
            index++;
          }
          this.createInvalidModal(errorMessages[0]); // show an error prompt with the first error message in the array errorMessages
        }
        // if the status is SUBMITTED
        else {
          this.addCloseHandler(); // get rid of the previous error handler for the close button
          this.createValidModal(); // create the success modal
        }
      });
  }

  // create the success modal
  createValidModal() {
    let headerMessage = `<span><svg xmlns="http://www.w3.org/2000/svg" style="height:2rem;" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg></span> Sucess`;
    $("#feedback-header").removeClass("alert-danger");

    $("#feedback-header").addClass("alert");
    $("#feedback-header").addClass("alert-success");
    $("#feedback-title").html(headerMessage);
    $("#feedback-body").html("Your order has been successfully placed");
  }
  // create the invalid modal showing a meaningful error message which is given as an argument
  createInvalidModal(error) {
    let headerMessage = `<span><svg xmlns="http://www.w3.org/2000/svg" style="height:2rem;"class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg></span> Error`;
    let messageBody = error;
    $("#feedback-header").addClass("alert");
    $("#feedback-header").addClass("alert-danger");
    $("#feedback-title").html(headerMessage);
    $("#feedback-body").html(messageBody);
  }

  /* 
    This function will create all the event handlers for each tab in the checkout modal. It will call all the functions to verify the input fields
    and it will change the validatedBlocks array so when an error occurs the website will jump back where the error happened.

  */
  submitButton() {
    // if the shipping inforamtion is different than the billing address
    $("#shipping-checkbox").change(() => {
      $("#shipping-address").toggleClass("d-none"); // display the shipping form
      this.validatedBlocks[2] = !this.validatedBlocks[2]; // change the value of validatedBlocks at index 2 to true or false(toggle the value)
      this.calculateTaxes(); // if the shipping address is different than the billing address then we are going to take the shipping address province value to calculate the tax rate
    });
    // payment block
    // when submitting the payment form all the input fields will be validated and depending if all of them are valid the
    // value of validatedBlocks at index 0 will be true or false
    $("#payment-details").submit((e) => {
      e.preventDefault(); // prevents submittion
      let blockValidated = this.validatePayment(); // validate form
      if (blockValidated) {
        this.validatedBlocks[0] = true; // all inputs valid
      } else {
        this.validatedBlocks[0] = false;
      }
    });
    // the continue button at that tab will also validate all the input fields and if the form is validated it will immediatly jump to the next tab
    $("#validate-payment").click((e) => {
      if (this.validatePayment()) {
        this.validatedBlocks[0] = true;
        $("#pills-billing-tab").click();
      } else {
        this.validatedBlocks[0] = false;
      }
    });

    // billing information
    // validate all the input fields and if they are all valid the value of validatedBlocks at index 1 will be true
    $("#billing-info").submit((e) => {
      e.preventDefault();
      let blockValidated = this.validateBillingForm();
      if (blockValidated) {
        this.validatedBlocks[1] = true;
      } else {
        this.validatedBlocks[1] = false;
      }
      this.calculateTaxes(); // calculate taxes after validating the billing form
    });

    $("#validate-billing-addrs").click((e) => {
      let validation = this.validateBillingForm();
      this.calculateTaxes();
      if (validation) {
        this.validatedBlocks[1] = true;
        $("#pills-shipping-tab").click();
      } else {
        this.validatedBlocks[1] = false;
      }
    });

    // shipping information
    // if all the input fields are valid then the value of validatedBlocks at index 2 will be true
    $("#shipping-address").submit((e) => {
      e.preventDefault();
      let blockValidated = this.validateShippingForm();
      if (blockValidated) {
        this.validatedBlocks[2] = true;
      } else {
        this.validatedBlocks[2] = false;
      }
      this.calculateTaxes(); // calculate tax rate after validating the shipping form
    });
    // go to next tab if the form is validated
    $("#validate-shipping-address").click((e) => {
      if ($("#shipping-checkbox").is(":checked")) {
        $("#pills-disabled-tab").click();
      } else {
        if (this.validateShippingForm()) {
          this.validatedBlocks[2] = true;
          $("#pills-disabled-tab").click();
        } else {
          this.validatedBlocks[2] = false;
        }
        this.calculateTaxes();
      }
    });

    // Event handler for the order confirmation button which will validate all the forms and call the submitData method which will send the user information to the server
    // we are verifying all the forms so that if the user accidently clicks the order confirmation he will be prompted an error and the fields that caused that error will be highlighted
    $("#send-order").click((e) => {
      this.validatedBlocks[0] = this.validatePayment();
      this.validatedBlocks[1] = this.validateBillingForm();
      if (!$("#shipping-checkbox").is(":checked")) {
        this.validatedBlocks[2] = this.validateShippingForm();
      }
      this.calculateTaxes();
      this.addErrorCloseHandler();
      this.submitData();
    });
  }

  // create item cards in the website
  createItems(items) {
    // looping through the items array and destructuring to get the information we want
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
    this.add_event_handler(); // after rendering all the cards we will add the necessary event handlers such as the add-to-cart button
  }

  // This function will calculate the total price from the items in the shopping cart
  getTotalPrice = () => {
    const itemsInCart = $(".price-item"); // array of all the elements with the .price-item class
    let totalPrice = 0;
    // jquery allows you to lopp through an array of HTML elements by using the each method
    itemsInCart.each(function () {
      totalPrice += parseFloat($(this).text());
    });
    $("#total-price").html(this.currency_symbol + totalPrice.toFixed(2));
  };

  // Create the delete all items event listener
  addButtonEventListeners = () => {
    $("#delete-all-items").click(() => {
      set_cookie("shopping_cart_items", {}); // set the cookies to an empty object
      this.displayItems(); // re-render the shopping cart
    });
  };

  // this function will create the table in the shopping cart
  createTable = () => {
    $("#table-container").html(` <table class="table" id="shopping-cart-table">
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
    this.addButtonEventListeners(); // add the delete all items event listener
  };

  // This function will render the selected items in the shopping cart
  displayItems = () => {
    this.createTable(); // create the table
    let items_in_cart = get_cookie("shopping_cart_items"); // get the cookies
    let id_products = Object.keys(items_in_cart); // get the keys from the cookies that represent the id of the item
    // loop through the array
    id_products.forEach((id) => {
      let { title, price } = this.items_catalog[id - 1]; // get the tittle and the price from that item
      let priceItems = (price * this.change_currency).toFixed(2); // calculate the price depending on the currency change rate

      // create the row with the item information and using the correct currency symbol that the user chose on the currency changer
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

      // delete item event handler
      $(".delete-element").click((event) => {
        let itemId = event.target.getAttribute("data-item-id"); // get the id of the item from the data attribute of the element
        let items_in_cart = get_cookie("shopping_cart_items"); // get cookies
        delete items_in_cart[itemId]; // delete that item from the object

        set_cookie("shopping_cart_items", items_in_cart); // set the cookies with the new object
        this.displayItems(); // re-render the shopping cart table
        // if we delete all the items in the table then the dummy text will appear and the delete all and continue button will dissapear
        if (Object.keys(items_in_cart).length === 0) {
          $("#dummy-text").show(); // show dummy text
          $("#shopping-cart-table").hide(); // hide table
          $("#button-container").addClass("d-none"); // hide buttons at the bottom of the table
        }
      });
      this.renderOrderTable(); // render the order confirmation table since we are sure there is at least one item in the shopping cart
    });
    this.setCounter(); // set the counter on the top right corner of the shop item button
    this.getTotalPrice(); // calculate the total amount for the items in the shopping cart
    // if the shopping cart is empty then show the dummy text and hide buttons at the bottom of the shopping cart
    if (Object.keys(items_in_cart).length === 0) {
      $("#dummy-text").show();
      $("#shopping-cart-table").hide();
      $("#button-container").addClass("d-none");
    }
  };

  // This function set the counter every time the add to cart button is pressed or when the user deletes an item in the shopping cart
  setCounter = () => {
    let itemsArr = Object.entries(get_cookie("shopping_cart_items")); // convert the cookies into an array
    // iterate through the array destructuring the [key,value] of the array
    itemsArr = itemsArr.forEach(([key, value]) => (this.counter += value));

    // if there is not items in the shopping cart then the counter will dissapear
    if (this.counter === 0) {
      $("#counter").hide();
    } else {
      $("#counter").show();
      $("#counter").html(this.counter);
    }
    this.counter = 0; // set the counter to zero
  };

  // This function will add the add-to-cart event and the view-cart event
  add_event_handler() {
    this.addGeocoder(); // add the geocoder to the checkout modal
    // add to cart  event
    $(".add-cart").click((e) => {
      $("#dummy-text").hide(); // hide the dummy text
      $("#button-container").removeClass("d-none"); // show the buttons at the bottom of the table
      $("#button-container").addClass("d-flex");
      let product_id = e.target.getAttribute("data-id"); // get the id from the data attribute of the item

      let cart_items = get_cookie("shopping_cart_items");

      // if the cookies is null then we are creating an object where we are going to store the items
      if (cart_items === null) {
        cart_items = {};
      }

      // if we are adding a new item to the cart then the a new attribute will also be added to the cookies
      if (cart_items[product_id] === undefined) {
        cart_items[product_id] = 0;
      }
      cart_items[product_id]++; // if an item is seleted more than one time then add one to the quantity

      set_cookie("shopping_cart_items", cart_items); // set the cookies with the new object
      this.setCounter(); // set the counter
    });
    // view cart event handler
    $("#view-cart").click(() => {
      let cart_items = get_cookie("shopping_cart_items");
      // if the there is at least one item in the cookies, it will render the table in the shopping cart
      if (Object.keys(cart_items).length > 0) {
        this.displayItems();
      }
    });
  }

  // add the currency changer event listener
  addCurrencyEventListener(currencyArr) {
    // if the select input changes this function will handle it
    $("#input-currency").on("change", (e) => {
      let currency_val = e.target.value; // get the value of the selected option (type of currency)
      let value_currency = currencyArr.cad[currency_val]; // get the currency change rate

      this.change_currency = value_currency; // we will store the currency rate so we can change all the other elements
      // loop through all the prices of the item cards and give them a proper currency convertion
      $(".price").each(function (index) {
        let price_product = $(this).attr("data-price-product"); // get the price value from the data attribute of the item card
        let final_price = price_product * value_currency; // calculate the final price
        $(this).html(final_price.toFixed(2));
      });

      // we also want to change the currency symbol
      // currency val can be gbp, cad, or usd depending on the option the user chose
      if (currency_val === "gbp") {
        this.currency_symbol = "£";
        $(".currency-symbol").html("£");
      } else {
        this.currency_symbol = "$";
        $(".currency-symbol").html("$");
      }

      this.getTotalPrice(); // calculate total price
      this.renderOrderTable(); // render the order confirmation table
    });
  }

  // This function will display the loading screen
  displayLoading() {
    $("#loading").addClass("d-block");
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
        // if this API is also unavailable then we are going to show an error on the page
        $("#loading-container").addClass("d-none"); // hide the loading screen
        $("#items").html(
          `<div class="alert alert-danger"><svg xmlns="http://www.w3.org/2000/svg" style="height: 30px;" class="me-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>${error.message}</div>`
        );
      });
  }

  // This function will call the API where we will get the items information. We are also going to render the items after getting the data
  getCardInformation() {
    this.displayLoading(); // display the loading screen
    // call the API
    fetch(this.API_URL)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Something went wrong");
      })
      .then((data) => {
        $("#loading").removeClass("d-block"); // hide the loading screen
        $("#loading-container").addClass("d-none");

        this.items_catalog = data; // store the items information in the items_catalog variable
        this.createItems(data); // render the item cards
      })
      .catch((error) => {
        // if there is an error with the API then we are going to do the same call but with the backup API
        this.getBackupInformation();
      });
  }

  // This function will call the currency changer API
  getCurrencyInformation() {
    fetch(this.CURR_API)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        throw new Error("Currency not working");
      })
      .then((data) => {
        this.addCurrencyEventListener(data); // add the event listener to the select input to change currency on the web page
      })
      .catch((e) => {
        // if an error occurs then we are going to hide the select input for changing currency since we are not going to need it
        $("#currency-changer").hide(); // hide the currency changer
      });
  }
}

$(document).ready(function () {
  // create an instance of a Catalog
  let catalog = new Catalog();
});
