/* Sample Project Data */

async function getProjectData() {
    try {
        const response = await fetch("/project-list/get-list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if(response.status == 200){
            console.log("Get Project list success");
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


async function searchProject(projectName){
    // Send AJAX request to server
    try{
        fetch('/project-list/searchProject/'+projectName, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
            }
        })

        if(response.status == 200){
            console.log("Get Project list success");
            return true
        }else{
            console.error(`Project not found ${response.status}`);
            return false;
        }

    } catch (error) {
        console.error(error);
        return false;
    }
}

function initializeProjectListTable(projlist) {
    /*cant do this yet because there are null values
    projlist.sort(function(a,b){
        return a.name.localeCompare(b.name);
    });*/
    const dataTable = document.querySelector('#project-list-table');
    const tbody = dataTable.querySelector('tbody');
    var id = 1
    projlist.forEach(project => {
        const row = tbody.insertRow();

       // row.insertCell().textContent = project.id;
        row.insertCell().textContent = id;

        // Create and attach an anchor tag with _id of project name
        const projectNameCell = row.insertCell();
        const projectNameLink = document.createElement('a');
        projectNameLink.textContent = project.name;
        projectNameLink.href = `/template-project-tracker/${project._id}`; // Set the href attribute to the desired link destination
        projectNameCell.appendChild(projectNameLink); // Append the anchor tag to the cell

        row.insertCell().textContent = project.location
        row.insertCell().textContent = project.description;
        row.insertCell().textContent = project.totalEmployees;
        row.insertCell().textContent = project.totalDeployment;
        row.insertCell().textContent = project.status;
        row.insertCell().textContent = project.startDate.split('T')[0];
        row.insertCell().textContent = project.dueDate?.split('T')[0] || '';
        row.insertCell().innerHTML = '<button  data-index="' + employee.no + '"class="btn btn-danger btn-sm btn-delete-employee" id="btn-delete-employee' + employee.no + '">Remove</button>';

        


        id += 1;
    });
}


function deleteRows(){
    const dataTable = document.querySelector('#project-list-table');
    const tbody = dataTable.querySelector('tbody');
    var rowCount = tbody.rows.length;
    for (var i = rowCount-1; i >= 0; i--) {
        tbody.deleteRow(i);
    }
}

function searchProject(projList, projectName){
    let project  = projList.find(obj => obj['name']  && obj['name'].includes(projectName));
    if(project){
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async function (e) {
    e.preventDefault();
    // Call the function to get project 
    const projlist = await getProjectData();
    initializeProjectListTable(projlist);

    document.getElementById('search-form').addEventListener('submit', async function(e) {
        e.preventDefault();
   
        projectNameInput = document.getElementById('search-project-input').value.toUpperCase();

        if(projectNameInput == ""){
           return false;
        }
        let projectExists = searchProject(projlist, projectNameInput)

        if(projectExists){
          let filteredList = projlist.filter(obj => obj['name'] && obj['name'].includes(projectNameInput));
          deleteRows()  
          initializeProjectListTable(filteredList)

          if(document.getElementById('reset-search-btn') == null){
            //set up reset button
           var clearButtonPlaceholder = document.getElementById("reset-button-placeholder");
           clearButtonPlaceholder.innerHTML += '<button type="reset" class="btn btn-danger d-flex justify-content-center mx-3" id="reset-search-btn"><i class="fa fa-solid fa-circle-xmark"></i>Clear Results</button>'
           //<button type="reset" class="btn btn-danger d-flex justify-content-center mx-3" id="reset-search-btn" disabled><i class="fa fa-solid fa-circle-xmark"></i>Clear Results</button>
           let resetBtn = document.getElementById('reset-search-btn')
           resetBtn.addEventListener('click', function(){
               deleteRows();
               initializeProjectListTable(projlist);
               clearButtonPlaceholder.innerHTML = '';
           })
         }
          return true;
        }
        else{
           console.log("No project found")
           return false;
        }
    })
});



