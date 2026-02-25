import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useRouter } from "expo-router";
import type { RelativePathString } from "expo-router";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const [formData, setFormData] = useState({
    nationalId: "12022724439",
    name: "عبيد عبد الله محمد عبيد",
    email: "abead2017@gmail.com ",
    phone: "0923972623",
    password: "@Obaid9275",
    confirmPassword: "@Obaid9275",
  });
   useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: (data: any) => {
      setSuccessMessage("تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول.");
      setFormData({
        nationalId: "",
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      setErrors({});
      setLoading(false);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.replace("/login" as RelativePathString);
      }, 2000);
    },
    },
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate National ID
    if (!formData.nationalId.trim()) {
      newErrors.nationalId = "الرقم الوطني مطلوب";
    } else if (!/^\d{10,}$/.test(formData.nationalId)) {
      newErrors.nationalId = "الرقم الوطني يجب أن يكون 10 أرقام على الأقل";
    }

    // Validate Name
    if (!formData.name.trim()) {
      newErrors.name = "الاسم مطلوب";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    // Validate Email
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = "البريد الإلكتروني غير صحيح";
      }
    }

    // Validate Phone
    if (formData.phone.trim()) {
      if (!/^\d{9,}$/.test(formData.phone)) {
        newErrors.phone = "رقم الهاتف يجب أن يكون 9 أرقام على الأقل";
      }
    }

    // Validate Password
    if (!formData.password) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else if (formData.password.length < 8) {
      newErrors.password = "كلمة المرور يجب أن تكون 8 أحرف على الأقل";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام";
    }

    // Validate Confirm Password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "كلمات المرور غير متطابقة";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 9;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSuccessMessage("");

    try {
      console.log("[SignUp] Submitting form data:", {
        nationalId: formData.nationalId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });
      await signupMutation.mutateAsync({
        nationalId: formData.nationalId,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        password: formData.password,
        role: "student", // Default role for new users
      });
    } 
    }
  };

  return (
    <ScreenContainer className="bg-background" edges={["top", "left", "right", "bottom"]}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="flex-1 justify-center px-6 py-8">
          {/* Header */}
          <View className="mb-6 items-center">
            <Text className="text-3xl font-bold text-foreground mb-2">إنشاء حساب جديد</Text>
            <Text className="text-base text-muted text-center">
              قم بملء البيانات أدناه لإنشاء حسابك
            </Text>
          </View>

          {/* Success Message */}
          {successMessage ? (
            <View className="bg-success/10 border border-success rounded-lg px-4 py-3 mb-4">
              <Text className="text-success text-sm">{successMessage}</Text>
            </View>
          ) : null}

          {/* Form */}
          <View className="gap-4">
            {/* National ID Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">الرقم الوطني *</Text>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-foreground bg-surface",
                  errors.nationalId ? "border-error" : "border-border"
                )}
                placeholder="أدخل الرقم الوطني"
                placeholderTextColor={colors.muted}
                value={formData.nationalId}
                onChangeText={(text) => setFormData({ ...formData, nationalId: text })}
                editable={!loading}
                keyboardType="numeric"
              />
              {errors.nationalId ? (
                <Text className="text-error text-xs mt-1">{errors.nationalId}</Text>
              ) : null}
            </View>

            {/* Name Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">الاسم الكامل *</Text>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-foreground bg-surface",
                  errors.name ? "border-error" : "border-border"
                )}
                placeholder="أدخل الاسم الكامل"
                placeholderTextColor={colors.muted}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                editable={!loading}
              />
              {errors.name ? (
                <Text className="text-error text-xs mt-1">{errors.name}</Text>
              ) : null}
            </View>

            {/* Email Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">البريد الإلكتروني</Text>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-foreground bg-surface",
                  errors.email ? "border-error" : "border-border"
                )}
                placeholder="أدخل البريد الإلكتروني (اختياري)"
                placeholderTextColor={colors.muted}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                editable={!loading}
                keyboardType="email-address"
              />
              {errors.email ? (
                <Text className="text-error text-xs mt-1">{errors.email}</Text>
              ) : null}
            </View>

            {/* Phone Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">رقم الهاتف</Text>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-foreground bg-surface",
                  errors.phone ? "border-error" : "border-border"
                )}
                placeholder="أدخل رقم الهاتف (اختياري)"
                placeholderTextColor={colors.muted}
                value={formData.phone}
                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                editable={!loading}
                keyboardType="phone-pad"
              />
              {errors.phone ? (
                <Text className="text-error text-xs mt-1">{errors.phone}</Text>
              ) : null}
            </View>

            {/* Password Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">كلمة المرور *</Text>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-foreground bg-surface",
                  errors.password ? "border-error" : "border-border"
                )}
                placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                placeholderTextColor={colors.muted}
                value={formData.password}
                onChangeText={(text) => setFormData({ ...formData, password: text })}
                secureTextEntry
                editable={!loading}
              />
              {errors.password ? (
                <Text className="text-error text-xs mt-1">{errors.password}</Text>
              ) : null}
            </View>

            {/* Confirm Password Input */}
            <View>
              <Text className="text-sm font-semibold text-foreground mb-2">تأكيد كلمة المرور *</Text>
              <TextInput
                className={cn(
                  "border rounded-lg px-4 py-3 text-foreground bg-surface",
                  errors.confirmPassword ? "border-error" : "border-border"
                )}
                placeholder="أعد إدخال كلمة المرور"
                placeholderTextColor={colors.muted}
                value={formData.confirmPassword}
                onChangeText={(text) => setFormData({ ...formData, confirmPassword: text })}
                secureTextEntry
                editable={!loading}
              />
              {errors.confirmPassword ? (
                <Text className="text-error text-xs mt-1">{errors.confirmPassword}</Text>
              ) : null}
            </View>

            {/* Submit Error */}
            {errors.submit ? (
              <View className="bg-error/10 border border-error rounded-lg px-4 py-3">
                <Text className="text-error text-sm">{errors.submit}</Text>
              </View>
            ) : null}

            {/* Sign Up Button */}
            <TouchableOpacity
              className={cn(
                "rounded-lg px-4 py-3 items-center justify-center mt-2",
                loading ? "bg-primary/50" : "bg-primary"
              )}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-base">إنشاء الحساب</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View className="flex-row items-center justify-center gap-2 mt-4">
              <Text className="text-muted">هل لديك حساب بالفعل؟</Text>
              <TouchableOpacity onPress={() => router.replace("/login" as RelativePathString)}>
                <Text className="text-primary font-semibold">تسجيل الدخول</Text>
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
