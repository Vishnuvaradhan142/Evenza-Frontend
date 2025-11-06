import React, { useEffect, useRef, useState, useContext } from "react";
import { FiSave, FiUploadCloud, FiDownload, FiRotateCcw, FiImage, FiSettings, FiEye } from "react-icons/fi";
import { NotificationContext } from "../../context/NotificationContext";
import "./SiteSettings.css";

const DEFAULT_SETTINGS = {
  // Branding
  siteName: "Evenza",
  tagline: "Plan. Host. Shine.",
  logo: "",
  favicon: "",
  primaryColor: "#3f3d56",
  accentColor: "#ff6f61",

  // Appearance
  themeMode: "light", // light | dark | system
  density: "comfortable", // comfortable | compact

  // Contact & SEO
  supportEmail: "support@evenza.app",
  supportPhone: "+1 555-0100",
  address: "",
  metaTitle: "Evenza — Event Management Platform",
  metaDescription: "Create, manage, and elevate your events with Evenza.",

  // Social & Analytics
  facebook: "",
  instagram: "",
  twitter: "",
  linkedin: "",
  youtube: "",
  googleAnalyticsId: "",

  // Maintenance & Security
  maintenanceMode: false,
  maintenanceMessage: "We'll be back soon!",
  allowSignup: true,
  enableCaptcha: false,

  // Locale
  defaultLanguage: "en",
  timezone: "UTC",
  dateFormat: "YYYY-MM-DD",
};

const LOCAL_KEY = "siteSettings";

