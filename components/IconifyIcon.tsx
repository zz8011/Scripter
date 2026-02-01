/* ==================================================
   Iconify Icon 包装组件
   ================================================== */

"use client"

import React from 'react';

// 扩展 JSX IntrinsicElements 以支持 iconify-icon
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        icon?: string;
        iconSet?: string;
        width?: string | number;
        height?: string | number;
        rotate?: number;
        flip?: string;
        inline?: boolean;
      }, HTMLElement>;
    }
  }
}

interface IconifyIconProps extends React.HTMLAttributes<HTMLElement> {
  icon: string;
  iconSet?: string;
  width?: string | number;
  height?: string | number;
  rotate?: number;
  flip?: string;
  inline?: boolean;
}

export function IconifyIcon({ icon, width, height, style, ...props }: IconifyIconProps) {
  return (
    <iconify-icon
      icon={icon}
      style={{
        width: width ? typeof width === 'number' ? `${width}px` : width : undefined,
        height: height ? typeof height === 'number' ? `${height}px` : height : undefined,
        ...style
      }}
      {...props}
    />
  );
}
