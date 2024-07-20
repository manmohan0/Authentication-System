window.onload = function load(){
    var password = document.getElementById("Password");
    var confirm_Password = document.getElementById("confirm_Password");
    var passmatch = document.getElementById("passmatch");
    
    password.onchange = function() {checkPass()}
    confirm_Password.onchange = function() {checkPass()}

    function checkPass(){
        
        if (password.value != confirm_Password.value){
            
            passmatch.innerHTML = "Password doesn't match";
            passmatch.style.color = "red";
            document.getElementById("submit").disabled = true;

        } else {

            passmatch.innerHTML = "";
            document.getElementById("submit").disabled = false;
        
        }
    }
}