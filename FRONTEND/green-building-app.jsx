import { useState, useEffect, useCallback } from "react";

// ─── API CONFIG ───────────────────────────────────────────────
const BASE = "http://localhost:8080";

function authHeader(creds) {
  return "Basic " + btoa(`${creds.login}:${creds.password}`);
}

async function apiFetch(path, creds, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(creds),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ─── ICONS ───────────────────────────────────────────────────
const Icon = ({ name, size = 18 }) => {
  const icons = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    formations: "M12 3L1 9l11 6 9-4.91V17h2V9M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z",
    participants: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    formateurs: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    domaines: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    structures: "M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z",
    profils: "M20 6h-2.18c.07-.44.18-.87.18-1.33C18 2.54 15.96.5 13.5.5c-1.32 0-2.46.56-3.3 1.44L9 3.17l-1.2-1.24C6.96 1.06 5.82.5 4.5.5 2.04.5 0 2.54 0 4.67c0 .46.11.89.18 1.33H0v2h20V6z",
    employeurs: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 4l5 2.18V11c0 3.5-2.33 6.79-5 7.93-2.67-1.14-5-4.43-5-7.93V7.18L12 5z",
    users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    stats: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    warn: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d={icons[name] || icons.check} />
    </svg>
  );
};

// ─── TOAST ───────────────────────────────────────────────────
function Toast({ toasts, remove }) {
  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => remove(t.id)} style={{
          background: t.type === "error" ? "#dc2626" : t.type === "warn" ? "#d97706" : "#059669",
          color: "#fff", padding: "12px 18px", borderRadius: 10, cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 500,
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)", maxWidth: 340,
          animation: "slideIn 0.3s ease",
        }}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(4px)",
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "var(--card)", borderRadius: 16, padding: 32, width: "100%",
        maxWidth: 560, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
        border: "1px solid var(--border)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--text)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
            <Icon name="close" size={22} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── FORM FIELD ──────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 8, fontSize: 15,
  background: "var(--input-bg)", border: "1.5px solid var(--border)",
  color: "var(--text)", outline: "none", boxSizing: "border-box",
  fontFamily: "'DM Sans', sans-serif",
  transition: "border-color 0.2s",
};

// ─── BUTTON ──────────────────────────────────────────────────
function Btn({ children, onClick, variant = "primary", size = "md", icon, disabled, type = "button" }) {
  const styles = {
    primary: { background: "var(--accent)", color: "#fff" },
    danger: { background: "#dc2626", color: "#fff" },
    ghost: { background: "transparent", color: "var(--text)", border: "1.5px solid var(--border)" },
    secondary: { background: "var(--surface)", color: "var(--text)", border: "1.5px solid var(--border)" },
  };
  const sizes = { sm: { padding: "6px 12px", fontSize: 13 }, md: { padding: "10px 18px", fontSize: 14 }, lg: { padding: "13px 24px", fontSize: 15 } };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...styles[variant], ...sizes[size],
      borderRadius: 8, border: "none", cursor: disabled ? "not-allowed" : "pointer",
      fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
      display: "inline-flex", alignItems: "center", gap: 6,
      opacity: disabled ? 0.5 : 1, transition: "opacity 0.2s, transform 0.1s",
    }}>
      {icon && <Icon name={icon} size={size === "sm" ? 14 : 16} />}
      {children}
    </button>
  );
}

