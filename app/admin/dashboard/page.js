'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const STATUS_OPTIONS = [
  { value: '', label: '📋 Todos' },
  { value: 'RECEBIDO', label: '🔴 Novos' },
  { value: 'PREPARANDO', label: '🟡 Preparando' },
  { value: 'PRONTO', label: '🟢 Prontos' },
  { value: 'SAIU_ENTREGA', label: '🔵 Saiu' },
  { value: 'CONCLUIDO', label: '✅ Concluídos' },
];

function formatPrice(p) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p);
}

function formatDate(d) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function StatusBadge({ status }) {
  const map = {
    RECEBIDO:    { label: 'Novo',        cls: 'badge-orange' },
    PREPARANDO:  { label: 'Preparando',  cls: 'badge-yellow' },
    PRONTO:      { label: 'Pronto',      cls: 'badge-green'  },
    SAIU_ENTREGA:{ label: 'Saiu p/ Entrega', cls: 'badge-blue' },
    CONCLUIDO:   { label: 'Concluído',   cls: 'badge-gray'   },
    CANCELADO:   { label: 'Cancelado',   cls: 'badge-red'    },
  };
  const s = map[status] || { label: status, cls: '' };
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}

function OrderCard({ order, onStatusChange }) {
  const isNew = order.status === 'RECEBIDO';

  const getBarClass = () => {
    const map = { RECEBIDO: 'recebido', PREPARANDO: 'preparando', PRONTO: 'pronto', SAIU_ENTREGA: 'saiu', CONCLUIDO: 'concluido', CANCELADO: 'cancelado' };
    return map[order.status] || '';
  };

  return (
    <div className={`order-card ${isNew ? 'new-order' : ''}`} id={`order-card-${order.id}`}>
      <div className={`order-status-bar ${getBarClass()}`} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', letterSpacing: '1px' }}>
            #{order.id.slice(-4).toUpperCase()}
            {isNew && <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: 'var(--color-primary)', animation: 'pulse 1.5s infinite' }}>🔔 NOVO</span>}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{formatDate(order.createdAt)}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--color-bg-base)', borderRadius: '8px', padding: '10px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Cliente</p>
          <p style={{ fontWeight: '600', marginTop: '2px' }}>{order.customerName}</p>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{order.customerPhone}</p>
        </div>
        <div style={{ background: 'var(--color-bg-base)', borderRadius: '8px', padding: '10px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Tipo</p>
          <p style={{ fontWeight: '600', marginTop: '2px' }}>
            {order.type === 'mesa' ? `🪑 Mesa ${order.tableNumber}` : '🛵 Entrega'}
          </p>
          {order.type === 'entrega' && (
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>{order.address}</p>
          )}
        </div>
        <div style={{ background: 'var(--color-bg-base)', borderRadius: '8px', padding: '10px' }}>
          <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Total</p>
          <p style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '1.2rem', marginTop: '2px' }}>{formatPrice(order.total)}</p>
        </div>
      </div>

      <div style={{ background: 'var(--color-bg-base)', borderRadius: '8px', padding: '10px', marginBottom: '12px' }}>
        <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '6px' }}>Itens</p>
        {order.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
            <span>{item.quantity}x {item.product?.name || 'Produto removido'}</span>
            <span style={{ color: 'var(--color-primary)' }}>{formatPrice(item.price * item.quantity)}</span>
          </div>
        ))}
        {order.notes && (
          <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--color-warning)', fontStyle: 'italic' }}>
            📝 {order.notes}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {order.status === 'RECEBIDO' && (
          <button id={`order-preparar-${order.id}`} className="btn btn-primary btn-sm" onClick={() => onStatusChange(order.id, 'PREPARANDO')}>
            👨‍🍳 Preparar
          </button>
        )}
        {order.status === 'PREPARANDO' && (
          <button id={`order-pronto-${order.id}`} className="btn btn-success btn-sm" onClick={() => onStatusChange(order.id, 'PRONTO')}>
            ✅ Pronto
          </button>
        )}
        {order.status === 'PRONTO' && order.type === 'entrega' && (
          <button id={`order-saiu-${order.id}`} className="btn btn-sm" style={{ background: 'var(--color-info)', color: 'white' }} onClick={() => onStatusChange(order.id, 'SAIU_ENTREGA')}>
            🛵 Saiu p/ Entrega
          </button>
        )}
        {(order.status === 'PRONTO' && order.type === 'mesa') || order.status === 'SAIU_ENTREGA' ? (
          <button id={`order-concluir-${order.id}`} className="btn btn-sm" style={{ background: '#22c55e', color: 'white' }} onClick={() => onStatusChange(order.id, 'CONCLUIDO')}>
            🏁 Concluído
          </button>
        ) : null}
        {!['CONCLUIDO', 'CANCELADO'].includes(order.status) && (
          <button
            id={`order-cancelar-${order.id}`}
            className="btn btn-danger btn-sm"
            onClick={() => {
              if (window.confirm('Cancelar este pedido?')) onStatusChange(order.id, 'CANCELADO');
            }}
          >
            ✕ Cancelar
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      const url = statusFilter ? `/api/orders?status=${statusFilter}` : '/api/orders';
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 3000); // atualiza a cada 3s
      return () => clearInterval(interval);
    }
  }, [fetchOrders, token]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchOrders();
    } catch {
      alert('Erro ao atualizar pedido');
    }
  };

  const stats = {
    total: orders.length,
    novos: orders.filter((o) => o.status === 'RECEBIDO').length,
    preparando: orders.filter((o) => o.status === 'PREPARANDO').length,
    prontos: orders.filter((o) => o.status === 'PRONTO').length,
  };

  return (
    <div>
     {/* Stats (Ultra Fino) */}
      <div 
        className="admin-stats-grid" 
        style={{ 
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}
      >
        {/* Usamos display: 'flex' e alignItems: 'center' para colocar número e texto na mesma linha */}
        <div className="stat-card" style={{ padding: '8px 12px', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="stat-number" style={{ fontSize: '1.4rem', lineHeight: '1' }}>{stats.total}</div>
          <div className="stat-label" style={{ fontSize: '0.7rem', margin: 0 }}>Total</div>
        </div>

        <div className="stat-card" style={{ '--bar-color': 'var(--color-primary)', padding: '8px 12px', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="stat-number" style={{ color: 'var(--color-danger)', fontSize: '1.4rem', lineHeight: '1' }}>{stats.novos}</div>
          <div className="stat-label" style={{ fontSize: '0.7rem', margin: 0 }}>Novos 🔔</div>
        </div>

        <div className="stat-card" style={{ padding: '8px 12px', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="stat-number" style={{ color: 'var(--color-warning)', fontSize: '1.4rem', lineHeight: '1' }}>{stats.preparando}</div>
          <div className="stat-label" style={{ fontSize: '0.7rem', margin: 0 }}>Prep 👨‍🍳</div>
        </div>

        <div className="stat-card" style={{ padding: '8px 12px', minHeight: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="stat-number" style={{ color: 'var(--color-success)', fontSize: '1.4rem', lineHeight: '1' }}>{stats.prontos}</div>
          <div className="stat-label" style={{ fontSize: '0.7rem', margin: 0 }}>Prontos ✅</div>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              id={`filter-${s.value || 'all'}`}
              className={`btn btn-sm ${statusFilter === s.value ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => { setStatusFilter(s.value); setLoading(true); }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastUpdated && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              🔄 {lastUpdated.toLocaleTimeString('pt-BR')}
            </span>
          )}
          <button id="refresh-orders-btn" className="btn btn-outline btn-sm" onClick={() => { setLoading(true); fetchOrders(); }}>
            Atualizar
          </button>
        </div>
      </div>

      {/* Lista de pedidos */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="shimmer" style={{ height: '200px', borderRadius: '16px' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state admin-card">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">Nenhum pedido {statusFilter ? `com status "${statusFilter}"` : ''}</p>
          <p style={{ fontSize: '0.8rem', marginTop: '8px', color: 'var(--color-text-muted)' }}>
            Atualizando automaticamente a cada 15 segundos
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} onStatusChange={handleStatusChange} />
          ))}
        </div>
      )}
    </div>
  );
}
