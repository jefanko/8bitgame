// js/utils/musicManager.js
import { gameState } from '../config/GameConfig.js';

// --- Music Synths (can be reused or recreated per call) ---
let musicSynth, musicBassSynth;

// --- SFX Synths (create them once for efficiency) ---
let sfxPlayerAttackSynth, sfxPlayerHurtSynth, sfxDragonHurtSynth, sfxDragonDefeatNoise, sfxDragonDefeatTone;

export function initTone() {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    gameState.musicInitialized = true;
    console.log("Tone.js Audio Context Initialized.");

    // Initialize SFX synths if not already done
    if (!sfxPlayerAttackSynth) {
        sfxPlayerAttackSynth = new Tone.NoiseSynth({
            noise: { type: 'white' },
            envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
        }).toDestination();
        sfxPlayerAttackSynth.volume.value = -20;
    }
    if (!sfxPlayerHurtSynth) {
        sfxPlayerHurtSynth = new Tone.MembraneSynth({
            pitchDecay: 0.08,
            octaves: 2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0.01, release: 0.2 }
        }).toDestination();
        sfxPlayerHurtSynth.volume.value = -10;
    }
    if (!sfxDragonHurtSynth) {
        sfxDragonHurtSynth = new Tone.MembraneSynth({ // Slightly different from player hurt
            pitchDecay: 0.1,
            octaves: 3,
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.25, sustain: 0, release: 0.2 }
        }).toDestination();
        sfxDragonHurtSynth.volume.value = -12;
    }
    if (!sfxDragonDefeatNoise) {
        sfxDragonDefeatNoise = new Tone.NoiseSynth({
            noise: { type: "brown" },
            envelope: { attack: 0.01, decay: 0.8, sustain: 0.1, release: 0.5 }
        }).toDestination();
        sfxDragonDefeatNoise.volume.value = -10;

        sfxDragonDefeatTone = new Tone.Synth({
            oscillator: { type: "sawtooth" },
            envelope: { attack: 0.05, decay: 0.5, sustain: 0.2, release: 1 },
            filterEnvelope: { attack: 0.1, decay: 0.3, sustain: 0.1, release: 0.8, baseFrequency: 800, octaves: -2 }
        }).toDestination();
        sfxDragonDefeatTone.volume.value = -15;
    }
}

