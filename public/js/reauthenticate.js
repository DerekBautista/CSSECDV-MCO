async function setLockoutTimer(lockedUntil){
    let secondsRemaining = Math.max(0, Math.floor((new Date(lockedUntil) - new Date()) / 1000));

    const errorMessage = $("#verify-error-message");
    const updateMessage = () => {
        errorMessage.html(`No more attempts. User is locked out. Try again in ${secondsRemaining} seconds`).css('display', 'block');
    };
    
    updateMessage(); 
    $('#verify-submit-btn').prop('disabled', true);
    
    const countdownInterval = setInterval(async () => {
        secondsRemaining--;
    
        if (secondsRemaining <= 0) {
            clearInterval(countdownInterval);
            $(`#verify-error-message`).css('display', 'none')
            $('#verify-submit-btn').prop('disabled', false);
            const userPromise = await fetch(`/reauthenticate/checkUserLockout`,{
                method: 'GET'
            });
        } else {
            updateMessage(); // update every second
        }
    }, 1000);
}

$(document).ready(async function() {
    try{
        const userPromise = await fetch(`/reauthenticate/checkUserLockout`,{
            method: 'GET'
        });
        
        const response = await userPromise.json();
        const userIsLockedout = response.isLocked;
        console.log("User is locked?: " + userIsLockedout)
        if(userIsLockedout){
            const lockedUntil = new Date(response.lockedUntil)
            const now = new Date();
            const secondsRemaining = Math.max(0, Math.floor((lockedUntil - now) / 1000));
            setLockoutTimer(lockedUntil)
        }
        else{
            $('#verify-submit-btn').prop('disabled', false);
            $(`#verify-error-message`).css('display', 'none')
        }
    }catch (error) {
        console.error("Error checking User lockout:", error);
    }
});

$("#verify-submit-btn").on('click', async function (event){
    event.preventDefault();

    //For race condition. If the user waited for the lockout timer turn to 0, this is just a way to ensure synchronization.
    await fetch(`/reauthenticate/checkUserLockout`,{
        method: 'GET'
    });

    const password = $('#verify-password').val()

    try{
        const passwordResponse = await fetch(`/reauthenticate/isPassword?password=${password}`, {
            method: 'GET'
        })

        const passwordData = await passwordResponse.json();
        if(!passwordData.authenticated){
            if(passwordData.remainingAttempts > 0)
                $("#verify-error-message").html('Failed Login. (' + passwordData.remainingAttempts + ' attempts remaining.)').css('display', 'block');
            else{
                const lockedUntil = new Date(passwordData.lockedUntil);
                setLockoutTimer(lockedUntil)
            }
        }
        else{
            $("#verify-form").submit();
        }
    }catch (err) {
        console.log("Network error (e.g., server down):", err);
    }
})