import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API = "https://supplychain-backend-p0em.onrender.com/api";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Be+Vietnam+Pro:wght@300;400;500;700;800&display=swap";
document.head.appendChild(fontLink);

const globalStyle = document.createElement("style");
globalStyle.textContent = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --g1: #DA251D; --g2: #FFCD00; --g3: #B71C1C; --g4: #FFE082; --g5: #FF8F00;
    --bg: #F5F7FA;
    --surface: #FFFFFF;
    --border: #E5E7EB;
    --text: #1F2937; --sub: #6B7280; --muted: #6B7280; --muted-2: #9CA3AF;
    --font-head: 'Be Vietnam Pro', sans-serif;
    --font-body: 'Be Vietnam Pro', sans-serif;
  }
  body { background:#F5F7FA; color:var(--text); font-family:var(--font-body); min-height:100vh; overflow-x:hidden; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:rgba(0,0,0,0.15); border-radius:4px; }
  /* Flat background: mesh gradient + decorative orbs removed (UI_REDESIGN_REPORT.md) */
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
  @keyframes pulse  { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
  @keyframes spin   { to{transform:rotate(360deg);} }
  @keyframes shimmer { 0%{background-position:200% 0;} 100%{background-position:-200% 0;} }
  .fade-up { animation:fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) forwards; }
  .blink   { animation:pulse 2s infinite; }
  .glass {
    background:#FFFFFF;
    border:1px solid #E5E7EB;
    border-radius:12px;
    box-shadow:0 1px 3px rgba(0,0,0,0.08);
  }
  .card-3d {
    transition: border-color 0.2s, box-shadow 0.2s;
    cursor: pointer;
  }
  .card-3d:hover {
    border-color:#D1D5DB;
    box-shadow:0 4px 12px rgba(0,0,0,0.08);
  }
  .glass-input {
    background:#FFFFFF; border:1px solid #D1D5DB;
    border-radius:8px; color:var(--text); font-family:var(--font-body);
    font-size:14px; padding:10px 14px; outline:none; width:100%;
    transition:border-color 0.2s, box-shadow 0.2s;
  }
  .glass-input:focus { border-color:#DA251D; box-shadow:0 0 0 3px rgba(218,37,29,0.10); }
  .glass-input::placeholder { color:#9CA3AF; }
  select.glass-input option { background:#FFFFFF; color:#1F2937; }
  .trow { transition:background 0.15s; }
  .trow:hover { background:#FAFAFA !important; }
  .nav-item {
    width:100%; display:flex; align-items:center; gap:10px;
    padding:10px 14px; border-radius:8px; margin-bottom:4px;
    background:transparent; color:#4B5563; border:none; border-left:3px solid transparent;
    cursor:pointer; font-family:var(--font-body); font-size:14px; font-weight:500;
    text-align:left; transition:background 0.15s, color 0.15s, border-color 0.15s;
  }
  .nav-item:hover { background:#F3F4F6; color:#1F2937; }
  .nav-item.active { background:#FEF2F2; border-left-color:#DA251D; color:#DA251D; font-weight:600; }
  .btn-primary { background:#DA251D; border:none; border-radius:8px; color:#fff; font-family:var(--font-body); font-size:14px; font-weight:600; padding:10px 20px; cursor:pointer; transition:background 0.2s; }
  .btn-primary:hover { background:#B71C1C; }
  .btn-ghost { background:#FFFFFF; border:1px solid #D1D5DB; border-radius:8px; color:#374151; font-family:var(--font-body); font-size:13px; font-weight:500; padding:8px 16px; cursor:pointer; transition:background 0.2s, border-color 0.2s, color 0.2s; }
  .btn-ghost:hover { background:#F9FAFB; border-color:#9CA3AF; color:#1F2937; }
  .btn-danger { background:#FFFFFF; border:1px solid #FECACA; border-radius:8px; color:#B91C1C; font-family:var(--font-body); font-size:13px; font-weight:500; padding:8px 16px; cursor:pointer; transition:background 0.2s; }
  .btn-danger:hover { background:#FEF2F2; }
  .btn-teal { background:#FFFFFF; border:1px solid #DA251D; border-radius:8px; color:#DA251D; font-family:var(--font-body); font-size:14px; font-weight:600; padding:10px 20px; cursor:pointer; transition:background 0.2s; }
  .btn-teal:hover { background:#FEF2F2; }
  .prog-bar { height:6px; border-radius:3px; background:#E5E7EB; overflow:hidden; }
  .prog-fill { height:100%; border-radius:3px; transition:width 1s cubic-bezier(0.22,1,0.36,1); }
  .spinner { width:32px; height:32px; border:3px solid #E5E7EB; border-top-color:#DA251D; border-radius:50%; animation:spin 0.8s linear infinite; margin:40px auto; }
  .skeleton { background:linear-gradient(90deg,#F3F4F6 25%,#E9EBEF 50%,#F3F4F6 75%); background-size:200% 100%; animation:shimmer 1.5s infinite; border-radius:8px; }
  .recharts-tooltip-wrapper .recharts-default-tooltip {
    background:#FFFFFF !important;
    border:1px solid #E5E7EB !important;
    border-radius:8px !important;
    box-shadow:0 1px 3px rgba(0,0,0,0.08) !important;
    color:#1F2937 !important;
    font-family:'Be Vietnam Pro',sans-serif !important;
    font-size:13px !important;
  }
  .recharts-cartesian-grid-horizontal line,
  .recharts-cartesian-grid-vertical line { stroke:#E5E7EB !important; }
  .recharts-text { fill:#6B7280 !important; font-family:'Be Vietnam Pro',sans-serif !important; font-size:11px !important; }
  .order-id-btn {
    background:#FEF2F2; color:#DA251D;
    border:1px solid #FECACA; border-radius:6px;
    padding:3px 10px; font-size:11px; font-weight:600;
    cursor:pointer; font-family:var(--font-body);
    transition:background 0.2s;
  }
  .order-id-btn:hover {
    background:#FEE2E2;
  }

`;
document.head.appendChild(globalStyle);

const getToken = () => localStorage.getItem("token");
const authHeaders = (extra = {}) => {
  const t = getToken();
  return { ...(t ? { Authorization: `Bearer ${t}` } : {}), ...extra };
};
const parseResp = async (r) => {
  if (!r.ok) {
    let msg = `Lỗi ${r.status}`;
    try {
      const b = await r.json();
      if (b && (b.error || b.msg)) msg = b.error || b.msg;
    } catch {}
    const err = new Error(msg);
    err.status = r.status;
    throw err;
  }
  return r.json();
};
const request = (path, method = "GET", body) =>
  fetch(`${API}${path}`, {
    method,
    headers: body ? authHeaders({ "Content-Type": "application/json" }) : authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => {
    if (r.status === 401 && !path.startsWith("/auth/")) {
      localStorage.removeItem("token");
      window.location.reload();
      throw new Error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
    }
    return parseResp(r);
  });
const apiFetch = (path) => request(path);
const apiPost  = (path, body) => request(path, "POST", body);
const apiPut   = (path, body) => request(path, "PUT", body);
const apiDel   = (path)       => request(path, "DELETE");
const apiPatch = (path, body) => request(path, "PATCH", body);

const fmtVnd = (n) => `${(parseFloat(n) || 0).toLocaleString("vi-VN")} ₫`;
const CAT_VI = { Machinery: "Máy móc", "Raw Materials": "Nguyên liệu", Components: "Linh kiện", Packaging: "Bao bì" };
const catVi = (c) => CAT_VI[c] || c || "—";
const CATS = ["Máy móc", "Nguyên liệu", "Bao bì", "Linh kiện"];
const CAT_GRAD = {
  "Máy móc":"#DA251D,#FFE082", "Nguyên liệu":"#FFE082,#DA251D", "Linh kiện":"#FFCD00,#DA251D", "Bao bì":"#FF8F00,#FFCD00",
  Machinery:"#DA251D,#FFE082", "Raw Materials":"#FFE082,#DA251D", Components:"#FFCD00,#DA251D", Packaging:"#FF8F00,#FFCD00",
};
const STATUS_VI = { Accepted: "Đã duyệt", Pending: "Chờ duyệt", Rejected: "Từ chối" };

const GlassCard   = ({ children, style:s={}, gradient }) => (
  <div className="glass" style={{ padding:24, position:"relative", overflow:"hidden", ...s }}>
    {gradient && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:gradient.split(",")[0], borderRadius:"12px 12px 0 0" }} />}
    {children}
  </div>
);
const Card3D = ({ children, style:s={}, gradient }) => (
  <div className="glass card-3d" style={{ padding:24, position:"relative", overflow:"hidden", ...s }}>
    {gradient && <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:gradient.split(",")[0], borderRadius:"12px 12px 0 0" }} />}
    {children}
  </div>
);
const GlassInput  = (props) => <input className="glass-input" {...props} />;
const GlassSelect = ({ children, ...props }) => <select className="glass-input" {...props}>{children}</select>;
const Label       = ({ children }) => <label style={{ fontSize:11, color:"#6B7280", letterSpacing:0.6, display:"block", marginBottom:6, fontWeight:600 }}>{children}</label>;
const IdBadge     = ({ id }) => <span style={{ background:"#FEF2F2", color:"#DA251D", border:"1px solid #FECACA", borderRadius:6, padding:"2px 8px", fontSize:11, fontWeight:600 }}>{id}</span>;
const Spinner     = () => <div className="spinner" />;

const _toastRef = { fn: null };
const showToast = (msg, type = 'success') => _toastRef.fn?.(msg, type);
const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  _toastRef.fn = (msg, type) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  };
  if (!toasts.length) return null;
  return (
    <div style={{ position:'fixed', top:24, right:24, zIndex:9999, display:'flex', flexDirection:'column', gap:10, pointerEvents:'none' }}>
      {toasts.map(t => (
        <div key={t.id} className="glass fade-up" style={{
          display:'flex', alignItems:'center', gap:12,
          padding:'12px 16px', borderRadius:12, minWidth:270,
          background: t.type==='success' ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${t.type==='success' ? '#BBF7D0' : '#FECACA'}`,
        }}>
          <div style={{ width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            background: t.type==='success' ? '#DCFCE7' : '#FEE2E2',
            color: t.type==='success' ? '#166534' : '#B91C1C', fontSize:13, fontWeight:700 }}>
            {t.type==='success' ? '✓' : '✕'}
          </div>
          <span style={{ fontSize:13, fontWeight:500, color:'#1F2937' }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};

const EmptyState = ({ icon='📭', title='Không có dữ liệu', sub='', action, actionLabel='Thêm mới' }) => (
  <div style={{ padding:'56px 20px', textAlign:'center' }}>
    <div style={{ fontSize:44, marginBottom:14, opacity:0.5 }}>{icon}</div>
    <div style={{ fontFamily:'var(--font-head)', fontSize:17, fontWeight:600, marginBottom:8 }}>{title}</div>
    {sub && <div style={{ color:'var(--muted)', fontSize:13, marginBottom:22, maxWidth:300, margin:'0 auto 22px' }}>{sub}</div>}
    {action && <button className="btn-primary" onClick={action} style={{ padding:'9px 22px', fontSize:13 }}>{actionLabel}</button>}
  </div>
);

const PageHeader = ({ crumb, title, sub, action }) => (
  <div style={{ background:'#FFFFFF', border:'1px solid #E5E7EB', borderRadius:12, boxShadow:'0 1px 3px rgba(0,0,0,0.08)', padding:'16px 24px', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
    <div>
      <div style={{ fontSize:13, color:'#6B7280', marginBottom:6 }}>thông minh › {crumb}</div>
      <div style={{ fontFamily:'var(--font-head)', fontSize:24, fontWeight:700, color:'#1F2937' }}>{title}</div>
      {sub && <div style={{ color:'#9CA3AF', fontSize:13, marginTop:4 }}>{sub}</div>}
    </div>
    {action}
  </div>
);

const SkeletonRow = () => (
  <tr style={{ borderBottom:'1px solid #F3F4F6' }}>
    {[180,140,110,80,90].map((w,i) => (
      <td key={i} style={{ padding:'12px 16px' }}>
        <div className="skeleton" style={{ height:14, width:w, borderRadius:6 }} />
      </td>
    ))}
  </tr>
);
const SkeletonCard = ({ h=160 }) => <div className="skeleton" style={{ height:h, borderRadius:12 }} />;

const StatCard = ({ label, value, sub, gradient, icon }) => (
  <Card3D gradient={gradient} style={{ padding:22 }}>
    <div style={{ fontSize:26, marginBottom:10 }}>{icon}</div>
    <div style={{ fontSize:12, color:"#6B7280", marginBottom:6 }}>{label}</div>
    <div style={{ fontFamily:"var(--font-head)", fontSize:32, fontWeight:700, color:"#1F2937" }}>{value}</div>
    <div style={{ fontSize:12, color:"#9CA3AF", marginTop:4 }}>{sub}</div>
  </Card3D>
);

const TableHeader = ({ cols }) => (
  <thead>
    <tr style={{ background:"#F9FAFB", borderBottom:"1px solid #E5E7EB" }}>
      {cols.map(h => <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:12, letterSpacing:0.3, color:"#374151", fontWeight:600 }}>{h}</th>)}
    </tr>
  </thead>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div className="glass fade-up" style={{ padding:28, width:620, maxWidth:"95vw", borderRadius:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:22 }}>
        <span style={{ fontFamily:"var(--font-head)", fontSize:20, fontWeight:600 }}>{title}</span>
        <button onClick={onClose} style={{ background:"#FFFFFF", border:"1px solid #D1D5DB", color:"#6B7280", cursor:"pointer", borderRadius:8, width:32, height:32, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
      </div>
      {children}
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#FFFFFF", border:"1px solid #E5E7EB", borderRadius:8, boxShadow:"0 1px 3px rgba(0,0,0,0.08)", padding:"10px 14px", fontFamily:"var(--font-body)" }}>
      <div style={{ color:"#6B7280", fontSize:11, marginBottom:4 }}>{label}</div>
      {payload.map((p,i) => <div key={i} style={{ color:p.color, fontSize:13, fontWeight:600 }}>{p.name}: {p.value}</div>)}
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const s = status || "Accepted";
  const styles = {
    Accepted: { bg:"#DCFCE7", color:"#166534", border:"1px solid #BBF7D0" },
    Pending:  { bg:"#FEF3C7", color:"#92400E", border:"1px solid #FDE68A" },
    Rejected: { bg:"#FEE2E2", color:"#991B1B", border:"1px solid #FECACA" },
  };
  const st = styles[s] || styles.Accepted;
  return (
    <span style={{ background:st.bg, color:st.color, border:st.border, padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600 }}>{STATUS_VI[s] || s}</span>
  );
};

// ══ INVOICE MODAL ════════════════════════════════════════════════════════════
const InvoiceModal = ({ order, customer, product, onClose }) => {
  const invoiceNum = `INV-${order.OrderID}`;
  const date = order.OrderDate;
  const dueDate = (() => {
    try {
      const d = new Date(date);
      d.setDate(d.getDate() + 30);
      return d.toISOString().split("T")[0];
    } catch { return "—"; }
  })();

  const handlePrint = () => {
    const content = document.getElementById("SupplyChain7VN-invoice-content");
    if (!content) return;
    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:900px;height:1200px;border:none;";
    document.body.appendChild(iframe);
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write("<!DOCTYPE html><html><head><meta charset='utf-8'/><link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap'/><style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:#fff;font-family:'Be Vietnam Pro',Georgia,sans-serif;color:#111;}@page{margin:15mm;}</style></head><body>" + content.innerHTML + "</body></html>");
    doc.close();
    iframe.onload = () => { setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); setTimeout(() => document.body.removeChild(iframe), 1500); }, 500); };
  };

  const statusColor = order.Status === "Accepted" ? "#166534" : order.Status === "Rejected" ? "#991B1B" : "#92400E";
  const bill = parseFloat(order.Bill) || 0;

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:2000, padding:20 }} onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
        <div className="glass fade-up" style={{ width:660, maxWidth:"95vw", maxHeight:"92vh", borderRadius:12, overflow:"hidden", display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 24px", borderBottom:"1px solid #E5E7EB", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0, background:"#F9FAFB" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:18 }}>🧾</span>
              <span style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:600 }}>Hóa đơn — {order.OrderID}</span>
            </div>
            <div style={{ display:"flex", gap:10 }}>
              <button className="btn-primary" onClick={handlePrint} style={{ padding:"8px 18px", fontSize:13, display:"flex", alignItems:"center", gap:7, borderRadius:9 }}>
                🖨 In hóa đơn
              </button>
              <button onClick={onClose} style={{ background:"#FFFFFF", border:"1px solid #D1D5DB", color:"#6B7280", cursor:"pointer", borderRadius:8, width:32, height:32, fontSize:18, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
          </div>

          <div style={{ overflowY:"auto", flex:1 }}>
            <div id="SupplyChain7VN-invoice-content" style={{ padding:40, background:"#ffffff", color:"#111", fontFamily:"'Be Vietnam Pro', Georgia, sans-serif" }}>
              <div style={{ background:"#DA251D", height:4, borderRadius:2, marginBottom:36 }} />

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                    <div style={{ width:44, height:44, background:"linear-gradient(135deg,#DA251D,#FFCD00)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, color:"#fff" }}>⬡</div>
                    <div style={{ fontFamily:"Georgia, serif", fontSize:24, fontWeight:700, color:"#111", letterSpacing:-0.5 }}>
                      Supply<span style={{ color:"#FFCD00" }}>Chain7VN</span>
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:"#999", letterSpacing:2 }}>QUẢN LÝ CHUỖI CUNG ỨNG</div>
                  <div style={{ fontSize:12, color:"#666", marginTop:6 }}>admin@supplychain7vn.vn</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontFamily:"Georgia, serif", fontSize:36, fontWeight:700, color:"#111", letterSpacing:-1 }}>HÓA ĐƠN</div>
                  <div style={{ fontSize:13, color:"#888", marginTop:4, fontWeight:500 }}>#{invoiceNum}</div>
                  <div style={{ marginTop:10, display:"inline-flex", alignItems:"center", gap:7,
                    background: order.Status==="Accepted" ? "#DCFCE7" : order.Status==="Rejected" ? "#FEE2E2" : "#FEF3C7",
                    border:`1.5px solid ${statusColor}55`, borderRadius:20, padding:"5px 14px" }}>
                    <span style={{ width:7, height:7, borderRadius:"50%", background:statusColor, display:"inline-block" }} />
                    <span style={{ fontSize:12, fontWeight:700, color:statusColor }}>{STATUS_VI[order.Status] || order.Status || "Đã duyệt"}</span>
                  </div>
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0, marginBottom:28, border:"1.5px solid #ede9ff", borderRadius:12, overflow:"hidden" }}>
                {[["Số hóa đơn", invoiceNum],["Ngày phát hành", date],["Ngày đến hạn", dueDate]].map(([l,v], idx) => (
                  <div key={l} style={{ padding:"16px 20px", background: idx===0 ? "#f5f2ff" : "#faf9ff", borderRight: idx < 2 ? "1.5px solid #ede9ff" : "none" }}>
                    <div style={{ fontSize:10, color:"#9a8fb5", letterSpacing:1.5, marginBottom:5, textTransform:"uppercase" }}>{l}</div>
                    <div style={{ fontSize:14, fontWeight:700, color:"#2d1d6e" }}>{v}</div>
                  </div>
                ))}
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:28 }}>
                <div style={{ background:"#f5f2ff", borderRadius:12, padding:"18px 20px", border:"1.5px solid #ede9ff" }}>
                  <div style={{ fontSize:10, color:"#9a8fb5", letterSpacing:2, marginBottom:10, textTransform:"uppercase" }}>Khách hàng</div>
                  <div style={{ fontSize:17, fontWeight:700, color:"#2d1d6e", marginBottom:5 }}>{customer?.CustomerName || order.CustomerID}</div>
                  <div style={{ fontSize:12, color:"#777", marginBottom:3 }}>Mã KH: <span style={{ fontWeight:600, color:"#555" }}>{order.CustomerID}</span></div>
                  <div style={{ fontSize:12, color:"#777", marginBottom:3 }}>MST: <span style={{ fontWeight:600, color:"#555" }}>{customer?.TaxCode || "—"}</span></div>
                  <div style={{ fontSize:11, color:"#999", marginBottom:3, fontStyle:"italic" }}>{customer?.CustomerType === "Business" ? "Doanh nghiệp" : "Cá nhân"}</div>
                  {customer?.ContactNumber && <div style={{ fontSize:12, color:"#777", marginBottom:3 }}>📞 {customer.ContactNumber}</div>}
                  {customer?.Address && <div style={{ fontSize:12, color:"#777" }}>📍 {customer.Address}</div>}
                </div>
                <div style={{ background:"#f9f8ff", borderRadius:12, padding:"18px 20px", border:"1.5px solid #ede9ff" }}>
                  <div style={{ fontSize:10, color:"#9a8fb5", letterSpacing:2, marginBottom:10, textTransform:"uppercase" }}>Chi tiết đơn hàng</div>
                  {[
                    ["Mã đơn hàng", order.OrderID],
                    ["Ngày đặt hàng", order.OrderDate],
                    ["Điều khoản TT", "Net 30"],
                    ["Phương thức TT", order.PaymentMethod || "Tiền mặt"],
                    ["Số hóa đơn", order.InvoiceNumber || "—"],
                  ].map(([l,v]) => (
                    <div key={l} style={{ fontSize:12, color:"#777", marginBottom:5 }}>
                      {l}: <span style={{ fontWeight:700, color:"#333" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:24, borderRadius:12, overflow:"hidden", border:"1.5px solid #ede9ff" }}>
                <thead>
                  <tr style={{ background:"#DA251D" }}>
                    {["#","Sản phẩm","Danh mục","Đơn giá","SL","Thành tiền"].map(h => (
                      <th key={h} style={{ padding:"12px 16px", textAlign:"left", fontSize:11, letterSpacing:1.5, color:"#fff", fontWeight:700 }}>{h.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ background:"#fff" }}>
                    <td style={{ padding:"18px 16px", fontSize:12, color:"#aaa", borderBottom:"1.5px solid #f0ecff" }}>1</td>
                    <td style={{ padding:"18px 16px", fontWeight:700, color:"#1a0040", fontSize:14, borderBottom:"1.5px solid #f0ecff" }}>{product?.ProductName || order.ProductID || "—"}</td>
                    <td style={{ padding:"18px 16px", fontSize:12, color:"#888", borderBottom:"1.5px solid #f0ecff" }}>
                      {product?.Category ? (
                        <span style={{ background:"#f0ecff", color:"#DA251D", borderRadius:20, padding:"3px 10px", fontSize:11, fontWeight:600 }}>{catVi(product.Category)}</span>
                      ) : "—"}
                    </td>
                    <td style={{ padding:"18px 16px", fontSize:13, color:"#444", borderBottom:"1.5px solid #f0ecff" }}>{fmtVnd(product ? product.UnitPrice : bill)}</td>
                    <td style={{ padding:"18px 16px", fontSize:13, color:"#444", borderBottom:"1.5px solid #f0ecff" }}>{order.Quantity > 0 ? order.Quantity : 1}</td>
                    <td style={{ padding:"18px 16px", fontSize:15, fontWeight:800, color:"#DA251D", borderBottom:"1.5px solid #f0ecff" }}>{fmtVnd(bill)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:32 }}>
                <div style={{ width:290 }}>
                  {[["Tạm tính", fmtVnd(bill)],["Thuế GTGT (" + (order.VatRate || 0) + "%)", fmtVnd(parseFloat(order.VatAmount) || Math.round(bill * (order.VatRate || 0) / 100))],["Giảm giá", "0 ₫"]].map(([l,v]) => (
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 4px", borderBottom:"1.5px solid #f0ecff", fontSize:13, color:"#666" }}>
                      <span>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"15px 18px", background:"#DA251D", borderRadius:8, marginTop:12 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.85)", letterSpacing:1 }}>TỔNG CỘNG</span>
                    <span style={{ fontSize:22, fontWeight:800, color:"#fff" }}>{fmtVnd(bill + (parseFloat(order.VatAmount) || Math.round(bill * (order.VatRate || 0) / 100)))}</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop:"2px solid #ede9ff", paddingTop:20, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <div style={{ fontSize:11, color:"#bbb" }}>© 2026 SupplyChain7VN · Nền tảng QUẢN LÝ CHUỖI CUNG ỨNG</div>
                <div style={{ fontSize:12, color:"#9a8fb5", fontStyle:"italic" }}>Cảm ơn quý khách đã đồng hành! 🙏</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// ══ LANDING PAGE ════════════════════════════════════════════════════════════════
const LANDING_TARGETS = { suppliers: 6, products: 6, orders: 20, warehouses: 4 };
const LandingPage = ({ onEnter }) => {
  const [count, setCount] = useState({ suppliers: 0, products: 0, orders: 0, warehouses: 0 });

  useEffect(() => {
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount({
        suppliers:  Math.floor(LANDING_TARGETS.suppliers  * ease),
        products:   Math.floor(LANDING_TARGETS.products   * ease),
        orders:     Math.floor(LANDING_TARGETS.orders     * ease),
        warehouses: Math.floor(LANDING_TARGETS.warehouses * ease),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  const features = [
    { icon: "🏭", title: "Quản lý nhà cung cấp", desc: "Theo dõi toàn bộ nhà cung cấp trong một nơi — liên hệ, địa điểm và mối quan hệ sản phẩm.", grad: "#DA251D,#FFCD00" },
    { icon: "📦", title: "Danh mục sản phẩm",      desc: "Duy trì danh mục sản phẩm phong phú với danh mục, giá bán và liên kết nhà cung cấp.",              grad: "#FFCD00,#B71C1C" },
    { icon: "🏗",  title: "Quản lý kho hàng",   desc: "Giám sát sức chứa, công suất và mức tồn kho trên nhiều địa điểm khác nhau.",          grad: "#FFE082,#DA251D" },
    { icon: "📋", title: "Theo dõi tồn kho",   desc: "Theo dõi tồn kho theo thời gian thực với cảnh báo sắp hết và liên kết kho — sản phẩm.",         grad: "#FF8F00,#FFCD00" },
    { icon: "👥", title: "Cơ sở dữ liệu khách hàng",    desc: "Lưu trữ thông tin, liên hệ và lịch sử đặt hàng của mọi khách hàng, dễ tra cứu.",          grad: "#DA251D,#FFE082" },
    { icon: "🛒", title: "Quản lý đơn hàng",     desc: "Đặt hàng, chỉnh sửa và theo dõi đơn hàng liền mạch với hóa đơn và liên kết khách hàng.",              grad: "#B71C1C,#FF8F00" },
  ];

  const steps = [
    { num: "01", title: "Thêm nhà cung cấp & sản phẩm",  desc: "Kết nối nhà cung cấp và xây dựng danh mục sản phẩm với phân loại và giá bán." },
    { num: "02", title: "Thiết lập kho hàng & tồn kho",  desc: "Tạo kho hàng và gán tồn kho để theo dõi công suất theo thời gian thực." },
    { num: "03", title: "Đăng ký khách hàng",        desc: "Xây dựng cơ sở dữ liệu khách hàng và duy trì thông tin liên hệ gọn gàng." },
    { num: "04", title: "Quản lý đơn hàng & báo cáo", desc: "Theo dõi đơn hàng và xem bảng điều khiển với biểu đồ, KPI trực tiếp." },
  ];

  return (
    <div style={{ minHeight:"100vh", position:"relative", zIndex:1, overflowX:"hidden" }}>
      <nav style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 60px", position:"sticky", top:0, zIndex:100, background:"#FFFFFF", borderBottom:"1px solid #E5E7EB" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:42, height:42, background:"linear-gradient(135deg,#DA251D,#FFCD00)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22}}>⬡</div>
          <div style={{ fontFamily:"var(--font-head)", fontSize:22, fontWeight:700, letterSpacing:-0.5 }}>
            Supply<span style={{ color:"#DA251D" }}>Chain7VN</span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:12, color:"var(--muted)", letterSpacing:2 }}>QUẢN LÝ CHUỖI CUNG ỨNG</span>
          <button className="btn-primary" onClick={onEnter} style={{ marginLeft:20, padding:"10px 24px", fontSize:14 }}>Đăng nhập →</button>
        </div>
      </nav>

      <section style={{ textAlign:"center", padding:"110px 24px 80px", maxWidth:900, margin:"0 auto" }} className="fade-up">
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:999, padding:"7px 20px", marginBottom:32, fontSize:12, color:"#DA251D", letterSpacing:1.5 }}>
          <span className="blink" style={{ color:"#DA251D" }}>●</span>
          HỆ THỐNG QUẢN LÝ CHUỖI CUNG ỨNG
        </div>
        <h1 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(42px, 7vw, 78px)", fontWeight:700, lineHeight:1.08, letterSpacing:-2, marginBottom:26 }}>
          Quản lý chuỗi cung ứng
          <span style={{ display:"block", color:"#DA251D" }}> thông minh</span>
          cho doanh nghiệp Việt Nam.
        </h1>
        <p style={{ fontSize:18, color:"var(--muted)", maxWidth:580, margin:"0 auto 44px", lineHeight:1.7 }}>
          SupplyChain7VN cung cấp cho bạn cái nhìn thống nhất, thời gian thực về nhà cung cấp, sản phẩm, kho hàng, tồn kho, khách hàng và đơn hàng — tất cả trong một bảng điều khiển duy nhất.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button className="btn-primary" onClick={onEnter} style={{ padding:"14px 32px", fontSize:15, borderRadius:8 }}>Bắt đầu miễn phí →</button>
          <button className="btn-ghost" style={{ padding:"14px 28px", fontSize:14, borderRadius:8 }} onClick={() => document.getElementById('features-section').scrollIntoView({behavior:'smooth'})}>Khám phá tính năng</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:1, marginTop:72, background:"#FFFFFF", borderRadius:12, border:"1px solid #E5E7EB", overflow:"hidden" }}>
          {[
            { label:"Nhà cung cấp",  val: count.suppliers,  suffix:"+", sub:"Đã đăng ký",  icon:"🏭", grad:"#DA251D,#FFCD00" },
            { label:"Sản phẩm",   val: count.products,   suffix:"+", sub:"Trong danh mục",  icon:"📦", grad:"#FFCD00,#B71C1C" },
            { label:"Đơn hàng",     val: count.orders,     suffix:"+", sub:"Đã xử lý",   icon:"🛒", grad:"#FFE082,#DA251D" },
            { label:"Kho hàng", val: count.warehouses, suffix:"+", sub:"Địa điểm",   icon:"🏗",  grad:"#FF8F00,#FFCD00" },
          ].map((s, i) => (
            <div key={s.label} style={{ padding:"28px 20px", textAlign:"center", borderRight: i < 3 ? "1px solid #E5E7EB" : "none" }}>
              <div style={{ fontSize:24, marginBottom:10 }}>{s.icon}</div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:42, fontWeight:700, color:"#1F2937", lineHeight:1 }}>{s.val}{s.suffix}</div>
              <div style={{ fontSize:13, fontWeight:600, marginTop:8 }}>{s.label}</div>
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:3, letterSpacing:0.5 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features-section" style={{ padding:"80px 60px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <div style={{ fontSize:11, color:"#DA251D", letterSpacing:3, marginBottom:14 }}>TẤT CẢ NHỮNG GÌ BẠN CẦN</div>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(28px,4vw,46px)", fontWeight:700 }}>Được xây dựng cho chuỗi cung ứng hiện đại</h2>
          <p style={{ color:"var(--muted)", marginTop:12, fontSize:15, maxWidth:500, margin:"12px auto 0" }}>Sáu mô-đun mạnh mẽ bao phủ mọi mắt xích trong chuỗi cung ứng của bạn.</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:18 }}>
          {features.map((f, i) => (
            <div key={f.title} className="glass card-3d" style={{ padding:28, position:"relative", overflow:"hidden", animationDelay:`${i*0.07}s` }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`${f.grad.split(',')[0]}`, borderRadius:"12px 12px 0 0" }} />
              <div style={{ width:48, height:48, borderRadius:14, background:`${f.grad.split(',')[0]}1A`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, marginBottom:16 }}>{f.icon}</div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:600, marginBottom:10 }}>{f.title}</div>
              <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.65 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"80px 60px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:60 }}>
          <div style={{ fontSize:11, color:"#DA251D", letterSpacing:3, marginBottom:14 }}>QUY TRÌNH ĐƠN GIẢN</div>
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(28px,4vw,46px)", fontWeight:700 }}>Bắt đầu trong vài phút</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18, position:"relative" }}>
          <div style={{ position:"absolute", top:36, left:"12.5%", right:"12.5%", height:1, background:"#E5E7EB", zIndex:0 }} />
          {steps.map((s, i) => (
            <div key={s.num} className="glass" style={{ padding:24, position:"relative", zIndex:1, textAlign:"center" }}>
              <div style={{ width:52, height:52, margin:"0 auto 18px", borderRadius:"50%", background:"#FEF2F2", border:"1px solid #FECACA", color:"#DA251D", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--font-head)", fontSize:15, fontWeight:700 }}>{s.num}</div>
              <div style={{ fontFamily:"var(--font-head)", fontSize:15, fontWeight:600, marginBottom:10 }}>{s.title}</div>
              <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.65 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding:"60px 60px 100px", maxWidth:900, margin:"0 auto", textAlign:"center" }}>
        <div className="glass" style={{ padding:"60px 40px", borderRadius:12, position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:4, background:"#DA251D" }} />
          <h2 style={{ fontFamily:"var(--font-head)", fontSize:"clamp(26px,4vw,44px)", fontWeight:700, marginBottom:16 }}>Sẵn sàng quản lý chuỗi cung ứng?</h2>
          <p style={{ color:"var(--muted)", fontSize:15, marginBottom:36, maxWidth:480, margin:"0 auto 36px" }}>Đăng nhập để trải nghiệm sức mạnh của hệ thống quản lý chuỗi cung ứng toàn diện.</p>
          <button className="btn-primary" onClick={onEnter} style={{ padding:"14px 40px", fontSize:16, borderRadius:8 }}>Vào bảng tổng quan →</button>
          <div style={{ marginTop:18, fontSize:12, color:"var(--muted)" }}>Tài khoản demo: <span style={{ color:"#B45309" }}>admin / admin123</span></div>
        </div>
      </section>

      <footer style={{ borderTop:"1px solid #E5E7EB", padding:"28px 60px", display:"flex", justifyContent:"space-between", alignItems:"center", color:"var(--muted)", fontSize:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:28, height:28, background:"linear-gradient(135deg,#DA251D,#FFCD00)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>⬡</div>
          <span style={{ fontFamily:"var(--font-head)", fontWeight:600 }}>Supply<span style={{ color:"#DA251D" }}>Chain7VN</span></span>
        </div>
        <div>© 2026 SupplyChain7VN · Nền tảng QUẢN LÝ CHUỖI CUNG ỨNG</div>
      </footer>
    </div>
  );
};

// ══ LOGIN ══════════════════════════════════════════════════════════════════════
const LoginPage = ({ onLogin, onCustomerPortal }) => {
  const [form, setForm] = useState({ username:"", password:"" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const handle = async () => {
    if (!form.username || !form.password) { setErr("Vui lòng nhập đầy đủ thông tin."); return; }
    setLoading(true);
    setErr("");
    try {
      const res = await request("/auth/login", "POST", { username: form.username, password: form.password });
      localStorage.setItem("token", res.access_token);
      onLogin();
    } catch (e) {
      setErr(e.message || "Đăng nhập thất bại. Thử admin / admin123");
      setLoading(false);
    }
  };
  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
      <div className="fade-up" style={{ width:400 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ width:72, height:72, margin:"0 auto 16px", background:"linear-gradient(135deg,#DA251D,#FFCD00)", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34}}>⬡</div>
          <div style={{ fontFamily:"var(--font-head)", fontSize:32, fontWeight:700, letterSpacing:-1 }}>
            Supply<span style={{ color:"#DA251D" }}>Chain7VN</span>
          </div>
          <div style={{ color:"var(--muted)", fontSize:12, letterSpacing:3, marginTop:4 }}>QUẢN LÝ CHUỖI CUNG ỨNG</div>
        </div>
        <div className="glass" style={{ padding:32, borderRadius:12, position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"#DA251D", borderRadius:"12px 12px 0 0" }} />
          <div style={{ marginBottom:18 }}><Label>TÊN ĐĂNG NHẬP</Label><GlassInput placeholder="admin" value={form.username} onChange={e=>setForm({...form,username:e.target.value})} /></div>
          <div style={{ marginBottom:22 }}><Label>MẬT KHẨU</Label><GlassInput type="password" placeholder="••••••••" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&handle()} /></div>
          {err && <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", color:"#B91C1C", fontSize:13, marginBottom:16 }}>{err}</div>}
          <button className="btn-primary" onClick={handle} style={{ width:"100%", padding:"13px", fontSize:15, borderRadius:8 }}>{loading?"Đang đăng nhập...":"Đăng nhập →"}</button>
          <div style={{ textAlign:"center", marginTop:14, color:"var(--muted)", fontSize:12 }}>Tài khoản demo: admin / admin123</div>

          <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0 18px" }}>
            <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }} />
            <span style={{ fontSize:12, color:"var(--muted)", letterSpacing:1 }}>HOẶC</span>
            <div style={{ flex:1, height:1, background:"rgba(0,0,0,0.08)" }} />
          </div>
          <button className="btn-teal" onClick={onCustomerPortal} style={{ width:"100%", padding:"13px", fontSize:15, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            🛒 Cổng khách hàng →
          </button>
          <div style={{ textAlign:"center", marginTop:10, color:"var(--muted)", fontSize:12 }}>Nhập mã khách hàng (VD: C001)</div>
        </div>
      </div>
    </div>
  );
};

// ══ CUSTOMER PORTAL ══════════════════════════════════════════════════════════
const CustomerPortal = ({ onBack }) => {
  const [step, setStep]       = useState("login");
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword]     = useState("");
  const [customer, setCustomer]     = useState(null);
  const [loginErr, setLoginErr]     = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab]         = useState("products");
  const [products, setProducts]     = useState([]);
  const [myOrders, setMyOrders]     = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders]     = useState(false);
  const [requesting, setRequesting]           = useState(null);

  const handleLogin = async () => {
    if (!customerId.trim()) { setLoginErr("Vui lòng nhập mã khách hàng."); return; }
    if (!password) { setLoginErr("Vui lòng nhập mật khẩu."); return; }
    setLoginLoading(true);
    setLoginErr("");
    try {
      const res = await request("/auth/customer-login", "POST", { customer_id: customerId.trim(), password });
      localStorage.setItem("token", res.access_token);
      setCustomer(res.customer);
      setStep("portal");
      loadProducts();
      loadOrders(res.customer.CustomerID);
    } catch (e) {
      setLoginErr(e.message || "Lỗi kết nối. Vui lòng thử lại.");
    }
    setLoginLoading(false);
  };

  const loadProducts = () => {
    setLoadingProducts(true);
    apiFetch('/products').then(p => { setProducts(p); setLoadingProducts(false); })
      .catch(e => { showToast(e.message || "Không tải được sản phẩm.", "error"); setLoadingProducts(false); });
  };

  const loadOrders = (cid) => {
    setLoadingOrders(true);
    Promise.all([apiFetch('/orders'), apiFetch('/products')]).then(([orders, prods]) => {
      const mine = orders.filter(o => o.CustomerID === (cid || customer?.CustomerID));
      const enriched = mine.map(o => ({ ...o, productName: prods.find(p => p.ProductID === o.ProductID)?.ProductName || o.ProductID }));
      setMyOrders(enriched.reverse());
      setLoadingOrders(false);
    }).catch(e => { showToast(e.message || "Không tải được đơn hàng.", "error"); setLoadingOrders(false); });
  };

  const requestProduct = async (product) => {
    setRequesting(product.ProductID);
    try {
      const inv = await apiFetch('/inventory');
      const total = inv.filter(i => i.ProductID === product.ProductID).reduce((a, i) => a + i.QuantityAvailable, 0);
      if (total < 1) {
        showToast(`Sản phẩm "${product.ProductName}" đã hết hàng.`, "error");
        setRequesting(null);
        return;
      }
      const orders = await apiFetch('/orders');
      // Find the highest existing order number and increment it to avoid duplicates
      const maxNum = orders.reduce((max, o) => {
        const num = parseInt(o.OrderID?.replace(/\D/g, "")) || 0;
        return num > max ? num : max;
      }, 0);
      const newId = "ORD" + String(maxNum + 1).padStart(3, "0");
      await apiPost('/orders', {
        OrderID: newId,
        OrderDate: new Date().toISOString().split("T")[0],
        Bill: parseFloat(product.UnitPrice),
        CustomerID: customer.CustomerID,
        ProductID: product.ProductID,
        Quantity: 1,
        Status: "Pending",
      });
      showToast(`Đã gửi yêu cầu "${product.ProductName}"! Admin sẽ xem xét.`);
      loadOrders(customer.CustomerID);
      setTab("orders");
    } catch (e) {
      showToast(e.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.", "error");
    }
    setRequesting(null);
  };

  const catGrad = CAT_GRAD;
  const grads = ["#DA251D,#FFCD00","#FFCD00,#B71C1C","#FFE082,#DA251D","#FF8F00,#FFCD00","#B71C1C,#FF8F00","#DA251D,#FFE082"];

  if (step === "login") {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", zIndex:1 }}>
        <div className="fade-up" style={{ width:400 }}>
          <div style={{ textAlign:"center", marginBottom:36 }}>
            <div style={{ width:72, height:72, margin:"0 auto 16px", background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", fontSize:34 }}>🛒</div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:28, fontWeight:700 }}>Cổng khách hàng</div>
            <div style={{ color:"var(--muted)", fontSize:12, letterSpacing:2, marginTop:6 }}>SupplyChain7VN · TRUY CẬP KHÁCH HÀNG</div>
          </div>
          <div className="glass" style={{ padding:32, borderRadius:12, position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:"#DA251D", borderRadius:"12px 12px 0 0" }} />
            <div style={{ marginBottom:16 }}>
              <Label>MÃ KHÁCH HÀNG CỦA BẠN</Label>
              <GlassInput
                placeholder="VD: C001, C002, C003..."
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                style={{ fontSize:16, padding:"13px 16px" }}
              />
            </div>
            <div style={{ marginBottom:22 }}>
              <Label>MẬT KHẨU</Label>
              <GlassInput
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{ fontSize:16, padding:"13px 16px" }}
              />
              <div style={{ fontSize:11, color:"var(--muted)", marginTop:8 }}>
                Tài khoản demo: C001 / customer123
              </div>
            </div>
            {loginErr && (
              <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:8, padding:"10px 14px", color:"#B91C1C", fontSize:13, marginBottom:16 }}>{loginErr}</div>
            )}
            <button className="btn-teal" onClick={handleLogin} style={{ width:"100%", padding:"13px", fontSize:15, borderRadius:8 }}>
              {loginLoading ? "Đang kiểm tra..." : "Vào cổng →"}
            </button>
            <button onClick={onBack} style={{ width:"100%", marginTop:12, background:"transparent", border:"none", color:"var(--muted)", fontSize:13, cursor:"pointer", padding:"8px" }}>
              ← Quay lại đăng nhập
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", position:"relative", zIndex:1 }}>
      <div style={{ background:"#FFFFFF", borderBottom:"1px solid #E5E7EB", padding:"16px 40px", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ width:38, height:38, background:"#FEF2F2", border:"1px solid #FECACA", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🛒</div>
          <div>
            <div style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:700 }}>Cổng khách hàng</div>
            <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:1 }}>SupplyChain7VN</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:14, fontWeight:600 }}>{customer?.CustomerName}</div>
            <div style={{ fontSize:11, color:"#DA251D" }}>{customer?.CustomerID}</div>
          </div>
          <div style={{ width:40, height:40, background:"#DA251D", color:"#fff", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700 }}>
            {customer?.CustomerName?.charAt(0) || "?"}
          </div>
          <button onClick={onBack} style={{ background:"#FFFFFF", border:"1px solid #FECACA", color:"#B91C1C", cursor:"pointer", borderRadius:8, padding:"7px 14px", fontSize:13, fontFamily:"var(--font-body)", fontWeight:500 }}>Đăng xuất</button>
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"36px 40px" }}>
        <div className="fade-up" style={{ marginBottom:32 }}>
          <div style={{ fontFamily:"var(--font-head)", fontSize:26, fontWeight:700, marginBottom:6 }}>
            Chào mừng trở lại, {customer?.CustomerName?.split(" ")[0]}! 👋
          </div>
          <div style={{ color:"var(--muted)", fontSize:14 }}>Duyệt sản phẩm và gửi yêu cầu — yêu cầu của bạn sẽ được gửi trực tiếp đến đội ngũ của chúng tôi.</div>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:28 }}>
          {[
            { id:"products", label:"🛍 Duyệt sản phẩm" },
            { id:"orders",   label:`📋 Đơn hàng của tôi ${myOrders.length > 0 ? `(${myOrders.length})` : ""}` },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if(t.id==="orders") loadOrders(customer.CustomerID); }}
              className={tab === t.id ? "btn-primary" : "btn-ghost"}
              style={{ padding:"10px 22px", fontSize:14, borderRadius:8 }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "products" && (
          <div className="fade-up">
            {loadingProducts ? (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} h={200} />)}
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
                {products.map((p, i) => {
                  const grad = catGrad[p.Category] || grads[i % 6];
                  const isRequesting = requesting === p.ProductID;
                  return (
                    <div key={p.ProductID} className="glass" style={{ padding:22, position:"relative", overflow:"hidden", transition:"border-color 0.2s", borderRadius:12, border:"1px solid #E5E7EB", background:"#FFFFFF", boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
                      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`${grad.split(",")[0]}`, borderRadius:"12px 12px 0 0" }} />
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                        <IdBadge id={p.ProductID} />
                        <span style={{ background:"#F3F4F6", color:"#6B7280", border:"1px solid #E5E7EB", padding:"3px 10px", borderRadius:6, fontSize:11 }}>{catVi(p.Category)}</span>
                      </div>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:600, marginBottom:8, lineHeight:1.3 }}>{p.ProductName}</div>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:24, fontWeight:700, color:"#1F2937", marginBottom:18 }}>
                        {fmtVnd(p.UnitPrice)}
                      </div>
                      <button
                        onClick={() => requestProduct(p)}
                        disabled={isRequesting}
                        style={{
                          width:"100%", padding:"10px", fontSize:13, fontWeight:600,
                          background: isRequesting ? "#F3F4F6" : "#DA251D",
                          border:"none", borderRadius:8, color: isRequesting ? "#9CA3AF" : "#fff", cursor: isRequesting ? "not-allowed" : "pointer",
                          fontFamily:"var(--font-body)", transition:"background 0.2s"
                        }}>
                        {isRequesting ? "Đang gửi yêu cầu..." : "Yêu cầu sản phẩm này →"}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {tab === "orders" && (
          <div className="fade-up">
            {loadingOrders ? (
              <GlassCard style={{ padding:0, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}>
                  <tbody>{[1,2,3].map(i => <SkeletonRow key={i} />)}</tbody>
                </table>
              </GlassCard>
            ) : myOrders.length === 0 ? (
              <GlassCard style={{ padding:0 }}>
                <EmptyState
                  icon="🛍"
                  title="Chưa có đơn hàng"
                  sub="Duyệt tab sản phẩm và gửi yêu cầu — đơn hàng sẽ xuất hiện ở đây!"
                  action={() => setTab("products")}
                  actionLabel="Duyệt sản phẩm →"
                />
              </GlassCard>
            ) : (
              <GlassCard style={{ padding:0, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <TableHeader cols={["Mã đơn","Sản phẩm","Ngày","Số tiền","Trạng thái"]} />
                  <tbody>
                    {myOrders.map(o => (
                      <tr key={o.OrderID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                        <td style={{ padding:"12px 16px" }}><IdBadge id={o.OrderID} /></td>
                        <td style={{ padding:"12px 16px", fontWeight:600 }}>{o.productName}</td>
                        <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{o.OrderDate}</td>
                        <td style={{ padding:"12px 16px", fontWeight:700, color:"#1F2937" }}>
                          {fmtVnd(o.Bill)}
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <StatusBadge status={o.Status} />
                          {o.Status === "Pending" && <div style={{ fontSize:10, color:"var(--muted)", marginTop:4 }}>Đang chờ duyệt</div>}
                          {o.Status === "Accepted" && <div style={{ fontSize:10, color:"#166534", marginTop:4 }}>Yêu cầu đã được chấp nhận!</div>}
                          {o.Status === "Rejected" && <div style={{ fontSize:10, color:"#991B1B", marginTop:4 }}>Yêu cầu đã bị từ chối</div>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ══ DASHBOARD ══════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const [all, setAll]     = useState({ s:[], p:[], c:[], o:[], inv:[], wh:[] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/suppliers'), apiFetch('/products'), apiFetch('/customers'),
      apiFetch('/orders'),    apiFetch('/inventory'), apiFetch('/warehouses')
    ]).then(([s,p,c,o,inv,wh]) => { setAll({s,p,c,o,inv,wh}); setLoading(false); })
      .catch(e => { showToast(e.message || "Không tải được dữ liệu tổng quan.", "error"); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;
  const { s, p, c, o, inv, wh } = all;
  const totalBill = o.filter(x => x.Status === "Accepted").reduce((a,x) => a + parseFloat(x.Bill), 0);
  const lowStock = inv.filter(i => i.QuantityAvailable < 50);
  const pendingOrders = o.filter(x => x.Status === "Pending");

  const catData = p.reduce((acc,x) => { const k = catVi(x.Category); acc[k]=(acc[k]||0)+1; return acc; }, {});
  const pieData = Object.entries(catData).map(([name,value]) => ({name, value}));
  const pieColors = ["#E0574C","#EFC03A","#F7D575","#F0A040","#B0524A"];

  const invData = inv.map(i => {
    const prod = p.find(x => x.ProductID===i.ProductID);
    return { name: prod?.ProductName?.split(" ").slice(0,2).join(" ") || i.ProductID, qty: i.QuantityAvailable };
  });

  const whData = wh.map(w => {
    const used = inv.filter(i=>i.WarehouseID===w.WarehouseID).reduce((a,i)=>a+i.QuantityAvailable,0);
    return { name: w.WarehouseName.split(" ")[0], used, capacity: w.Capacity };
  });

  return (
    <div className="fade-up">
      <div style={{ marginBottom:30 }}>
        <div style={{ fontFamily:"var(--font-head)", fontSize:30, fontWeight:700 }}>Tổng quan</div>
        <div style={{ color:"var(--muted)", fontSize:13, marginTop:6 }}>
          <span className="blink" style={{ color:"#DA251D", marginRight:8 }}>●</span>
          Trực tiếp · {new Date().toLocaleString()}
        </div>
      </div>

      {lowStock.length > 0 && (
        <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:12, padding:'14px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:14 }} className="fade-up">
          <div style={{ fontSize:22 }}>⚠️</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#B91C1C', marginBottom:3 }}>Cảnh báo tồn kho thấp — {lowStock.length} mặt hàng sắp hết</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>{lowStock.map(i=>{const prod=p.find(x=>x.ProductID===i.ProductID); return `${prod?.ProductName||i.ProductID} (${i.QuantityAvailable} còn lại)`;}).join(' · ')}</div>
          </div>
        </div>
      )}

      {pendingOrders.length > 0 && (
        <div style={{ background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:12, padding:'14px 20px', marginBottom:24, display:'flex', alignItems:'center', gap:14 }} className="fade-up">
          <div style={{ fontSize:22 }}>⏳</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#B45309', marginBottom:3 }}>Yêu cầu chờ duyệt — {pendingOrders.length} đơn hàng đang chờ</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>Vào trang Đơn hàng để chấp nhận hoặc từ chối.</div>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Nhà cung cấp"   value={s.length} sub="đã đăng ký"          gradient="#DA251D,#FFCD00" icon="🏭" />
        <StatCard label="Sản phẩm"    value={p.length} sub="trong danh mục"          gradient="#FFCD00,#B71C1C" icon="📦" />
        <StatCard label="Khách hàng"   value={c.length} sub="đã đăng ký"          gradient="#FFE082,#DA251D" icon="👥" />
        <StatCard label="Tổng doanh thu" value={fmtVnd(totalBill)} sub="từ đơn đã duyệt" gradient="#FF8F00,#FFCD00" icon="💰" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <GlassCard gradient="#DA251D,#FFE082">
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:18 }}>📊 Mức tồn kho</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={invData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{fontSize:10, fill:"#6B7280"}} />
              <YAxis tick={{fontSize:10, fill:"#6B7280"}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="qty" name="Số lượng" radius={[6,6,0,0]}>
                {invData.map((_,i) => <Cell key={i} fill={i < lowStock.length && invData[i]?.qty < 50 ? '#DC2626' : pieColors[i%5]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard gradient="#FFCD00,#FF8F00">
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:18 }}>🍩 Danh mục sản phẩm</div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value" animationBegin={0} animationDuration={1000}>
                {pieData.map((_,i) => <Cell key={i} fill={pieColors[i]} stroke="none" />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display:"flex", gap:14, flexWrap:"wrap", justifyContent:"center", marginTop:8 }}>
            {pieData.map((d,i) => (
              <div key={d.name} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:pieColors[i] }} />
                <span style={{ fontSize:11, color:"var(--muted)" }}>{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        <GlassCard gradient="#FFE082,#DA251D">
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:18 }}>🏗 Sử dụng kho hàng</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={whData} margin={{top:0,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{fontSize:10, fill:"#6B7280"}} />
              <YAxis tick={{fontSize:10, fill:"#6B7280"}} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="used"     name="Tồn kho"    fill="#EFC03A" radius={[4,4,0,0]} />
              <Bar dataKey="capacity" name="Sức chứa" fill="rgba(224,87,76,0.45)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard gradient="#FF8F00,#B71C1C">
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:16 }}>🛒 Đơn hàng gần đây</div>
          {o.slice().reverse().slice(0,5).map(x => (
            <div key={x.OrderID} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{x.OrderID}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{x.CustomerID} · {x.OrderDate}</div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <StatusBadge status={x.Status} />
                <span style={{ fontWeight:700, color:"#1F2937", fontSize:14 }}>{fmtVnd(x.Bill)}</span>
              </div>
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );
};

// ══ SUPPLIERS ══════════════════════════════════════════════════════════════════
const Suppliers = () => {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => { setLoading(true); apiFetch('/suppliers').then(d=>{setData(d);setLoading(false);}).catch(e=>{showToast(e.message||'Không tải được nhà cung cấp.','error');setLoading(false);}); },[]);
  useEffect(()=>{load();},[load]);

  const blank = { SupplierID:"", SupplierName:"", ContactNumber:"", Location:"", TaxCode:"", Email:"" };
  const save = async () => {
    try {
      if (modal==="add") await apiPost('/suppliers', form);
      else await apiPut(`/suppliers/${form.SupplierID}`, form);
      showToast(modal==="add" ? `Đã thêm nhà cung cấp "${form.SupplierName}"!` : `Cập nhật nhà cung cấp thành công.`);
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu nhà cung cấp thất bại.', 'error'); }
  };
  const filtered = data.filter(s => s.SupplierName.toLowerCase().includes(search.toLowerCase()) || s.SupplierID.includes(search));
  const addBtn = <button className="btn-primary" onClick={()=>{setForm(blank);setModal("add");}}>+ Thêm nhà cung cấp</button>;

  return (
    <div className="fade-up">
      <PageHeader crumb="NHÀ CUNG CẤP" title="Nhà cung cấp" sub={`${data.length} nhà cung cấp đã đăng ký`} action={addBtn} />
      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <GlassInput placeholder="🔍  Tìm theo tên hoặc mã..." value={search} onChange={e=>setSearch(e.target.value)} />
      </GlassCard>
      {loading ? (
        <GlassCard style={{ padding:0, overflow:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding:0 }}>
          <EmptyState icon="🏭" title={search ? 'Không có nhà cung cấp nào khớp' : 'Chưa có nhà cung cấp'} sub={search ? 'Thử từ khóa khác.' : 'Thêm nhà cung cấp đầu tiên để bắt đầu.'} action={search ? null : ()=>{setForm(blank);setModal('add');}} actionLabel="+ Thêm nhà cung cấp" />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã NCC","Tên NCC","SĐT","Địa điểm","MST","Thao tác"]} />
            <tbody>
              {filtered.map(s => (
                <tr key={s.SupplierID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"12px 16px" }}><IdBadge id={s.SupplierID} /></td>
                  <td style={{ padding:"12px 16px", fontWeight:600 }}>{s.SupplierName}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{s.ContactNumber}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{s.Location}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{s.TaxCode || "—"}</td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:8 }}>
                      <button className="btn-ghost" onClick={()=>{setForm({...s});setModal("edit");}} style={{ padding:"5px 12px", fontSize:12 }}>Sửa</button>
                      <button className="btn-danger" onClick={()=>setDelTarget({id:s.SupplierID,name:s.SupplierName})} style={{ padding:"5px 12px", fontSize:12 }}>Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}
      {modal && (
        <Modal title={modal==="add"?"Thêm nhà cung cấp":"Sửa nhà cung cấp"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gap:14 }}>
            {modal==="add" && <div><Label>MÃ NHÀ CUNG CẤP</Label><GlassInput value={form.SupplierID||""} onChange={e=>setForm({...form,SupplierID:e.target.value})} placeholder="VD: S006" /></div>}
            <div><Label>TÊN NHÀ CUNG CẤP</Label><GlassInput value={form.SupplierName||""} onChange={e=>setForm({...form,SupplierName:e.target.value})} /></div>
            <div><Label>SỐ ĐIỆN THOẠI</Label><GlassInput value={form.ContactNumber||""} onChange={e=>setForm({...form,ContactNumber:e.target.value})} /></div>
            <div><Label>ĐỊA ĐIỂM</Label><GlassInput value={form.Location||""} onChange={e=>setForm({...form,Location:e.target.value})} /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><Label>MÃ SỐ THUẾ</Label><GlassInput value={form.TaxCode||""} onChange={e=>setForm({...form,TaxCode:e.target.value})} placeholder="VD: 0101234567" /></div>
              <div><Label>EMAIL</Label><GlassInput type="email" value={form.Email||""} onChange={e=>setForm({...form,Email:e.target.value})} placeholder="contact@company.vn" /></div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <Modal title="Xác nhận xóa" onClose={()=>setDelTarget(null)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ color:'var(--muted)', fontSize:13, marginBottom:8 }}>Bạn sắp xóa vĩnh viễn:</div>
            <div style={{ background:'rgba(183,28,28,0.08)', border:'1px solid rgba(183,28,28,0.2)', borderRadius:10, padding:'10px 14px', fontSize:14, fontWeight:600 }}>{delTarget.name}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-danger" onClick={async()=>{ try { await apiDel(`/suppliers/${delTarget.id}`); showToast(`Đã xóa "${delTarget.name}".`); } catch (e) { showToast(e.message||'Xóa thất bại.','error'); return; } setDelTarget(null); load(); }}>Xóa</button>
            <button className="btn-ghost" onClick={()=>setDelTarget(null)}>Hủy</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ PRODUCTS ══════════════════════════════════════════════════════════════════
const Products = () => {
  const [data, setData]         = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [search, setSearch]     = useState("");
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/products'), apiFetch('/suppliers')]).then(([p,s])=>{setData(p);setSuppliers(s);setLoading(false);}).catch(e=>{showToast(e.message||'Không tải được sản phẩm.','error');setLoading(false);});
  },[]);
  useEffect(()=>{load();},[load]);

  const blank = { ProductID:"", ProductName:"", Category:"Máy móc", UnitPrice:0, SupplierID:"", Unit:"Cái", Origin:"Việt Nam" };
  const save = async () => {
    try {
      if (modal==="add") await apiPost('/products', form);
      else await apiPut(`/products/${form.ProductID}`, form);
      showToast(modal==="add" ? `Đã thêm sản phẩm "${form.ProductName}"!` : `Cập nhật sản phẩm thành công.`);
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu sản phẩm thất bại.', 'error'); }
  };

  const catGrad = CAT_GRAD;
  const filtered = data.filter(p => p.ProductName.toLowerCase().includes(search.toLowerCase()));
  const addBtn = <button className="btn-primary" onClick={()=>{setForm({...blank,SupplierID:suppliers[0]?.SupplierID||""});setModal("add");}}>+ Thêm sản phẩm</button>;

  return (
    <div className="fade-up">
      <PageHeader crumb="SẢN PHẨM" title="Sản phẩm" sub={`${data.length} sản phẩm trong danh mục`} action={addBtn} />
      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <GlassInput placeholder="🔍  Tìm kiếm sản phẩm..." value={search} onChange={e=>setSearch(e.target.value)} />
      </GlassCard>
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>{[1,2,3,4,5,6].map(i=><SkeletonCard key={i} h={180}/>)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title={search ? 'Không có sản phẩm nào khớp' : 'Chưa có sản phẩm'} sub={search ? 'Thử từ khóa khác.' : 'Thêm sản phẩm đầu tiên để bắt đầu.'} action={search ? null : ()=>{setForm({...blank,SupplierID:suppliers[0]?.SupplierID||''});setModal('add');}} actionLabel="+ Thêm sản phẩm" />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {filtered.map(p => {
            const sup  = suppliers.find(s=>s.SupplierID===p.SupplierID);
            const grad = catGrad[p.Category]||"#DA251D,#FFCD00";
            return (
              <Card3D key={p.ProductID} gradient={grad} style={{ padding:22 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                  <IdBadge id={p.ProductID} />
                  <span style={{ background:"#F3F4F6", color:"#6B7280", border:"1px solid #E5E7EB", padding:"3px 10px", borderRadius:6, fontSize:11 }}>{catVi(p.Category)}</span>
                </div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:600, marginBottom:6 }}>{p.ProductName}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:4 }}>🏭 {sup?.SupplierName || p.SupplierID}</div>
                <div style={{ fontSize:11, color:"var(--muted)", marginBottom:16 }}>
                  📦 Đơn vị: {p.Unit || "Cái"} · 🌍 {p.Origin || "Việt Nam"}
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontFamily:"var(--font-head)", fontSize:22, fontWeight:700, color:"#1F2937" }}>{fmtVnd(p.UnitPrice)}</span>
                  <div style={{ display:"flex", gap:8 }}>
                    <button className="btn-ghost" onClick={()=>{setForm({...p});setModal("edit");}} style={{ fontSize:12, padding:"5px 12px" }}>Sửa</button>
                    <button className="btn-danger" onClick={()=>setDelTarget({id:p.ProductID,name:`${p.ProductID} — ${p.ProductName}`})} style={{ fontSize:12, padding:"5px 12px" }}>Xóa</button>
                  </div>
                </div>
              </Card3D>
            );
          })}
        </div>
      )}
      {modal && (
        <Modal title={modal==="add"?"Thêm sản phẩm":"Sửa sản phẩm"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gap:14 }}>
            {modal==="add" && <div><Label>MÃ SẢN PHẨM</Label><GlassInput value={form.ProductID||""} onChange={e=>setForm({...form,ProductID:e.target.value})} placeholder="VD: P007" /></div>}
            <div><Label>TÊN SẢN PHẨM</Label><GlassInput value={form.ProductName||""} onChange={e=>setForm({...form,ProductName:e.target.value})} /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><Label>DANH MỤC</Label>
                <GlassSelect value={form.Category} onChange={e=>setForm({...form,Category:e.target.value})} style={{width:"100%"}}>
                  {CATS.map(c=><option key={c} value={c}>{c}</option>)}
                </GlassSelect>
              </div>
              <div><Label>ĐƠN GIÁ (VNĐ)</Label><GlassInput type="number" value={form.UnitPrice||0} onChange={e=>setForm({...form,UnitPrice:+e.target.value})} /></div>
              <div><Label>ĐƠN VỊ TÍNH</Label><GlassInput value={form.Unit||"Cái"} onChange={e=>setForm({...form,Unit:e.target.value})} placeholder="VD: Cái, Chiếc, Thùng, Bao..." /></div>
              <div><Label>XUẤT XỨ</Label><GlassInput value={form.Origin||"Việt Nam"} onChange={e=>setForm({...form,Origin:e.target.value})} placeholder="VD: Việt Nam, Nhật Bản..." /></div>
              <div><Label>NHÀ CUNG CẤP</Label>
                <GlassSelect value={form.SupplierID} onChange={e=>setForm({...form,SupplierID:e.target.value})} style={{width:"100%"}}>
                  {suppliers.map(s=><option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>)}
                </GlassSelect>
              </div>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <Modal title="Xác nhận xóa" onClose={()=>setDelTarget(null)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ color:'var(--muted)', fontSize:13, marginBottom:8 }}>Bạn sắp xóa vĩnh viễn sản phẩm:</div>
            <div style={{ background:'rgba(183,28,28,0.08)', border:'1px solid rgba(183,28,28,0.2)', borderRadius:10, padding:'10px 14px', fontSize:14, fontWeight:600 }}>{delTarget.name}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-danger" onClick={async()=>{ try { await apiDel(`/products/${delTarget.id}`); showToast(`Đã xóa "${delTarget.name}".`); } catch (e) { showToast(e.message||'Xóa thất bại.','error'); return; } setDelTarget(null); load(); }}>Xóa</button>
            <button className="btn-ghost" onClick={()=>setDelTarget(null)}>Hủy</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ WAREHOUSES ════════════════════════════════════════════════════════════════
const Warehouses = () => {
  const [data, setData]       = useState([]);
  const [inv, setInv]         = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(null);
  const [form, setForm]       = useState({});

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/warehouses'), apiFetch('/inventory')]).then(([w,i])=>{setData(w);setInv(i);setLoading(false);}).catch(e=>{showToast(e.message||'Không tải được kho hàng.','error');setLoading(false);});
  },[]);
  useEffect(()=>{load();},[load]);

  const blank = { WarehouseID:"", WarehouseName:"", Location:"", Capacity:5000 };
  const save = async () => {
    try {
      if (modal==="add") await apiPost('/warehouses', form);
      else await apiPut(`/warehouses/${form.WarehouseID}`, form);
      showToast(modal==="add" ? `Đã thêm kho "${form.WarehouseName}"!` : `Cập nhật kho hàng thành công.`);
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu kho hàng thất bại.', 'error'); }
  };
  const grads = ["#DA251D,#FFE082","#FFCD00,#DA251D","#B71C1C,#FFCD00","#FFE082,#FF8F00"];
  const addBtn = <button className="btn-primary" onClick={()=>{setForm(blank);setModal("add");}}>+ Thêm kho hàng</button>;

  return (
    <div className="fade-up">
      <PageHeader crumb="KHO HÀNG" title="Kho hàng" sub={`${data.length} địa điểm lưu trữ`} action={addBtn} />
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>{[1,2,3,4].map(i=><SkeletonCard key={i} h={220}/>)}</div>
      ) : data.length === 0 ? (
        <EmptyState icon="🏗" title="Chưa có kho hàng" sub="Thêm kho hàng đầu tiên để bắt đầu theo dõi vị trí tồn kho." action={()=>{setForm(blank);setModal('add');}} actionLabel="+ Thêm kho hàng" />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          {data.map((w,i) => {
            const used = inv.filter(x=>x.WarehouseID===w.WarehouseID).reduce((a,x)=>a+x.QuantityAvailable,0);
            const pct  = Math.min(100, Math.round((used/w.Capacity)*100));
            const c    = pct>85?"#DC2626":pct>60?"#D97706":"#16A34A";
            const grad = grads[i%4];
            return (
              <Card3D key={w.WarehouseID} gradient={grad}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:18 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                      <IdBadge id={w.WarehouseID} />
                      <span style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:700 }}>{w.WarehouseName}</span>
                    </div>
                    <div style={{ color:"var(--muted)", fontSize:12 }}>📍 {w.Location}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:"var(--font-head)", fontSize:28, fontWeight:700, color:c }}>{pct}%</div>
                    <div style={{ fontSize:10, color:"var(--muted)" }}>đã dùng</div>
                  </div>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                  {[["Sức chứa",`${w.Capacity.toLocaleString()} u`],["Tồn kho",`${used.toLocaleString()} u`]].map(([l,v])=>(
                    <div key={l} className="glass" style={{ padding:"10px 12px", borderRadius:10 }}>
                      <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:1, marginBottom:4 }}>{l.toUpperCase()}</div>
                      <div style={{ fontSize:13, fontWeight:600 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div className="prog-bar" style={{ height:8, marginBottom:14 }}>
                  <div className="prog-fill" style={{ width:`${pct}%`, background:`${c}` }} />
                </div>
                <button className="btn-ghost" onClick={()=>{setForm({...w});setModal("edit");}} style={{ fontSize:12 }}>Sửa kho hàng</button>
              </Card3D>
            );
          })}
        </div>
      )}
      {modal && (
        <Modal title={modal==="add"?"Thêm kho hàng":"Sửa kho hàng"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gap:14 }}>
            {modal==="add" && <div><Label>MÃ KHO</Label><GlassInput value={form.WarehouseID||""} onChange={e=>setForm({...form,WarehouseID:e.target.value})} placeholder="VD: W005" /></div>}
            <div><Label>TÊN KHO</Label><GlassInput value={form.WarehouseName||""} onChange={e=>setForm({...form,WarehouseName:e.target.value})} /></div>
            <div><Label>ĐỊA ĐIỂM</Label><GlassInput value={form.Location||""} onChange={e=>setForm({...form,Location:e.target.value})} /></div>
            <div><Label>SỨC CHỨA</Label><GlassInput type="number" value={form.Capacity||0} onChange={e=>setForm({...form,Capacity:+e.target.value})} /></div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ INVENTORY ════════════════════════════════════════════════════════════════
const Inventory = () => {
  const [data, setData]         = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [search, setSearch]     = useState("");
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/inventory'), apiFetch('/products'), apiFetch('/warehouses')]).then(([i,p,w])=>{
      setData(i); setProducts(p); setWarehouses(w); setLoading(false);
    }).catch(e=>{showToast(e.message||'Không tải được tồn kho.','error');setLoading(false);});
  },[]);
  useEffect(()=>{load();},[load]);

  const blank = { InventoryID:"", QuantityAvailable:0, ProductID:"", WarehouseID:"" };
  const save = async () => {
    try {
      if (modal==="add") await apiPost('/inventory', form);
      else await apiPut(`/inventory/${form.InventoryID}`, form);
      showToast(modal==="add" ? 'Đã thêm bản ghi tồn kho!' : 'Cập nhật bản ghi tồn kho thành công.');
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu tồn kho thất bại.', 'error'); }
  };
  const filtered = data.filter(i => {
    const p = products.find(x=>x.ProductID===i.ProductID);
    return p?.ProductName.toLowerCase().includes(search.toLowerCase()) || i.InventoryID.includes(search);
  });
  const addBtn = <button className="btn-primary" onClick={()=>{setForm({...blank,ProductID:products[0]?.ProductID||"",WarehouseID:warehouses[0]?.WarehouseID||""});setModal("add");}}>+ Thêm tồn kho</button>;

  return (
    <div className="fade-up">
      <PageHeader crumb="TỒN KHO" title="Tồn kho" sub={`${data.length} bản ghi tồn kho`} action={addBtn} />
      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <GlassInput placeholder="🔍  Tìm kiếm tồn kho..." value={search} onChange={e=>setSearch(e.target.value)} />
      </GlassCard>
      {loading ? (
        <GlassCard style={{ padding:0, overflow:"hidden" }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding:0 }}><EmptyState icon="📋" title={search ? 'Không có bản ghi nào khớp' : 'Chưa có bản ghi tồn kho'} sub={search ? 'Thử từ khóa khác.' : 'Thêm bản ghi tồn kho đầu tiên.'} action={search ? null : ()=>{setForm({...blank,ProductID:products[0]?.ProductID||'',WarehouseID:warehouses[0]?.WarehouseID||''});setModal('add');}} actionLabel="+ Thêm tồn kho" /></GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã tồn","Sản phẩm","Kho","Số lượng","Thao tác"]} />
            <tbody>
              {filtered.map(i => {
                const prod = products.find(p=>p.ProductID===i.ProductID);
                const wh   = warehouses.find(w=>w.WarehouseID===i.WarehouseID);
                const c    = i.QuantityAvailable<100?"#DC2626":i.QuantityAvailable<500?"#D97706":"#16A34A";
                return (
                  <tr key={i.InventoryID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                    <td style={{ padding:"12px 16px" }}><IdBadge id={i.InventoryID} /></td>
                    <td style={{ padding:"12px 16px", fontWeight:600 }}>{prod?.ProductName||i.ProductID}</td>
                    <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{wh?.WarehouseName||i.WarehouseID}</td>
                    <td style={{ padding:"12px 16px", fontWeight:700, color:c }}>{i.QuantityAvailable}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="btn-ghost" onClick={()=>{setForm({...i});setModal("edit");}} style={{ padding:"5px 12px", fontSize:12 }}>Sửa</button>
                        <button className="btn-danger" onClick={()=>setDelTarget({id:i.InventoryID,name:prod?.ProductName||i.InventoryID})} style={{ padding:"5px 12px", fontSize:12 }}>Xóa</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}
      {modal && (
        <Modal title={modal==="add"?"Thêm tồn kho":"Sửa tồn kho"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gap:14 }}>
            {modal==="add" && <div><Label>MÃ TỒN KHO</Label><GlassInput value={form.InventoryID||""} onChange={e=>setForm({...form,InventoryID:e.target.value})} placeholder="VD: I007" /></div>}
            <div><Label>SẢN PHẨM</Label>
              <GlassSelect value={form.ProductID} onChange={e=>setForm({...form,ProductID:e.target.value})} style={{width:"100%"}}>
                {products.map(p=><option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
              </GlassSelect>
            </div>
            <div><Label>KHO HÀNG</Label>
              <GlassSelect value={form.WarehouseID} onChange={e=>setForm({...form,WarehouseID:e.target.value})} style={{width:"100%"}}>
                {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseName}</option>)}
              </GlassSelect>
            </div>
            <div><Label>SỐ LƯỢNG TỒN</Label><GlassInput type="number" value={form.QuantityAvailable||0} onChange={e=>setForm({...form,QuantityAvailable:+e.target.value})} /></div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <Modal title="Xác nhận xóa" onClose={()=>setDelTarget(null)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ color:'var(--muted)', fontSize:13, marginBottom:8 }}>Bạn sắp xóa bản ghi tồn kho này:</div>
            <div style={{ background:'rgba(183,28,28,0.08)', border:'1px solid rgba(183,28,28,0.2)', borderRadius:10, padding:'10px 14px', fontSize:14, fontWeight:600 }}>{delTarget.name}</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-danger" onClick={async()=>{ try { await apiDel(`/inventory/${delTarget.id}`); showToast('Đã xóa bản ghi tồn kho.'); } catch (e) { showToast(e.message||'Xóa thất bại.','error'); return; } setDelTarget(null); load(); }}>Xóa</button>
            <button className="btn-ghost" onClick={()=>setDelTarget(null)}>Hủy</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ CUSTOMERS ════════════════════════════════════════════════════════════════
const Customers = () => {
  const [data, setData]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState(null);
  const [form, setForm]     = useState({});
  const [search, setSearch] = useState("");
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => { setLoading(true); apiFetch('/customers').then(d=>{setData(d);setLoading(false);}).catch(e=>{showToast(e.message||'Không tải được khách hàng.','error');setLoading(false);}); },[]);
  useEffect(()=>{load();},[load]);

  const blank = { CustomerID:"", CustomerName:"", ContactNumber:"", Address:"", TaxCode:"", CustomerType:"Individual" };
  const save = async () => {
    try {
      if (modal==="add") await apiPost('/customers', form);
      else await apiPut(`/customers/${form.CustomerID}`, form);
      showToast(modal==="add" ? `Đã thêm khách hàng "${form.CustomerName}"!` : `Cập nhật khách hàng thành công.`);
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu khách hàng thất bại.', 'error'); }
  };
  const filtered = data.filter(c => c.CustomerName.toLowerCase().includes(search.toLowerCase()));
  const grads = ["#DA251D,#FFCD00","#FFCD00,#FFE082","#FFE082,#FF8F00","#FF8F00,#DA251D","#B71C1C,#FFCD00"];
  const addBtn = <button className="btn-primary" onClick={()=>{setForm(blank);setModal("add");}}>+ Thêm khách hàng</button>;

  return (
    <div className="fade-up">
      <PageHeader crumb="KHÁCH HÀNG" title="Khách hàng" sub={`${data.length} khách hàng đã đăng ký`} action={addBtn} />
      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <GlassInput placeholder="🔍  Tìm kiếm khách hàng..." value={search} onChange={e=>setSearch(e.target.value)} />
      </GlassCard>
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>{[1,2,3,4,5,6].map(i=><SkeletonCard key={i} h={200}/>)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="👥" title={search ? 'Không có khách hàng nào khớp' : 'Chưa có khách hàng'} sub={search ? 'Thử từ khóa khác.' : 'Thêm khách hàng đầu tiên để bắt đầu nhận đơn.'} action={search ? null : ()=>{setForm(blank);setModal('add');}} actionLabel="+ Thêm khách hàng" />
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
          {filtered.map((c,i) => {
            const grad = grads[i%5];
            return (
              <Card3D key={c.CustomerID} gradient={grad} style={{ padding:22 }}>
                <div style={{ marginBottom:14 }}><IdBadge id={c.CustomerID} /></div>
                <div style={{ width:48, height:48, borderRadius:14, background:"#DA251D", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:700, marginBottom:12 }}>{c.CustomerName.charAt(0)}</div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:600, marginBottom:6 }}>{c.CustomerName}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:4 }}>📞 {c.ContactNumber}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginBottom:16 }}>📍 {c.Address}</div>
                <div style={{ display:"flex", gap:8 }}>
                  <button className="btn-ghost" onClick={()=>{setForm({...c});setModal("edit");}} style={{ fontSize:12, padding:"5px 12px" }}>Sửa</button>
                  <button className="btn-danger" onClick={()=>setDelTarget({id:c.CustomerID,name:c.CustomerName})} style={{ fontSize:12, padding:"5px 12px" }}>Xóa</button>
                </div>
              </Card3D>
            );
          })}
        </div>
      )}
      {modal && (
        <Modal title={modal==="add"?"Thêm khách hàng":"Sửa khách hàng"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gap:14 }}>
            {modal==="add" && <div><Label>MÃ KHÁCH HÀNG</Label><GlassInput value={form.CustomerID||""} onChange={e=>setForm({...form,CustomerID:e.target.value})} placeholder="VD: C006" /></div>}
            <div><Label>TÊN KHÁCH HÀNG</Label><GlassInput value={form.CustomerName||""} onChange={e=>setForm({...form,CustomerName:e.target.value})} /></div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><Label>LOẠI KHÁCH HÀNG</Label>
                <GlassSelect value={form.CustomerType||"Individual"} onChange={e=>setForm({...form,CustomerType:e.target.value})} style={{width:"100%"}}>
                  <option value="Individual">Cá nhân</option>
                  <option value="Business">Doanh nghiệp</option>
                </GlassSelect>
              </div>
              <div><Label>MÃ SỐ THUẾ {form.CustomerType==="Business" && <span style={{color:"#B71C1C"}}>*</span>}</Label>
                <GlassInput value={form.TaxCode||""} onChange={e=>setForm({...form,TaxCode:e.target.value})} placeholder={form.CustomerType==="Business"?"Bắt buộc":"Không bắt buộc"} />
              </div>
            </div>
            <div><Label>SỐ ĐIỆN THOẠI</Label><GlassInput value={form.ContactNumber||""} onChange={e=>setForm({...form,ContactNumber:e.target.value})} /></div>
            <div><Label>ĐỊA CHỈ</Label><GlassInput value={form.Address||""} onChange={e=>setForm({...form,Address:e.target.value})} /></div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
      {delTarget && (
        <Modal title="Xác nhận xóa" onClose={()=>setDelTarget(null)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ color:'var(--muted)', fontSize:13, marginBottom:8 }}>Bạn sắp xóa vĩnh viễn:</div>
            <div style={{ background:'rgba(183,28,28,0.08)', border:'1px solid rgba(183,28,28,0.2)', borderRadius:10, padding:'10px 14px', fontSize:14, fontWeight:600 }}>{delTarget.name}</div>
          </div>
          <div style={{ display:'flex', gap:10 }}>
            <button className="btn-danger" onClick={async()=>{ try { await apiDel(`/customers/${delTarget.id}`); showToast(`Đã xóa "${delTarget.name}".`); } catch (e) { showToast(e.message||'Xóa thất bại.','error'); return; } setDelTarget(null); load(); }}>Xóa</button>
            <button className="btn-ghost" onClick={()=>setDelTarget(null)}>Hủy</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ ORDERS ════════════════════════════════════════════════════════════════════
const Orders = ({ refreshPending }) => {
  const [data, setData]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/orders'), apiFetch('/customers'), apiFetch('/products')]).then(([o,c,p])=>{
      setData(o); setCustomers(c); setProducts(p); setLoading(false);
      if (refreshPending) refreshPending();
    }).catch(e=>{showToast(e.message||'Không tải được đơn hàng.','error');setLoading(false);});
  },[refreshPending]);
  useEffect(()=>{load();},[load]);

  const save = async () => {
    try {
      if (modal==="add") await apiPost('/orders', {...form, Status: form.Status||"Accepted"});
      else await apiPut(`/orders/${form.OrderID}`, {...form, Status: form.Status||"Accepted"});
      showToast(modal==="add" ? `Đã tạo đơn hàng "${form.OrderID}"!` : `Cập nhật đơn hàng thành công.`);
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu đơn hàng thất bại.', 'error'); }
  };

  const updateStatus = async (oid, status) => {
    try {
      await apiPatch(`/orders/${oid}/status`, { Status: status });
      showToast(`Đơn ${oid}: ${STATUS_VI[status] || status}!`);
      load();
    } catch (e) {
      showToast(e.message || `Không cập nhật được trạng thái đơn ${oid}.`, 'error');
    }
  };

  const filtered = data.filter(o => {
    const c = customers.find(x=>x.CustomerID===o.CustomerID);
    const matchSearch = c?.CustomerName.toLowerCase().includes(search.toLowerCase()) || o.OrderID.includes(search);
    const matchStatus = statusFilter === "All" || (o.Status||"Accepted") === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = data.filter(o => o.Status === "Pending").length;

  return (
    <div className="fade-up">
      {/* ✅ FIXED: Removed addBtn and action prop — orders come from Customer Portal only */}
      <PageHeader crumb="ĐƠN HÀNG" title="Đơn hàng" sub={`${data.length} tổng đơn hàng${pendingCount > 0 ? ` · ${pendingCount} chờ duyệt` : ''}`} />

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["All","Accepted","Pending","Rejected"].map(f => (
          <button key={f} onClick={()=>setStatusFilter(f)}
            className={statusFilter===f ? "btn-primary" : "btn-ghost"}
            style={{ padding:"7px 16px", fontSize:13 }}>
            {f === "All" ? "Tất cả" : (STATUS_VI[f] || f)}
            {f==="Pending" && pendingCount > 0 && <span style={{ marginLeft:6, background:"#DA251D", borderRadius:8, padding:"1px 6px", fontSize:11 }}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <GlassInput placeholder="🔍  Tìm theo khách hàng hoặc mã đơn..." value={search} onChange={e=>setSearch(e.target.value)} />
      </GlassCard>

      {loading ? (
        <GlassCard style={{ padding:0, overflow:"hidden" }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        // ✅ FIXED: Removed "Place your first order" CTA — orders come from Customer Portal
        <GlassCard style={{ padding:0 }}>
          <EmptyState
            icon="🛒"
            title={search ? 'Không có đơn hàng nào khớp' : 'Chưa có đơn hàng'}
            sub={search ? 'Thử từ khóa khác.' : 'Đơn hàng do khách hàng đặt qua Cổng khách hàng sẽ xuất hiện ở đây.'}
          />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã đơn","Ngày","Số tiền","Khách hàng","Sản phẩm","Trạng thái","Thao tác"]} />
            <tbody>
              {filtered.map(o => {
                const cust = customers.find(c=>c.CustomerID===o.CustomerID);
                const prod = products.find(p=>p.ProductID===o.ProductID);
                return (
                  <tr key={o.OrderID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                    <td style={{ padding:"12px 16px" }}>
                      <button className="order-id-btn" onClick={() => setInvoiceOrder(o)} title="Xem hóa đơn">
                        🧾 {o.OrderID}
                      </button>
                    </td>
                    <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{o.OrderDate}</td>
                    <td style={{ padding:"12px 16px", fontWeight:700, color:"#1F2937" }}>{fmtVnd(o.Bill)}</td>
                    <td style={{ padding:"12px 16px", fontWeight:600 }}>{cust?.CustomerName||o.CustomerID}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ background:"#FEF2F2", color:"#DA251D", border:"1px solid #FECACA", padding:"3px 10px", borderRadius:6, fontSize:11 }}>
                        {prod?.ProductName||o.ProductID||"—"}{o.Quantity > 1 ? ` × ${o.Quantity}` : ""}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <StatusBadge status={o.Status} />
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {(o.Status === "Pending" || !o.Status) ? (
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>updateStatus(o.OrderID,"Accepted")} style={{ background:"#DCFCE7", border:"1px solid #BBF7D0", color:"#166534", cursor:"pointer", borderRadius:8, fontSize:12, padding:"5px 10px", fontFamily:"var(--font-body)" }}>✓ Chấp nhận</button>
                          <button onClick={()=>updateStatus(o.OrderID,"Rejected")} className="btn-danger" style={{ padding:"5px 10px", fontSize:12 }}>✗ Từ chối</button>
                        </div>
                      ) : (
                        <div style={{ display:"flex", gap:8 }}>
                          <button className="btn-ghost" onClick={()=>{setForm({...o});setModal("edit");}} style={{ padding:"5px 12px", fontSize:12 }}>Sửa</button>
                          <button className="btn-danger" onClick={()=>setDelTarget({id:o.OrderID,name:`${o.OrderID} (${cust?.CustomerName||o.CustomerID})`})} style={{ padding:"5px 12px", fontSize:12 }}>Xóa</button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}

      {modal && (
        <Modal title={modal==="add"?"Đơn hàng mới":"Sửa đơn hàng"} onClose={()=>setModal(null)}>
          <div style={{ display:"grid", gap:14 }}>
            {modal==="add" && <div><Label>MÃ ĐƠN HÀNG</Label><GlassInput value={form.OrderID||""} onChange={e=>setForm({...form,OrderID:e.target.value})} placeholder="VD: ORD007" /></div>}
            <div><Label>KHÁCH HÀNG</Label>
              <GlassSelect value={form.CustomerID} onChange={e=>setForm({...form,CustomerID:e.target.value})} style={{width:"100%"}}>
                {customers.map(c=><option key={c.CustomerID} value={c.CustomerID}>{c.CustomerName}</option>)}
              </GlassSelect>
            </div>
            <div><Label>SẢN PHẨM</Label>
              <GlassSelect value={form.ProductID} onChange={e=>{
                const pid=e.target.value;
                const prod=products.find(p=>p.ProductID===pid);
                const qty=form.Quantity||1;
                const bill = prod?Math.round(parseFloat(prod.UnitPrice)*qty):form.Bill;
                const vatRate = form.VatRate || 10;
                setForm({...form,ProductID:pid,Bill:bill,VatAmount:Math.round(bill*vatRate/100)});
              }} style={{width:"100%"}}>
                {products.map(p=><option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
              </GlassSelect>
              {form.ProductID && <div style={{fontSize:11,color:'#B45309',marginTop:5}}>💡 Tự động tính từ đơn giá × số lượng — chỉnh lại bên dưới nếu cần.</div>}
            </div>
            <div><Label>NGÀY ĐẶT HÀNG</Label><GlassInput type="date" value={form.OrderDate||""} onChange={e=>setForm({...form,OrderDate:e.target.value})} /></div>
            <div><Label>SỐ LƯỢNG</Label><GlassInput type="number" min={1} value={form.Quantity||1} onChange={e=>{
              const qty=Math.max(1, parseInt(e.target.value,10)||1);
              const prod=products.find(p=>p.ProductID===form.ProductID);
              const bill = prod?Math.round(parseFloat(prod.UnitPrice)*qty):(form.Bill||0);
              const vatRate = form.VatRate || 10;
              setForm({...form,Quantity:qty,Bill:bill,VatAmount:Math.round(bill*vatRate/100)});
            }} /></div>
            <div><Label>SỐ TIỀN (VNĐ)</Label><GlassInput type="number" value={form.Bill||0} onChange={e=>setForm({...form,Bill:+e.target.value})} /></div>
            <div><Label>TRẠNG THÁI</Label>
              <GlassSelect value={form.Status||"Accepted"} onChange={e=>setForm({...form,Status:e.target.value})} style={{width:"100%"}}>
                <option value="Accepted">Đã duyệt</option>
                <option value="Pending">Chờ duyệt</option>
                <option value="Rejected">Từ chối</option>
              </GlassSelect>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu đơn hàng</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}

      {delTarget && (
        <Modal title="Xác nhận xóa" onClose={()=>setDelTarget(null)}>
          <div style={{ marginBottom:20 }}>
            <div style={{ color:'var(--muted)', fontSize:13, marginBottom:8 }}>Bạn sắp xóa vĩnh viễn đơn hàng:</div>
            <div style={{ background:'rgba(183,28,28,0.08)', border:'1px solid rgba(183,28,28,0.2)', borderRadius:10, padding:'10px 14px', fontSize:14, fontWeight:600 }}>{delTarget.name}</div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button className="btn-danger" onClick={async()=>{ try { await apiDel(`/orders/${delTarget.id}`); showToast(`Đã xóa đơn ${delTarget.id}.`); } catch (e) { showToast(e.message||'Xóa thất bại.','error'); return; } setDelTarget(null); load(); }}>Xóa</button>
            <button className="btn-ghost" onClick={()=>setDelTarget(null)}>Hủy</button>
          </div>
        </Modal>
      )}

      {invoiceOrder && (
        <InvoiceModal
          order={invoiceOrder}
          customer={customers.find(c => c.CustomerID === invoiceOrder.CustomerID)}
          product={products.find(p => p.ProductID === invoiceOrder.ProductID)}
          onClose={() => setInvoiceOrder(null)}
        />
      )}
    </div>
  );
};

// ══ APP ═══════════════════════════════════════════════════════════════════════
const NAV = [
  { id:"dashboard", icon:"◈",  label:"Tổng quan"  },
  { id:"suppliers", icon:"🏭", label:"Nhà cung cấp"  },
  { id:"products",  icon:"📦", label:"Sản phẩm"   },
  { id:"warehouses",icon:"🏗", label:"Kho hàng" },
  { id:"inventory", icon:"📋", label:"Tồn kho"  },
  { id:"customers", icon:"👥", label:"Khách hàng"  },
  { id:"orders",    icon:"🛒", label:"Đơn hàng"     },
];
const PAGES = { dashboard:Dashboard, suppliers:Suppliers, products:Products, warehouses:Warehouses, inventory:Inventory, customers:Customers, orders:Orders };

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [page, setPage]     = useState("dashboard");
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(() => {
    apiFetch('/orders').then(orders => {
      setPendingCount(orders.filter(o => o.Status === "Pending").length);
    }).catch(() => setPendingCount(0));
  }, []);

  useEffect(() => {
    if (screen === "app") refreshPending();
  }, [screen, page, refreshPending]);

  if (screen === "landing") return <LandingPage onEnter={() => setScreen("login")}/>;
  if (screen === "login")   return <LoginPage onLogin={() => setScreen("app")} onCustomerPortal={() => setScreen("customer")} />;
  if (screen === "customer") return <><ToastContainer/><CustomerPortal onBack={() => { localStorage.removeItem("token"); setScreen("login"); }} /></>;

  const Page = PAGES[page];
  return (
    <>
      <ToastContainer />
      <div style={{ display:"flex", minHeight:"100vh", position:"relative", zIndex:1 }}>
        <div style={{ width:230, background:"#FFFFFF", borderRight:"1px solid #E5E7EB", display:"flex", flexDirection:"column", position:"fixed", height:"100vh", left:0, top:0, zIndex:10 }}>
          <div style={{ padding:"28px 22px 22px", borderBottom:"1px solid #E5E7EB" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ width:40, height:40, background:"linear-gradient(135deg,#DA251D,#FFCD00)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20}}>⬡</div>
              <div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:700 }}>Supply<span style={{ color:"#DA251D" }}>Chain7VN</span></div>
                <div style={{ fontSize:9, color:"var(--muted)", letterSpacing:2 }}>thông minh</div>
              </div>
            </div>
          </div>
          <nav style={{ flex:1, padding:"14px 12px", overflowY:"auto" }}>
            <div style={{ fontSize:10, color:"var(--muted)", letterSpacing:2, padding:"0 10px", marginBottom:10 }}>ĐIỀU HƯỚNG</div>
            {NAV.map(n => (
              <button key={n.id} onClick={()=>setPage(n.id)} className={`nav-item ${page===n.id?"active":""}`}>
                <span style={{ fontSize:16 }}>{n.icon}</span>
                <span>{n.label}</span>
                {n.id === "orders" && pendingCount > 0 && (
                  <span style={{ marginLeft:"auto", background:"#DA251D", borderRadius:8, padding:"1px 7px", fontSize:11, color:"#fff" }}>{pendingCount}</span>
                )}
                {page===n.id && n.id !== "orders" && <span style={{ marginLeft:"auto", color:"#DA251D", fontWeight:700 }}>›</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding:"16px 18px", borderTop:"1px solid #E5E7EB", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#DA251D", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>👤</div>
            <div><div style={{ fontSize:14, fontWeight:600 }}>Admin</div><div style={{ fontSize:10, color:"var(--muted)" }}>admin@supplychain7vn.vn</div></div>
            <button onClick={()=>{localStorage.removeItem("token");setScreen("landing");}} style={{ marginLeft:"auto", background:"#FFFFFF", border:"1px solid #FECACA", color:"#B91C1C", cursor:"pointer", borderRadius:8, width:30, height:30, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>⏻</button>
          </div>
        </div>
        <div style={{ marginLeft:230, flex:1, padding:36, background:"#F5F7FA", maxWidth:"calc(100vw - 230px)", minHeight:"100vh" }}>
          <Page key={page} refreshPending={refreshPending}/>
        </div>
      </div>
    </>
  );
}












