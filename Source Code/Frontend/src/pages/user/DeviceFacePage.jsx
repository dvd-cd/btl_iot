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
      await faceApi.registerFace(deviceId, selectedFiles, batchName);
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
      console.log("Deleting face with id:", faceId, "\t",id,"\turl", deviceId);
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
              if (Array.isArray(face.imageURL) && face.imageURL.length) return face.imageURL;
              if (typeof face.imageURL === 'string' && face.imageURL) return [face.imageURL];
              
              return [];
            };

            const urls = extractUrls(f);

            return (
              <li key={idx} className="face-item">
                <div className="face-group-images">
                  {urls.length > 0 ? (
                    urls.map((url, i) => (
                      <>
                        <a key={`${idx}-${i}`} href={url} target="_blank" rel="noreferrer">
                          <img src={url} alt={`face-${idx}-${i}`} className="face-thumb" />
                          <div className="face-name">{name || `Khuôn mặt ${idx + 1}`}</div>
                        </a>
                        <div className="face-actions">
                          <button className="btn-delete" onClick={() => handleDelete(deviceId, url)}>Xóa</button>
                        </div>
                      </>
                    ))
                  ) : (
                    <div className="no-face-urls muted">Không có ảnh cho mục này</div>
                  )}
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
