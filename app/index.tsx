import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, StatusBar, Button } from "react-native";
import { useAudioPlayer } from "expo-audio";
import Slider from "@react-native-community/slider";
// Replaced react-native's SafeAreaView with this one
import { SafeAreaView } from "react-native-safe-area-context";


const audioSource = require("../assets/sounds/bruh.mp3");

function NoisePlayer(): React.JSX.Element {
  const player = useAudioPlayer(audioSource);

  return (
    <View style={styles.playerContainer}>
      <Button title="Play Sound" onPress={() => player.play()} />
      <Button
        title="Replay Sound"
        onPress={() => {
          player.seekTo(0);
          player.play();
        }}
      />
    </View>
  );
}

/**
 * The main application component.
 */
export default function App(): React.JSX.Element {

  return (
    // Using SafeAreaView from react-native-safe-area-context
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#111827" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.title}>Noise Machine</Text>

        <View style={styles.listContainer}>
            <NoisePlayer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- Styles ---
// Using React Native's built-in StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827", // bg-gray-900
  },
  scrollViewContent: {
    padding: 16,
  },
  title: {
    fontSize: 30, // text-3xl
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginVertical: 24, // my-6
  },
  listContainer: {
    marginBottom: 16, // mb-4
  },
  playerContainer: {
    width: "100%",
    padding: 16,
    marginVertical: 8, // my-2
    backgroundColor: "#1F2937", // bg-gray-800
    borderRadius: 8, // rounded-lg
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  playerName: {
    fontSize: 18, // text-lg
    fontWeight: "600", // font-semibold
    color: "white",
    marginBottom: 12, // mb-3
  },
  errorText: {
    color: "#F87171", // text-red-400
  },
  sliderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  volumeLabel: {
    color: "#D1D5DB", // text-gray-300
    marginRight: 8, // mr-2
  },
  slider: {
    flex: 1,
    height: 40,
  },
});
