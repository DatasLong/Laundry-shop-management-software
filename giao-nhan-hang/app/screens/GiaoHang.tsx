import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
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
    <ScrollView contentContainerStyle={styles.container}>
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
            ["Id khách hàng", ""],
            ["Id đơn hàng", ""],
            ["Họ và tên khách hàng", ""],
            ["Số điện thoại", ""],
            ["Địa chỉ giao hàng", ""],
            ["Loại sản phẩm", ""],
            ["Số lượng kiện", ""],
            ["Trọng lượng (kg)", ""],
            ["Đơn giá (đ/kg)", ""],
            ["Trạng thái", ""],
            ["Tổng tiền", ""],
          ].map(([label, value], index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text style={styles.tableValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* XÁC NHẬN TIỀN & GIAO HÀNG */}
        <View style={styles.confirmRow}>
          <View style={styles.confirmInputWrap}>
            <Text style={styles.confirmLabel}>Nhập xác nhận lại tiền:</Text>
            <TextInput
              style={styles.confirmInput}
              placeholder=""
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity style={styles.deliveryBtn}>
            <Text style={styles.deliveryText}>🚚 Giao hàng</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.table}>
        {/* HEADER */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <Text style={[styles.tableLabel, styles.headerText]}>
            Mã đơn hàng
          </Text>
          <Text style={[styles.tableValue, styles.headerText]}>
            Tên khách hàng
          </Text>
        </View>

        {/* DATA ROWS – demo, sau này thay bằng DB */}
        {[
          ["ORD-17230001", "Nguyễn Văn A"],
          ["ORD-17230002", "Trần Thị B"],
          ["ORD-17230003", "Lê Văn C"],
          ["ORD-17230004", "Phạm Thị D"],
        ].map(([orderId, customerName], index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableLabel}>{orderId}</Text>
            <Text style={styles.tableValue}>{customerName}</Text>
          </View>
        ))}
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
    borderRadius: 12,
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "flex-start", // QUAN TRỌNG để text dài xuống dòng
    backgroundColor: "#fff",
  },

  tableLabel: {
    width: "40%", // cột trái cố định
    fontWeight: "600",
    color: "#374151",
  },

  tableValue: {
    width: "60%", // cột phải cố định
    color: "#111827",
    flexWrap: "wrap",
  },

  confirmRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    alignItems: "flex-end",
  },

  confirmInputWrap: {
    flex: 1,
  },

  confirmLabel: {
    fontSize: 12,
    color: "#374151",
    marginBottom: 4,
    fontWeight: "600",
  },

  confirmInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
  },

  deliveryBtn: {
    backgroundColor: "#dc2626",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
  },

  deliveryText: {
    color: "#fff",
    fontWeight: "700",
  },

  tableHeader: {
    backgroundColor: "#fff",
  },

  headerText: {
    fontWeight: "800",
    color: "#111827",
  },
});