// ─── TABLE ───────────────────────────────────────────────────
function Table({ cols, rows, onEdit, onDelete }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'DM Sans', sans-serif" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid var(--border)" }}>
            {cols.map((c) => (
              <th key={c.key} style={{ textAlign: "left", padding: "12px 16px", fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {c.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th style={{ width: 100 }} />}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={cols.length + 1} style={{ textAlign: "center", padding: 40, color: "var(--muted)", fontSize: 15 }}>Aucune donnée</td></tr>
          ) : rows.map((row, i) => (
            <tr key={row.id ?? i} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.15s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              {cols.map((c) => (
                <td key={c.key} style={{ padding: "12px 16px", fontSize: 14, color: "var(--text)" }}>
                  {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                </td>
              ))}
              {(onEdit || onDelete) && (
                <td style={{ padding: "8px 16px" }}>
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {onEdit && <Btn variant="ghost" size="sm" icon="edit" onClick={() => onEdit(row)}>Éditer</Btn>}
                    {onDelete && <Btn variant="danger" size="sm" icon="delete" onClick={() => onDelete(row.id)}>Suppr.</Btn>}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── STAT CARD ───────────────────────────────────────────────
function StatCard({ label, value, icon, color }) {
  return (
    <div style={{
      background: "var(--card)", borderRadius: 14, padding: "20px 24px",
      border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 16,
    }}>
      <div style={{ width: 52, height: 52, borderRadius: 12, background: color + "22", display: "flex", alignItems: "center", justifyContent: "center", color }}>
        <Icon name={icon} size={26} />
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4, fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

// ─── BAR CHART ───────────────────────────────────────────────
function BarChart({ data, title }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div style={{ background: "var(--card)", borderRadius: 14, padding: 24, border: "1px solid var(--border)" }}>
      <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 700, color: "var(--text)" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 130, fontSize: 13, color: "var(--muted)", textAlign: "right", flexShrink: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.label}</div>
            <div style={{ flex: 1, background: "var(--surface)", borderRadius: 6, height: 22, overflow: "hidden" }}>
              <div style={{ width: `${(d.count / max) * 100}%`, height: "100%", background: "var(--accent)", borderRadius: 6, transition: "width 0.8s ease", minWidth: d.count > 0 ? 8 : 0 }} />
            </div>
            <div style={{ width: 30, fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{d.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LOGIN PAGE ───────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!login || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BASE}/api/health`, {
        headers: { Authorization: "Basic " + btoa(`${login}:${password}`) },
      });
      if (!res.ok) throw new Error("Identifiants incorrects");
      onLogin({ login, password });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg)", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: "var(--card)", borderRadius: 20, padding: "48px 40px", width: "100%",
        maxWidth: 420, boxShadow: "0 30px 80px rgba(0,0,0,0.4)", border: "1px solid var(--border)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 60, height: 60, background: "var(--accent)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff" }}>
            <Icon name="formations" size={30} />
          </div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, color: "var(--text)" }}>Green Building</h1>
          <p style={{ margin: "6px 0 0", color: "var(--muted)", fontSize: 14 }}>Gestion des formations</p>
        </div>
        {error && (
          <div style={{ background: "#dc262620", border: "1px solid #dc262640", borderRadius: 8, padding: "10px 14px", marginBottom: 20, color: "#dc2626", fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="warn" size={16} /> {error}
          </div>
        )}
        <Field label="Identifiant">
          <input style={inputStyle} value={login} onChange={(e) => setLogin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="admin" />
        </Field>
        <Field label="Mot de passe">
          <input style={inputStyle} type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()} placeholder="••••••••" />
        </Field>
        <Btn variant="primary" size="lg" onClick={handleSubmit} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 8 }}>
          {loading ? "Connexion..." : "Se connecter"}
        </Btn>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--muted)" }}>
          Défaut : admin / admin123 · responsable / responsable123
        </p>
      </div>
    </div>
  );
}

// ─── CRUD PAGE (generic) ─────────────────────────────────────
function CrudPage({ title, icon, endpoint, creds, columns, FormComponent, addToast, isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | "create" | item
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch(endpoint, creds);
      setItems(data || []);
    } catch (e) {
      addToast(e.message, "error");
    } finally { setLoading(false); }
  }, [endpoint, creds]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload, id) => {
    try {
      if (id) {
        await apiFetch(`${endpoint}/${id}`, creds, { method: "PUT", body: JSON.stringify(payload) });
        addToast("Mis à jour avec succès ✓", "success");
      } else {
        await apiFetch(endpoint, creds, { method: "POST", body: JSON.stringify(payload) });
        addToast("Créé avec succès ✓", "success");
      }
      setModal(null);
      load();
    } catch (e) { addToast(e.message, "error"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await apiFetch(`${endpoint}/${id}`, creds, { method: "DELETE" });
      addToast("Supprimé ✓", "success");
      load();
    } catch (e) { addToast(e.message, "error"); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, background: "var(--accent)22", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)" }}>
            <Icon name={icon} size={22} />
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "var(--text)" }}>{title}</h1>
          <span style={{ background: "var(--surface)", color: "var(--muted)", borderRadius: 20, padding: "3px 10px", fontSize: 13, fontWeight: 600 }}>{items.length}</span>
        </div>
        {isAdmin !== false && (
          <Btn icon="add" onClick={() => setModal("create")}>Ajouter</Btn>
        )}
      </div>
      <div style={{ background: "var(--card)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: "var(--muted)" }}>Chargement...</div>
        ) : (
          <Table cols={columns} rows={items}
            onEdit={(item) => setModal(item)}
            onDelete={isAdmin !== false ? handleDelete : null}
          />
        )}
      </div>
      {modal && (
        <Modal title={modal === "create" ? `Nouveau — ${title}` : `Modifier`} onClose={() => setModal(null)}>
          <FormComponent
            initial={modal !== "create" ? modal : null}
            onSave={handleSave}
            onCancel={() => setModal(null)}
            creds={creds}
            addToast={addToast}
          />
        </Modal>
      )}
    </div>
  );
}

// ─── FORMS ───────────────────────────────────────────────────
function SimpleLibelleForm({ initial, onSave, onCancel, maxLen = 120 }) {
  const [libelle, setLibelle] = useState(initial?.libelle || "");
  return (
    <div>
      <Field label="Libellé">
        <input style={inputStyle} value={libelle} onChange={(e) => setLibelle(e.target.value)} maxLength={maxLen} />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn onClick={() => onSave({ libelle }, initial?.id)}>Enregistrer</Btn>
      </div>
    </div>
  );
}

function EmployeurForm({ initial, onSave, onCancel }) {
  const [nom, setNom] = useState(initial?.nomEmployeur || "");
  return (
    <div>
      <Field label="Nom employeur">
        <input style={inputStyle} value={nom} onChange={(e) => setNom(e.target.value)} maxLength={150} />
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn onClick={() => onSave({ nomEmployeur: nom }, initial?.id)}>Enregistrer</Btn>
      </div>
    </div>
  );
}

function FormateurForm({ initial, onSave, onCancel, creds }) {
  const [form, setForm] = useState({
    nom: initial?.nom || "", prenom: initial?.prenom || "", email: initial?.email || "",
    tel: initial?.tel || "", type: initial?.type || "INTERNE", employeurId: initial?.employeurId || "",
  });
  const [employeurs, setEmployeurs] = useState([]);
  useEffect(() => {
    apiFetch("/api/employeurs", creds).then(setEmployeurs).catch(() => {});
  }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nom"><input style={inputStyle} value={form.nom} onChange={set("nom")} /></Field>
        <Field label="Prénom"><input style={inputStyle} value={form.prenom} onChange={set("prenom")} /></Field>
      </div>
      <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={set("email")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Téléphone"><input style={inputStyle} value={form.tel} onChange={set("tel")} /></Field>
        <Field label="Type">
          <select style={inputStyle} value={form.type} onChange={set("type")}>
            <option value="INTERNE">Interne</option>
            <option value="EXTERNE">Externe</option>
          </select>
        </Field>
      </div>
      {form.type === "EXTERNE" && (
        <Field label="Employeur">
          <select style={inputStyle} value={form.employeurId} onChange={set("employeurId")}>
            <option value="">— Sélectionner —</option>
            {employeurs.map((e) => <option key={e.id} value={e.id}>{e.nomEmployeur}</option>)}
          </select>
        </Field>
      )}
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn onClick={() => onSave({ ...form, employeurId: form.employeurId ? parseInt(form.employeurId) : null }, initial?.id)}>Enregistrer</Btn>
      </div>
    </div>
  );
}

function ParticipantForm({ initial, onSave, onCancel, creds }) {
  const [form, setForm] = useState({
    nom: initial?.nom || "", prenom: initial?.prenom || "", email: initial?.email || "",
    tel: initial?.tel || "", structureId: initial?.structureId || "", profilId: initial?.profilId || "",
  });
  const [structures, setStructures] = useState([]);
  const [profils, setProfils] = useState([]);
  useEffect(() => {
    apiFetch("/api/structures", creds).then(setStructures).catch(() => {});
    apiFetch("/api/profils", creds).then(setProfils).catch(() => {});
  }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Nom"><input style={inputStyle} value={form.nom} onChange={set("nom")} /></Field>
        <Field label="Prénom"><input style={inputStyle} value={form.prenom} onChange={set("prenom")} /></Field>
      </div>
      <Field label="Email"><input style={inputStyle} type="email" value={form.email} onChange={set("email")} /></Field>
      <Field label="Téléphone"><input style={inputStyle} value={form.tel} onChange={set("tel")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Structure">
          <select style={inputStyle} value={form.structureId} onChange={set("structureId")}>
            <option value="">— Sélectionner —</option>
            {structures.map((s) => <option key={s.id} value={s.id}>{s.libelle}</option>)}
          </select>
        </Field>
        <Field label="Profil">
          <select style={inputStyle} value={form.profilId} onChange={set("profilId")}>
            <option value="">— Sélectionner —</option>
            {profils.map((p) => <option key={p.id} value={p.id}>{p.libelle}</option>)}
          </select>
        </Field>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn onClick={() => onSave({ ...form, structureId: parseInt(form.structureId), profilId: parseInt(form.profilId) }, initial?.id)}>Enregistrer</Btn>
      </div>
    </div>
  );
}

function FormationForm({ initial, onSave, onCancel, creds }) {
  const [form, setForm] = useState({
    titre: initial?.titre || "", annee: initial?.annee || new Date().getFullYear(),
    dureeJours: initial?.dureeJours || 1, budget: initial?.budget || 0,
    lieu: initial?.lieu || "", dateFormation: initial?.dateFormation || "",
    domaineId: initial?.domaineId || "", formateurId: initial?.formateurId || "",
    participantIds: initial?.participants?.map((p) => p.id) || [],
  });
  const [domaines, setDomaines] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [participants, setParticipants] = useState([]);
  useEffect(() => {
    apiFetch("/api/domaines", creds).then(setDomaines).catch(() => {});
    apiFetch("/api/formateurs", creds).then(setFormateurs).catch(() => {});
    apiFetch("/api/participants", creds).then(setParticipants).catch(() => {});
  }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleParticipant = (id) => setForm((f) => ({
    ...f,
    participantIds: f.participantIds.includes(id)
      ? f.participantIds.filter((x) => x !== id)
      : [...f.participantIds, id],
  }));
  return (
    <div>
      <Field label="Titre"><input style={inputStyle} value={form.titre} onChange={set("titre")} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <Field label="Année"><input style={inputStyle} type="number" value={form.annee} onChange={set("annee")} /></Field>
        <Field label="Durée (jours)"><input style={inputStyle} type="number" value={form.dureeJours} onChange={set("dureeJours")} /></Field>
        <Field label="Budget (DT)"><input style={inputStyle} type="number" value={form.budget} onChange={set("budget")} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Lieu"><input style={inputStyle} value={form.lieu} onChange={set("lieu")} /></Field>
        <Field label="Date"><input style={inputStyle} type="date" value={form.dateFormation} onChange={set("dateFormation")} /></Field>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Domaine">
          <select style={inputStyle} value={form.domaineId} onChange={set("domaineId")}>
            <option value="">— Sélectionner —</option>
            {domaines.map((d) => <option key={d.id} value={d.id}>{d.libelle}</option>)}
          </select>
        </Field>
        <Field label="Formateur">
          <select style={inputStyle} value={form.formateurId} onChange={set("formateurId")}>
            <option value="">— Aucun —</option>
            {formateurs.map((f) => <option key={f.id} value={f.id}>{f.nom} {f.prenom}</option>)}
          </select>
        </Field>
      </div>
      <Field label={`Participants (${form.participantIds.length} sélectionnés)`}>
        <div style={{ maxHeight: 180, overflowY: "auto", border: "1.5px solid var(--border)", borderRadius: 8, padding: 8 }}>
          {participants.map((p) => (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 8px", cursor: "pointer", borderRadius: 6, fontSize: 14, color: "var(--text)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <input type="checkbox" checked={form.participantIds.includes(p.id)} onChange={() => toggleParticipant(p.id)} />
              {p.nom} {p.prenom}
            </label>
          ))}
        </div>
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn onClick={() => onSave({
          ...form,
          annee: parseInt(form.annee), dureeJours: parseInt(form.dureeJours),
          budget: parseFloat(form.budget), domaineId: parseInt(form.domaineId),
          formateurId: form.formateurId ? parseInt(form.formateurId) : null,
        }, initial?.id)}>Enregistrer</Btn>
      </div>
    </div>
  );
}

function UserForm({ initial, onSave, onCancel, creds }) {
  const [form, setForm] = useState({ login: initial?.login || "", password: "", roleId: initial?.roleId || "" });
  const [roles, setRoles] = useState([]);
  useEffect(() => { apiFetch("/api/roles", creds).then(setRoles).catch(() => {}); }, []);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <div>
      <Field label="Login"><input style={inputStyle} value={form.login} onChange={set("login")} /></Field>
      <Field label={initial ? "Nouveau mot de passe (laisser vide = inchangé)" : "Mot de passe"}>
        <input style={inputStyle} type="password" value={form.password} onChange={set("password")} />
      </Field>
      <Field label="Rôle">
        <select style={inputStyle} value={form.roleId} onChange={set("roleId")}>
          <option value="">— Sélectionner —</option>
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
        <Btn variant="ghost" onClick={onCancel}>Annuler</Btn>
        <Btn onClick={() => {
          const payload = { login: form.login, roleId: parseInt(form.roleId) };
          if (form.password) payload.password = form.password;
          else if (!initial) { alert("Mot de passe requis"); return; }
          else payload.password = "UNCHANGED_" + Date.now(); // placeholder
          onSave(payload, initial?.id);
        }}>Enregistrer</Btn>
      </div>
    </div>
  );
}

// ─── DASHBOARD ───────────────────────────────────────────────
function Dashboard({ creds, addToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/statistics/overview", creds)
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 60, textAlign: "center", color: "var(--muted)" }}>Chargement du tableau de bord...</div>;
  if (!stats) return (
    <div style={{ padding: 60, textAlign: "center" }}>
      <div style={{ color: "var(--muted)", fontSize: 15 }}>Statistiques disponibles pour les rôles RESPONSABLE et ADMINISTRATEUR.</div>
    </div>
  );

  const cards = [
    { label: "Formations", value: stats.totalFormations, icon: "formations", color: "#6366f1" },
    { label: "Participants", value: stats.totalParticipants, icon: "participants", color: "#10b981" },
    { label: "Formateurs", value: stats.totalFormateurs, icon: "formateurs", color: "#f59e0b" },
    { label: "Domaines", value: stats.totalDomaines, icon: "domaines", color: "#3b82f6" },
    { label: "Structures", value: stats.totalStructures, icon: "structures", color: "#8b5cf6" },
    { label: "Utilisateurs", value: stats.totalUsers, icon: "users", color: "#ec4899" },
    { label: "Employeurs", value: stats.totalEmployeurs, icon: "employeurs", color: "#14b8a6" },
    { label: "Profils", value: stats.totalProfils, icon: "profils", color: "#f97316" },
  ];

  return (
    <div>
      <h1 style={{ margin: "0 0 28px", fontSize: 26, fontWeight: 800, color: "var(--text)" }}>Tableau de bord</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        {cards.map((c) => <StatCard key={c.label} {...c} />)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 20 }}>
        <BarChart data={stats.formationsByDomain} title="Formations par domaine" />
        <BarChart data={stats.participantsByStructure} title="Participants par structure" />
        <BarChart data={stats.participantsByProfile} title="Participants par profil" />
        <BarChart data={stats.formateursByType} title="Formateurs par type" />
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [creds, setCreds] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const [role, setRole] = useState(null);

  const addToast = (msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  };

  const handleLogin = async (c) => {
    setCreds(c);
    // Detect role
    try {
      const users = await apiFetch("/api/users", c);
      setRole("ADMINISTRATEUR");
    } catch {
      try {
        await apiFetch("/api/statistics/overview", c);
        setRole("RESPONSABLE");
      } catch {
        setRole("SIMPLE_USER");
      }
    }
  };

  if (!creds) return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        :root { --bg:#0f1117; --card:#1a1d27; --surface:#22263a; --border:#2d3148; --text:#f0f2ff; --muted:#7b82a8; --accent:#6366f1; --input-bg:#22263a; }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); }
        @keyframes slideIn { from { transform: translateX(40px); opacity:0; } to { transform: translateX(0); opacity:1; } }
      `}</style>
      <LoginPage onLogin={handleLogin} />
      <Toast toasts={toasts} remove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  );

  const isAdmin = role === "ADMINISTRATEUR";
  const isAdminOrResp = role === "ADMINISTRATEUR" || role === "RESPONSABLE";

  const nav = [
    { id: "dashboard", label: "Tableau de bord", icon: "dashboard", show: isAdminOrResp },
    { id: "formations", label: "Formations", icon: "formations", show: true },
    { id: "participants", label: "Participants", icon: "participants", show: true },
    { id: "formateurs", label: "Formateurs", icon: "formateurs", show: true },
    { id: "domaines", label: "Domaines", icon: "domaines", show: true },
    { id: "structures", label: "Structures", icon: "structures", show: true },
    { id: "profils", label: "Profils", icon: "profils", show: true },
    { id: "employeurs", label: "Employeurs", icon: "employeurs", show: true },
    { id: "users", label: "Utilisateurs", icon: "users", show: isAdmin },
  ].filter((n) => n.show);

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard creds={creds} addToast={addToast} />;
      case "formations": return (
        <CrudPage title="Formations" icon="formations" endpoint="/api/formations" creds={creds} addToast={addToast}
          columns={[
            { key: "titre", label: "Titre" },
            { key: "annee", label: "Année" },
            { key: "dureeJours", label: "Durée (j)" },
            { key: "lieu", label: "Lieu" },
            { key: "dateFormation", label: "Date" },
            { key: "domaineLibelle", label: "Domaine" },
            { key: "formateurNom", label: "Formateur", render: (v, row) => v ? `${v} ${row.formateurPrenom}` : "—" },
            { key: "budget", label: "Budget", render: (v) => v ? `${v} DT` : "—" },
          ]}
          FormComponent={FormationForm}
        />
      );
      case "participants": return (
        <CrudPage title="Participants" icon="participants" endpoint="/api/participants" creds={creds} addToast={addToast}
          columns={[
            { key: "nom", label: "Nom" }, { key: "prenom", label: "Prénom" },
            { key: "email", label: "Email" }, { key: "tel", label: "Tél" },
            { key: "structureLibelle", label: "Structure" }, { key: "profilLibelle", label: "Profil" },
          ]}
          FormComponent={ParticipantForm}
        />
      );
      case "formateurs": return (
        <CrudPage title="Formateurs" icon="formateurs" endpoint="/api/formateurs" creds={creds} addToast={addToast}
          columns={[
            { key: "nom", label: "Nom" }, { key: "prenom", label: "Prénom" },
            { key: "email", label: "Email" }, { key: "tel", label: "Tél" },
            { key: "type", label: "Type", render: (v) => <span style={{ background: v === "INTERNE" ? "#10b98122" : "#f59e0b22", color: v === "INTERNE" ? "#10b981" : "#f59e0b", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{v}</span> },
            { key: "employeurNom", label: "Employeur" },
          ]}
          FormComponent={FormateurForm}
        />
      );
      case "domaines": return (
        <CrudPage title="Domaines" icon="domaines" endpoint="/api/domaines" creds={creds} addToast={addToast}
          columns={[{ key: "id", label: "ID" }, { key: "libelle", label: "Libellé" }]}
          FormComponent={(p) => <SimpleLibelleForm {...p} maxLen={120} />}
        />
      );
      case "structures": return (
        <CrudPage title="Structures" icon="structures" endpoint="/api/structures" creds={creds} addToast={addToast}
          columns={[{ key: "id", label: "ID" }, { key: "libelle", label: "Libellé" }]}
          FormComponent={(p) => <SimpleLibelleForm {...p} maxLen={150} />}
        />
      );
      case "profils": return (
        <CrudPage title="Profils" icon="profils" endpoint="/api/profils" creds={creds} addToast={addToast}
          columns={[{ key: "id", label: "ID" }, { key: "libelle", label: "Libellé" }]}
          FormComponent={(p) => <SimpleLibelleForm {...p} maxLen={120} />}
        />
      );
      case "employeurs": return (
        <CrudPage title="Employeurs" icon="employeurs" endpoint="/api/employeurs" creds={creds} addToast={addToast}
          columns={[{ key: "id", label: "ID" }, { key: "nomEmployeur", label: "Nom" }]}
          FormComponent={EmployeurForm}
        />
      );
      case "users": return (
        <CrudPage title="Utilisateurs" icon="users" endpoint="/api/users" creds={creds} addToast={addToast} isAdmin={isAdmin}
          columns={[
            { key: "id", label: "ID" }, { key: "login", label: "Login" },
            { key: "roleName", label: "Rôle", render: (v) => {
              const colors = { ADMINISTRATEUR: "#6366f1", RESPONSABLE: "#10b981", SIMPLE_USER: "#7b82a8" };
              return <span style={{ background: (colors[v] || "#7b82a8") + "22", color: colors[v] || "#7b82a8", borderRadius: 6, padding: "2px 8px", fontSize: 12, fontWeight: 700 }}>{v}</span>;
            }},
          ]}
          FormComponent={UserForm}
        />
      );
      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        :root { --bg:#0f1117; --card:#1a1d27; --surface:#22263a; --border:#2d3148; --text:#f0f2ff; --muted:#7b82a8; --accent:#6366f1; --input-bg:#22263a; }
        * { box-sizing: border-box; }
        body { margin: 0; background: var(--bg); font-family: 'DM Sans', sans-serif; }
        input:focus, select:focus { border-color: var(--accent) !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: var(--bg); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
        @keyframes slideIn { from { transform: translateX(40px); opacity:0; } to { transform: translateX(0); opacity:1; } }
      `}</style>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <aside style={{
          width: 240, background: "var(--card)", borderRight: "1px solid var(--border)",
          display: "flex", flexDirection: "column", position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100,
        }}>
          <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "var(--accent)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Icon name="formations" size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: "var(--text)" }}>Green Building</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Formations</div>
              </div>
            </div>
          </div>
          <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
            {nav.map((n) => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                background: page === n.id ? "var(--accent)" : "transparent",
                color: page === n.id ? "#fff" : "var(--muted)",
                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
                marginBottom: 2, transition: "all 0.15s", textAlign: "left",
              }}
                onMouseEnter={(e) => { if (page !== n.id) e.currentTarget.style.background = "var(--surface)"; }}
                onMouseLeave={(e) => { if (page !== n.id) e.currentTarget.style.background = "transparent"; }}>
                <Icon name={n.icon} size={18} />
                {n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 12px", borderTop: "1px solid var(--border)" }}>
            <div style={{ padding: "8px 12px", marginBottom: 8, background: "var(--surface)", borderRadius: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>{creds.login}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{role}</div>
            </div>
            <button onClick={() => { setCreds(null); setRole(null); setPage("dashboard"); }} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
              borderRadius: 8, border: "none", cursor: "pointer", background: "transparent",
              color: "var(--muted)", fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600,
            }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#dc262620"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
              <Icon name="logout" size={18} />
              Déconnexion
            </button>
          </div>
        </aside>
        {/* MAIN */}
        <main style={{ marginLeft: 240, flex: 1, padding: 36, minHeight: "100vh" }}>
          {renderPage()}
        </main>
      </div>
      <Toast toasts={toasts} remove={(id) => setToasts((t) => t.filter((x) => x.id !== id))} />
    </>
  );
}
