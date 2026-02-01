/* ==================================================
   Iconify Icon 包装组件
   ================================================== */

"use client"

import React from 'react';

// 扩展 JSX IntrinsicElements 以支持 iconify-icon
// 使用 interface 扩展而不是 namespace
type IconifyIconElement = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
  icon?: string;
  iconSet?: string;
  width?: string | number;
  height?: string | number;
  rotate?: number;
  flip?: string;
  inline?: boolean;
}, HTMLElement>;

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'iconify-icon': IconifyIconElement;
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
