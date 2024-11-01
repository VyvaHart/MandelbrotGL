import { renderMandelbrot } from '../main.js'

document.getElementById("fullscreen-button").addEventListener("click", function () {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
});

// Add event listener to the screenshot button
document.getElementById("screenshot-button").addEventListener("click", () => {
    renderMandelbrot();
    const canvas = document.getElementById("canvas");
    canvas.toBlob((blob) => {
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "mandelbrot_screenshot.png";
      downloadLink.click();
    });

    const flashOverlay = document.getElementById("screenshot-flash");

    // Set opacity to 1 to make the flash visible
    flashOverlay.style.opacity = '1';

    // Start fading out after a short delay (to simulate a quick flash)
    setTimeout(() => {
        flashOverlay.style.opacity = '0';
    }, 100); // Flash appears for 100ms

    // Remove flash effect completely after transition duration (300ms)
    setTimeout(() => {
        flashOverlay.style.opacity = '0'; // Reset opacity
    }, 400); // Wait for the transition to complete (300ms after the start)
  });

document.getElementById("no-action-button").addEventListener("click", () => {
  window.open("https://github.com/VyvaHart/MandelbrotGL", "_blank");
});