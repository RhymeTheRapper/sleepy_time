import Entypo from "@expo/vector-icons/Entypo";
import Slider from "@react-native-community/slider";
import {
  AudioPlayer,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useRef, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styles from "./styles";

type audio = { name: string; path: any };

const audioFiles: audio[] = [
  { name: "Bruh Sound Effect", path: require("../assets/sounds/bruh.mp3") },
  { name: "Brown Noise", path: require("../assets/sounds/brown_noise.mp3") },
  { name: "White Noise", path: require("../assets/sounds/white_noise.mp3") },
  { name: "Pink Noise", path: require("../assets/sounds/pink_noise.mp3") },
  { name: "Ocean Waves", path: require("../assets/sounds/ocean.mp3") },
  { name: "Thunder and Rain", path: require("../assets/sounds/rain_thunder.mp3") },
  { name: "Rain on Window", path: require("../assets/sounds/rain_window.mp3") },
  { name: "Rain and Forest", path: require("../assets/sounds/rain_in_forest.mp3") },
  { name: "Waterfall", path: require("../assets/sounds/waterfall.mp3") },
  { name: "Forest", path: require("../assets/sounds/forest.mp3") },
  { name: "Fire", path: require("../assets/sounds/fire.mp3") },
];

function NoisePlayer({
  audioSource,
  time,
  registerPlayer,
}: {
  audioSource: audio;
  time: number;
  registerPlayer: (player: AudioPlayer, audioName: string) => void;
}): React.JSX.Element {
  const player = useAudioPlayer(audioSource.path);
  const status = useAudioPlayerStatus(player);
  const [sliderVolume, setSliderVolume] = useState(1);

  // Sanitize the key for SecureStore (only alphanumeric, ".", "-", and "_")
  const sanitizeKey = (name: string) => {
    return `volume_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  };

  // Load saved volume on mount
  useEffect(() => {
    const loadVolume = async () => {
      try {
        const savedVolume = await SecureStore.getItemAsync(
          sanitizeKey(audioSource.name)
        );
        if (savedVolume !== null) {
          const volume = parseFloat(savedVolume);
          setSliderVolume(volume);
          player.volume = volume;
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
    player.volume = value;
    try {
      await SecureStore.setItemAsync(sanitizeKey(audioSource.name), value.toString());
    } catch (error) {
      console.error('Error saving volume:', error);
    }
  };

  // Register the player when it starts playing
  const handlePlay = () => {
    player.loop = true;
    player.play();
    registerPlayer(player, audioSource.name); // Pass the player and audio name
    setTimeout(() => {
      player.loop = false;
      player.pause();
    }, time);
  };

  return (
    <View style={styles.playerContainer}>
      {(status.timeControlStatus === "waiting" ||
        status.timeControlStatus === "paused") && (
        <TouchableOpacity style={styles.playerButton} onPress={handlePlay}>
          <Entypo name="controller-play" size={50} color="white" />
        </TouchableOpacity>
      )}
      {status.timeControlStatus === "playing" && (
        <TouchableOpacity
          style={styles.playerButton}
          onPress={() => {
            player.pause();
          }}
        >
          <Entypo name="controller-paus" size={50} color="white" />
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
  const playersRef = useRef<{ player: AudioPlayer; name: string }[]>([]); // Reference to track all active players and their names

  // Load saved time on mount
  useEffect(() => {
    const loadTime = async () => {
      try {
        const savedTime = await SecureStore.getItemAsync('player_time');
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
      await SecureStore.setItemAsync('player_time', newTime.toString());
    } catch (error) {
      console.error('Error saving time:', error);
    }
  };

  const decrementTime = async () => {
    const newTime = Math.max(1, time - 30);
    setTime(newTime);
    try {
      await SecureStore.setItemAsync('player_time', newTime.toString());
    } catch (error) {
      console.error('Error saving time:', error);
    }
  };

  const registerPlayer = (player: AudioPlayer, audioName: string) => {
    if (!playersRef.current.some((p) => p.player === player)) {
      playersRef.current.push({ player, name: audioName }); // Add the player and its name to the list
    }
  };

  const stopAllPlayers = () => {
    playersRef.current
      .filter((current) => current.player.playing)
      .forEach((current) => {
        current.player.pause(); // Stop each player
      });
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
        <Text style={styles.title}>Noise Machine</Text>
        <View style={styles.listContainer}>
          {audioFiles.map((audio, index) => (
            <View key={index}>
              <Text style={styles.playerName}>{audio.name}</Text>
              <NoisePlayer
                key={index}
                audioSource={audio}
                time={time * 60000}
                registerPlayer={(player) => registerPlayer(player, audio.name)}
              />
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
