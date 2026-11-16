import { useState, useEffect, useCallback, useRef } from "react";
import { CSVLink } from "react-csv";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

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
const AUTH_KEY = "auth";
const CUSTOMER_KEY = "customer";

// ── Vai trò (RBAC) ───────────────────────────────────────────────────────────
// Nguồn sự thật: claim "role" trong JWT do backend cấp (backend/app.py: auth_login).
// KHÔNG bao giờ mặc định về "admin" khi thiếu role — đó là lỗi khiến tài khoản
// doanh nghiệp rơi vào giao diện Admin.
const ADMIN_ROLE_IDS = ["admin"];
const ORG_ROLE_IDS   = ["org_manager", "org_staff"];
const normalizeRole  = (role) => String(role ?? "").trim().toLowerCase();
const isAdminRole    = (role) => ADMIN_ROLE_IDS.includes(normalizeRole(role));
const isOrgRole      = (role) => ORG_ROLE_IDS.includes(normalizeRole(role));
const isKnownRole    = (role) => isAdminRole(role) || isOrgRole(role) || normalizeRole(role) === "customer";
// Trang mặc định sau đăng nhập: org_* -> Organization Portal, admin -> Dashboard
const homePageFor    = (role) => (isOrgRole(role) ? "orgDashboard" : "dashboard");

const decodeJwt = (token) => {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(decodeURIComponent(escape(atob(base64))));
  } catch { return null; }
};
const tokenExpired = (token) => {
  const p = decodeJwt(token);
  if (!p || !p.exp) return false;
  return p.exp * 1000 <= Date.now();
};
const hasValidToken = () => {
  const t = getToken();
  if (!t) return false;
  if (tokenExpired(t)) {
    localStorage.removeItem("token");
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CUSTOMER_KEY);
    return false;
  }
  return true;
};
const setAuth = (screen, extra = {}) => {
  const p = decodeJwt(getToken()) || {};
  const auth = {
    screen,
    username: extra.username || p.username || p.sub || "",
    role: normalizeRole(extra.role || p.role),
    full_name: extra.full_name || p.full_name || "",
    organization_id: extra.organization_id !== undefined ? extra.organization_id : (p.organization_id ?? null),
    customer_id: extra.customer_id !== undefined ? extra.customer_id : (p.customer_id ?? null),
    organization: extra.organization || null,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
  return auth;
};
const getAuth = () => {
  try { return JSON.parse(localStorage.getItem(AUTH_KEY)) || null; }
  catch { return null; }
};
const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(CUSTOMER_KEY);
};
const bootstrapAuth = () => {
  if (!hasValidToken()) return { screen: "landing", user: null };
  const cached = getAuth() || {};
  const p = decodeJwt(getToken()) || {};
  // JWT là nguồn sự thật cho role/organization_id/customer_id.
  // localStorage chỉ dùng cho dữ liệu hiển thị (tên, organization đã cache).
  const role = normalizeRole(p.role || cached.role);
  if (!isKnownRole(role)) return { screen: "landing", user: null };
  const user = {
    username: cached.username || p.username || p.sub || "",
    role,
    full_name: cached.full_name || p.full_name || "",
    organization_id: p.organization_id ?? cached.organization_id ?? null,
    customer_id: p.customer_id ?? cached.customer_id ?? null,
    organization: cached.organization || null,
  };
  if (role === "customer") return { screen: "customer", user };
  const screen = ["app", "login"].includes(cached.screen) ? cached.screen : "app";
  return { screen, user };
};

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
      clearAuth();
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
const UNIT_BY_CAT = {
  "Máy móc":"Chiếc", "Nguyên liệu":"Bao", "Bao bì":"Thùng", "Linh kiện":"Bộ",
  Machinery:"Chiếc", "Raw Materials":"Bao", Packaging:"Thùng", Components:"Bộ",
};
const unitVi = (p) => {
  const u = String(p?.Unit || "").trim();
  return u && u.toLowerCase() !== "u" ? u : (UNIT_BY_CAT[p?.Category] || "Cái");
};
const CATS = ["Máy móc", "Nguyên liệu", "Bao bì", "Linh kiện"];
const CAT_GRAD = {
  "Máy móc":"#DA251D,#FFE082", "Nguyên liệu":"#FFE082,#DA251D", "Linh kiện":"#FFCD00,#DA251D", "Bao bì":"#FF8F00,#FFCD00",
  Machinery:"#DA251D,#FFE082", "Raw Materials":"#FFE082,#DA251D", Components:"#FFCD00,#DA251D", Packaging:"#FF8F00,#FFCD00",
};
const STATUS_VI = {
  Accepted: "Đã duyệt", Pending: "Chờ duyệt", Rejected: "Từ chối", Cancelled: "Đã hủy",
  Ordered: "Đã đặt", Received: "Đã nhận", Draft: "Nháp", Pending_Approval: "Chờ duyệt",
  Approved: "Đã duyệt", In_Progress: "Đang kiểm", Completed: "Hoàn tất",
  Submitted: "Chờ duyệt", Converted: "Đã chuyển SO", Sent: "Đã gửi NCC",
  Partially_Received: "Nhận một phần", Processing: "Đang xử lý",
  Active: "Hoạt động", Inactive: "Ngừng hoạt động",
};
const ROLE_VI = {
  admin: "Quản trị viên", org_manager: "Quản lý tổ chức",
  org_staff: "Nhân viên tổ chức", customer: "Khách hàng",
};
const TXN_VI = {
  GoodsReceipt: "Nhập hàng (GRN)", SalesIssue: "Xuất bán", CustomerReturn: "Khách trả hàng",
  ManualAdjustment: "Điều chỉnh tay", StocktakeAdjustment: "Điều chỉnh kiểm kê",
  OpeningBalance: "Tồn đầu kỳ",
};

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
const ProfileRow  = ({ label, value }) => (
  <div>
    <Label>{label}</Label>
    <div style={{ padding:"10px 14px", background:"#F9FAFB", border:"1px solid #E5E7EB", borderRadius:8, fontSize:14, color:"#1F2937" }}>{value || "—"}</div>
  </div>
);
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

