// Employee list routing

const app = require('express')
const router = app.Router()
deployments = require('../server/schema/EmpDeployment')

router.get('/get-list', async(req,res) =>{
    try {
        console.log('get-list GET');
        const employeeList = await deployments.find().exec();
        console.log(employeeList);
        res.json(employeeList); // Send the array as JSON response
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle errors with a JSON response
    }
})

router.get('/', async (req, res) => {
    console.log("employee-list GET")
    res.render('landing-page', { 
        pageTitle: 'Employee List',
        partial: 'employee-list',
        activePage: 'employee-list',
        script: '/static/js/employee-list.js',
        name: req.user.firstName,
        userType: req.user.userType
    });
})


module.exports = router