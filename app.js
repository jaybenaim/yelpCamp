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
        app              = express(); 
        

const   commentRoutes    = require('./routes/comments'),
        campgroundRoutes = require('./routes/campgrounds'), 
        indexRoutes       = require('./routes/index'); 


mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useFindAndModify: false }); 
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs"); 
app.use(express.static(__dirname + "/public")); 
app.use(methodOverride("_method")); 
// seedDB(); 

// PASSPORT CONFIG 
app.use(require("express-session")({
    secret: "Jay is the best", 
    resave: false, 
    saveUninitialized: false 
})); 

app.use(passport.initialize()); 
app.use(passport.session()); 

// use currentUser in all routes 
app.use(function(req, res, next){ 
    res.locals.currentUser = req.user;
    next();  
});  

app.use("/", indexRoutes); 
app.use("/campgrounds", campgroundRoutes); 
app.use("/campgrounds/:id/comments" , commentRoutes); 

passport.use(new LocalStrategy(User.authenticate())); 
passport.serializeUser(User.serializeUser()); 
passport.deserializeUser(User.deserializeUser()); 

app.listen(3000, function() { 
    console.log("server up on 3000"); 
}); 
