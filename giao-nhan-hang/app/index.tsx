import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GiaoHang from "./screens/GiaoHang";
import NhanHang from "./screens/NhanHang";

type Tab = "nhan" | "giao";

export default function App() {
  const [tab, setTab] = useState<Tab>("nhan");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* HEADER GRADIENT */}
      <LinearGradient
        colors={["#6a11cb", "#2575fc"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>📦 Hệ Thống Giao Nhận Hàng</Text>
        <Text style={styles.headerSub}>Đơn giản, dễ sử dụng</Text>
      </LinearGradient>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={tab === "nhan" ? styles.tabActive : styles.tab}
          onPress={() => setTab("nhan")}
        >
          <Text style={tab === "nhan" ? styles.tabTextActive : styles.tabText}>
            📦 Nhận Hàng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tab === "giao" ? styles.tabActive : styles.tab}
          onPress={() => setTab("giao")}
        >
          <Text style={tab === "giao" ? styles.tabTextActive : styles.tabText}>
            🚚 Giao Hàng
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {tab === "nhan" ? <NhanHang /> : <GiaoHang />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 18,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerSub: {
    color: "#e0e7ff",
    fontSize: 13,
    marginTop: 2,
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    margin: 12,
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderRadius: 12,
  },
  tabActive: {
    flex: 1,
    padding: 12,
    backgroundColor: "#4f46e5",
    alignItems: "center",
    borderRadius: 12,
  },
  tabText: {
    fontWeight: "600",
    color: "#374151",
  },
  tabTextActive: {
    fontWeight: "600",
    color: "#fff",
  },
});
