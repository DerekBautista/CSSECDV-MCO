// Desc: This file contains the routes for the create-new-tracker page

const app = require('express')
const router = app.Router()
const Projects = require('../server/schema/Projects')
const Deployments = require('../server/schema/EmpDeployment');
const Employees = require('../server/schema/Employees');
const bodyParser = require('body-parser');
const { route } = require('./create-new-tracker-route');
app().use(bodyParser.json());

// Function to format date to YYYY-MM-DD
function formatDateWithoutTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0').split('T')[0];
    return `${year}-${month}-${day}`;
}

router.get('/get-current-project', async (req, res) =>{
    try {
        console.log('get-project GET');
        const projectID = req.session.projectID
        const project = await projects.findById(projectID);
        console.log(project);
        res.json(project); // Send the array as JSON response\
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle errors with a JSON response
    }
})

router.get('/get-project-employees', async (req, res) =>{
    try{
        console.log('get-project employees GET');
        const projectID = req.session.projectID
        const employeeListData = await Deployments.find({projectRef: projectID}).exec()
        console.log(employeeListData);
        res.json(employeeListData); // Send the array as JSON response

    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' }); // Handle errors with a JSON response
    }
})

router.get('/:projectID', async (req, res) => {
    const projectID = req.params.projectID;
    req.session.projectID = projectID;
    const project = await projects.findById(projectID);
    res.render('landing-page', {
        pageTitle: 'Edit ' + project.name,
        partial: 'edit-project-tracker',
        script: '/static/js/edit-project-tracker.js',
        activePage: 'create-new-tracker',
        script:'/static/js/edit-project-tracker.js',
        name: req.user.firstName,
        userType: req.user.userType
    });
}); 

router.post('/', async (req,res) => {

     // Check what type of action the user is trying to do
    const { 
        new_project_name,
        new_project_descr,
        new_project_location,
        new_project_status,
        new_project_start_date,
        new_project_end_date,
        new_project_total_employees,
        new_project_total_deployment,
        new_project_total_rate,
        employeeListData,
        deleteEmployeeList
     } = req.body;
     console.log('edit tracker post success')
    console.log(req.body);
    projectID =req.session.projectID;
    let updatedProject = {
        name: new_project_name,
        description: new_project_descr,
        location: new_project_location,
        status: new_project_status,
        startDate: formatDateWithoutTime(new_project_start_date),
        dueDate: new_project_end_date ? formatDateWithoutTime(new_project_end_date) : null,
        totalEmployees:  new_project_total_employees,
        totalDeployment: new_project_total_deployment,
        totalRate: new_project_total_rate
    }

   

    // Find the project by ID and update its properties
    await Projects.updateOne({ _id: projectID }, { $set: updatedProject })
    .then(result => {
      console.log('Document updated successfully:', result);
    })
    .catch(err => {
      console.error(err);
    });

    
    //function delete before function edit
    for (let i = 0; i < deleteEmployeeList.length; i++) {
        const employeeID = deleteEmployeeList[i];
      /*
        1. delete employee document
        2. delete all its deployment documents
        3. properties of Project dont need to be updated here, 
            it is already updated by the code above.
        */
        // 1. Delete employee document
        try{
        let result = await Employees.deleteOne({ _id: employeeID });
            if (result.deletedCount === 1) {
                console.log('Employee deleted successfully');
            } else {
                console.log('Document not found or not deleted');
            }
            
            result = await Deployments.deleteMany({ employeeRef: employeeID });
            if (result.deletedCount === 1) {
                console.log('Deploymeny deleted successfully');
            } else {
                console.log('Document not found or not deleted');
            }
            } catch (err) {
            console.error('Error deleting document:', err);
            }
    }


    //update employee data in db
    employeeListData.forEach(async (employee) => {
        try{
            if(employee._id == null){
                //create employee
                const newEmployee = new Employees({
                    //no: employee.no,
                    name: employee.employee,
                });                
                
                
                //create deployment
                const newDeployment = new Deployments({
                    employeeRef: newEmployee._id,
                    employee: employee.employee,
                    firstName: employee.firstName,
                    middleName: employee.middleName,
                    lastName: employee.lastName,
                    suffix: employee.suffix,
                    position:  employee.position,
                    deploymentHrs: employee.deploymentHrs,
                    rate: employee.rate,
                    totalRate: employee.totalRate,
                    project: new_project_name,
                    projectRef: projectID
                })
                await newDeployment.save();
                
                newEmployee.deployments.push(newDeployment._id)
                await newEmployee.save();
            }
            else{
                let updatedDeployment = {
                    employee: employee.employee,
                    firstName : employee.firstName,
                    middleName : employee.middleName,
                    lastName :employee.lastName,
                    suffix : employee.suffix,
                    position : employee.position,
                    deployment : employee.deploymentHrs,
                    rate : employee.rate,
                    totalRate : employee.totalRate,
                    project: new_project_name
                }

                console.log('Update employee')
                console.log(employee)  

                //update employee
                let result = await Employees.updateOne({ _id: employee.employeeRef}, { $set:{ name: employee.employee }});
                if (result.nModified === 1) {
                    console.log('Employee updated successfully');
                } else {
                    console.log('Employee not found or not updated');
                }

                //update deployment
                result = await Deployments.updateMany({ employeeRef: employee.employeeRef }, { $set: updatedDeployment });
                if (result.nModified === 1) {
                    console.log('Deployment updated successfully');
                } else {
                    console.log('Deployment updated or not updated');
                }
            }

            res.status(200).json({ redirect: '/template-project-tracker/' + projectID});
        }catch (err) {
            console.error(`Error deleting employee ${employee._id}:`, err);
        }
    })
})

router.post("/delete-current-project", async (req,res) =>{

    const projectID = req.session.projectID

    try{
        let result = await Deployments.deleteMany({ projectRef: projectID });
        if (result.deletedCount > 1) {
            console.log('Deployments deleted successfully');
        } else {
            console.log('Deployment not found or not deleted');
        }

        result = await Projects.deleteOne({ _id: projectID });
        if (result.deletedCount === 1) {
            console.log('Project deleted successfully');
        } else {
            console.log('Project not found or not deleted');
        }

        res.status(200).json({ redirect: '/dashboard'});
    }
    catch (err) {
        console.error(`Error deleting project ${projectID}:`, err);
    }
})



module.exports = router;