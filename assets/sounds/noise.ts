// Generates white, pink, and brown noise on the device and plays it on a gapless loop.
import { useEffect, useRef, useState } from "react";
import {
  AudioBuffer,
  AudioBufferSourceNode,
  AudioContext,
  AudioManager,
  GainNode,
} from "react-native-audio-api";

export type NoiseColor = "white" | "pink" | "brown";
type Samples = Float32Array<ArrayBuffer>;

const DURATION_SECONDS = 20;
const CROSSFADE_SECONDS = 5;
const PEAK = 0.5; // normalize to -6 dBFS so the noise isn't harsh

function white(length: number): Samples {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = Math.random() * 2 - 1;
  return out;
}

// Paul Kellet's refined pink noise filter (-3 dB/octave)
function pink(length: number): Samples {
  const out = new Float32Array(length);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362;
    b6 = w * 0.115926;
  }
  return out;
}

// Leaky integrator of white noise (-6 dB/octave), leak keeps it from drifting
function brown(length: number): Samples {
  const out = new Float32Array(length);
  let last = 0;
  for (let i = 0; i < length; i++) {
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    out[i] = last;
  }
  return out;
}

const generators: Record<NoiseColor, (length: number) => Samples> = { white, pink, brown };

// Remove DC offset and scale so the loudest sample hits PEAK
function normalize(samples: Samples): Samples {
  let mean = 0;
  for (const s of samples) mean += s;
  mean /= samples.length;
  let max = 0;
  for (let i = 0; i < samples.length; i++) {
    samples[i] -= mean;
    max = Math.max(max, Math.abs(samples[i]));
  }
  for (let i = 0; i < samples.length; i++) samples[i] = (samples[i] / max) * PEAK;
  return samples;
}

// Crossfade the tail into the head so the end flows straight back into the start
function makeLoop(samples: Samples, loopLength: number, fadeLength: number): Samples {
  const out = samples.slice(0, loopLength);
  for (let i = 0; i < fadeLength; i++) {
    const x = i / fadeLength;
    const t = x * x * (3 - 2 * x) * (Math.PI / 2); // smoothstep eases in and out of the fade
    out[i] = samples[i] * Math.sin(t) + samples[loopLength + i] * Math.cos(t);
  }
  return out;
}

let context: AudioContext | null = null;
const buffers: Partial<Record<NoiseColor, AudioBuffer>> = {};
const activeSources = new Set<AudioBufferSourceNode>();

function getContext(): AudioContext {
  if (!context) {
    // "playback" keeps sound going with the silent switch on and in the background
    AudioManager.setSystemOptions({ ios: { category: "playback" } });
    context = new AudioContext();
  }
  return context;
}

// Buffers are generated once per color on first play, then reused
function getBuffer(ctx: AudioContext, color: NoiseColor): AudioBuffer {
  const cached = buffers[color];
  if (cached) return cached;
  const loopLength = ctx.sampleRate * DURATION_SECONDS;
  const fadeLength = ctx.sampleRate * CROSSFADE_SECONDS;
  const samples = makeLoop(
    normalize(generators[color](loopLength + fadeLength)),
    loopLength,
    fadeLength
  );
  const buffer = ctx.createBuffer(1, loopLength, ctx.sampleRate);
  buffer.copyToChannel(samples, 0);
  buffers[color] = buffer;
  return buffer;
}

export function useNoisePlayer(color: NoiseColor) {
  const [playing, setPlaying] = useState(false);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const volumeRef = useRef(1);

  const pause = () => {
    const source = sourceRef.current;
    if (!source) return;
    source.stop();
    source.disconnect();
    activeSources.delete(source);
    sourceRef.current = null;
    setPlaying(false);
    // Nothing left playing, so let the audio hardware idle
    if (activeSources.size === 0) context?.suspend();
  };

  const play = () => {
    if (sourceRef.current) return;
    const ctx = getContext();
    if (!gainRef.current) {
      gainRef.current = ctx.createGain();
      gainRef.current.gain.value = volumeRef.current;
      gainRef.current.connect(ctx.destination);
    }
    // A source node can only be started once, so each play gets a fresh one
    const source = ctx.createBufferSource();
    source.buffer = getBuffer(ctx, color);
    source.loop = true;
    source.connect(gainRef.current);
    source.start();
    ctx.resume();
    activeSources.add(source);
    sourceRef.current = source;
    setPlaying(true);
  };

  const setVolume = (value: number) => {
    volumeRef.current = value;
    if (gainRef.current) gainRef.current.gain.value = value;
  };

  // Stop the sound if the player unmounts
  useEffect(() => pause, []);

  return { playing, play, pause, setVolume };
}
