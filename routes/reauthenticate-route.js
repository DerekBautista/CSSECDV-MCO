const app = require('express')
const router = app.Router()
const bcrypt = require('bcrypt');
const User = require('../server/schema/Users');
const FailedAttempts = require('../server/schema/FailedAttempts');
const passport = require('passport')
const bodyParser = require('body-parser');

app().use(bodyParser.json());

async function checkIpAttempts(ip){
    console.log("IP: " + ip)
    const ipInstance = await FailedAttempts.findOne({ip: ip});

    if (ipInstance){
       return await ipInstance.deductAttempts()
    }
    else{
        const newIpInstance = new FailedAttempts({
            ip: ip,
            remainingAttempts: 4, // Assuming 5 total attempts (5-1 = 4 remaining)
            //totalFailedAttempts: 1,
            isLocked: false
        });
        await newIpInstance.save();
        //return newIpInstance.remainingAttempts;
        return { remainingAttempts: newIpInstance.remainingAttempts, lockedUntil: 0};
    }
}

router.get('/', (req, res) => {
    const redirect =  req.query.redirect;
    res.render('landing-page', {
        pageTitle: 'Reauthenticate User',
        partial: 'reauthenticate',
        script: '/static/js/reauthenticate.js',
        activePage: 'reauthenticate',
        redirect: redirect,
        name: req.user.firstName
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
                res.status(200).json({ authenticated: true});
            } else {
                console.log("WRONG D:")
                const ip = req.ip;
                const {remainingAttempts, lockedUntil} = await checkIpAttempts(ip)
                res.status(200).json({ authenticated: false, remainingAttempts: remainingAttempts, lockedUntil: lockedUntil});
            }
        });
    } catch (error) {
        console.error('Error checking if user exists:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.post('/', async (req, res, next) => {
    const { redirect } = req.body;
    /*
     * Keep the logic flow consistent with how the logging was done at the start. Check the password using the javascript.
     * Only call this post when all is goods and we can renavigate to the next one.
     */
    console.log(redirect)
    res.redirect(redirect);
})

router.get('/checkIpLockout', async (req, res) => {
    const ip = req.ip;
    const ipInstance = await FailedAttempts.findOne({ip: ip});
    if (!ipInstance) {
        return res.json({ isLocked: false });
    }
    const {isLocked, lockedUntil} = ipInstance.isLockedOut()
    return res.json({ isLocked: isLocked, lockedUntil: lockedUntil });
})


module.exports = router