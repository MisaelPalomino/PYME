import { useState } from 'react';
import { Settings as SettingsIcon, Save, Database, Bell, Brain, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { toast } from 'sonner';

const CONFIG_KEY = "system_config";

interface SystemConfig {
  criticalStockThreshold: number;
  warningStockThreshold: number;
  backupFrequency: string;
  retrainingFrequency: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  autoOrderSuggestions: boolean;
  sessionTimeout: number;
}

const DEFAULT_CONFIG: SystemConfig = {
  criticalStockThreshold: 3,
  warningStockThreshold: 7,
  backupFrequency: 'daily',
  retrainingFrequency: 'weekly',
  notificationsEnabled: true,
  emailNotifications: false,
  autoOrderSuggestions: true,
  sessionTimeout: 30,
};

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<SystemConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem(CONFIG_KEY);
      if (savedConfig) {
        try {
          return { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
        } catch (e) {
          console.error("Error parsing config from localStorage", e);
        }
      }
    }
    return DEFAULT_CONFIG;
  });

  function handleSave() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setSaved(true);
    toast.success("Configuración guardada localmente");
    window.dispatchEvent(new Event("config-updated"));
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold">
            <SettingsIcon className="w-6 h-6" />
            Configuración del Sistema
          </h1>
          <p className="text-sm text-muted-foreground">Parámetros globales de StockMaster Pro</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          {saved ? 'Guardado ✓' : 'Guardar cambios'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert thresholds */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4" />
              Umbrales de Alertas
            </CardTitle>
            <CardDescription className="text-xs">Configura cuándo se generan alertas de stock</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Alerta Crítica — Rotura en (días)</Label>
              <Input
                type="number" min={1} max={7}
                value={config.criticalStockThreshold}
                onChange={e => setConfig(c => ({ ...c, criticalStockThreshold: +e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Se genera alerta crítica cuando la predicción estima agotamiento en ≤ este número de días</p>
            </div>
            <div className="space-y-1">
              <Label>Alerta Preventiva — Rotura en (días)</Label>
              <Input
                type="number" min={4} max={30}
                value={config.warningStockThreshold}
                onChange={e => setConfig(c => ({ ...c, warningStockThreshold: +e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Se genera alerta preventiva cuando la predicción estima agotamiento en ≤ este número de días</p>
            </div>
          </CardContent>
        </Card>

        {/* Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="w-4 h-4" />
              Backup Automático
            </CardTitle>
            <CardDescription className="text-xs">Frecuencia de respaldo de la base de datos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Frecuencia de backup</Label>
              <Select value={config.backupFrequency} onValueChange={v => setConfig(c => ({ ...c, backupFrequency: v }))}>
                <SelectTrigger className="w-full bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario (recomendado)</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              Último backup: 09/06/2026 a las 02:00 AM<br />
              Próximo backup: 10/06/2026 a las 02:00 AM
            </div>
          </CardContent>
        </Card>

        {/* AI retraining */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Brain className="w-4 h-4" />
              Reentrenamiento del Modelo IA
            </CardTitle>
            <CardDescription className="text-xs">Frecuencia del reentrenamiento automático</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Frecuencia de reentrenamiento</Label>
              <Select value={config.retrainingFrequency} onValueChange={v => setConfig(c => ({ ...c, retrainingFrequency: v }))}>
                <SelectTrigger className="w-full bg-background border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal (recomendado)</SelectItem>
                  <SelectItem value="monthly">Mensual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
              Último reentrenamiento: 07/06/2026 a las 00:00 AM<br />
              Próximo reentrenamiento: 14/06/2026 a las 00:00 AM
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell className="w-4 h-4" />
              Notificaciones
            </CardTitle>
            <CardDescription className="text-xs">Configuración de notificaciones internas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">Notificaciones internas</p>
                <p className="text-xs text-muted-foreground">Ícono de campana en la interfaz</p>
              </div>
              <Switch
                checked={config.notificationsEnabled}
                onCheckedChange={v => setConfig(c => ({ ...c, notificationsEnabled: v }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground font-medium">Sugerencias automáticas de pedido</p>
                <p className="text-xs text-muted-foreground">Sugerir reposición basada en predicciones</p>
              </div>
              <Switch
                checked={config.autoOrderSuggestions}
                onCheckedChange={v => setConfig(c => ({ ...c, autoOrderSuggestions: v }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="w-4 h-4" />
              Seguridad
            </CardTitle>
            <CardDescription className="text-xs">Configuración de sesiones y acceso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Tiempo de sesión inactiva (minutos)</Label>
                <Input
                  type="number" min={5} max={120}
                  value={config.sessionTimeout}
                  onChange={e => setConfig(c => ({ ...c, sessionTimeout: +e.target.value }))}
                />
              </div>
              <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground self-end">
                Los usuarios serán desconectados automáticamente después de {config.sessionTimeout} minutos de inactividad.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
