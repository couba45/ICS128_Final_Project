// get the items

class Catalog {
  taxes = 0;
  typeOfCard = "";
  shippingCost = 20;
  validatePhoneAndPc = [false, false];
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
    this.findTaxesRate();
  }
  calculateTaxes() {
    let $this = this;
    let province = $("#province-state").val();
    if (!$("#shipping-checkbox").is(":checked")) {
      province = $("#province-state-shipping").val();
      if ($("#country-shipping :selected").val() === "US") {
        $this.taxes = 0;
        $this.renderOrderTable();
        return;
      }
    } else {
      console.log($("#country :selected").val());
      if ($("#country :selected").val() === "US") {
        $this.taxes = 0;
        $this.renderOrderTable();

        return;
      }
    }
    switch (province) {
      case "AB":
        $this.taxes = 0.05;
        break;
      case "BC":
        $this.taxes = 0.12;
        break;
      case "MB":
        $this.taxes = 0.12;
        break;
      case "NB":
        $this.taxes = 0.15;
        break;
      case "NL":
        $this.taxes = 0.15;
        break;
      case "NT":
        $this.taxes = 0.05;
        break;
      case "NS":
        $this.taxes = 0.15;
        break;
      case "NU":
        $this.taxes = 0.05;
        break;
      case "ON":
        $this.taxes = 0.13;
        break;
      case "PE":
        $this.taxes = 0.15;
        break;
      case "QC":
        $this.taxes = 0.149;
        break;
      case "SK":
        $this.taxes = 0.11;
        break;
      case "YT":
        $this.taxes = 0.05;
        break;
      default:
        $this.taxes = 0;
        break;
    }
    console.log($("#province-state").val());
    $this.renderOrderTable();
  }
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

    /* let province = $("#province-state-shipping").val();
      if ($("#shipping-checbox").is(":checked")) {
        province = $("#province-state").text();
        if ($("#country-shipping :selected").val() === "US") {
          $this.taxes = 0;
          return;
        }
      } else {
        if ($("#country :selected").val() === "US") {
          $this.taxes = 0;
          return;
        }
      }
      switch (province) {
        case "AB":
          $this.taxes = 0.05;
          break;
        case "BC":
          $this.taxes = 0.12;
          break;
        default:
          $this.taxes = 0;
          break;
      }
      console.log($("#province-state-shipping").text());
      $this.renderOrderTable();
      */
  }
  useCookies() {
    if (jQuery.isEmptyObject(get_cookie("shopping_cart_items"))) {
      return;
    }
    if (get_cookie("shopping_cart_items") !== null) {
      this.setCounter();
      $("#button-container").removeClass("d-none");
      $("#button-container").addClass("d-flex");
      $("#dummy-text").hide();
    }
  }
  addGeocoder() {
    $(".geo-autocomplete").on("input", function () {
      let opt = $('option[value="' + $(this).val() + '"]');
      if (opt.attr("data-city") !== undefined) {
        let userCity = opt.attr("data-city");
        let userProv = opt.attr("data-prov");
        let userPC = opt.attr("data-pc");
        let cityInput = $(this).attr("data-city-user");
        let provinceInput = $(this).attr("data-province-user");
        let postalCode = $(this).attr("data-postal-code");
        let country = $(this).attr("data-country");
        $(cityInput).val(userCity);
        $(provinceInput).val(userProv);

        $(postalCode).val(userPC);

        $(country).val("CA");
      }
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
            for (let i = 0; i < 5; i++) {
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
    let shipping = this.shippingCost * this.change_currency;

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
    let totalTaxes = this.taxes * total;
    let orderPriceTotal =
      total + totalTaxes + +this.shippingCost * this.change_currency;
    numProducts += "</tbody>";
    let tableSubtotal = `<tr>
                <th scope="col">Subtotal</th>
                <td></td>
                <td></td>
                <td>${this.currency_symbol}${total.toFixed(2)}</td>
    </tr>`;
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
    } else if (expireMonth == 0) {
      $("#expiration-month").addClass("is-invalid");
      $("#expiration-month").removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip("#expiration-month", {
        title: "Please enter expiration month",
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
      if (num.match(amex)) {
        this.typeOfCard = "amex";
      } else {
        this.typeOfCard = "others";
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
  validateSecurityCode() {
    let validCVV;
    if (this.typeOfCard === "amex") {
      validCVV = /\b[0-9]{4}\b/;
    } else {
      validCVV = /\b[0-9]{3}\b/;
    }
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
      title: "It should contain just 3 digits or 4 if it is American Express",
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
  validatePC(userPC, userCountry) {
    let userPostal = $(userPC).val();
    let zipCode = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
    let inputCountry = userCountry + " :selected";
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
    console.log(userPostal.length);
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
  validateProv(userProv) {
    let datalistProv = "#" + $(userProv).attr("list") + " option";
    let options = $(datalistProv);
    let matchProv = false;
    if ($(userProv).val().length > 2) {
      $(userProv).addClass("is-invalid");
      $(userProv).removeClass("is-valid");
      let tooltip = new bootstrap.Tooltip(userProv, {
        title: "Enter the abbreviation of your province or state",
      });

      return false;
    }
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === $(userProv).val()) {
        matchProv = true;
      }
    }
    if (matchProv) {
      $(userProv).removeClass("is-invalid");
      $(userProv).addClass("is-valid");
      if ($(userProv).tooltip != undefined) {
        $(userProv).tooltip("dispose");
      }

      return true;
    }
    // if postal code is empty
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
  validateUserInformation(userCountry, userPCInput, userProv, ...moreInputs) {
    let general = /[A-Za-z]{2}/;
    console.log(moreInputs);
    let fieldsValidated = [];
    for (let i = 0; i < moreInputs.length; i++) {
      fieldsValidated[i] = this.validateInputs(moreInputs[i], general);
    }
    let countryValidated = this.validateCountry(userCountry);
    let pcValidated = this.validatePC(userPCInput, userCountry);
    let provValidated = this.validateProv(userProv);

    return (
      countryValidated &&
      pcValidated &&
      provValidated &&
      fieldsValidated.every((field) => field === true)
    );
  }
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
  addCloseHandler() {
    $("#success-modal-close").click((e) => {
      $("#delete-all-items").click();
      location.reload(true);
    });
  }
  submitData() {
    let itemsToSenc = {};
    let itemArr = get_cookie("shopping_cart_items");
    let idProducts = Object.keys(itemArr);
    idProducts.forEach((id) => {
      let { title } = this.items_catalog[id - 1];
      itemsToSenc[title] = itemArr[id];
    });
    let totalAmountOrder = $("#total-amount-order").text();
    let totalTaxes = $("#taxes-order").text();
    let totalShipping = $("#cost-shipping").text();
    let currency = $("#input-currency :selected").val();

    let creditCardNumber = $("#card-number").val().split(" ").join("");
    let expMonth = "0" + $("#expiration-month").val();
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
    console.log(currency);
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
    console.log(submission_data);
    let form_data = new FormData();
    form_data.append("submission", JSON.stringify(submission_data));
    // where 'submission_data' is your JS object.

    fetch("https://deepblue.camosun.bc.ca/~c0180354/ics128/final/", {
      method: "POST",
      cache: "no-cache",
      body: form_data,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (data.status === "NOT SUBMITTED") {
          let errors = data.error;
          let index = 0;
          let errorMessages = [];
          for (const property in errors) {
            if (typeof errors[property] === "object") {
              for (const moreErrors in errors[property]) {
                errorMessages[index] = errors[property][moreErrors];
                index++;
              }
            }
            errorMessages[index] = errors[property];
            index++;
          }
          this.createInvalidModal(errorMessages[0]);
        } else {
          this.addCloseHandler();
          this.createValidModal();
        }
      });
  }
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
  submitButton() {
    $("#shipping-checkbox").change(() => {
      $("#shipping-address").toggleClass("d-none");
      this.calculateTaxes();
    });
    $("#payment-details").submit((e) => {
      e.preventDefault();
      this.validatePayment();
    });
    $("#validate-payment").click((e) => {
      if (this.validatePayment()) {
        $("#pills-profile-tab").click();
      }
    });

    // billing address
    $("#billing-info").submit((e) => {
      e.preventDefault();
      this.validateBillingForm();
      this.calculateTaxes();
    });
    $("#shipping-address").submit((e) => {
      e.preventDefault();
      this.validateShippingForm();
      this.calculateTaxes();
    });
    $("#validate-billing-addrs").click((e) => {
      let validation = this.validateBillingForm();
      this.calculateTaxes();
      if (validation) {
        $("#pills-contact-tab").click();
      }
    });
    $("#validate-shipping-address").click((e) => {
      if (this.validateShippingForm()) {
        $("#pills-disabled-tab").click();
      }
      this.calculateTaxes();
    });
    $("#send-order").click((e) => {
      this.validatePayment();
      this.validateBillingForm();
      if (!$("#shipping-checkbox").is(":checked")) {
        this.validateShippingForm();
      }
      this.calculateTaxes();
      console.log(this.validatePhoneAndPc);
      if (this.validatePhoneAndPc.every((el) => el === true)) {
        this.submitData();
      } else {
        if (this.validatePhoneAndPc[0] === false) {
          this.createInvalidModal("Please enter all your information");
        } else {
          this.createInvalidModal("Please enter all your information");
        }
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
