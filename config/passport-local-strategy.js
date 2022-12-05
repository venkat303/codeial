const passport = require('passport');
const User = require('../models/user');

const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy({
        usernameField: 'email',
        passReqToCallback:true
    },
    function(req,email,password,done){
        //Find a user and establish the strategy
        User.findOne({email:email},function(err,user){
            if(err){
                req.flash('error',err);
                // console.log('Error in finding user --> Passport')
                return done(err);
            }
            if(!user || user.password!= password){
                req.flash('error','Invalid Username/Password');
                // console.log('Invalid username/Password');
                return done(null,false);
            }
            return done(null,user);
        })
    }

));

//Serializing the user t decide which key is to be kept in the cookies
passport.serializeUser(function(user,done){
    done(null,user.id);
});


//deserialzing the user from the key in the cookies
passport.deserializeUser(function(id,done){
    User.findById(id,function(err,user){
        if(err){
            console.log('Error in finding user --> Passport')
            return done(err);
        }
        return done(null,user);
    })
})

//Check if user is aunthenticated
passport.checkAuthentication = function(req,res,next){
    //if the user is signed in, then pass on the request to the next function(controller's action)
    if(req.isAuthenticated()){
        return next();
    }
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req,res,next){
    if(req.isAuthenticated()){
        //req.user contains the ucrrent signed in user from the session cookies and we are just sending this to locals for the views
        res.locals.user = req.user;
    }
    next();
}

module.exports=passport;