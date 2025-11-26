import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import {
  AudioPlayer,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import styles from "./styles";
import FavoriteModal from "./favorite_modal";

type audio = { name: string; path: any };

const audioFiles: audio[] = [
  { name: "Bruh Sound Effect", path: require("../assets/sounds/bruh.mp3") },
  { name: "Brown Noise", path: require("../assets/sounds/brown_noise.mp3") },
  { name: "White Noise", path: require("../assets/sounds/white_noise.mp3") },
  { name: "Pink Noise", path: require("../assets/sounds/pink_noise.mp3") },
  { name: "Ocean Waves", path: require("../assets/sounds/ocean.mp3") },
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
        onValueChange={(value) => {
          setSliderVolume(value);
          player.volume = value;
        }}
      />
    </View>
  );
}

export default function App(): React.JSX.Element {
  const [time, setTime] = useState(1);
  const [inputValue, setInputValue] = useState("1"); // Input value as a string
  const [favorites, setFavorites] = useState<
    { name: string; sounds: { name: string; volume: number }[] }[]
  >([]); // State for favorites
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility
  const playersRef = useRef<{ player: AudioPlayer; name: string }[]>([]); // Reference to track all active players and their names

  const handleTimeChange = (text: string) => {
    setInputValue(text); // Update the input value immediately
    const parsedTime = parseInt(text, 10);
    if (!isNaN(parsedTime) && parsedTime >= 0) {
      setTime(parsedTime); // Update the time state only if the input is valid
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

  const saveFavorite = (name: string) => {
    // Get all currently playing players
    const currentlyPlaying = playersRef.current.filter(
      ({ player }) => player.playing
    );
    const newFavorite = {
      name,
      sounds: currentlyPlaying.map(({ player, name }) => ({
        name, // Use the audio name associated with the player
        volume: player.volume,
      })),
    };
    setFavorites((prevFavorites) => [...prevFavorites, newFavorite]); // Add to favorites
    setModalVisible(false); // Close the modal
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
        <Text style={styles.title}>Set player time</Text>
        <TextInput
          style={styles.timeInput}
          keyboardType="numeric"
          value={inputValue}
          onChangeText={handleTimeChange}
          placeholder="Enter time (minutes)"
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity style={styles.playerButton} onPress={stopAllPlayers}>
          <Entypo name="controller-stop" size={50} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>Favorites</Text>
        <TouchableOpacity
          style={styles.playerButton}
          onPress={() => setModalVisible(true)} // Open the modal
        >
          <Entypo name="star" size={50} color="white" />
        </TouchableOpacity>
        {favorites.map((favorite, index) => (
          <View key={index} style={styles.playerName}>
            <Text style={{ color: "white", fontWeight: "bold" }}>
              {favorite.name}
            </Text>
            {favorite.sounds.map((sound, soundIndex) => (
              <Text key={soundIndex} style={{ color: "white" }}>
                {sound.name} - Volume: {sound.volume.toFixed(2)}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>

      <FavoriteModal
        visible={modalVisible}
        onSave={saveFavorite}
        onCancel={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}
