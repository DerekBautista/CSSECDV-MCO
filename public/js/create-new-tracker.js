/* New Tracker */
/*
    This allows the user to add a new employee using the answered form
    and add it to the table when creating a new tracker. 
    This also allows the user to edit the employee data in the table.
    This also allows the user to delete the employee data in the table.
    Simply, this temporarily stores the employee data in the table.
*/

// Path: src/js/employee.js



// Function that checks whenever the user clicks and interchanges the project status
// every time the user choose ON-GOING, the new-project-end-date will be disabled
// every time the user choose COMPLETED, the new-project-end-date will be enabled

document.getElementById('new-project-status').addEventListener('change', function(event) {
    event.preventDefault();

    const projectStatus = document.getElementById('new-project-status').value;

    if (projectStatus === 'ON-GOING') {
        document.getElementById('new-project-end-date').setAttribute('disabled', true);
        document.getElementById('new-project-end-date').removeAttribute('required');
    } else if (projectStatus === 'COMPLETED') {
        document.getElementById('new-project-end-date').removeAttribute('disabled');
        document.getElementById('new-project-end-date').setAttribute('required', true);
    }
});

// Function to limit the new-project-end-date must be after the new-project-start-date but not the current date
document.getElementById('new-project-start-date').addEventListener('change', function(event) {
    event.preventDefault();
    
    const startDate = document.getElementById('new-project-start-date').value;

    document.getElementById('new-project-end-date').setAttribute('min', startDate);

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    const currentDateFormatted = `${currentYear}-${currentMonth}-${currentDay}`;

    document.getElementById('new-project-end-date').setAttribute('max', currentDateFormatted);
});

