import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function GiaoHang() {
  const [code, setCode] = useState("");

  const handleCreate = () => {
    if (!code.trim()) {
      Alert.alert("Lỗi", "Nhập mã đơn hàng");
      return;
    }
    Alert.alert("Tạo hóa đơn", `Đã xử lý đơn ${code}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>📱 Quét Mã QR / RFID Giao Hàng</Text>

        <TouchableOpacity style={styles.scanBtn}>
          <Text style={styles.scanText}>📷 Bật Camera Quét QR</Text>
        </TouchableOpacity>

        <Text style={styles.or}>Hoặc nhập mã đơn hàng thủ công</Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="Nhập mã đơn hàng..."
            value={code}
            onChangeText={setCode}
          />
          <TouchableOpacity style={styles.greenBtn} onPress={handleCreate}>
            <Text style={styles.greenText}>Tìm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 12 },
  scanBtn: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  scanText: { color: "#fff", fontWeight: "600" },
  or: { textAlign: "center", color: "#6b7280", marginVertical: 12 },
  row: { flexDirection: "row", gap: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
  },
  greenBtn: {
    backgroundColor: "#16a34a",
    paddingHorizontal: 16,
    borderRadius: 10,
    justifyContent: "center",
  },
  greenText: { color: "#fff", fontWeight: "600" },
});
