// Garante que só um preview de áudio toque por vez no catálogo/home.
// Quando um player começa a tocar, ele "registra" aqui; se outro player
// já estava tocando, ele é pausado automaticamente.

let current: { audio: HTMLAudioElement; stop: () => void } | null = null;

export function registerPlayingAudio(audio: HTMLAudioElement, stop: () => void) {
  if (current && current.audio !== audio) {
    current.stop();
  }
  current = { audio, stop };
}

export function unregisterPlayingAudio(audio: HTMLAudioElement) {
  if (current?.audio === audio) {
    current = null;
  }
}