document.addEventListener('DOMContentLoaded',  function (e) {
    e.preventDefault();
    let employeeListData = [];
    let editEmployee = [];
    let counter = 1;
    // Global variable to store the employee data


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
                firstName : employeeFirstName,
                middleName : employeeMiddleName,
                lastName :employeeLastName,
                suffix : employeeSuffix,
                position : employeePosition,
                deployment : employeeDeployment,
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
                firstName : employeeFirstName,
                middleName : employeeMiddleName,
                lastName :employeeLastName,
                suffix : employeeSuffix,
                position : employeePosition,
                deployment : employeeDeployment,
                rate : employeeRate,
                totalRate : employeeTotalRate
            }
           createNewEmployee(temp_employee);
        }
       
        // Log to the console the employee data
        console.log(employeeListData);
    
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
        row.setAttribute('class', 'employeeRow_'+counter);
        counter += 1;
        row.insertCell().textContent = employeeListData.length;
        row.insertCell().textContent = temp_employee.firstName + ' ' + temp_employee.middleName + ' ' + temp_employee.lastName + ' ' + temp_employee.suffix;
        row.insertCell().textContent = temp_employee.position;
        row.insertCell().textContent = temp_employee.deployment;
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
                document.getElementById('employeeDeployment').value = selectedEmployee.deployment;
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

                employeeListData = employeeListData.filter(item => item.no !== selectedEmployee.no);//remove employee from array
                
                let id = 1;
                for (var i = 0; i < employeeListTableBody.rows.length; i++) {
                    var row = employeeListTableBody.rows[i];
                    row.cells[0].innerHTML = id;
                    id += 1
                }

                console.log(employeeListData)

            } else {
                console.log('Employee not found in the array on create employee');
            }
        })
        //add a delete button if edit button clicked, display the form
        
        editEmployee.push(editBtn)
    }
    //=========================UPDATE EMPLOYEE==============================//
    function updateEmployee(temp_employee){
        let selectedEmployee = employeeListData.find(employee => String(employee.no) ===  temp_employee.no);
        if (selectedEmployee) {
             selectedEmployee.firstName = temp_employee.firstName;
             selectedEmployee.middleName = temp_employee.middleName;
             selectedEmployee.lastName = temp_employee.lastName
             selectedEmployee.suffix = temp_employee.suffix
             selectedEmployee.position = temp_employee.position
             selectedEmployee.deployment = temp_employee.deployment
             selectedEmployee.rate = temp_employee.rate
             selectedEmployee.totalRate = temp_employee.totalRate
             // Get the employee table
             const employeeListTable = document.getElementById('employee-table');
    
             // Get the table body
             const employeeListTableBody = employeeListTable.querySelector('tbody');
             const empRow = employeeListTableBody.querySelector('.employeeRow_'+selectedEmployee.no); // Get employee's respective row
             console.log(empRow[0])
             empRow.cells[1].textContent = temp_employee.firstName + ' ' + temp_employee.middleName + ' ' + temp_employee.lastName + ' ' + temp_employee.suffix;
             empRow.cells[2].textContent = temp_employee.position;
             empRow.cells[3].textContent = temp_employee.deployment;
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


    document.getElementById('btn-create-new-tracker').addEventListener('click', function(event) {
        event.preventDefault();

        const projectName =  document.getElementById('new-project-name').value.toUpperCase();
        const projectDesc =  document.getElementById('new-project-desc').value
        const projectLocation = document.getElementById('new-project-location').value.toUpperCase();
        const projectStatus = document.getElementById('new-project-status').value.toUpperCase();
        const projectStartDate = document.getElementById('new-project-start-date').value
        const projectEndDate = document.getElementById('new-project-end-date').value
        const employeeError = document.getElementById("employee-list-message")

        
        const empList =  employeeListData;
        
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
        const today = new Date();
        const twoYearsAgo = new Date(today.setFullYear(today.getFullYear() - 2));
        const oneYearAhead = new Date(today.setFullYear(today.getFullYear() + 10));
    
        for (const [field, errorMessage] of Object.entries(fieldErrorMap)) {
            const value = $(`#${field}`).val();
            
            if (field === 'new-project-end-date' && projectStatus === 'ON-GOING' && value === '') {
                // Skip validation for end date if project status is "ON-GOING"
                continue;
            }
    
            if (field !== 'new-project-end-date' && value === '') {
                // General validation for other fields
                $(`#${errorMessage}`).html('Please fill out this field.').css('display', 'block');
                hasErrors = true;
            } else if (field === 'new-project-start-date' && !projectStartDate) {
                $(`#${errorMessage}`).html('Please select a start date.').css('display', 'block');
                hasErrors = true;
            } else if (field === 'new-project-end-date' && projectStatus !== 'ON-GOING' && !projectEndDate) {
                // Special validation for end date if the project is not "ON-GOING"
                $(`#${errorMessage}`).html('Please select an end date.').css('display', 'block');
                hasErrors = true;
            } else if (field === 'new-project-start-date' && new Date(projectStartDate) < twoYearsAgo) {
                $(`#${errorMessage}`).html('Start date cannot be more than 2 years ago.').css('display', 'block');
                hasErrors = true;
            } else if (field === 'new-project-end-date' && projectEndDate && new Date(projectEndDate) > oneYearAhead) {
                $(`#${errorMessage}`).html('End date is too far in the future (10 years ahead).').css('display', 'block');
                hasErrors = true;
            } else if (field === 'new-project-end-date' && projectEndDate && new Date(projectEndDate) < new Date(projectStartDate)) {
                $(`#${errorMessage}`).html('End date cannot be earlier than start date.').css('display', 'block');
                hasErrors = true;
            } else {
                $(`#${errorMessage}`).css('display', 'none');
            }
        }
    
        if (projectName.length > 100) {
            $('#project-name-message').html('Project name cannot exceed 100 characters.').css('display', 'block');
            hasErrors = true;
        }
    
        if (projectDesc.length > 255) {
            $('#project-desc-message').html('Project description cannot exceed 255 characters.').css('display', 'block');
            hasErrors = true;
        }
    
        if (projectLocation.length > 100) {
            $('#project-location-message').html('Project location cannot exceed 100 characters.').css('display', 'block');
            hasErrors = true;
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
            action: 'create-new-tracker',
            new_project_name: projectName,
            new_project_descr: projectDesc,
            new_project_location: projectLocation,
            new_project_status :projectStatus,
            new_project_start_date:projectStartDate,
            new_project_end_date:projectEndDate,
            employeeListData: empList
        })
        // Send AJAX request to server
        fetch('/new-tracker', {
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

});