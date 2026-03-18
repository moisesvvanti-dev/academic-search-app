import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/lib/auth-context";
import { useColors } from "@/hooks/use-colors";
import { startOAuthLogin } from "@/constants/oauth";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown, ZoomIn, FadeInUp } from "react-native-reanimated";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  const colors = useColors();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setIsLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha na autenticação.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await startOAuthLogin();
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha no login com Google.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer scrollable={false}>
      <View className="flex-1 justify-center px-6 py-10">
        
        {/* Header Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} className="items-center mb-10">
          <View 
            className="w-28 h-28 rounded-[35px] items-center justify-center mb-8 shadow-2xl glass-extreme border-2"
            style={{ 
              borderColor: colors.primary + '40',
              shadowColor: colors.primary,
              shadowRadius: 30,
              shadowOpacity: 0.4,
            }}
          >
            <View className="p-4 rounded-3xl bg-primary/20" style={{ backgroundColor: colors.primary + '20' }}>
              <Ionicons name="finger-print" size={56} color={colors.primary} />
            </View>
          </View>
          <Text className="text-5xl font-black tracking-tighter text-center" style={{ color: colors.foreground }}>
            Nexus<Text style={{ color: colors.primary }}>Search</Text>
          </Text>
          <Text className="text-sm font-bold mt-3 text-center uppercase tracking-[4px]" style={{ color: colors.muted }}>
            Secured Access Portal
          </Text>
        </Animated.View>

        {/* Auth Form Card - Extreme Glassmorphism */}
        <Animated.View 
          entering={ZoomIn.delay(400).duration(800)}
          className="p-10 rounded-[50px] glass-extreme border-2 shadow-2xl" 
          style={{ borderColor: colors.primary + '30' }}
        >
          
          <Text className="text-2xl font-black mb-10 text-center tracking-tight" style={{ color: colors.foreground }}>
            {isLogin ? "Acessar Sistema" : "Criar Identidade"}
          </Text>

          <View className="gap-6">
            {/* Email Input */}
            <View>
              <Text className="text-[10px] font-black uppercase tracking-[2px] mx-4 mb-2" style={{ color: colors.primary }}>
                Nexus Identification (Email)
              </Text>
              <View 
                className="flex-row items-center border-2 rounded-3xl px-6 py-4"
                style={{ borderColor: colors.border, backgroundColor: colors.surface + '60' }}
              >
                <Ionicons name="mail-outline" size={20} color={colors.primary} className="opacity-80" />
                <TextInput
                  className="flex-1 pl-4 text-base font-bold"
                  style={{ color: colors.foreground }}
                  placeholder="user@nexus.io"
                  placeholderTextColor={colors.muted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-[10px] font-black uppercase tracking-[2px] mx-4 mb-2" style={{ color: colors.primary }}>
                Encrypted Key (Password)
              </Text>
              <View 
                className="flex-row items-center border-2 rounded-3xl px-6 py-4"
                style={{ borderColor: colors.border, backgroundColor: colors.surface + '60' }}
              >
                <Ionicons name="lock-closed-outline" size={20} color={colors.primary} className="opacity-80" />
                <TextInput
                  className="flex-1 pl-4 text-base font-bold"
                  style={{ color: colors.foreground }}
                  placeholder="••••••••"
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className="rounded-full p-6 items-center justify-center mt-6 shadow-2xl flex-row gap-3"
              style={{ 
                backgroundColor: colors.accent,
                shadowColor: colors.accent,
                shadowOpacity: 0.5,
                shadowRadius: 15,
                shadowOffset: { width: 0, height: 10 },
              }}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text className="font-black text-lg text-white uppercase tracking-widest">
                    {isLogin ? "Acessar" : "Vincular"}
                  </Text>
                  <Ionicons name="shield-checkmark" size={28} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center gap-4 my-4">
              <View className="flex-1 h-[2px] rounded-full opacity-20" style={{ backgroundColor: colors.muted }} />
              <Text className="text-[10px] font-black uppercase tracking-[3px]" style={{ color: colors.muted }}>Sincronização</Text>
              <View className="flex-1 h-[2px] rounded-full opacity-20" style={{ backgroundColor: colors.muted }} />
            </View>

            {/* Google OAuth Button */}
            <TouchableOpacity
              className="rounded-[28px] p-5 items-center flex-row justify-center gap-4 border-2 shadow-md"
              style={{ borderColor: colors.border, backgroundColor: colors.surface }}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color={colors.foreground} />
              <Text className="font-black text-sm uppercase tracking-widest" style={{ color: colors.foreground }}>
                Google Workspace
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Footer Toggle */}
        <Animated.View entering={FadeInUp.delay(600)} className="items-center">
          <TouchableOpacity
            className="mt-10 p-4"
            onPress={() => setIsLogin(!isLogin)}
            disabled={isLoading}
          >
            <Text className="text-sm font-bold tracking-tight" style={{ color: colors.muted }}>
              {isLogin ? "Não possui credenciais? " : "Já faz parte da rede? "}
              <Text className="font-black" style={{ color: colors.primary }}>
                {isLogin ? "Solicitar Acesso" : "Autenticar-se"}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Powered by Firebase Badge */}
          <View className="flex-row items-center gap-3 mt-6 p-4 rounded-2xl glass-extreme-dark border" style={{ borderColor: colors.success + '30' }}>
            <Ionicons name="shield-half" size={16} color={colors.success} />
            <Text className="text-[10px] font-black uppercase tracking-[2px]" style={{ color: colors.success }}>
              Firebase Security Enabled
            </Text>
          </View>
        </Animated.View>

      </View>
    </ScreenContainer>
  );
}
