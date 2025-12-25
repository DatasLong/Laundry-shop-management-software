import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

/**
 * Cấu trúc dữ liệu đơn hàng lưu trong Firestore
 */
type OrderType = {
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
  // Thông tin khách hàng
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Thông tin hàng hóa
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  // Text hóa đơn hiển thị sau khi tạo
  const [invoiceText, setInvoiceText] = useState("");

  // Thành tiền = số kiện * trọng lượng * đơn giá
  const total =
    (Number(quantity) || 0) * (Number(weight) || 0) * (Number(price) || 0);

  // Tạo và lưu hóa đơn vào Firestore
  const createInvoice = async () => {
    if (!name || !phone) {
      alert("⚠️ Vui lòng nhập Tên và Số điện thoại!");
      return;
    }

    const orderData: OrderType = {
      order_id: "ORD-" + Date.now(),
      name,
      phone,
      address,
      product,
      quantity: Number(quantity) || 0,
      weight: Number(weight) || 0,
      price: Number(price) || 0,
      total,
      status: "Chưa giao hàng",
      createdAt: new Date().toLocaleString("vi-VN"),
    };

    try {
      await addDoc(collection(db, "orders"), orderData);
      alert("✅ Đã lưu hóa đơn thành công!");

      generateInvoiceText(orderData);

      // Reset form
      setName("");
      setPhone("");
      setAddress("");
      setProduct("");
      setQuantity("");
      setWeight("");
      setPrice("");
    } catch (error: any) {
      alert("❌ Lỗi: " + error.message);
    }
  };

  // Sinh nội dung hóa đơn dạng text để hiển thị
  const generateInvoiceText = (order: OrderType) => {
    setInvoiceText(`
------------------------------
        BÁCH HÓA XANH
------------------------------
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
`);
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <View style={styles.card}>
        <Text style={styles.title}>🧾 Nhập Thông Tin Đơn Hàng</Text>

        <Text style={styles.section}>Thông tin khách hàng</Text>
        <View style={styles.sectionDivider} />

        <TextInput
          style={styles.input}
          placeholder="Họ và tên *"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Số điện thoại *"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Địa chỉ"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={styles.section}>Thông tin hàng hóa</Text>
        <View style={styles.sectionDivider} />

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.col]}
            placeholder="Loại sản phẩm"
            value={product}
            onChangeText={setProduct}
          />

          <TextInput
            style={[styles.input, styles.col]}
            placeholder="Số lượng kiện"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.col]}
            placeholder="Trọng lượng (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />

          <TextInput
            style={[styles.input, styles.col]}
            placeholder="Đơn giá (đ/kg)"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.totalBox}>
          <Text>Thành tiền:</Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={createInvoice}>
          <Text style={styles.buttonText}>✅ Tạo Hóa Đơn</Text>
        </TouchableOpacity>

        {invoiceText !== "" && (
          <View style={styles.invoiceBox}>
            <Text style={styles.invoiceText}>{invoiceText}</Text>
          </View>
        )}
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

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },

  textArea: {
    height: 60,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  col: {
    flex: 1,
  },

  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  totalValue: {
    fontWeight: "800",
    color: "#4338ca",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#4f46e5",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  invoiceBox: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#eef2ff",
    borderRadius: 12,
  },

  invoiceText: {
    fontFamily: "monospace",
    fontSize: 14,
    lineHeight: 20,
  },

  sectionDivider: {
    height: 1,
    backgroundColor: "#d1d5db",
    width: "100%",
    marginBottom: 12,
  },
});
