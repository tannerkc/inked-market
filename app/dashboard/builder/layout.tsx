export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Permanent+Marker&family=Playfair+Display:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&family=Abril+Fatface&family=Rye&family=Inter:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
