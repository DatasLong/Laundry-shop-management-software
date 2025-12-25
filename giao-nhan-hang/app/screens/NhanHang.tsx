import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

type OrderType = {
  khachhang_id: string;
  order_id: string;
  name: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  weight: number;
  price: number;
  total: number;
  status: string;
  createdAt: string;
};

export default function NhanHang() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [invoiceText, setInvoiceText] = useState(""); // Thêm state lưu text hóa đơn

  const total =
    (Number(quantity) || 0) * (Number(weight) || 0) * (Number(price) || 0);

  const createInvoice = async () => {
    if (!name || !phone) {
      alert("⚠️ Vui lòng nhập Tên và Số điện thoại!");
      return;
    }

    try {
      // ĐÓNG GÓI DỮ LIỆU ĐẦY ĐỦ CÁC CỘT, THÊM status
      const dataToSave: OrderType = {
        khachhang_id: phone.trim(),
        order_id: "ORD-" + Date.now(),
        name,
        phone,
        address,
        product,
        quantity: Number(quantity) || 0,
        weight: Number(weight) || 0,
        price: Number(price) || 0,
        total: total,
        status: "Chưa giao hàng",
        createdAt: new Date().toLocaleString("vi-VN"),
      };

      await addDoc(collection(db, "orders"), dataToSave);
      alert("✅ Đã lưu hóa đơn thành công!");

      generateInvoiceText(dataToSave); // Gọi hàm tạo hóa đơn dạng text và hiển thị

      // Xóa form sau khi lưu
      setName("");
      setPhone("");
      setAddress("");
      setProduct("");
      setWeight("");
      setPrice("");
      setQuantity("");
    } catch (error: any) {
      alert("❌ Lỗi: " + error.message);
    }
  };

  // Hàm tạo hóa đơn dạng text giống Bách Hóa Xanh (bỏ thông tin nhân viên)
  const generateInvoiceText = (order: OrderType) => {
    const text = `
------------------------------
          BÁCH HÓA XANH
------------------------------
Mã khách hàng: ${order.khachhang_id}
Mã đơn hàng: ${order.order_id}
Họ tên: ${order.name}
Số điện thoại: ${order.phone}
Địa chỉ: ${order.address}

Sản phẩm: ${order.product}
Số lượng kiện: ${order.quantity}
Trọng lượng (kg): ${order.weight}
Đơn giá (đ/kg): ${order.price}

Thành tiền: ${order.total.toLocaleString("vi-VN")} đ
------------------------------
Trạng thái: ${order.status}
Ngày tạo: ${order.createdAt}
------------------------------
    `;

    setInvoiceText(text);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>🧾 Nhập Thông Tin Đơn Hàng</Text>

        <Text style={styles.section}>Thông tin khách hàng</Text>
        <View style={styles.sectionDivider} />

        <Text style={styles.label}>Họ và tên *</Text>
        <TextInput
          style={styles.input}
          placeholder="Nguyễn Văn A"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          placeholder="0912345678"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholderTextColor="#9ca3af"
        />
        <Text style={styles.label}>Địa chỉ *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
          value={address}
          onChangeText={setAddress}
          multiline
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.section}>Thông tin hàng hóa</Text>
        <View style={styles.sectionDivider} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Loại sản phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Thực phẩm, Điện tử"
              value={product}
              onChangeText={setProduct}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Số lượng kiện</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Trọng lượng (kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="5.5"
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Đơn giá (đ/kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Thành tiền dự kiến:</Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={createInvoice}>
          <Text style={styles.buttonText}>✅ Tạo Hóa Đơn</Text>
        </TouchableOpacity>

        {/* Hiển thị hóa đơn dạng text */}
        {invoiceText ? (
          <View style={styles.invoiceBox}>
            <Text style={styles.invoiceText}>{invoiceText}</Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: { padding: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  section: {
    fontWeight: "700",
    color: "#4338ca",
    marginTop: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    color: "#111827", // đen
    fontWeight: "700",
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  textArea: { height: 60, textAlignVertical: "top" },
  row: { flexDirection: "row", gap: 10 },
  col: { flex: 1 },
  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  totalLabel: { fontWeight: "600" },
  totalValue: { fontWeight: "800", color: "#4338ca", fontSize: 16 },
  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: { color: "#fff", fontWeight: "700" },

  invoiceBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
  },
  invoiceText: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#111827",
    lineHeight: 20,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#d1d5db",
    width: "100%", // dài hết khung
    marginTop: 2, // RẤT sát chữ
    marginBottom: 12,
  },
});
