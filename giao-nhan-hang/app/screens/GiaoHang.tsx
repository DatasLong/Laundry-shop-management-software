import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native";

export default function GiaoHang() {
  const [code, setCode] = useState("");

  const handleCreate = () => {
    if (!code.trim()) {
      Alert.alert("Lỗi", "Nhập mã đơn hàng");
      return;
    }
    Alert.alert("Tạo hóa đơn", `Đã xử lý đơn ${code}`);
  };

  type OrderItem = {
    id: string;
    name: string;
  };

  const orders: OrderItem[] = [];

  // ví dụ có dữ liệu:
  // const orders = [
  //   { id: "DH001", name: "Nguyễn Văn A" },
  //   { id: "DH002", name: "Trần Thị B" },
  // ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
    >
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

        <View style={styles.table}>
          {[
            ["Mã khách hàng", ""],
            ["Mã đơn hàng", ""],
            ["Số điện thoại", ""],
            ["Địa chỉ", ""],
            ["Loại sản phẩm", ""],
            ["Số lượng", ""],
            ["Trọng lượng", ""],
            ["Đơn giá", ""],
            ["Thành tiền", ""],
          ].map(([label, value], index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text style={styles.tableValue}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={styles.confirmRow}>
          <TextInput
            style={styles.confirmInput}
            placeholder="Nhập xác nhận tổng tiền"
            keyboardType="numeric"
          />

          <TouchableOpacity style={styles.confirmBtn}>
            <Text style={styles.confirmBtnText}>Xác nhận giao hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.title}>🧾 Danh sách khách hàng chưa giao hàng</Text>

        <View style={styles.table}>
          {/* HEADER */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.headerText]}>
              Mã đơn hàng
            </Text>
            <Text style={[styles.tableCell, styles.headerText]}>
              Tên khách hàng
            </Text>
          </View>

          {/* BODY */}
          {orders.length > 0 &&
            orders.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{item.id}</Text>
                <Text style={styles.tableCell}>{item.name}</Text>
              </View>
            ))}
        </View>
      </View>
    </ScrollView>
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

  table: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableLabel: {
    width: "40%",
    backgroundColor: "#f3f4f6",
    padding: 10,
    fontWeight: "600",
    color: "#374151",
  },
  tableValue: {
    width: "60%",
    padding: 10,
    color: "#111827",
  },

  tableHeader: {
    backgroundColor: "#e5e7eb",
  },

  headerText: {
    flex: 1,
    padding: 10,
    fontWeight: "700",
    color: "#111827",
  },

  tableCell: {
    flex: 1,
    padding: 10,
    color: "#111827",
  },

  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },

  confirmLabel: {
    fontWeight: "600",
    color: "#374151",
  },

  confirmInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 10,
  },

  confirmBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },

  confirmBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
});
