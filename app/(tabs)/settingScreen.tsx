import {
  deleteMyAccount,
  deleteTryonImage,
  getTryonImage,
  uploadTryonImage,
} from "@/components/api/userApi";
import DeleteAccountButton from "@/components/deleteAccountButton";
import ScreenHelpButton from "@/components/screenHelpButton";
import { createTypography } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useFontScale } from "@/context/FontScaleContext";
import { FASTAPI_URL } from "@/IP_Config";
import { authFetch } from "@/supabase/tokenBasedAuth";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type UserSubcategory = {
  id: number;
  name: string;
  category_id: number;
  category_name: string;
  item_count: number;
};

export default function SettingsScreen() {
  const { scale, updateScale } = useFontScale();
  const { logout, user } = useAuth();
  const Typography = createTypography(scale);

  const [subcategories, setSubcategories] = useState<UserSubcategory[]>([]);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);

  // Current signed URL for preview
  const [tryOnImageUrl, setTryOnImageUrl] = useState<string | null>(null);

  // Loading when screen fetches current image
  const [loadingTryOnImage, setLoadingTryOnImage] = useState(false);

  // Loading when upload or delete is happening
  const [uploadingTryOnImage, setUploadingTryOnImage] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  //consent modal
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [deleteAccountModalOpen, setDeleteAccountModalOpen] = useState(false);


  const Option = ({
    label,
    value,
  }: {
    label: string;
    value: number;
  }) => {
    const isSelected = scale === value;
    return (
      <TouchableOpacity
        onPress={() => updateScale(value)}
        className={`w-full border py-4 px-5 mb-3 ${isSelected ? "border-black bg-black" : "border-[#E6E6E6] bg-white"}`}
        style={{ borderRadius: 4 }}
      >
        <Text
          className={`tracking-[0.3px] ${isSelected ? "text-white" : "text-black"}`}
          style={{ fontSize: Typography.body.fontSize }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Load all custom subcategories
  const fetchAllUserSubcategories = async () => {
    try {
      setLoadingSubs(true);

      const res = await authFetch(
        `${FASTAPI_URL}/subcategories/all?user_id=${user.id}`
      );
      const data = await res.json() as { subcategories?: UserSubcategory[] };

      if (!res.ok) {
        console.log("Load subcategories failed:", data);
        setSubcategories([]);
        return;
      }

      setSubcategories(data.subcategories ?? []);
    } catch (e) {
      console.log("Load subcategories request failed:", e);
      setSubcategories([]);
    } finally {
      setLoadingSubs(false);
    }
  };

  // Load current try-on image from backend
  const fetchTryOnImage = async () => {
    try {
      setLoadingTryOnImage(true);

      const data = await getTryonImage(user.id) as { tryon_image_url?: string };
      setTryOnImageUrl(data.tryon_image_url ?? null);
    } catch (error) {
      console.log("Load try-on image failed:", error);
      setTryOnImageUrl(null);
    } finally {
      setLoadingTryOnImage(false);
    }
  };

  // Delete custom subcategory
  const deleteSubcategory = async (subcategoryId: number) => {
    try {
      const res = await authFetch(
        `${FASTAPI_URL}/subcategories/${subcategoryId}?user_id=${user.id}`,
        { method: "DELETE" }
      );

      const data = await res.json() as { detail?: string };

      if (!res.ok) {
        Alert.alert(
          "Cannot delete subcategory",
          data.detail || "Move the items in this subcategory first."
        );
        return;
      }

      await fetchAllUserSubcategories();
    } catch (e) {
      console.log("Delete subcategory request failed:", e);
    }
  };

  // Open gallery and upload selected image
  const handleUploadTryOnPhoto = async () => {
  try {
    console.log("Starting try-on image upload flow");

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to upload your try-on image."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      quality: 1,
    });

    if (result.canceled || !result.assets?.length) return;

    const selectedUri = result.assets[0].uri;
    if (!selectedUri) {
      Alert.alert("Selection Failed", "Could not load the selected image. Please try again.");
      return;
    }

    setUploadingTryOnImage(true);

    const data = await uploadTryonImage(user.id, selectedUri) as { tryon_image_url?: string };

    setTryOnImageUrl(data.tryon_image_url ?? null);

    Alert.alert("Success", "Try-on image uploaded.");
  } catch (error) {
    Alert.alert("Error", "Could not upload try-on image.");
  } finally {
    setUploadingTryOnImage(false);
  }
};

  // Remove current try-on image
  const handleRemoveTryOnPhoto = async () => {
    try {
      if (!tryOnImageUrl) {
        Alert.alert("No photo", "There is no try-on photo to remove.");
        return;
      }

      setUploadingTryOnImage(true);

      await deleteTryonImage(user.id);

      setTryOnImageUrl(null);

      Alert.alert("Removed", "Try-on image removed.");
    } catch (error) {
      Alert.alert("Error", "Could not remove try-on image.");
    } finally {
      setUploadingTryOnImage(false);
    }
  };

    const openTryOnConsentModal = () => {
    if (uploadingTryOnImage) return;
    setConsentModalOpen(true);
  };

    const handleDeleteAccount = () => {
      if (deletingAccount) return;
      setDeleteAccountModalOpen(true);
    };

    const confirmDeleteAccount = async () => {
      try {
        setDeletingAccount(true);
        await deleteMyAccount();
        setDeleteAccountModalOpen(false);
        await logout();
      } catch (error) {
        console.log("Delete account failed:", error);
        Alert.alert("Error", "Could not delete your account.");
      } finally {
        setDeletingAccount(false);
      }
    };


  // Refresh settings data when screen opens
  useFocusEffect(
    useCallback(() => {
      fetchAllUserSubcategories();
      fetchTryOnImage();
    }, [user.id])
  );

  // Group subcategories by category name
  const groupedSubcategories = useMemo(() => {
    const groups: Record<string, UserSubcategory[]> = {};

    for (const sub of subcategories) {
      if (!groups[sub.category_name]) {
        groups[sub.category_name] = [];
      }
      groups[sub.category_name].push(sub);
    }

    return groups;
  }, [subcategories]);

  return (
    <View className="flex-1 bg-white">
      {/* HEADER + TITLE */}
      <View className="px-4 pb-2 mt-12 flex-row justify-between items-center">
        <View>
          <Text
            className="tracking-[2.5px] text-[#444444]"
            style={{ fontSize: Typography.body.fontSize * 0.95 }}
          >
            APP
          </Text>

          <Text
            className="tracking-[0.3px] text-black"
            style={{ fontSize: Typography.header.fontSize * 1.2 }}
          >
            SETTINGS
          </Text>
        </View>

        <View className="flex-row items-center space-x-4">
          <ScreenHelpButton
            title="Settings"
            subtitle="Use this screen to adjust how the app behaves for you."
            items={[
              "Update saved app preferences and profile-related choices here.",
              "Manage try-on photo and subcategories used for organizing your wardrobe.",
              "Deleting your account will remove all your data.",
              "Use logout when you want to leave the current account.",
            ]}
          />

          <Pressable className="mx-3" onPress={logout}>
            <MaterialIcons name="logout" size={24} color="black" />
          </Pressable>
        </View>
      </View>

      <View className="h-[1px] bg-[#E6E6E6]" />

      <ScrollView
        className="flex-1 px-4 mt-6"
        showsVerticalScrollIndicator={false}
      >
        {/* PROFILE */}
        <Text
          className="mb-3 tracking-[1.5px] text-[#6E6E6E]"
          style={{ fontSize: Typography.body.fontSize * 0.85 }}
        >
          PROFILE
        </Text>

        <View
          className="w-full border border-[#E6E6E6] bg-white px-5 py-5 mb-4"
          style={{ borderRadius: 4 }}
        >
          <Text
            className="mb-[14px] text-black"
            style={{ fontSize: Typography.body.fontSize }}
          >
            Try-On Photo
          </Text>

          {/* Show loader while current image is loading */}
          {loadingTryOnImage ? (
            <View
              className="w-full items-center justify-center border border-[#E6E6E6] bg-[#FAFAFA] mb-4"
              style={{
                height: 260,
                borderRadius: 4,
              }}
            >
              <ActivityIndicator />
            </View>
          ) : tryOnImageUrl ? (
            // Show real image if backend returned one
            <Image
              source={{ uri: tryOnImageUrl }}
              style={{
                width: "100%",
                height: 250,
                borderRadius: 4,
                marginBottom: 14,
                backgroundColor: "#F3F3F3",
              }}
              resizeMode="contain"
            />
          ) : (
            // Placeholder if user has no image yet
           <Image
              source={require("@/assets/images/sihoutte.jpg")}
              style={{
                width: "100%",
                height: 260,
                borderRadius: 4,
                marginBottom: 14,
              }}
              resizeMode="contain"
            />
          )}

          <Text
            className="mb-4 text-[#6E6E6E]"
            style={{
              fontSize: Typography.body.fontSize * 0.82,
              lineHeight: Typography.body.fontSize * 1.35,
            }}
          >
            Upload an optional body photo for virtual try-on. If none is added,
            WardorAI can use a default avatar for now.
          </Text>

          {/* Upload button */}
          <TouchableOpacity
              onPress={openTryOnConsentModal}
              disabled={uploadingTryOnImage}
              className="w-full bg-black py-4 px-5 mb-3"
              style={{
                borderRadius: 4,
                opacity: uploadingTryOnImage ? 0.6 : 1,
              }}
            >
              <Text
                className="text-center tracking-[0.5px] text-white"
                style={{ fontSize: Typography.body.fontSize }}
              >
                {uploadingTryOnImage ? "Uploading..." : "Upload Photo"}
              </Text>
            </TouchableOpacity>

          {/* Remove button */}
          <TouchableOpacity
            onPress={handleRemoveTryOnPhoto}
            disabled={!tryOnImageUrl || uploadingTryOnImage}
            className="w-full border border-[#E6E6E6] bg-white py-4 px-5"
            style={{
              borderRadius: 4,
              opacity: !tryOnImageUrl || uploadingTryOnImage ? 0.45 : 1,
            }}
          >
            <Text
              className="text-center tracking-[0.5px] text-black"
              style={{ fontSize: Typography.body.fontSize }}
            >
              Remove Photo
            </Text>
          </TouchableOpacity>
        </View>

        {/* CONSENT MODAL */}
        <Modal
            visible={consentModalOpen}
            transparent
            animationType="none"
            onRequestClose={() => setConsentModalOpen(false)}
          >
            <View
              className="flex-1 items-center justify-center px-6"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              <View
                className="w-full bg-white px-5 py-5"
                style={{ borderRadius: 8, maxWidth: 420 }}
              >
                <Text
                  className="mb-3 text-black"
                  style={{ fontSize: Typography.body.fontSize * 1.02 }}
                >
                  Before you upload
                </Text>

                <Text
                  className="mb-[10px] text-[#444444]"
                  style={{
                    fontSize: Typography.body.fontSize * 0.86,
                    lineHeight: Typography.body.fontSize * 1.45,
                  }}
                >
                  Please upload a clear full-body or near full-body photo with a simple
                  background for the best virtual try-on result.
                </Text>

                <Text
                  className="mb-[10px] text-[#444444]"
                  style={{
                    fontSize: Typography.body.fontSize * 0.86,
                    lineHeight: Typography.body.fontSize * 1.45,
                  }}
                >
                  Do not upload nude or intimate images. Choose a photo where your body
                  shape is visible and clothing lines are easy to detect.
                </Text>

                <Text
                  className="mb-[18px] text-[#444444]"
                  style={{
                    fontSize: Typography.body.fontSize * 0.86,
                    lineHeight: Typography.body.fontSize * 1.45,
                  }}
                >
                  By continuing, you confirm that you understand these guidelines.
                </Text>

                <TouchableOpacity
                  onPress={() => {
                      setConsentModalOpen(false);
                      // Wait for modal dismiss animation before opening picker
                        setTimeout(() => {
                          handleUploadTryOnPhoto();
                        }, 300);
                    }}
                  className="w-full bg-black py-4 px-5 mb-3"
                  style={{ borderRadius: 4 }}
                >
                  <Text
                    className="text-center tracking-[0.5px] text-white"
                    style={{ fontSize: Typography.body.fontSize }}
                  >
                    I Understand, Continue
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setConsentModalOpen(false)}
                  className="w-full border border-[#E6E6E6] bg-white py-4 px-5"
                  style={{ borderRadius: 4 }}
                >
                  <Text
                    className="text-center tracking-[0.5px] text-black"
                    style={{ fontSize: Typography.body.fontSize }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


        {/* TEXT SIZE */}
        <Text
          className="mb-3 tracking-[1.5px] text-[#6E6E6E]"
          style={{ fontSize: Typography.body.fontSize * 0.85 }}
        >
          TEXT SIZE
        </Text>

        <Option label="Small" value={3} />
        <Option label="Medium" value={4} />
        <Option label="Large" value={5} />

        {/* WARDROBE */}
        <Text
          className="mb-3 mt-5 tracking-[1.5px] text-[#6E6E6E]"
          style={{ fontSize: Typography.body.fontSize * 0.85 }}
        >
          WARDROBE
        </Text>

        <TouchableOpacity
          onPress={() => setSubModalOpen(true)}
          className="w-full border border-[#E6E6E6] bg-white py-4 px-5 mb-3 flex-row items-center justify-between"
          style={{ borderRadius: 4 }}
        >
          <View className="flex-1 pr-3">
            <Text className="text-black" style={{ fontSize: Typography.body.fontSize }}>
              Manage subcategories
            </Text>
            <Text
              className="mt-1 text-[#6E6E6E]"
              style={{ fontSize: Typography.body.fontSize * 0.82 }}
            >
              Delete custom subcategories you no longer need
            </Text>
          </View>

          <MaterialIcons name="chevron-right" size={22} color="black" />
        </TouchableOpacity>

        <Text
          className="mb-3 mt-5 tracking-[1.5px] text-[#6E6E6E]"
          style={{ fontSize: Typography.body.fontSize * 0.85 }}
        >
          ACCOUNT
        </Text>

        <DeleteAccountButton
          onPress={handleDeleteAccount}
          disabled={deletingAccount}
          loading={deletingAccount}
          className="mb-8"
          textStyle={[
            Typography.body,
            {
              letterSpacing: 0.5,
            },
          ]}
        />
      </ScrollView>

      {/* SUBCATEGORY MODAL */}
      <Modal visible={subModalOpen} animationType="slide">
        <View className="flex-1 bg-white pt-12">
          <View className="flex-row justify-between items-center px-4 pb-3 mt-3">
              <Text className="uppercase tracking-[0.6px] text-black" style={{ fontSize: Typography.section.fontSize }}>
              Manage Subcategories
            </Text>

            <Pressable onPress={() => setSubModalOpen(false)}>
                <Text className="text-black" style={{ fontSize: Typography.body.fontSize }}>Close</Text>
            </Pressable>
          </View>

          <View className="h-[1px] bg-[#E6E6E6]" />

          <ScrollView className="flex-1 px-4 pt-4">
            {loadingSubs ? (
              <View className="py-6 items-center">
                <ActivityIndicator />
              </View>
            ) : subcategories.length === 0 ? (
              <Text className="text-[#6E6E6E]" style={{ fontSize: Typography.body.fontSize }}>
                No custom subcategories yet.
              </Text>
            ) : (
              Object.entries(groupedSubcategories).map(([categoryName, subs]) => (
                <View key={categoryName} className="mb-6">
                  <Text
                    className="mb-[10px] tracking-[1.5px] text-[#6E6E6E]"
                    style={{ fontSize: Typography.body.fontSize * 0.85 }}
                  >
                    {categoryName.toUpperCase()}
                  </Text>

                  {subs.map((sub) => (
                    <View
                      key={sub.id}
                      className="border border-[#E6E6E6] bg-white px-4 py-4 mb-3 flex-row items-center justify-between"
                      style={{ borderRadius: 4 }}
                    >
                      <View className="flex-1 pr-3">
                        <Text className="text-black" style={{ fontSize: Typography.body.fontSize }}>
                          {sub.name}
                        </Text>

                        <Text
                          className="mt-1 text-[#6E6E6E]"
                          style={{ fontSize: Typography.body.fontSize * 0.82 }}
                        >
                          {sub.item_count} item{sub.item_count === 1 ? "" : "s"}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => {
                          if (sub.item_count > 0) {
                            Alert.alert(
                              "Cannot delete",
                              `This subcategory contains ${sub.item_count} item(s). Move them before deleting.`
                            );
                            return;
                          }

                          Alert.alert(
                            "Delete subcategory",
                            `Delete "${sub.name}"?`,
                            [
                              { text: "Cancel", style: "cancel" },
                              {
                                text: "Delete",
                                style: "destructive",
                                onPress: () => deleteSubcategory(sub.id),
                              },
                            ]
                          );
                        }}
                        className="border border-black px-3 py-2"
                        style={{ borderRadius: 4 }}
                      >
                        <Text
                          className="tracking-[1px] text-black"
                          style={{ fontSize: Typography.body.fontSize * 0.8 }}
                        >
                          DELETE
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={deleteAccountModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!deletingAccount) {
            setDeleteAccountModalOpen(false);
          }
        }}
      >
        <View className="flex-1 items-center justify-center px-6 bg-black/40">
          <View
            className="w-full bg-white px-5 py-5"
            style={{ borderRadius: 8, maxWidth: 420 }}
          >
            <Text
              className="mb-3 text-center uppercase tracking-[0.6px] text-black"
              style={{ fontSize: Typography.section.fontSize }}
            >
              Are you sure?
            </Text>

            <Text
              className="mb-[18px] text-center text-[#444444]"
              style={{
                fontSize: Typography.body.fontSize * 0.86,
                lineHeight: Typography.body.fontSize * 1.45,
              }}
            >
              Do you want to permanently delete your account? This action cannot be undone.
            </Text>

            <DeleteAccountButton
              onPress={confirmDeleteAccount}
              disabled={deletingAccount}
              loading={deletingAccount}
              label="Yes, delete my account"
              variant="filled"
              className="mb-3"
              textStyle={[
                Typography.body,
                {
                  letterSpacing: 0.5,
                },
              ]}
            />

            <TouchableOpacity
              onPress={() => setDeleteAccountModalOpen(false)}
              disabled={deletingAccount}
              className="w-full border border-[#E6E6E6] bg-white py-4 px-5"
              style={{
                borderRadius: 4,
                opacity: deletingAccount ? 0.6 : 1,
              }}
            >
              <Text
                className="text-center tracking-[0.5px] text-black"
                style={{ fontSize: Typography.body.fontSize }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}