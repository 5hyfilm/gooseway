import { useEffect, useState } from "react";
import { X, Camera, ThumbsDown, ThumbsUp } from "lucide-react";
import type { LocationFeature, FeatureMediaImage } from "@/lib/types/location";
import { checkFileSizeType } from "../../../utils/file";
import { Upload as AntdUpload } from "antd";
import { usePathname } from "next/navigation";
import { updateRate } from "@/services/api/endpoints/location";

interface AccessibilityFeatureEditorProps {
  locationId?: number;
  features: LocationFeature[];
  onUpdate: (features: LocationFeature[]) => void;
  editable?: boolean;
}

interface FeatureMediaImageWithFile extends FeatureMediaImage {
  file?: File; // สำหรับเก็บไฟล์รูปภาพที่อัปโหลดใหม่
  isNew?: boolean;
}

export function AccessibilityDetailsEditor({
  locationId,
  features,
  onUpdate,
  editable = false, // ค่าเริ่มต้นคือ false (แสดงแบบดูได้อย่างเดียว)
}: AccessibilityFeatureEditorProps) {
  const pathname = usePathname();
  const [deletedImgIds, setDeletedImgIds] = useState<Record<number, number[]>>({});
  const [imageError, setImageError] = useState<Record<number, string>>({});
  
  // กำหนดชื่อคุณสมบัติการเข้าถึง
  const featureTranslations: Record<number, string> = {
    1: "ที่จอดรถ",
    2: "ทางเข้าหลัก",
    3: "ทางลาด",
    4: "ทางเดิน",
    5: "ลิฟต์",
    6: "ห้องน้ำ",
    7: "พื้นที่นั่ง",
    8: "พนักงานช่วยเหลือ",
    9: "อื่นๆ",
  };

  // ฟังก์ชันสำหรับการแปลงข้อมูลคุณสมบัติให้เป็นรูปแบบที่ต้องการ
  const getNormalizedFeatures = (
    featureTranslations: Record<number, string>,
    features: LocationFeature[] = []
  ) => {
    return Object.entries(featureTranslations).map(([featureIdStr, featureName]) => {
      const featureId = Number(featureIdStr);
      const feature = Array.isArray(features)
        ? features.find(f => f.featureId === featureId)
        : undefined;

      return {
        featureId,
        featureName,
        img: feature && Array.isArray(feature.img) ? feature.img : [],
        goodCount:  feature?.goodCount ?? 0,
        notGoodCount: feature?.notGoodCount ?? 0,
        isGood: feature?.isGood ?? null,
      };
    });
  };
  const normalizedFeatures = getNormalizedFeatures(featureTranslations, features);

  // จัดการการแก้ไขข้อมูลคุณสมบัติ
  const handleUpdateFeature = (featureId: number, updated: Partial<LocationFeature>) => {
    const index = features.findIndex(f => f.featureId === featureId);
    
    if (index === -1) {
      // ถ้าไม่พบ feature ในอาร์เรย์ ให้เพิ่มใหม่
      const newFeature: LocationFeature = {
        featureId,
        featureMediaId: 0,
        img: [],
        imageFiles: [],
        goodCount: 0,
        notGoodCount: 0,
        isGood: null,
        ...updated,
      };
      onUpdate([...features, newFeature]);
    } else {
      // ถ้าพบ feature แล้ว ให้อัปเดต
      const updatedFeatures = features.map((f, i) =>
        i === index ? { ...f, ...updated } : f
      );
      onUpdate(updatedFeatures);
    }
  };

  // ฟังก์ชันสำหรับการอัปเดตสถานะการโหวต
  const getUpdatedVoteState = (
    type: "goodCount" | "notGoodCount",
    currentIsGood: boolean | null,
    currentGoodCount: number,
    currentNotGoodCount: number
  ) => {
    let newIsGood: boolean | null = null;
    let newGoodCount = currentGoodCount;
    let newNotGoodCount = currentNotGoodCount;

    if (type === "goodCount") {
      if (currentIsGood === true) {
        newIsGood = null;
        newGoodCount = Math.max(0, currentGoodCount - 1);
      } else {
        newIsGood = true;
        newGoodCount = currentGoodCount + 1;
        if (currentIsGood === false) {
          newNotGoodCount = Math.max(0, currentNotGoodCount - 1);
        }
      }
    } else if (type === "notGoodCount") {
      if (currentIsGood === false) {
        newIsGood = null;
        newNotGoodCount = Math.max(0, currentNotGoodCount - 1);
      } else {
        newIsGood = false;
        newNotGoodCount = currentNotGoodCount + 1;
        if (currentIsGood === true) {
          newGoodCount = Math.max(0, currentGoodCount - 1);
        }
      }
    }

    return { newIsGood, newGoodCount, newNotGoodCount };
  };

  // ฟังก์ชันสำหรับการโหวต
  const handleRate = async (
    featureId: number,
    type: "goodCount" | "notGoodCount"
  ) => {
    if (!editable) return;

    const currentFeature = features.find(f => f.featureId === featureId);
    const currentIsGood = currentFeature?.isGood ?? null;
    const currentGoodCount = currentFeature?.goodCount ?? 0;
    const currentNotGoodCount = currentFeature?.notGoodCount ?? 0;

    const { newIsGood, newGoodCount, newNotGoodCount } = getUpdatedVoteState(
      type,
      currentIsGood,
      currentGoodCount,
      currentNotGoodCount
    );

    handleUpdateFeature(featureId, { 
      isGood: newIsGood,
      goodCount: newGoodCount,
      notGoodCount: newNotGoodCount
    });

    if (pathname.includes("edit") && locationId) {
      try {
        await saveRate(featureId, newIsGood);
      } catch (error) {
        handleUpdateFeature(featureId, { 
          isGood: currentIsGood,
          goodCount: currentGoodCount,
          notGoodCount: currentNotGoodCount
        });
        console.error("Error saving rate:", error);
      }
    }
  };

  const saveRate = async (featureId: number, isGood: boolean | null) => {
    if (locationId == null) return;

    try {
      await updateRate({
        locationId,
        featureId,
        isGood,
      });
    } catch (error) {
      console.error("Error updating rate:", error);
      throw new Error("เกิดข้อผิดพลาดในการบันทึกการโหวต");
    }
  };
  
  // เพิ่มรูปภาพใหม่ (รองรับหลายไฟล์)
  const handleAddImage = (featureId: number, files: File[]) => {
    let hasError = false;
    files.forEach(file => {
      if (!checkFileSizeType({ file, allowedType: ["jpg", "jpeg", "png"] })) {
        setImageError(prev => ({
          ...prev,
          [featureId]: "ไฟล์รูปต้องเป็น jpg, jpeg, png และขนาดไม่เกิน 10MB"
        }));
        hasError = true;
      }
    });
    if (hasError) return false;

    setImageError(prev => {
      const newErr = { ...prev };
      delete newErr[featureId];
      return newErr;
    });

    const index = features.findIndex(f => f.featureId === featureId);
    const feature = features[index];
    const imgArr = feature ? feature.img : [];
    const newImages: FeatureMediaImageWithFile[] = files.map(file => ({
      id: 0,
      imageUrl: URL.createObjectURL(file),
      featureId,
      file,
      isNew: true,
    }));

    if (index === -1) {
      onUpdate([
        ...features,
        {
          featureId,
          featureMediaId: 0,
          img: newImages,
          imageFiles: files,
          goodCount: 0,
          notGoodCount: 0,
          isGood: null,
        },
      ]);
    } else {
      handleUpdateFeature(featureId, {
        img: [...imgArr, ...newImages],
        imageFiles: [...(feature.imageFiles || []), ...files],
      });
    }
    return false;
  };

  // ลบรูปภาพ
  const handleRemoveImage = (featureId: number, imgIndex: number) => {
    const featureIndex = features.findIndex(f => f.featureId === featureId);
    const feature = features[featureIndex];
    if (featureIndex === -1 || !feature?.img?.[imgIndex]) return;

    const removedImg = feature.img[imgIndex] as FeatureMediaImageWithFile;

    if (!removedImg.isNew && removedImg.id) {
      setDeletedImgIds((prev) => ({
        ...prev,
        [feature.featureId]: [...(prev[feature.featureId] || []), removedImg.id],
      }));
    }

    const newImg = feature.img.filter((_, i) => i !== imgIndex);
    const newImageFiles = removedImg.isNew && removedImg.file
      ? (feature.imageFiles ?? []).filter(file => file !== removedImg.file)
      : (feature.imageFiles ?? []);

    handleUpdateFeature(featureId, { img: newImg, imageFiles: newImageFiles });
  };

  useEffect(() => {
    onUpdate(
      features.map((feature) => ({
        ...feature,
        deletedImgIds: deletedImgIds[feature.featureId] || [],
      }))
    );
  }, [deletedImgIds]);

  return (
     <div className="space-y-6">
      <h3 className="text-lg font-medium">คุณสมบัติการเข้าถึง</h3>
      {normalizedFeatures.map((feature) => (
        <div key={feature.featureId} className="border rounded-lg overflow-hidden bg-white">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="font-medium">{feature.featureName}</h4>
          </div>
          <div className="p-4 space-y-4">
            {/* โหวต */}
            {editable ? (
              <div>
                <h3 className="block text-sm font-medium text-gray-700 mb-2">
                  การประเมินการเข้าถึง
                </h3>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => handleRate(feature.featureId, "goodCount")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      feature.isGood === true
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-gray-100 text-gray-700 hover:bg-green-50"
                    }`}
                  >
                    {pathname.includes("edit") && (
                      <span>{feature.goodCount}</span>
                    )}
                    <ThumbsUp size={16} />
                    <span>ดี</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRate(feature.featureId, "notGoodCount")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                      feature.isGood === false
                        ? "bg-red-100 text-red-700 border border-red-300"
                        : "bg-gray-100 text-gray-700 hover:bg-red-50"
                    }`}
                  >
                    {pathname.includes("edit") && (
                      <span>{feature.notGoodCount}</span>
                    )}
                    <ThumbsDown size={16} />
                    <span>ไม่ดี</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="block text-sm font-medium text-gray-700 mb-2">
                  จำนวนโหวต
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">ถูกใจ</p>
                    <p className="font-medium text-gray-800">
                      {feature.goodCount}
                    </p>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-md border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">ไม่ถูกใจ</p>
                    <p className="font-medium text-gray-800">
                      {feature.notGoodCount}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* รูปภาพ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                รูปภาพ
              </label>
              {feature.img && feature.img.length > 0 && (
                <div className="max-h-96 overflow-y-auto mb-4">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {(feature.img ?? []).map((image, imageIdx) => (
                      <div key={image.imageUrl + imageIdx} className="relative aspect-video">
                        <img
                          src={image.imageUrl}
                          alt={`รูปภาพคุณสมบัติ`}
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(feature.featureId, imageIdx)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            <AntdUpload
              accept=".jpg,.jpeg,.png"
              multiple
              showUploadList={false}
              beforeUpload={(file, fileList) => {
                handleAddImage(feature.featureId, fileList as File[]);
                return false;
              }}
              customRequest={() => {}}
              style={{ width: "100%" }}
            >
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors mt-5">
                <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                <p className="mt-1 text-sm text-gray-500">
                  คลิกหรือวางไฟล์เพื่ออัปโหลดรูปภาพของ {featureTranslations[feature.featureId] || feature.featureId}
                </p>
              </div>
            </AntdUpload>
            {imageError[feature.featureId] && (
              <p className="text-red-500 text-xs mt-2">{imageError[feature.featureId]}</p>
            )}
            </div>
          </div>
        </div>
       ))}
    </div>
  );
}