const Post = require('../models/post');
const User = require('../models/user');
const Comment=require('../models/comment');
module.exports.home = async function(req,res){
    try{
        //populate the user of each post
        let posts = await Post.find({})
        .sort('-createdAt')
        .populate('user')
        .populate({
            path: 'comments',
            populate:{
                path: 'user'
            }
        })
        .populate({
            path: 'comments',
            populate: {
                path: 'likes'
            }
        })
        .populate('likes');
        let users = await User.find({});
        let signInUserFriends = await User.find({friendships:req.user._id});

        return res.render('home',{
            title: "Codeial | Home",
            posts: posts,
            all_users: users,
            friends: signInUserFriends
        });

    }catch(err){
        console.log('Error',err);
        return;
    }
    
}