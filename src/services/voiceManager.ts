// Web Speech & Audio management for Jarvis AI Assistant

interface IWindow extends Window {
  webkitSpeechRecognition?: any;
  SpeechRecognition?: any;
  webkitAudioContext?: typeof AudioContext;
}

export class JarvisVoiceManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;

  public onTranscript: ((text: string, isFinal: boolean) => void) | null = null;
  public onStateChange: ((state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error') => void) | null = null;
  public onAudioLevels: ((amp: number, bass: number, treble: number) => void) | null = null;

  private animationFrameId: number | null = null;

  constructor() {
    this.initSpeechRecognition();
  }

  private initSpeechRecognition() {
    const win = window as unknown as IWindow;
    const SpeechRec = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';

        this.recognition.onstart = () => {
          this.isListening = true;
          this.onStateChange?.('listening');
        };

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (finalTranscript) {
            this.onTranscript?.(finalTranscript, true);
          } else if (interimTranscript) {
            this.onTranscript?.(interimTranscript, false);
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
          if (event.error === 'no-speech') {
            // normal timeout
          } else {
            this.onStateChange?.('idle');
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
        };
      } catch (err) {
        console.warn('Speech recognition not supported in this browser environment', err);
      }
    }
  }

  public async startListening(): Promise<boolean> {
    try {
      await this.startMicAnalyser();
      if (this.recognition) {
        this.recognition.start();
        return true;
      }
      this.onStateChange?.('listening');
      return true;
    } catch (e) {
      console.warn('Could not start microphone or recognition:', e);
      return false;
    }
  }

  public stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    this.stopMicAnalyser();
    this.isListening = false;
  }

  private async startMicAnalyser() {
    try {
      if (!this.audioContext) {
        const AudioCtx = window.AudioContext || (window as unknown as IWindow).webkitAudioContext;
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        const source = this.audioContext.createMediaStreamSource(this.micStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
        this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      }

      this.monitorAudioLevels();
    } catch (err) {
      // Audio level fallback via synthetic oscillation
      this.monitorSyntheticAudio();
    }
  }

  private stopMicAnalyser() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  private monitorAudioLevels = () => {
    if (!this.analyser || !this.dataArray) {
      this.monitorSyntheticAudio();
      return;
    }

    this.analyser.getByteFrequencyData(this.dataArray);
    let sum = 0;
    let bassSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < this.dataArray.length; i++) {
      const val = this.dataArray[i] / 255;
      sum += val;
      if (i < 8) bassSum += val;
      if (i > 20) trebleSum += val;
    }

    const amp = sum / this.dataArray.length;
    const bass = bassSum / 8;
    const treble = trebleSum / (this.dataArray.length - 20 || 1);

    this.onAudioLevels?.(amp, bass, treble);
    this.animationFrameId = requestAnimationFrame(this.monitorAudioLevels);
  };

  private monitorSyntheticAudio = () => {
    let t = 0;
    const loop = () => {
      t += 0.05;
      const amp = this.isListening ? 0.35 + 0.25 * Math.sin(t * 3) : 0.08 + 0.04 * Math.sin(t);
      this.onAudioLevels?.(amp, amp * 1.2, amp * 0.8);
      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  };

  // Text-To-Speech with Persona configuration
  public speak(text: string, persona: string = 'Jarvis Pro', onEnd?: () => void): void {
    if (!('speechSynthesis' in window)) {
      onEnd?.();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Apply voice tone based on Persona
    const voices = window.speechSynthesis.getVoices();
    if (persona === 'Naira' || persona === 'Girlfriend Mode') {
      utterance.pitch = 1.2;
      utterance.rate = 1.05;
      const femaleVoice = voices.find(
        (v) =>
          v.name.includes('Female') ||
          v.name.includes('Samantha') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Zira') ||
          v.lang.startsWith('en-IN') ||
          v.lang.startsWith('hi-IN')
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    } else {
      // Jarvis / Butler style
      utterance.pitch = 0.95;
      utterance.rate = 1.02;
      const maleVoice = voices.find(
        (v) =>
          v.name.includes('Daniel') ||
          v.name.includes('George') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('David') ||
          v.name.includes('Male')
      );
      if (maleVoice) utterance.voice = maleVoice;
    }

    this.onStateChange?.('speaking');

    utterance.onend = () => {
      this.onStateChange?.('idle');
      onEnd?.();
    };

    utterance.onerror = () => {
      this.onStateChange?.('idle');
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Futuristic audio cues
  public playChime(type: 'startup' | 'confirm' | 'powerdown' | 'click') {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as IWindow).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'startup') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'confirm') {
        osc.frequency.setValueAtTime(580, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'powerdown') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);
        osc.start(now);
        osc.stop(now + 0.33);
      }
    } catch (e) {
      // ignore
    }
  }
}

export const voiceManager = new JarvisVoiceManager();
