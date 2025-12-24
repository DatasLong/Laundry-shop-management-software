import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD7C67vuJWndMMUkgFoyOYkrrFFidif3f4",
  authDomain: "laundry-shop-management.firebaseapp.com",
  projectId: "laundry-shop-management",
  storageBucket: "laundry-shop-management.firebasestorage.app",
  messagingSenderId: "395999680826",
  appId: "1:395999680826:web:72ef992d9282dd19c95803",
};

// SỬA ĐOẠN NÀY: Kiểm tra nếu đã có App thì dùng lại, tránh lỗi duplicate
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
