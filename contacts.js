const express = require("express");
const morgan = require("morgan");
const app = express();
const maxNameLength = 25;

let contactData = [
  {
    firstName: "Mike",
    lastName: "Jones",
    phoneNumber: "281-330-8004",
  },
  {
    firstName: "Jenny",
    lastName: "Keys",
    phoneNumber: "768-867-5309",
  },
  {
    firstName: "Max",
    lastName: "Entiger",
    phoneNumber: "214-748-3647",
  },
  {
    firstName: "Alicia",
    lastName: "Keys",
    phoneNumber: "515-489-4608",
  },
];

const sortContacts = contacts => {
  return contacts.slice().sort((contactA, contactB) => {
    if (contactA.lastName < contactB.lastName) {
      return -1;
    } else if (contactA.lastName > contactB.lastName) {
      return 1;
    } else if (contactA.firstName < contactB.firstName) {
      return -1;
    } else if (contactA.firstName > contactB.firstName) {
      return 1;
    } else {
      return 0;
    }
  });
};

app.set("views", "./views");
app.set("view engine", "pug");

app.use(express.static("public"));
app.use(express.urlencoded({extended: false}));
app.use(morgan("common"));

app.get("/", (req, res) => {
  res.redirect("/contacts");
});

app.get("/contacts", (req, res) => {
  res.render("contacts", {
    contacts: sortContacts(contactData),
  });
});

app.get("/contacts/new", (req, res) => {
  res.render("create_new_contact");
});

app.post("/contacts/new",
  (req, res, next) => {
    res.locals.errorMessages = [];

    next();
  },

  (req, res, next) => {
    for (let inputItem in req.body) {
      req.body[inputItem] = req.body[inputItem].trim();
    }
    
    next();
  },
  (req, res, next) => {
    if (req.body.firstName.length === 0) {
      res.locals.errorMessages.push("First name is required.");
    }
    
    next();
  },
  (req, res, next) => {
    if (req.body.lastName.length === 0) {
      res.locals.errorMessages.push("Last name is required.");
    }

    next();
  },
  (req, res, next) => {
    if (req.body.phoneNumber.length === 0) {
      res.locals.errorMessages.push("Phone Number is required.");
    }

    next();
  },
  (req, res, next) => {
    if ((req.body.firstName.length > maxNameLength) || (req.body.lastName.length > maxNameLength)) {
      res.locals.errorMessages.push("Names must be 25 characters or less.");
    }
    
    next();
  },
  (req, res, next) => {
    if ((req.body.firstName.match(/[^A-Za-z]/g)) || (req.body.lastName.match(/[^A-Za-z]/g))) {
      res.locals.errorMessages.push("Names can only contain Alphabetical Characters.");
    }
    
    next();
  },
  (req, res, next) => {
    contactData.forEach(storedContact => {
      if (storedContact.firstName === req.body.firstName && storedContact.lastName === req.body.lastName) {
        res.locals.errorMessages.push("Contact already exists");
      }
    });

    next();
  },
  (req, res, next) => {
    if (req.body.phoneNumber.match(/[^0-9]/g)) {
      res.locals.errorMessages.push("Phone Number may only contain digits.");
    }

    next();
  },
  (req, res, next) => {
    if (req.body.phoneNumber.length !== 10) {
      res.locals.errorMessages.push("Phone Number must only contain 10 characters.");
    }

    next();
  },

  (req, res, next) => {
    if (res.locals.errorMessages.length > 0) {
      res.render("create_new_contact", {
        errorMessages: res.locals.errorMessages,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        phoneNumber: req.body.phoneNumber,
      });
    } else {
      next();
    }
  },
  (req, res) => {
    contactData.push({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      phoneNumber: req.body.phoneNumber,
    });

    res.redirect("/contacts");
  }
);

app.listen(3000, "localhost", () => {
  console.log("Listening to port 3000.");
});