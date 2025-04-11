/*
    Project List routing
*/

const app = require('express');
const router = app.Router();
projects = require('../server/schema/Projects')

router.get('/get-list', async(req,res) =>{
    try {
        console.log('get-list GET');
        const projList = await projects.find().exec();
        console.log(projList);
        res.json(projList); // Send the array as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle errors with a JSON response
    }
})

router.get('/', async (req, res) => {
    /*Get the right information in the db to here*/
    res.render('landing-page', { 
        pageTitle: 'Project List',
        partial: 'customer-project-list',
        activePage: 'project-list',
        script:'/static/js/customer-project-list.js',
        name: req.user.firstName,
        userType: req.user.userType
    });
})
module.exports = router;