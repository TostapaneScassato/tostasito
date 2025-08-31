document.addEventListener("DOMContentLoaded", () => {

    // dichiarazione dei pulsanti
    const homeButton = document.getElementById("homeButton");
    const settingsButton = document.getElementById("settingsButton");
    const schoolButton = document.getElementById("schoolButton");
    
    //dove portano i movitori
    homeButton.addEventListener("click", () => {
        window.location.href="./homePage.html";
    })
    settingsButton.addEventListener("click", () => {
        window.location.href="./workInProgress.html";
    })
    schoolButton.addEventListener("click", () => {
        window.location.href="./schoolManager.html"
    })
})