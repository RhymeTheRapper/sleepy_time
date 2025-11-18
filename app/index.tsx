import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Button,
  TextInput,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";

type audio = { name: string; path: any };

const audioFiles: any[] = [
  { name: "Bruh Sound Effect", path: require("../assets/sounds/bruh.mp3") },
  { name: "Brown Noise", path: require("../assets/sounds/brown_noise.mp3") },
];

function NoisePlayer({
  audioSource,
  time,
}: {
  audioSource: audio;
  time: number;
}): React.JSX.Element {
  const player = useAudioPlayer(audioSource.path);
  const [sliderVolume, setSliderVolume] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <View style={styles.playerContainer}>
      {!isPlaying && (
        <button
          onClick={() => {
            player.loop = true;
            player.play();
            setTimeout(() => {
              player.loop = false;
              player.pause();
            }, time);
            setIsPlaying(true);
          }}
        >
          <Entypo name="controller-play" size={24} color="black" />
        </button>
      )}
      {isPlaying && (
        <Button
          title="Pause Sound"
          onPress={() => {
            player.pause();
            setIsPlaying(false);
          }}
        />
      )}
      <Text style={styles.volumeLabel}>Volume:</Text>
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

  const handleTimeChange = (text: string) => {
    setInputValue(text); // Update the input value immediately
    const parsedTime = parseInt(text, 10);
    if (!isNaN(parsedTime) && parsedTime >= 0) {
      setTime(parsedTime); // Update the time state only if the input is valid
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
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
              />
            </View>
          ))}
        </View>
        <Text style={styles.title}>
          Set playback time (in minutes). Current: {isNaN(time) ? 0 : time} minutes
        </Text>
        <TextInput
          style={styles.timeInput}
          keyboardType="numeric"
          value={inputValue}
          onChangeText={handleTimeChange}
          placeholder="Enter time (minutes)"
          placeholderTextColor="#9CA3AF"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollViewContent: {
    padding: 16,
  },
  timeInput: {
    height: 40,
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 4,
    color: "white",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 24,
  },
  listContainer: {
    marginBottom: 16,
  },
  playerContainer: {
    width: "100%",
    padding: 16,
    marginVertical: 8,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  errorText: {
    color: "#F87171",
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  volumeLabel: {
    color: "#D1D5DB",
    marginRight: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
