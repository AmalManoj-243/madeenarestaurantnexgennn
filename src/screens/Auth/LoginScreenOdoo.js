// src/screens/Auth/LoginScreenOdoo.js
import React, { useState } from "react";
import {
  View,
  Keyboard,
  StyleSheet,
  Image,
  TouchableWithoutFeedback,
  Switch,
} from "react-native";
import { COLORS, FONT_FAMILY } from "@constants/theme";
import { LogBox } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button } from "@components/common/Button";
import { OverlayLoader } from "@components/Loader";
import axios from "axios";
// Removed expo-cookie import
import { post } from "@api/services/utils";
import { useNavigation } from "@react-navigation/native";
import Text from "@components/Text";
import { TextInput } from "@components/common/TextInput";
import { RoundedScrollContainer, SafeAreaView } from "@components/containers";
import { useAuthStore } from "@stores/auth";
import { showToastMessage } from "@components/Toast";
// ...existing code...

import API_BASE_URL from "@api/config";
import ODOO_DEFAULTS, { DEFAULT_ODOO_BASE_URL, DEFAULT_ODOO_DB, DEV_ODOO_USERNAME, DEV_ODOO_PASSWORD } from "@api/config/odooConfig";

LogBox.ignoreLogs(["new NativeEventEmitter"]);
LogBox.ignoreAllLogs();

// 🔍 Check if URL looks like an Odoo server (accepts ngrok, http(s) hosts, or typical Odoo paths)
const isOdooUrl = (url = "") => {
  const lower = url.toLowerCase();
  // Accept explicit protocols, ngrok hosts, or typical odoo paths
  return (
    lower.startsWith('http') ||
    lower.includes('ngrok') ||
    lower.includes('odoo') ||
    lower.includes('/web') ||
    lower.includes(':8069')
  );
};

