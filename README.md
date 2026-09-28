# KidiuVision

> **Visual intelligence, built for the browser.**

KidiuVision is a browser-based image analysis workbench designed as a focused computer-vision playground: load an image, inspect its visual signal, transform it, and export the result without sending the image to a remote service.

## What it does

- Drag-and-drop image input
- Resolution, file-size, aspect-ratio and format inspection
- Average luminance measurement
- Sampled RGB / dominant-colour estimation
- Luminance histogram visualization
- Brightness and contrast controls
- Grayscale, invert and edge-detection transforms
- Zoomed viewport inspection
- PNG export
- Responsive interface for desktop and mobile
- Local-first processing with no backend or account required

## Architecture

KidiuVision is intentionally lightweight.

- **index.html** — product shell and metadata
- **style.css** — visual system and responsive layout
- **app.js** — image loading, Canvas rendering, pixel sampling, measurements and transforms
- **favicon.svg** — project mark

The application uses the browser's **Canvas 2D API** for pixel-level computation. Images are read into the current browser session and are not uploaded by the application.

## Run locally

No package installation is required.

```bash
git clone https://github.com/Kishordiu/Kidiuvision.git
cd Kidiuvision
python -m http.server 8000
```

Open `http://localhost:8000`.

## Privacy model

The project is **local-first by design**. Image inspection happens in the browser. There is no application backend and no image-upload API in this implementation.

## Roadmap

The current foundation can evolve toward object detection adapters, OCR, image similarity, camera capture, model-backed inference, saved analysis sessions and accessibility tooling.

Those capabilities should be introduced behind explicit adapters so the current no-backend workflow remains functional.

## Project status

**Major project · Functional MVP**

Built and maintained by **K. Kishor Kumar**.

[GitHub @Kishordiu](https://github.com/Kishordiu)
