from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId  # Để xử lý _id của Mongo
import face_recognition
import os
import numpy as np
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# 1. KẾT NỐI MONGODB
uri = os.getenv("MONGODB_URI")
try:
    client = MongoClient(uri)
    client.admin.command('ping')  # Test kết nối
    print("✅ Đã kết nối thành công đến MongoDB Cloud!")
except Exception as e:
    print(f"❌ Kết nối thất bại: {e}")
    exit()
db = client["SmartLockDB"]
users_collection = db["users"]

print("✅ Đã kết nối đến MongoDB")

# 2. API ĐỂ "TRAIN" (MÃ HÓA) NGƯỜI DÙNG MỚI
# Web Server sẽ gọi vào đây sau khi upload ảnh xong


@app.route('/train_user', methods=['POST'])
def train_user():
    try:
        # Lấy user_id từ request của Web Server
        data = request.json
        user_id_str = data.get('user_id')

        if not user_id_str:
            return jsonify({"status": "error", "message": "Thiếu user_id"}), 400

        print(f"🔄 Bắt đầu xử lý cho User ID: {user_id_str}")

        # Tìm user trong MongoDB
        # Lưu ý: ObjectId phải import từ bson
        user = users_collection.find_one({"_id": ObjectId(user_id_str)})

        if not user:
            return jsonify({"status": "error", "message": "Không tìm thấy User trong DB"}), 404

        # Lấy danh sách đường dẫn ảnh từ DB
        # Giả sử DB lưu: "images": ["uploads/pic1.jpg", "uploads/pic2.jpg"]
        image_paths = user.get('images', [])

        if not image_paths:
            return jsonify({"status": "error", "message": "User này chưa có ảnh nào"}), 400

        face_vectors = []  # Mảng chứa các vector kết quả

        # --- BẮT ĐẦU VÒNG LẶP XỬ LÝ ẢNH ---
        count_success = 0

        for img_path in image_paths:
            # Kiểm tra file có tồn tại không
            if not os.path.exists(img_path):
                print(f"⚠️ Ảnh không tồn tại: {img_path}")
                continue

            try:
                # 1. Load ảnh
                image = face_recognition.load_image_file(img_path)

                # 2. Tìm và Mã hóa (Chỉ lấy khuôn mặt đầu tiên tìm thấy)
                # Dùng model="hog" cho nhanh, hoặc "cnn" cho chính xác
                encodings = face_recognition.face_encodings(image)

                if len(encodings) > 0:
                    # Lấy vector đầu tiên
                    vector = encodings[0]

                    # Chuyển numpy array thành list chuẩn của Python để lưu vào Mongo
                    vector_list = vector.tolist()

                    face_vectors.append(vector_list)
                    count_success += 1
                    print(f"✅ Đã mã hóa xong: {img_path}")
                else:
                    print(f"⚠️ Không tìm thấy mặt trong ảnh: {img_path}")

            except Exception as e:
                print(f"❌ Lỗi khi xử lý ảnh {img_path}: {e}")

        # --- KẾT THÚC VÒNG LẶP ---

        if count_success == 0:
            return jsonify({"status": "error", "message": "Không trích xuất được vector nào từ ảnh đã gửi"}), 400

        # 3. UPDATE MONGODB
        # Lưu mảng face_vectors vào lại document của user đó
        users_collection.update_one(
            {"_id": ObjectId(user_id_str)},
            {"$set": {"face_vectors": face_vectors, "is_trained": True}}
        )

        print(f"🎉 Hoàn tất! Đã lưu {count_success} vector vào DB.")

        return jsonify({
            "status": "success",
            "message": f"Đã training xong {count_success} ảnh",
            "vectors_count": count_success
        }), 200

    except Exception as e:
        print(f"❌ Lỗi Server: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# Chạy Server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
