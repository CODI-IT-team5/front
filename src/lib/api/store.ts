import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";
import { MyProductsResponse } from "@/types/sellerProduct";
import { Store, StoreDetailResponse } from "@/types/store";
import { toStoreRequestBody } from "@/utils/formData/toStoreFormData";
import axios from "axios";
import { getAxiosInstance } from "./axiosInstance";
import { uploadImageToS3 } from "./products";

// 스토어 등록
export async function createStore(data: StoreCreateForm): Promise<StoreDetailResponse> {
  const axiosInstance = getAxiosInstance();

  // 1. 이미지가 File이면 먼저 S3에 업로드
  let imageId: string | undefined = data.imageId;

  if (data.image instanceof File) {
    const uploadResult = await uploadImageToS3(data.image);
    imageId = uploadResult.data.id;
  }

  if (!imageId) {
    throw new Error("imageId is required");
  }

  // 2. JSON body 생성
  const body = toStoreRequestBody(data, imageId);

  // 3. 스토어 생성 요청
  const res = await axiosInstance.post("/stores", body);
  return res.data;
}

// 내 스토어 조회
export const getMyStore = async (): Promise<StoreDetailResponse | null> => {
  const axiosInstance = getAxiosInstance();
  try {
    const response = await axiosInstance.get("/stores/detail/my");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // 스토어 없음 404 에러
    }
    throw error; // 그 외 에러
  }
};

// 스토어 수정 [핵심 수정 부분]
export async function editStore(storeId: string, data: StoreCreateForm): Promise<StoreDetailResponse> {
  const axiosInstance = getAxiosInstance();

  // 1. 이미지가 File이면 먼저 S3에 업로드
  let imageId = data.imageId;

  if (data.image instanceof File) {
    const uploadResult = await uploadImageToS3(data.image);
    imageId = uploadResult.data.id;
    console.log(uploadResult);
    console.log(imageId);
  }

  // 2. JSON body 생성
  // (Tip: imageId가 없으면 빈 문자열 ""을 넣어서 빌드 에러를 막습니다.)
  const body = toStoreRequestBody(data, imageId ?? "");

  // 3. 전송 전 데이터 정리 (여기가 해결책!)
  // imageId가 빈 문자열("")인 경우, 이는 유효한 ID가 아니므로
  // 아예 전송 데이터에서 imageId 필드를 삭제합니다.
  // 이렇게 하면 백엔드는 이미지 변경 요청이 없는 것으로 간주합니다.
  if (body.imageId === "") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (body as any).imageId;
  }

  // 4. 스토어 수정 요청
  const response = await axiosInstance.patch(`/stores/${storeId}`, body);
  return response.data;
}

// 스토어 상세 조회
export const getStoreDetail = async (storesId: string): Promise<Store> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get(`/stores/${storesId}`);
  return response.data;
};

// 관심 스토어 등록
export const postFavoriteStore = async (storeId: string) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.post(`/stores/${storeId}/favorite`);
  return response.data;
};

// 관심 스토어 삭제
export const deleteFavoriteStore = async (storeId: string) => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.delete(`/stores/${storeId}/favorite`);
  return response.data;
};

// 내 스토어 등록 상품 조회
export const getMyProduct = async (page: number, pageSize: number): Promise<MyProductsResponse> => {
  const axiosInstance = getAxiosInstance();
  const response = await axiosInstance.get("/stores/detail/my/product", {
    params: {
      page,
      pageSize,
    },
  });
  return response.data;
};