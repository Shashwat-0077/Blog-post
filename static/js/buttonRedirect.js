let buttons = document.querySelectorAll(".sort-button");
let url = new URL(window.location.href);

buttons.forEach((button) => {
    button.addEventListener("click", function (event) {
        if (
            url.searchParams.get("sort") ||
            url.searchParams.get("sort") === ""
        ) {
            url.searchParams.set("sort", this.dataset.sort);
        } else {
            url.searchParams.append("sort", this.dataset.sort);
        }

        location.href = url.href;
    });
});

let searchButton = document.querySelector("#search-button");

searchButton.addEventListener("click", function (event) {
    event.preventDefault();

    let searchField = document.querySelector("#search-field");

    if (
        url.searchParams.get("search") ||
        url.searchParams.get("search") === ""
    ) {
        url.searchParams.set("search", searchField.value);
    } else {
        url.searchParams.append("search", searchField.value);
    }

    location.href = url.href;
});
