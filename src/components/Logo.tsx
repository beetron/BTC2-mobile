import React from "react";
import { Image, StyleSheet } from "react-native";

const Logo = () => {
  return (
    <Image
      source={require("../assets/images/btc2-logo.png")}
      style={styles.image}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    margin: 10,
    bottom: 50,
  },
});

export default Logo;
