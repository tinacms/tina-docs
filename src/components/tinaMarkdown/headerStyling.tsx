// import { FiLink } from 'react-icons/fi';
// import { useEffect } from 'react';
// import { getDocId } from '../../utils/docs/getDocsIds';

// interface HeaderProps {
//   children: React.ReactNode;
//   level: 1 | 2 | 3 | 4 | 5 | 6;
// }

// const Header = ({ children, level }: HeaderProps) => {
//   const HeadingTag = (`h${level}`) as keyof JSX.IntrinsicElements;
//   const id = getDocId(
//     Array.isArray(children) ? children.map((child) => (typeof child === 'string' ? child : '')).join('') : children?.toString()
//   );

//   const currentUrl = typeof window !== 'undefined' ? window.location.pathname : '';
//   const linkHref = `${currentUrl}#${id}`;

//   const styles = {
//     h1: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-4xl mt-4 mb-4',
//     h2: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-3xl mt-4 mb-3',
//     h3: 'bg-gradient-to-br from-blue-800 via-blue-900 to-blue-100 bg-clip-text text-transparent text-xl font-medium mt-2 mb-2',
//     h4: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-xl font-medium mt-2 mb-2',
//     h5: 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent text-lg font-medium mt-2 mb-1',
//     h6: 'text-gray-500 text-base font-normal mt-2 mb-1',
//   }[HeadingTag];

//   const handleHeaderClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
//     event.preventDefault();
//     scrollToElement(id);
//     window.history.pushState(null, '', linkHref);
//   };

//   const scrollToElement = (elementId: string) => {
//     const element = document.getElementById(elementId);
//     if (element) {
//       const offset = 130;
//       const elementPosition = element.getBoundingClientRect().top + window.scrollY;
//       const offsetPosition = elementPosition - offset;

//       window.scrollTo({
//         top: offsetPosition,
//         behavior: 'smooth',
//       });
//     }
//   };

//   useEffect(() => {
//     if (window.location.hash) {
//       const hash = window.location.hash.substring(1);
//       scrollToElement(hash);
//     }
//   }, []);

//   return (
//     <HeadingTag id={id} className={`${styles} relative cursor-pointer`}>
//       <a href={linkHref} className="no-underline group" onClick={handleHeaderClick}>
//         {children}
//         <FiLink className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 inline-flex mb-2" />
//       </a>
//     </HeadingTag>
//   );
// };

// export default Header;