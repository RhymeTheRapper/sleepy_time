import { StyleSheet } from "react-native";

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
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  playerContainer: {
    width: 170,
    padding: 16,
    marginBottom: 8,
    backgroundColor: "#1F2937",
    borderRadius: 8,
  },
  playerName: {
    fontSize: 18,
    fontWeight: "600",
    color: "white",
    marginBottom: 12,
  },
  playerButton: {
    alignSelf: "center",
  },
  volumeLabel: {
    color: "#D1D5DB",
    marginRight: 8,
  },
  slider: {
    width: "100%",
    height: 40,
  },
});

export default styles;
