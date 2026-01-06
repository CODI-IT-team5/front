import { ProductFormValues } from "@/lib/schemas/productForm.schema";

interface ProductRequestBody {
  name: string;
  price: number;
  categoryName: string;
  imageId?: string;
  stocks: Array<{ sizeId: number; quantity: number }>;
  discountRate?: number;
  discountStartTime?: string;
  discountEndTime?: string;
  content: string;
}

export function toProductRequestBody(data: ProductFormValues, imageId?: string): ProductRequestBody {
  // 재고
  const sizeNameToIdMap: Record<string, number> = {
    xs: 1,
    s: 2,
    m: 3,
    l: 4,
    xl: 5,
    free: 6,
  };
  const stocksArray = Object.entries(data.stocks || {})
    .filter(([, quantity]) => typeof quantity === "number")
    .map(([sizeName, quantity]) => ({
      sizeId: sizeNameToIdMap[sizeName.toLowerCase()],
      quantity: quantity as number,
    }));

  const body: ProductRequestBody = {
    name: data.name,
    price: data.price,
    categoryName: data.category.toLowerCase(),
    stocks: stocksArray,
    content: data.detail,
  };

  // 이미지 ID가 있으면 추가
  if (imageId) {
    body.imageId = imageId;
  }

  // 할인
  if (data.discount.enabled && typeof data.discount.value === "number") {
    body.discountRate = data.discount.value;

    if (data.discount.periodEnabled) {
      if (data.discount.periodStart) {
        body.discountStartTime = new Date(data.discount.periodStart).toISOString();
      }
      if (data.discount.periodEnd) {
        body.discountEndTime = new Date(data.discount.periodEnd).toISOString();
      }
    }
  }

  return body;
}
