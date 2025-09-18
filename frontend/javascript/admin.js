document.getElementById("admin-login-form").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    // Hardcoded admin credentials (for demo)
    if(email === "admin@example.com" && password === "Admin@123"){
        sessionStorage.setItem("adminLoggedIn", "true");
        window.location.href = "Html/admin-panel.html";
    } else {
        document.getElementById("login-msg").textContent = "Invalid credentials!";
        document.getElementById("login-msg").style.color = "red";
    }
});
