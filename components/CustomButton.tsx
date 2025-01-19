import { Text, TouchableOpacity } from "react-native";
import React from "react";

const CustomButton = () => {
  return (
    <TouchableOpacity
      className={` rounded-xl
         min-h-[50px] min-w-[200px]
          justify-center items-center
          bg-btc300`}
    >
      <Text className="">CustomButton</Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
