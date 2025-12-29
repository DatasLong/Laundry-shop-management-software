import React, { useEffect, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { db } from "./firebaseConfig";
import { addDoc, collection, getDocs, query } from "firebase/firestore";

/* =======================
   TYPE
======================= */
type ProductType = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  weight: number;
  subTotal: number;

  // NEW
  weightUpdate?: number;
  subTotalUpdate?: number;
  status: "Chưa xong" | "Đã xong";
  timeDone: string;
};

export default function NhanHang() {
  /* =======================
     CUSTOMER
  ======================= */
  const [cusName, setCusName] = useState("");
  const [cusPhone, setCusPhone] = useState("");
  const [cusAddress, setCusAddress] = useState("");

  /* =======================
     PRODUCT MASTER
  ======================= */
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  /* =======================
     PRODUCT INPUT
  ======================= */
  const [quantity, setQuantity] = useState("");
  const [weight, setWeight] = useState("");

  /* =======================
     ORDER ITEMS
  ======================= */
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  /* =======================
     PROMOTION
  ======================= */
  const [promotion, setPromotion] = useState("");

  /* =======================
     PREVIEW BILL
  ======================= */
  const [previewOrder, setPreviewOrder] = useState<any>(null);

  /* =======================
     LOAD PRODUCT TYPE
  ======================= */
  const removeItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

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
     ADD ITEM
  ======================= */
  const addItem = () => {
    if (!selectedProduct) {
      alert("⚠️ Chọn loại sản phẩm");
      return;
    }

    const qty = Number(quantity);
    const w = Number(weight);

    if (isNaN(qty) || qty <= 0) {
      alert("⚠️ Số lượng phải > 0");
      return;
    }

    if (isNaN(w) || w <= 0) {
      alert("⚠️ Trọng lượng phải > 0");
      return;
    }

    const subTotal = qty * w * selectedProduct.price;

    const newItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      price: selectedProduct.price,
      quantity: qty,
      weight: w,
      subTotal,

      // NEW
      // weightUpdate: w,
      // subTotalUpdate: subTotal,
      status: "Chưa xong",
      timeDone: "",
    };

    setOrderItems((prev) => [...prev, newItem]);

    // reset product input
    setSelectedProductId("");
    setQuantity("");
    setWeight("");
  };

  /* =======================
     TOTAL PRICE
  ======================= */
  const basePrice = orderItems.reduce((sum, i) => sum + i.subTotal, 0);

  const promo = promotion.trim() === "" ? 0 : Number(promotion);
  const totalPrice = basePrice - basePrice * (promo / 100);

  /* =======================
     VALIDATE ORDER
  ======================= */
  const validateOrder = () => {
    if (!cusName.trim()) {
      alert("⚠️ Nhập tên khách hàng");
      return false;
    }

    if (!cusPhone.trim()) {
      alert("⚠️ Nhập số điện thoại");
      return false;
    }

    if (!/^[0-9]{10,12}$/.test(cusPhone)) {
      alert("⚠️ SĐT phải từ 10–12 số");
      return false;
    }

    if (!cusAddress.trim()) {
      alert("⚠️ Nhập địa chỉ");
      return false;
    }

    if (orderItems.length === 0) {
      alert("⚠️ Chưa có sản phẩm nào");
      return false;
    }

    if (promotion.trim() !== "") {
      const p = Number(promotion);
      if (isNaN(p) || p < 0 || p > 100) {
        alert("⚠️ Khuyến mãi 0–100%");
        return false;
      }
    }

    return true;
  };

  /* =======================
     CREATE ORDER
  ======================= */
  /* =======================
   CREATE ORDER (ĐÃ SỬA)
======================= */
  const createOrder = async () => {
    if (!validateOrder()) return;

    const lockedBasePrice = orderItems.reduce((s, i) => s + i.subTotal, 0);
    const lockedTotalPrice = lockedBasePrice - lockedBasePrice * (promo / 100);
    const creationTime = new Date().toLocaleString("vi-VN");

    // Tạo object dữ liệu sạch để dùng cho cả Firebase và Modal
    const orderData = {
      order_id: "ORD-" + Date.now(),
      cusName,
      cusPhone,
      cusAddress,
      promotion: promo,
      basePrice: lockedBasePrice,
      totalPrice: lockedTotalPrice,
      totalPriceUpdate: lockedTotalPrice,
      creationTime: creationTime,
      Delivery: "Chưa giao hàng",
      DeliveryTime: "",
    };

    // 1️⃣ Lưu vào Firebase
    const orderRef = await addDoc(collection(db, "Order"), orderData);

    // 2️⃣ Lưu Products subcollection
    for (const item of orderItems) {
      await addDoc(collection(db, "Order", orderRef.id, "Products"), {
        Product_ID: item.productId,
        ProductName: item.productName,
        quantity: item.quantity,
        price: item.price,
        weight: item.weight,
        subTotal: item.subTotal,
        status: item.status,
        timeDone: item.timeDone,
      });
    }

    // 3️⃣ CẬP NHẬT STATE PREVIEW (Dùng dữ liệu từ orderData)
    setPreviewOrder({
      ...orderData, // Lấy toàn bộ cusName, cusPhone, creationTime ở đây
      orderItems, // Danh sách món đồ để hiện trong bảng
    });

    // Reset các ô nhập liệu
    setCusName("");
    setCusPhone("");
    setCusAddress("");
    setOrderItems([]);
    setPromotion("");
  };

  /* =======================
     UI
  ======================= */
  return (
    <>
      <ScrollView contentContainerStyle={styles.wrapper}>
        <View style={styles.card}>
          <Text style={styles.title}>🧾 Nhập thông tin đơn hàng</Text>

          {/* CUSTOMER */}
          <Text style={styles.sectionTitle}>Thông tin khách hàng</Text>
          <View style={styles.inputDivider} />

          {/* Dòng chứa Họ tên và SĐT */}
          <View style={styles.rowContainer}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                value={cusName}
                onChangeText={setCusName}
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={{ width: 12 }} /> {/* Khoảng cách giữa 2 ô */}
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="0912345678"
                value={cusPhone}
                onChangeText={setCusPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Địa chỉ *</Text>
          <TextInput
            style={styles.input}
            placeholder="123 Đường ABC, Phường XYZ, TP.HCM"
            value={cusAddress}
            onChangeText={setCusAddress}
            placeholderTextColor="#9ca3af"
          />

          {/* PRODUCT */}
          <Text style={styles.sectionTitle}>Thông tin hàng hóa</Text>
          <View style={styles.inputDivider} />

          <Text style={styles.inputLabel}>Loại sản phẩm *</Text>
          <View style={styles.pickerBox}>
            <Picker
              selectedValue={selectedProductId}
              onValueChange={setSelectedProductId}
              style={{ height: 48 }}
            >
              <Picker.Item label="-- Chọn loại sản phẩm --" value="" />
              {productTypes.map((p) => (
                <Picker.Item
                  key={p.id}
                  label={`${p.name} - ${p.price.toLocaleString()} đ/kg`}
                  value={p.id}
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

          <TouchableOpacity style={styles.addBtn} onPress={addItem}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>➕ Thêm</Text>
          </TouchableOpacity>

          {/* TABLE */}
          <View style={styles.tableBox}>
            {/* HEADER */}
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { flex: 2 }]}>Loại sản phẩm</Text>
              <Text style={[styles.th, { flex: 1, textAlign: "center" }]}>
                Số lượng
              </Text>
              <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>
                Trọng lượng(Kg)
              </Text>
              <Text style={[styles.th, { flex: 0.8, textAlign: "center" }]}>
                Xóa
              </Text>
            </View>

            {/* ROWS */}
            {orderItems.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.td, { flex: 2 }]}>{item.productName}</Text>
                <Text style={[styles.td, { flex: 1, textAlign: "center" }]}>
                  {item.quantity}
                </Text>
                <Text style={[styles.td, { flex: 1, textAlign: "right" }]}>
                  {item.weight}
                </Text>
                {/* CỘT XÓA */}
                <TouchableOpacity
                  style={[
                    styles.tdWrapper,
                    { flex: 0.8, alignItems: "center" },
                  ]}
                  onPress={() => removeItem(index)}
                >
                  <Text style={styles.removeIcon}>−</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Thôngtin khuyến mãi</Text>
          <View style={styles.inputDivider} />
          {/* PROMO + TOTAL */}
          <Text style={styles.inputLabel}>Khuyến mãi(%)</Text>
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
            <Text style={{ color: "#fff", fontWeight: "700" }}>
              Tạo hóa đơn
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* BILL PREVIEW */}
      {/* =======================
   BILL PREVIEW (FULL – CÓ QR)
======================= */}
      <Modal visible={!!previewOrder} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.bill}>
            {/* LOGO & TIÊU ĐỀ */}
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
              Ngày tạo: {previewOrder?.creationTime}
            </Text>

            {/* --- PHẦN THÂN HÓA ĐƠN --- */}
            <View style={{ marginTop: 15 }}>
              {/* Header 4 cột */}
              <View style={styles.billTableRow}>
                <Text style={[styles.billTh, { flex: 0.8 }]}>SL</Text>
                <Text
                  style={[styles.billTh, { flex: 1.2, textAlign: "center" }]}
                >
                  T.Lượng
                </Text>
                <Text
                  style={[styles.billTh, { flex: 1.5, textAlign: "right" }]}
                >
                  Giá bán
                </Text>
                <Text
                  style={[styles.billTh, { flex: 1.5, textAlign: "right" }]}
                >
                  T.Tiền
                </Text>
              </View>

              <Text style={styles.asciiDivider}>
                ---------------------------------------------------
              </Text>

              {previewOrder?.orderItems.map((item: OrderItem, idx: number) => (
                <View key={idx} style={{ marginBottom: 10 }}>
                  {/* Dòng 1: Tên sản phẩm */}
                  <Text
                    style={[
                      styles.billTd,
                      { fontWeight: "700", textTransform: "uppercase" },
                    ]}
                  >
                    {item.productName}
                  </Text>

                  {/* Dòng 2: 4 thông số */}
                  <View style={styles.billTableRow}>
                    <Text style={[styles.billTd, { flex: 0.8 }]}>
                      {item.quantity}
                    </Text>
                    <Text
                      style={[
                        styles.billTd,
                        { flex: 1.2, textAlign: "center" },
                      ]}
                    >
                      {item.weight}kg
                    </Text>
                    <Text
                      style={[styles.billTd, { flex: 1.5, textAlign: "right" }]}
                    >
                      {item.price.toLocaleString("vi-VN")}
                    </Text>
                    <Text
                      style={[styles.billTd, { flex: 1.5, textAlign: "right" }]}
                    >
                      {item.subTotal.toLocaleString("vi-VN")}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.asciiDivider}>
              ---------------------------------------------------
            </Text>

            {/* PHẦN TỔNG TIỀN, KHUYẾN MÃI & THANH TOÁN */}
            <View style={{ marginTop: 5 }}>
              {/* Tổng cộng chưa giảm giá */}
              <View style={styles.billTotalRow}>
                <Text style={styles.billTotalLabel}>Tổng tiền:</Text>
                <Text style={styles.billTotalValue}>
                  {previewOrder?.basePrice.toLocaleString("vi-VN")} đ
                </Text>
              </View>

              {/* Khuyến mãi */}
              {previewOrder?.promotion > 0 && (
                <View style={[styles.billTotalRow, { marginTop: 4 }]}>
                  <Text style={styles.billTotalLabel}>
                    Khuyến mãi ({previewOrder?.promotion}%):
                  </Text>

                  <Text style={styles.billTotalValue}>
                    -
                    {(
                      previewOrder?.basePrice *
                      (previewOrder?.promotion / 100)
                    ).toLocaleString("vi-VN")}{" "}
                    đ
                  </Text>
                </View>
              )}

              <View style={[styles.billTotalRow, { marginTop: 10 }]}>
                <Text style={[styles.billTotalLabel, { fontSize: 16 }]}>
                  THANH TOÁN:
                </Text>
                <Text
                  style={[
                    styles.billTotalValue,
                    { fontSize: 18, color: "red" },
                  ]}
                >
                  {(
                    Math.floor(previewOrder?.totalPrice / 1000) * 1000
                  ).toLocaleString("vi-VN")}{" "}
                  đ
                </Text>
              </View>
              <Text
                style={{
                  textAlign: "right",
                  fontSize: 11,
                  fontStyle: "italic",
                }}
              >
                (Đã làm tròn)
              </Text>
            </View>

            <Text style={styles.asciiDivider}>
              ---------------------------------------------------
            </Text>

            <Text style={styles.billFooter}>
              Chân thành cảm ơn quý khách đã tin tưởng và ủng hộ{"\n"}
              Tích lũy 10 tem giặt 5kg cho lần giặt tiếp theo
            </Text>

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
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 14 },
  title: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  sectionTitle: { marginTop: 12, fontWeight: "800", color: "#4f46e5" },
  inputDivider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 6 },
  // input: {
  //   borderWidth: 1,
  //   borderColor: "#d1d5db",
  //   borderRadius: 10,
  //   padding: 12,
  //   marginBottom: 10,
  // },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginBottom: 10,
  },
  addBtn: {
    backgroundColor: "#22c55e",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  totalBox: {
    backgroundColor: "#eef2ff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  totalValue: { fontWeight: "800", color: "#4338ca" },
  button: {
    backgroundColor: "#4f46e5",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  // bill: { width: 240, backgroundColor: "#fff", padding: 14, borderRadius: 10 },
  // billTotal: { marginTop: 10, fontWeight: "900" },
  logo: { width: 120, height: 40, alignSelf: "center", marginBottom: 8 },
  tableBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden", // 👈 bo góc ăn cả header
    marginBottom: 12,
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6", // 👈 xám nhạt
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },

  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
  },

  th: {
    fontWeight: "700",
    fontSize: 13,
    color: "#374151",
  },

  td: {
    fontSize: 13,
    color: "#111827",
  },
  inputLabel: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  removeIcon: {
    color: "#dc2626", // đỏ nhẹ
    fontSize: 18,
    fontWeight: "900",
  },
  tdWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  logoBox: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },

  bill: {
    width: 280,
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 14,
    borderRadius: 10,
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
    fontSize: 13,
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
    textAlign: "left",
  },

  qrBox: {
    height: 160,
    width: 160,
    marginTop: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    alignSelf: "center",
  },

  qrImage: {
    width: 150,
    height: 150,
  },

  closeBtn: {
    backgroundColor: "#dc2626",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  billTableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingBottom: 4,
    marginBottom: 4,
  },

  billTotalLabel: {
    fontSize: 14,
    fontWeight: "900",
  },

  billTotalValue: {
    fontSize: 14,
    fontWeight: "900",
  },
  asciiDivider: {
    fontSize: 10,
    color: "#000",
    letterSpacing: 1, // Tạo khoảng cách cho các dấu gạch thẳng hơn
    marginVertical: 4,
    textAlign: "center",
  },
  billTableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  billTd: {
    fontSize: 13,
    color: "#000",
    lineHeight: 18,
  },
  billTh: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
  },
  billTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  flex1: {
    flex: 1,
  },

  // Lưu ý: Đảm bảo style .input của bạn không có width cố định (ví dụ width: '100%')
  // để nó tự co giãn theo View bao ngoài.
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    // width: '100%', // Đảm bảo nếu có dòng này thì flex: 1 ở trên sẽ quản lý nó
  },
});
