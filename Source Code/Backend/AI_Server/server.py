import os
import numpy as np
import face_recognition
from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from dotenv import load_dotenv
from io import BytesIO
from PIL import Image
import requests

# 1. Load biến môi trường
load_dotenv()
MONGO_URI = os.getenv("MONGODB_URI")

# 2. Kết nối MongoDB
client = MongoClient(MONGO_URI)
db = client["smartlock"]
users_col = db["facebiometrics"]

# 3. Khởi tạo AI
print("--- Đang tải Model AI (face_recognition)... ---")
print("--- AI Sẵn sàng ---")

app = Flask(__name__)

# --- HÀM TRỢ GIÚP: DOWNLOAD ẢNH TỪ URL ---


def download_image_from_url(image_url):
    """
    Download ảnh từ URL và trả về numpy array (RGB)
    """
    try:
        response = requests.get(image_url, timeout=10)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content)).convert("RGB")
        return np.array(image)
    except Exception as e:
        print(f"  ❌ Lỗi download ảnh từ {image_url}: {e}")
        return None


# --- HÀM TRỢ GIÚP: TẠO VECTOR TỪ ẢNH ---


def create_face_vector(rgb_frame):
    """
    Tạo face vector (128 chiều) từ ảnh
    Return: vector nếu thành công, None nếu thất bại
    """
    try:
        # Nhận diện khuôn mặt
        face_locations = face_recognition.face_locations(rgb_frame)
        if not face_locations:
            return None

        # Tạo encoding
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)
        if not face_encodings:
            return None

        return face_encodings[0]  # Lấy face đầu tiên (128 chiều)

    except Exception as e:
        print(f"  ❌ Lỗi tạo vector: {e}")
        return None


# --- HÀM CỐT LÕI: PROCESS REGISTRATION ---


def process_registration(user_id):
    try:
        # Tìm user theo ID
        user = users_col.find_one({"_id": ObjectId(user_id)})
        if not user:
            return False, "User not found"

        # Lấy danh sách faceFeature
        face_features = user.get("faceFeature", [])
        if not face_features:
            return False, "No face features found"

        print(
            f"Đang xử lý {len(face_features)} ảnh cho user {user.get('name', 'Unknown')}..."
        )

        success_count = 0

        # Xử lý từng ảnh trong faceFeature
        for idx, feature in enumerate(face_features):
            image_url = feature.get("imageURL")
            if not image_url:
                print(f"  [{idx+1}/{len(face_features)}] ❌ Không có imageURL")
                continue

            print(f"  [{idx+1}/{len(face_features)}] Đang xử lý: {image_url[:50]}...")

            # Download ảnh
            rgb_frame = download_image_from_url(image_url)
            if rgb_frame is None:
                continue

            print(f"      ✅ Download ảnh thành công")

            # Tạo face vector
            face_vector = create_face_vector(rgb_frame)
            if face_vector is None:
                print(f"      ❌ Không thể tạo vector (không phát hiện khuôn mặt?)")
                continue

            print(f"      ✅ Tạo vector thành công")

            # Update faceVector của object này
            users_col.update_one(
                {
                    "_id": ObjectId(user_id),
                    "faceFeature.public_id": feature.get("public_id"),
                },
                {"$set": {"faceFeature.$.faceVector": face_vector.tolist()}},
            )

            print(f"      ✅ Lưu vào DB thành công")
            success_count += 1

        if success_count == 0:
            return False, f"Không thể tạo vector cho bất kỳ ảnh nào"

        return True, f"Hoàn tất: {success_count}/{len(face_features)} ảnh được xử lý"

    except Exception as e:
        print(f"Lỗi: {e}")
        return False, str(e)


# --- API ĐỂ WEB SERVER GỌI ---
@app.route("/api/complete-registration", methods=["POST"])
def complete_registration():
    data = request.json
    id = data.get("id")

    if not id:
        return jsonify({"success": False, "message": "Missing faceBiometric_id"}), 400

    success, msg = process_registration(id)

    if success:
        return jsonify({"success": True, "message": msg}), 200
    else:
        print(msg)
        return jsonify({"success": False, "message": msg}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
