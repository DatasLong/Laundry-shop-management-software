import { useState, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { db } from "./firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";

type Order = {
  khachhang_id: string;
  order_id: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  weight: number;
  price: number;
  total: number;
  status: string;
};

export default function GiaoHang() {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [orderDocId, setOrderDocId] = useState<string | null>(null);
  const [confirmTotal, setConfirmTotal] = useState("");

  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  // Load danh sách các đơn Chưa giao hàng
  const loadPendingOrders = async () => {
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("status", "==", "Chưa giao hàng"));
      const querySnapshot = await getDocs(q);

      const orders: Order[] = querySnapshot.docs.map((docSnap) => {
        const data = docSnap.data() as Order;
        return data;
      });
      setPendingOrders(orders);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  useEffect(() => {
    // Load lần đầu khi mở màn hình
    loadPendingOrders();
  }, []);

  // Tìm đơn hàng theo mã
  const handleSearchOrder = async () => {
    if (!code.trim()) {
      Alert.alert("Lỗi", "Nhập mã đơn hàng");
      return;
    }
    try {
      const ordersRef = collection(db, "orders");
      const q = query(ordersRef, where("order_id", "==", code.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Thông báo", "Không tìm thấy đơn hàng này!");
        setOrder(null);
        setOrderDocId(null);
        return;
      }

      const docSnap = querySnapshot.docs[0];
      const data = docSnap.data() as Order;

      setOrder({ ...data, status: data.status || "Chưa giao hàng" });
      setOrderDocId(docSnap.id);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  // Xác nhận giao hàng
  const handleConfirmDelivery = async () => {
    if (!order || !orderDocId) {
      Alert.alert("Lỗi", "Chưa tìm thấy đơn hàng để xác nhận!");
      return;
    }

    const totalNumber = Number(confirmTotal);
    if (isNaN(totalNumber) || totalNumber !== order.total) {
      Alert.alert("Lỗi", "Tổng tiền nhập không đúng!");
      return;
    }

    try {
      const orderRef = doc(db, "orders", orderDocId);
      await updateDoc(orderRef, { status: "Đã giao hàng" });

      // Cập nhật UI Card 1 ngay
      setOrder({ ...order, status: "Đã giao hàng" });
      setConfirmTotal("");
      Alert.alert("Thành công", "✅ Xác nhận giao hàng thành công!");

      // Load lại Card 2
      loadPendingOrders();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 30 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* CARD 1 */}
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
          <TouchableOpacity style={styles.greenBtn} onPress={handleSearchOrder}>
            <Text style={styles.greenText}>Tìm</Text>
          </TouchableOpacity>
        </View>

        {/* Table dọc */}
        <View style={styles.table}>
          {[
            ["Mã khách hàng", order?.khachhang_id || ""],
            ["Mã đơn hàng", order?.order_id || ""],
            ["Số điện thoại", order?.phone || ""],
            ["Địa chỉ", order?.address || ""],
            ["Loại sản phẩm", order?.product || ""],
            ["Số lượng", order?.quantity?.toString() || ""],
            ["Trọng lượng", order?.weight?.toString() || ""],
            ["Đơn giá", order?.price?.toString() || ""],
            ["Thành tiền", order?.total?.toString() || ""],
            ["Trạng thái", order?.status || ""],
          ].map(([label, value], index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableLabel}>{label}</Text>
              <Text
                style={[
                  styles.tableValue,
                  label === "Trạng thái" && value === "Đã giao hàng"
                    ? { color: "#16a34a", fontWeight: "700" }
                    : {},
                ]}
              >
                {value}
              </Text>
            </View>
          ))}
        </View>

        {/* Xác nhận tổng tiền */}
        {order?.status === "Chưa giao hàng" && (
          <View style={styles.confirmRow}>
            <TextInput
              style={styles.confirmInput}
              placeholder="Nhập xác nhận tổng tiền"
              keyboardType="numeric"
              value={confirmTotal}
              onChangeText={setConfirmTotal}
            />

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmDelivery}
            >
              <Text style={styles.confirmBtnText}>Xác nhận giao hàng</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* CARD 2 */}
      <View style={[styles.card, { marginTop: 16 }]}>
        <Text style={styles.title}>🧾 Danh sách khách hàng chưa giao hàng</Text>

        <View style={styles.table}>
          {pendingOrders.length === 0 ? (
            <Text style={{ padding: 10 }}>
              Không còn đơn hàng nào chưa giao
            </Text>
          ) : (
            pendingOrders.map((o, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.tableLabel}>{o.order_id}</Text>
                <Text style={styles.tableValue}>{o.khachhang_id}</Text>
              </View>
            ))
          )}
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

  confirmRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
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
