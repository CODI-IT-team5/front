import { getAxiosInstance } from "@/lib/api/axiosInstance";
import { uploadImageToS3 } from "@/lib/api/products";
import { FavoriteStores } from "@/types/store";
import { AxiosError } from "axios";

interface EditProfileParams {
  currentPassword: string;
  nickname?: string;
  newPassword?: string;
  imageFile?: File | null; // 이미지 파일 추가
}

export const editUserProfile = async ({ currentPassword, nickname, newPassword, imageFile }: EditProfileParams) => {
  const axiosInstance = getAxiosInstance();

  // 1. 이미지가 File이면 먼저 S3에 업로드
  let imageId: string | undefined;
  if (imageFile instanceof File) {
    const uploadResult = await uploadImageToS3(imageFile);
    imageId = uploadResult.data.id;
  }

  // 2. JSON body 생성
  const body: {
    currentPassword: string;
    name?: string;
    password?: string;
    imageId?: string;
  } = {
    currentPassword,
  };

  if (nickname && nickname.trim() !== "") {
    body.name = nickname.trim();
  }

  if (newPassword && newPassword.trim() !== "") {
    body.password = newPassword.trim();
  }

  if (imageId) {
    body.imageId = imageId;
  }

  try {
    const { data } = await axiosInstance.patch("/users/me", body);
    return data;
  } catch (err) {
    const error = err as AxiosError;
    console.error("프로필 수정 실패", error.response?.data || error.message);
    throw err;
  }
};

export const getFavoriteStore = async (): Promise<FavoriteStores[]> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/users/me/likes`);
  return response.data;
};