export function playMusic(type) {
    if (!gameState.musicInitialized) {
        console.warn("Music not initialized. Call initTone() first after a user gesture.");
        return;
    }
    stopMusic(); // Stop any currently playing music and clear transport

    // Recreate synths each time to ensure clean state, or manage them more carefully
    musicSynth = new Tone.Synth({
        oscillator: { type: "pulse", width: 0.6 },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.2, release: 0.3 }
    }).toDestination();
    musicSynth.volume.value = -18;

    musicBassSynth = new Tone.MonoSynth({
        oscillator: { type: "square" },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.5 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.1, release: 0.2, baseFrequency: 100, octaves: 2 }
    }).toDestination();
    musicBassSynth.volume.value = -12;

    let melody, bassLineData, loopEndBpm;

    if (type === "menu") {
        melody = [{ time: "0:0", note: "C4", duration: "4n" }, { time: "0:2", note: "E4", duration: "4n" }, { time: "1:0", note: "G4", duration: "2n" }, { time: "1:2", note: "E4", duration: "4n" }, { time: "2:0", note: "F4", duration: "4n" }, { time: "2:2", note: "D4", duration: "4n" }, { time: "3:0", note: "C4", duration: "2n" }];
        loopEndBpm = { loopEnd: "4m", bpm: 90 };
        gameState.currentMusicLoop = new Tone.Part((time, value) => musicSynth.triggerAttackRelease(value.note, value.duration, time), melody).start(0);
    } else if (type === "battle") {
        melody = [{ time: "0:0:0", note: "E5", duration: "8n" }, { time: "0:0:2", note: "D#5", duration: "8n" }, { time: "0:1:0", note: "E5", duration: "8n" }, { time: "0:1:2", note: "B4", duration: "8n" }, { time: "0:2:0", note: "D5", duration: "8n" }, { time: "0:2:2", note: "C5", duration: "8n" }, { time: "0:3:0", note: "A4", duration: "4n" }, { time: "1:0:0", note: "C4", duration: "8n" }, { time: "1:1:0", note: "E4", duration: "8n" }, { time: "1:2:0", note: "A4", duration: "8n" }, { time: "1:3:0", note: "B4", duration: "4n" },];
        bassLineData = [{ time: "0:0", note: "A2", duration: "2n" }, { time: "0:2", note: "A2", duration: "2n" }, { time: "1:0", note: "F2", duration: "2n" }, { time: "1:2", note: "F2", duration: "2n" }, { time: "2:0", note: "G2", duration: "2n" }, { time: "2:2", note: "G2", duration: "2n" }, { time: "3:0", note: "E2", duration: "2n" }, { time: "3:2", note: "E2", duration: "2n" },];
        loopEndBpm = { loopEnd: "2m", bpm: 130 };
        gameState.currentMusicLoop = new Tone.Part((time, value) => musicSynth.triggerAttackRelease(value.note, value.duration, time), melody).start(0);
        gameState.battleBassLoop = new Tone.Part((time, value) => musicBassSynth.triggerAttackRelease(value.note, value.duration, time), bassLineData).start(0);
        gameState.battleBassLoop.loop = true;
        gameState.battleBassLoop.loopEnd = loopEndBpm.loopEnd;
    } else if (type === "epilogue") {
        melody = [{ time: "0:0", note: "G4", duration: "2n." }, { time: "0:3", note: "C5", duration: "4n" }, { time: "1:0", note: "E5", duration: "2n" }, { time: "1:2", note: "D5", duration: "2n" }, { time: "2:0", note: "C5", duration: "1m" }];
        loopEndBpm = { loopEnd: "3m", bpm: 70 };
        gameState.currentMusicLoop = new Tone.Part((time, value) => musicSynth.triggerAttackRelease(value.note, value.duration, time), melody).start(0);
    }

    if (gameState.currentMusicLoop && loopEndBpm) {
        gameState.currentMusicLoop.loop = true;
        gameState.currentMusicLoop.loopEnd = loopEndBpm.loopEnd;
        Tone.Transport.bpm.value = loopEndBpm.bpm;
    }

    if (Tone.Transport.state !== "started") Tone.Transport.start();
}

export function stopMusic() {
    if (!gameState.musicInitialized) return;
    if (gameState.currentMusicLoop) {
        gameState.currentMusicLoop.stop(0).dispose();
        gameState.currentMusicLoop = null;
    }
    if (gameState.battleBassLoop) {
        gameState.battleBassLoop.stop(0).dispose();
        gameState.battleBassLoop = null;
    }
    if (Tone.Transport.state === "started") {
        Tone.Transport.stop();
    }
    Tone.Transport.cancel();
}

export function playSoundEffect(type) {
    if (!gameState.musicInitialized) { // SFX also need Tone to be started
        console.warn("SFX not initialized. Call initTone() first after a user gesture.");
        return;
    }
    const now = Tone.now();
    switch (type) {
        case 'slash':
            if (sfxPlayerAttackSynth) {
                sfxPlayerAttackSynth.triggerAttackRelease("8n", now);
            }
            break;
        case 'playerHurt':
            if (sfxPlayerHurtSynth) {
                sfxPlayerHurtSynth.triggerAttackRelease("C2", "8n", now);
            }
            break;
        case 'dragonHurt':
            if (sfxDragonHurtSynth) {
                sfxDragonHurtSynth.triggerAttackRelease("G1", "8n", now, 0.8); // Added velocity
            }
            break;
        case 'dragonDefeat':
            if (sfxDragonDefeatNoise && sfxDragonDefeatTone) {
                sfxDragonDefeatNoise.triggerAttackRelease("1n", now);
                sfxDragonDefeatTone.triggerAttackRelease("C3", "1n", now + 0.1);
                sfxDragonDefeatTone.frequency.rampTo("C2", 0.8, now + 0.2);
            }
            break;
        default:
            console.warn("Unknown sound effect type:", type);
    }
}
