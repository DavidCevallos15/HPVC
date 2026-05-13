import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Save, CheckCircle, Loader2, Trash2, Plus, Move, ZoomIn } from 'lucide-react';
import api from '../api/axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');
const MAX_IMAGES = 10;

export default function HeroCarouselAdminPage() {
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({});
  const [previewUrls, setPreviewUrls] = useState({});
  const [imageSettings, setImageSettings] = useState({});

  useEffect(() => {
    fetchHeroConfig();
  }, []);

  const fetchHeroConfig = async () => {
    try {
      const res = await api.get('/admin/configuracion');
      if (res.data.data) {
        const images = [];
        const settings = {};
        
        for (let i = 1; i <= MAX_IMAGES; i++) {
          const imageUrl = res.data.data[`hero_carousel_${i}`];
          if (imageUrl) {
            images.push({
              id: `hero_${i}`,
              url: `${API_ORIGIN}${imageUrl}`,
              title: res.data.data[`hero_carousel_${i}_title`] || '',
              description: res.data.data[`hero_carousel_${i}_description`] || '',
              position: res.data.data[`hero_carousel_${i}_position`] || 'center center',
              size: res.data.data[`hero_carousel_${i}_size`] || 'cover'
            });
          } else {
            images.push({
              id: `hero_${i}`,
              url: null,
              title: '',
              description: '',
              position: 'center center',
              size: 'cover'
            });
          }
          
          settings[i] = {
            title: res.data.data[`hero_carousel_${i}_title`] || '',
            description: res.data.data[`hero_carousel_${i}_description`] || '',
            position: res.data.data[`hero_carousel_${i}_position`] || 'center center',
            size: res.data.data[`hero_carousel_${i}_size`] || 'cover'
          };
        }
        
        setHeroImages(images);
        setImageSettings(settings);
      }
    } catch (err) {
      console.error('Error fetching hero config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (index, file) => {
    if (file) {
      const newSelectedFiles = { ...selectedFiles };
      const newPreviewUrls = { ...previewUrls };
      
      newSelectedFiles[index] = file;
      newPreviewUrls[index] = URL.createObjectURL(file);
      
      setSelectedFiles(newSelectedFiles);
      setPreviewUrls(newPreviewUrls);
      setSaved(false);
    }
  };

  const handleSettingChange = (index, field, value) => {
    const newSettings = { ...imageSettings };
    if (!newSettings[index]) {
      newSettings[index] = {};
    }
    newSettings[index][field] = value;
    setImageSettings(newSettings);
    setSaved(false);
  };

  const removeImage = async (index) => {
    if (!confirm(`¿Estás seguro de eliminar la imagen ${index}?`)) return;

    try {
      await api.delete(`/admin/configuracion/hero_carousel_${index}`);
      
      const newImages = [...heroImages];
      newImages[index - 1] = {
        ...newImages[index - 1],
        url: null,
        title: '',
        description: ''
      };
      setHeroImages(newImages);
      
      const newSelectedFiles = { ...selectedFiles };
      const newPreviewUrls = { ...previewUrls };
      delete newSelectedFiles[index];
      delete newPreviewUrls[index];
      setSelectedFiles(newSelectedFiles);
      setPreviewUrls(newPreviewUrls);
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error removing image:', err);
      alert('Error al eliminar la imagen');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasChanges = Object.keys(selectedFiles).length > 0 || 
      Object.keys(imageSettings).some(index => {
        const img = heroImages[index - 1];
        return img && (
          imageSettings[index].title !== img.title ||
          imageSettings[index].description !== img.description ||
          imageSettings[index].position !== img.position ||
          imageSettings[index].size !== img.size
        );
      });

    if (!hasChanges) return;

    setSaving(true);
    
    try {
      // Subir archivos nuevos
      await Promise.all(
        Object.entries(selectedFiles).map(([index, file]) => {
          const formData = new FormData();
          formData.append('clave', `hero_carousel_${index}`);
          formData.append('imagen', file);
          return api.post('/admin/configuracion/imagen', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        })
      );

      // Actualizar configuraciones de texto y ajustes
      const configUpdates = [];
      for (let i = 1; i <= MAX_IMAGES; i++) {
        if (imageSettings[i]) {
          configUpdates.push({
            clave: `hero_carousel_${i}_title`,
            valor: imageSettings[i].title || ''
          });
          configUpdates.push({
            clave: `hero_carousel_${i}_description`,
            valor: imageSettings[i].description || ''
          });
          configUpdates.push({
            clave: `hero_carousel_${i}_position`,
            valor: imageSettings[i].position || 'center center'
          });
          configUpdates.push({
            clave: `hero_carousel_${i}_size`,
            valor: imageSettings[i].size || 'cover'
          });
        }
      }

      if (configUpdates.length > 0) {
        await api.put('/admin/configuracion', { configs: configUpdates });
      }

      // Limpiar estado
      setSelectedFiles({});
      setPreviewUrls({});
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      
      // Recargar datos
      await fetchHeroConfig();
      
    } catch (err) {
      console.error('Error saving hero carousel:', err);
      alert('Error al guardar el carrusel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-heading text-neutral-900 flex items-center gap-2">
          <ImageIcon size={28} className="text-primary" /> Carrusel de Imágenes Principal
        </h1>
        <p className="text-neutral-500 text-sm mt-1">
          Configura las imágenes del carrusel principal (máximo {MAX_IMAGES} imágenes). Cada imagen puede tener título, descripción y ajustes de visualización.
        </p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
          <CheckCircle size={15} /> Carrusel actualizado exitosamente.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroImages.map((image, index) => {
            const imageIndex = index + 1;
            const hasFile = selectedFiles[imageIndex];
            const hasPreview = previewUrls[imageIndex] || image.url;
            const settings = imageSettings[imageIndex] || {};

            return (
              <div key={image.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-neutral-900 flex items-center gap-2">
                    <span className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                      {imageIndex}
                    </span>
                    Imagen {imageIndex}
                  </h3>
                  {image.url && (
                    <button
                      type="button"
                      onClick={() => removeImage(imageIndex)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Eliminar imagen"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Vista previa con ajustes */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-neutral-700">Vista Previa</label>
                  <div className="relative border-2 border-dashed border-neutral-200 rounded-xl bg-neutral-50 overflow-hidden h-48">
                    {(hasPreview) ? (
                      <img
                        src={previewUrls[imageIndex] || image.url}
                        alt={`Vista previa ${imageIndex}`}
                        className="w-full h-full object-cover transition-all duration-300"
                        style={{
                          objectPosition: settings.position || 'center center',
                          objectFit: settings.size || 'cover'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <ImageIcon size={32} className="opacity-30" />
                      </div>
                    )}
                    
                    {/* Controles de zoom y posición */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="bg-black/50 backdrop-blur-sm text-white p-1 rounded text-xs">
                        <ZoomIn size={12} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer border ${
                      hasFile 
                        ? 'bg-blue-50 text-blue-700 border-blue-200' 
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}>
                      <Upload size={14} />
                      {hasFile ? 'Cambiar' : 'Subir'} imagen
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleFileChange(imageIndex, e.target.files[0])} 
                      />
                    </label>
                    {hasFile && (
                      <span className="text-xs text-neutral-500 truncate max-w-xs">
                        {selectedFiles[imageIndex].name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Configuración de la imagen */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Título (opcional)</label>
                    <input
                      type="text"
                      value={settings.title || ''}
                      onChange={(e) => handleSettingChange(imageIndex, 'title', e.target.value)}
                      placeholder="Título de la imagen"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción (opcional)</label>
                    <textarea
                      value={settings.description || ''}
                      onChange={(e) => handleSettingChange(imageIndex, 'description', e.target.value)}
                      placeholder="Descripción breve de la imagen"
                      rows={2}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Posición</label>
                      <select
                        value={settings.position || 'center center'}
                        onChange={(e) => handleSettingChange(imageIndex, 'position', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="center center">Centro</option>
                        <option value="top center">Superior centro</option>
                        <option value="bottom center">Inferior centro</option>
                        <option value="left center">Izquierda centro</option>
                        <option value="right center">Derecha centro</option>
                        <option value="top left">Superior izquierda</option>
                        <option value="top right">Superior derecha</option>
                        <option value="bottom left">Inferior izquierda</option>
                        <option value="bottom right">Inferior derecha</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Tamaño</label>
                      <select
                        value={settings.size || 'cover'}
                        onChange={(e) => handleSettingChange(imageIndex, 'size', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      >
                        <option value="cover">Cubrir (Cover)</option>
                        <option value="contain">Contener (Contain)</option>
                        <option value="fill">Llenar (Fill)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-6 border-t border-neutral-100">
          <button 
            type="submit" 
            disabled={saving || Object.keys(selectedFiles).length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-light transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