const LoginScreenOdoo = () => {
  const navigation = useNavigation();
  const setUser = useAuthStore((state) => state.login);
  // ...existing code...

  const { container, imageContainer } = styles;

  LogBox.ignoreLogs([
    "Non-serializable values were found in the navigation state",
  ]);

  const [inputs, setInputs] = useState({
    baseUrl: "", // ✅ NEW: Server URL (optional)
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [useDevAutofill, setUseDevAutofill] = useState(false);

  // Use configured Odoo base URL for dev autofill; credentials imported from config
  const DEV_ODOO_BASE_URL = DEFAULT_ODOO_BASE_URL || 'http://192.168.29.43:8069/';

  const handleOnchange = (text, input) => {
    setInputs((prevState) => ({ ...prevState, [input]: text }));
  };

  const handleError = (error, input) => {
    setErrors((prevState) => ({ ...prevState, [input]: error }));
  };

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
    // ...existing code...

    if (isValid) {
      login();
    }
  };

  const login = async () => {
    setLoading(true);
    try {
      const baseUrlRaw = inputs.baseUrl || "";
      const baseUrl = baseUrlRaw.trim();
      const username = inputs.username;
      const password = inputs.password;

      const useOdoo = baseUrl && isOdooUrl(baseUrl);

      if (useOdoo) {
        // ODOO CUSTOMER LOGIN
        const normalized = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;
        const finalOdooUrl = (normalized.replace(/\/+$/, "") || DEFAULT_ODOO_BASE_URL);
        const dbNameUsed = inputs.db && inputs.db.trim() ? inputs.db.trim() : DEFAULT_ODOO_DB;
        const response = await axios.post(
          `${finalOdooUrl}/web/session/authenticate`,
          {
            jsonrpc: "2.0",
            method: "call",
            params: {
              db: dbNameUsed,
              login: username,
              password: password,
            },
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (response.data.result && response.data.result.uid) {
          const userData = response.data.result;
          // persist selected/used DB for future calls
          try { await AsyncStorage.setItem('odoo_db', dbNameUsed); } catch (e) {}
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
          const setCookieHeader = response.headers["set-cookie"];
          if (setCookieHeader && setCookieHeader.includes('session_id=')) {
            const sessionId = setCookieHeader.split('session_id=')[1]?.split(';')[0];
            await AsyncStorage.setItem('odoo_session_id', sessionId);
          }
          // Log the DB name stored in AsyncStorage
          const dbNameStored = await AsyncStorage.getItem('odoo_db');
          setUser(userData);
          navigation.navigate("AppNavigator");
        } else {
          showToastMessage("Invalid Odoo credentials");
        }
      } else {
        // UAE ADMIN LOGIN
        const response = await post("/viewuser/login", {
          user_name: username,
          password: password,
        });
        if (response && response.success === true && response.data?.length) {
          const userData = response.data[0];
          await AsyncStorage.setItem("userData", JSON.stringify(userData));
          setUser(userData);
          navigation.navigate("AppNavigator");
        } else {
          showToastMessage("Invalid admin credentials");
        }
      }
    } catch (error) {
      showToastMessage(`Error! ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
      <SafeAreaView style={container}>
        <OverlayLoader visible={loading} />

        <RoundedScrollContainer
          backgroundColor={COLORS.white}
          paddingHorizontal={15}
          borderTopLeftRadius={40}
          borderTopRightRadius={40}
        >
          <View style={{ paddingTop: 50 }}>
            {/* Logo above login */}
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Image
                source={require('@assets/images/logo2.png')}
                style={{ width: 400, height: 400, resizeMode: 'contain' }}
              />
            </View>
            <View style={{ marginVertical: 5, marginHorizontal: 10 }}>
              <View style={{ marginTop: 0, marginBottom: 15 }}>
                {/* Only show Login heading, remove all hint/info texts above */}
                <Text
                  style={{
                    fontSize: 25,
                    fontFamily: FONT_FAMILY.urbanistBold,
                    color: "#2e2a4f",
                    textAlign: "center",
                  }}
                >
                  Login
                </Text>
              </View>

              {/* Server URL (optional) */}
              <TextInput
                onChangeText={(text) => handleOnchange(text, "baseUrl")}
                onFocus={() => handleError(null, "baseUrl")}
                label="Server URL (optional)"
                placeholder="https://486b3e7391ee.ngrok-free.app"
                value={inputs.baseUrl}
                column={true}
                login={true}
              />

              {/* DB input removed - app uses default DB from config if not provided */}

              {/* Username */}
              <TextInput
                onChangeText={(text) => handleOnchange(text, "username")}
                onFocus={() => handleError(null, "username")}
                iconName="account-outline"
                label="Username or Email"
                placeholder="Enter Username or Email"
                error={errors.username}
                value={inputs.username}
                column={true}
                login={true}
              />

              {/* Password */}
              <TextInput
                onChangeText={(text) => handleOnchange(text, "password")}
                onFocus={() => handleError(null, "password")}
                error={errors.password}
                iconName="lock-outline"
                label="Password"
                placeholder="Enter password"
                password
                value={inputs.password}
                column={true}
                login={true}
              />

              {/* ...existing code... */}

              {/* Autofill dev creds checkbox (placed just above Login button) */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <Switch value={useDevAutofill} onValueChange={(v) => {
                  setUseDevAutofill(v);
                  if (v) {
                    setInputs(prev => ({ ...prev, baseUrl: DEV_ODOO_BASE_URL, username: DEV_ODOO_USERNAME, password: DEV_ODOO_PASSWORD }));
                  } else {
                    setInputs(prev => ({ ...prev, baseUrl: '', username: '', password: '' }));
                  }
                }} />
                <Text style={{ marginLeft: 8, color: COLORS.grey }}>Autofill dev credentials</Text>
              </View>

              {/* Login Button */}
              <View style={styles.bottom}>
                <Button title="Login" onPress={validate} />
              </View>
            </View>
          </View>
        </RoundedScrollContainer>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  tinyLogo: {
    width: 200,
    height: 200,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: "20%",
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
