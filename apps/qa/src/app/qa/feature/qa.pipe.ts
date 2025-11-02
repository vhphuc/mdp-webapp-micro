import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: 'imageWidth',
  standalone: true,
  pure: true
})
export class ImageWidthPipe implements PipeTransform {
  transform(imageCount: number): string {
    if (imageCount === 1) return `${100 * 2/3}%`;
    if (imageCount === 2) return `${100 * 1/2}%`;
    
    // Calculate optimal grid layout
    const colsPerRow = getOptimalColumns(imageCount);
    const widthPercentage = 100 / colsPerRow;
    
    return `${widthPercentage}%`;
  }

  
}

@Pipe({
  name: 'imageHeight',
  standalone: true,
  pure: true
})
export class ImageHeightPipe implements PipeTransform {
  transform(imageCount: number): string {
    if (imageCount <= 3) return '100%';
    
    // Calculate optimal grid layout
    const colsPerRow = getOptimalColumns(imageCount);
    const rows = Math.ceil(imageCount / colsPerRow);
    const heightPercentage = 100 / rows;
    
    return `${heightPercentage}%`;
  }
}

function getOptimalColumns(imageCount: number): number {
  if (imageCount <= 3) return imageCount;
  if (imageCount <= 6) return 3;
  if (imageCount <= 12) return 4;
  return 5;
}