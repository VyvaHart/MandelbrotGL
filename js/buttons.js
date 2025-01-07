import { renderMandelbrot } from './rendering.js'

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

document.getElementById("info").addEventListener("click", function() {

  // Create the modal background
  const modalBackground = document.createElement("div");
  modalBackground.id = "info-modal-background";

  // Create the modal container
  const modal = document.createElement("div");
  modal.id = "info-modal";

  // Add project description
  modal.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 10px; max-width: 400px;">
        <h3 style="font-weight: bold; font-size: 1.2em;">Mandelbrot Set Explorer</h3>
        <p style="font-style: italic;">
            This WebGL-based fractal explorer is a dynamic web application that enables users to
            interact in real time with the Mandelbrot and Julia fractals. It combines a high-performance
            WebGL2 rendering pipeline with a responsive, touch- and pointer-friendly UI. Users can
            seamlessly zoom, pan, and manipulate the complex parameters to visualize intricate fractal
            structures, offering a visually rich experience on both desktop and mobile devices.
        </p>
        
        <h4 style="font-weight: bold; margin-top: 1em;">Features and User Interactions</h4>
        
        <ul style="margin-left: 20px;">
            <li><strong>Dual-Canvas Rendering</strong>: Two canvases display both the Mandelbrot and Julia sets.</li>
            <li><strong>Intuitive Controls</strong>: Includes zoom, pan, and touch gestures for mobile support.</li>
            <li><strong>Real-Time Julia Set Update</strong>: Interactive feedback with each cursor movement.</li>
            <li><strong>Smooth Transitions</strong>: Smooth zoom and pan for a better experience.</li>
            <li><strong>Responsive Design</strong>: Adapts to different screen sizes and resolutions.</li>
        </ul>
        
        <h4 style="font-weight: bold; margin-top: 1em;">Technical Details</h4>
        <ul style="margin-left: 20px;">
            <li><em>WebGL2 Rendering</em>: Leveraging shaders for efficient fractal rendering.</li>
            <li><em>Shader Uniforms</em>: Customizable fractal center, zoom, and color themes.</li>
            <li><em>Performance Optimizations</em>: Efficient memory usage and redraw strategies.</li>
        </ul>
        <button id="close-modal">Close</button>
    </div>
`;

  // Append modal container to modal background
  modalBackground.appendChild(modal);

  // Append modal background to the document body
  document.body.appendChild(modalBackground);

  // Close button action
  document.getElementById("close-modal").addEventListener("click", function() {
      document.body.removeChild(modalBackground);
  });
});

document.addEventListener("DOMContentLoaded", () => {
    const buttonContainer = document.querySelector(".top-left-container");
    const hideButton = document.getElementById("hide-button");

    // Hide the container and create the new "Show" button
    hideButton.addEventListener("click", () => {
        buttonContainer.style.transform = "translateX(-110%)"; // Move container off-screen
        buttonContainer.style.transition = "transform 0.3s ease"; // Smooth transition

        // Wait for the container to finish sliding out before creating the "Show" button
        setTimeout(() => {
            createShowButton();
        }, 500); // Match this delay with the transition duration
    });

    function createShowButton() {
        // Check if the button already exists
        if (document.getElementById("show-button")) return;

        const showButton = document.createElement("button");
        showButton.id = "show-button";
        showButton.style.position = "absolute";
        showButton.style.backgroundColor = "transparent";
        showButton.style.border = "none";
        showButton.style.top = "20px";
        showButton.style.left = "10px";
        showButton.style.zIndex = "110"; // Ensures it stays on top of other elements

        // Create the image element
        const buttonImage = document.createElement("img");
        buttonImage.src = "./assets/right_arrow.png";
        buttonImage.alt = "Show Button Image";
        buttonImage.style.width = "20px"; 
        buttonImage.style.height = "20px"; 

        // Append the image to the button
        showButton.appendChild(buttonImage);

        document.body.appendChild(showButton);

        // Show the container when the "Show" button is clicked
        showButton.addEventListener("click", () => {
            buttonContainer.style.transform = "translateX(0)"; // Move container back into view
            document.body.removeChild(showButton); // Remove the "Show" button
        });
    }
});