/* ==================================================
   全局类型声明
   ================================================== */

export {};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': Partial<React.HTMLAttributes<HTMLElement>> & {
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

  interface HTMLElementTagNameMap {
    'iconify-icon': HTMLElement & {
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
