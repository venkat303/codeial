const mongoose = require('mongoose');
const resetPasswordTokenSchema = new mongoose.Schema({
    user: {
        type : mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    accessToken:{
        type: String,
        required : true
    },
    isValid:{
        type: Boolean,
        required: true
    }
},{
    timestamps:true
});
const ResetPassword = mongoose.model('ResetPassword',resetPasswordTokenSchema);
module.exports=ResetPassword;