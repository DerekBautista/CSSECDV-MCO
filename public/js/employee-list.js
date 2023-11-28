
async function getEmployeeData() {
    try {
        const response = await fetch("/employee-list/get-list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if(response.status == 200){
            console.log("Get Employee list success");
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

function initializeEmployeeListTable(empList) {
    /*cant do this yet because there are null values
    empList.sort(function(a,b){
        return a.name.localeCompare(b.name);
    });*/
    
    const dataTable = document.querySelector('#employee-list-table');
    const tbody = dataTable.querySelector('#employee-list-tbody');
    var id = 0
    empList.forEach(employee => {
        const row = tbody.insertRow();

        row.insertCell().textContent = id;
        row.insertCell().textContent = employee.employee;
        row.insertCell().textContent = employee.project;
        row.insertCell().textContent = employee.position;
        row.insertCell().textContent = employee.deploymentHrs;
        row.insertCell().textContent = employee.rate;
        row.insertCell().textContent = employee.totalRate;

        id += 1;
    });
    
}

document.addEventListener('DOMContentLoaded', async function (e) {
    e.preventDefault();
    // Call the function to get employee data
    const empList = await getEmployeeData();
    initializeEmployeeListTable(empList);
});