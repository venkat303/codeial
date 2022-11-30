const User = require('../models/user');

module.exports.profile = function(req,res){
    if(req.cookies.user_id){
        User.findById(req.cookies.user_id,function(err,user){
            if(user){
                return res.render('user_profile',{
                    title:"UserProfile",
                    user:user
                })   
            }
            return res.redirect('/users/sign-in');
        })
    }else{
        return res.redirect('/users/sign-in');
    }
    
}

//render the sign Up page
module.exports.signUp = function(req,res){
    return res.render('user_sign_up',{
        title : "Codial | Sign Up"
    })
}

//render the sign In page
module.exports.signIn = function(req,res){
    return res.render('user_sign_in',{
        title : "Codial | Sign In"
    })
}

//render the sign out page
module.exports.signOut = function(req,res){
    res.clearCookie('user_id');
    return res.redirect('/users/sign-in');
}

//get the signup data
module.exports.create = function(req,res){
    if(req.body.password != req.body.confirm_password){
        return res.redirect('back');
    }
    User.findOne({email : req.body.email} , function(err,user){
        if(err){
            console.log('error in finding user in signing up');
            return;
        }
        if(!user){
            User.create(req.body,function(err,user){
                if(err){
                    console.log('error in creating user while signing up');
                    return;
                }
                return res.redirect('/users/sign-in');
            })
        }else{
            return res.redirect('back');
        }
    })
}

//sign in and create a session for user
module.exports.createSession = function(req,res){

    //Steps to aunthenticate
    //Find the user
    User.findOne({email:req.body.email},function(err,user){
        if(err){console.log('error in finding user in signing in');return}

        //Handle user found

        if(user){

            //Handle password which don't match
            if(user.password != req.body.password){
                return res.redirect('back');
            }

            //Handle session creation
            res.cookie('user_id',user.id);
            return res.redirect('/users/profile');
        }else{
            //Handle user not found
            return res.redirect('back');
        }
    })
}