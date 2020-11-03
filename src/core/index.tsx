export { default as Collapsible } from './Collapsible';
export const getLogger: (tag: string) => (...args: any) => void =
    tag => (...args) => console.log(tag, ...args);

