const app = require('express')
const router = app.Router()
const bcrypt = require('bcrypt');
const User = require('../server/schema/Users');
const Log = require('../server/schema/Logs');
const passport = require('passport')
const bodyParser = require('body-parser');
const LOG_TYPES = require('../public/utils/logTypes');

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

router.post('/create-log', async (req, res) => {
    const username = [
        req.user.firstName,
        req.user.middleName,
        req.user.lastName,
        req.user.suffix
    ].filter(Boolean).join(' ');

    try {
        const {logType} = req.body;

        // Validate log_type
        const allowedLogTypes = [
            'login_success',
            'reauth_success',
            'reauth_fail',
            'user_lockout',
            'ip_lockout'
        ];

        if (!allowedLogTypes.includes(logType)) {
            return res.status(400).json({ error: 'Invalid log type' });
        }

        const log = new Log({
            userID: req.user._id,
            username: username,
            userType: req.user.userType,
            logType: logType,
            detectedAt: new Date()
        });

        await log.save();

        return res.status(201).json({ message: 'Log created', log });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Server error' });
    }
});

router.get('/isPassword', async (req, res) => {
    try {
        
        const username = [
            req.user.firstName,
            req.user.middleName,
            req.user.lastName,
            req.user.suffix
        ].filter(Boolean).join(' ');

        const companyID = req.user.companyID;
        console.log("company ID: " + companyID)
        const password = req.query.password;
        
        // Find the user with the company ID
        const user = await User.findOne({ companyID: companyID });

        // Use the authenticate method from passport-local-mongoose to check if the password is correct
        user.authenticate(password, async (err, result) => {
            if (err) {
                console.error('Error checking if password is correct:', err);
                return res.status(500).json({ message: 'Internal Server Error' });
            }
            if (result) {
                const log = new Log({
                    userID: req.user._id,
                    username: username,
                    userType: req.user.userType,
                    logType: LOG_TYPES.REAUTH_SUCCESS,
                    detectedAt: new Date()
                });
        
                await log.save();
                await user.resetAttempts()
                res.status(200).json({ authenticated: true});
            } else {
                const log = new Log({
                    userID: req.user._id,
                    username: username,
                    userType: req.user.userType,
                    logType: LOG_TYPES.REAUTH_FAIL,
                    detectedAt: new Date()
                });
        
                await log.save();
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
    res.redirect(redirect);
})

router.get('/checkUserLockout', async (req, res) => {
    const companyID = req.user.companyID;
    const user = await User.findOne({companyID: companyID});
    if (!user) {
        return res.json({ isLocked: false });
    }
    const {isLocked, lockedUntil} = user.isLockedOut()
    return res.json({ isLocked: isLocked, lockedUntil: lockedUntil });
})


module.exports = router