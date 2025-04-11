const app = require('express')
const router = app.Router()
const bcrypt = require('bcrypt');
const User = require('../server/schema/Users');
const passport = require('passport')
const bodyParser = require('body-parser');

app().use(bodyParser.json());

router.get('/', (req, res) => {
    const redirect =  req.query.redirect;
    res.render('landing-page', {
        pageTitle: 'Reauthenticate User',
        partial: 'reauthenticate',
        script: '/static/js/reauthenticate.js',
        activePage: 'reauthenticate',
        redirect: redirect,
        name: req.user.firstName,
        userType: req.user.userType
    });
}); 

router.get('/isPassword', async (req, res) => {
    try {
        const companyID = req.user.companyID;
        console.log("company ID: " + companyID)
        const password = req.query.password;
        console.log(`password: ${password}`)
        
        // Find the user with the company ID
        const user = await User.findOne({ companyID: companyID });

        // Use the authenticate method from passport-local-mongoose to check if the password is correct
        user.authenticate(password, async (err, result) => {
            if (err) {
                console.error('Error checking if password is correct:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            if (result) {
                await user.resetAttempts()
                res.status(200).json({ authenticated: true});
            } else {
                const {remainingAttempts, lockedUntil} = await user.deductAttempts()
                res.status(200).json({ authenticated: false, remainingAttempts: remainingAttempts, lockedUntil: lockedUntil});
            }
        });
    } catch (error) {
        console.error('Error checking if user exists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/', async (req, res) => {
    const { redirect } = req.body;
    console.log(redirect)
    res.redirect(redirect);
})

router.get('/checkUserLockout', async (req, res) => {
    const companyID = req.user.companyID;
    const user = await User.findOne({companyID: companyID});
    if (!user) {
        return res.json({ isLocked: false });
    }
    const {isLocked, lockedUntil} = user.isLockedOut()
    console.log(`Is Locked: ${isLocked}, Locked Until: ${lockedUntil}`)
    return res.json({ isLocked: isLocked, lockedUntil: lockedUntil });
})


module.exports = router