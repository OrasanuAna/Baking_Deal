'use strict';

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// The displayMovements function renders transactions (deposits/withdrawals) in the UI:
// 1. Clears the container to avoid duplicate entries.
// 2. Iterates over the movements array to identify each transaction type.
// 3. Creates and inserts an HTML template for each transaction at the top of the container.
const displayMovements = function (movements) {
  containerMovements.innerHTML = '';

  movements.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `
     <div class="movements__row">
       <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
       <div class="movements__value">${mov}Є</div>
     </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// The calcDisplayBalance function calculates and displays the account balance:
// 1. Uses reduce() to sum up all movements in the acc.movements array.
// 2. Stores the total in acc.balance.
// 3. Updates the UI to display the balance in the labelBalance element.
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance}Є`;
};

// The calcDisplaySummary function calculates and displays the account summary:
// 1. Calculates total deposits (incomes) using filter() and reduce().
// 2. Calculates total withdrawals (out) similarly and displays the absolute value.
// 3. Calculates total interest earned on deposits that meet a minimum threshold (>= 1).
// 4. Updates the UI with these values in their respective labels.
const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes}Є`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out)}Є`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest}Є`;
};

// The createUsername function generates a username for each account:
// 1. Converts the account owner's name to lowercase.
// 2. Splits the name into an array of words.
// 3. Maps each word to its first letter and joins them to form the username.
// 4. Assigns the username to the acc.username property for each account in accs.

// The updateUI function refreshes the user interface with the latest account data:
// 1. Displays the list of movements using displayMovements.
// 2. Calculates and updates the account balance with calcDisplayBalance.
// 3. Calculates and updates the account summary with calcDisplaySummary.
const createUsername = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsername(accounts);

const updateUI = function (acc) {
  //Display movements
  displayMovements(acc.movements);

  //Display balance
  calcDisplayBalance(acc);

  //Display summary
  calcDisplaySummary(acc);
};

// Event handler for the login button click event:
// 1. Prevents the default form submission behavior with e.preventDefault().
// 2. Finds the account matching the entered username using find().
// 3. Verifies if the entered PIN matches the account's PIN.
// 4. If valid:
//    a. Displays a welcome message with the first name of the account owner.
//    b. Makes the app interface visible by setting containerApp.style.opacity to 100.
//    c. Clears the login input fields and removes focus from the PIN input.
//    d. Updates the UI with the current account's data using updateUI.
// 5. Logs the current account to the console for debugging.
// Event handler
let currentAccount;

btnLogin.addEventListener('click', function (e) {
  //Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Update UI
    updateUI(currentAccount);
  }
});

// Handles money transfer:
// 1. Prevents form submission and gets transfer amount and receiver's username.
// 2. Clears input fields.
// 3. Validates: amount > 0, receiver exists, enough balance, and not self-transfer.
// 4. If valid: updates movements for both accounts and refreshes the UI.
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    //Doind the trandfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Update UI
    updateUI(currentAccount);
  }
});

// Handles account closure:
// 1. Prevents form submission.
// 2. Validates: username and PIN match the current account.
// 3. If valid: finds the account index, deletes it from accounts, and hides the UI.
// 4. Clears input fields.
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);

    // .indexOf(23)

    //Delete account
    accounts.splice(index, 1);

    //Hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
});
