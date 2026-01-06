import { StoreCreateForm } from "@/lib/schemas/storecreate.schema";

interface StoreRequestBody {
  name: string;
  address: string;
  detailAddress: string;
  phoneNumber: string;
  content: string;
  imageId?: string;
}

export function toStoreRequestBody(data: StoreCreateForm, imageId?: string): StoreRequestBody {
  const body: StoreRequestBody = {
    name: data.storeName,
    address: data.address.basic,
    detailAddress: data.address.detail ?? "",
    phoneNumber: data.phoneNumber,
    content: data.description,
  };

  if (imageId) {
    body.imageId = imageId;
  }

  return body;
}
