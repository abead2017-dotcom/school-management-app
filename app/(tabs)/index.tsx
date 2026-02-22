import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "expo-router";
import type { RelativePathString } from "expo-router";
import { useEffect } from "react";

/**
 * Home Screen - School Management System
 * Displays user dashboard based on their role
 */
export default function HomeScreen() {
  const { user: authUser, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const user = authUser as any;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login" as RelativePathString);
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated || !authUser) {
    return (
      <ScreenContainer className="flex-1 items-center justify-center">
        <Text className="text-foreground">جاري التحميل...</Text>
      </ScreenContainer>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace("/login" as RelativePathString);
  };

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Welcome Header */}
          <View className="bg-primary rounded-lg p-6 gap-2">
            <Text className="text-2xl font-bold text-white">مرحباً {user.name}</Text>
            <Text className="text-white/80 text-sm">
              {user.role === "admin" && "لوحة تحكم المدير"}
              {user.role === "teacher" && "لوحة تحكم المعلم"}
              {user.role === "student" && "لوحة تحكم الطالب"}
              {user.role === "parent" && "لوحة تحكم ولي الأمر"}
            </Text>
          </View>

          {/* Quick Stats */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">ملخص سريع</Text>
            <View className="bg-surface rounded-lg p-4 border border-border">
              <Text className="text-foreground font-semibold mb-2">معلومات الحساب</Text>
              <Text className="text-muted text-sm mb-1">البريد الإلكتروني: {user.email || "غير محدد"}</Text>
              <Text className="text-muted text-sm">نوع الحساب: {user.role}</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View className="gap-3 mt-4">
            <TouchableOpacity className="bg-primary rounded-lg px-4 py-3 items-center">
              <Text className="text-white font-semibold">الذهاب إلى لوحة التحكم</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="bg-error/10 rounded-lg px-4 py-3 items-center border border-error"
              onPress={handleLogout}
            >
              <Text className="text-error font-semibold">تسجيل الخروج</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
