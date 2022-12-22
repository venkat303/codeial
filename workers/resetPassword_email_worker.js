const queue =  require('../config/kue');

const resetPasswordMailer= require('../mailers/resetPassword_mailer');

queue.process('reset_emails',function(job,done){
    console.log('emails worker is processing a job',job.data);

    resetPasswordMailer.resetPassword(job.data);
    done();
})