// Dashboard routing

const app = require('express');
const projects = require('../server/schema/Projects');
const employee = require('../server/schema/Employees');
const deployments = require('../server/schema/EmpDeployment');
const router = app.Router()

async function getTotalProjects() {
    try {
        // Define your conditions in the query object
        const totalProjects = await projects.countDocuments();
        return totalProjects;
    } catch (error) {
        console.error('Error counting documents with conditions:', error);
        throw error; // Handle the error as needed for your application
    }
}

async function getTotalEmployees(){
    try {
        const totalEmployees = await employee.countDocuments();
        return totalEmployees;
    } catch (error) {
        console.error('Error counting documents with conditions:', error);
        throw error; // Handle the error as needed for your application
    }
}

async function getTotalDeployments(){
    try {
        const totalDeployments = await deployments.countDocuments();
        return totalDeployments;
    } catch (error) {
        console.error('Error counting documents with conditions:', error);
        throw error; // Handle the error as needed for your application
    }
}

async function getTotalRate() {
    try {
        const result = await employee.aggregate([
            {
                $group: {
                    _id: null,
                    totalRate: { $sum: '$totalRate' },
                },
            },
        ]);

        if (result.length > 0) {
            // The total cost is available in the result array
            const totalCost = result[0].totalRate;
            console.log('Total Rate:', totalCost);
            return totalCost;
        } else {
            console.log('No documents found.');
            return 0;
        }
    } catch (error) {
        console.error('Error calculating total cost:', error);
        throw error;
    }
}
// Usage

router.get('/', async (req, res) => {
    // res.render('main', { 
    //     pageTitle: 'Dashboard',
    //     partial: 'dashboard'
    // });
    const totalProjects = await getTotalProjects();
    const totalEmployees = await getTotalEmployees();
    const totalDeployments = await getTotalDeployments();
    const totalRate = await getTotalRate();
    console.log('Total number of projects:', totalProjects);
    /*const data = {
        totalProjects: totalProjects,
        totalEmployees: totalEmployees,
        totalDeployments: totalDeployments,
        totalRate: totalRate
    }*/
    

    res.render('landing-page', { 
        pageTitle: 'Dashboard',
        partial: 'dashboard',
        activePage: 'dashboard',
        script: '/static/js/charts.js',
        name: req.user.firstName,
        totalProjects: totalProjects,
        totalEmployees: totalEmployees,
        totalDeployments: totalDeployments,
        totalRate: totalRate
    });
})




module.exports = router;