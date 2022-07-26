//resizing the iframe object with this function <------------------- USEFUL!!!!!
function resizeIframe(obj) {
    obj.style.height =
        obj.contentWindow.document.documentElement.scrollHeight + "px";
}
