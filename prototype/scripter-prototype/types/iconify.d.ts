/* ==================================================
   Iconify Icon Web Component 类型声明
   ================================================== */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        iconSet?: string;
        width?: string | number;
        height?: string | number;
        rotate?: number;
        flip?: string;
        inline?: boolean;
      };
    }
  }
}

export {};
