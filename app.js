const   express      = require('express'),  
        bodyParser   = require('body-parser'),
        mongoose     = require('mongoose'), 
        Campground   = require("./models/campground"),
        Comment      = require('./models/comment'),
        seedDB       = require('./seeds'),
        app          = express()
 
// seedDB(); 
mongoose.connect("mongodb://localhost/yelp_camp", { useNewUrlParser: true, useFindAndModify: false }); 
app.use(bodyParser.urlencoded({extended: true})); 
app.set("view engine", "ejs"); 
app.use(express.static("public")); 


 
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
app.get("/campgrounds/:id/comments/new", function(req,res){ 
    Campground.findById(req.params.id, function(err, campground){ 
        if(err){ 
            console.log(err); 
        } else { 
            res.render("comments/new", {campground: campground}); 
        }
    })
   
}); 
// SEND FORM TO 
app.post("/campgrounds/:id/comments", function(req, res){ 
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
                    res.redirect('/campgrounds/' + campground._id); 
                }
            }); 
        }
    });
    
});

app.listen(3000, function() { 
    console.log("server up on 3000"); 
})