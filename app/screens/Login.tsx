import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";
import { SafeAreaView, SafeAreaProvider } from "react-native-safe-area-context";
import Logo from "../components/login/Logo";
import CustomButton from "@/components/CustomButton";

const Login = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const { onLogin, onRegister } = useAuth();

  const onLoginValidation = () => {
    if (username === "" || password === "") {
      alert("Please fill in all fields");
    } else {
      onLogin(username, password);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView className="h-full bg-btc400">
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
              <View className="flex-1 items-center jusitfy-center p-4">
                <Logo />
                <Text className="text-red-500">Login</Text>
                {/* Username input */}
                <TextInput
                  placeholder="Username"
                  placeholderTextColor="#666"
                  value={username}
                  onChangeText={setUsername}
                  style={styles.input}
                />
                {/* Password input */}
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />

                {/* Password input */}
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
                {/* Password input */}
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#666"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                />
                <CustomButton />
              </View>
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2a2a3c",
  },
  input: {
    height: 50,
    margin: 12,
    borderWidth: 1,
    borderRadius: 15,
    backgroundColor: "white",
    padding: 10,
    width: "70%",
    color: "#000",
    fontSize: 20,
    fontWeight: "bold",
  },
  white: {
    color: "#fff",
  },
});

export default Login;
