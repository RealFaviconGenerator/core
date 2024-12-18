
export enum ContentType {
  Text = 'text',
}

export enum BackgroundType {
  Color = 'color',
  None = 'none',
  Gradient = 'gradient'
}

export type LogoSettings = {
  content: {
    type: ContentType;
    text: string;
    fontUrl: string;
    scale: number;
    fillColor: string;
    strokeColor?: string;
    strokeWidth?: number;
  };
  background: {
    type: BackgroundType;
    color?: string;
    gradient?: {
      startColor: string;
      stopColor: string;
      angle: number;
    }
  }
}
