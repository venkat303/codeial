const nodeMailer = require('../config/nodemailer');

exports.resetPassword = (reset) => {
    let htmlString = nodeMailer.renderTemplate({reset:reset},'/reset_password/resetPassword.ejs')

    nodeMailer.transporter.sendMail({
        from: 'raghava.bv3952@gmail.com',
        to: reset.user.email,
        subject: "Reset your Codial password",
        html: htmlString
    },(err,info) => {
        if(err){console.log('Error in sending mail',err);return;}
        console.log('Mail delivered', info);
        return;
    })
}