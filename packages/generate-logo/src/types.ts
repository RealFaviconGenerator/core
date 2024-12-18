
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
    color: string;
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
