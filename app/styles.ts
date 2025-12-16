import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollViewContent: {
    paddingTop: 16,
    paddingRight: 16,
    paddingBottom: 130,
    paddingLeft: 16,
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
    fontFamily: Platform.select({
      android: "Inter_900Black",
      ios: "Inter-Black",
    }),
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
    fontFamily: Platform.select({
      android: "Inter_900Black",
      ios: "Inter-Black",
    }),
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
  stickyBottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1F2937",
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: "#374151",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  timeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    alignSelf: "center",
    paddingTop: 12,
    fontFamily: Platform.select({
      android: "Inter_900Black",
      ios: "Inter-Black",
    }),
  },
});

export default styles;
