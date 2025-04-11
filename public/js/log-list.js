/* Sample log Data */

async function getLogData() {
    try {
        const response = await fetch("/log-list/get-list", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        
        if(response.status == 200){
            console.log("Get log list success");
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

function initializeLogListTable(loglist) {

    const dataTable = document.querySelector('#log-list-table');
    const tbody = dataTable.querySelector('tbody');
    var id = 1
    loglist.forEach(log => {
        const row = tbody.insertRow();

       // row.insertCell().textContent = log.id;
        row.insertCell().textContent = id;
        row.insertCell().textContent = log.username ?? log.ip;
        row.insertCell().textContent = log.userType ?? "";
        row.insertCell().textContent = log.logType;
        row.insertCell().textContent = log.detectedAt;
        id += 1;
    });
}


function deleteRows(){
    const dataTable = document.querySelector('#log-list-table');
    const tbody = dataTable.querySelector('tbody');
    var rowCount = tbody.rows.length;
    for (var i = rowCount-1; i >= 0; i--) {
        tbody.deleteRow(i);
    }
}

function searchLog(logList, logName){
    let log  = logList.find(obj => 
        (obj.firstName && obj.firstName.includes(logName)) ||
        (obj.middleName && obj.middleName.includes(logName)) ||
        (obj.lastName && obj.lastName.includes(logName)) ||
        (obj.suffix && obj.suffix.includes(logName))
    );
    if(log){
        return true;
    }
    return false;
}

document.addEventListener('DOMContentLoaded', async function (e) {
    e.preventDefault();
    // Call the function to get log 
    const loglist = await getLogData();
    initializeLogListTable(loglist);

    document.getElementById('search-form').addEventListener('submit', async function(e) {
        e.preventDefault();
   
        logNameInput = document.getElementById('search-log-input').value.toUpperCase();

        if(logNameInput == ""){
           return false;
        }
        let logExists = searchLog(loglist, logNameInput)

        if(logExists){
          let filteredList = loglist.filter(obj => obj['name'] && obj['name'].includes(logNameInput));
          deleteRows()  
          initializeLogListTable(filteredList)

          if(document.getElementById('reset-search-btn') == null){
            //set up reset button
           var clearButtonPlaceholder = document.getElementById("reset-button-placeholder");
           clearButtonPlaceholder.innerHTML += '<button type="reset" class="btn btn-danger d-flex justify-content-center mx-3" id="reset-search-btn"><i class="fa fa-solid fa-circle-xmark"></i>Clear Results</button>'
           //<button type="reset" class="btn btn-danger d-flex justify-content-center mx-3" id="reset-search-btn" disabled><i class="fa fa-solid fa-circle-xmark"></i>Clear Results</button>
           let resetBtn = document.getElementById('reset-search-btn')
           resetBtn.addEventListener('click', function(){
               deleteRows();
               initializeLogListTable(loglist);
               clearButtonPlaceholder.innerHTML = '';
           })
         }
          return true;
        }
        else{
           console.log("No log found")
           return false;
        }
    })
});



