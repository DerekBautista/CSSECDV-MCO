
const app = require('express');
const router = app.Router();
logs = require('../server/schema/Logs')


router.get('/get-list', async(req,res) =>{
    try {
        console.log('get-list GET');
        const logList = await logs.find().exec();
        res.json(logList); // Send the array as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle errors with a JSON response
    }
})

router.get('/', async (req, res) => {
    res.render('landing-page', { 
        pageTitle: 'Log List',
        partial: 'log-list',
        activePage: 'log-list',
        script:'/static/js/log-list.js',
        name: req.user.firstName,
        userType: req.user.userType
    });
})

module.exports = router;