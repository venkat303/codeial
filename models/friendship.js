const mongoose =  require('mongoose');

const friendshipSchema = new mongoose.Schema({
    //user who send the request
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    //user who accepted the request the naming is just to understand,otherwise the users wont see ay difference
    to_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

const Friendship = mongoose.model('Friendship',friendshipSchema);
module.exports = Friendship;