const Modal = ({ title, onClose, children, wide }) => (
  <div style={{ position:"fixed", inset:0, background:"rgba(17,24,39,0.5)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
    <div className="glass fade-up" style={{ padding:28, width: wide ? 900 : 620, maxWidth:"95vw", maxHeight:"90vh", overflowY:"auto", borderRadius:12 }}>
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
    Pending_Approval: { bg:"#FEF3C7", color:"#92400E", border:"1px solid #FDE68A" },
    Rejected: { bg:"#FEE2E2", color:"#991B1B", border:"1px solid #FECACA" },
    Cancelled:{ bg:"#F3F4F6", color:"#374151", border:"1px solid #D1D5DB" },
    Ordered:  { bg:"#DBEAFE", color:"#1D4ED8", border:"1px solid #BFDBFE" },
    Received: { bg:"#DCFCE7", color:"#166534", border:"1px solid #BBF7D0" },
    Draft:    { bg:"#F3F4F6", color:"#374151", border:"1px solid #D1D5DB" },
    Approved: { bg:"#DCFCE7", color:"#166534", border:"1px solid #BBF7D0" },
    In_Progress: { bg:"#DBEAFE", color:"#1D4ED8", border:"1px solid #BFDBFE" },
    Completed:{ bg:"#DCFCE7", color:"#14532D", border:"1px solid #86EFAC" },
    Submitted: { bg:"#FEF3C7", color:"#92400E", border:"1px solid #FDE68A" },
    Converted: { bg:"#DBEAFE", color:"#1D4ED8", border:"1px solid #BFDBFE" },
    Sent:      { bg:"#DBEAFE", color:"#1D4ED8", border:"1px solid #BFDBFE" },
    Partially_Received: { bg:"#FFEDD5", color:"#9A3412", border:"1px solid #FED7AA" },
    Processing:{ bg:"#DBEAFE", color:"#1D4ED8", border:"1px solid #BFDBFE" },
    Active:    { bg:"#DCFCE7", color:"#166534", border:"1px solid #BBF7D0" },
    Inactive:  { bg:"#F3F4F6", color:"#374151", border:"1px solid #D1D5DB" },
  };
  const st = styles[s] || styles.Accepted;
  return (
    <span style={{ background:st.bg, color:st.color, border:st.border, padding:"3px 10px", borderRadius:6, fontSize:11, fontWeight:600, whiteSpace:"nowrap" }}>{STATUS_VI[s] || s}</span>
  );
};

const StarRating = ({ value }) => {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return (
    <span title={`${Number(value) || 0}/5`} style={{ color:"#F59E0B", letterSpacing:1, whiteSpace:"nowrap" }}>
      {"★".repeat(rating)}{"☆".repeat(5 - rating)}
    </span>
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
    // VULN-12 fix: use srcdoc + cloneNode instead of doc.write(innerHTML)
    // so no raw HTML from API data is injected via string concatenation.
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(
      "<!DOCTYPE html><html><head><meta charset='utf-8'/>" +
      "<link rel='stylesheet' href='https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;600;700;800&display=swap'/>" +
      "<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}body{background:#fff;font-family:'Be Vietnam Pro',Georgia,sans-serif;color:#111;}@page{margin:15mm;}</style>" +
      "</head><body></body></html>"
    );
    iframeDoc.close();
    // Clone the DOM node — this preserves React-escaped text nodes and
    // never re-executes event handlers or script tags.
    const clone = content.cloneNode(true);
    // Strip any <script> elements that might have been injected
    clone.querySelectorAll("script").forEach(s => s.remove());
    iframeDoc.body.appendChild(clone);
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
      const auth = setAuth("app", {
        username: form.username,
        role: res.role,
        full_name: res.full_name,
        organization_id: res.organization_id,
        customer_id: res.customer_id,
        organization: res.organization,
      });
      onLogin(auth);
    } catch (e) {
      setErr(e.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.");
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
  const restoredCustomer = (() => {
    try { return JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || null; }
    catch { return null; }
  })();
  const [step, setStep]       = useState(restoredCustomer ? "portal" : "login");
  const [customerId, setCustomerId] = useState(restoredCustomer?.CustomerID || "");
  const [password, setPassword]     = useState("");
  const [customer, setCustomer]     = useState(restoredCustomer);
  const [loginErr, setLoginErr]     = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab]         = useState("products");
  const [products, setProducts]     = useState([]);
  const [myOrders, setMyOrders]     = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders]     = useState(false);
  const [requesting, setRequesting]           = useState(null);
  const [stock, setStock]                     = useState({});
  const [qtyById, setQtyById]                 = useState({});
  const [profileForm, setProfileForm]         = useState({ ContactNumber:"", Address:"" });
  const [savingProfile, setSavingProfile]     = useState(false);
  const [cancelling, setCancelling]           = useState(null);
  const [returns, setReturns]                 = useState([]);
  const [loadingReturns, setLoadingReturns]   = useState(false);
  const [returnTarget, setReturnTarget]       = useState(null);
  const [returnForm, setReturnForm]           = useState({ Quantity:1, Reason:"" });
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const inFlightRef = useRef(new Set());

  const handleLogin = async () => {
    if (!customerId.trim()) { setLoginErr("Vui lòng nhập mã khách hàng."); return; }
    if (!password) { setLoginErr("Vui lòng nhập mật khẩu."); return; }
    setLoginLoading(true);
    setLoginErr("");
    try {
      const res = await request("/auth/customer-login", "POST", { customer_id: customerId.trim(), password });
      localStorage.setItem("token", res.access_token);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(res.customer));
      setAuth("customer", { username: res.customer.CustomerID, role: "customer" });
      setCustomer(res.customer);
      setStep("portal");
      loadProducts();
      loadOrders(res.customer.CustomerID);
      loadReturns();
    } catch (e) {
      setLoginErr(e.message || "Lỗi kết nối. Vui lòng thử lại.");
    }
    setLoginLoading(false);
  };

  const loadProducts = () => {
    setLoadingProducts(true);
    Promise.all([apiFetch('/products'), apiFetch('/inventory')])
      .then(([p, inv]) => {
        setProducts(p);
        const stockMap = {};
        inv.forEach(i => {
          stockMap[i.ProductID] = (stockMap[i.ProductID] || 0) + (parseInt(i.QuantityAvailable, 10) || 0);
        });
        setStock(stockMap);
        setLoadingProducts(false);
      })
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

  const loadReturns = () => {
    setLoadingReturns(true);
    apiFetch('/returns').then(d => { setReturns(d); setLoadingReturns(false); })
      .catch(e => { showToast(e.message || "Không tải được yêu cầu trả hàng.", "error"); setLoadingReturns(false); });
  };

  useEffect(() => {
    if (step === "portal" && customer) {
      loadProducts();
      loadOrders(customer.CustomerID);
      loadReturns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (customer) {
      setProfileForm({ ContactNumber: customer.ContactNumber || "", Address: customer.Address || "" });
    }
  }, [customer]);

  const requestProduct = async (product) => {
    if (inFlightRef.current.has(product.ProductID)) return;
    const qty = Math.max(1, parseInt(qtyById[product.ProductID] || 1, 10) || 1);
    const available = stock[product.ProductID] || 0;
    if (available < 1) {
      showToast(`Sản phẩm "${product.ProductName}" đã hết hàng.`, "error");
      return;
    }
    if (qty > available) {
      showToast(`Sản phẩm "${product.ProductName}" chỉ còn ${available} ${unitVi(product)}.`, "error");
      return;
    }
    inFlightRef.current.add(product.ProductID);
    setRequesting(product.ProductID);
    try {
      await apiPost('/orders', {
        OrderDate: new Date().toISOString().split("T")[0],
        ProductID: product.ProductID,
        Quantity: qty,
      });
      showToast(`Đã gửi yêu cầu ${qty} "${product.ProductName}"! Admin sẽ xem xét.`);
      setQtyById(q => ({ ...q, [product.ProductID]: 1 }));
      loadOrders(customer.CustomerID);
      setTab("orders");
    } catch (e) {
      showToast(e.message || "Gửi yêu cầu thất bại. Vui lòng thử lại.", "error");
    } finally {
      inFlightRef.current.delete(product.ProductID);
      setRequesting(null);
    }
  };

  const saveProfile = async () => {
    const contactNumber = profileForm.ContactNumber.trim();
    const address = profileForm.Address.trim();
    if (!contactNumber || !address) {
      showToast("Vui lòng nhập đầy đủ số điện thoại và địa chỉ.", "error");
      return;
    }
    setSavingProfile(true);
    try {
      await apiPut(`/customers/${customer.CustomerID}`, { ContactNumber: contactNumber, Address: address });
      const updated = { ...customer, ContactNumber: contactNumber, Address: address };
      setCustomer(updated);
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify(updated));
      showToast("Đã cập nhật hồ sơ cá nhân.");
    } catch (e) {
      showToast(e.message || "Cập nhật hồ sơ thất bại.", "error");
    }
    setSavingProfile(false);
  };

  const cancelOrder = async (order) => {
    if (!window.confirm(`Bạn chắc chắn muốn hủy đơn ${order.OrderID}?`)) return;
    setCancelling(order.OrderID);
    try {
      await apiPatch(`/orders/${order.OrderID}/status`, { Status: "Cancelled" });
      showToast(`Đã hủy đơn ${order.OrderID}.`);
      loadOrders(customer.CustomerID);
    } catch (e) {
      showToast(e.message || "Không hủy được đơn hàng.", "error");
    }
    setCancelling(null);
  };

  const openReturn = (order) => {
    setReturnTarget(order);
    setReturnForm({ Quantity: 1, Reason: "" });
  };

  const submitReturn = async () => {
    const quantity = parseInt(returnForm.Quantity, 10);
    if (!quantity || quantity < 1) { showToast("Số lượng trả hàng phải lớn hơn 0.", "error"); return; }
    if (quantity > Number(returnTarget.Quantity || 1)) {
      showToast(`Đơn hàng chỉ có ${returnTarget.Quantity} sản phẩm.`, "error"); return;
    }
    if (!returnForm.Reason.trim()) { showToast("Vui lòng nhập lý do trả hàng.", "error"); return; }
    setSubmittingReturn(true);
    try {
      const res = await apiPost('/returns', {
        OriginalOrderID: returnTarget.OrderID,
        Quantity: quantity,
        Reason: returnForm.Reason.trim(),
      });
      showToast(`Đã gửi yêu cầu trả hàng ${res.ReturnID}.`);
      setReturnTarget(null);
      loadReturns();
      setTab("returns");
    } catch (e) {
      showToast(e.message || "Gửi yêu cầu trả hàng thất bại.", "error");
    }
    setSubmittingReturn(false);
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
          <div style={{ color:"var(--muted)", fontSize:13, marginBottom:6 }}>
            {customer?.CustomerType === "Business"
              ? <>🏢 Tài khoản Doanh nghiệp · MST: {customer?.TaxCode || "—"}</>
              : <>👤 Tài khoản Cá nhân</>}
          </div>
          <div style={{ color:"var(--muted)", fontSize:14 }}>Duyệt sản phẩm và gửi yêu cầu — yêu cầu của bạn sẽ được gửi trực tiếp đến đội ngũ của chúng tôi.</div>
        </div>

        <div style={{ display:"flex", gap:8, marginBottom:28 }}>
          {[
            { id:"products", label:"🛍 Duyệt sản phẩm" },
            { id:"orders",   label:`📋 Đơn hàng của tôi ${myOrders.length > 0 ? `(${myOrders.length})` : ""}` },
            { id:"returns",  label:`↩ Yêu cầu trả hàng ${returns.length > 0 ? `(${returns.length})` : ""}` },
            { id:"profile",  label:"👤 Hồ sơ cá nhân" },
          ].map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); if(t.id==="orders") loadOrders(customer.CustomerID); if(t.id==="returns") loadReturns(); }}
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
                  const available = stock[p.ProductID] || 0;
                  const outOfStock = available < 1;
                  const qty = Math.max(1, parseInt(qtyById[p.ProductID] || 1, 10) || 1);
                  const lineTotal = (parseFloat(p.UnitPrice) || 0) * qty;
                  return (
                    <div key={p.ProductID} className="glass" style={{ padding:22, position:"relative", overflow:"hidden", transition:"border-color 0.2s", borderRadius:12, border:"1px solid #E5E7EB", background:"#FFFFFF", boxShadow:"0 1px 3px rgba(0,0,0,0.08)" }}>
                      <div style={{ position:"absolute", top:0, left:0, right:0, height:3, background:`${grad.split(",")[0]}`, borderRadius:"12px 12px 0 0" }} />
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:12 }}>
                        <IdBadge id={p.ProductID} />
                        <span style={{ background:"#F3F4F6", color:"#6B7280", border:"1px solid #E5E7EB", padding:"3px 10px", borderRadius:6, fontSize:11 }}>{catVi(p.Category)}</span>
                      </div>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:17, fontWeight:600, marginBottom:8, lineHeight:1.3 }}>{p.ProductName}</div>
                      <div style={{ fontFamily:"var(--font-head)", fontSize:24, fontWeight:700, color:"#1F2937", marginBottom:4 }}>
                        {fmtVnd(p.UnitPrice)}
                      </div>
                      <div style={{ fontSize:12, color: outOfStock ? "#B91C1C" : "#6B7280", marginBottom:14 }}>
                        {outOfStock ? "Hết hàng" : `Còn ${available} ${unitVi(p)}`}
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <span style={{ fontSize:12, color:"#6B7280", whiteSpace:"nowrap" }}>Số lượng</span>
                        <input
                          type="number"
                          min={1}
                          max={outOfStock ? undefined : available}
                          value={qty}
                          disabled={outOfStock || isRequesting}
                          onChange={e => {
                            const v = Math.max(1, parseInt(e.target.value, 10) || 1);
                            setQtyById(q => ({ ...q, [p.ProductID]: outOfStock ? 1 : Math.min(v, available) }));
                          }}
                          className="glass-input"
                          style={{ width:80, padding:"8px 10px", fontSize:13 }}
                        />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, fontSize:13 }}>
                        <span style={{ color:"#6B7280" }}>Tổng tiền tạm tính</span>
                        <span style={{ fontWeight:700, color:"#1F2937" }}>{fmtVnd(lineTotal)}</span>
                      </div>
                      <button
                        onClick={() => requestProduct(p)}
                        disabled={isRequesting || outOfStock}
                        style={{
                          width:"100%", padding:"10px", fontSize:13, fontWeight:600,
                          background: (isRequesting || outOfStock) ? "#F3F4F6" : "#DA251D",
                          border:"none", borderRadius:8, color: (isRequesting || outOfStock) ? "#9CA3AF" : "#fff",
                          cursor: (isRequesting || outOfStock) ? "not-allowed" : "pointer",
                          fontFamily:"var(--font-body)", transition:"background 0.2s"
                        }}>
                        {outOfStock ? "Hết hàng" : isRequesting ? "Đang gửi yêu cầu..." : "Yêu cầu sản phẩm này →"}
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
                  <TableHeader cols={["Mã đơn","Sản phẩm","Ngày","Số tiền","Trạng thái","Thao tác"]} />
                  <tbody>
                    {myOrders.map(o => (
                      <tr key={o.OrderID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                        <td style={{ padding:"12px 16px" }}><IdBadge id={o.OrderID} /></td>
                        <td style={{ padding:"12px 16px", fontWeight:600 }}>{o.productName}{o.Quantity > 1 ? ` × ${o.Quantity}` : ""}</td>
                        <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{o.OrderDate}</td>
                        <td style={{ padding:"12px 16px", fontWeight:700, color:"#1F2937" }}>
                          {fmtVnd(o.Bill)}
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          <StatusBadge status={o.Status} />
                          {o.Status === "Pending" && <div style={{ fontSize:10, color:"var(--muted)", marginTop:4 }}>Đang chờ duyệt</div>}
                          {o.Status === "Accepted" && <div style={{ fontSize:10, color:"#166534", marginTop:4 }}>Yêu cầu đã được chấp nhận!</div>}
                          {o.Status === "Rejected" && <div style={{ fontSize:10, color:"#991B1B", marginTop:4 }}>Yêu cầu đã bị từ chối</div>}
                          {o.Status === "Cancelled" && <div style={{ fontSize:10, color:"#6B7280", marginTop:4 }}>Đơn hàng đã được hủy</div>}
                        </td>
                        <td style={{ padding:"12px 16px" }}>
                          {o.Status === "Pending" ? (
                            <button
                              className="btn-danger"
                              onClick={() => cancelOrder(o)}
                              disabled={cancelling === o.OrderID}
                              style={{ padding:"5px 12px", fontSize:12 }}>
                              {cancelling === o.OrderID ? "Đang hủy..." : "Hủy đơn"}
                            </button>
                          ) : o.Status === "Accepted" ? (
                            <button className="btn-ghost" onClick={() => openReturn(o)} style={{ padding:"5px 12px", fontSize:12 }}>
                              Trả hàng
                            </button>
                          ) : (
                            <span style={{ color:"var(--muted-2)", fontSize:12 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            )}
          </div>
        )}

        {tab === "returns" && (
          <div className="fade-up">
            {loadingReturns ? (
              <GlassCard style={{ padding:0, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse" }}><tbody>{[1,2,3].map(i => <SkeletonRow key={i} />)}</tbody></table>
              </GlassCard>
            ) : returns.length === 0 ? (
              <GlassCard style={{ padding:0 }}>
                <EmptyState
                  icon="↩"
                  title="Chưa có yêu cầu trả hàng"
                  sub="Bạn có thể gửi yêu cầu trả hàng từ đơn đã được duyệt trong tab Đơn hàng."
                  action={() => setTab("orders")}
                  actionLabel="Xem đơn hàng →"
                />
              </GlassCard>
            ) : (
              <GlassCard style={{ padding:0, overflow:"hidden" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                  <TableHeader cols={["Mã yêu cầu","Đơn gốc","Sản phẩm","SL","Lý do","Hoàn tiền","Trạng thái"]} />
                  <tbody>
                    {returns.map(r => (
                      <tr key={r.ReturnID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                        <td style={{ padding:"12px 16px" }}><IdBadge id={r.ReturnID} /></td>
                        <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{r.OriginalOrderID}</td>
                        <td style={{ padding:"12px 16px", fontWeight:600 }}>{r.ProductName}</td>
                        <td style={{ padding:"12px 16px", textAlign:"right" }}>{r.Quantity} {r.Unit || ""}</td>
                        <td style={{ padding:"12px 16px", color:"var(--muted)", maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.Reason}>{r.Reason}</td>
                        <td style={{ padding:"12px 16px", textAlign:"right", fontWeight:600 }}>{r.Status === "Approved" ? fmtVnd(r.RefundAmount) : "—"}</td>
                        <td style={{ padding:"12px 16px" }}><StatusBadge status={r.Status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </GlassCard>
            )}
          </div>
        )}

        {tab === "profile" && (
          <div className="fade-up">
            <GlassCard style={{ maxWidth:640 }}>
              <div style={{ fontFamily:"var(--font-head)", fontSize:18, fontWeight:600, marginBottom:20 }}>Hồ sơ cá nhân</div>
              <div style={{ display:"grid", gap:14 }}>
                <ProfileRow label="MÃ KHÁCH HÀNG" value={customer?.CustomerID} />
                <ProfileRow label="TÊN KHÁCH HÀNG" value={customer?.CustomerName} />
                <div>
                  <Label>SỐ ĐIỆN THOẠI</Label>
                  <GlassInput value={profileForm.ContactNumber} onChange={e => setProfileForm({ ...profileForm, ContactNumber: e.target.value })} />
                </div>
                <div>
                  <Label>ĐỊA CHỈ</Label>
                  <GlassInput value={profileForm.Address} onChange={e => setProfileForm({ ...profileForm, Address: e.target.value })} />
                </div>
                <ProfileRow label="LOẠI KHÁCH HÀNG" value={customer?.CustomerType === "Business" ? "Doanh nghiệp" : "Cá nhân"} />
                <ProfileRow label="MÃ SỐ THUẾ" value={customer?.TaxCode} />
                <div style={{ display:"flex", gap:10, marginTop:6 }}>
                  <button className="btn-primary" onClick={saveProfile} disabled={savingProfile}>
                    {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                  </button>
                  <button className="btn-ghost" onClick={() => setProfileForm({ ContactNumber: customer?.ContactNumber || "", Address: customer?.Address || "" })}>
                    Hoàn tác
                  </button>
                </div>
              </div>
            </GlassCard>
          </div>
        )}
      </div>

      {returnTarget && (
        <Modal title={`Yêu cầu trả hàng · ${returnTarget.OrderID}`} onClose={()=>setReturnTarget(null)}>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#475569" }}>
              {returnTarget.productName} · Đã mua {returnTarget.Quantity} sản phẩm
            </div>
            <div><Label>SỐ LƯỢNG TRẢ</Label>
              <GlassInput type="number" min={1} max={returnTarget.Quantity} value={returnForm.Quantity} onChange={e=>setReturnForm({...returnForm,Quantity:e.target.value})} />
            </div>
            <div><Label>LÝ DO TRẢ HÀNG</Label>
              <GlassInput value={returnForm.Reason} onChange={e=>setReturnForm({...returnForm,Reason:e.target.value})} placeholder="VD: Sản phẩm bị lỗi, giao sai mẫu..." />
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={submitReturn} disabled={submittingReturn}>
                {submittingReturn ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
              <button className="btn-ghost" onClick={()=>setReturnTarget(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ DASHBOARD ══════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const [all, setAll]     = useState({ s:[], p:[], c:[], o:[], inv:[], wh:[] });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/suppliers'), apiFetch('/products'), apiFetch('/customers'),
      apiFetch('/orders'),    apiFetch('/inventory'), apiFetch('/warehouses'),
      apiFetch('/dashboard/summary').catch(() => null),
    ]).then(([s,p,c,o,inv,wh,sum]) => { setAll({s,p,c,o,inv,wh}); setSummary(sum); setLoading(false); })
      .catch(e => { showToast(e.message || "Không tải được dữ liệu tổng quan.", "error"); setLoading(false); });
  }, []);

  if (loading) return <Spinner />;
  const { s, p, c, o, inv, wh } = all;
  const totalBill = o.filter(x => x.Status === "Accepted").reduce((a,x) => a + parseFloat(x.Bill), 0);
  const lowStock = inv.filter(i => i.QuantityAvailable < 50);
  const pendingOrders = o.filter(x => x.Status === "Pending");
  const T = summary?.totals || {};
  const totalRevenue = T.Revenue !== undefined ? T.Revenue : totalBill;
  const pendingWorkflow = (T.PendingPR || 0) + (T.PendingCPR || 0) + (T.PendingReturns || 0) + (T.OpenPOs || 0);

  const catData = p.reduce((acc,x) => { const k = catVi(x.Category); acc[k]=(acc[k]||0)+1; return acc; }, {});
  const pieColors = ["#E0574C","#EFC03A","#F7D575","#F0A040","#B0524A"];
  // Inventory VALUE per category comes from the API; never repeat product names
  const fallbackCatValue = {};
  inv.forEach(i => {
    const prod = p.find(x => x.ProductID === i.ProductID);
    const k = catVi(prod?.Category);
    fallbackCatValue[k] = (fallbackCatValue[k] || 0) + Number(i.QuantityAvailable || 0) * Number(prod?.UnitPrice || 0);
  });
  const apiCatValue = (summary?.inventoryByCategory || []).map(r => ({ name: catVi(r.Category), value: Number(r.Value) || 0 }));
  const pieData = apiCatValue.length ? apiCatValue : Object.entries(fallbackCatValue).map(([name, value]) => ({ name, value }));
  const flowData = (summary?.goodsFlow || []).map(r => ({ name: r.Month, Inbound: Number(r.Inbound) || 0, Outbound: Number(r.Outbound) || 0 }));
  const revData = (summary?.monthlyRevenue || []).map(r => ({ name: r.Month, Revenue: Number(r.Revenue) || 0 }));
  const topSuppliers = summary?.topSuppliers || [];

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

      {pendingWorkflow > 0 && (
        <div style={{ background:'#EFF6FF', border:'1px solid #BFDBFE', borderRadius:12, padding:'14px 20px', marginBottom:16, display:'flex', alignItems:'center', gap:14 }} className="fade-up">
          <div style={{ fontSize:22 }}>📋</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14, color:'#1D4ED8', marginBottom:3 }}>Công việc chờ xử lý — {pendingWorkflow} hồ sơ</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>
              PR chờ duyệt: {T.PendingPR || 0} · Yêu cầu KH: {T.PendingCPR || 0} · Trả hàng: {T.PendingReturns || 0} · PO đang mở: {T.OpenPOs || 0}
            </div>
          </div>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:16 }}>
        <StatCard label="Nhà cung cấp"   value={T.SupplierCount ?? s.length} sub="đã đăng ký"          gradient="#DA251D,#FFCD00" icon="🏭" />
        <StatCard label="Sản phẩm"    value={T.ProductCount ?? p.length} sub="trong danh mục"          gradient="#FFCD00,#B71C1C" icon="📦" />
        <StatCard label="Khách hàng"   value={T.CustomerCount ?? c.length} sub={`${T.OrganizationCount ?? 0} tổ chức`} gradient="#FFE082,#DA251D" icon="👥" />
        <StatCard label="Tổng doanh thu" value={fmtVnd(totalRevenue)} sub="đơn hợp lệ" gradient="#FF8F00,#FFCD00" icon="💰" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        <StatCard label="Tồn kho" value={(T.InventoryUnits ?? inv.reduce((a,i)=>a+Number(i.QuantityAvailable||0),0)).toLocaleString('vi-VN')} sub="đơn vị trong kho" gradient="#0EA5E9,#22D3EE" icon="📊" />
        <StatCard label="Giá trị tồn kho" value={fmtVnd(T.InventoryValue || 0)} sub="theo giá bán" gradient="#10B981,#34D399" icon="🏷" />
        <StatCard label="Tồn thấp" value={T.LowStockCount ?? lowStock.length} sub="mặt hàng dưới ngưỡng" gradient="#F59E0B,#FBBF24" icon="⚠️" />
        <StatCard label="Người dùng tổ chức" value={T.OrgUserCount ?? 0} sub="org_manager + org_staff" gradient="#8B5CF6,#A78BFA" icon="🧑‍💼" />
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
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:18 }}>🍩 Giá trị tồn kho theo danh mục</div>
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
                <span style={{ fontSize:11, color:"var(--muted)" }}>{d.name} · {fmtVnd(d.value)}</span>
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

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:16 }}>
        <GlassCard gradient="#0EA5E9,#22D3EE">
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:18 }}>📈 Nhập / xuất kho theo tháng</div>
          {flowData.length === 0 ? (
            <div style={{ fontSize:13, color:"var(--muted)", padding:"30px 0", textAlign:"center" }}>Chưa có giao dịch kho.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={flowData} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fontSize:10, fill:"#6B7280"}} />
                <YAxis tick={{fontSize:10, fill:"#6B7280"}} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Inbound"  name="Nhập kho" fill="#10B981" radius={[4,4,0,0]} />
                <Bar dataKey="Outbound" name="Xuất kho" fill="#EF4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>

        <GlassCard gradient="#10B981,#34D399">
          <div style={{ fontFamily:"var(--font-head)", fontWeight:600, fontSize:15, marginBottom:18 }}>💰 Doanh thu theo tháng</div>
          {revData.length === 0 ? (
            <div style={{ fontSize:13, color:"var(--muted)", padding:"30px 0", textAlign:"center" }}>Chưa có dữ liệu doanh thu.</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revData} margin={{top:0,right:0,left:-20,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="name" tick={{fontSize:10, fill:"#6B7280"}} />
                <YAxis tick={{fontSize:10, fill:"#6B7280"}} tickFormatter={v => `${Math.round(v/1000000)}tr`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="Revenue" name="Doanh thu" fill="#DA251D" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>

      <GlassCard style={{ marginTop:16, padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #E5E7EB", fontWeight:600 }}>🏭 Top nhà cung cấp theo giá trị mua hàng</div>
        {topSuppliers.length === 0 ? (
          <div style={{ fontSize:13, color:"var(--muted)", padding:"24px 18px" }}>Chưa có đơn mua hàng.</div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <TableHeader cols={["Nhà cung cấp","Số đơn mua","Giá trị mua hàng"]} />
              <tbody>
                {topSuppliers.map(s => (
                  <tr key={s.SupplierID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                    <td style={{ padding:"10px 16px", fontWeight:600, whiteSpace:"nowrap" }}>{s.SupplierName}</td>
                    <td style={{ padding:"10px 16px", textAlign:"right" }}>{s.OrderCount}</td>
                    <td style={{ padding:"10px 16px", textAlign:"right", fontWeight:600, whiteSpace:"nowrap" }}>{fmtVnd(s.PurchaseValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
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

  const blank = { SupplierID:"", SupplierName:"", ContactNumber:"", Location:"", TaxCode:"", Email:"", Rating:5, OnTimeRate:100 };
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
            <TableHeader cols={["Mã NCC","Tên NCC","SĐT","Địa điểm","Đánh giá","Đúng hạn","Thao tác"]} />
            <tbody>
              {filtered.map(s => (
                <tr key={s.SupplierID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"12px 16px" }}><IdBadge id={s.SupplierID} /></td>
                  <td style={{ padding:"12px 16px", fontWeight:600 }}>{s.SupplierName}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{s.ContactNumber}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{s.Location}</td>
                  <td style={{ padding:"12px 16px" }}><StarRating value={s.Rating} /> <span style={{ fontSize:11, color:"var(--muted)", marginLeft:4 }}>{s.Rating || 0}/5</span></td>
                  <td style={{ padding:"12px 16px", fontWeight:600, color: Number(s.OnTimeRate) >= 90 ? "#166534" : Number(s.OnTimeRate) >= 70 ? "#92400E" : "#991B1B" }}>{Number(s.OnTimeRate ?? 100).toFixed(0)}%</td>
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
              <div><Label>ĐÁNH GIÁ (1–5 SAO)</Label>
                <GlassSelect value={form.Rating ?? 5} onChange={e=>setForm({...form,Rating:+e.target.value})} style={{width:"100%"}}>
                  {[5,4,3,2,1].map(n=><option key={n} value={n}>{"★".repeat(n)}{"☆".repeat(5-n)} ({n}/5)</option>)}
                </GlassSelect>
              </div>
              <div><Label>TỶ LỆ ĐÚNG HẠN (%)</Label><GlassInput type="number" min={0} max={100} step={0.1} value={form.OnTimeRate ?? 100} onChange={e=>setForm({...form,OnTimeRate:+e.target.value})} /></div>
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
                  📦 Đơn vị: {unitVi(p)} · 🌍 {p.Origin || "Việt Nam"}
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
                  {[["Sức chứa",`${w.Capacity.toLocaleString()} Tấn`],["Tồn kho",`${used.toLocaleString()} Tấn`]].map(([l,v])=>(
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
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ NewQuantity: "0", Reason: "Kiểm kê" });

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

  const saveAdjustment = async () => {
    const newQuantity = parseInt(adjustForm.NewQuantity, 10);
    if (Number.isNaN(newQuantity) || newQuantity < 0) {
      showToast('Số lượng mới phải là số nguyên không âm.', 'error');
      return;
    }
    if (!adjustForm.Reason) {
      showToast('Vui lòng chọn lý do điều chỉnh.', 'error');
      return;
    }
    try {
      const res = await apiPost('/inventory/adjust', {
        InventoryID: adjustTarget.InventoryID,
        NewQuantity: newQuantity,
        Reason: adjustForm.Reason,
      });
      showToast(`Đã điều chỉnh ${adjustTarget.InventoryID}: ${res.OldQuantity} → ${res.NewQuantity}.`);
      setAdjustTarget(null);
      load();
    } catch (e) {
      showToast(e.message || 'Điều chỉnh tồn kho thất bại.', 'error');
    }
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
                        <button
                          className="btn-ghost"
                          onClick={()=>{
                            setAdjustTarget({ ...i, productName: prod?.ProductName || i.ProductID, warehouseName: wh?.WarehouseName || i.WarehouseID });
                            setAdjustForm({ NewQuantity: String(i.QuantityAvailable ?? 0), Reason: "Kiểm kê" });
                          }}
                          style={{ padding:"5px 12px", fontSize:12 }}>Điều chỉnh</button>
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
      {adjustTarget && (
        <Modal title="Điều chỉnh tồn kho" onClose={()=>setAdjustTarget(null)}>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#475569" }}>
              <div>{adjustTarget.productName} · {adjustTarget.warehouseName}</div>
              <div style={{ marginTop:4 }}>Tồn hiện tại: <strong>{adjustTarget.QuantityAvailable}</strong> · Mã: {adjustTarget.InventoryID}</div>
            </div>
            <div>
              <Label>SỐ LƯỢNG MỚI</Label>
              <GlassInput
                type="number"
                min="0"
                step="1"
                value={adjustForm.NewQuantity}
                onChange={e=>setAdjustForm({...adjustForm, NewQuantity:e.target.value})}
              />
            </div>
            <div>
              <Label>LÝ DO ĐIỀU CHỈNH</Label>
              <GlassSelect value={adjustForm.Reason} onChange={e=>setAdjustForm({...adjustForm, Reason:e.target.value})} style={{ width:"100%" }}>
                {["Kiểm kê","Hàng hỏng","Nhập thêm","Xuất kho"].map(r=><option key={r} value={r}>{r}</option>)}
              </GlassSelect>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={saveAdjustment}>Xác nhận</button>
              <button className="btn-ghost" onClick={()=>setAdjustTarget(null)}>Hủy</button>
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
const Orders = ({ refreshPending, role }) => {
  const isOrgView = ORG_ROLE_IDS.includes(role);
  const [data, setData]         = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);
  const [form, setForm]         = useState({});
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [delTarget, setDelTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const reqs = isOrgView
      ? [apiFetch('/orders'), apiFetch('/products')]
      : [apiFetch('/orders'), apiFetch('/customers'), apiFetch('/products')];
    Promise.all(reqs).then(([o,a,b])=>{
      if (isOrgView) { setData(o); setProducts(a); setCustomers([]); }
      else { setData(o); setCustomers(a); setProducts(b); }
      setLoading(false);
      if (refreshPending) refreshPending();
    }).catch(e=>{showToast(e.message||'Không tải được đơn hàng.','error');setLoading(false);});
  },[refreshPending, isOrgView]);
  useEffect(()=>{load();},[load]);

  const save = async () => {
    try {
      if (modal==="add") await apiPost('/orders', {...form, Status: "Pending"});
      else {
        const { Status, ...updatePayload } = form;
        await apiPut(`/orders/${form.OrderID}`, updatePayload);
      }
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
    const custName = c?.CustomerName || o.CustomerName || "";
    const matchSearch = custName.toLowerCase().includes(search.toLowerCase()) || o.OrderID.includes(search);
    const matchStatus = statusFilter === "All" || (o.Status||"Accepted") === statusFilter;
    const matchFrom = !dateFrom || o.OrderDate >= dateFrom;
    const matchTo = !dateTo || o.OrderDate <= dateTo;
    return matchSearch && matchStatus && matchFrom && matchTo;
  });

  const pendingCount = data.filter(o => o.Status === "Pending").length;
  const hasDateFilter = Boolean(dateFrom || dateTo);

  const csvRows = filtered.map(o => {
    const cust = customers.find(c => c.CustomerID === o.CustomerID);
    const prod = products.find(p => p.ProductID === o.ProductID);
    return {
      OrderID: o.OrderID,
      OrderDate: o.OrderDate,
      Customer: cust?.CustomerName || o.CustomerName || o.CustomerID,
      Product: `${prod?.ProductName || o.ProductID || ""}${o.Quantity > 1 ? ` × ${o.Quantity}` : ""}`,
      Amount: Number(o.Bill) || 0,
      Status: STATUS_VI[o.Status] || o.Status || "",
    };
  });
  const csvHeaders = [
    { label: "Mã đơn", key: "OrderID" },
    { label: "Ngày", key: "OrderDate" },
    { label: "Khách hàng", key: "Customer" },
    { label: "Sản phẩm", key: "Product" },
    { label: "Số tiền", key: "Amount" },
    { label: "Trạng thái", key: "Status" },
  ];
  const exportBtn = filtered.length > 0 ? (
    <CSVLink
      data={csvRows}
      headers={csvHeaders}
      filename={`don-hang-${new Date().toISOString().slice(0,10)}.csv`}
      bom
      className="btn-teal"
      style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:6 }}
    >
      Xuất Excel
    </CSVLink>
  ) : (
    <button className="btn-teal" disabled style={{ opacity:0.5, cursor:"not-allowed" }}>Xuất Excel</button>
  );

  return (
    <div className="fade-up">
      <PageHeader
        crumb="ĐƠN HÀNG"
        title="Đơn hàng"
        sub={`${data.length} tổng đơn hàng${pendingCount > 0 ? ` · ${pendingCount} chờ duyệt` : ''}`}
        action={exportBtn}
      />

      <div style={{ display:"flex", gap:8, marginBottom:16 }}>
        {["All","Accepted","Pending","Rejected","Cancelled"].map(f => (
          <button key={f} onClick={()=>setStatusFilter(f)}
            className={statusFilter===f ? "btn-primary" : "btn-ghost"}
            style={{ padding:"7px 16px", fontSize:13 }}>
            {f === "All" ? "Tất cả" : (STATUS_VI[f] || f)}
            {f==="Pending" && pendingCount > 0 && <span style={{ marginLeft:6, background:"#DA251D", borderRadius:8, padding:"1px 6px", fontSize:11 }}>{pendingCount}</span>}
          </button>
        ))}
      </div>

      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 260px" }}>
            <Label>TÌM KIẾM</Label>
            <GlassInput placeholder="🔍  Tìm theo khách hàng hoặc mã đơn..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ width:170 }}>
            <Label>TỪ NGÀY</Label>
            <GlassInput type="date" value={dateFrom} max={dateTo || undefined} onChange={e=>setDateFrom(e.target.value)} />
          </div>
          <div style={{ width:170 }}>
            <Label>ĐẾN NGÀY</Label>
            <GlassInput type="date" value={dateTo} min={dateFrom || undefined} onChange={e=>setDateTo(e.target.value)} />
          </div>
          {hasDateFilter && (
            <button className="btn-ghost" onClick={()=>{setDateFrom("");setDateTo("");}} style={{ padding:"10px 16px", fontSize:13 }}>
              Xóa lọc
            </button>
          )}
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard style={{ padding:0, overflow:"hidden" }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        // ✅ FIXED: Removed "Place your first order" CTA — orders come from Customer Portal
        <GlassCard style={{ padding:0 }}>
          <EmptyState
            icon="🛒"
            title={(search || hasDateFilter) ? 'Không có đơn hàng nào khớp' : 'Chưa có đơn hàng'}
            sub={(search || hasDateFilter) ? 'Thử từ khóa hoặc khoảng ngày khác.' : 'Đơn hàng do khách hàng đặt qua Cổng khách hàng sẽ xuất hiện ở đây.'}
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
                    <td style={{ padding:"12px 16px", fontWeight:600 }}>{cust?.CustomerName||o.CustomerName||o.CustomerID}</td>
                    <td style={{ padding:"12px 16px" }}>
                      <span style={{ background:"#FEF2F2", color:"#DA251D", border:"1px solid #FECACA", padding:"3px 10px", borderRadius:6, fontSize:11 }}>
                        {prod?.ProductName||o.ProductID||"—"}{o.Quantity > 1 ? ` × ${o.Quantity}` : ""}
                      </span>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <StatusBadge status={o.Status} />
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      {isOrgView ? (
                        <span style={{ color:"var(--muted-2)", fontSize:12 }}>Chỉ xem</span>
                      ) : (o.Status === "Pending" || !o.Status) ? (
                        <div style={{ display:"flex", gap:6 }}>
                          <button onClick={()=>updateStatus(o.OrderID,"Accepted")} style={{ background:"#DCFCE7", border:"1px solid #BBF7D0", color:"#166534", cursor:"pointer", borderRadius:8, fontSize:12, padding:"5px 10px", fontFamily:"var(--font-body)" }}>✓ Chấp nhận</button>
                          <button onClick={()=>updateStatus(o.OrderID,"Rejected")} className="btn-danger" style={{ padding:"5px 10px", fontSize:12 }}>✗ Từ chối</button>
                        </div>
                      ) : (
                        <div style={{ display:"flex", gap:8 }}>
                          <button className="btn-ghost" onClick={()=>{setForm({...o});setModal("edit");}} style={{ padding:"5px 12px", fontSize:12 }}>Sửa</button>
                          <button className="btn-danger" onClick={()=>setDelTarget({id:o.OrderID,name:`${o.OrderID} (${cust?.CustomerName||o.CustomerName||o.CustomerID})`})} style={{ padding:"5px 12px", fontSize:12 }}>Xóa</button>
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
              <div style={{ padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", fontSize: 13, color: "var(--muted)" }}>
                {STATUS_VI[form.Status] || form.Status || "Chờ duyệt"} <span style={{ fontSize: 11, color: '#B45309', marginLeft: 6 }}>(Duyệt qua danh sách)</span>
              </div>
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

// ══ PURCHASE ORDERS (V2) ══════════════════════════════════════════════════════
const PurchaseOrders = () => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({});
  const [receiptTarget, setReceiptTarget] = useState(null);
  const [receiptForm, setReceiptForm] = useState({ WarehouseID: "", Notes: "", Lines: {} });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/purchase-orders'), apiFetch('/products'), apiFetch('/suppliers'), apiFetch('/warehouses')])
      .then(([po, p, s, w]) => { setData(po); setProducts(p); setSuppliers(s); setWarehouses(w); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được đơn mua hàng.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    const firstProduct = products[0];
    setForm({
      SupplierID: suppliers[0]?.SupplierID || '',
      ProductID: firstProduct?.ProductID || '',
      Quantity: 1,
      UnitPrice: Number(firstProduct?.UnitPrice) || 0,
      OrderDate: new Date().toISOString().slice(0, 10),
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.SupplierID || !form.ProductID) { showToast('Chọn nhà cung cấp và sản phẩm.', 'error'); return; }
    const quantity = parseInt(form.Quantity, 10);
    const unitPrice = Number(form.UnitPrice);
    if (!quantity || quantity < 1) { showToast('Số lượng phải lớn hơn 0.', 'error'); return; }
    if (Number.isNaN(unitPrice) || unitPrice < 0) { showToast('Đơn giá không hợp lệ.', 'error'); return; }
    try {
      await apiPost('/purchase-orders', { ...form, Quantity: quantity, UnitPrice: unitPrice });
      showToast('Đã tạo đơn mua hàng.');
      setModal(false); load();
    } catch (e) { showToast(e.message || 'Tạo đơn mua hàng thất bại.', 'error'); }
  };

  const sendToSupplier = async (po) => {
    if (!window.confirm(`Gửi đơn ${po.POID} tới nhà cung cấp ${po.SupplierName}?`)) return;
    try {
      await apiPatch(`/purchase-orders/${po.POID}/status`, { Status: "Sent" });
      showToast(`Đã gửi ${po.POID} tới nhà cung cấp.`);
      load();
    } catch (e) { showToast(e.message || 'Gửi đơn mua thất bại.', 'error'); }
  };

  const openReceipt = (po) => {
    const lines = {};
    (po.Items || []).forEach(it => {
      const remaining = Number(it.Quantity) - Number(it.ReceivedQuantity || 0);
      if (remaining > 0) lines[it.ProductID] = remaining;
    });
    setReceiptTarget(po);
    setReceiptForm({ WarehouseID: po.WarehouseID || warehouses[0]?.WarehouseID || "", Notes: "", Lines: lines });
  };

  const submitReceipt = async () => {
    const items = Object.entries(receiptForm.Lines)
      .filter(([, q]) => String(q) !== "" && Number(q) > 0)
      .map(([ProductID, QuantityReceived]) => ({ ProductID, QuantityReceived: parseInt(QuantityReceived, 10) }));
    if (items.length === 0) { showToast('Nhập số lượng nhận cho ít nhất một dòng.', 'error'); return; }
    if (items.some(it => Number.isNaN(it.QuantityReceived) || it.QuantityReceived < 1)) {
      showToast('Số lượng nhận phải là số nguyên dương.', 'error'); return;
    }
    try {
      const res = await apiPost(`/purchase-orders/${receiptTarget.POID}/receipts`, {
        WarehouseID: receiptForm.WarehouseID || undefined,
        Notes: receiptForm.Notes || undefined,
        Items: items,
      });
      showToast(`Đã tạo phiếu ${res.GRNID} · ${res.Status === "Received" ? "đã nhận đủ hàng" : "nhận một phần"}.`);
      setReceiptTarget(null); load();
    } catch (e) { showToast(e.message || 'Nhận hàng thất bại.', 'error'); }
  };

  const openCount = data.filter(po => po.Status === 'Ordered').length;
  const receivedValue = data.filter(po => po.Status === 'Received').reduce((a, po) => a + Number(po.TotalAmount || 0), 0);
  const addBtn = <button className="btn-primary" onClick={openAdd}>+ Tạo đơn mua</button>;

  return (
    <div className="fade-up">
      <PageHeader
        crumb="NHẬP HÀNG"
        title="Đơn mua hàng"
        sub={`${data.length} đơn mua · ${openCount} chờ gửi/nhập kho · Đã nhập đủ: ${fmtVnd(receivedValue)}`}
        action={addBtn}
      />
      {loading ? (
        <GlassCard style={{ padding:0, overflow:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : data.length === 0 ? (
        <GlassCard style={{ padding:0 }}>
          <EmptyState icon="📥" title="Chưa có đơn mua hàng" sub="Tạo đơn mua để nhập thêm hàng vào kho." action={openAdd} actionLabel="+ Tạo đơn mua" />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã đơn","Nhà cung cấp","Mặt hàng","Tổng SL","Đã nhận","Tổng tiền","Ngày đặt","Trạng thái","Thao tác"]} />
            <tbody>
              {data.map(po => {
                const total = Number(po.TotalQuantity ?? po.Quantity ?? 0);
                const received = Number(po.ReceivedQuantity ?? 0);
                const canReceive = ["Ordered","Sent","Partially_Received"].includes(po.Status);
                return (
                <tr key={po.POID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"12px 16px" }}><IdBadge id={po.POID} />{po.PRID && <div style={{ fontSize:10, color:"var(--muted)", marginTop:3 }}>từ {po.PRID}</div>}</td>
                  <td style={{ padding:"12px 16px", fontWeight:600 }}>{po.SupplierName}</td>
                  <td style={{ padding:"12px 16px", maxWidth:220 }}>
                    <div style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={(po.Items||[]).map(i=>`${i.ProductName} ×${i.Quantity}`).join(", ")}>
                      {(po.Items||[]).map(i=>i.ProductName).join(", ") || po.ProductName}
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{po.ItemCount ?? (po.Items||[]).length} mặt hàng</div>
                  </td>
                  <td style={{ padding:"12px 16px", textAlign:"right" }}>{total}</td>
                  <td style={{ padding:"12px 16px", textAlign:"right", color: received >= total ? "#15803D" : "var(--muted)", fontWeight: received >= total ? 700 : 400 }}>{received}/{total}</td>
                  <td style={{ padding:"12px 16px", textAlign:"right", fontWeight:700, color:"#1F2937" }}>{fmtVnd(po.TotalAmount)}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{po.OrderDate}</td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={po.Status} /></td>
                  <td style={{ padding:"12px 16px" }}>
                    <div style={{ display:"flex", gap:6 }}>
                      {po.Status === "Ordered" && (
                        <button className="btn-ghost" onClick={()=>sendToSupplier(po)} style={{ padding:"5px 10px", fontSize:12 }}>Gửi NCC</button>
                      )}
                      {canReceive && (
                        <button className="btn-primary" onClick={()=>openReceipt(po)} style={{ padding:"5px 12px", fontSize:12 }}>Nhận hàng</button>
                      )}
                      {po.Status === "Received" && (
                        <button className="btn-ghost" onClick={async () => {
                          try { await apiPatch(`/purchase-orders/${po.POID}/status`, { Status: "Completed" }); showToast(`Đã hoàn tất ${po.POID}.`); load(); }
                          catch (e) { showToast(e.message || 'Cập nhật thất bại.', 'error'); }
                        }} style={{ padding:"5px 10px", fontSize:12 }}>Hoàn tất</button>
                      )}
                      {!canReceive && po.Status !== "Ordered" && po.Status !== "Received" && (
                        <span style={{ color:"var(--muted-2)", fontSize:12 }}>—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );})}
            </tbody>
          </table>
        </GlassCard>
      )}

      {modal && (
        <Modal title="Tạo đơn mua hàng" onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gap:14 }}>
            <div><Label>NHÀ CUNG CẤP</Label>
              <GlassSelect value={form.SupplierID} onChange={e=>setForm({...form,SupplierID:e.target.value})} style={{width:"100%"}}>
                {suppliers.map(s=><option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>)}
              </GlassSelect>
            </div>
            <div><Label>SẢN PHẨM</Label>
              <GlassSelect value={form.ProductID} onChange={e=>{
                const prod = products.find(p=>p.ProductID===e.target.value);
                setForm({...form, ProductID:e.target.value, UnitPrice:Number(prod?.UnitPrice)||0});
              }} style={{width:"100%"}}>
                {products.map(p=><option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
              </GlassSelect>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><Label>SỐ LƯỢNG</Label><GlassInput type="number" min={1} value={form.Quantity||1} onChange={e=>setForm({...form,Quantity:e.target.value})} /></div>
              <div><Label>ĐƠN GIÁ (VNĐ)</Label><GlassInput type="number" min={0} value={form.UnitPrice||0} onChange={e=>setForm({...form,UnitPrice:e.target.value})} /></div>
            </div>
            <div><Label>NGÀY ĐẶT</Label><GlassInput type="date" value={form.OrderDate||""} onChange={e=>setForm({...form,OrderDate:e.target.value})} /></div>
            <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:"10px 14px", fontSize:13, color:"#475569" }}>
              Tổng tiền: <strong style={{ color:"#1F2937" }}>{fmtVnd((parseInt(form.Quantity,10)||0) * (Number(form.UnitPrice)||0))}</strong>
            </div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Lưu đơn mua</button>
              <button className="btn-ghost" onClick={()=>setModal(false)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}

      {receiptTarget && (
        <Modal title={`Nhận hàng · ${receiptTarget.POID}`} onClose={()=>setReceiptTarget(null)}>
          <div style={{ marginBottom:18 }}>
            <div style={{ background:'#F0FDF4', border:'1px solid #BBF7D0', borderRadius:10, padding:'10px 14px', fontSize:14 }}>
              <div style={{ fontWeight:600 }}>{receiptTarget.POID} · {receiptTarget.SupplierName}</div>
              <div style={{ color:"#475569", marginTop:4 }}>{receiptTarget.ItemCount ?? (receiptTarget.Items||[]).length} mặt hàng · {fmtVnd(receiptTarget.TotalAmount)}</div>
            </div>
          </div>
          <div style={{ display:"grid", gap:12 }}>
            <div><Label>KHO NHẬN</Label>
              <GlassSelect value={receiptForm.WarehouseID} onChange={e=>setReceiptForm({...receiptForm, WarehouseID:e.target.value})} style={{width:"100%"}}>
                {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseID} · {w.WarehouseName}</option>)}
              </GlassSelect>
            </div>
            <div>
              <Label>SỐ LƯỢNG NHẬN TỪNG MẶT HÀNG</Label>
              <div style={{ display:"grid", gap:8 }}>
                {(receiptTarget.Items||[]).map(it => {
                  const remaining = Number(it.Quantity) - Number(it.ReceivedQuantity||0);
                  return (
                    <div key={it.ProductID} style={{ display:"grid", gridTemplateColumns:"1fr 110px", gap:10, alignItems:"center", background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:"8px 12px" }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:13 }}>{it.ProductName}</div>
                        <div style={{ fontSize:11, color:"var(--muted)" }}>Đặt {it.Quantity} · đã nhận {it.ReceivedQuantity||0} · còn {Math.max(remaining,0)}</div>
                      </div>
                      <GlassInput type="number" min={0} max={Math.max(remaining,0)} disabled={remaining<=0}
                        value={receiptForm.Lines[it.ProductID] ?? ""}
                        onChange={e=>setReceiptForm({...receiptForm, Lines:{...receiptForm.Lines, [it.ProductID]: e.target.value}})} />
                    </div>
                  );
                })}
                {(receiptTarget.Items||[]).every(it => Number(it.Quantity) <= Number(it.ReceivedQuantity||0)) && (
                  <div style={{ fontSize:13, color:"var(--muted)" }}>Đơn này đã nhận đủ hàng.</div>
                )}
              </div>
            </div>
            <div><Label>GHI CHÚ</Label><GlassInput value={receiptForm.Notes} onChange={e=>setReceiptForm({...receiptForm, Notes:e.target.value})} placeholder="Ví dụ: nhận đợt 1, hàng đủ điều kiện..." /></div>
            <div style={{ display:'flex', gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={submitReceipt}>Tạo phiếu nhập kho</button>
              <button className="btn-ghost" onClick={()=>setReceiptTarget(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ PURCHASE REQUISITIONS (V3) ════════════════════════════════════════════════
const PurchaseRequisitions = () => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ Lines: [{ ProductID:"", Quantity:1 }], Reason:"", WarehouseID:"" });
  const [poTarget, setPoTarget] = useState(null);
  const [poForm, setPoForm] = useState({ SupplierID:"", OrderDate:"", WarehouseID:"" });

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/purchase-requisitions'), apiFetch('/products'), apiFetch('/suppliers'), apiFetch('/warehouses')])
      .then(([pr, p, s, w]) => { setData(pr); setProducts(p); setSuppliers(s); setWarehouses(w); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được yêu cầu mua hàng.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setForm({ Lines: [{ ProductID: products[0]?.ProductID || "", Quantity: 1 }], Reason: "", WarehouseID: warehouses[0]?.WarehouseID || "" });
    setModal(true);
  };

  const setLine = (idx, patch) => {
    setForm(f => ({ ...f, Lines: f.Lines.map((l, i) => i === idx ? { ...l, ...patch } : l) }));
  };
  const addLine = () => setForm(f => ({ ...f, Lines: [...f.Lines, { ProductID: products[0]?.ProductID || "", Quantity: 1 }] }));
  const removeLine = (idx) => setForm(f => ({ ...f, Lines: f.Lines.filter((_, i) => i !== idx) }));

  const save = async () => {
    const items = form.Lines.map(l => ({ ProductID: l.ProductID, Quantity: parseInt(l.Quantity, 10) }));
    if (items.some(it => !it.ProductID)) { showToast('Chọn sản phẩm cho mọi dòng hàng.', 'error'); return; }
    if (items.some(it => Number.isNaN(it.Quantity) || it.Quantity < 1)) { showToast('Số lượng phải là số nguyên dương.', 'error'); return; }
    const ids = items.map(it => it.ProductID);
    if (new Set(ids).size !== ids.length) { showToast('Mỗi sản phẩm chỉ được xuất hiện một lần.', 'error'); return; }
    try {
      const res = await apiPost('/purchase-requisitions', {
        Items: items,
        Reason: form.Reason || undefined,
        WarehouseID: form.WarehouseID || undefined,
      });
      showToast(`Đã tạo yêu cầu ${res.PRID} · ${res.ItemCount} mặt hàng.`);
      setModal(false); load();
    } catch (e) { showToast(e.message || 'Tạo yêu cầu mua hàng thất bại.', 'error'); }
  };

  const decide = async (pr, status) => {
    try {
      await apiPatch(`/purchase-requisitions/${pr.PRID}/status`, { Status: status });
      showToast(`${status === "Approved" ? "Đã duyệt" : "Đã từ chối"} yêu cầu ${pr.PRID}.`);
      load();
    } catch (e) { showToast(e.message || 'Cập nhật trạng thái thất bại.', 'error'); }
  };

  const openCreatePO = (pr) => {
    setPoTarget(pr);
    setPoForm({
      SupplierID: suppliers[0]?.SupplierID || "",
      OrderDate: new Date().toISOString().slice(0, 10),
      WarehouseID: pr.WarehouseID || warehouses[0]?.WarehouseID || "",
    });
  };

  const createPO = async () => {
    if (!poForm.SupplierID) { showToast('Chọn nhà cung cấp.', 'error'); return; }
    try {
      const res = await apiPost('/purchase-orders', {
        PRID: poTarget.PRID,
        SupplierID: poForm.SupplierID,
        OrderDate: poForm.OrderDate,
        WarehouseID: poForm.WarehouseID || undefined,
      });
      showToast(`Đã tạo đơn mua ${res.POID} từ ${poTarget.PRID}.`);
      setPoTarget(null); load();
    } catch (e) { showToast(e.message || 'Tạo đơn mua thất bại.', 'error'); }
  };

  const pendingCount = data.filter(pr => pr.Status === "Pending_Approval").length;
  const addBtn = <button className="btn-primary" onClick={openAdd}>+ Yêu cầu mua</button>;

  return (
    <div className="fade-up">
      <PageHeader
        crumb="MUA HÀNG"
        title="Yêu cầu mua hàng"
        sub={`${data.length} yêu cầu${pendingCount > 0 ? ` · ${pendingCount} chờ duyệt` : ""}`}
        action={addBtn}
      />
      {loading ? (
        <GlassCard style={{ padding:0, overflow:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : data.length === 0 ? (
        <GlassCard style={{ padding:0 }}>
          <EmptyState icon="🧾" title="Chưa có yêu cầu mua hàng" sub="Tạo yêu cầu, duyệt và chuyển thành đơn mua." action={openAdd} actionLabel="+ Yêu cầu mua" />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã yêu cầu","Mặt hàng","Tổng SL","Người yêu cầu","Ngày tạo","Trạng thái","Thao tác"]} />
            <tbody>
              {data.map(pr => (
                <tr key={pr.PRID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"12px 16px" }}><IdBadge id={pr.PRID} />{pr.Reason && <div style={{ fontSize:10, color:"var(--muted)", marginTop:3, maxWidth:160, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={pr.Reason}>{pr.Reason}</div>}</td>
                  <td style={{ padding:"12px 16px", fontWeight:600, maxWidth:260 }}>
                    <div style={{ whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={(pr.Items||[]).map(i=>`${i.ProductName} ×${i.Quantity}`).join(", ")}>
                      {(pr.Items||[]).map(i=>i.ProductName).join(", ") || pr.ProductName}
                    </div>
                    <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{pr.ItemCount ?? (pr.Items||[]).length} mặt hàng</div>
                  </td>
                  <td style={{ padding:"12px 16px", textAlign:"right" }}>{(pr.Items||[]).reduce((a,i)=>a+Number(i.Quantity||0),0) || pr.Quantity}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{pr.RequestedBy}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{String(pr.CreatedAt).slice(0, 10)}</td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={pr.Status} /></td>
                  <td style={{ padding:"12px 16px" }}>
                    {pr.Status === "Pending_Approval" ? (
                      <div style={{ display:"flex", gap:8 }}>
                        <button className="btn-primary" onClick={()=>decide(pr, "Approved")} style={{ padding:"5px 12px", fontSize:12 }}>Duyệt</button>
                        <button className="btn-danger" onClick={()=>decide(pr, "Rejected")} style={{ padding:"5px 12px", fontSize:12 }}>Từ chối</button>
                      </div>
                    ) : pr.Status === "Approved" ? (
                      <button className="btn-teal" onClick={()=>openCreatePO(pr)} style={{ padding:"5px 12px", fontSize:12 }}>Tạo đơn mua</button>
                    ) : (
                      <span style={{ color:"var(--muted-2)", fontSize:12 }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {modal && (
        <Modal title="Tạo yêu cầu mua hàng" onClose={()=>setModal(false)}>
          <div style={{ display:"grid", gap:14 }}>
            <div>
              <Label>DÒNG HÀNG</Label>
              <div style={{ display:"grid", gap:8 }}>
                {form.Lines.map((line, idx) => (
                  <div key={idx} style={{ display:"grid", gridTemplateColumns:"1fr 90px 34px", gap:8, alignItems:"center" }}>
                    <GlassSelect value={line.ProductID} onChange={e=>setLine(idx,{ProductID:e.target.value})} style={{width:"100%"}}>
                      {products.map(p=><option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
                    </GlassSelect>
                    <GlassInput type="number" min={1} value={line.Quantity} onChange={e=>setLine(idx,{Quantity:e.target.value})} />
                    <button className="btn-ghost" onClick={()=>removeLine(idx)} disabled={form.Lines.length<=1} title="Xóa dòng" style={{ padding:"6px 0", fontSize:13 }}>✕</button>
                  </div>
                ))}
              </div>
              <button className="btn-ghost" onClick={addLine} style={{ marginTop:8, padding:"6px 12px", fontSize:12 }}>+ Thêm dòng</button>
            </div>
            <div><Label>KHO ĐÍCH</Label>
              <GlassSelect value={form.WarehouseID} onChange={e=>setForm({...form,WarehouseID:e.target.value})} style={{width:"100%"}}>
                <option value="">— Không chỉ định —</option>
                {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseID} · {w.WarehouseName}</option>)}
              </GlassSelect>
            </div>
            <div><Label>LÝ DO</Label><GlassInput value={form.Reason} onChange={e=>setForm({...form,Reason:e.target.value})} placeholder="Ví dụ: bổ sung tồn kho tháng 11..." maxLength={255} /></div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={save}>Gửi yêu cầu</button>
              <button className="btn-ghost" onClick={()=>setModal(false)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}

      {poTarget && (
        <Modal title={`Tạo đơn mua từ ${poTarget.PRID}`} onClose={()=>setPoTarget(null)}>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ background:"#F8FAFC", border:"1px solid #E2E8F0", borderRadius:10, padding:"10px 14px", fontSize:13 }}>
              <div style={{ fontWeight:600, marginBottom:6 }}>{(poTarget.Items||[]).length} dòng hàng sẽ chuyển vào đơn mua</div>
              {(poTarget.Items||[]).map(it => (
                <div key={it.ProductID} style={{ display:"flex", justifyContent:"space-between", color:"#475569", padding:"2px 0" }}>
                  <span>{it.ProductName}</span>
                  <span>×{it.Quantity} {it.Unit || ""} · {fmtVnd(it.UnitPrice)}</span>
                </div>
              ))}
            </div>
            <div><Label>NHÀ CUNG CẤP</Label>
              <GlassSelect value={poForm.SupplierID} onChange={e=>setPoForm({...poForm,SupplierID:e.target.value})} style={{width:"100%"}}>
                {suppliers.map(s=><option key={s.SupplierID} value={s.SupplierID}>{s.SupplierName}</option>)}
              </GlassSelect>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><Label>NGÀY ĐẶT</Label><GlassInput type="date" value={poForm.OrderDate||""} onChange={e=>setPoForm({...poForm,OrderDate:e.target.value})} /></div>
              <div><Label>KHO NHẬN</Label>
                <GlassSelect value={poForm.WarehouseID} onChange={e=>setPoForm({...poForm,WarehouseID:e.target.value})} style={{width:"100%"}}>
                  <option value="">— Không chỉ định —</option>
                  {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseID} · {w.WarehouseName}</option>)}
                </GlassSelect>
              </div>
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Đơn giá lấy theo giá sản phẩm hiện hành; có thể chỉnh sau khi tạo đơn.</div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={createPO}>Tạo đơn mua</button>
              <button className="btn-ghost" onClick={()=>setPoTarget(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ RETURNS (V3) ══════════════════════════════════════════════════════════════
const Returns = ({ role }) => {
  const isOrgView = ORG_ROLE_IDS.includes(role);
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [receiveTarget, setReceiveTarget] = useState(null);
  const [receiveWarehouse, setReceiveWarehouse] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/returns'), apiFetch('/warehouses')])
      .then(([d, w]) => { setData(d); setWarehouses(w); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được yêu cầu trả hàng.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const decide = async (r, status) => {
    if (status === "Approved" && !window.confirm(`Duyệt trả hàng ${r.ReturnID}? Chỉ ghi nhận hoàn tiền — hàng chưa cộng kho cho tới khi nhận hàng trả.`)) return;
    try {
      const res = await apiPatch(`/returns/${r.ReturnID}/status`, { Status: status });
      showToast(status === "Approved" ? `Đã duyệt ${r.ReturnID} · Hoàn tiền ${fmtVnd(res.RefundAmount)}.` : `Đã từ chối ${r.ReturnID}.`);
      load();
    } catch (e) { showToast(e.message || 'Xử lý yêu cầu trả hàng thất bại.', 'error'); }
  };

  const openReceive = (r) => {
    setReceiveTarget(r);
    setReceiveWarehouse(warehouses[0]?.WarehouseID || "");
  };

  const submitReceive = async () => {
    try {
      const res = await apiPost(`/returns/${receiveTarget.ReturnID}/receive`, {
        WarehouseID: receiveWarehouse || undefined,
      });
      showToast(`Đã nhập kho ${receiveTarget.ReturnID} tại ${res.WarehouseID}${res.NewQuantity !== undefined ? ` · tồn mới ${res.NewQuantity}` : ""}.`);
      setReceiveTarget(null); load();
    } catch (e) { showToast(e.message || 'Nhận hàng trả thất bại.', 'error'); }
  };

  const pendingCount = data.filter(r => r.Status === "Pending").length;

  return (
    <div className="fade-up">
      <PageHeader
        crumb="TRẢ HÀNG"
        title="Yêu cầu trả hàng"
        sub={`${data.length} yêu cầu${pendingCount > 0 ? ` · ${pendingCount} chờ xử lý` : ""}`}
      />
      {loading ? (
        <GlassCard style={{ padding:0, overflow:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : data.length === 0 ? (
        <GlassCard style={{ padding:0 }}>
          <EmptyState icon="↩" title="Chưa có yêu cầu trả hàng" sub="Khách hàng có thể gửi yêu cầu trả hàng từ Cổng khách hàng." />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã trả","Đơn gốc","Khách hàng","Sản phẩm","SL","Lý do","Hoàn tiền","Trạng thái","Thao tác"]} />
            <tbody>
              {data.map(r => (
                <tr key={r.ReturnID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"12px 16px" }}><IdBadge id={r.ReturnID} /></td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{r.OriginalOrderID}</td>
                  <td style={{ padding:"12px 16px", fontWeight:600 }}>{r.CustomerName || r.CustomerID}</td>
                  <td style={{ padding:"12px 16px" }}>{r.ProductName}</td>
                  <td style={{ padding:"12px 16px", textAlign:"right" }}>{r.Quantity} {r.Unit || ""}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)", maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }} title={r.Reason}>{r.Reason}</td>
                  <td style={{ padding:"12px 16px", textAlign:"right", fontWeight:600 }}>
                    {["Approved","Received"].includes(r.Status) ? fmtVnd(r.RefundAmount) : "—"}
                    {r.RefundStatus && r.Status === "Approved" && <div style={{ fontSize:10, color:"#B45309", fontWeight:400 }}>hoàn tiền: chờ chi</div>}
                    {r.RefundStatus === "Completed" && <div style={{ fontSize:10, color:"#15803D", fontWeight:400 }}>đã hoàn tiền</div>}
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    <StatusBadge status={r.Status} />
                    {r.Status === "Received" && <div style={{ fontSize:10, color:"var(--muted)", marginTop:3 }}>đã nhập kho {String(r.ReceivedAt||"").slice(0,10)}</div>}
                  </td>
                  <td style={{ padding:"12px 16px" }}>
                    {isOrgView ? (
                      <span style={{ color:"var(--muted-2)", fontSize:12 }}>Chỉ xem</span>
                    ) : (
                      <>
                        {r.Status === "Pending" && (
                          <div style={{ display:"flex", gap:8 }}>
                            <button className="btn-primary" onClick={()=>decide(r, "Approved")} style={{ padding:"5px 12px", fontSize:12 }}>Duyệt</button>
                            <button className="btn-danger" onClick={()=>decide(r, "Rejected")} style={{ padding:"5px 12px", fontSize:12 }}>Từ chối</button>
                          </div>
                        )}
                        {r.Status === "Approved" && (
                          <button className="btn-teal" onClick={()=>openReceive(r)} style={{ padding:"5px 12px", fontSize:12 }}>Nhận hàng trả</button>
                        )}
                        {["Rejected","Received"].includes(r.Status) && (
                          <span style={{ color:"var(--muted-2)", fontSize:12 }}>{r.Status === "Received" ? "Hoàn tất" : "—"}</span>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {receiveTarget && (
        <Modal title={`Nhận hàng trả · ${receiveTarget.ReturnID}`} onClose={()=>setReceiveTarget(null)}>
          <div style={{ display:"grid", gap:14 }}>
            <div style={{ background:"#F0FDF4", border:"1px solid #BBF7D0", borderRadius:10, padding:"10px 14px", fontSize:13 }}>
              <div style={{ fontWeight:600 }}>{receiveTarget.ProductName} × {receiveTarget.Quantity} {receiveTarget.Unit || ""}</div>
              <div style={{ color:"#475569", marginTop:4 }}>Từ đơn {receiveTarget.OriginalOrderID} · {receiveTarget.CustomerName || receiveTarget.CustomerID}</div>
              <div style={{ color:"#475569", marginTop:2 }}>Hoàn tiền ghi nhận: {fmtVnd(receiveTarget.RefundAmount)}</div>
            </div>
            <div><Label>KHO NHẬN HÀNG TRẢ</Label>
              <GlassSelect value={receiveWarehouse} onChange={e=>setReceiveWarehouse(e.target.value)} style={{width:"100%"}}>
                {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseID} · {w.WarehouseName}</option>)}
              </GlassSelect>
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Xác nhận sẽ cộng lại tồn kho và ghi sổ kho (CustomerReturn).</div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={submitReceive}>Xác nhận nhập kho</button>
              <button className="btn-ghost" onClick={()=>setReceiveTarget(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ STOCKTAKE (V3) ════════════════════════════════════════════════════════════
const Stocktake = () => {
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [warehouseID, setWarehouseID] = useState("");
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/stocktake-sessions'), apiFetch('/warehouses')])
      .then(([s, w]) => { setData(s); setWarehouses(w); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được phiên kiểm kê.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setWarehouseID(warehouses[0]?.WarehouseID || ""); setCreateOpen(true); };

  const createSession = async () => {
    if (!warehouseID) { showToast('Chọn kho cần kiểm kê.', 'error'); return; }
    try {
      const res = await apiPost('/stocktake-sessions', { WarehouseID: warehouseID });
      showToast(`Đã tạo phiên ${res.SessionID} với ${res.ItemCount} sản phẩm.`);
      setCreateOpen(false); load(); openDetail(res.SessionID);
    } catch (e) { showToast(e.message || 'Tạo phiên kiểm kê thất bại.', 'error'); }
  };

  const openDetail = async (sid) => {
    setDetailLoading(true);
    try {
      const s = await apiFetch(`/stocktake-sessions/${sid}`);
      setDetail(s);
    } catch (e) { showToast(e.message || 'Không tải được chi tiết kiểm kê.', 'error'); }
    setDetailLoading(false);
  };

  const setActual = (productId, value) => {
    setDetail(d => ({ ...d, items: d.items.map(it => it.ProductID === productId ? { ...it, ActualQuantity: value } : it) }));
  };

  const saveItems = async () => {
    const entries = (detail.items || [])
      .filter(it => it.ActualQuantity !== "" && it.ActualQuantity != null)
      .map(it => ({ ProductID: it.ProductID, ActualQuantity: parseInt(it.ActualQuantity, 10) }));
    if (entries.length === 0) { showToast('Nhập ít nhất một số lượng thực tế.', 'error'); return; }
    if (entries.some(e => Number.isNaN(e.ActualQuantity) || e.ActualQuantity < 0)) {
      showToast('Số lượng thực tế phải là số nguyên không âm.', 'error'); return;
    }
    setSaving(true);
    try {
      const res = await apiPatch(`/stocktake-sessions/${detail.SessionID}/items`, { Items: entries });
      showToast(`Đã lưu ${res.Updated} dòng kiểm kê.`);
      await openDetail(detail.SessionID);
      load();
    } catch (e) { showToast(e.message || 'Lưu kiểm kê thất bại.', 'error'); }
    setSaving(false);
  };

  const complete = async () => {
    if (!window.confirm(`Hoàn tất phiên ${detail.SessionID}? Tồn kho sẽ được cập nhật theo số lượng thực tế.`)) return;
    setSaving(true);
    try {
      const res = await apiPatch(`/stocktake-sessions/${detail.SessionID}/complete`);
      showToast(`Đã hoàn tất ${detail.SessionID} · ${res.AdjustedCount} sản phẩm được điều chỉnh.`);
      setDetail(null); load();
    } catch (e) { showToast(e.message || 'Hoàn tất kiểm kê thất bại.', 'error'); }
    setSaving(false);
  };

  const addBtn = <button className="btn-primary" onClick={openCreate}>+ Phiên kiểm kê</button>;

  return (
    <div className="fade-up">
      <PageHeader crumb="KIỂM KÊ" title="Phiên kiểm kê" sub={`${data.length} phiên kiểm kê`} action={addBtn} />
      {loading ? (
        <GlassCard style={{ padding:0, overflow:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : data.length === 0 ? (
        <GlassCard style={{ padding:0 }}>
          <EmptyState icon="🧮" title="Chưa có phiên kiểm kê" sub="Tạo phiên kiểm kê để đối chiếu tồn kho thực tế." action={openCreate} actionLabel="+ Phiên kiểm kê" />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã phiên","Kho","Số sản phẩm","Người tạo","Ngày tạo","Trạng thái","Thao tác"]} />
            <tbody>
              {data.map(s => (
                <tr key={s.SessionID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"12px 16px" }}><IdBadge id={s.SessionID} /></td>
                  <td style={{ padding:"12px 16px", fontWeight:600 }}>{s.WarehouseName}</td>
                  <td style={{ padding:"12px 16px", textAlign:"right" }}>{s.ItemCount}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{s.CreatedBy}</td>
                  <td style={{ padding:"12px 16px", color:"var(--muted)" }}>{String(s.CreatedAt).slice(0, 10)}</td>
                  <td style={{ padding:"12px 16px" }}><StatusBadge status={s.Status} /></td>
                  <td style={{ padding:"12px 16px" }}>
                    <button className="btn-ghost" onClick={()=>openDetail(s.SessionID)} style={{ padding:"5px 12px", fontSize:12 }}>
                      {s.Status === "Completed" ? "Xem" : "Kiểm kê"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      )}

      {createOpen && (
        <Modal title="Tạo phiên kiểm kê" onClose={()=>setCreateOpen(false)}>
          <div style={{ display:"grid", gap:14 }}>
            <div><Label>KHO HÀNG</Label>
              <GlassSelect value={warehouseID} onChange={e=>setWarehouseID(e.target.value)} style={{width:"100%"}}>
                {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseName}</option>)}
              </GlassSelect>
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>Hệ thống sẽ tự thêm toàn bộ sản phẩm đang có trong kho vào phiên kiểm kê.</div>
            <div style={{ display:"flex", gap:10, marginTop:4 }}>
              <button className="btn-primary" onClick={createSession}>Tạo phiên</button>
              <button className="btn-ghost" onClick={()=>setCreateOpen(false)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}

      {detailLoading && !detail && <Spinner />}
      {detail && (
        <Modal title={`Kiểm kê ${detail.SessionID} · ${detail.WarehouseName}`} onClose={()=>setDetail(null)} wide>
          <div style={{ marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
            <StatusBadge status={detail.Status} />
            <span style={{ fontSize:12, color:"var(--muted)" }}>{detail.items.length} sản phẩm</span>
          </div>
          <div style={{ maxHeight:"50vh", overflowY:"auto", border:"1px solid #E5E7EB", borderRadius:10 }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
              <thead style={{ position:"sticky", top:0 }}>
                <tr style={{ background:"#F9FAFB" }}>
                  {["Sản phẩm","Tồn hệ thống","Thực tế","Chênh lệch"].map(h=><th key={h} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, color:"#6B7280", fontWeight:600, letterSpacing:0.5 }}>{h.toUpperCase()}</th>)}
                </tr>
              </thead>
              <tbody>
                {(detail.items || []).map(it => {
                  const diff = it.ActualQuantity === "" || it.ActualQuantity == null ? null : Number(it.ActualQuantity) - Number(it.SystemQuantity);
                  const done = detail.Status === "Completed";
                  return (
                    <tr key={it.ProductID} style={{ borderTop:"1px solid #F3F4F6" }}>
                      <td style={{ padding:"10px 14px", fontWeight:600 }}>{it.ProductName}</td>
                      <td style={{ padding:"10px 14px" }}>{it.SystemQuantity} {it.Unit || ""}</td>
                      <td style={{ padding:"10px 14px" }}>
                        {done ? (it.ActualQuantity ?? "—") : (
                          <input
                            type="number" min="0" step="1"
                            value={it.ActualQuantity ?? ""}
                            onChange={e=>setActual(it.ProductID, e.target.value)}
                            className="glass-input"
                            style={{ width:100, padding:"6px 10px", fontSize:13 }}
                          />
                        )}
                      </td>
                      <td style={{ padding:"10px 14px", fontWeight:600, color: diff == null ? "#6B7280" : diff === 0 ? "#166534" : diff > 0 ? "#1D4ED8" : "#B91C1C" }}>
                        {diff == null ? "—" : diff > 0 ? `+${diff}` : diff}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            {detail.Status !== "Completed" && (
              <>
                <button className="btn-primary" onClick={saveItems} disabled={saving}>{saving ? "Đang lưu..." : "Lưu số thực tế"}</button>
                <button className="btn-teal" onClick={complete} disabled={saving}>Hoàn tất kiểm kê</button>
              </>
            )}
            <button className="btn-ghost" onClick={()=>setDetail(null)}>Đóng</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ ORG DASHBOARD ═════════════════════════════════════════════════════════════
const OrgDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/dashboard/org')
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được tổng quan tổ chức.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState icon="🏢" title="Không có dữ liệu tổ chức" sub="Liên hệ quản trị viên để được gán vào tổ chức." />;

  const org = data.organization || {};
  const T = data.totals || {};

  return (
    <div className="fade-up">
      <PageHeader
        crumb="TỔ CHỨC"
        title={org.OrganizationName || "Tổng quan tổ chức"}
        sub={`${org.OrganizationID || ""} · ${org.OrganizationType || ""} · MST ${org.TaxCode || "—"} · ${T.MemberCount || 0} thành viên`}
        action={<button className="btn-ghost" onClick={load}>↻ Làm mới</button>}
      />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:16 }}>
        <StatCard label="Đơn đang xử lý" value={T.ActiveOrders || 0} sub="Pending / Accepted / Processing" gradient="#0EA5E9,#22D3EE" icon="🛒" />
        <StatCard label="Tổng chi tiêu" value={fmtVnd(T.TotalSpend || 0)} sub={`${T.TotalOrders || 0} đơn hợp lệ`} gradient="#10B981,#34D399" icon="💰" />
        <StatCard label="Yêu cầu mua chờ duyệt" value={T.PendingRequests || 0} sub={`${T.ApprovedRequests || 0} đã duyệt`} gradient="#F59E0B,#FBBF24" icon="🧾" />
        <StatCard label="Trả hàng chờ xử lý" value={T.PendingReturns || 0} sub="đang chờ duyệt" gradient="#8B5CF6,#A78BFA" icon="↩" />
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #E5E7EB", fontWeight:600 }}>🧾 Yêu cầu mua gần đây</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã","Ngày","Giá trị","Trạng thái"]} />
            <tbody>
              {(data.recentRequests || []).map(r => (
                <tr key={r.CPRID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"10px 16px" }}><IdBadge id={r.CPRID} /></td>
                  <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{String(r.RequestDate).slice(0,10)}</td>
                  <td style={{ padding:"10px 16px", textAlign:"right" }}>{fmtVnd(r.TotalEstimated)}</td>
                  <td style={{ padding:"10px 16px" }}><StatusBadge status={r.Status} /></td>
                </tr>
              ))}
              {(data.recentRequests || []).length === 0 && <tr><td colSpan={4} style={{ padding:16, color:"var(--muted)", textAlign:"center" }}>Chưa có yêu cầu.</td></tr>}
            </tbody>
          </table>
        </GlassCard>

        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <div style={{ padding:"14px 18px", borderBottom:"1px solid #E5E7EB", fontWeight:600 }}>🛒 Đơn hàng gần đây</div>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Mã","Ngày","Số tiền","Trạng thái"]} />
            <tbody>
              {(data.recentOrders || []).map(o => (
                <tr key={o.OrderID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                  <td style={{ padding:"10px 16px" }}><IdBadge id={o.OrderID} /></td>
                  <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{String(o.OrderDate).slice(0,10)}</td>
                  <td style={{ padding:"10px 16px", textAlign:"right" }}>{fmtVnd(o.Bill)}</td>
                  <td style={{ padding:"10px 16px" }}><StatusBadge status={o.Status} /></td>
                </tr>
              ))}
              {(data.recentOrders || []).length === 0 && <tr><td colSpan={4} style={{ padding:16, color:"var(--muted)", textAlign:"center" }}>Chưa có đơn hàng.</td></tr>}
            </tbody>
          </table>
        </GlassCard>
      </div>

      <GlassCard style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", borderBottom:"1px solid #E5E7EB", fontWeight:600 }}>↩ Trả hàng gần đây</div>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <TableHeader cols={["Mã trả","Đơn gốc","Sản phẩm","SL","Hoàn tiền","Trạng thái"]} />
          <tbody>
            {(data.recentReturns || []).map(r => (
              <tr key={r.ReturnID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                <td style={{ padding:"10px 16px" }}><IdBadge id={r.ReturnID} /></td>
                <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{r.OriginalOrderID}</td>
                <td style={{ padding:"10px 16px" }}>{r.ProductID}</td>
                <td style={{ padding:"10px 16px", textAlign:"right" }}>{r.Quantity}</td>
                <td style={{ padding:"10px 16px", textAlign:"right" }}>{r.Status === "Rejected" ? "—" : fmtVnd(r.RefundAmount)}</td>
                <td style={{ padding:"10px 16px" }}><StatusBadge status={r.Status} /></td>
              </tr>
            ))}
            {(data.recentReturns || []).length === 0 && <tr><td colSpan={6} style={{ padding:16, color:"var(--muted)", textAlign:"center" }}>Chưa có yêu cầu trả hàng.</td></tr>}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
};

// ══ INVENTORY LEDGER ══════════════════════════════════════════════════════════
const Ledger = () => {
  const [data, setData] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ product_id: "", warehouse_id: "", transaction_type: "" });

  const load = useCallback(() => {
    setLoading(true);
    const qs = Object.entries(filters).filter(([,v]) => v).map(([k,v]) => `${k}=${encodeURIComponent(v)}`).join("&");
    Promise.all([
      apiFetch(`/inventory/transactions?limit=300${qs ? "&" + qs : ""}`),
      apiFetch('/products'),
      apiFetch('/warehouses'),
    ]).then(([t, p, w]) => { setData(t); setProducts(p); setWarehouses(w); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được sổ kho.', 'error'); setLoading(false); });
  }, [filters]);
  useEffect(() => { load(); }, [load]);

  const inbound = data.filter(t => Number(t.QuantityChange) > 0).reduce((a,t) => a + Number(t.QuantityChange), 0);
  const outbound = data.filter(t => Number(t.QuantityChange) < 0).reduce((a,t) => a + Math.abs(Number(t.QuantityChange)), 0);

  return (
    <div className="fade-up">
      <PageHeader
        crumb="SỔ KHO"
        title="Sổ giao dịch kho"
        sub={`${data.length} giao dịch gần nhất · Nhập +${inbound.toLocaleString('vi-VN')} · Xuất −${outbound.toLocaleString('vi-VN')}`}
        action={<button className="btn-ghost" onClick={load}>↻ Làm mới</button>}
      />
      <GlassCard style={{ marginBottom:16, padding:16 }}>
        <div style={{ display:"flex", gap:12, alignItems:"flex-end", flexWrap:"wrap" }}>
          <div style={{ flex:"1 1 200px" }}>
            <Label>SẢN PHẨM</Label>
            <GlassSelect value={filters.product_id} onChange={e=>setFilters({...filters, product_id:e.target.value})} style={{width:"100%"}}>
              <option value="">— Tất cả sản phẩm —</option>
              {products.map(p=><option key={p.ProductID} value={p.ProductID}>{p.ProductName}</option>)}
            </GlassSelect>
          </div>
          <div style={{ flex:"1 1 180px" }}>
            <Label>KHO</Label>
            <GlassSelect value={filters.warehouse_id} onChange={e=>setFilters({...filters, warehouse_id:e.target.value})} style={{width:"100%"}}>
              <option value="">— Tất cả kho —</option>
              {warehouses.map(w=><option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseName}</option>)}
            </GlassSelect>
          </div>
          <div style={{ flex:"1 1 180px" }}>
            <Label>LOẠI GIAO DỊCH</Label>
            <GlassSelect value={filters.transaction_type} onChange={e=>setFilters({...filters, transaction_type:e.target.value})} style={{width:"100%"}}>
              <option value="">— Tất cả loại —</option>
              {Object.keys(TXN_VI).map(k=><option key={k} value={k}>{TXN_VI[k]}</option>)}
            </GlassSelect>
          </div>
          {(filters.product_id || filters.warehouse_id || filters.transaction_type) && (
            <button className="btn-ghost" onClick={()=>setFilters({product_id:"",warehouse_id:"",transaction_type:""})} style={{ padding:"10px 16px", fontSize:13 }}>Xóa lọc</button>
          )}
        </div>
      </GlassCard>

      {loading ? (
        <GlassCard style={{ padding:0, overflow:'hidden' }}><table style={{ width:'100%', borderCollapse:'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : data.length === 0 ? (
        <GlassCard style={{ padding:0 }}><EmptyState icon="📚" title="Chưa có giao dịch kho" sub="Giao dịch phát sinh khi nhập hàng, bán hàng, trả hàng, kiểm kê." /></GlassCard>
      ) : (
        <GlassCard style={{ padding:0, overflow:"hidden" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <TableHeader cols={["Thời gian","Loại","Sản phẩm","Kho","Thay đổi","Trước → Sau","Tham chiếu","Người thực hiện"]} />
            <tbody>
              {data.map(t => {
                const change = Number(t.QuantityChange);
                return (
                  <tr key={t.TransactionID} className="trow" style={{ borderBottom:"1px solid #F3F4F6" }}>
                    <td style={{ padding:"10px 16px", color:"var(--muted)", whiteSpace:"nowrap" }}>{String(t.CreatedAt || "").replace("T"," ").slice(0,16)}</td>
                    <td style={{ padding:"10px 16px" }}>{TXN_VI[t.TransactionType] || t.TransactionType}</td>
                    <td style={{ padding:"10px 16px", fontWeight:600 }}>{t.ProductName || t.ProductID}</td>
                    <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{t.WarehouseName || t.WarehouseID}</td>
                    <td style={{ padding:"10px 16px", textAlign:"right", fontWeight:700, color: change >= 0 ? "#15803D" : "#B91C1C" }}>{change >= 0 ? `+${change}` : change}</td>
                    <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{t.QuantityBefore} → {t.QuantityAfter}</td>
                    <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{t.ReferenceID || "—"}</td>
                    <td style={{ padding:"10px 16px", color:"var(--muted)" }}>{t.PerformedBy || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </GlassCard>
      )}
    </div>
  );
};

// ══ ORGANIZATIONS (ADMIN) ═════════════════════════════════════════════════════
const ORG_BLANK = {
  OrganizationCode: "", OrganizationName: "", TaxCode: "", OrganizationType: "OrganizationCustomer",
  Address: "", Representative: "", RepresentativePhone: "", RepresentativeEmail: "",
  Status: "Active", CustomerID: "",
};
const OrganizationForm = ({ form, setForm, customers, isEdit }) => (
  <div style={{ display: "grid", gap: 14 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div><Label>TÊN DOANH NGHIỆP *</Label><GlassInput value={form.OrganizationName || ""} onChange={e=>setForm({ ...form, OrganizationName: e.target.value })} /></div>
      <div><Label>MÃ TỔ CHỨC</Label><GlassInput value={form.OrganizationCode || ""} onChange={e=>setForm({ ...form, OrganizationCode: e.target.value })} placeholder="Để trống để tự sinh" /></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div><Label>MÃ SỐ THUẾ</Label><GlassInput value={form.TaxCode || ""} onChange={e=>setForm({ ...form, TaxCode: e.target.value })} /></div>
      <div><Label>LOẠI TỔ CHỨC</Label>
        <GlassSelect value={form.OrganizationType || "OrganizationCustomer"} onChange={e=>setForm({ ...form, OrganizationType: e.target.value })} style={{ width: "100%" }}>
          <option value="OrganizationCustomer">Khách hàng doanh nghiệp</option>
          <option value="Supplier">Nhà cung cấp</option>
          <option value="Central">Doanh nghiệp trung tâm</option>
        </GlassSelect>
      </div>
    </div>
    <div><Label>ĐỊA CHỈ</Label><GlassInput value={form.Address || ""} onChange={e=>setForm({ ...form, Address: e.target.value })} /></div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      <div><Label>NGƯỜI ĐẠI DIỆN</Label><GlassInput value={form.Representative || ""} onChange={e=>setForm({ ...form, Representative: e.target.value })} /></div>
      <div><Label>ĐIỆN THOẠI</Label><GlassInput value={form.RepresentativePhone || ""} onChange={e=>setForm({ ...form, RepresentativePhone: e.target.value })} /></div>
      <div><Label>EMAIL</Label><GlassInput value={form.RepresentativeEmail || ""} onChange={e=>setForm({ ...form, RepresentativeEmail: e.target.value })} /></div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div><Label>TRẠNG THÁI</Label>
        <GlassSelect value={form.Status || "Active"} onChange={e=>setForm({ ...form, Status: e.target.value })} style={{ width: "100%" }}>
          <option value="Active">Hoạt động</option>
          <option value="Inactive">Ngừng hoạt động</option>
        </GlassSelect>
      </div>
      {!isEdit && (
        <div><Label>LIÊN KẾT HỒ SƠ KHÁCH HÀNG</Label>
          <GlassSelect value={form.CustomerID || ""} onChange={e=>setForm({ ...form, CustomerID: e.target.value })} style={{ width: "100%" }}>
            <option value="">— Chưa liên kết —</option>
            {customers.filter(c => !c.OrganizationID || c.CustomerID === form.CustomerID)
              .map(c => <option key={c.CustomerID} value={c.CustomerID}>{c.CustomerID} · {c.CustomerName}</option>)}
          </GlassSelect>
        </div>
      )}
    </div>
  </div>
);

const Organizations = () => {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(ORG_BLANK);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/organizations'), apiFetch('/customers')])
      .then(([o, c]) => { setData(o); setCustomers(c); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được danh sách tổ chức.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const openAdd = () => { setForm(ORG_BLANK); setModal("add"); };
  const openEdit = (row) => {
    setForm({ OrganizationCode: row.OrganizationCode || "", OrganizationName: row.OrganizationName || "",
      TaxCode: row.TaxCode || "", OrganizationType: row.OrganizationType || "OrganizationCustomer",
      Address: row.Address || "", Representative: row.Representative || "",
      RepresentativePhone: row.RepresentativePhone || "", RepresentativeEmail: row.RepresentativeEmail || "",
      Status: row.Status || "Active", CustomerID: row.CustomerID || "", OrganizationID: row.OrganizationID });
    setModal("edit");
  };

  const save = async () => {
    if (!String(form.OrganizationName || "").trim()) { showToast('Nhập tên doanh nghiệp.', 'error'); return; }
    const payload = { ...form };
    delete payload.OrganizationID;
    if (modal === "edit") delete payload.CustomerID;
    Object.keys(payload).forEach(k => { if (payload[k] === "") delete payload[k]; });
    try {
      if (modal === "add") await apiPost('/organizations', payload);
      else await apiPut(`/organizations/${form.OrganizationID}`, payload);
      showToast(modal === "add" ? 'Đã tạo tổ chức.' : 'Đã cập nhật tổ chức.');
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu tổ chức thất bại.', 'error'); }
  };

  const keyword = search.trim().toLowerCase();
  const filtered = data.filter(o => !keyword ||
    String(o.OrganizationName || "").toLowerCase().includes(keyword) ||
    String(o.OrganizationID || "").toLowerCase().includes(keyword) ||
    String(o.TaxCode || "").toLowerCase().includes(keyword));

  return (
    <div className="fade-up">
      <PageHeader crumb="TỔ CHỨC" title="Tổ chức khách hàng" sub={`${data.length} pháp nhân kinh doanh`}
        action={<button className="btn-primary" onClick={openAdd}>+ Thêm tổ chức</button>} />
      <GlassCard style={{ marginBottom: 16, padding: 16 }}>
        <GlassInput placeholder="🔍  Tìm theo tên, mã tổ chức hoặc MST..." value={search} onChange={e=>setSearch(e.target.value)} />
      </GlassCard>
      {loading ? (
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: 0 }}>
          <EmptyState icon="🏢" title={search ? 'Không có tổ chức nào khớp' : 'Chưa có tổ chức khách hàng'}
            sub={search ? 'Thử từ khóa khác.' : 'Tạo pháp nhân khách hàng để bắt đầu nhận yêu cầu mua.'}
            action={search ? null : openAdd} actionLabel="+ Thêm tổ chức" />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Mã","Doanh nghiệp","MST","Loại","Liên hệ","Thành viên","CPR","Trạng thái","Thao tác"]} />
              <tbody>
                {filtered.map(o => (
                  <tr key={o.OrganizationID} className="trow" style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><IdBadge id={o.OrganizationID} /></td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{o.OrganizationName}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{o.TaxCode || "—"}</td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{o.OrganizationType === "Supplier" ? "Nhà cung cấp" : o.OrganizationType === "Central" ? "Trung tâm" : "Khách hàng"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{o.Representative || "—"}{o.RepresentativePhone ? ` · ${o.RepresentativePhone}` : ""}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>{o.MemberCount || 0}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>{o.CPRCount || 0}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={o.Status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <button className="btn-ghost" onClick={()=>openEdit(o)} style={{ fontSize: 12, padding: "5px 12px" }}>Sửa</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
      {modal && (
        <Modal title={modal === "add" ? "Thêm tổ chức khách hàng" : `Sửa tổ chức · ${form.OrganizationID}`} onClose={()=>setModal(null)}>
          <OrganizationForm form={form} setForm={setForm} customers={customers} isEdit={modal === "edit"} />
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button className="btn-primary" onClick={save}>Lưu tổ chức</button>
            <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ CUSTOMER PURCHASE REQUESTS (ADMIN REVIEW → SALES ORDER) ═══════════════════
const CustomerRequests = () => {
  const [data, setData] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [prOpen, setPrOpen] = useState(false);
  const [prWarehouse, setPrWarehouse] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/customer-purchase-requests'), apiFetch('/warehouses')])
      .then(([d, w]) => { setData(d); setWarehouses(w); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được yêu cầu mua của khách hàng.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDetail = async (row) => {
    try {
      const [full] = await Promise.all([apiFetch(`/customer-purchase-requests/${row.CPRID}`)]);
      setDetail(full);
      setPrWarehouse(warehouses[0]?.WarehouseID || "");
    } catch (e) { showToast(e.message || 'Không tải được chi tiết yêu cầu.', 'error'); }
  };

  const decide = async (row, next, reason) => {
    setBusy(true);
    try {
      await apiPatch(`/customer-purchase-requests/${row.CPRID}/status`, { Status: next, ...(reason ? { RejectReason: reason } : {}) });
      showToast(next === 'Approved' ? `Đã duyệt ${row.CPRID}.` : `Đã từ chối ${row.CPRID}.`);
      setDetail(d => (d && d.CPRID === row.CPRID ? { ...d, Status: next } : d));
      load();
    } catch (e) { showToast(e.message || 'Cập nhật yêu cầu thất bại.', 'error'); }
    setBusy(false);
  };

  const convert = async (row) => {
    if (!window.confirm(`Chuyển ${row.CPRID} thành đơn bán (Sales Order)? Hệ thống kiểm tra tồn kho khi duyệt đơn.`)) return;
    setBusy(true);
    try {
      const res = await apiPost(`/customer-purchase-requests/${row.CPRID}/convert`);
      showToast(`Đã tạo ${res.OrderIDs?.length || 0} đơn bán từ ${row.CPRID}.`);
      setDetail(null); load();
    } catch (e) { showToast(e.message || 'Chuyển yêu cầu thất bại.', 'error'); }
    setBusy(false);
  };

  const createReplenishPR = async () => {
    if (!detail) return;
    const items = (detail.Items || []).map(i => ({ ProductID: i.ProductID, Quantity: Number(i.Quantity) }));
    if (items.length === 0) { showToast('Yêu cầu không có dòng hàng.', 'error'); return; }
    setBusy(true);
    try {
      const res = await apiPost('/purchase-requisitions', {
        Items: items,
        Reason: `Bổ sung tồn kho cho ${detail.CPRID} (${detail.OrganizationName || detail.OrganizationID})`,
        WarehouseID: prWarehouse || undefined,
      });
      showToast(`Đã tạo yêu cầu mua nội bộ ${res.PRID} để bổ sung tồn kho.`);
      setPrOpen(false);
    } catch (e) { showToast(e.message || 'Tạo yêu cầu mua nội bộ thất bại.', 'error'); }
    setBusy(false);
  };

  const keyword = search.trim().toLowerCase();
  const filtered = data.filter(r =>
    (!status || r.Status === status) &&
    (!keyword || [r.CPRID, r.OrganizationName, r.RequestedByName].some(v => String(v || "").toLowerCase().includes(keyword)))
  );
  const pending = data.filter(r => r.Status === "Submitted").length;
  const cols = ["Mã CPR","Ngày","Doanh nghiệp","Người tạo","Dòng hàng","Giá trị dự kiến","Trạng thái","Thao tác"];

  return (
    <div className="fade-up">
      <PageHeader crumb="BÁN HÀNG" title="Yêu cầu mua của khách hàng"
        sub={`${data.length} yêu cầu · ${pending} chờ xử lý`}
        action={<button className="btn-ghost" onClick={load}>↻ Làm mới</button>} />
      <GlassCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 260px" }}>
            <GlassInput placeholder="🔍  Tìm mã yêu cầu, doanh nghiệp, người tạo..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ flex: "0 0 200px" }}>
            <GlassSelect value={status} onChange={e=>setStatus(e.target.value)} style={{ width: "100%" }}>
              <option value="">— Tất cả trạng thái —</option>
              {["Submitted","Approved","Rejected","Converted","Cancelled"].map(s => <option key={s} value={s}>{STATUS_VI[s] || s}</option>)}
            </GlassSelect>
          </div>
        </div>
      </GlassCard>
      {loading ? (
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: 0 }}>
          <EmptyState icon="🧾" title="Chưa có yêu cầu mua" sub="Yêu cầu do khách hàng doanh nghiệp gửi từ cổng B2B sẽ xuất hiện tại đây." />
        </GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={cols} />
              <tbody>
                {filtered.map(r => (
                  <tr key={r.CPRID} className="trow" style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><IdBadge id={r.CPRID} /></td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{String(r.CreatedAt || "").slice(0, 10)}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{r.OrganizationName}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{r.RequestedByName || "—"}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>{r.ItemCount || 0}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVnd(r.TotalEstimated)}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={r.Status} /></td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <button className="btn-ghost" onClick={()=>openDetail(r)} style={{ fontSize: 12, padding: "5px 12px" }}>Xem</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
      {detail && (
        <Modal title={`Yêu cầu mua · ${detail.CPRID}`} onClose={()=>setDetail(null)} wide>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{detail.OrganizationName}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Mã KH: {detail.CustomerID} · {detail.CustomerName || ""}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Người tạo: {detail.RequestedByName}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Ngày tạo: {String(detail.CreatedAt || "").slice(0, 16).replace("T", " ")}</div>
            </div>
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span>Trạng thái</span><StatusBadge status={detail.Status} /></div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>Giá trị dự kiến: <b style={{ color: "#1F2937" }}>{fmtVnd(detail.TotalEstimated)}</b></div>
              {detail.Note && <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Ghi chú: {detail.Note}</div>}
              {detail.RejectReason && <div style={{ fontSize: 12, color: "#B91C1C", marginTop: 4 }}>Lý do từ chối: {detail.RejectReason}</div>}
            </div>
          </div>
          <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: 10, marginBottom: 16 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Dòng","Mã hàng","Sản phẩm","ĐVT","Số lượng","Đơn giá","Thành tiền"]} />
              <tbody>
                {(detail.Items || []).map(i => (
                  <tr key={i.LineNo} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 16px", color: "var(--muted)" }}>{i.LineNo}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}><IdBadge id={i.ProductID} /></td>
                    <td style={{ padding: "10px 16px", fontWeight: 600 }}>{i.ProductName}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>{i.Unit || unitVi(i)}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>{i.Quantity}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>{fmtVnd(i.UnitPrice)}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVnd(Number(i.UnitPrice) * Number(i.Quantity))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!prOpen ? (
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {detail.Status === "Submitted" && (
                <>
                  <button className="btn-primary" disabled={busy} onClick={()=>decide(detail, "Approved")}>Duyệt yêu cầu</button>
                  <button className="btn-danger" disabled={busy} onClick={()=>{ const reason = window.prompt("Lý do từ chối:"); if (reason && reason.trim()) decide(detail, "Rejected", reason.trim()); }}>Từ chối</button>
                </>
              )}
              {detail.Status === "Approved" && (
                <button className="btn-primary" disabled={busy} onClick={()=>convert(detail)}>Chuyển thành đơn bán</button>
              )}
              {detail.Status === "Submitted" && (
                <button className="btn-ghost" onClick={()=>setPrOpen(true)}>Tạo yêu cầu mua nội bộ</button>
              )}
              {detail.Status === "Converted" && <span style={{ fontSize: 13, color: "var(--muted)" }}>Đã chuyển thành đơn bán: {(detail.ConvertedOrders || []).map(o => o.OrderID).join(", ") || "—"}</span>}
            </div>
          ) : (
            <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 10, padding: 16 }}>
              <div style={{ fontSize: 13, marginBottom: 10 }}>Tạo phiếu yêu cầu mua (PR) để bổ sung đúng các mặt hàng còn thiếu của yêu cầu này.</div>
              <div style={{ marginBottom: 12 }}><Label>KHO NHẬN HÀNG</Label>
                <GlassSelect value={prWarehouse} onChange={e=>setPrWarehouse(e.target.value)} style={{ width: "100%" }}>
                  {warehouses.map(w => <option key={w.WarehouseID} value={w.WarehouseID}>{w.WarehouseID} · {w.WarehouseName}</option>)}
                </GlassSelect>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-primary" disabled={busy} onClick={createReplenishPR}>Tạo PR</button>
                <button className="btn-ghost" onClick={()=>setPrOpen(false)}>Hủy</button>
              </div>
            </div>
          )}
          <div style={{ marginTop: 16 }}><button className="btn-ghost" onClick={()=>setDetail(null)}>Đóng</button></div>
        </Modal>
      )}
    </div>
  );
};

// ══ ORGANIZATION PROFILE (B2B PORTAL) ══════════════════════════════════════════
const OrgProfile = ({ role }) => {
  const canEdit = role === "org_manager";
  const [org, setOrg] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/organizations/me'), apiFetch('/organizations/members')])
      .then(([o, m]) => {
        setOrg(o); setMembers(m);
        setForm({ Address: o.Address || "", Representative: o.Representative || "",
          RepresentativePhone: o.RepresentativePhone || "", RepresentativeEmail: o.RepresentativeEmail || "" });
        setLoading(false);
      })
      .catch(e => { showToast(e.message || 'Không tải được hồ sơ doanh nghiệp.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      await apiPut(`/organizations/${org.OrganizationID}`, form);
      showToast('Đã cập nhật hồ sơ doanh nghiệp.');
      setEditing(false); load();
    } catch (e) { showToast(e.message || 'Cập nhật hồ sơ thất bại.', 'error'); }
    setSaving(false);
  };

  if (loading) return <Spinner />;
  if (!org) return <EmptyState icon="🏢" title="Không có hồ sơ doanh nghiệp" sub="Liên hệ quản trị viên để được gán vào tổ chức." />;

  return (
    <div className="fade-up">
      <PageHeader crumb="HỒ SƠ DOANH NGHIỆP" title={org.OrganizationName}
        sub={`${org.OrganizationID} · ${org.OrganizationCode || ""} · MST ${org.TaxCode || "—"} · Mã KH ${org.CustomerID || "—"}`}
        action={canEdit ? <button className="btn-primary" onClick={()=>setEditing(true)}>Sửa hồ sơ</button> : null} />
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginBottom: 16 }}>
        <GlassCard style={{ padding: 22 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Thông tin pháp lý</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <ProfileRow label="TÊN DOANH NGHIỆP" value={org.OrganizationName} />
            <ProfileRow label="MÃ SỐ THUẾ" value={org.TaxCode} />
            <ProfileRow label="MÃ TỔ CHỨC" value={org.OrganizationCode || org.OrganizationID} />
            <ProfileRow label="MÃ KHÁCH HÀNG" value={org.CustomerID} />
            <ProfileRow label="NGƯỜI ĐẠI DIỆN" value={org.Representative} />
            <ProfileRow label="ĐIỆN THOẠI" value={org.RepresentativePhone} />
            <ProfileRow label="EMAIL" value={org.RepresentativeEmail} />
            <ProfileRow label="TRẠNG THÁI" value={org.Status === "Inactive" ? "Ngừng hoạt động" : "Hoạt động"} />
            <div style={{ gridColumn: "1 / -1" }}><ProfileRow label="ĐỊA CHỈ" value={org.Address} /></div>
          </div>
        </GlassCard>
        <GlassCard style={{ padding: 22 }}>
          <div style={{ fontWeight: 600, marginBottom: 16 }}>Thành viên ({members.length})</div>
          {members.map(m => (
            <div key={m.Username} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{m.FullName || m.Username}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{m.Position || ROLE_VI[m.Role] || m.Role} · {m.Username}</div>
              </div>
              <StatusBadge status={m.Status === "Inactive" ? "Inactive" : "Active"} />
            </div>
          ))}
          {members.length === 0 && <div style={{ fontSize: 13, color: "var(--muted)" }}>Chưa có thành viên.</div>}
        </GlassCard>
      </div>
      {editing && (
        <Modal title="Sửa hồ sơ doanh nghiệp" onClose={()=>setEditing(false)}>
          <div style={{ display: "grid", gap: 14 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Chỉ các trường liên hệ được sửa. Tên doanh nghiệp và mã số thuế do quản trị viên hệ thống quản lý.</div>
            <div><Label>ĐỊA CHỈ</Label><GlassInput value={form.Address || ""} onChange={e=>setForm({ ...form, Address: e.target.value })} /></div>
            <div><Label>NGƯỜI ĐẠI DIỆN</Label><GlassInput value={form.Representative || ""} onChange={e=>setForm({ ...form, Representative: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>ĐIỆN THOẠI</Label><GlassInput value={form.RepresentativePhone || ""} onChange={e=>setForm({ ...form, RepresentativePhone: e.target.value })} /></div>
              <div><Label>EMAIL</Label><GlassInput value={form.RepresentativeEmail || ""} onChange={e=>setForm({ ...form, RepresentativeEmail: e.target.value })} /></div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu thay đổi"}</button>
              <button className="btn-ghost" onClick={()=>setEditing(false)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ ORGANIZATION MEMBERS (B2B PORTAL · MANAGER) ════════════════════════════════
const OrgMembers = ({ role }) => {
  const canManage = role === "org_manager";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/organizations/members')
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được danh sách thành viên.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      if (modal === "add") {
        await apiPost('/organizations/members', form);
        showToast('Đã thêm thành viên vào tổ chức.');
      } else {
        const payload = { FullName: form.FullName, Position: form.Position, Email: form.Email, Status: form.Status };
        if (form.Password) payload.Password = form.Password;
        await apiPut(`/organizations/members/${form.Username}`, payload);
        showToast('Đã cập nhật thành viên.');
      }
      setModal(null); load();
    } catch (e) { showToast(e.message || 'Lưu thành viên thất bại.', 'error'); }
    setSaving(false);
  };

  return (
    <div className="fade-up">
      <PageHeader crumb="THÀNH VIÊN" title="Quản lý thành viên doanh nghiệp"
        sub={`${data.length} tài khoản thuộc tổ chức`}
        action={canManage ? <button className="btn-primary" onClick={()=>{ setForm({ Username: "", Password: "", FullName: "", Position: "", Email: "" }); setModal("add"); }}>+ Thêm thành viên</button> : null} />
      {loading ? (
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : data.length === 0 ? (
        <GlassCard style={{ padding: 0 }}><EmptyState icon="👥" title="Chưa có thành viên" sub="Thêm tài khoản nhân viên mua hàng cho doanh nghiệp." /></GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Tên đăng nhập","Họ tên","Chức vụ","Vai trò","Email","Trạng thái","Thao tác"]} />
              <tbody>
                {data.map(m => (
                  <tr key={m.Username} className="trow" style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><IdBadge id={m.Username} /></td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, whiteSpace: "nowrap" }}>{m.FullName || "—"}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{m.Position || "—"}</td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{ROLE_VI[m.Role] || m.Role}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{m.Email || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={m.Status === "Inactive" ? "Inactive" : "Active"} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      {canManage && m.Role !== "admin" ? (
                        <button className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}
                          onClick={()=>{ setForm({ Username: m.Username, FullName: m.FullName || "", Position: m.Position || "", Email: m.Email || "", Status: m.Status || "Active", Password: "" }); setModal("edit"); }}>Sửa</button>
                      ) : <span style={{ color: "var(--muted-2)", fontSize: 12 }}>Chỉ xem</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
      {modal && (
        <Modal title={modal === "add" ? "Thêm thành viên" : `Sửa thành viên · ${form.Username}`} onClose={()=>setModal(null)}>
          <div style={{ display: "grid", gap: 14 }}>
            {modal === "add" && (
              <div><Label>TÊN ĐĂNG NHẬP *</Label><GlassInput value={form.Username || ""} onChange={e=>setForm({ ...form, Username: e.target.value })} placeholder="vd: chi.le" /></div>
            )}
            <div><Label>HỌ TÊN *</Label><GlassInput value={form.FullName || ""} onChange={e=>setForm({ ...form, FullName: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><Label>CHỨC VỤ</Label><GlassInput value={form.Position || ""} onChange={e=>setForm({ ...form, Position: e.target.value })} /></div>
              <div><Label>EMAIL</Label><GlassInput value={form.Email || ""} onChange={e=>setForm({ ...form, Email: e.target.value })} /></div>
            </div>
            <div><Label>{modal === "add" ? "MẬT KHẨU * (tối thiểu 8 ký tự)" : "MẬT KHẨU MỚI (để trống nếu giữ nguyên)"}</Label>
              <GlassInput type="password" value={form.Password || ""} onChange={e=>setForm({ ...form, Password: e.target.value })} /></div>
            {modal === "edit" && (
              <div><Label>TRẠNG THÁI</Label>
                <GlassSelect value={form.Status || "Active"} onChange={e=>setForm({ ...form, Status: e.target.value })} style={{ width: "100%" }}>
                  <option value="Active">Hoạt động</option>
                  <option value="Inactive">Ngừng hoạt động</option>
                </GlassSelect>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn-primary" onClick={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu"}</button>
              <button className="btn-ghost" onClick={()=>setModal(null)}>Hủy</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ══ PRODUCT CATALOG (B2B PORTAL) ═══════════════════════════════════════════════
const OrgCatalog = () => {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stock, setStock] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState({});
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiFetch('/products'), apiFetch('/suppliers'), apiFetch('/inventory')])
      .then(([p, s, inv]) => {
        const byProduct = {};
        inv.forEach(i => { byProduct[i.ProductID] = (byProduct[i.ProductID] || 0) + Number(i.QuantityAvailable || 0); });
        setProducts(p); setSuppliers(s); setStock(byProduct); setLoading(false);
      })
      .catch(e => { showToast(e.message || 'Không tải được danh mục sản phẩm.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const setQty = (productId, value) => {
    const qty = Math.max(0, Math.min(99999, parseInt(value, 10) || 0));
    setCart(prev => {
      const next = { ...prev };
      if (qty > 0) next[productId] = qty; else delete next[productId];
      return next;
    });
  };

  const lines = Object.entries(cart).map(([ProductID, Quantity]) => {
    const product = products.find(p => p.ProductID === ProductID) || {};
    return { ProductID, Quantity, ProductName: product.ProductName, UnitPrice: Number(product.UnitPrice || 0) };
  });
  const total = lines.reduce((a, l) => a + l.UnitPrice * l.Quantity, 0);
  const supplierName = (id) => suppliers.find(s => s.SupplierID === id)?.SupplierName || id || "—";

  const submit = async () => {
    if (lines.length === 0) { showToast('Chọn ít nhất một sản phẩm và số lượng.', 'error'); return; }
    setSubmitting(true);
    try {
      const res = await apiPost('/customer-purchase-requests', {
        Items: lines.map(l => ({ ProductID: l.ProductID, Quantity: l.Quantity })),
        Note: note || undefined,
      });
      showToast(`Đã gửi yêu cầu ${res.CPRID} · ${res.ItemCount} dòng hàng · ${fmtVnd(res.TotalEstimated)}.`);
      setCart({}); setNote("");
    } catch (e) { showToast(e.message || 'Gửi yêu cầu mua hàng thất bại.', 'error'); }
    setSubmitting(false);
  };

  const keyword = search.trim().toLowerCase();
  const filtered = products.filter(p =>
    (!category || catVi(p.Category) === category) &&
    (!keyword || String(p.ProductName || "").toLowerCase().includes(keyword) || String(p.ProductID || "").toLowerCase().includes(keyword))
  );

  return (
    <div className="fade-up">
      <PageHeader crumb="DANH MỤC SẢN PHẨM" title="Danh mục hàng hóa B2B"
        sub={`${products.length} mặt hàng · Giá bán doanh nghiệp đã bao gồm chính sách B2B`}
        action={<button className="btn-ghost" onClick={load}>↻ Làm mới</button>} />
      <GlassCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 280px" }}>
            <GlassInput placeholder="🔍  Tìm theo mã hàng hoặc tên sản phẩm..." value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <div style={{ flex: "0 0 200px" }}>
            <GlassSelect value={category} onChange={e=>setCategory(e.target.value)} style={{ width: "100%" }}>
              <option value="">— Tất cả danh mục —</option>
              {CATS.map(c => <option key={c} value={c}>{c}</option>)}
            </GlassSelect>
          </div>
        </div>
      </GlassCard>
      {loading ? (
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: 0 }}><EmptyState icon="📦" title="Không có sản phẩm phù hợp" sub="Thử từ khóa hoặc danh mục khác." /></GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Mã hàng","Tên sản phẩm","Danh mục","ĐVT","Nhà cung cấp","Giá B2B","Tồn khả dụng","Số lượng yêu cầu"]} />
              <tbody>
                {filtered.map(p => (
                  <tr key={p.ProductID} className="trow" style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><IdBadge id={p.ProductID} /></td>
                    <td style={{ padding: "12px 16px", fontWeight: 600 }}>{p.ProductName}</td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{catVi(p.Category)}</td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>{unitVi(p)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{supplierName(p.SupplierID)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVnd(p.UnitPrice)}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>{(stock[p.ProductID] || 0).toLocaleString("vi-VN")}</td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <input className="glass-input" type="number" min="0" style={{ width: 90, padding: "6px 10px" }}
                        value={cart[p.ProductID] ?? ""} placeholder="0"
                        onChange={e=>setQty(p.ProductID, e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      <GlassCard style={{ marginTop: 16, padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
          <div style={{ fontFamily: "var(--font-head)", fontWeight: 600, fontSize: 15 }}>Danh sách yêu cầu mua ({lines.length} dòng)</div>
          <div style={{ fontSize: 14 }}>Tổng giá trị dự kiến: <b style={{ color: "#DA251D", fontSize: 17 }}>{fmtVnd(total)}</b></div>
        </div>
        {lines.length === 0 ? (
          <div style={{ fontSize: 13, color: "var(--muted)", padding: "10px 0" }}>Chưa chọn sản phẩm. Nhập số lượng ở bảng trên để thêm vào yêu cầu.</div>
        ) : (
          <div style={{ overflowX: "auto", marginBottom: 12 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Mã hàng","Sản phẩm","Số lượng","Đơn giá","Thành tiền",""]} />
              <tbody>
                {lines.map(l => (
                  <tr key={l.ProductID} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>{l.ProductID}</td>
                    <td style={{ padding: "10px 16px", fontWeight: 600 }}>{l.ProductName}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>{l.Quantity}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>{fmtVnd(l.UnitPrice)}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVnd(l.UnitPrice * l.Quantity)}</td>
                    <td style={{ padding: "10px 16px" }}><button className="btn-danger" style={{ fontSize: 11, padding: "3px 10px" }} onClick={()=>setQty(l.ProductID, 0)}>Bỏ</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
          <div><Label>GHI CHÚ CHO YÊU CẦU</Label><GlassInput value={note} onChange={e=>setNote(e.target.value)} placeholder="Thời hạn giao hàng, địa điểm nhận, yêu cầu chứng từ..." /></div>
          <div><button className="btn-primary" onClick={submit} disabled={submitting || lines.length === 0}>{submitting ? "Đang gửi..." : "Gửi yêu cầu mua hàng"}</button></div>
        </div>
      </GlassCard>
    </div>
  );
};

// ══ CUSTOMER PURCHASE REQUESTS (B2B PORTAL) ════════════════════════════════════
const OrgRequests = ({ role }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [detail, setDetail] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch('/customer-purchase-requests')
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { showToast(e.message || 'Không tải được yêu cầu mua hàng.', 'error'); setLoading(false); });
  }, []);
  useEffect(() => { load(); }, [load]);

  const openDetail = async (row) => {
    try { setDetail(await apiFetch(`/customer-purchase-requests/${row.CPRID}`)); }
    catch (e) { showToast(e.message || 'Không tải được chi tiết yêu cầu.', 'error'); }
  };

  const cancel = async (row) => {
    if (!window.confirm(`Hủy yêu cầu ${row.CPRID}?`)) return;
    setBusy(true);
    try {
      await apiPatch(`/customer-purchase-requests/${row.CPRID}/status`, { Status: "Cancelled" });
      showToast(`Đã hủy ${row.CPRID}.`);
      setDetail(null); load();
    } catch (e) { showToast(e.message || 'Hủy yêu cầu thất bại.', 'error'); }
    setBusy(false);
  };

  const filtered = data.filter(r => !status || r.Status === status);
  const value = data.filter(r => !["Rejected","Cancelled"].includes(r.Status)).reduce((a, r) => a + Number(r.TotalEstimated || 0), 0);

  return (
    <div className="fade-up">
      <PageHeader crumb="YÊU CẦU MUA HÀNG" title="Yêu cầu mua hàng của doanh nghiệp"
        sub={`${data.length} yêu cầu · Tổng giá trị dự kiến ${fmtVnd(value)}`}
        action={<button className="btn-ghost" onClick={load}>↻ Làm mới</button>} />
      <GlassCard style={{ marginBottom: 16, padding: 16 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 240px", fontSize: 13, color: "var(--muted)", alignSelf: "center" }}>
            Tạo yêu cầu mới tại mục <b>Danh mục sản phẩm</b>.
          </div>
          <div style={{ flex: "0 0 200px" }}>
            <GlassSelect value={status} onChange={e=>setStatus(e.target.value)} style={{ width: "100%" }}>
              <option value="">— Tất cả trạng thái —</option>
              {["Submitted","Approved","Rejected","Converted","Cancelled"].map(s => <option key={s} value={s}>{STATUS_VI[s] || s}</option>)}
            </GlassSelect>
          </div>
        </div>
      </GlassCard>
      {loading ? (
        <GlassCard style={{ padding: 0, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody>{[1,2,3].map(i=><SkeletonRow key={i}/>)}</tbody></table></GlassCard>
      ) : filtered.length === 0 ? (
        <GlassCard style={{ padding: 0 }}><EmptyState icon="🧾" title="Chưa có yêu cầu mua hàng" sub="Chọn sản phẩm trong danh mục và gửi yêu cầu đầu tiên." /></GlassCard>
      ) : (
        <GlassCard style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Mã yêu cầu","Ngày tạo","Người tạo","Dòng hàng","Giá trị dự kiến","Trạng thái","Thao tác"]} />
              <tbody>
                {filtered.map(r => (
                  <tr key={r.CPRID} className="trow" style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}><IdBadge id={r.CPRID} /></td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{String(r.CreatedAt || "").slice(0, 10)}</td>
                    <td style={{ padding: "12px 16px", color: "var(--muted)", whiteSpace: "nowrap" }}>{r.RequestedByName || "—"}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>{r.ItemCount || 0}</td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVnd(r.TotalEstimated)}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={r.Status} /></td>
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <button className="btn-ghost" onClick={()=>openDetail(r)} style={{ fontSize: 12, padding: "5px 12px", marginRight: 8 }}>Xem</button>
                      {role === "org_manager" && ["Draft","Submitted"].includes(r.Status) && (
                        <button className="btn-danger" onClick={()=>cancel(r)} style={{ fontSize: 12, padding: "5px 12px" }}>Hủy</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
      {detail && (
        <Modal title={`Yêu cầu mua · ${detail.CPRID}`} onClose={()=>setDetail(null)} wide>
          <div style={{ display: "flex", gap: 18, flexWrap: "wrap", marginBottom: 16, fontSize: 13 }}>
            <div><StatusBadge status={detail.Status} /></div>
            <div style={{ color: "var(--muted)" }}>Ngày tạo: {String(detail.CreatedAt || "").slice(0, 16).replace("T", " ")}</div>
            <div style={{ color: "var(--muted)" }}>Người tạo: {detail.RequestedByName || "—"}</div>
            <div>Tổng dự kiến: <b>{fmtVnd(detail.TotalEstimated)}</b></div>
          </div>
          {detail.Note && <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12 }}>Ghi chú: {detail.Note}</div>}
          {detail.RejectReason && <div style={{ fontSize: 13, color: "#B91C1C", marginBottom: 12 }}>Lý do từ chối: {detail.RejectReason}</div>}
          <div style={{ overflowX: "auto", border: "1px solid #E5E7EB", borderRadius: 10 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <TableHeader cols={["Dòng","Mã hàng","Sản phẩm","ĐVT","Số lượng","Đơn giá","Thành tiền"]} />
              <tbody>
                {(detail.Items || []).map(i => (
                  <tr key={i.LineNo} style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "10px 16px", color: "var(--muted)" }}>{i.LineNo}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}><IdBadge id={i.ProductID} /></td>
                    <td style={{ padding: "10px 16px", fontWeight: 600 }}>{i.ProductName}</td>
                    <td style={{ padding: "10px 16px", whiteSpace: "nowrap" }}>{i.Unit || unitVi(i)}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right" }}>{i.Quantity}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", whiteSpace: "nowrap" }}>{fmtVnd(i.UnitPrice)}</td>
                    <td style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVnd(Number(i.UnitPrice) * Number(i.Quantity))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
            {role === "org_manager" && ["Draft","Submitted"].includes(detail.Status) && (
              <button className="btn-danger" disabled={busy} onClick={()=>cancel(detail)}>Hủy yêu cầu</button>
            )}
            <button className="btn-ghost" onClick={()=>setDetail(null)}>Đóng</button>
          </div>
        </Modal>
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
  { id:"purchaseOrders", icon:"📥", label:"Nhập hàng" },
  { id:"procurement", icon:"🧾", label:"Mua hàng (PR/PO)" },
  { id:"cpr",       icon:"📝", label:"Yêu cầu KH (CPR)" },
  { id:"organizations", icon:"🏢", label:"Tổ chức" },
  { id:"customers", icon:"👥", label:"Khách hàng"  },
  { id:"orders",    icon:"🛒", label:"Đơn hàng"     },
  { id:"returns",   icon:"↩",  label:"Trả hàng" },
  { id:"stocktake", icon:"🧮", label:"Kiểm kê" },
  { id:"ledger",    icon:"📚", label:"Sổ kho" },
];
const NAV_ORG = [
  { id:"orgDashboard", icon:"◈", label:"Tổng quan" },
  { id:"orgProfile",   icon:"🏢", label:"Hồ sơ doanh nghiệp" },
  { id:"orgCatalog",   icon:"📦", label:"Danh mục sản phẩm" },
  { id:"orgRequests",  icon:"🧾", label:"Yêu cầu mua hàng" },
  { id:"orders",       icon:"🛒", label:"Đơn hàng doanh nghiệp" },
  { id:"returns",      icon:"↩",  label:"Yêu cầu trả hàng" },
];
const NAV_ORG_MANAGER = { id:"orgMembers", icon:"👥", label:"Quản lý thành viên" };

// Menu theo role — 1 nguồn duy nhất, dùng cho cả sidebar và guard điều hướng.
const navForRole = (role) => {
  if (isOrgRole(role)) {
    return normalizeRole(role) === "org_manager" ? [...NAV_ORG, NAV_ORG_MANAGER] : NAV_ORG;
  }
  if (isAdminRole(role)) return NAV;
  return [];
};
const PAGES = {
  dashboard:Dashboard, suppliers:Suppliers, products:Products, warehouses:Warehouses,
  inventory:Inventory, purchaseOrders:PurchaseOrders, procurement:PurchaseRequisitions,
  customers:Customers, orders:Orders, returns:Returns, stocktake:Stocktake, ledger:Ledger,
  cpr:CustomerRequests, organizations:Organizations,
  orgDashboard:OrgDashboard, orgProfile:OrgProfile, orgCatalog:OrgCatalog,
  orgRequests:OrgRequests, orgMembers:OrgMembers,
};
export default function App() {
  const initial = bootstrapAuth();
  const [screen, setScreen] = useState(initial.screen);
  const [user, setUser]         = useState(initial.user);
  const [page, setPage]     = useState(homePageFor(initial.user?.role));
  const [pendingCount, setPendingCount] = useState(0);
  const [orgContext, setOrgContext] = useState(null);

  useEffect(() => {
    if (screen === "app" && isOrgRole(user?.role)) {
      apiFetch('/organizations/me').then(setOrgContext).catch(() => setOrgContext(null));
    }
  }, [screen, user]);

  // Đối chiếu role với server (/auth/me): localStorage cũ có thể còn role "admin"
  // trong khi JWT/DB là org_manager => UI sẽ hiện nhầm sidebar Admin.
  useEffect(() => {
    if (screen !== "app") return undefined;
    let cancelled = false;
    apiFetch('/auth/me')
      .then(me => {
        if (cancelled || !me) return;
        const serverRole = normalizeRole(me.Role || me.role);
        if (!isKnownRole(serverRole)) return;
        if (serverRole === normalizeRole(user?.role)) return;
        setUser(u => ({ ...(u || {}), role: serverRole, full_name: me.FullName || u?.full_name || "" }));
        setPage(homePageFor(serverRole));
        setAuth("app", { role: serverRole });
        if (serverRole === "customer") setScreen("customer");
      })
      .catch(() => {});
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // Tự chữa localStorage: role đã cache mà lệch claim trong JWT thì ghi lại theo JWT.
  useEffect(() => {
    const cached = getAuth();
    const tokenRole = normalizeRole(decodeJwt(getToken())?.role);
    if (cached && tokenRole && normalizeRole(cached.role) !== tokenRole) {
      setAuth("app", { role: tokenRole });
    }
  }, []);

  // Guard: không cho một role đứng ở trang không thuộc menu của role đó.
  useEffect(() => {
    if (screen !== "app") return;
    const role = user?.role;
    if (!isAdminRole(role) && !isOrgRole(role)) return;
    if (!navForRole(role).some(n => n.id === page)) setPage(homePageFor(role));
  }, [screen, page, user?.role]);

  const refreshPending = useCallback(() => {
    apiFetch('/orders').then(orders => {
      setPendingCount(orders.filter(o => o.Status === "Pending").length);
    }).catch(() => setPendingCount(0));
  }, []);

  useEffect(() => {
    if (screen === "app") refreshPending();
  }, [screen, page, refreshPending]);

  // Điều hướng sau đăng nhập — tuyệt đối không mặc định về Admin.
  const handleLogin = (authUser) => {
    const role = normalizeRole(authUser?.role);
    const next = { ...(authUser || {}), role };

    if (isOrgRole(role)) {            // org_manager / org_staff -> Organization Portal
      setUser(next);
      setPage("orgDashboard");
      setScreen("app");
      return;
    }
    if (isAdminRole(role)) {          // admin -> Dashboard quản trị
      setUser(next);
      setPage("dashboard");
      setScreen("app");
      return;
    }
    if (role === "customer") {        // customer -> cổng khách hàng
      setUser(next);
      setScreen("customer");
      return;
    }
    // Token/role không hợp lệ: không cấp shell Admin.
    localStorage.removeItem("token");
    clearAuth();
    setUser(null);
    setPage("dashboard");
    setScreen("landing");
    showToast("Tài khoản chưa được gán vai trò hợp lệ.", "error");
  };

  const handleLogout = async (targetScreen = "landing") => {
    try {
      await request("/auth/logout", "POST");
    } catch {}
    localStorage.removeItem("token");
    clearAuth();
    setUser(null);
    setPage("dashboard");
    setScreen(targetScreen);
  };

  const orgView = isOrgRole(user?.role);
  const adminView = isAdminRole(user?.role);
  const navItems = navForRole(user?.role);

  if (screen === "landing") return <LandingPage onEnter={() => setScreen("login")}/>;
  if (screen === "login")   return <LoginPage onLogin={handleLogin} onCustomerPortal={() => setScreen("customer")} />;
  if (screen === "customer") return <><ToastContainer/><CustomerPortal onBack={() => handleLogout("login")} /></>;
  // Role không có menu hợp lệ thì không render shell Admin (chống lộ giao diện).
  if (!navItems.length || !(orgView || adminView)) {
    return <LandingPage onEnter={() => setScreen("login")}/>;
  }
  const activePage = navItems.some(n => n.id === page) ? page : navItems[0].id;
  const Page = PAGES[activePage] || (orgView ? OrgDashboard : Dashboard);
  const displayName = user?.full_name || user?.username || "admin";
  const displayRole = ROLE_VI[user?.role] || "Quản trị viên";
  const orgName = user?.organization?.OrganizationName || null;
  const displayOrg = orgName || (user?.organization_id ? `${user.organization_id} · ${displayName}` : "SupplyChain7VN");
  const displayEmail = `${user?.username || "admin"}@supplychain7vn.vn`;
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
            {navItems.map(n => (
              <button key={n.id} onClick={()=>setPage(n.id)} className={`nav-item ${activePage===n.id?"active":""}`}>
                <span style={{ fontSize:16 }}>{n.icon}</span>
                <span>{n.label}</span>
                {n.id === "orders" && pendingCount > 0 && (
                  <span style={{ marginLeft:"auto", background:"#DA251D", borderRadius:8, padding:"1px 7px", fontSize:11, color:"#fff" }}>{pendingCount}</span>
                )}
                {activePage===n.id && n.id !== "orders" && <span style={{ marginLeft:"auto", color:"#DA251D", fontWeight:700 }}>›</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding:"16px 18px", borderTop:"1px solid #E5E7EB", display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"#DA251D", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>👤</div>
            <div style={{ minWidth:0 }}><div style={{ fontSize:14, fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{displayName}</div><div style={{ fontSize:10, color:"var(--muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }} title={displayEmail}>{displayRole}{orgView ? ` · ${displayOrg}` : ""}</div></div>
            <button onClick={() => handleLogout("landing")} style={{ marginLeft:"auto", background:"#FFFFFF", border:"1px solid #FECACA", color:"#B91C1C", cursor:"pointer", borderRadius:8, width:30, height:30, fontSize:14, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>⏻</button>
          </div>
        </div>
        <div style={{ marginLeft:230, flex:1, padding:36, background:"#F5F7FA", maxWidth:"calc(100vw - 230px)", minHeight:"100vh" }}>
          {orgView && (
            <div className="glass" style={{ padding:"14px 20px", marginBottom:20, display:"flex", flexWrap:"wrap", gap:"14px 24px", alignItems:"center", borderLeft:"3px solid #DA251D" }}>
              <div>
                <div style={{ fontFamily:"var(--font-head)", fontSize:16, fontWeight:700 }}>{orgContext?.OrganizationName || orgName || "Doanh nghiệp"}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>
                  MST: {orgContext?.TaxCode || "—"} · Mã khách hàng doanh nghiệp: {orgContext?.CustomerID || "—"}
                </div>
              </div>
              <div style={{ borderLeft:"1px solid #E5E7EB", paddingLeft:24 }}>
                <div style={{ fontSize:13, fontWeight:600 }}>Người dùng: {displayName}</div>
                <div style={{ fontSize:12, color:"var(--muted)", marginTop:3 }}>Vai trò: {displayRole}</div>
              </div>
              <div style={{ marginLeft:"auto", fontSize:11, color:"var(--muted)", letterSpacing:1.5 }}>CỔNG GIAO DỊCH B2B</div>
            </div>
          )}
          <Page key={activePage} refreshPending={refreshPending} role={user?.role}/>
        </div>
      </div>
    </>
  );
}












