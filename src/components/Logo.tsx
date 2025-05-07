import React from "react";
import { Image, StyleSheet } from "react-native";
import { images } from "../constants/images";

const Logo = () => {
  const imageLogo = images.btc2LogoLogin;
  return <Image source={imageLogo} style={styles.image} resizeMode="contain" />;
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
