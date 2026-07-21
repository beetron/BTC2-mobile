import React from "react";
import { Image, StyleSheet } from "react-native";
import { images } from "../constants/images";

interface LogoProps {
  size?: number;
}

const Logo = ({ size = 200 }: LogoProps) => {
  const imageLogo = images.btc2LogoLogin;
  const isDefaultSize = size === 200;
  return (
    <Image
      source={imageLogo}
      style={[
        styles.image,
        { width: size, height: size },
        !isDefaultSize && styles.inlineImage,
      ]}
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
  inlineImage: {
    margin: 0,
    bottom: 0,
  },
});

export default Logo;
