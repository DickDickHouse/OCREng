// Assuming this is a portion of the main.js file:

const DICE_IDLE_IMAGE = "images/dice-blank.svg";

// Other content of the file remains intact
// Functionality of the existing code

function updateImagePaths() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.src.startsWith("/OCREng/images/")) {
            img.src = img.src.replace("/OCREng/images/", "images/");
        }
    });
}

updateImagePaths();