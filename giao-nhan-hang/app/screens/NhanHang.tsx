import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function NhanHang() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const total =
    (Number(quantity) || 0) *
    (Number(weight) || 0) *
    (Number(price) || 0);

  const createInvoice = () => {
    Alert.alert("Tạo hóa đơn", "Hóa đơn đã được tạo (demo)");
  };

  return (
    <ScrollView contentContainerStyle={styles.wrapper}>
      <View style={styles.card}>
        {/* TITLE */}
        <Text style={styles.title}>🧾 Nhập Thông Tin Đơn Hàng</Text>

        {/* CUSTOMER INFO */}
        <Text style={styles.section}>Thông tin khách hàng</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={styles.input}
            placeholder="0912345678"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Địa chỉ giao hàng *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="123 Đường ABC, Quận XYZ, TP. HCM"
            multiline
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* PRODUCT INFO */}
        <Text style={styles.section}>Thông tin hàng hóa</Text>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Loại sản phẩm *</Text>
            <TextInput
              style={styles.input}
              placeholder="Thực phẩm, Điện tử..."
              value={product}
              onChangeText={setProduct}
            />
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Số lượng kiện *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.label}>Trọng lượng (kg) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={weight}
              onChangeText={setWeight}
            />
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Đơn giá (đ/kg) *</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        {/* TOTAL */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Thành tiền dự kiến:</Text>
          <Text style={styles.totalValue}>
            {total.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={createInvoice}>
          <Text style={styles.buttonText}>✅ Tạo Hóa Đơn</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    padding: 12,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
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

  field: {
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },

  textArea: {
    height: 70,
    textAlignVertical: "top",
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  col: {
    flex: 1,
  },

  totalBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  totalLabel: {
    fontWeight: "600",
    color: "#1e3a8a",
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
    fontSize: 15,
  },
});
