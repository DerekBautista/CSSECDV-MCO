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

        user.authenticate(password, (err, result) => {
            if (err) {
                console.error('Error checking if password is correct:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
    
            if (result) {
                // Authentication succeeded
                req.logIn(user, (err) => {
                    if (err) {
                        console.error('Error during login:', err);
                        return next(err);
                    }
                    console.log('Authentication succeeded');
                });
            } else {
                // Authentication failed
                return res.status(401).json({ message: 'Incorrect password' });
            }
        });
        
        // 2.1.10 Prevent password re-use (check against last 5 passwords)
        // FIX THIS LATER
        // const lastPasswords = user.passwordHistory || [];
        // for (const oldHash of lastPasswords) {
        //     if (await bcrypt.compare(password, oldHash)) {
        //         return res.status(400).json({ error: 'Cannot use a previously used password' });
        //     }
        // }
        
        // 2.1.11 Prevent password change if last change was less than 24 hours ago
        if (user.lastPasswordChange) {
            const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            if (user.lastPasswordChange > oneDayAgo) {
                return res.status(400).json({ 
                    error: 'Password can only be changed once per day',
                    nextChangeTime: user.lastPasswordChange.getTime() + 24 * 60 * 60 * 1000
                });
            }
        }
        
        // Update user
        const newPasswordHash = await bcrypt.hash(password, 10);
        
        // Keep last 5 passwords
        const updatedPasswordHistory = [user.password, ...user.passwordHistory || []].slice(0, 5);
        

        await User.findByIdAndUpdate(req.session.userId, {
            password: newPasswordHash,
            passwordHistory: updatedPasswordHistory,
            lastPasswordChange: new Date()
        });
        
        
        res.redirect('/landing-page');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while updating your account' });
    }
});

router.get('/getuser', (req, res) => {
    const user = req.body.user;

    res.json(user);
});

module.exports = router;