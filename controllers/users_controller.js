const User = require('../models/user');
const UserToken = require('../models/reset_password');
const Friendship = require('../models/friendship');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const queue = require('../config/kue');
const resetPasswordEmailWorker = require('../workers/resetPassword_email_worker');
//no need of async-await as there is no nesting level
module.exports.profile = function(req,res){
    User.findById(req.params.id,function(err,user){
        return res.render('user_profile',{
            title:"UserProfile",
            profile_user:user
        });
    });
}

module.exports.update= async function(req,res){

    // if(req.user.id == req.params.id){
    //     User.findByIdAndUpdate(req.params.id,req.body,function(err,user){
    //         return res.redirect('back');
    //     });  
    // }else{
    //     req.flash('error', 'Unauthorized');
    //     return res.status(401).send('Unauthorized');
    // }

    if(req.user.id == req.params.id){
        try{
            let user = await User.findById(req.params.id);
            User.uploadedAvatar(req,res,function(err){
                if(err){console.log('******Multer error:',err)}

                console.log(req.file);
                user.name = req.body.name;
                user.email = req.body.email;


                if(req.file){
                    if(user.avatar){
                        if(fs.existsSync(path.join(__dirname,'..',user.avatar))){
                            fs.unlinkSync(path.join(__dirname,'..',user.avatar));
                        }   
                    }
                    user.avatar = User.avatarPath + '/' + req.file.filename;
                }
                user.save();
                return res.redirect('back');
            });
        }catch(err){
            req.flash('error',err)
            return res.redirect('back');
        }
    }else{
        req.flash('error', 'Unauthorized');
        return res.status(401).send('Unauthorized');
    }
}


//render the sign Up page
module.exports.signUp = function(req,res){
    if(req.isAuthenticated()){
       return res.redirect('/users/profile');
    }
    return res.render('user_sign_up',{
        title : "Codial | Sign Up"
    })
}

//render the sign In page
module.exports.signIn = function(req,res){
    if(req.isAuthenticated()){
       return res.redirect('/users/profile');
    }
    return res.render('user_sign_in',{
        title : "Codial | Sign In"
    })
}
//render the reset page
module.exports.reset = function(req,res){
    return res.render('reset_password',{
        title : "Reset Password"
    })
}
//sending the email to reset password if email exist
module.exports.resetPassword = function(req,res){
    console.log(req.body.reset_email);
    User.findOne({email : req.body.reset_email},function(err,user){
        if(err){
            console.log('error in finding username');
            return;
        }else if(user){
            UserToken.create({
                user: user,
                accessToken : crypto.randomBytes(20).toString('hex'),
                isValid : true
            },
            function(err,usertoken){
                if(err){
                    console.log('error in creating user while resetting passowrd');
                    return;
                }

                let job = queue.create('reset_emails',usertoken).save(function(err){
                    if(err){
                        console.log('error in creating a queue',err);
                    }
                    console.log('job enqueued',job.id)
                });
                return res.render('reset_note',{
                    title: "Sent email to reset password"
                });
            })
        }
    })
}

//verifying the access token and rendering the change password page if token s valid
module.exports.password = function(req,res){
    UserToken.findOne({accessToken : req.params.accessToken},function(err,usertoken){
        if(err){
            console.log('error in finding usertoken',err);
            return;
        }else if(usertoken){
            if(!usertoken.isValid){
                return res.render('token_invalid',{
                    title: "Session Expired"
                }) 
            }else{
                return res.render('reset',{
                    title: "Change Password",
                    user_token: usertoken
                })
            }
        }
    });
}

//verifying whether the password and comfirm password are same and updating the passowrd in user schema
module.exports.changePassword = function(req,res){
    if(req.body.new_password != req.body.new_confirm_password){
        return res.redirect('back');
    }
    UserToken.findOne({accessToken : req.params.accessToken},function(err,usertoken){
        if(err){
            console.log('error in finding usertoken',err);
            return;
        }
        if(usertoken.isValid){
            let reset_user = usertoken.user._id;
            console.log(usertoken.isValid);
            console.log(reset_user);
            User.findByIdAndUpdate(reset_user,{password: req.body.new_password},function(err,user){
                if(err){console.log('Error in updating password',err);return;}
                console.log('password updated');
                return;
            })
            UserToken.findByIdAndUpdate(usertoken._id,{isValid: false},function(err,usertoken){
                if(err){console.log('Error in updating password',err);return;}
                console.log('usertoken updated');
                return;
            })
        }
        return res.render('password_updated',{
            title: "password changed"
        })
    });
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
    req.flash('success','Logged in Successfully');
    return res.redirect('/');
}

module.exports.destroySession = function(req,res){
    req.logout(function(err){
        if(err){
            console.log(err);
            return;
        }
        req.flash('success','You have logged out!');
        return res.redirect('/');
    });
}

module.exports.addFriend = async function(req,res){
    try{
        let fromUser = await User.findById(req.user._id);
        let toUser = await User.findById(req.query.friend_id);
        if(!fromUser.friendships.includes(req.query.friend_id)){
            fromUser.friendships.push(req.query.friend_id);
            fromUser.save();
            toUser.friendships.push(req.user._id);
            toUser.save();
            await Friendship.create({
                from_user: fromUser,
                to_user: toUser
            });
            req.flash('success','Added as Friend');
        }else{
            req.flash('error','Friend Already Exists');
        }
        return res.redirect('back');
    }catch(err){
        console.log("Error in creating friends", err);
        return res.redirect('back');
    }
}
module.exports.removeFriend = async function(req,res){
    try{
        let fromUser = await User.findById(req.user._id);
        let toUser = await User.findById(req.query.friend_id);
        let removeFriendship = await Friendship.deleteOne({from_user:fromUser,to_user:toUser});
        await User.findByIdAndUpdate(fromUser,{$pull: {friendships: req.query.friend_id}});
        await User.findByIdAndUpdate(toUser,{$pull: {friendships: req.user._id}});

        req.flash('success','Friend deleted');
        return res.redirect('back');
    }catch(err){
        console.log("Error in removing friends", err);
        return res.redirect('back');
    }
}