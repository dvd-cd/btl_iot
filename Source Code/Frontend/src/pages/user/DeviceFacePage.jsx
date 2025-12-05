// src/pages/user/DeviceFacePage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import faceApi from "../../api/faceApi";
import "../../styles/DeviceFacePage.css";

const DeviceFacePage = () => {
  const { deviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  // faces provided by navigation state from UserDeviceListPage
  // faces may be an array of URL strings (old) or objects { id, url, name }
  const navFaces = location?.state?.faces || [];
  const navDevice = location?.state?.device;
  const faces = navFaces || [];
  // selectedFiles: [{ file, previewUrl }]
  const [selectedFiles, setSelectedFiles] = useState([]);
  // single batch name for all uploaded files
  const [batchName, setBatchName] = useState("");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) return;

    const ok = window.confirm("Bạn có chắc muốn upload các ảnh này?");
    if (!ok) return;

    try {
      // pass array of { file } and single batchName to faceApi
      await faceApi.registerFace(deviceId, selectedFiles, batchName);
      // after successful upload, navigate back to device list
      navigate("/user/devices");
    } catch (err) {
      console.error(err);
      window.alert("Upload thất bại, thử lại sau");
    }
  };

  const handleDelete = async (faceId) => {
    const ok = window.confirm("Bạn có chắc muốn xóa ảnh khuôn mặt này?");
    if (!ok) return;

    try {
      // encode faceId in case it's a URL or contains chars
      const id = encodeURIComponent(faceId);
      await faceApi.deleteFace(deviceId, id);
      // after successful delete, navigate back to device detail
      navigate(`/user/devices/${deviceId}`);
    } catch (err) {
      console.error(err);
      window.alert("Xóa thất bại, thử lại sau");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const mapped = files.map((f) => ({ file: f, previewUrl: URL.createObjectURL(f) }));
    // append to existing selectedFiles
    setSelectedFiles((prev) => [...prev, ...mapped]);
  };

  // cleanup preview URLs when unmount or selectedFiles change
  React.useEffect(() => {
    return () => {
      selectedFiles.forEach((s) => {
        if (s.previewUrl) URL.revokeObjectURL(s.previewUrl);
      });
    };
  }, [selectedFiles]);

  return (
    <div className="device-face-container">
      <h1>Quản lý khuôn mặt</h1>
      <p className="device-name">Thiết bị: {navDevice?.deviceName || deviceId}</p>

      <h2>Danh sách khuôn mặt</h2>
      <ul className="face-list">
        {faces && faces.length > 0 ? (
          faces.map((f, idx) => {
            // normalize name and id
            const name = typeof f === 'string' ? '' : f.name || f.label || '';
            const id = typeof f === 'string' ? f : f.id || f._id || f.uid || null;

            // normalize to array of urls
            const extractUrls = (face) => {
              if (!face) return [];
              if (typeof face === 'string') return [face];
              if (Array.isArray(face.imageURL) && face.imageURL.length) return face.imageURL;
              if (Array.isArray(face.faceUrl) && face.faceUrl.length) return face.faceUrl;
              if (Array.isArray(face.image) && face.image.length) return face.image;
              if (Array.isArray(face.urls) && face.urls.length) return face.urls;
              if (typeof face.imageURL === 'string' && face.imageURL) return [face.imageURL];
              if (typeof face.faceUrl === 'string' && face.faceUrl) return [face.faceUrl];
              if (typeof face.image === 'string' && face.image) return [face.image];
              if (typeof face.url === 'string' && face.url) return [face.url];
              if (typeof face.urls === 'string' && face.urls) return [face.urls];
              return [];
            };

            const urls = extractUrls(f);

            return (
              <li key={idx} className="face-item">
                <div className="face-meta">
                  <div className="face-name">{name || `Khuôn mặt ${idx + 1}`}</div>
                </div>
                <div className="face-group-images">
                  {urls.length > 0 ? (
                    urls.map((url, i) => (
                      <a key={`${idx}-${i}`} href={url} target="_blank" rel="noreferrer">
                        <img src={url} alt={`face-${idx}-${i}`} className="face-thumb" />
                      </a>
                    ))
                  ) : (
                    <div className="no-face-urls muted">Không có ảnh cho mục này</div>
                  )}
                </div>
                <div className="face-actions">
                  <button className="btn-delete" onClick={() => handleDelete(id || (urls[0] || ''))}>Xóa</button>
                </div>
              </li>
            );
          })
        ) : (
          <li className="no-faces">Chưa có ảnh khuôn mặt</li>
        )}
      </ul>

      <h2>Thêm ảnh khuôn mặt</h2>
      <form onSubmit={handleUpload} className="upload-form">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />

        <div className="form-group">
          <label htmlFor="batchName">Tên nhóm (áp dụng cho tất cả ảnh)</label>
          <input
            id="batchName"
            type="text"
            placeholder="Ví dụ: Gia đình - khách 2025"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="preview-list">
            <p>Preview:</p>
            <div className="preview-grid">
              {selectedFiles.map((s, i) => (
                <div key={i} className="preview-item">
                  <img src={s.previewUrl} alt={`sel-${i}`} style={{ maxWidth: 160, maxHeight: 160 }} />
                  <div className="preview-filename">{s.file.name}</div>
                  <button type="button" className="btn-remove" onClick={() => setSelectedFiles((prev) => prev.filter((_, idx) => idx !== i))}>Xóa</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit">Upload</button>
      </form>
    </div>
  );
};

export default DeviceFacePage;
