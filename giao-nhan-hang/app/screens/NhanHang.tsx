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

export default function NhanHang() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const nameRegex = /^[A-Za-zÀ-ỹ\s]{2,}$/;
  const phoneRegex = /^\d{10,12}$/;
  const addressRegex = /^[A-Za-z0-9À-ỹ\s,./-]{5,}$/;
  const productRegex = /^[A-Za-z0-9À-ỹ\s]{2,}$/;
  const positiveNumberRegex = /^[1-9]\d*(\.\d+)?$/;

  const total =
    (Number(quantity) || 0) * (Number(weight) || 0) * (Number(price) || 0);

  const createInvoice = async () => {
    if (!nameRegex.test(name)) {
      Alert.alert("Lỗi", "Họ tên không hợp lệ");
      return;
    }

    if (!phoneRegex.test(phone)) {
      Alert.alert("Lỗi", "Số điện thoại phải từ 10–12 chữ số");
      return;
    }

    if (address && !addressRegex.test(address)) {
      Alert.alert("Lỗi", "Địa chỉ không hợp lệ");
      return;
    }

    if (product && !productRegex.test(product)) {
      Alert.alert("Lỗi", "Tên sản phẩm không hợp lệ");
      return;
    }

    if (
      !positiveNumberRegex.test(quantity) ||
      !positiveNumberRegex.test(weight) ||
      !positiveNumberRegex.test(price)
    ) {
      Alert.alert("Lỗi", "Số lượng, trọng lượng và đơn giá phải > 0");
      return;
    }

    try {
      const dataToSave = {
        khachhang_id: phone.trim(),
        order_id: "ORD-" + Date.now(),
        name,
        phone,
        address,
        product,
        quantity: Number(quantity),
        weight: Number(weight),
        price: Number(price),
        total,
        status: "chưa giao hàng",
        createdAt: new Date().toLocaleString("vi-VN"),
      };

      await addDoc(collection(db, "orders"), dataToSave);
      Alert.alert("Thành công", "Đã lưu hóa đơn");

      setName("");
      setPhone("");
      setAddress("");
      setProduct("");
      setQuantity("");
      setWeight("");
      setPrice("");
    } catch (error: any) {
      Alert.alert("Lỗi", error.message);
    }
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
          placeholder="Nguyễn văn A"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#d1d5db"
        />

        <Text style={styles.label}>Số điện thoại *</Text>
        <TextInput
          style={styles.input}
          placeholder="0912345678"
          value={phone}
          onChangeText={(text) =>
            setPhone(text.replace(/[^0-9]/g, "").slice(0, 12))
          }
          keyboardType="phone-pad"
          placeholderTextColor="#d1d5db"
        />

        <Text style={styles.label}>Địa chỉ giao hàng</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
          value={address}
          onChangeText={setAddress}
          multiline
          placeholderTextColor="#d1d5db"
        />

        <Text style={styles.section}>Thông tin hàng hóa</Text>
        <View style={styles.sectionDivider} />
        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Loại sản phẩm</Text>
            <TextInput
              style={styles.input}
              placeholder="Thực phẩm, Điện tử ..."
              value={product}
              onChangeText={setProduct}
              placeholderTextColor="#d1d5db"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Số lượng kiện</Text>
            <TextInput
              style={styles.input}
              placeholder="1"
              value={quantity}
              onChangeText={(text) => setQuantity(text.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              placeholderTextColor="#d1d5db"
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
              onChangeText={(text) => setWeight(text.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              placeholderTextColor="#d1d5db"
            />
          </View>
          <View style={styles.col}>
            <Text style={styles.label}>Đơn giá (đ/kg)</Text>
            <TextInput
              style={styles.input}
              placeholder="50000"
              value={price}
              onChangeText={(text) => setPrice(text.replace(/[^0-9.]/g, ""))}
              keyboardType="numeric"
              placeholderTextColor="#d1d5db"
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
    fontSize: 12,
    color: "#000",
    marginBottom: 4,
    fontWeight: "500",
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

  sectionDivider: {
    height: 2,
    backgroundColor: "#e5e7eb", // xám nhạt, tinh tế
    borderRadius: 2,
    marginBottom: 10,
  },
});
