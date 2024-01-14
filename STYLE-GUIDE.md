# ExpressJs Style Guide and Project Structure

This is a minimal and opinionated guide for writing consistent and productive Node.Js and Express.js code.

## ExpressJS Directory Structure & Naming Conventions

- Models end with prefix model
- Controllers end with prefix controller
- Services end with prefix service
- Atils end with prefix util

    ```plain-text
    // Sample Project Structure

    SampleApp-Server/
    - .git
    - .gitignore
    - package.json

    - app.js        //  Cluster Node file
    - server.js     // Cluster Master, our main file that runs app.js
    - config/
        - base.js       // Base config file
        - env/      // Environment specific config files
            - development-e1.js
            - production-e2.js
        ...
    - routes/       // We should follow versioning standard.
        - v1/
            - home.route.js
        ...
    - middlewares/      // All middlewares goes here(per file basis)
        - session.js
        - track.js
        ...
    - models/
        - user.model.js
        ...
    - controllers/
        - home.controller.js
        ...
    - services/     // E.G, email sending service 📬
        - email.service.js  
        ...
    - schemas/      // Plays the same role as validators, but accounts for all forms of schema
        - dataModelSchema/
            - user.schema.js
        ...
        - requestSchema/
            - content.schema.js
        ...
    - utils/        
        - httpRequest.util.js
        ...
    - tests/
        ...
    ```

## Separate Express ‘app’ and ‘server’

Aim to divide your **Express** definition into at least two files the `server.js` file for networking concerns and the `app.js` file for the API declaration. Refrain from declaring your complete Express application in one large file.

## Use environment aware, secure and hierarchical config

A faultless and ideal configuration setup ought to guarantee
    a. You can read keys from both files and environment variables.
    b. Confidential information is stored outside of committed code.
    c. Config is hierarchical for easier findability.

There are a few packages that can help tick most of those boxes like **rc**, **nconf** and **config**.

## Error Handling Practices

### Use Async-Await or promises for async error handling

The callback approach of handling async errors is likely the quickest route to the pyramid of doom.

Instead, use async-await or a reliable promise library, which allow for a much more streamlined and recognizable code structure similar to `try-catch`.

```javascript
return functionA()
  .then((valueA) => functionB(valueA))
  .then((valueB) => functionC(valueB))
  .then((valueC) => functionD(valueC))
  .catch((err) => logger.error(err))
  .then(alwaysExecuteThisFunction())

async function executeAsyncTask () {

  try {
    const valueA = await functionA();
    const valueB = await functionB(valueA);
    const valueC = await functionC(valueB);
    return await functionD(valueC);
  }
  catch(err) {
    logger.error(err);
  }
}
```

### Use only the built-in Error object

Don't throw errors as strings or as special types, this makes error handling logic and module compatibility more difficult.

Whether you issue an error, reject a promise, or throw an exception, utilizing the built-in Error object alone will improve consistency and guard against data loss.

```javascript
// throwing a string lacks any stack trace information and other important data properties ❌
if(!productToAdd)
    throw ("How can I add new product when no value provided?");
```

```javascript
// throwing an Error from typical function, whether sync or async ✅
if(!productToAdd)
    throw new Error("How can I add new product when no value provided?");

// 'throwing' an Error from EventEmitter ✅
const myEmitter = new MyEmitter();
myEmitter.emit('error', new Error('whoops!'));

// 'throwing' an Error from a Promise ✅
const addProduct = async (productToAdd) => {
  try {
    const existingProduct = await DAL.getProduct(productToAdd.id);
    if (existingProduct !== null) {
      throw new Error("Product already exists!");
    }
  } catch (err) {
    // ...
  }
```

```javascript
// centralized error object that derives from Node’s Error ✅
function AppError(name, httpCode, description, isOperational) {
    Error.call(this);
    Error.captureStackTrace(this);
    this.name = name;
    //...other properties assigned here
};

// client throwing an exception ✅
if(user === null)
    throw new AppError(commonErrors.resourceNotFound, commonHTTPErrors.notFound, "further explanation", true)
```

### Distinguish operational vs programmer errors

Operational errors are recognized situations in which the error impact is completely acknowledged and manageable (e.g., API got an erroneous input).

