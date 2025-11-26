import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
} from "react-native";

interface FavoriteModalProps {
  visible: boolean;
  onSave: (name: string) => void;
  onCancel: () => void;
}

export default function FavoriteModal({
  visible,
  onSave,
  onCancel,
}: FavoriteModalProps): React.JSX.Element {
  const [favoriteName, setFavoriteName] = useState("");

  const handleSave = () => {
    onSave(favoriteName); // Pass the favorite name to the parent
    setFavoriteName(""); // Reset the input field
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={modalStyles.modalContainer}>
        <View style={modalStyles.modalContent}>
          <Text style={modalStyles.modalTitle}>Save Favorite</Text>
          <TextInput
            style={modalStyles.modalInput}
            placeholder="Enter favorite name"
            placeholderTextColor="#9CA3AF"
            value={favoriteName}
            onChangeText={setFavoriteName}
          />
          <View style={modalStyles.modalButtons}>
            <TouchableOpacity
              style={modalStyles.modalButton}
              onPress={handleSave}
              disabled={!favoriteName.trim()} // Disable if name is empty
            >
              <Text style={modalStyles.modalButtonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[modalStyles.modalButton, modalStyles.cancelButton]}
              onPress={onCancel}
            >
              <Text style={modalStyles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    height: 40,
    borderColor: "#374151",
    borderWidth: 1,
    borderRadius: 4,
    color: "white",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 4,
    alignItems: "center",
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: "#EF4444",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
