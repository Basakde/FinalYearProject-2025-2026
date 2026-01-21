export interface EditableItem {
  id:string;
  imageUri: string;
  processedUri?: string;
  imgDescription?:string
  category?: string | null;
  subcategoryId: number | null;
  subcategoryName?: string; // optional, useful when displaying
  colors?: string[];
  materials?: string[];
  occasion?: string[];
  season?: string[];
  categoryId:number;
}

 export interface Category {
  id: number | null;
  name: string;
}

export interface Subcategory {
  id: number;
  name: string;
  category_id: number | null;
}

export interface WardrobeItem {
  id: string;
  image_url: string;
  category_id: number;
  img_description?: string;
}

export enum categories{
  Top=1,
  Bottom=2,
  Outerwear=3,
  Shoes=4,
  Accessory=5

}