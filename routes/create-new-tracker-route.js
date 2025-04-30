// Desc: This file contains the routes for the create-new-tracker page

const app = require('express')
const router = app.Router()
const Projects = require('../server/schema/Projects')
const Deployments = require('../server/schema/EmpDeployment');
const Employees = require('../server/schema/Employees');
const bodyParser = require('body-parser');

app().use(bodyParser.json());

// Function to format date to YYYY-MM-DD
function formatDateWithoutTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

router.get('/', (req, res) => {
    res.render('landing-page', {
        pageTitle: 'Create New Tracker',
        partial: 'create-new-tracker',
        script: '/static/js/create-new-tracker.js',
        activePage: 'create-new-tracker',
        script:'/static/js/create-new-tracker.js',
        name: req.user.firstName,
        userType: req.user.userType
    });
}); 



// Function to handle creation of new tracker
router.post('/', async (req, res) => {
    try {

        /*
        new_project_name: projectName,
            new_project_descr: projectDesc,
            new_project_location: projectLocation,
            new_project_status :projectStatus,
            new_project_start_date:projectStartDate,
            new_project_end_date:projectEndDate,
        */
        // Check what type of action the user is trying to do
        const { action, 
            new_project_name,
            new_project_descr,
            new_project_location,
            new_project_status,
            new_project_start_date,
            new_project_end_date,
            employeeListData } = req.body;
        console.log('Type of action:', action);
        console.log(req.body);

        /*=========CREATE PROJECT PHASE===================*/
        if (req.body && typeof req.body === 'object') {

            // Destructure form data
            // const { trackerName, trackerDescription, trackerDueDate, trackerPriority, trackerStatus } = req.body
            // Check if all fields are filled
            const requiredFields = [new_project_name, new_project_descr, new_project_location, new_project_status, new_project_start_date];
            if (requiredFields.some(value => value === '' || (typeof value === 'string' && value.trim() === ''))) {
                res.status(400).json({ message: 'Please fill out all fields' });
            }
            // Check if the project name is already in use
            if (await Projects.findOne({ projectName: new_project_name })) {
                res.status(400).json({ message: 'Project name already in use' });
            }

            if(new_project_end_date){
            
            }

            //console.log("Start Date: " + formatDateWithoutTime(new_project_start_date).split('T')[0])
            // Create new project
            const newProject = new Projects({
                name: new_project_name,
                description: new_project_descr,
                location: new_project_location,
                //I tried everything to remove the time format, but it doesn't work.
                startDate: formatDateWithoutTime(new_project_start_date).split('T')[0],
                dueDate: new_project_end_date ? formatDateWithoutTime(new_project_end_date).split('T')[0] : null,
                //projectPriority: 'Low',
                status: new_project_status,
                //projectMembers: [],
                // projectTasks: []
                employees: [employeeListData.name],
                totalEmployees: employeeListData.length,
                totalDeployment: employeeListData.reduce((total, current) => total + current['deployment'], 0),
                totalRate: employeeListData.reduce((total, current) => total + current['totalRate'], 0)
            });

            // Save new project
            await newProject.save();
            
            //console.log('New project created');
            console.log(newProject);
            console.log(new_project_start_date)//ot
            //console.log(newProject.startDate)
            console.log("======")
            console.log( newProject.name + " No of Employees:" + employeeListData.length);
            console.log("the employees")
            console.log(employeeListData)
            console.log(typeof employeeListData)
            console.log("==================================================================")
            /*=========CREATE EMPLOYEE PHASE===================*/
            /*
            1. Push employee name into the employees property of projects.
            2. push project name into the current/past projects of employee.
            check if employee exists
                if yes
                    project.push(existingEmployee)
                    newDeployment(exitingEmployee and new Project)
                    existingEmployee.active/past projects.push(project)
                if no
                    new Employee
                    new deployment
            */
            for (let i = 0; i < employeeListData.length; i++) {
                 //console.log(employeeListData[i]);
                 let employee = employeeListData[i];
                 //console.log('---------------------------------');
                 let name = employee.firstName + ' ' + employee.middleName + ' ' + employee.lastName + ' ' + employee.suffix
                 const existingEmployee = await Employees.findOne({name: name})
                 //console.log(existingEmployee)
                 if(existingEmployee){
                    //console.log('The Employee exists in the MondoDB!')
                    const newDeployment = new Deployments({
                        employeeRef: existingEmployee._id,
                        employee: existingEmployee.name,
                        firstName: employee.firstName,
                        middleName: employee.middleName,
                        lastName: employee.lastName,
                        suffix: employee.suffix,
                        position:  employee.position,
                        deploymentHrs: employee.deployment,
                        rate: employee.rate,
                        totalRate: employee.totalRate,
                        project: newProject.name,
                        projectRef: newProject._id
                    })
                    await newDeployment.save();
        
                    existingEmployee.deployments.push(newDeployment._id);
                    await existingEmployee.save();
                }
                else{
                    //console.log('The Employee does not exist in the MongoDB!')
                    const newEmployee = new Employees({
                         //no: employee.no,
                         name: name,
                    });                
                            
                    const newDeployment = new Deployments({
                        employeeRef: newEmployee._id,
                        employee: name,
                        firstName: employee.firstName,
                        middleName: employee.middleName,
                        lastName: employee.lastName,
                        suffix: employee.suffix,
                        position:  employee.position,
                        deploymentHrs: employee.deployment,
                        rate: employee.rate,
                        totalRate: employee.totalRate,
                        project: newProject.name,
                        projectRef: newProject._id
                    })
                    await newDeployment.save();
        
                    newEmployee.deployments.push(newDeployment._id)
                    await newEmployee.save();
                } 
            }
           
            res.status(200).json({ redirect: '/template-project-tracker/' + newProject._id});
        }
    } catch (error) {
        console.error('Error creating new tracker:', error);
    }
});




module.exports = router;