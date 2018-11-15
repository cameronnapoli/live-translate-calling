# live-translate-calling

Using Google Cloud APIs, live translate audio into either subtitles or translated audio.

# UI

User interface built with React. Connects to server, emits buffered audio packets, and receives translated and original annotations.

[UI Documentation](ui/client_app/README.md)

# Server

Server written in Node.js. Collects, audio fragments, translates them, and upon a response from Google cloud, responds with text from audio and translated text.

[Server Documentation](server/speech_processing/README.md)
