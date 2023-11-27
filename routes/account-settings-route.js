const app = require('express')
const router = app.Router()
const User = require('../server/schema/Users');

router.get('/', (req, res) => {


    res.render('landing-page', { 
        pageTitle: 'Account Settings',
        partial: 'account-settings',
        activePage: 'account-settings',
        script: '/static/js/account-settings.js',
        name: req.user.firstName
    });
});

module.exports = router;