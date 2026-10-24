<div align="center">
  <img src="./assets/hero.png" alt="Kidiuvision — optical image-inspection artwork" width="100%" />
</div>

<p align="center">
  <a href="https://diufoundry.online"><img alt="DIU Foundry" src="https://img.shields.io/badge/DIU_FOUNDRY-VISION_LAB-1C102E?style=for-the-badge&logoColor=67E8F9&labelColor=040308" /></a>
  <img alt="Image analysis" src="https://img.shields.io/badge/IMAGE_ANALYSIS-RGB_&_LUMINANCE-F43F5E?style=for-the-badge&labelColor=040308" />
  <img alt="Engine" src="https://img.shields.io/badge/ENGINE-HTML_CANVAS-F59E0B?style=for-the-badge&labelColor=040308" />
</p>

# Kidiuvision

**See the image. Understand the signal.**

Kidiuvision is a lightweight browser-based image inspection workbench by DIU Foundry. It loads a selected image into an HTML canvas and derives useful properties such as dimensions, aspect ratio, luminance estimates, sampled RGB values, and channel distributions. Image operations run locally in the browser; no backend service is required for the core inspection workflow.

## What the workbench does

- **Inspect image properties:** resolution, dimensions, aspect ratio, size, and file format.
- **Explore image signal:** luminance estimate, sampled colour values, and RGB channel histograms.
- **Try visual transforms:** image adjustments and basic filter effects.
- **Keep the file in the browser:** the selected image is processed using browser APIs rather than uploaded to a project backend.

## Canvas processing path

```text
Choose / drop an image
        │
        ▼
Browser image decoder
        │
        ▼
HTMLCanvasElement + 2D context
        │
        ├──► pixel sampling and luminance estimate
        ├──► RGB channel histogram
        └──► visual transforms and export
```

## Stack

Vanilla JavaScript · HTML · CSS · HTML Canvas APIs

No package installation or build step is needed.

## Run locally

Clone the repository, then serve the directory with a static server:

```bash
git clone https://github.com/Kishordiu/Kidiuvision.git
cd Kidiuvision
python3 -m http.server 8080
```

Open [http://localhost:8080](http://localhost:8080) and drop an image into the inspection area.

## Scope and limits

The displayed values are image-analysis aids, not a forensic verdict. The app does not establish an image's origin, certify authenticity, or determine manipulation with forensic certainty. Processing time and sampling precision depend on the image and browser/device.

---

<p align="center"><sub>DIU FOUNDRY · VISUAL INTELLIGENCE / PRODUCT CRAFT</sub></p>
