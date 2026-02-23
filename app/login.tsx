import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import type { RelativePathString } from "expo-router";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const colors = useColors();
  const router = useRouter();
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      // Save token to secure storage
      if (data.token) {
        await SecureStore.setItemAsync("auth_token", data.token);
      }
      // Navigate to home screen
      router.replace("/(tabs)" as RelativePathString);
    },
    onError: (error) => {
      setError(error.message || "فشل تسجيل الدخول");
      setLoading(false);
    },
  });

  const handleLogin = async () => {
    if (!nationalId || !password) {
      setError("الرجاء إدخال الرقم الوطني وكلمة المرور");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await loginMutation.mutateAsync({
        nationalId,
        password,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء تسجيل الدخول");
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-8 items-center">
            <Text className="text-4xl font-bold text-foreground mb-2">نظام إدارة المدارس</Text>
            <Text className="text-base text-muted text-center">
              School Management System
            </Text>
          </View>

          {/* Login Form */}
          <View className="gap-4">
            {/* National ID Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">الرقم الوطني</Text>
              <TextInput
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-surface"
                placeholder="أدخل الرقم الوطني"
                placeholderTextColor={colors.muted}
                value={nationalId}
                onChangeText={setNationalId}
                editable={!loading}
                keyboardType="numeric"
              />
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">كلمة المرور</Text>
              <TextInput
                className="border border-border rounded-lg px-4 py-3 text-foreground bg-surface"
                placeholder="أدخل كلمة المرور"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            {/* Error Message */}
            {error ? (
              <View className="bg-error/10 border border-error rounded-lg px-4 py-3">
                <Text className="text-error text-sm">{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              className={cn(
                "rounded-lg px-4 py-3 items-center justify-center",
                loading ? "bg-primary/50" : "bg-primary"
              )}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">تسجيل الدخول</Text>
              )}
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row items-center justify-center gap-2 mt-4">
              <Text className="text-muted">ليس لديك حساب؟</Text>
              <TouchableOpacity onPress={() => router.replace("/signup" as RelativePathString)}>
                <Text className="text-primary font-semibold">إنشاء حساب جديد</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View className="mt-8 items-center">
            <Text className="text-xs text-muted">
              © 2026 نظام إدارة المدارس - جميع الحقوق محفوظة
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
