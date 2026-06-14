declare module 'react' {
    export = React;
    export as namespace React;
}

declare namespace React {
    type ReactNode = any;
    type ElementType = any;
    type ChangeEvent<T> = any;
    type SetStateAction<S> = S | ((prevState: S) => S);
    type Dispatch<A> = (value: A) => void;
    
    function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
    function useEffect(effect: () => void | (() => void), deps?: any[]): void;
    function lazy<T>(factory: () => Promise<{ default: T }>): T;
    const Suspense: any;
    const StrictMode: any;

    interface IntrinsicElements {
        [elemName: string]: any;
    }
}

declare module 'react-dom' {
  export const createRoot: any;
}

declare module 'react-dom/client' {
  export const createRoot: any;
  const ReactDOM: {
    createRoot: any;
  };
  export default ReactDOM;
}

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

declare module 'react-router-dom' {
  export const BrowserRouter: any;
  export const Routes: any;
  export const Route: any;
  export const NavLink: any;
  export const Link: any;
  export const useParams: () => any;
  export const useNavigate: () => any;
  export const useLocation: () => any;
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
