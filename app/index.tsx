import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { setAudioModeAsync, useAudioPlayer } from "expo-audio";
import Slider from "@react-native-community/slider";
import { SafeAreaView } from "react-native-safe-area-context";
import Entypo from "@expo/vector-icons/Entypo";
import styles from "./styles";

type audio = { name: string; path: any };

const audioFiles: any[] = [
  { name: "Bruh Sound Effect", path: require("../assets/sounds/bruh.mp3") },
  { name: "Brown Noise", path: require("../assets/sounds/brown_noise.mp3") },
  { name: "White Noise", path: require("../assets/sounds/white_noise.mp3") },
  { name: "Pink Noise", path: require("../assets/sounds/pink_noise.mp3") },
  { name: "Ocean Waves", path: require("../assets/sounds/ocean.mp3") },
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
        <TouchableOpacity
          style={styles.playerButton}
          onPress={() => {
            player.loop = true;
            player.play();
            setTimeout(() => {
              player.loop = false;
              player.pause();
            }, time);
            setIsPlaying(true);
          }}
        >
          <Entypo name="controller-play" size={50} color="white" />
        </TouchableOpacity>
      )}
      {isPlaying && (
        <TouchableOpacity
          style={styles.playerButton}
          onPress={() => {
            player.pause();
            setIsPlaying(false);
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

  const handleTimeChange = (text: string) => {
    setInputValue(text); // Update the input value immediately
    const parsedTime = parseInt(text, 10);
    if (!isNaN(parsedTime) && parsedTime >= 0) {
      setTime(parsedTime); // Update the time state only if the input is valid
    }
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
              />
            </View>
          ))}
        </View>
        <Text style={styles.title}>
          Set player time
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