const SiteSettings = () => {
  const fileInputLogo = useRef(null);
  const fileInputFavicon = useRef(null);
  const importInput = useRef(null);

  const { addNotification } = useContext(NotificationContext);

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
  }, [settings]);

  // Apply preview to CSS variables and document attributes
  const applyPreview = () => {
    const root = document.documentElement;
    root.style.setProperty("--primary-color", settings.primaryColor);
    root.style.setProperty("--accent-color", settings.accentColor);
    if (settings.themeMode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else if (settings.themeMode === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      // system: follow prefers-color-scheme
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
    addNotification?.({ type: "success", text: "Preview applied" });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleColor = (name, value) => {
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e, key) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSettings((prev) => ({ ...prev, [key]: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(settings));
    applyPreview();
    addNotification?.({ type: "success", text: "Settings saved" });
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    addNotification?.({ type: "warning", text: "Settings reset to defaults" });
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "site-settings.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => importInput.current?.click();
  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = JSON.parse(reader.result);
        // Only accept keys we know
        const next = { ...DEFAULT_SETTINGS };
        Object.keys(next).forEach((k) => {
          if (k in json) next[k] = json[k];
        });
        setSettings(next);
        addNotification?.({ type: "success", text: "Settings imported" });
      } catch (err) {
        console.error(err);
        addNotification?.({ type: "error", text: "Invalid settings file" });
      }
    };
    reader.readAsText(file);
  };

  const Section = ({ title, subtitle, children }) => (
    <section className="ss-card">
      <div className="ss-card-header">
        <h3>{title}</h3>
        {subtitle && <p className="ss-subtitle">{subtitle}</p>}
      </div>
      <div className="ss-card-body">{children}</div>
    </section>
  );

  return (
    <div className="site-settings">
      <header className="ss-header">
        <div className="ss-title">
          <FiSettings size={22} />
          <div>
            <h2>Site Settings</h2>
            <p className="ss-caption">Branding, appearance, SEO, and more</p>
          </div>
        </div>

        <div className="ss-actions">
          <button className="btn secondary" onClick={handleExport} title="Export JSON">
            <FiDownload /> Export
          </button>
          <input ref={importInput} type="file" accept="application/json" hidden onChange={handleImport} />
          <button className="btn secondary" onClick={handleImportClick} title="Import JSON">
            <FiUploadCloud /> Import
          </button>
          <button className="btn ghost" onClick={handleReset} title="Reset to defaults">
            <FiRotateCcw /> Reset
          </button>
          <button className="btn primary" onClick={handleSave} title="Save settings">
            <FiSave /> Save Changes
          </button>
          <button className="btn outline" onClick={applyPreview} title="Apply preview">
            <FiEye /> Preview
          </button>
        </div>
      </header>

      <div className="ss-grid">
        {/* Branding */}
        <Section title="Branding" subtitle="Logo, colors, and favicon">
          <div className="ss-field two-col">
            <label>Site Name</label>
            <input name="siteName" value={settings.siteName} onChange={handleChange} placeholder="Evenza" />
          </div>
          <div className="ss-field two-col">
            <label>Tagline</label>
            <input name="tagline" value={settings.tagline} onChange={handleChange} placeholder="Plan. Host. Shine." />
          </div>

          <div className="ss-media-row">
            <div className="ss-media-picker">
              <div className="ss-media-preview">
                {settings.logo ? <img src={settings.logo} alt="Logo" /> : <FiImage size={28} className="ss-placeholder" />}
              </div>
              <div className="ss-media-actions">
                <span>Logo</span>
                <div className="ss-media-buttons">
                  <button className="btn small" onClick={() => fileInputLogo.current?.click()}>Upload</button>
                  {settings.logo && (
                    <button className="btn small ghost" onClick={() => setSettings((p) => ({ ...p, logo: "" }))}>Remove</button>
                  )}
                  <input ref={fileInputLogo} hidden type="file" accept="image/*" onChange={(e) => handleFile(e, "logo")} />
                </div>
              </div>
            </div>

            <div className="ss-media-picker">
              <div className="ss-media-preview fav">
                {settings.favicon ? (
                  <img src={settings.favicon} alt="Favicon" />
                ) : (
                  <span className="ss-fav-circle" />
                )}
              </div>
              <div className="ss-media-actions">
                <span>Favicon</span>
                <div className="ss-media-buttons">
                  <button className="btn small" onClick={() => fileInputFavicon.current?.click()}>Upload</button>
                  {settings.favicon && (
                    <button className="btn small ghost" onClick={() => setSettings((p) => ({ ...p, favicon: "" }))}>Remove</button>
                  )}
                  <input ref={fileInputFavicon} hidden type="file" accept="image/*" onChange={(e) => handleFile(e, "favicon")} />
                </div>
              </div>
            </div>
          </div>

          <div className="ss-colors">
            <div className="ss-color-picker">
              <label>Primary Color</label>
              <div className="ss-color-input">
                <input type="color" value={settings.primaryColor} onChange={(e) => handleColor("primaryColor", e.target.value)} />
                <input value={settings.primaryColor} onChange={(e) => handleColor("primaryColor", e.target.value)} />
              </div>
            </div>
            <div className="ss-color-picker">
              <label>Accent Color</label>
              <div className="ss-color-input">
                <input type="color" value={settings.accentColor} onChange={(e) => handleColor("accentColor", e.target.value)} />
                <input value={settings.accentColor} onChange={(e) => handleColor("accentColor", e.target.value)} />
              </div>
            </div>
          </div>
        </Section>

        {/* Appearance */}
        <Section title="Appearance" subtitle="Theme mode and layout density">
          <div className="ss-field">
            <label>Theme Mode</label>
            <div className="ss-radio-row">
              <label className="radio">
                <input type="radio" name="themeMode" value="light" checked={settings.themeMode === "light"} onChange={handleChange} />
                <span>Light</span>
              </label>
              <label className="radio">
                <input type="radio" name="themeMode" value="dark" checked={settings.themeMode === "dark"} onChange={handleChange} />
                <span>Dark</span>
              </label>
              <label className="radio">
                <input type="radio" name="themeMode" value="system" checked={settings.themeMode === "system"} onChange={handleChange} />
                <span>System</span>
              </label>
            </div>
          </div>

          <div className="ss-field">
            <label>Layout Density</label>
            <select name="density" value={settings.density} onChange={handleChange}>
              <option value="comfortable">Comfortable</option>
              <option value="compact">Compact</option>
            </select>
          </div>
        </Section>

        {/* Contact & SEO */}
        <Section title="Contact & SEO" subtitle="Support details and meta tags">
          <div className="ss-field two-col">
            <label>Support Email</label>
            <input name="supportEmail" value={settings.supportEmail} onChange={handleChange} placeholder="support@evenza.app" />
          </div>
          <div className="ss-field two-col">
            <label>Support Phone</label>
            <input name="supportPhone" value={settings.supportPhone} onChange={handleChange} placeholder="+1 555-0100" />
          </div>
          <div className="ss-field">
            <label>Address</label>
            <input name="address" value={settings.address} onChange={handleChange} placeholder="Company address" />
          </div>
          <div className="ss-field">
            <label>Meta Title</label>
            <input name="metaTitle" value={settings.metaTitle} onChange={handleChange} />
          </div>
          <div className="ss-field">
            <label>Meta Description</label>
            <textarea name="metaDescription" rows={3} value={settings.metaDescription} onChange={handleChange} />
          </div>
        </Section>

        {/* Social & Analytics */}
        <Section title="Social & Analytics" subtitle="Profiles and tracking">
          <div className="ss-field two-col">
            <label>Facebook</label>
            <input name="facebook" value={settings.facebook} onChange={handleChange} placeholder="https://facebook.com/yourpage" />
          </div>
          <div className="ss-field two-col">
            <label>Instagram</label>
            <input name="instagram" value={settings.instagram} onChange={handleChange} placeholder="https://instagram.com/yourpage" />
          </div>
          <div className="ss-field two-col">
            <label>Twitter/X</label>
            <input name="twitter" value={settings.twitter} onChange={handleChange} placeholder="https://x.com/yourpage" />
          </div>
          <div className="ss-field two-col">
            <label>LinkedIn</label>
            <input name="linkedin" value={settings.linkedin} onChange={handleChange} placeholder="https://linkedin.com/company/yourpage" />
          </div>
          <div className="ss-field two-col">
            <label>YouTube</label>
            <input name="youtube" value={settings.youtube} onChange={handleChange} placeholder="https://youtube.com/@yourchannel" />
          </div>
          <div className="ss-field two-col">
            <label>Google Analytics ID</label>
            <input name="googleAnalyticsId" value={settings.googleAnalyticsId} onChange={handleChange} placeholder="G-XXXXXXXXXX" />
          </div>
        </Section>

        {/* Maintenance & Security */}
        <Section title="Maintenance & Security" subtitle="Switches and policies">
          <div className="ss-switch-row">
            <label className="switch">
              <input type="checkbox" name="maintenanceMode" checked={settings.maintenanceMode} onChange={handleChange} />
              <span className="slider" />
            </label>
            <div>
              <div className="ss-switch-title">Maintenance Mode</div>
              <div className="ss-subtitle">Show a maintenance banner across the app</div>
            </div>
          </div>
          {settings.maintenanceMode && (
            <div className="ss-field">
              <label>Maintenance Message</label>
              <input name="maintenanceMessage" value={settings.maintenanceMessage} onChange={handleChange} />
            </div>
          )}

          <div className="ss-switch-row">
            <label className="switch">
              <input type="checkbox" name="allowSignup" checked={settings.allowSignup} onChange={handleChange} />
              <span className="slider" />
            </label>
            <div>
              <div className="ss-switch-title">Allow New Signups</div>
              <div className="ss-subtitle">Enable user registrations</div>
            </div>
          </div>

          <div className="ss-switch-row">
            <label className="switch">
              <input type="checkbox" name="enableCaptcha" checked={settings.enableCaptcha} onChange={handleChange} />
              <span className="slider" />
            </label>
            <div>
              <div className="ss-switch-title">Enable Captcha</div>
              <div className="ss-subtitle">Add captcha to login and signup forms</div>
            </div>
          </div>
        </Section>

        {/* Locale */}
        <Section title="Locale" subtitle="Language, timezone, and date format">
          <div className="ss-field two-col">
            <label>Default Language</label>
            <select name="defaultLanguage" value={settings.defaultLanguage} onChange={handleChange}>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="ss-field two-col">
            <label>Timezone</label>
            <input name="timezone" value={settings.timezone} onChange={handleChange} placeholder="UTC" />
          </div>
          <div className="ss-field two-col">
            <label>Date Format</label>
            <select name="dateFormat" value={settings.dateFormat} onChange={handleChange}>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            </select>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default SiteSettings;
