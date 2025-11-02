export type QaPreviewImage = {
  label: string;
  /*
   * @yellow unscanned in odu step.
   * @white unscanned in all other type
   * @green accepted
   * @red rejected, send to wash
   * */
  color: 'white' | 'green' | 'red' | 'yellow';
  imageUrls: string[];
};
