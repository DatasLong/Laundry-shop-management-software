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
  order_id: string;

  cusName: string;

  cusPhone: string;
  cusAddress: string;

  basePrice: number;
  totalPrice: number;

  Status: "Chưa xong" | "Đã xong";
  Delivery: "Chưa giao hàng" | "Đã giao hàng";

  creationTime: string;
  DeliveryTime: string;
};

export default function GiaoHang() {
  const [code, setCode] = useState("");

  // Card 1
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderDocIds, setOrderDocIds] = useState<string[]>([]);
  const [confirmTotals, setConfirmTotals] = useState<{ [key: number]: string }>(
    {}
  );

  // Card 2
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);

  // Load danh sách đơn chưa giao (Card 2)
  const loadPendingOrders = async () => {
    try {
      const q = query(
        collection(db, "Order"),
        where("Delivery", "==", "Chưa giao hàng")
      );
      const snapshot = await getDocs(q);
      const list: Order[] = snapshot.docs.map(
        (docSnap) => docSnap.data() as Order
      );
      setPendingOrders(list);
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  useEffect(() => {
    loadPendingOrders();
  }, []);

  const handleNameTyping = (text: string) => {
    setCode(text);
  };

  // 🔍 Tìm kiếm (mã / ngày / trạng thái)
  const handleSearchOrder = async () => {
    if (!code.trim()) {
      Alert.alert("Lỗi", "Nhập mã / tên / SĐT / trạng thái");
      return;
    }

    try {
      const keyword = code.trim();
      let q;

      // 🔍 theo trạng thái GIẶT
      if (keyword === "Chưa xong" || keyword === "Đã xong") {
        q = query(collection(db, "Order"), where("Status", "==", keyword));
      }

      // 🔍 theo trạng thái GIAO
      else if (keyword === "Chưa giao hàng" || keyword === "Đã giao hàng") {
        q = query(collection(db, "Order"), where("Delivery", "==", keyword));
      }

      // 🔍 theo SĐT
      else if (/^\d{10,12}$/.test(keyword)) {
        q = query(collection(db, "Order"), where("cusPhone", "==", keyword));
      }

      // 🔍 theo mã đơn
      else if (keyword.startsWith("ORD-")) {
        q = query(collection(db, "Order"), where("order_id", "==", keyword));
      }

      // 🔍 theo TÊN KHÁCH
      else {
        q = query(collection(db, "Order"), where("cusName", "==", keyword));
      }

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        Alert.alert("Thông báo", "Không tìm thấy đơn hàng!");
        setOrders([]);
        setOrderDocIds([]);
        return;
      }

      const list: Order[] = [];
      const ids: string[] = [];

      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Order);
        ids.push(docSnap.id);
      });

      setOrders(list);
      setOrderDocIds(ids);
      setConfirmTotals({});
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  // 🚚 Xác nhận giao hàng theo từng đơn
  const handleConfirmDelivery = async (index: number) => {
    const order = orders[index];
    const docId = orderDocIds[index];
    const inputTotal = Number(confirmTotals[index]);

    if (!docId) {
      Alert.alert("Lỗi", "Không xác định được đơn hàng!");
      return;
    }

    if (isNaN(inputTotal) || inputTotal !== order.totalPrice) {
      Alert.alert("Lỗi", "Tổng tiền nhập không đúng!");
      return;
    }

    try {
      await updateDoc(doc(db, "Order", docId), {
        Delivery: "Đã giao hàng",
        DeliveryTime: new Date().toLocaleString("vi-VN"),
      });

      Alert.alert("Thành công", "✅ Đã xác nhận giao hàng");

      // update UI tại chỗ
      const newOrders = [...orders];
      newOrders[index] = {
        ...order,
        Delivery: "Đã giao hàng",
        DeliveryTime: new Date().toLocaleString("vi-VN"),
      };
      setOrders(newOrders);

      loadPendingOrders();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* CARD 1 */}
        <View style={styles.card}>
          <Text style={styles.title}>📱 Quét Mã QR / RFID Giao Hàng</Text>

          <TouchableOpacity style={styles.scanBtn}>
            <Text style={styles.scanText}>📷 Bật Camera Quét QR</Text>
          </TouchableOpacity>

          <Text style={styles.or}>Hoặc nhập mã đơn hàng thủ công</Text>

          <View>
            <View style={styles.searchRow}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mã đơn hàng/ Tên / SĐT / Đã xong|Chưa xong / Đã giao hàng|Chưa giao hàng"
                value={code}
                onChangeText={handleNameTyping}
              />

              <TouchableOpacity
                style={styles.greenBtn}
                onPress={handleSearchOrder}
              >
                <Text style={styles.greenText}>Tìm</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* DANH SÁCH ĐƠN */}
          {orders.map((order, idx) => (
            <View key={idx} style={{ marginTop: 20 }}>
              <Text style={{ fontWeight: "700", marginBottom: 6 }}>
                📦 Đơn hàng {idx + 1}
              </Text>

              <View style={styles.table}>
                {[
                  ["Mã đơn hàng", order.order_id],
                  ["Khách hàng", order.cusName],
                  ["Số điện thoại", order.cusPhone],
                  ["Địa chỉ", order.cusAddress],
                  ["Tổng tiền", order.totalPrice.toString()],
                  ["Trạng thái giặt", order.Status],
                  ["Trạng thái giao", order.Delivery],
                  ["Nhận lúc", order.creationTime],
                  ["Giao lúc", order.DeliveryTime || "Chưa giao"],
                ].map(([label, value], i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableLabel}>{label}</Text>
                    <Text
                      style={[
                        styles.tableValue,
                        label === "Trạng thái giao" && value === "Đã giao hàng"
                          ? { color: "#16a34a", fontWeight: "700" }
                          : {},
                      ]}
                    >
                      {value}
                    </Text>
                  </View>
                ))}
              </View>

              {order.Delivery === "Chưa giao hàng" && (
                <View style={styles.confirmRow}>
                  <TextInput
                    style={styles.confirmInput}
                    placeholder="Nhập xác nhận tổng tiền"
                    keyboardType="numeric"
                    value={confirmTotals[idx] || ""}
                    onChangeText={(text) =>
                      setConfirmTotals((prev) => ({ ...prev, [idx]: text }))
                    }
                  />
                  <TouchableOpacity
                    style={styles.confirmBtn}
                    onPress={() => handleConfirmDelivery(idx)}
                  >
                    <Text style={styles.confirmBtnText}>
                      Xác nhận giao hàng
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* CARD 2 – GIỮ NGUYÊN */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <Text style={styles.title}>
            🧾 Danh sách khách hàng chưa giao hàng
          </Text>

          <View style={styles.table}>
            {pendingOrders.length === 0 ? (
              <Text style={{ padding: 10 }}>
                Không còn đơn hàng nào chưa giao
              </Text>
            ) : (
              pendingOrders.map((o, idx) => (
                <View key={idx} style={styles.tableRow}>
                  <Text style={styles.tableLabel}>{o.order_id}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
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
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
