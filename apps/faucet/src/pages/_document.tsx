import { Head, Html, Main, NextScript } from 'next/document';

const Document = () => {
  return (
    <Html lang="en-us" className="font-satoshi">
      <Head />
      <body className="bg-body">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default Document;
