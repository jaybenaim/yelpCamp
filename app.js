const   express          = require('express'),  
        bodyParser       = require('body-parser'),
        mongoose         = require('mongoose'),
        methodOverride   = require("method-override"),
        Campground       = require("./models/campground"),
        Comment          = require('./models/comment'),
        seedDB           = require('./seeds'),
        passport         = require('passport'), 
        LocalStrategy    = require('passport-local'), 
        User             = require("./models/user"), 
        app              = express()
    
//seedDB(); 
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useFindAndModify: false }); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/public")); 
app.use(methodOverride("_method")); 

// PASSPORT CONFIG 
app.use(require("express-session")({
    secret: "Jay is the best", 
    resave: false, 
    saveUninitialized: false 
})); 
app.use(passport.initialize()); 
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

// INDEX ROUTE
app.get("/", function(req,res){ 
    res.render("landing"); 
}); 

app.get("/campgrounds", function(req,res) { 
    // get all campgrounds from DB then render file 
    Campground.find({}, function(err, allcampgrounds){ 
        if(err) { 
            console.log(err); 
        } else { 
            res.render("campgrounds/index", { campgrounds: allcampgrounds});
        }
    });
});

// CREATE ROUTE - add new campground to DB 
app.post("/campgrounds", function(req,res) {
    
    var name = req.body.name; 
    var image = req.body.image; 
    var desc = req.body.description; 
    var newCampground = {name:name, image: image, description: desc};
    // create a new compound and save to DB 
    Campground.create(newCampground, function(err, newlyCreated){ 
        if(err){ 
            console.log("Error: ", err);
        } else { 
            res.redirect("/campgrounds");
        }
    })
}); 

// NEW ROUTE- show form to create campground 
app.get("/campgrounds/new", function(req,res) { 
    res.render("campgrounds/new"); 
}); 

// SHOW - shows more info about one campground  
app.get("/campgrounds/:id", function(req,res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){ 
        if(err){ 
            console.log("Error: ", err);
        } else { 
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });    
}); 
// COMMENTS ROUTE 
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){ 
    Campground.findById(req.params.id, function(err, campground){ 
        if(err){ 
            console.log(err); 
        } else { 
            res.render("comments/new", {campground: campground}); 
        }
    });
   
}); 

// SEND FORM TO 
app.post("/campgrounds/:id", isLoggedIn,  function(req, res){ 
    Campground.findById(req.params.id, function(err, campground){ 
        if(err){ 
            console.log(err);
            res.redirect("/campgrounds"); 
        } else { 
            Comment.create(req.body.comment, function(err, comment){ 
                if(err){ 
                    console.log(err); 
                } else { 
                    campground.comments.push(comment); 
                    campground.save(); 
                    res.redirect( "/campgrounds/" + campground._id); 
                }
            }); 
        }
    });
    
});

// AUTH ROUTES 
// show register form 
app.get("/register", function(req, res) { 
    res.render('register'); 
}); 

// handle sign up logic 
app.post("/register", function(req,res){ 
    var newUser = new User({username: req.body.username}); 
    User.register(newUser, req.body.password, function(err, user){ 
        if(err){ 
            console.log(err); 
            return res.render('register'); 
        } 
        passport.authenticate("local")(req, res, function(){ 
            res.redirect("/campgrounds"); 
        }); 
    }); 
}); 

// show login form 
app.get("/login", function(req, res){ 
        res.render("login"); 
}); 

// handling login logic 
app.post('/login', passport.authenticate("local", {
    successRedirect: "/campgrounds", 
    failureRedirect: "/login"
}), function(req, res){ 
}); 

// logout route 
app.get("/logout", function(req,res){ 
    req.logout(); 
    res.redirect('/campgrounds'); 
}); 

function isLoggedIn(req, res, next){ 
    if(req.isAuthenticated()){ 
        return next(); 
    } 
    res.redirect("/login"); 
}; 

app.listen(3000, function() { 
    console.log("server up on 3000"); 
})