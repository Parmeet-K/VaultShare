export const copy = {
  en: {
    dashboard: 'Dashboard', files: 'My Files', shared: 'Shared', workspace: 'Workspace', analytics: 'Analytics', settings: 'Settings', admin: 'Admin',
    secureWorkspace: 'Secure workspace', notifications: 'Notifications', noNotifications: 'No notifications yet', account: 'Account', profileSettings: 'Profile settings', logout: 'Logout'
  },
  hi: {
    dashboard: 'डैशबोर्ड', files: 'मेरी फाइलें', shared: 'शेयर', workspace: 'वर्कस्पेस', analytics: 'विश्लेषण', settings: 'सेटिंग्स', admin: 'एडमिन',
    secureWorkspace: 'सुरक्षित वर्कस्पेस', notifications: 'सूचनाएं', noNotifications: 'अभी कोई सूचना नहीं', account: 'खाता', profileSettings: 'प्रोफाइल सेटिंग्स', logout: 'लॉग आउट'
  },
  es: {
    dashboard: 'Panel', files: 'Mis archivos', shared: 'Compartidos', workspace: 'Espacio', analytics: 'Analitica', settings: 'Ajustes', admin: 'Admin',
    secureWorkspace: 'Espacio seguro', notifications: 'Notificaciones', noNotifications: 'Sin notificaciones', account: 'Cuenta', profileSettings: 'Perfil', logout: 'Cerrar sesion'
  }
};
export function t(locale, key) { return copy[locale]?.[key] || copy.en[key] || key; }
export function activityLabel(action) {
  const labels = {
    'auth.login': 'Signed in', 'auth.register': 'Account created', 'auth.session_revoke': 'Session revoked',
    'file.upload': 'Uploaded a file', 'file.download': 'Downloaded a file', 'file.update': 'Updated a file', 'file.delete': 'Deleted a file',
    'share.create': 'Created a share link', 'share.revoke': 'Revoked a share link', 'share.preview': 'Previewed a shared file', 'share.download': 'Downloaded a shared file',
    'folder.create': 'Created a folder', 'folder.delete': 'Deleted a folder', 'team.create': 'Created a workspace', 'team.invite': 'Invited a member'
  };
  return labels[action] || action.replaceAll('.', ' ');
}
export function lastThreeDays(items = []) {
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000;
  return items.filter((item) => new Date(item.createdAt).getTime() >= cutoff).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}