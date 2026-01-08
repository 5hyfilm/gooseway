// src/components/admin/WheelchairInfoAdmin.tsx
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Select } from "antd";
import { WheelchairInfo } from "@/lib/types/user";
interface WheelchairInfoAdminProps {
  initialData?: WheelchairInfo;
  onSave: (data: WheelchairInfo) => void;
}

const defaultWheelchairInfo: WheelchairInfo = {
  isFoldable: undefined,
  widthRegularCm: undefined,
  lengthRegularCm: undefined,
  weightKg: undefined,
  widthFoldedCm: undefined,
  lengthFoldedCm: undefined,
  heightFoldedCm: undefined,
  customizations: [],
  notes: "",
};

export function WheelchairInfoAdmin({
  initialData,
  onSave,
}: WheelchairInfoAdminProps) {
  // Helper to normalize initialData: set regular values to 0 if null/undefined
  const normalizeWheelchairData = (data?: WheelchairInfo): WheelchairInfo => ({
    ...defaultWheelchairInfo,
    ...data,
    widthRegularCm: data?.widthRegularCm ?? undefined,
    lengthRegularCm: data?.lengthRegularCm ?? undefined,
    weightKg: data?.weightKg ?? undefined,
  });

  const [wheelchairData, setWheelchairData] = useState<WheelchairInfo>(
    normalizeWheelchairData(initialData)
  );

  // เมื่อ initialData เปลี่ยน ให้อัพเดต wheelchairData
  useEffect(() => {
    setWheelchairData(normalizeWheelchairData(initialData));
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    let newData: WheelchairInfo;

    // เมื่อเปลี่ยน foldability ให้จัดการ foldedDimensions
    if (name === "isFoldable") {
      const isFoldable = value === "true";
      newData = {
        ...wheelchairData,
        isFoldable,
        ...(isFoldable
          ? {}
          : {
              widthFoldedCm: undefined,
              lengthFoldedCm: undefined,
              heightFoldedCm: undefined,
            }),
      };
    } else if (
      [
        "widthRegularCm",
        "lengthRegularCm",
        "weightKg",
        "widthFoldedCm",
        "lengthFoldedCm",
        "heightFoldedCm",
      ].includes(name)
    ) {
      newData = {
        ...wheelchairData,
        [name]: value === "" ? undefined : parseFloat(value),
      };
    } else if (name === "additionalNotes" || name === "notes") {
      newData = {
        ...wheelchairData,
        notes: value,
      };
    } else {
      newData = {
        ...wheelchairData,
        [name]: value,
      };
    }

    setWheelchairData(newData);
    onSave(newData);
  };

  const handleSelectChange = (value: string) => {
    const newData = {
      ...wheelchairData,
      isFoldable: value === "true",
      ...(value === "true"
        ? {}
        : {
            widthFoldedCm: undefined,
            lengthFoldedCm: undefined,
            heightFoldedCm: undefined,
          }),
    };
    setWheelchairData(newData);
    onSave(newData);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">ข้อมูลรถเข็น</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label
            htmlFor="foldability"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            ความสามารถในการพับ
          </label>
          <Select
            id="foldability"
            value={wheelchairData.isFoldable === undefined ? undefined : wheelchairData.isFoldable ? "true" : "false"}
            onChange={handleSelectChange}
            className="w-full h-11"
            options={[
              { value: "true", label: <span className="text-base">พับได้</span> },
              { value: "false", label: <span className="text-base">พับไม่ได้</span> },
            ]}
            placeholder={<span className="text-base text-gray-400">ความสามารถในการพับ</span>}
            suffixIcon={<ChevronDown size={16} className="text-gray-500" />}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">
              ขนาดปกติ
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="regular-width"
                className="block text-xs text-gray-500 mb-1"
              >
                ความกว้าง (ซม.)
              </label>
              <input
                type="number"
                id="regular-width"
                name="widthRegularCm"
                value={wheelchairData?.widthRegularCm ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="ระบุความกว้าง"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label
                htmlFor="regular-length"
                className="block text-xs text-gray-500 mb-1"
              >
                ความยาว (ซม.)
              </label>
              <input
                type="number"
                id="regular-length"
                name="lengthRegularCm"
                value={wheelchairData?.lengthRegularCm ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="ระบุความยาว"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
            <div>
              <label
                htmlFor="regular-weight"
                className="block text-xs text-gray-500 mb-1"
              >
                น้ำหนัก (กก.)
              </label>
              <input
                type="number"
                id="regular-weight"
                name="weightKg"
                value={wheelchairData?.weightKg ?? ""}
                onChange={handleChange}
                onWheel={(e) => e.currentTarget.blur()}
                placeholder="ระบุน้ำหนัก"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>
        </div>

        {wheelchairData.isFoldable && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              ขนาดเมื่อพับ
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="folded-width"
                  className="block text-xs text-gray-500 mb-1"
                >
                  ความกว้าง (ซม.)
                </label>
                <input
                  type="number"
                  id="folded-width"
                  name="widthFoldedCm"
                  value={wheelchairData?.widthFoldedCm ?? ""}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="ระบุความกว้าง"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label
                  htmlFor="folded-length"
                  className="block text-xs text-gray-500 mb-1"
                >
                  ความยาว (ซม.)
                </label>
                <input
                  type="number"
                  id="folded-length"
                  name="lengthFoldedCm"
                  value={wheelchairData?.lengthFoldedCm ?? ""}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="ระบุความยาว"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <label
                  htmlFor="folded-height"
                  className="block text-xs text-gray-500 mb-1"
                >
                  ความสูง (ซม.)
                </label>
                <input
                  type="number"
                  id="folded-height"
                  name="heightFoldedCm"
                  value={wheelchairData?.heightFoldedCm ?? ""}
                  onChange={handleChange}
                  onWheel={(e) => e.currentTarget.blur()}
                  placeholder="ระบุความสูง"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="additional-notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            หมายเหตุเพิ่มเติม
          </label>
          <textarea
            id="additional-notes"
            name="additionalNotes"
            value={wheelchairData.notes ?? ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ระบุข้อมูลเพิ่มเติมเกี่ยวกับรถเข็น"
          />
        </div>
        
      </div>
    </div>
  );
}
