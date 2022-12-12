module.exports.index = function(req,res){
    return res.json(200,{
        message:'Lists of Post in V2',
        posts: []
    })
}