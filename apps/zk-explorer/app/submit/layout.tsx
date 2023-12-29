import { Header } from '../../components/Header';

export default function ProjectSubmissionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      {children}
    </>
  );
}
