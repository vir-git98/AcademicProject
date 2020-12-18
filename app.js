//PACKAGE CONFIGURATIONS

    //EXPRESS
const express       =       require("express"),
      app           =       express(),
      bodyParser    =       require("body-parser");
      app.use(bodyParser.urlencoded({extended: true}));
      app.use(express.urlencoded({extended:true}));

    //EJS
        ejs           =       require("ejs");
        app.set('view engine', 'ejs');

    //STATIC FILES CONFIGURATION
        app.use(express.static(__dirname + '/public'));

    //MONGOOSE-MONGODB
    const mongoose = require('mongoose');
    mongoose.connect('mongodb://localhost:27017/RPServices', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify:false});
    mongoose.set('useCreateIndex', true);
    

    //All MODEL ROUTES
    const User  = require("./models/user"),
          Order = require("./models/order"),
          Staff = require("./models/staff");

    //METHOD-OVERRIDE
    const methodOverride = require('method-override');
    app.use(methodOverride('_method'));

    //EXPRESS SESSION
    const expressSession= require("express-session");
    app.use(expressSession({
        secret: "RPServices session secret",
        resave: false,
        saveUninitialized: false
    }));
    
    //PASSPORT
    const
    passport      = require("passport"),
    passportLocal = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose");
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new passportLocal(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    //MIDDLEWARE
    middleware = require("./middleware/middleware");
//----------------------------------------------------------------------//



//ROUTES
    //HOME ROUTE
    app.get("/", (req,res)=>{
        res.render("home", {allstaff: null});
    });

    //----------------------//
    //CRUD FOR USER
    //CREATE NEW USER
    //USER SIGNUP
    //USER SIGNUP FORM GET ROUTE
    app.get("/user/new", (req,res)=>{
        res.render("signup-form");
    });

    //USER SIGNUP POST ROUTE
    app.post("/user", (req,res)=>{
        const newUser={
            name: req.body.name,
            username: req.body.username,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
        };
        User.register(new User(newUser), req.body.password, (err, registeredUser)=>{
            if(err){
                console.log(err);
            }
            passport.authenticate("local")(req, res, function(){
                res.redirect("/login");
            });
        });  
    });

    //USER LOGIN
    //LOGIN FORM GET ROUTE
    app.get("/user/login", (req,res)=>{
        res.render("login-form");
    });
    //LOGIN FORM HANDLER POST ROUTE
    app.post("/user/login", passport.authenticate('local', { failureRedirect: '/login',
    failureFlash: true }),(req,res)=>{
        res.redirect("/");
    });

    //ADMIN LOGIN
    //ADMIN LOGIN FORM GET ROUTE
    app.get("/admin/login", (req,res)=>{
        res.render("admin-login");
    });
    //LOGIN FORM HANDLER POST ROUTE
    app.post("/admin/login", passport.authenticate('local', { failureRedirect: '/login',
    failureFlash: true }),(req,res)=>{
        res.redirect("/admin");
    });


    //ORDER MAID ROUTE
    app.get("/order", middleware.isLoggedIn, (req,res)=>{
        Staff.find({}, function(err, allStaff){
            if(err){
                console.log(err);
            } else {
                res.render("order-form", {allstaff: allStaff});
            }
        });
        //res.render("order-form");
    });

    //STORE ORDER POST ROUTE
    app.post("/orders", (req,res)=>{
        var orderData = new Order(req.body);
        orderData.save()
        .then(orderItem => {
            console.log("Order saved to Database");
            res.redirect("/");
        })
        .catch(err => {
            console.log(err);
        });
    });    

    //SHOW ORDERS ROUTE
    app.get("/showOrders", (req,res)=>{
        Order.find({}, function(err, allOrders){
            if(err){
                console.log(err);
            } else {
                res.render("admin", {allorders: allOrders});
            }
        });
    });

    //LOGIN FORM ROUTE
    app.get("/login", (req,res)=>{
        res.render("login-form");
    });

    //SIGN UP FORM ROUTE
    app.get("/signup", (req,res)=>{
        res.render("signup-form");
    });

    //USER ACCOUNT DETAILS ROUTE
    app.get("/user", (req,res)=>{
        res.render("user-account");
    });

    //ADDING NEW STAFF GET ROUTE
    app.get("/admin/newStaff", (req,res)=>{
        res.render("New-staff");
    });

    //ADDING NEW STAFF POST ROUTE
    app.post("/admin/newStaff", (req,res)=>{
        var staffData = new Staff(req.body);
        staffData.save()
        .then(data => {
            console.log("New Staff Added Successfully");
            res.redirect("/admin");
        })
        .catch(err => {
            console.log(err);
        });
    }); 
    
    //ROUTE TO SHOW ALL STAFF
    app.get("/staff", (req,res)=>{
        Staff.find({}, function(err, allStaff){
            if(err){
                console.log(err);
            } else {
                res.render("show-staff", {allstaff: allStaff});
            }
        });
    });

    //ADMIN PAGE ROUTE
    app.get("/admin", middleware.isLoggedIn, (req,res)=>{
        res.render("admin", {allorders: null});
    });


//PORT LISTENER
app.listen(3000, ()=>{
    console.log("Server started");
});
