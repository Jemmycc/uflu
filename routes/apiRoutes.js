var db = require('../models');

module.exports = function (app) {
  var drugstoreLink = "";
  var results;
  var message = ["Hope you feel better soon!", "Wishing you a speedy recovery!", "Sending good, healthy vibes your way!", "Hang in there! Better days are coming!"];

  var rquote = getRandomQuote(message);
  console.log(rquote);

  function getRandomQuote(message) {
    console.log(Math.floor(Math.random() * message.length))
    return message[Math.floor(Math.random() * message.length)];
    location.reload();
  }

  // Get user name and zip code from welcome page and create new user
  app.post("/api/welcome", function (req, res) {
    console.log(req.body.userName, req.body.zipCode);
    var userName = req.body.userName;
    var zipCode = req.body.zipCode;

    db.UserInfo
      .create({
        name: userName,
        zipcode: zipCode,
      })
      .then(function (dbUserInfo) {
        // Get lat and lon from the zipcode - TODO - error message for not putting in a valid zipcode
        // db.ZipCode.findOne({ where: { zip: zipCode } }).then(function (dbZipCodes) {
        //   var lat = dbZipCodes.lat;
        //   var lng = dbZipCodes.lng;
        //   console.log(lat, lng);

        res.json(dbUserInfo);
      });
  });

  // Loads the symptoms page with the user's name
  app.get("/api/user/:username", function (req, res) {
    res.render("symptoms", { name: req.params.username })
  });

  // Loads the results page with the user's data
  app.get("/api/user/:username/results", function (req, res) {

    var hbsObj = {
      name: req.params.username,
      resultHeader: results.resultHeader,
      severity: results.severity,
      suggestionHeader: results.suggestionHeader,
      cureList: results.cureList,
      medicineHeader: results.medicineHeader,
      medicineList: results.medicineList,
      drugstoreLink: drugstoreLink,
      rquote: rquote,
      showMap: results.showMap
    }

    res.render("results", hbsObj);
  });

  // Get the number of symptoms and add to the database
  app.post("/api/userdata", function (req, res) {
    db.UserInfo
      .update({ score: req.body.score }, { where: { id: req.body.id } })
      .then(function (dbUserInfos) {
        // Compute severity
        var score = req.body.score;

        if (score <= 3) {         // mild
          results = getResults(0);
        }
        else if (score <= 6) {    // moderate
          results = getResults(1);
        }
        else {                    // severe
          results = getResults(2);
        }

        res.json(dbUserInfos);
      });
  });

  // Get all user data
  app.get('/api/userdata', function (req, res) {
    db.UserInfo.findAll({}).then(function (dbUserInfos) {
      res.json(dbUserInfos);
    });
  });

  // Get all zip code data
  app.get('/api/zipcode', function (req, res) {
    db.ZipCode.findAll({}).then(function (dbZipCodes) {
      res.json(dbZipCodes);
    });
  });

  // Delete an example by id
  app.delete('/api/userdata/:id', function (req, res) {
    db.UserInfo
      .destroy({ where: { id: req.params.id } })
      .then(function (dbUserInfos) {
        res.json(dbUserInfos);
      });
  });
};

// Function to point to the correct results to send based on number of symptoms clicked (severity)
function getResults(indx) {
  var results = [
    {
      resultHeader: "Based on your symptoms, you might have",
      severity: "a cold or a mild flu.",
      suggestionHeader: "But an ounce of prevention is worth a pound of cure. Stay hydrated and rested; make sure to wash your hands frequently.",
      resultHeadercureList: [],
      medicineHeader: "",
      medicineList: [],
      showMap: ""
    },
    {
      resultHeader: "Oh, we're sorry you're not feeling well! It sounds like you have",
      severity: "a moderate flu.",
      suggestionHeader: "You likely need extra rest, more water than normal, some decongestants, and pain relievers. Below is a list of suggetions to help you feel more comfortable:",
      cureList: ["Stay home and rest", "Drink plenty of fluids", "Run a humidifier", "Try a warm compress", "Eat some fruits and veggies"],
      medicineHeader: "We suggest that you get some medication. Here is a list:",
      medicineList: ["Pain Relievers (like ibuprofen or acetaminophen) to reduce fever, headaches, and body aches.", "Decongestants (like pseudoephedrine) to help open nasal pasages and relieve pressure", "Cough Suppressants (like dextromethorphan) to help soothe a dry cough", "Expectorants to help loosen mucus and helpful for wet coughs", "Antihistimines to help you sleep"],
      showMap: ""
    },
    {
      resultHeader: "Oh no! It sounds like you're having ",
      severity: "a severe flu!",
      suggestionHeader: "You might want to consider making an appointment with your doctor. Below is a list of suggetions to help you feel more comfortable:",
      cureList: ["Stay home and rest", "Drink plenty of fluids", "Run a humidifier", "Try a warm compress", "Eat some fruits and veggies"],
      medicineHeader: "We suggest that you get some medication. Here is a list:",
      medicineList: ["Pain Relievers (like ibuprofen or acetaminophen) to reduce fever, headaches, and body aches.", "Decongestants (like pseudoephedrine) to help open nasal pasages and relieve pressure", "Cough Suppressants (like dextromethorphan) to help soothe a dry cough", "Expectorants to help loosen mucus and helpful for wet coughs", "Antihistimines to help you sleep"],
      showMap: "Here is a map to some pharmacies in your area. <iframe id='location-map' src='https://www.google.com/maps/embed/v1/search?q=pharmacy&&zoom=13&key=AIzaSyCBAUrhIbvz3xZoeo5--j9mFDf-Zpo8EC8' allowfullscreen ></iframe >"
    }
  ];

  return results[indx];
}

