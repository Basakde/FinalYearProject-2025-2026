export interface EditableItem {
  imageUri: string;
  processedUri?: string;
  imgDescription?:string
  category?: string;
  subCategory?: string;
  colors?: string[];
  materials?: string[];
  occasion?: string[];
  season?: string[];
}
