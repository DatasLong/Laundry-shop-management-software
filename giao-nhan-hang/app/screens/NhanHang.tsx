import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "./firebaseConfig";
import { addDoc, collection, getDocs, query } from "firebase/firestore";
import { Image } from "react-native";

/* =======================
   TYPE
======================= */
type ProductType = {
  id: string;
  name: string;
  price: number;
};

export default function NhanHang() {
  /* =======================
     CUSTOMER
  ======================= */
  const [cusName, setCusName] = useState("");
  const [cusPhone, setCusPhone] = useState("");
  const [cusAddress, setCusAddress] = useState("");

  /* =======================
     PRODUCT
  ======================= */
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  /* =======================
     ORDER
  ======================= */
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");
  const [promotion, setPromotion] = useState("");

  /* =======================
     PREVIEW BILL
  ======================= */
  const [previewOrder, setPreviewOrder] = useState<any>(null);

  /* =======================
     LOAD PRODUCT TYPE
  ======================= */
  useEffect(() => {
    const loadProductTypes = async () => {
      const snap = await getDocs(query(collection(db, "ProductType")));

      if (snap.empty) {
        const seed = [
          { name: "Giặt thường", price: 15000 },
          { name: "Giặt nhanh", price: 20000 },
          { name: "Giặt sấy", price: 25000 },
          { name: "Giặt chăn mền", price: 30000 },
          { name: "Giặt cao cấp", price: 40000 },
        ];
        for (const p of seed) {
          await addDoc(collection(db, "ProductType"), p);
        }
        loadProductTypes();
        return;
      }

      const list = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ProductType, "id">),
      }));
      setProductTypes(list);
    };

    loadProductTypes();
  }, []);

  const selectedProduct = productTypes.find((p) => p.id === selectedProductId);

  /* =======================
     TOTAL PRICE
  ======================= */
  const basePrice =
    (Number(quantity) || 0) *
    (Number(weight) || 0) *
    (selectedProduct?.price || 0);

  const totalPrice = basePrice - basePrice * ((Number(promotion) || 0) / 100);

  const validateForm = () => {
    // ===== REQUIRED TEXT =====
    if (!cusName.trim()) {
      alert("⚠️ Vui lòng nhập họ tên khách hàng");
      return false;
    }

    if (!cusPhone.trim()) {
      alert("⚠️ Vui lòng nhập số điện thoại");
      return false;
    }

    if (!cusAddress.trim()) {
      alert("⚠️ Vui lòng nhập địa chỉ giao hàng");
      return false;
    }

    if (!selectedProductId) {
      alert("⚠️ Vui lòng chọn loại sản phẩm");
      return false;
    }

    if (!quantity.trim()) {
      alert("⚠️ Vui lòng nhập số lượng kiện");
      return false;
    }

    if (!weight.trim()) {
      alert("⚠️ Vui lòng nhập trọng lượng");
      return false;
    }

    // ===== PHONE =====
    const phoneRegex = /^[0-9]{10,12}$/;
    if (!phoneRegex.test(cusPhone)) {
      alert("⚠️ Số điện thoại phải là số và từ 10–12 chữ số");
      return false;
    }

    // ===== QUANTITY =====
    const qty = Number(quantity);
    if (isNaN(qty) || qty <= 0) {
      alert("⚠️ Số lượng kiện phải là số > 0");
      return false;
    }

    // ===== WEIGHT =====
    const w = Number(weight);
    if (isNaN(w) || w <= 0) {
      alert("⚠️ Trọng lượng phải là số > 0");
      return false;
    }

    // ===== PROMOTION (OPTIONAL) =====
    let promo = 0;
    if (promotion.trim() !== "") {
      promo = Number(promotion);
      if (isNaN(promo) || promo < 0 || promo > 100) {
        alert("⚠️ Khuyến mãi phải là số từ 0 đến 100");
        return false;
      }
    }

    return true;
  };

  /* =======================
     CREATE ORDER
  ======================= */
  const createOrder = async () => {
    if (!validateForm()) return;

    const finalPromotion = promotion.trim() === "" ? 0 : Number(promotion);
    const orderData = {
      order_id: "ORD-" + Date.now(),
      cusName,
      cusPhone,
      cusAddress,
      productType: selectedProduct,
      quantity: Number(quantity),
      weight: Number(weight),
      promotion: finalPromotion,
      totalPrice,
      creationTime: new Date().toLocaleString("vi-VN"),
      DeliveryTime: "",
    };

    await addDoc(collection(db, "Order"), orderData);

    setPreviewOrder(orderData);

    setCusName("");
    setCusPhone("");
    setCusAddress("");
    setQuantity("");
    setWeight("");
    setPromotion("");
    setSelectedProductId("");
  };

  /* =======================
     UI
  ======================= */
  return (
    <>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>🧾 Nhập thông tin đơn hàng</Text>

          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.inputDivider} />

          <Text style={styles.inputLabel}>Họ và tên *</Text>
          <TextInput
            style={styles.input}
            placeholder="Nguyễn Văn A"
            value={cusName}
            onChangeText={setCusName}
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.inputLabel}>Số điện thoại*</Text>
          <TextInput
            style={styles.input}
            placeholder="0912345678"
            value={cusPhone}
            onChangeText={setCusPhone}
            keyboardType="phone-pad"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.inputLabel}>Địa chỉ giao hàng*</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
            value={cusAddress}
            onChangeText={setCusAddress}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.sectionTitle}>Thông tin hàng hóa</Text>
          <View style={styles.inputDivider} />

          <Text style={styles.inputLabel}>Loại sản phẩm *</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedProductId}
              onValueChange={(v) => setSelectedProductId(v)}
              style={{
                height: 48,
                color: selectedProductId ? "#111827" : "#9ca3af",
                backgroundColor: "transparent", // 👈 QUAN TRỌNG
              }}
              dropdownIconColor="#9ca3af" // 👈 icon nhạt luôn
            >
              <Picker.Item
                label="-- Chọn loại sản phẩm --"
                value=""
                color="#9ca3af"
              />

              {productTypes.map((p) => (
                <Picker.Item
                  key={p.id}
                  label={`${p.name} - ${p.price.toLocaleString("vi-VN")} đ/kg`}
                  value={p.id}
                  color="#111827"
                />
              ))}
            </Picker>
          </View>

          <Text style={styles.inputLabel}>Số lượng kiện *</Text>
          <TextInput
            style={styles.input}
            placeholder="1"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.inputLabel}>Trọng lượng(kg) *</Text>
          <TextInput
            style={styles.input}
            placeholder="5.5"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />
          <Text style={styles.inputLabel}>Khuyến mại(%) *</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            value={promotion}
            onChangeText={setPromotion}
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
          />

          <View style={styles.totalBox}>
            <Text>Thành tiền</Text>
            <Text style={styles.totalValue}>
              {totalPrice.toLocaleString("vi-VN")} đ
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={createOrder}>
            <View style={styles.btnContent}>
              <View style={styles.tickBox}>
                <Text style={styles.tickText}>✓</Text>
              </View>
              <Text style={styles.buttonText}>Tạo hóa đơn</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* =======================
         BILL PREVIEW (FIX SIZE)
      ======================= */}
      <Modal visible={!!previewOrder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.bill}>
            {/* LOGO PLACEHOLDER */}
            <View style={styles.logoBox}>
              <Image
                source={require("@/assets/images/Logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.billTitle}>GIẶT SẤY</Text>
            <Text style={styles.billSub}>BUZZ WASH</Text>

            <Text style={styles.billText}>Tên KH: {previewOrder?.cusName}</Text>
            <Text style={styles.billText}>SĐT: {previewOrder?.cusPhone}</Text>
            <Text style={styles.billText}>
              Ngày: {previewOrder?.creationTime}
            </Text>

            <View style={styles.divider} />

            <Text style={styles.billTotal}>
              Thành tiền: {previewOrder?.totalPrice.toLocaleString("vi-VN")} đ
            </Text>

            <Text style={styles.billFooter}>
              Chân thành cảm ơn khách hàng đã tin tưởng và ủng hộ{"\n"}
              Tích lũy 10 tem giặt 5kg cho lần giặt tiếp theo
            </Text>

            {/* QR PLACEHOLDER */}
            <View style={styles.qrBox}>
              <Image
                source={require("@/assets/images/QR_test.png")}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPreviewOrder(null)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* =======================
   STYLE
======================= */
const styles = StyleSheet.create({
  wrapper: { padding: 12 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
  },
  title: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#d1d5db", // 👈 placeholder color
    borderRadius: 10,
    height: 48,
    justifyContent: "center",
    marginBottom: 10,
    backgroundColor: "#fff", // 👈 CHỐT HẠ
  },

  totalBox: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalValue: {
    fontWeight: "800",
    color: "#4338ca",
  },
  button: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },

  /* ===== BILL ===== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  bill: {
    width: 240,
    backgroundColor: "white",
    paddingVertical: 20, // 👈 tăng chiều cao bill
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  logoBox: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  billTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "red",
    textAlign: "center",
  },
  billSub: {
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 6,
  },
  billText: {
    fontSize: 14,
    marginVertical: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#000",
    marginVertical: 6,
  },
  billTotal: {
    fontSize: 16,
    fontWeight: "900",
    marginVertical: 6,
  },
  billFooter: {
    fontSize: 12,
    marginTop: 6,
  },
  qrBox: {
    height: 160, // 👈 đủ chứa QR 150x150
    width: 160,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    alignSelf: "center",
  },

  closeBtn: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },

  inputDivider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginBottom: 10,
  },
  sectionTitle: {
    fontWeight: "800",
    fontSize: 14,
    color: "#4f46e5", // giống button
    marginBottom: 6,
    marginTop: 12,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  tickBox: {
    width: 14,
    height: 14,
    backgroundColor: "#22c55e", // xanh lá
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  tickText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
  },
  logo: {
    width: 120,
    height: 40,
  },
  qrImage: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    alignSelf: "center",
  },
});
