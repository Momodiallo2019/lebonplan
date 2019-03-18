// Appeler les modules necessaires
var express = require("express"); // express = serveur
var exphbs = require("express-handlebars"); //handlebars = template
var expressSession = require("express-session"); // express-session = creer des sessions
var MongoStore = require("connect-mongo")(expressSession);
var mongoose = require("mongoose"); // mongoose = lien entre serveur et BD
var passport = require("passport"); // passport = module pour hacher les passwords
var bodyParser = require("body-parser"); // body-parser = recuperation des data entrees par le client, ex form
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models").User; // same as: var User = require('./models/user');
var OfferModel = require("./models/offer");


var port = process.env.PORT || 3000;

var app = express(); // Creation de l'extension du framework express

//Connexion a la BD
mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/lebonplan", {
        useNewUrlParser: true,
        useCreateIndex: true
    }
);

// Express-handlebars configuration
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//bodyParser configuration
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));

// activate session management
app.use(
    expressSession({
        secret: "konexioasso07", //il y a que le code secret qui change
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
);

// enable Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // JSON.stringify
passport.deserializeUser(User.deserializeUser()); // JSON.parse

app.get("/", function(req, res) {
    res.render("home");
});

app.get("/admin", function(req, res) {
    if (req.isAuthenticated()) { // isAuthenticated = methode sert a verifier si le user est connecte ou pas
        console.log(req.user);
        res.render("admin");
    } else {
        res.redirect("/");
    }
});

//on creer ce route pour interdir au user connecté d'acceder a la page signup 
app.get("/signup", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("signup");
    }
});

app.post("/signup", function(req, res) {


    // create a user with the defined model with
    // req.body.username, req.body.password

    // WITHOUT PASSPORT

    // var username = req.body.username;
    // var password = req.body.password;

    // User.findOne({username: username}, function(user) {
    //   if (user === null) {
    //     var newUser = new User({
    //       username: username,
    //       password: password,
    //     });
    //     newUser.save(function(err, obj) {
    //       if (err) {
    //         console.log('/signup user save err', err);
    //         res.render('500');
    //       } else {
    //         // Save a collection session with a token session and
    //         // a session cookie in the browser
    //       }
    //     });
    //   }
    // });

    console.log("will signup");

    // Recuperation des donnees entrees dans le form
    // console.log(req.body);
    var email = req.body.email;
    var password = req.body.password;
    var confirmPassword = req.body.confirmPassword;
    var firstName = req.body.firstName;
    var username = req.body.username;
    var dateOfBirth = req.body.dateOfBirth;

    // var regex = new RegExp("(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})", "ig");
    // if (regex.test(password) === false) {
    //     console.log("err", erreur);
    // }

    //methode .register pour enregistrer dans le BD, les donnees recuperees a partir de req.body
    User.register(
        new User({
            email: email,
            fistname: firstName,
            username: username,
            dateOfBirth: dateOfBirth
                // other fields can be added here
        }),
        password, // password will be hashed
        function(err, user) {
            if (err) {
                console.log("/signup user register err", err);
                return res.render("signup");
            } else {
                passport.authenticate("local")(req, res, function() {
                    res.redirect("/admin");
                });
            }
        }
    );
});

app.get("/login", function(req, res) {
    if (req.isAuthenticated()) {
        res.redirect("/admin");
    } else {
        res.render("login");
    }
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/admin",
    failureRedirect: "/login"
}));

// Without Passport

// app.post("/login", function(req, res) {
//   var md5 = require("md5"); // there for education purpose, if using this method, put it in the top of your file
//   User.find(
//     {
//       username: req.body.username,
//       password: md5(req.body.password)
//     },
//     function(users) {
//       // create a session cookie in the browser
//       // if the password is good
//       // and redirect to /admin
//     }
//   );
//   res.send("login");
// });

// Quand on se deconnecte
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

//-----------------------page offer-----------------------------------------------------------//

//Creer un root qui envoie vers la page offers qui passe le parametre id ex : "/offers/1453"
app.get("/offers/:id", function(req, res) {
    var offreId = req.params.id; // on recupere l'id
    // console.log(id);

    // console.log("req", req);
    // console.log("res", res);


    //recherche du produit lié a l'id
    OfferModel.findOne({ id: offreId }, function(err, offer) { //offer = var cree par la function qui stock le resultat de la recherche
        if (err !== null) {
            console.log('err', err);
        } else {
            //s'il n'y a pas d'err, il me renvoie a la page offers
            // la methode render prend 2 parametres, le 1er c'est le nom de la page, le second prend un obj 
            OfferModel.findOne({ id: offreId })
                .populate('user') //user represente la clef fait le lien avec offer
                .exec(function(err, offer) {
                    console.log('The author is', offer.user.firstName);

                    res.render("offers", {
                        product: offer, // offer = arr ou obj contenant toutes les caracteristiques du produit
                        imgProfile: offer.user.thumbnail,
                        user: offer.user.firstName,
                        description: offer.user.description

                    });
                });
        }
    });


});


//-------------------------page cities-----------------------------------------------------------//
app.get("/cities/:city", function(req, res) {
    // var city = req.params.city;
    // console.log("city", city);
    // res.send("ok")

    OfferModel.find({ city: req.params.city }, function(err, products) {
        if (err !== null) {
            console.log("err", err);
            return err;
        } else {
            // console.log(products);
            var offer = products.map(function(oneProduct) { //.map = methode equivalent un a for qui parcourt le table recu
                //de la BD et il retourne un nouveau arr avec les caracteristiques choisies
                // console.log(offer);
                return {
                    id: oneProduct.id,
                    title: oneProduct.title,
                    firstImg: oneProduct.images[0],
                    description: oneProduct.description,
                    date: oneProduct.created,
                    price: oneProduct.price
                };
            });
            // console.log('mon offre', offer);
            res.render("cities", {
                offer: offer
            })
        }
    });
});
//---------------------------------------------------------------------------------------------------//

app.listen(port, function() {
    console.log("Server started on port :", port);
});