let topButton = document.querySelector(".top");
let footer = document.querySelector(".footer");

let observer = new IntersectionObserver(
    (entries) => {
        if (!topButton) return;
        if (entries[0].isIntersecting) {
            topButton.classList.add("stop");
        } else {
            topButton.classList.remove("stop");
        }
    },
    {
        threshold: 0.3,
    }
);

observer.observe(footer);
