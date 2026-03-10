import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const colors = useColors();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, phone);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center gap-6">
          {/* Header */}
          <View className="items-center gap-2 mb-4">
            <Text
              className="text-3xl font-bold"
              style={{ color: colors.foreground }}
            >
              AcadêmicoSearch
            </Text>
            <Text className="text-sm" style={{ color: colors.muted }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Text>
          </View>

          {/* Form */}
          <View className="gap-4">
            {/* Email */}
            <View>
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                Email
              </Text>
              <TextInput
                className="border rounded-lg p-3"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                placeholder="your@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>

            {/* Password */}
            <View>
              <Text
                className="text-sm font-semibold mb-2"
                style={{ color: colors.foreground }}
              >
                Password
              </Text>
              <TextInput
                className="border rounded-lg p-3"
                style={{
                  borderColor: colors.border,
                  color: colors.foreground,
                  backgroundColor: colors.surface,
                }}
                placeholder="••••••••"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            {/* Phone (Register only) */}
            {!isLogin && (
              <View>
                <Text
                  className="text-sm font-semibold mb-2"
                  style={{ color: colors.foreground }}
                >
                  Phone (for password reset)
                </Text>
                <TextInput
                  className="border rounded-lg p-3"
                  style={{
                    borderColor: colors.border,
                    color: colors.foreground,
                    backgroundColor: colors.surface,
                  }}
                  placeholder="+1234567890"
                  placeholderTextColor={colors.muted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              className="rounded-lg p-4 items-center mt-4"
              style={{ backgroundColor: colors.primary }}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text
                  className="font-semibold text-base"
                  style={{ color: colors.background }}
                >
                  {isLogin ? "Login" : "Register"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Toggle */}
            <TouchableOpacity
              onPress={() => setIsLogin(!isLogin)}
              disabled={isLoading}
            >
              <Text
                className="text-center text-sm"
                style={{ color: colors.primary }}
              >
                {isLogin
                  ? "Don't have an account? Register"
                  : "Already have an account? Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
