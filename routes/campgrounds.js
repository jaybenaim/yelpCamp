var express = require("express"); 
var router = express.Router(); 
var Campground = require('../models/campground');


router.get("/", function(req,res) { 
    // get all campgrounds from DB then render file 
    Campground.find({}, function(err, allcampgrounds){ 
        if(err) { 
            console.log(err); 
        } else { 
            res.render("campgrounds/index", { campgrounds: allcampgrounds, currentUser: req.user});
        }
    });
});

// CREATE ROUTE - add new campground to DB 
router.post("/", isLoggedIn, function(req,res) {
    
    var name = req.body.name; 
    var image = req.body.image; 
    var desc = req.body.description; 
    var author = { 
        id: req.user._id, 
        username: req.user.username
    }
    var newCampground = {name:name, image: image, author: author, description: desc};
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
router.get("/new", isLoggedIn, function(req,res) { 
    res.render("campgrounds/new"); 
}); 

// SHOW - shows more info about one campground  
router.get("/:id", function(req,res) {
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){ 
        if(err){ 
            console.log("Error: ", err);
        } else { 
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });    
});

// EDIT ROUTE 
router.get("/:id/edit", function(req,res){ 
    Campground.findById(req.params.id, function(err, foundCampground) { 
        if(err){ 
            res.redirect("/campgrounds"); 
        } else { 
            res.render("campgrounds/edit", {campground: foundCampground}); 
        }
    });  
}); 

 
// UPDATE ROUTE 
router.put('/:id', function(req,res){ 
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) { 
        if(err) { 
            res.redirect('/campgrounds'); 
        } else { 
            res.redirect('/campgrounds/' + req.params.id); 
        }
    }); 
});

// DESTROY CAMPGROUND ROUTE 
router.delete("/:id", function(req, res){ 
    Campground.findByIdAndDelete(req.params.id, function(err) { 
     if(err){ 
         res.redirect("/campgrounds"); 
     } else { 
         res.redirect("/campgrounds"); 
     }
}); 
}); 

// Middleware 
function isLoggedIn(req, res, next){ 
    if(req.isAuthenticated()){ 
        return next(); 
    } 
        res.redirect("/login");
    }; 
module.exports = router; 