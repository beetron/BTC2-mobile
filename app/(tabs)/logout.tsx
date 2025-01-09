import { View, Text } from "react-native";
import React from "react";
import styles from "../styles";

const logout = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.whiteText}>Logout</Text>
    </View>
  );
};

export default logout;
