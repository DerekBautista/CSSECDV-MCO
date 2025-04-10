const app = require('express');
const router = app.Router()
const User = require('../server/schema/Users');
const bcrypt = require('bcrypt');
const passport = require('passport');

router.get('/', (req, res) => {

    console.log('req.user.securityQuestion1.question')


    res.render('landing-page', { 
        pageTitle: 'Account Settings',
        partial: 'account-settings',
        activePage: 'account-settings',
        script: '/static/js/account-settings.js',
        name: req.user.firstName,
        middlename: req.user.middlName,
        lastname: req.user.lastName,
        suffix: req.user.suffix,
        companyID: req.user.companyID,
        securityQuestion1: req.user.securityQuestion1.question,
        securityQuestion2: req.user.securityQuestion2.question,
        securityAnswer1: req.user.securityQuestion1.answer,
        securityAnswer2: req.user.securityQuestion2.answer,
        userinfo: req.user
    });
});



router.post('/passwordchange', async (req, res) => {
    try {
        const {
            security_answer_1,
            security_answer_2,
            password,
            acc_confirm,
            current_password
        } = req.body;
        
        console.log(security_answer_1,
            security_answer_2,
            password,
            acc_confirm,
            current_password)
        
        // 1. Verify current password
        const user = await User.findOne({ companyID: req.user.companyID });

        user.authenticate(current_password, (err, result) => {
            if (err) {
                console.error('Error checking if password is correct:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
    
            if (result) {

            } else {
                // Authentication failed
                return res.status(400).json({ message: 'Incorrect password' });
            }
        });

        if(password == req.user.passwordHistory)
        {
            return res.status(400).json({ message: 'Cannot use previous password'});
        }
        
        console.log(req.user.lastPasswordChange instanceof Date);


        if (req.user.lastPasswordChange) {
            const now = +new Date();
            const oneday = 60 * 60 * 24 * 1000;
            if ((now - req.user.lastPasswordChange) < oneday) {
                 return res.status(400).json({ message: 'Password can only be changed after 24 hours'});
            }
        }
        
        // Update user
        const updateUser = await User.findOneAndUpdate({companyID: req.user.companyID}, {
            passwordHistory: current_password,
            lastPasswordChange: new Date()
        });
       
        const updatePassword = await User.findOne({ companyID: req.user.companyID });

        updatePassword.changePassword(current_password, password, function (err){
            if(!err){
                return res.status(200).json({ message: 'password reset successful'})
            } else {
                console.log(err);
            }
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred while updating your account' });
    }
});

router.get('/getuser', (req, res) => {
    const user = req.body.user;

    res.json(user);
});

module.exports = router;