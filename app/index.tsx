import Entypo from "@expo/vector-icons/Entypo";
import Slider from "@react-native-community/slider";
import {
  AudioSource,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NoiseColor, useNoisePlayer } from "../assets/sounds/noise";
import styles from "./styles";

// Recorded sounds stream from a file; noise colors are generated on the device
type audio = { name: string; path: AudioSource } | { name: string; noise: NoiseColor };

// The controls every player exposes, whatever is producing the sound
type Playback = {
  playing: boolean;
  play: () => void;
  pause: () => void;
  setVolume: (value: number) => void;
};

type PlayerProps = {
  name: string;
  time: number;
  registerPlayer: (name: string, pause: () => void) => void;
};

const audioFiles: audio[] = [
  { name: "Bruh Sound Effect", path: "https://storage.googleapis.com/sleepytimesounds/bruh.mp3" },
  { name: "Brown Noise", noise: "brown" },
  { name: "White Noise", noise: "white" },
  { name: "Pink Noise", noise: "pink" },
  { name: "Ocean Waves", path: "https://storage.googleapis.com/sleepytimesounds/ocean.mp3" },
  { name: "Thunder and Rain", path: "https://storage.googleapis.com/sleepytimesounds/rain_thunder.mp3" },
  { name: "Rain on Window", path: "https://storage.googleapis.com/sleepytimesounds/rain_window.mp3" },
  { name: "Rain and Forest", path: "https://storage.googleapis.com/sleepytimesounds/rain_in_forest.mp3" },
  { name: "Waterfall", path: "https://storage.googleapis.com/sleepytimesounds/waterfall.mp3" },
  { name: "Forest", path: "https://storage.googleapis.com/sleepytimesounds/forest.mp3" },
  { name: "Fire", path: "https://storage.googleapis.com/sleepytimesounds/fire.mp3" },
];

function useFilePlayer(path: AudioSource): Playback {
  const player = useAudioPlayer(path);
  const status = useAudioPlayerStatus(player);
  // expo-audio players are controlled by setting their properties
  /* eslint-disable react-hooks/immutability */
  return {
    playing: status.timeControlStatus === "playing",
    play: () => {
      player.loop = true;
      player.play();
    },
    pause: () => {
      player.loop = false;
      player.pause();
    },
    setVolume: (value) => {
      player.volume = value;
    },
  };
  /* eslint-enable react-hooks/immutability */
}

function FilePlayer({ path, ...props }: PlayerProps & { path: AudioSource }): React.JSX.Element {
  return <NoisePlayer playback={useFilePlayer(path)} {...props} />;
}

function GeneratedNoisePlayer({ noise, ...props }: PlayerProps & { noise: NoiseColor }): React.JSX.Element {
  return <NoisePlayer playback={useNoisePlayer(noise)} {...props} />;
}

function NoisePlayer({
  name,
  time,
  registerPlayer,
  playback,
}: PlayerProps & { playback: Playback }): React.JSX.Element {
  const [sliderVolume, setSliderVolume] = useState(1);

  // Turn the sound name into a storage key (only alphanumeric, ".", "-", and "_")
  const sanitizeKey = (name: string) => {
    return `volume_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  };

  // Load saved volume on mount
  useEffect(() => {
    const loadVolume = async () => {
      try {
        const savedVolume = await AsyncStorage.getItem(sanitizeKey(name));
        if (savedVolume !== null) {
          const volume = parseFloat(savedVolume);
          setSliderVolume(volume);
          playback.setVolume(volume);
        }
      } catch (error) {
        console.error("Error loading volume:", error);
      }
    };
    loadVolume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save volume whenever it changes
  const handleVolumeChange = async (value: number) => {
    setSliderVolume(value);
    playback.setVolume(value);
    try {
      await AsyncStorage.setItem(sanitizeKey(name), value.toString());
    } catch (error) {
      console.error('Error saving volume:', error);
    }
  };

  // Register the player when it starts playing
  const handlePlay = () => {
    playback.play();
    registerPlayer(name, playback.pause);
    setTimeout(playback.pause, time);
  };

  return (
    <View style={styles.playerContainer}>
      {playback.playing ? (
        <TouchableOpacity style={styles.playerButton} onPress={playback.pause}>
          <Entypo name="controller-paus" size={50} color="white" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.playerButton} onPress={handlePlay}>
          <Entypo name="controller-play" size={50} color="white" />
        </TouchableOpacity>
      )}
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={sliderVolume}
        onValueChange={handleVolumeChange}
      />
    </View>
  );
}

export default function App(): React.JSX.Element {
  const [time, setTime] = useState(30);
  const playersRef = useRef<{ name: string; pause: () => void }[]>([]); // Reference to track all active players and their names

  // Load saved time on mount
  useEffect(() => {
    const loadTime = async () => {
      try {
        const savedTime = await AsyncStorage.getItem('player_time');
        if (savedTime !== null) {
          setTime(parseInt(savedTime, 10));
        }
      } catch (error) {
        console.error('Error loading time:', error);
      }
    };
    loadTime();
  }, []);

  const incrementTime = async () => {
    const newTime = time + 30;
    setTime(newTime);
    try {
      await AsyncStorage.setItem('player_time', newTime.toString());
    } catch (error) {
      console.error('Error saving time:', error);
    }
  };

  const decrementTime = async () => {
    const newTime = Math.max(10, time - 30);
    setTime(newTime);
    try {
      await AsyncStorage.setItem('player_time', newTime.toString());
    } catch (error) {
      console.error('Error saving time:', error);
    }
  };

  const registerPlayer = (name: string, pause: () => void) => {
    if (!playersRef.current.some((p) => p.name === name)) {
      playersRef.current.push({ name, pause }); // Add the player and its name to the list
    }
  };

  const stopAllPlayers = () => {
    // Pausing a player that has already stopped does nothing
    playersRef.current.forEach((current) => current.pause());
    playersRef.current = []; // Clear the list after `stopping all players
  };


  useEffect(() => {
    const configureAudio = async () => {
      await setAudioModeAsync({
        shouldPlayInBackground: true,
        interruptionModeAndroid: "duckOthers",
      });
    };

    configureAudio();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Sleepy Time</Text>
        <View style={styles.listContainer}>
          {audioFiles.map((audio, index) => (
            <View key={index}>
              <Text style={styles.playerName}>{audio.name}</Text>
              {"noise" in audio ? (
                <GeneratedNoisePlayer
                  name={audio.name}
                  noise={audio.noise}
                  time={time * 60000}
                  registerPlayer={registerPlayer}
                />
              ) : (
                <FilePlayer
                  name={audio.name}
                  path={audio.path}
                  time={time * 60000}
                  registerPlayer={registerPlayer}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={styles.stickyBottomBar}>
        <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.playerButton} onPress={decrementTime}>
          <Entypo name="minus" size={50} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playerButton} onPress={incrementTime}>
          <Entypo name="plus" size={50} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.playerButton} onPress={stopAllPlayers}>
          <Entypo name="controller-stop" size={50} color="white" />
          </TouchableOpacity>
        </View>
          <Text style={styles.timeText} >{time} minutes</Text>
      </View>
    </SafeAreaView>
  );
}
