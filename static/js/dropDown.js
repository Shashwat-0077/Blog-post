document.addEventListener("click", (event) => {
    const isDropdown = event.target.matches(".drop-down-button");
    if (!isDropdown && event.target.closest(".drop-down") != null) return;

    let currentDropDown;

    if (isDropdown) {
        currentDropDown = event.target.closest(".drop-down");
        currentDropDown.classList.toggle("dropped");
    }

    document.querySelectorAll(".drop-down.dropped").forEach((element) => {
        if (element === currentDropDown) return;
        element.classList.remove("dropped");
    });
});