Conversely, a programmer error (such as attempting to read an undefined variable) denotes unidentified code errors that require a gentle application restart.

```javascript
// marking an error object as operational ✅
const myError = new Error("How can I add new product when no value provided?");

myError.isOperational = true;

// or if you're using some centralized error factory ✅
class AppError {
  constructor (commonType, description, isOperational) {
    Error.call(this);
    Error.captureStackTrace(this);
    this.commonType = commonType;
    this.description = description;
    this.isOperational = isOperational;
  }
};

throw new AppError(errorManagement.commonErrors.InvalidInput, "Describe here what happened", true);
```

### Handle errors centrally, not within an Express middleware

When an error occurs, all endpoints should contact a single, centralized object that has error management logic.

### Exit the process gracefully

There is doubt regarding the application's health when an unknown mistake happens. Restarting the process with caution with a process management tool such as **PM2** or **Forever** is the standard procedure.

### Catch unhandled promise rejections

Any exception thrown within a promise will get swallowed and discarded unless a developer didn’t forget to explicitly handle.

Even if your code is subscribed to `process.uncaughtException`! Overcome this by registering to the event `process.unhandledRejection`.

```javascript
process.on('unhandledRejection', (reason, p) => {  ✅
  // I just caught an unhandled promise rejection, since we already have fallback handler for unhandled errors (see below), let throw and let him handle that

  throw reason;
});

process.on('uncaughtException', (error) => { ✅
  // I just received an error that was never handled, time to handle it and then decide whether a restart is needed

  errorManagement.handler.handleError(error);

  if (!errorManagement.handler.isTrustedError(error))
    process.exit(1);

});
```

### Fail fast, validate arguments using a dedicated library

This should be part of your Express best practices – Assert API input to avoid nasty bugs that are much harder to track later. The validation code is usually tedious unless you are using a very cool helper library like **Joi**.

```javascript
const Joi = require('joi');

const schema = Joi.object({
    username Joi.string()
        .alphanum()
        .min(3)
        .max(30)
        .required(),

    password Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),

    repeat_password Joi.ref('password'),

    access_token [
        Joi.string(),
        Joi.number()
    ],

    birth_year Joi.number()
        .integer()
        .min(1900)
        .max(2013),

    email Joi.string()
        .email({ minDomainSegments 2, tlds { allow ['com', 'net'] } })
})
    .with('username', 'birth_year')
    .xor('password', 'access_token')
    .with('password', 'repeat_password');


schema.validate({ username 'abc', birth_year 1994 });
// -> { value { username 'abc', birth_year 1994 } }

schema.validate({});
// -> { value {}, error '"username" is required' }

// Also -

try {
    const value = await schema.validateAsync({ username 'abc', birth_year 1994 });
}
catch (err) { }
```

## Code Style Practices

### Use ESLint

ESLint serves as the widely accepted standard for identifying potential code errors and enforcing consistent code style. It goes beyond addressing minor spacing concerns, also detecting significant code anti-patterns, such as developers throwing errors without proper classification. While ESLint can automatically correct code styles, more robust formatting tools like **Prettier** and **Beautify** excel in refining the fixes and can be used alongside ESLint.

### Start a Codeblock’s Curly Braces on the Same Line

The opening curly braces of a code block should be on the same line as the opening statement.

```javascript
// Do ✅
function someFunction() {
  // code block
}


// Avoid ❌
function someFunction()
{
  // code block
}
```

### Separate your statements properly

Use ESLint to gain awareness about separation concerns.

```javascript
// Do ✅

function doThing() {

    // ...

}

doThing()
// Do ✅

const items = [1, 2, 3]

items.forEach(console.log)

// Avoid  ❌

const m = new Map()

const a = [1,2,3]

[...m.values()].forEach(console.log)

>>> [...m.values()].forEach(console.log)

>>>  ^^^

>>> SyntaxError Unexpected token ...

// Avoid  ❌

const count = 2 

(function doSomething() {

  // do something

}())
```

### Name your functions

Give each function a name, including callbacks and closures. Steer clear of anonymous functions.

This is particularly helpful for node app profiling. When you inspect a memory snapshot, you can quickly and simply grasp what you're looking at if all functions are named.

### Use naming conventions for variables, constants, functions, and classes

Use lowerCamelCase when naming constants, variables, and functions and UpperCamelCase (capital first letter as well) when naming classes.

