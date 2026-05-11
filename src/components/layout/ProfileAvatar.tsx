"use client";
import React, { useState, useRef } from "react";

interface ProfileAvatarProps {
  user: { name: string; avatar?: string; role?: string };
  onAvatarUpdate: (newAvatarUrl: string) => void;
}

export default function ProfileAvatar({ user, onAvatarUpdate }: ProfileAvatarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(!menuOpen);
  };

  const openModal = () => {
    setMenuOpen(false);
    setModalOpen(true);
    setMessage(null);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const closeModal = () => {
    if (isUploading) return;
    setModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setMessage({ text: "حجم الملف يجب أن لا يتجاوز 2 ميجابايت", type: "error" });
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage({ text: "الصيغة غير مدعومة. يسمح بـ JPG, PNG, WEBP فقط", type: "error" });
      return;
    }

    setMessage(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل رفع الصورة");
      }

      setMessage({ text: "تم تحديث الصورة بنجاح!", type: "success" });
      onAvatarUpdate(data.avatar); // Update parent state immediately
      
      // Close modal after success
      setTimeout(() => {
        setModalOpen(false);
      }, 1500);
      
    } catch (error: any) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Avatar Display */}
      <button
        onClick={handleAvatarClick}
        className="flex items-center justify-center rounded-full transition-all relative overflow-hidden"
        style={{
          width: "28px",
          height: "28px",
          background: "linear-gradient(135deg, #c8962e, #e8c068)",
          border: "2px solid rgba(200,150,46,0.3)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        aria-label="خيارات الملف الشخصي"
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold text-white">
            {user.name?.charAt(0)?.toUpperCase() || "U"}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div
            className="absolute left-0 mt-2 w-48 rounded-xl shadow-lg z-50 animate-fade-in-up"
            style={{
              background: "#ffffff",
              border: "1px solid rgba(200, 150, 46, 0.18)",
            }}
          >
            <div className="p-2">
              <button
                onClick={openModal}
                className="w-full text-right px-4 py-2 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                style={{ color: "#3d3730" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(200, 150, 46, 0.08)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                🖼️ تغيير الصورة
              </button>
            </div>
          </div>
        </>
      )}

      {/* Upload Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          
          <div
            className="relative w-full max-w-md p-6 rounded-2xl shadow-2xl animate-scale-up"
            style={{
              background: "#faf6ee", // Matching theme background
              border: "1px solid rgba(200, 150, 46, 0.3)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold" style={{ color: "#3d3730" }}>تحديث صورة الملف الشخصي</h3>
              <button onClick={closeModal} disabled={isUploading} className="text-gray-500 hover:text-red-500 transition-colors">
                ✕
              </button>
            </div>

            <div className="flex flex-col items-center gap-6">
              {/* Preview Avatar */}
              <div
                className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center relative group"
                style={{
                  background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                  border: "4px solid rgba(200, 150, 46, 0.2)",
                  boxShadow: "0 8px 24px rgba(200, 150, 46, 0.15)",
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : user.avatar ? (
                  <img src={user.avatar} alt="Current" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-bold text-gray-400">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}

                {/* Overlay to click */}
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-white text-sm font-bold">اختر صورة</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                الصيغ المسموحة: JPG, PNG, WEBP<br />الحد الأقصى: 2MB
              </p>

              {/* Message Toast */}
              {message && (
                <div 
                  className="w-full p-3 rounded-lg text-sm text-center font-semibold"
                  style={{
                    background: message.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                    color: message.type === "success" ? "#059669" : "#dc2626",
                    border: `1px solid ${message.type === "success" ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                  }}
                >
                  {message.text}
                </div>
              )}

              {/* Hidden Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png, image/webp"
                className="hidden"
              />

              {/* Actions */}
              <div className="w-full flex gap-3 mt-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm transition-all"
                  style={{
                    background: "rgba(200, 150, 46, 0.1)",
                    color: "#c8962e",
                    border: "1px solid rgba(200, 150, 46, 0.2)",
                  }}
                  onMouseEnter={(e) => !isUploading && (e.currentTarget.style.background = "rgba(200, 150, 46, 0.15)")}
                  onMouseLeave={(e) => !isUploading && (e.currentTarget.style.background = "rgba(200, 150, 46, 0.1)")}
                >
                  تصفح الملفات
                </button>
                
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  style={{
                    background: "linear-gradient(135deg, #c8962e, #b0831f)",
                    boxShadow: "0 4px 12px rgba(200, 150, 46, 0.2)",
                  }}
                >
                  {isUploading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      جاري الحفظ...
                    </>
                  ) : (
                    "حفظ الصورة"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
