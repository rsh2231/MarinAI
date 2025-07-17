import { toast } from "react-toastify";

/**
 * 서버에 이미지를 업로드하고 URL을 반환합니다.
 * @param imageFile - 업로드할 파일 객체
 * @returns 성공 시 이미지 URL, 실패 시 null
 */
export async function uploadImage(imageFile: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "이미지 업로드에 실패했습니다.");
    }

    const data = await res.json();
    return data.url;
  } catch (error) {
    console.error(error);
    toast.error((error as Error).message);
    return null;
  }
}