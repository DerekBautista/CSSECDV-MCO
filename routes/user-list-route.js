/*
    Project List routing
*/

const app = require('express');
const router = app.Router();
users = require('../server/schema/Users')

router.get('/get-list', async(req,res) =>{
    try {
        console.log('get-list GET');
        const userList = await users.find().exec();
        console.log(userList);
        res.json(userList); // Send the array as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle errors with a JSON response
    }
})

router.get('/', async (req, res) => {
    /*Get the right information in the db to here*/
    res.render('landing-page', { 
        pageTitle: 'User List',
        partial: 'user-list',
        activePage: 'user-list',
        userType: "Customer",
        script:'/static/js/user-list.js',
        name: req.user.firstName
    });
})
module.exports = router;