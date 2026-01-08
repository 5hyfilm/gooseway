export const checkFileSizeType = ({
  file: imageFile,
  allowedType = [],
}: {
  file: File;
  allowedType: string[];
}) => {
  const file = imageFile;
  const size = Math.round(file.size / 1024);
  if (size > 10240) {
    return false;
  }
  const idxDot = file.name.lastIndexOf(".") + 1;
  const extFile = file.name.slice(idxDot).toLowerCase();
  if (!allowedType.includes(extFile)) {
    return false;
  }
  return true;
};