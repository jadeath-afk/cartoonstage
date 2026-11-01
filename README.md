# CartoonStage
A small, free, open-source Android-friendly PWA prototype for creating an audio-reactive cartoon singing preview.

## Run it
Serve this folder from any HTTPS static host or local development server. Open the URL in Chrome on Android, then use Chrome's menu > Add to Home screen / Install app.

For local testing on a computer: `python -m http.server 8000` and visit `http://localhost:8000`.

## Current features
- Preloaded cartoon portrait, replaceable with another image.
- Audio file import and playback.
- Audio-volume-driven mouth opening, timed blinking and subtle bobbing.
- Real-time canvas recording with audio where supported by the browser.
- Offline cache after first successful load.

## Honest limitations
This is a prototype, not yet a phoneme/word-level lip-sync system. It does not yet animate arms, hands, piano keys, or a full 3D body. The mouth overlay is a simple visual effect tuned to the included portrait. Export is real-time and browser support varies; Chrome on Android commonly records WebM, not MP4.

## License
Source code: MIT. The included generated character artwork is provided for this project; do not assume it has the same license as the code.
