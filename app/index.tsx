import { View, Text, Pressable } from "react-native";
import { Link } from "expo-router";
import React from "react";
import styles from "./styles";

const index = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.whiteText}>Login Screen</Text>
      <Link replace href="/(tabs)" style={styles.whiteText}>
        Enter
      </Link>
    </View>
  );
};

export default index;
