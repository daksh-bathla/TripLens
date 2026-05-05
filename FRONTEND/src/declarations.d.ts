declare module 'react' {
  export type ReactNode = any;
  export type ElementType = any;
  export type ChangeEvent<T> = any;
  export type SetStateAction<S> = S | ((prevState: S) => S);
  export type Dispatch<A> = (value: A) => void;
  
  export function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function lazy<T>(factory: () => Promise<{ default: T }>): T;
  export const Suspense: any;

  export { ReactNode as Node, ElementType as Type };
}

// Global namespace for React.ReactNode etc.
declare namespace React {
  type ReactNode = any;
  type ElementType = any;
  type ChangeEvent<T> = any;
  function useState<S>(initialState: S | (() => S)): [S, any];
  function useEffect(effect: any, deps?: any[]): void;
  function lazy<T>(factory: any): T;
  const Suspense: any;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-dom';
declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const NavLink: any;
  export const Link: any;
  export const useParams: () => any;
  export const useNavigate: () => any;
}

declare module 'lucide-react';
declare module 'framer-motion' {
  export const motion: any;
  export const AnimatePresence: any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
