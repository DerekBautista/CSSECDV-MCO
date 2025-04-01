async function getCurrentProject(){
    try {
        const response = await fetch("/edit-project-tracker/get-current-project", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(response.status == 200){
            return await response.json()
        }else{
            console.error(`An error has occured. Status code = ${response.status}`);
            return { status: 'error', message: 'Error fetching data' };
        }
    } catch (error) {
        console.error(error);
        return {status: 'error', message: 'Error fetching data' };
    }
}

async function getProjectEmployees(){
    try {
        const response = await fetch("/edit-project-tracker/get-project-employees", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        if(response.status == 200){
            return await response.json()
        }else{
            console.error(`An error has occured. Status code = ${response.status}`);
            return { status: 'error', message: 'Error fetching data' };
        }
    } catch (error) {
        console.error(error);
        return {status: 'error', message: 'Error fetching data' };
    }
}

async function deleteTracker() {
    try {
        const response = await fetch("/edit-project-tracker/delete-current-project", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        if (response.status === 200) {
            const data = await response.json(); // Parse the response JSON

            if (data.redirect) {
                window.location.href = data.redirect; // Redirect if the server sends a redirect URL
            } else {
                // Handle other data from the server if needed
            }
        } else {
            console.error(`An error has occurred. Status code = ${response.status}`);
            // Handle error case or return an error object
            return { status: 'error', message: 'Error deleting data' };
        }
    } catch (error) {
        console.error(error);
        // Handle error case or return an error object
        return { status: 'error', message: 'Error deleting data' };
    }
}


document.addEventListener('DOMContentLoaded', async function (e){
    document.getElementById('new-project-status').addEventListener('change', function(event) {
        event.preventDefault();
    
        const projectStatus = document.getElementById('new-project-status').value;
        console.log(projectStatus);
        if (projectStatus === 'ON-GOING') {
            document.getElementById('new-project-end-date').setAttribute('disabled', true);
        } else if (projectStatus === 'COMPLETED') {
            document.getElementById('new-project-end-date').removeAttribute('disabled');
            document.getElementById('new-project-end-date').setAttribute('required', true);
        }
    });
/*=======================initializeForm function=====================*/
    function initializeForm(){
    
        console.log(employeeListData)
    
    
        document.getElementById("new-project-name").value = project.name
        document.getElementById("new-project-desc").value = project.description
        document.getElementById("new-project-location").value = project.location
        document.getElementById("new-project-status").value = project.status

        //setting the date is done somewhere below, this just be
        //document.getElementById("new-project-start-date").value = project.startDate.split('T')[0]
        //document.getElementById("new-project-end-date").value = project.dueDate.split('T')[0]
    
         // Get the employee table
         const employeeListTable = document.getElementById('employee-table');
        
         // Get the table body
         const employeeListTableBody = employeeListTable.querySelector('tbody');
        
         

         //set the employee table
         let id = 1
         employeeListData.forEach(employee => {
            const row = employeeListTableBody.insertRow(); // Create a new row
            // Insert cell data into the row
            row.setAttribute('class', 'employeeRow_'+employee.no);
            row.insertCell().textContent = id;
            id += 1
            row.insertCell().textContent = employee.employee;
            row.insertCell().textContent = employee.position;
            row.insertCell().textContent = employee.deploymentHrs;
            row.insertCell().textContent = employee.rate;
            row.insertCell().textContent = employee.totalRate;
            row.insertCell().innerHTML = '<button type="button" data-index="' + employee.no + '"class="btn btn-warning btn-sm btn-edit-employee" id="btn-edit-employee' + employee.no + '" data-bs-toggle="modal" data-bs-target="#enterEmployeeModal">Edit</button>';
            row.insertCell().innerHTML = '<button  data-index="' + employee.no + '"class="btn btn-danger btn-sm btn-delete-employee" id="btn-delete-employee' + employee.no + '">Delete</button>';
         
            let editBtn = document.getElementById('btn-edit-employee' + employee.no)
            let deleteBtn = document.getElementById('btn-delete-employee' + employee.no)
    
            editBtn.addEventListener("click", async (e) => {
                let selectedEmployee = employeeListData.find(employee => String(employee.no) ===  editBtn.dataset.index);
    
                if (selectedEmployee) {
                    console.log('Selected Employee:', selectedEmployee);
                   //submit button: <button type="submit" id="enter-employee-btn" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#enterEmployeeModal">Enter Employee</button>
                   //x button: <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                   //display the form with employee's info
                    document.getElementById('employeeFirstName').value = selectedEmployee.firstName;
                    document.getElementById('employeeMiddleName').value = selectedEmployee.middleName;
                    document.getElementById('employeeLastName').value = selectedEmployee.lastName;
                    document.getElementById('employeeSuffix').value = selectedEmployee.suffix;
                    document.getElementById('employeePosition').value = selectedEmployee.position;
                    document.getElementById('employeeDeployment').value = selectedEmployee.deploymentHrs;
                    document.getElementById('employeeRate').value = selectedEmployee.rate;
                    //this indicates the employee number to be edited. 0 indicates create It will reset to 0 when you click x on the edit tracker form.
                    document.getElementById('enter-employee-btn').dataset.index = selectedEmployee.no;
                    //let modal = new bootstrap.Modal(document.getElementById('enterEmployeeModal'));
                    //modal.show();
                } else {
                    console.log('Employee not found in the array on edit employee btn');
                }
            })
    
            deleteBtn.addEventListener("click", async (e) => {
                let selectedEmployee = employeeListData.find(employee => String(employee.no) ===  editBtn.dataset.index);
                if (selectedEmployee) {
    
                    const employeeListTable = document.getElementById('employee-table');
                    const employeeListTableBody = employeeListTable.querySelector('tbody');
                    const empRow = employeeListTableBody.querySelector('.employeeRow_'+selectedEmployee.no); // Get employee's respective row
                    empRow.remove();//remove employee from table
                    //if this is an existing employee in the db
                    if(selectedEmployee._id){
                        deletedEmployeeIDs.push(selectedEmployee.employeeRef);
                    }
                    employeeListData = employeeListData.filter(item => item.no !== selectedEmployee.no);//remove employee from array
                    
                    let id = 1;
                    for (var i = 0; i < employeeListTableBody.rows.length; i++) {
                        var row = employeeListTableBody.rows[i];
                        row.cells[0].innerHTML = id; // Assuming the ID is in the first cell
                    }
    
                    console.log('delete')
                    console.log(employeeListData)
                    console.log(deletedEmployeeIDs)
                } else {
                    console.log('Employee not found in the array on delete employee btn');
                }
            })
        })

        //set the calendar form
        const projectStatus = document.getElementById('new-project-status').value;
        console.log(projectStatus);
        if (projectStatus === 'ON-GOING') {
            document.getElementById('new-project-end-date').setAttribute('disabled', true);
            console.log(project.startDate.split('T')[0])
            document.getElementById('new-project-start-date').value = project.startDate.split('T')[0]
        } else if (projectStatus === 'COMPLETED') {
            document.getElementById('new-project-end-date').removeAttribute('disabled');
            document.getElementById('new-project-end-date').setAttribute('required', true);
            document.getElementById('new-project-start-date').value = project.startDate.split('T')[0]
            document.getElementById('new-project-end-date').value = project.dueDate.split('T')[0]
            console.log(project.startDate.split('T')[0])
        }

    }
/*============================================================================================================*/
    let project = await getCurrentProject();
    let employeeListData = await getProjectEmployees();
    let deletedEmployeeIDs = []
    let counter = 1;
    employeeListData.forEach(employee => {
        employee['no'] = counter;
        counter += 1
    });

    initializeForm();

    document.getElementById('employee-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        const employeeFirstName = document.getElementById('employeeFirstName').value.toUpperCase();
        const employeeMiddleName = document.getElementById('employeeMiddleName').value.toUpperCase();
        const employeeLastName = document.getElementById('employeeLastName').value.toUpperCase();
        const employeeSuffix = document.getElementById('employeeSuffix').value.toUpperCase();
        const employeePosition = document.getElementById('employeePosition').value.toUpperCase();
        const employeeDeployment = parseFloat(document.getElementById('employeeDeployment').value);
        const employeeRate = parseFloat(document.getElementById('employeeRate').value);
        let employeeTotalRate = employeeDeployment * employeeRate;
    

        // Log to the console the values
        console.log(employeeFirstName);
        console.log(employeeMiddleName);
        console.log(employeeLastName);
        console.log(employeeSuffix);
        console.log(employeePosition);
        console.log(employeeDeployment);
        console.log(employeeRate);
        console.log(employeeTotalRate);
        let index = document.getElementById('enter-employee-btn').dataset.index;

        

        //checking if it is to edit for an employee (if dataset index represents an employee from 1 to n)
        if(index > 0){
            console.log('edit employee')
            const temp_employee= {
                no: index,
                employee: employeeFirstName + ' ' + employeeMiddleName + ' ' + employeeLastName + ' ' + employeeSuffix,
                firstName : employeeFirstName,
                middleName : employeeMiddleName,
                lastName :employeeLastName,
                suffix : employeeSuffix,
                position : employeePosition,
                deploymentHrs : employeeDeployment,
                rate : employeeRate,
                totalRate : employeeTotalRate
            }
            updateEmployee(temp_employee);
        }
        else{ // else, create new employee (0 indicates that)
            // Add the employee data to the global variable
            console.log('create employee')
            const temp_employee= {
                no: counter,
                employee: employeeFirstName + ' ' + employeeMiddleName + ' ' + employeeLastName + ' ' + employeeSuffix,
                firstName : employeeFirstName,
                middleName : employeeMiddleName,
                lastName :employeeLastName,
                suffix : employeeSuffix,
                position : employeePosition,
                deploymentHrs : employeeDeployment,
                rate : employeeRate,
                totalRate : employeeTotalRate
            }
           createNewEmployee(temp_employee);
        }
       
        // Log to the console the employee data
        
        console.log(employeeListData);
        console.log(deletedEmployeeIDs);
    
        // Reset the form
        document.getElementById('employee-form').reset();
    
        // Log to the console that the form was reset
        console.log('Form reset!');
    });

        //=========================CREATE EMPLOYEE==============================//
    function createNewEmployee(temp_employee){
        employeeListData.push(temp_employee);

        // Get the employee table
        const employeeListTable = document.getElementById('employee-table');
    
        // Get the table body
        const employeeListTableBody = employeeListTable.querySelector('tbody');
    

        const row = employeeListTableBody.insertRow(); // Create a new row
    
        // Insert cell data into the row
        row.setAttribute('class', 'employeeRow_'+temp_employee.no);
        row.insertCell().textContent = employeeListData.length;
        row.insertCell().textContent = temp_employee.firstName + ' ' + temp_employee.middleName + ' ' + temp_employee.lastName + ' ' + temp_employee.suffix;
        row.insertCell().textContent = temp_employee.position;
        row.insertCell().textContent = temp_employee.deploymentHrs;
        row.insertCell().textContent = temp_employee.rate;
        row.insertCell().textContent = temp_employee.totalRate;
        row.insertCell().innerHTML = '<button type="button" data-index="' + temp_employee.no + '"class="btn btn-warning btn-sm btn-edit-employee" id="btn-edit-employee' + temp_employee.no + '" data-bs-toggle="modal" data-bs-target="#enterEmployeeModal">Edit</button>';
        row.insertCell().innerHTML = '<button  data-index="' + temp_employee.no + '"class="btn btn-danger btn-sm btn-delete-employee" id="btn-delete-employee' + temp_employee.no + '">Delete</button>';
        
        
        let editBtn = document.getElementById('btn-edit-employee' + temp_employee.no)
        let deleteBtn = document.getElementById('btn-delete-employee' + temp_employee.no)
        //add an edit button if edit button clicked, display the form
        editBtn.addEventListener("click", async (e) => {
            let selectedEmployee = employeeListData.find(employee => String(employee.no) ===  editBtn.dataset.index);

            if (selectedEmployee) {
                console.log('Selected Employee:', selectedEmployee);
               //submit button: <button type="submit" id="enter-employee-btn" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#enterEmployeeModal">Enter Employee</button>
               //x button: <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
               
               //display the form with employee's info
                document.getElementById('employeeFirstName').value = selectedEmployee.firstName;
                document.getElementById('employeeMiddleName').value = selectedEmployee.middleName;
                document.getElementById('employeeLastName').value = selectedEmployee.lastName;
                document.getElementById('employeeSuffix').value = selectedEmployee.suffix;
                document.getElementById('employeePosition').value = selectedEmployee.position;
                document.getElementById('employeeDeployment').value = selectedEmployee.deploymentHrs;
                document.getElementById('employeeRate').value = selectedEmployee.rate;
                //this indicates the employee number to be edited. 0 indicates create It will reset to 0 when you click x on the edit tracker form.
                document.getElementById('enter-employee-btn').dataset.index = selectedEmployee.no;
                //let modal = new bootstrap.Modal(document.getElementById('enterEmployeeModal'));
                //modal.show();
            } else {
                console.log('Employee not found in the array on create employee');
            }
        })

        deleteBtn.addEventListener("click", async (e) => {
            let selectedEmployee = employeeListData.find(employee => String(employee.no) ===  editBtn.dataset.index);
            if (selectedEmployee) {
                const employeeListTable = document.getElementById('employee-table');
                const employeeListTableBody = employeeListTable.querySelector('tbody');
                const empRow = employeeListTableBody.querySelector('.employeeRow_'+selectedEmployee.no); // Get employee's respective row
                empRow.remove();//remove employee from table
                //if this is an existing employee in the db
                if(selectedEmployee._id){
                    deletedEmployeeIDs.push(selectedEmployee._id);
                }
                employeeListData = employeeListData.filter(item => item.no !== selectedEmployee.no);//remove employee from array
                
                let id = 1;
                for (var i = 0; i < employeeListTableBody.rows.length; i++) {
                    var row = employeeListTableBody.rows[i];
                    row.cells[0].innerHTML = id; // Assuming the ID is in the first cell
                }

                console.log(employeeListData)
                console.log(deletedEmployeeIDs)

            } else {
                console.log('Employee not found in the array on create employee');
            }
        })
        //add a delete button if edit button clicked, display the form
    }
    //=========================UPDATE EMPLOYEE==============================//
    function updateEmployee(temp_employee){
        let selectedEmployee = employeeListData.find(employee => String(employee.no) ===  temp_employee.no);
        if (selectedEmployee) {
            //if employee exists in db
            if(selectedEmployee._id != null){
                selectedEmployee.employee = temp_employee.firstName + ' ' + temp_employee.middleName + ' ' + temp_employee.lastName + ' ' + temp_employee.suffix;
            }
             selectedEmployee.firstName = temp_employee.firstName;
             selectedEmployee.middleName = temp_employee.middleName;
             selectedEmployee.lastName = temp_employee.lastName
             selectedEmployee.suffix = temp_employee.suffix
             selectedEmployee.position = temp_employee.position
             selectedEmployee.deployment = temp_employee.deploymentHrs
             selectedEmployee.rate = temp_employee.rate
             selectedEmployee.totalRate = temp_employee.totalRate
             // Get the employee table
             const employeeListTable = document.getElementById('employee-table');
    
             // Get the table body
             const employeeListTableBody = employeeListTable.querySelector('tbody');
             const empRow = employeeListTableBody.querySelector('.employeeRow_'+selectedEmployee.no); // Get employee's respective row
             empRow.cells[1].textContent = temp_employee.firstName + ' ' + temp_employee.middleName + ' ' + temp_employee.lastName + ' ' + temp_employee.suffix;
             empRow.cells[2].textContent = temp_employee.position;
             empRow.cells[3].textContent = temp_employee.deploymentHrs;
             empRow.cells[4].textContent = temp_employee.rate;
             empRow.cells[5].textContent = temp_employee.totalRate;
             document.getElementById('enter-employee-btn').dataset.index = 0;
             
        } else {
            console.log('Employee not found in the array on update employee');
        }
    }

    //the x button of the employee form, it resets the form
    document.getElementById('x').addEventListener('click', function(event){
        document.getElementById('employee-form').reset();
        document.getElementById('enter-employee-btn').dataset.index = 0;
    })

    document.getElementById('btw-delete-tracker').addEventListener('click', async function(event) {
        await deleteTracker();
    })

    document.getElementById('btn-update-tracker').addEventListener('click', function(event) {
        event.preventDefault();

        const projectName =  document.getElementById('new-project-name').value.toUpperCase();
        const projectDesc =  document.getElementById('new-project-desc').value
        const projectLocation = document.getElementById('new-project-location').value.toUpperCase();
        const projectStatus = document.getElementById('new-project-status').value.toUpperCase();
        const projectStartDate = document.getElementById('new-project-start-date').value
        const projectEndDate = document.getElementById('new-project-end-date').value
        const employeeError = document.getElementById("employee-list-message")
        
        const empList =  employeeListData;
        const deleteList = deletedEmployeeIDs;

        console.log('Delete List')
        console.log(deleteList)

        // Define an object to map field IDs to error message IDs
        const fieldErrorMap = {
            'new-project-name': 'project-name-message',
            'new-project-desc': 'project-desc-message',
            'new-project-location': 'project-location-message',
            'new-project-start-date': 'project-start-date-message',
            'new-project-status': 'project-status-message',
            'new-project-end-date': 'project-end-date-message'
        };
        // to remove error message when a valid project entry occurs
        for (const [field, errorMessage] of Object.entries(fieldErrorMap)) {
                $(`#${errorMessage}`).css('display', 'none');
        }
        // Iterate through each field and check if it's empty
        let hasErrors = false;
        for (const [field, errorMessage] of Object.entries(fieldErrorMap)) {
            const value = $(`#${field}`).val();
            if (value === '') {
                $(`#${errorMessage}`).html('Please fill out this field.').css('display', 'block');
                hasErrors = true;
            }else if (value === null){
                $(`#${errorMessage}`).html('Please select either ON-GOING or COMPLETED').css('display', 'block');
                hasErrors = true;
            } else if (value === 'ON-GOING'){
                break;
            } else {
                $(`#${errorMessage}`).css('display', 'none');
            }
        }
        
        if (empList.length === 0){
            employeeError.textContent = 'Add at least 1 employee for the project';
            employeeError.style.display = 'block';
            hasErrors = true;
        } else {
            employeeError.textContent = '';
            employeeError.style.display = 'none';
            hasErrors = false;
        }

        // Check if there are errors before making the fetch request
        if (hasErrors) {
            return;
        }
       
        const data = JSON.stringify({
            new_project_name: projectName,
            new_project_descr: projectDesc,
            new_project_location: projectLocation,
            new_project_status :projectStatus,
            new_project_start_date:projectStartDate,
            new_project_end_date:projectEndDate,
            new_project_total_employees: empList.length,
            new_project_total_deployment: empList.reduce((total, current) => total + current['deploymentHrs'], 0),
            new_project_total_rate: empList.reduce((total, current) => total + current['totalRate'], 0),
            employeeListData: empList,
            deleteEmployeeList: deleteList
        })
        // Send AJAX request to server
        fetch('/edit-project-tracker', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // body: JSON.stringify(employeeListData)
            body: data
        }).then(response => {
            if (response.ok) {
                return response.json(); 
            } else {
                throw new Error('Failed to create tracker');
            }
        })
        .then(data => {
            if (data.redirect) {
                window.location.href = data.redirect; // Redirect if the server sends a redirect URL
            } else {
                // Handle other data from the server if needed
            }
        })
    });
})

