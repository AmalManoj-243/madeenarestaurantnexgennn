import React, { useState } from "react";
import {
  View,
  Keyboard,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import { COLORS, FONT_FAMILY } from "@constants/theme";
import { LogBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@components/common/Button";
import {  OverlayLoader } from "@components/Loader";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import Text from "@components/Text";
import { TextInput } from "@components/common/TextInput";
import { RoundedScrollContainer, SafeAreaView } from "@components/containers";
import { useAuthStore } from "@stores/auth";
import { showToastMessage } from "@components/Toast";
import { Checkbox } from "react-native-paper";

LogBox.ignoreLogs(["new NativeEventEmitter"]);
LogBox.ignoreAllLogs();

const LoginScreenOdoo = () => {

  const navigation = useNavigation();
  const setUser = useAuthStore(state => state.login)
  const [checked, setChecked] = useState(false);

  const updateCheckedState = (value) => {
    setChecked(value);
  };
  // destructuring Styles
  const { container, tinyLogo, imageContainer } = styles;

  LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
  ]);

  const [inputs, setInputs] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    Keyboard.dismiss();
    let isValid = true;
    if (!inputs.username) {
      handleError("Please input user name", "username");
      isValid = false;
    }
    if (!inputs.password) {
      handleError("Please input password", "password");
      isValid = false;
    }
    if (!checked) {
      showToastMessage('Please agree Privacy Policy')
      isValid = false;
    }
    if (isValid) {
      login();
    }
  };

LogBox.ignoreLogs(["new NativeEventEmitter"]);
LogBox.ignoreAllLogs();
  const login = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://192.168.1.120:8069/web/session/authenticate",
        {
          jsonrpc: "2.0",
          method: "call",
          params: {
            db: "odooo19",
            login: inputs.username,
            password: inputs.password,
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log("🚀 ~ file: ~ Odoo response :", JSON.stringify(response.data))
      if (response.data.result && response.data.result.uid) {
        // Login successful
        const userData = response.data.result;
        await AsyncStorage.setItem("userData", JSON.stringify(userData));
        setUser(userData);
        navigation.navigate("AppNavigator");
      } else {
        showToastMessage("Invalid credentials");
      }




      
    } catch (error) {
      console.log("Odoo error:", error.response ? error.response.data : error.message); // Debug log
      showToastMessage(`Error! ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOnchange = (text, input) => {
    setInputs((prevState) => ({ ...prevState, [input]: text }));
  };

  const handleError = (error, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: error }));
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={container}>
        <OverlayLoader visible={loading} />
        {/* <ScrollView style={{ paddingHorizontal: 15, flex: 1, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}> */}
            <View style={imageContainer}>
              <Image source={require('@assets/images/header/logo_header.png')} style={{ width: 300, height: 180, alignSelf: 'center' }} />
            </View>
        <RoundedScrollContainer backgroundColor={COLORS.white} paddingHorizontal={15} borderTopLeftRadius={40} borderTopRightRadius={40}>
          <View style={{ paddingTop: 50 }}>
            <View style={{ marginVertical: 5, marginHorizontal: 10 }}>
              <View style={{ marginTop: 0, marginBottom: 15 }}>
                <Text style={{ fontSize: 25, fontFamily: FONT_FAMILY.urbanistBold, color: '#2e2a4f' }}>Login</Text>
              </View>
              <TextInput
                onChangeText={(text) => handleOnchange(text, "username")}
                onFocus={() => handleError(null, "username")}
                iconName="account-outline"
                label="username orr Email"
                placeholder="Enter Username or Email"
                error={errors.username}
                column={true}
                login={true}
              />
              <TextInput
                onChangeText={(text) => handleOnchange(text, "password")}
                onFocus={() => handleError(null, "password")}
                error={errors.password}
                iconName="lock-outline"
                label="Pasword"
                placeholder="Enter password"
                password
                column={true}
                login={true}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }}>
                <Checkbox onPress={() => navigation.navigate('PrivacyPolicy', { updateCheckedState })} status={checked ? 'checked' : 'unchecked'} color={COLORS.primaryThemeColor} />
                <Text style={{ fontFamily: FONT_FAMILY.urbanistBold, fontSize: 15 }}>I agree to the Privacy Policy</Text>
              </View>
              <View style={styles.bottom}>
                <Button title="Login" onPress={validate} />
              </View>
            </View>
          </View>
        </RoundedScrollContainer>
        {/* </ScrollView> */}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: COLORS.red,
    paddingTop: 10
  },
  tinyLogo: {
    width: 200,
    height: 200,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: '20%',
  },
  bottom: {
    alignItems: "center",
    marginTop: 10,
  },
  label: {
    marginVertical: 5,
    fontSize: 14,
    color: COLORS.grey,
    marginLeft: 180,
    marginTop: 15,
  },
});

export default LoginScreenOdoo;
