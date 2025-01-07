# Mandelbrot Explorer

Mandelbrot Explorer is a real-time, interactive visualization tool for exploring the **Mandelbrot** and **Julia** fractal sets. Using WebGL2 and custom shaders, this project offers smooth navigation and provides various color themes, zoom levels, and real-time Julia set previews based on mouse position.

<table>
  <tr>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description4.png" width="100%"></td>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description5.png" width="100%"></td>
  </tr>
</table>

## About Fractals and the Mandelbrot Set

Fractals are a set of infinitely complex patterns that show self-similarity at varied scales. The so-called Mandelbrot set, one of the most famous fractals, is obtained by iterating a simple mathematical function and checking for divergence in values. This project will visualize these patterns in real time and allow users to zoom into infinite detail, showing how the patterns change with position within the fractal.

## Features

- **Real-Time Fractal Navigation**: Zoom and pan smoothly across the Mandelbrot set.
- **Julia Set Preview**: Displays a Julia set that dynamically updates based on the current position in the Mandelbrot set.
- **Customizable Themes and Parameters**:
  - **Color Themes**: Choose from various color schemes to customize the fractal view.
  - **Max Iterations**: Control the detail level by adjusting iteration depth.
  - **Color Compression**: Fine-tune color gradation for enhanced visuals.
<table>
  <tr>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description3.png" width="100%"></td>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description6.png" width="100%"></td>
  </tr>
</table>

~~**Mac Retina Display:** Coordinate handling may be inaccurate on Mac devices with Retina displays due to differences in `window.devicePixelRatio` implementation. wip...~~ 

**Fixed** ☑️

## Basic Controls

- **Mouse Scroll or Q/E**: Zoom in/out.
- **Left-click + Drag**: Pan across the Mandelbrot set.
- **Ctrl + Left-click**: Center the view on a specific point.
- **Color Map**: Switch between color themes.
- **Julia Set**: View a Julia set based on the current Mandelbrot position.

<table>
  <tr>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description2.gif" width="100%"></td>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description1.gif" width="100%"></td>
    <td align="center"><img src="https://github.com/VyvaHart/MandelbrotGL/blob/main/assets/description7.gif" width="100%"></td>
  </tr>
</table>

### Prerequisites

- A standard web browser with WebGL2 support (e.g., Chrome, Safari).
- To view the application locally, you can use:
  - **GitHub Pages**: Access the application directly through this repository’s GitHub Pages link.
  - **http-server**: Run a local development server with Node.js.
  - **Live Server** in Visual Studio Code.

## License

This project is open-source and available under the MIT License

