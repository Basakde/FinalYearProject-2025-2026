import { useAuth } from "@/context/AuthContext";
import { FASTAPI_URL } from "@/IP_Config";
import React, { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

export type OccasionOption = { master_id: string; name: string };

export default function OccasionSelectorCompact({
  value,
  onChange,
}: {
  value: OccasionOption | null;
  onChange: (v: OccasionOption | null) => void;
}) {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<OccasionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<OccasionOption | null>(value);

  const label = useMemo(() => (value ? value.name : "ANY"), [value]);

  const fetchOccasions = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`${FASTAPI_URL}/attributes/occasions/options/user/${user.id}`);
      if (!res.ok) {
        console.log("Occasions fetch failed:", await res.text());
        return;
      }
      const data = await res.json();
      console.log("Fetched occasions:", data);
      const list = (data.options ?? data) as any[];

      const mapped: OccasionOption[] = list.map((o) => ({
        name: o.name,
        // if it's a user-added one -> mapped_to.id exists
        // if it's master -> id itself is master id
        master_id: o.mapped_to?.id ?? o.id,
      }));
      setOptions(mapped);
    } catch (e) {
      console.log("Occasions fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  const openModal = async () => {
    setDraft(value);
    setOpen(true);
    if (options.length === 0) await fetchOccasions();
  };

  return (
    <>
      {/* Compact filter button (fits header row) */}
      <Pressable
        onPress={openModal}
        className="border border-[#E6E6E6] bg-white px-3 py-3 mr-2"
        style={{ borderRadius: 4 }}
      >
        <Text className="text-[11px] tracking-[1.5px] text-black">
          {label.toUpperCase()}
        </Text>
      </Pressable>

      {/* Modal */}
      <Modal visible={open} transparent animationType="fade">
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)" }}
        />

        <View
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "white",
            padding: 16,
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
        >
          <Text style={{ fontSize: 12, letterSpacing: 2, marginBottom: 12, color: "#111" }}>
            OCCASION
          </Text>

          <Pressable
            onPress={() => setDraft(null)}
            style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" }}
          >
            <Text style={{ fontSize: 13, letterSpacing: 1, color: "#111" }}>ANY</Text>
          </Pressable>

          <ScrollView style={{ maxHeight: 320 }}>
            {loading ? (
              <Text style={{ paddingVertical: 14, color: "#666" }}>Loading...</Text>
            ) : (
              options.map((o) => {
                const active = draft?.master_id === o.master_id;
                return (
                  <Pressable
                    key={o.master_id}
                    onPress={() => setDraft(o)}
                    style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#EEE" }}
                  >
                    <Text
                      style={{
                        fontSize: 13,
                        letterSpacing: 1,
                        color: "#111",
                        fontWeight: active ? "700" : "400",
                      }}
                    >
                      {o.name.toUpperCase()}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
            <TouchableOpacity
              onPress={() => setOpen(false)}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#E6E6E6",
                paddingVertical: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, letterSpacing: 1.5, color: "#111" }}>CANCEL</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                onChange(draft);
                setOpen(false);
              }}
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: "#111",
                paddingVertical: 12,
                borderRadius: 6,
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 12, letterSpacing: 1.5, color: "#111" }}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}
