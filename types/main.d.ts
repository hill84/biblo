/* Default CSS definition for typescript */
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.pcss' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.webp' {
  const value: any;
  export default value;
}

declare module 'react-say' {
  export const SayButton: any;
}