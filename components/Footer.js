export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-logo">SHALON GRILL</div>
      <p style={{ marginBottom: '8px' }}>Rua Abadia dos Dourados, nº 472 · Uberlândia - MG</p>
      <p style={{ color: 'rgba(136,136,136,0.6)', fontSize: '0.75rem' }}>
        © {new Date().getFullYear()} Shalon Grill. Todos os direitos reservados.
      </p>
    </footer>
  );
}
