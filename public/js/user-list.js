/* Sample user Data */

async function getUserData() {
    try {
        const response = await fetch("/user-list/get-list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if(response.status == 200){
            console.log("Get user list success");
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

function initializeUserListTable(userlist) {

    const dataTable = document.querySelector('#user-list-table');
    const tbody = dataTable.querySelector('tbody');
    var id = 1
    userlist.forEach(user => {
        const row = tbody.insertRow();

       // row.insertCell().textContent = user.id;
        row.insertCell().textContent = id;
        row.insertCell().textContent = `${user.firstName} ${user.middleName} ${user.lastName} ${user.suffix}`
        row.insertCell().textContent = user.companyID;
        row.insertCell().textContent = "ADMIN";
        row.insertCell().textContent = "No";
        row.insertCell().textContent = "   ";
        row.insertCell().innerHTML = '<button  data-index="' + user.no + '"class="btn btn-danger btn-sm btn-delete-employee" id="btn-delete-employee' + user.no + '">Remove</button>';

        id += 1;
    });
}


function deleteRows(){
    const dataTable = document.querySelector('#user-list-table');
    const tbody = dataTable.querySelector('tbody');
    var rowCount = tbody.rows.length;
    for (var i = rowCount-1; i >= 0; i--) {
        tbody.deleteRow(i);
    }
}

function searchUser(userList, userName){
    let user  = userList.find(obj => 
        (obj.firstName && obj.firstName.includes(userName)) ||
        (obj.middleName && obj.middleName.includes(userName)) ||
        (obj.lastName && obj.lastName.includes(userName)) ||
        (obj.suffix && obj.suffix.includes(userName))
    );
    if(user){
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async function (e) {
    e.preventDefault();
    // Call the function to get user 
    const userlist = await getUserData();
    initializeUserListTable(userlist);

    document.getElementById('search-form').addEventListener('submit', async function(e) {
        e.preventDefault();
   
        userNameInput = document.getElementById('search-user-input').value.toUpperCase();

        if(userNameInput == ""){
           return false;
        }
        let userExists = searchUser(userlist, userNameInput)

        if(userExists){
          let filteredList = userlist.filter(obj => obj['name'] && obj['name'].includes(userNameInput));
          deleteRows()  
          initializeUserListTable(filteredList)

          if(document.getElementById('reset-search-btn') == null){
            //set up reset button
           var clearButtonPlaceholder = document.getElementById("reset-button-placeholder");
           clearButtonPlaceholder.innerHTML += '<button type="reset" class="btn btn-danger d-flex justify-content-center mx-3" id="reset-search-btn"><i class="fa fa-solid fa-circle-xmark"></i>Clear Results</button>'
           //<button type="reset" class="btn btn-danger d-flex justify-content-center mx-3" id="reset-search-btn" disabled><i class="fa fa-solid fa-circle-xmark"></i>Clear Results</button>
           let resetBtn = document.getElementById('reset-search-btn')
           resetBtn.addEventListener('click', function(){
               deleteRows();
               initializeUserListTable(userlist);
               clearButtonPlaceholder.innerHTML = '';
           })
         }
          return true;
        }
        else{
           console.log("No user found")
           return false;
        }
    })
});