This will help you to easily distinguish between plain variables/functions, and classes that require instantiation. Use descriptive names, but try to keep them short.

```javascript
// for class name we use UpperCamelCase ✅
class SomeClassExample {}

// for const names we use the const keyword and lowerCamelCase ✅
const config = {
  key 'value'
};

// for variables and functions names we use lowerCamelCase ✅
let someVariableExample = 'value';

function doSomething() {}
```

### Prefer const over let. Ditch the var

When a variable is assigned using `const`, it cannot be reassigned. Using const can help you write clearer code and prevent you from being tempted to use the same variable for many purposes.

Use `let` to declare a variable if it needs to be reallocated, like in the case of a `for loop`. The fact that a variable declared with let is exclusively accessible within the *block scope* in which it was defined is another crucial feature of `let`.

No matter what, No use `var` at-all.

### Use ES module type/system

[Read More about imports/exports](https//javascript.info/import-export#import)

Also, VsCode or ChatGPT can help you convert between **ES** and **Common.js**.

### Import modules first, not inside functions

Require modules at the beginning of each file, before and outside of any functions.

### Use the === operator

Prefer the strict equality operator === over the weaker abstract equality operator ==. == will compare two variables after converting them to a common type.

### Use Async Await/Promise, avoid callbacks

The best gift you can give to your code is using *async-await/Promise* which provides a much more compact and familiar code syntax like try-catch.

## Delcaring and Writing Functions



### Keep Functions Small and Single-Purpose

- Break down complex tasks into smaller, focused functions.
- Each function should have a single responsibility and do one thing well.

    ```javascript
    // Function to format user data ✅
    function formatUser(user) {
        return {
            id: user.id,
            fullName: user.name,
            age: user.age,
        };
    }
    ```

### Use Descriptive Function Names

Choose clear and descriptive names for your functions. This makes your code more readable and self-explanatory.

```javascript
// Function to format book details ✅
function formatBookDetails(book) {
    return {
        id: book.id,
        title: book.title,
        author: book.author,
    };
}
```

### Avoid Callback Hell with Promises or Async/Await

When dealing with asynchronous operations, use Promises or Async/Await to avoid callback hell and improve code readability.

```javascript
// Example with Async/Await ✅
async function readFiles() {
  try {
    const data1 = await fs.readFile('file1.txt', 'utf-8');
    const data2 = await fs.readFile('file2.txt', 'utf-8');
    const data3 = await fs.readFile('file3.txt', 'utf-8');

    // Process data1, data2, and data3
    console.log(data1, data2, data3);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}
```

### Handle Errors Properly

Refer to the error handling section above. ⬆

### Use Default Parameter Values

Take advantage of default parameter values in function declarations when appropriate. This can simplify function calls and make your code more concise.

```javascript
// With default parameter values  ✅
function greet(name = 'Guest', greeting = 'Hello') {
  console.log(`${greeting}, ${name}!`);
}

greet(); // Output: Hello, Guest!
greet('John'); // Output: Hello, John!
greet('Jane', 'Hi'); // Output: Hi, Jane!
```

### Use Destructuring

Utilize object and array destructuring to make function parameters more readable and expressive.

```javascript
// With object destructuring in function parameters ✅
function printPerson({ firstName, lastName, age }) {
  console.log(`${firstName} ${lastName}, ${age} years old`);
}

const user = {
  firstName: 'John',
  lastName: 'Doe',
  age: 30
};

printPerson(user); // Output: John Doe, 30 years old
```

### Keep Function Signatures Simple

Aim for simple and clear function signatures. Avoid excessive parameters, and consider using options objects when dealing with multiple parameters.

### Avoid Mutating Parameters

Avoid modifying objects or arrays passed as parameters to prevent unexpected side effects. If needed, create copies and work with those instead.

```javascript
// Correct: Avoiding mutation by creating a new array ✅
function addElement(arr, element) {
  const newArray = [...arr, element];
  return newArray;
}

const originalArray = [1, 2, 3];
const newArray = addElement(originalArray, 4);

console.log(originalArray); // Output: [1, 2, 3] (original array remains unchanged)
console.log(newArray); // Output: [1, 2, 3, 4]

```

### Use Arrow Functions Sparingly

While arrow functions can be concise, use them judiciously, especially when dealing with complex logic or when you need access to the `this` context.

```javascript
// Regular function with this context
function RegularFunction() {
  this.value = 10;

  setInterval(function () {
    // 'this' refers to the global object, not the instance of RegularFunction
    console.log(this.value);
  }, 1000);
}

// Arrow function with lexical scoping
function ArrowFunction() {
  this.value = 20;

  setInterval(() => {
    // 'this' refers to the instance of ArrowFunction
    console.log(this.value);
  }, 1000);
}

const regularInstance = new RegularFunction();
const arrowInstance = new ArrowFunction();
```

### Separate Business Logic from Request Handling

Keep your route handlers (where Express routes are defined) as thin as possible. Move the core business logic into separate functions or modules.

```javascript
// Business logic module
const userService = {
  getAllUsers: () => {
    return database.users;
  },
  getUserById: (userId) => {
    return database.users.find(user => user.id === userId);
  },
};

// Express route handlers
app.get('/users', (req, res) => {
  // Route handler is thin, delegates to business logic
  const users = userService.getAllUsers();
  res.json(users);
});

app.get('/users/:id', (req, res) => {
  // Route handler is thin, delegates to business logic
  const userId = parseInt(req.params.id);
  const user = userService.getUserById(userId);

  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ error: 'User not found' });
  }
});
```

### Ensure Consistent Return Values

Ensure that your functions return values consistently. This makes it easier for developers to understand and work with the results.

```javascript
// Inconsistent return values
function authenticateUserInconsistent(username, password) {
  const user = findUserByUsername(username);

  if (user && user.password === password) {
    return true;
  } else {
    return false;
  }
}

// Consistent return values
function authenticateUserConsistent(username, password) {
  const user = findUserByUsername(username);

  if (user && user.password === password) {
    return { success: true, user };
  } else {
    return { success: false, error: 'Authentication failed' };
  }
}
```

### Avoid Global State

Minimize the use of global variables within functions. This helps in keeping functions independent and promotes better testability.

```javascript
// Global state approach
let globalCounter = 0;

function incrementGlobalCounter() {
  globalCounter++;
  return globalCounter;
}

console.log(incrementGlobalCounter()); // Output: 1
console.log(incrementGlobalCounter()); // Output: 2

// Avoiding global state
function createCounter() {
  let counter = 0;

  return function incrementCounter() {
    counter++;
    return counter;
  };
}

const myCounter = createCounter();
console.log(myCounter()); // Output: 1
console.log(myCounter()); // Output: 2
```

### Use Functional Programming Concepts

Embrace functional programming concepts when applicable, such as immutability and pure functions. This can lead to more predictable and maintainable code.

```javascript
// Impure function
let total = 0;

function impureAddNumber(number) {
  total += number;
  return total;
}

console.log(impureAddNumber(5)); // Output: 5
console.log(impureAddNumber(3)); // Output: 8

// Pure function
function pureAddNumbers(a, b) {
  return a + b;
}

console.log(pureAddNumbers(5, 3)); // Output: 8
console.log(pureAddNumbers(2, 4)); // Output: 6

```

## Documentation

Use JsDOC-3 - It's very easy to learn and comprehend. It's important. ✅✅✅

```javascript
/**
 * Represents a person.
 * @class
 */
class Person {
  /**
   * Create a person.
   * @param {string} name - The name of the person.
   * @param {number} age - The age of the person.
   */
  constructor(name, age) {
    /**
     * The name of the person.
     * @type {string}
     */
    this.name = name;

    /**
     * The age of the person.
     * @type {number}
     */
    this.age = age;
  }

  /**
   * Get the greeting for the person.
   * @returns {string} A greeting including the person's name and age.
   */
  greet() {
    return `Hello, my name is ${this.name} and I am ${this.age} years old.`;
  }
}

// Create a new person
const john = new Person("John Doe", 30);

// Call the greet method
console.log(john.greet());
```

## Reference

- https//blog.logrocket.com/node-js-project-architecture-best-practices/
- http//anixir.com/minimal-node-express-style-guide/
- https//www.perfomatix.com/nodejs-coding-standards-and-best-practices/
- https//javascript.info/import-export/
- https//javascript.info/code-quality/
