import React from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';

export const DisplaySettings: React.FC = () => {
  const { settings, updateSettings } = useSettingsStore();

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    updateSettings({ display: { ...settings.display, theme } });
  };

  const handleGridDensityChange = (gridDensity: 'comfortable' | 'cozy' | 'compact') => {
    updateSettings({ display: { ...settings.display, gridDensity } });
  };

  const handleThumbnailQualityChange = (thumbnailQuality: 'low' | 'medium' | 'high') => {
    updateSettings({ display: { ...settings.display, thumbnailQuality } });
  };

  const handleAnimationSpeedChange = (value: number[]) => {
    updateSettings({ display: { ...settings.display, animationSpeed: value[0] } });
  };

  const handleLanguageChange = (language: string) => {
    updateSettings({ display: { ...settings.display, language } });
  };

  const handleHighContrastChange = (highContrast: boolean) => {
    updateSettings({ display: { ...settings.display, highContrast } });
  };

  const handleReducedMotionChange = (reducedMotion: boolean) => {
    updateSettings({ display: { ...settings.display, reducedMotion } });
  };

  return (
    <div className="space-y-6">
      {/* Theme */}
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={settings.display.theme} onValueChange={handleThemeChange}>
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="auto">Auto (System)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose your preferred color scheme
        </p>
      </div>

      <Separator />

      {/* Grid Density */}
      <div className="space-y-2">
        <Label htmlFor="grid-density">Photo Grid Density</Label>
        <Select value={settings.display.gridDensity} onValueChange={handleGridDensityChange}>
          <SelectTrigger id="grid-density">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="comfortable">Comfortable</SelectItem>
            <SelectItem value="cozy">Cozy</SelectItem>
            <SelectItem value="compact">Compact</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Control how many photos are displayed per row
        </p>
      </div>

      <Separator />

      {/* Thumbnail Quality */}
      <div className="space-y-2">
        <Label htmlFor="thumbnail-quality">Thumbnail Quality</Label>
        <Select value={settings.display.thumbnailQuality} onValueChange={handleThumbnailQualityChange}>
          <SelectTrigger id="thumbnail-quality">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low (Faster loading)</SelectItem>
            <SelectItem value="medium">Medium (Balanced)</SelectItem>
            <SelectItem value="high">High (Best quality)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Higher quality uses more storage and bandwidth
        </p>
      </div>

      <Separator />

      {/* Animation Speed */}
      <div className="space-y-3">
        <Label htmlFor="animation-speed">Animation Speed</Label>
        <div className="px-3">
          <Slider
            id="animation-speed"
            min={0}
            max={2}
            step={0.25}
            value={[settings.display.animationSpeed]}
            onValueChange={handleAnimationSpeedChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Disabled</span>
            <span>Slow</span>
            <span>Normal</span>
            <span>Fast</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Current speed: {settings.display.animationSpeed === 0 ? 'Disabled' : 
                          settings.display.animationSpeed < 1 ? 'Slow' :
                          settings.display.animationSpeed === 1 ? 'Normal' : 'Fast'}
        </p>
      </div>

      <Separator />

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language">Language</Label>
        <Select value={settings.display.language} onValueChange={handleLanguageChange}>
          <SelectTrigger id="language">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Español</SelectItem>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="de">Deutsch</SelectItem>
            <SelectItem value="it">Italiano</SelectItem>
            <SelectItem value="pt">Português</SelectItem>
            <SelectItem value="ja">日本語</SelectItem>
            <SelectItem value="ko">한국어</SelectItem>
            <SelectItem value="zh">中文</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          Choose your preferred language
        </p>
      </div>

      <Separator />

      {/* Accessibility Options */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Accessibility</Label>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="high-contrast">High Contrast</Label>
            <p className="text-sm text-muted-foreground">
              Increase contrast for better visibility
            </p>
          </div>
          <Switch
            id="high-contrast"
            checked={settings.display.highContrast}
            onCheckedChange={handleHighContrastChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="reduced-motion">Reduced Motion</Label>
            <p className="text-sm text-muted-foreground">
              Minimize animations and transitions
            </p>
          </div>
          <Switch
            id="reduced-motion"
            checked={settings.display.reducedMotion}
            onCheckedChange={handleReducedMotionChange}
          />
        </div>
      </div>
    </div>
  );
};