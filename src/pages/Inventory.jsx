import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import JSZip from 'jszip';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Sliders,
  Image as ImageIcon,
  X,
  Check,
  AlertCircle,
  Upload,
  Trash2,
  Download,
  FileText,
  Archive,
} from 'lucide-react';

export default function Inventory() {
  const [activeCategory, setActiveCategory] = useState('bombillos');
  const [activeMainTab, setActiveMainTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingStockProduct, setAdjustingStockProduct] = useState(null);
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importWithImages, setImportWithImages] = useState(false);
  const [exportProcessing, setExportProcessing] = useState(false);
  const [importProcessing, setImportProcessing] = useState(false);
  
  const [formCode, setFormCode] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('bombillos');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formImageFile, setFormImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [stockAdjustmentValue, setStockAdjustmentValue] = useState('');
  const [stockAdjustmentType, setStockAdjustmentType] = useState('add');

  useEffect(() => {
    if (activeMainTab === 'inventory') {
      fetchProducts();
    }
  }, [activeCategory, activeMainTab]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', activeCategory)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error al cargar productos:', err);
      setErrorMsg('No se pudo cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      let imageUrl = editingProduct ? editingProduct.image_url : null;
      if (formImageFile) {
        const fileExt = formImageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, formImageFile);
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      } else if (!imagePreview) {
        imageUrl = null;
      }

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update({
            code: formCode,
            description: formDescription,
            category: formCategory,
            price_usd: parseFloat(formPrice),
            image_url: imageUrl,
            updated_at: new Date(),
          })
          .eq('id', editingProduct.id);
        if (error) throw error;
        setSuccessMsg('Producto actualizado exitosamente.');
      } else {
        const { error } = await supabase.from('products').insert([
          {
            code: formCode,
            description: formDescription,
            category: formCategory,
            price_usd: parseFloat(formPrice),
            stock_current: parseInt(formStock || 0),
            image_url: imageUrl,
          },
        ]);
        if (error) throw error;
        setSuccessMsg('Producto registrado exitosamente.');
      }
      closeModals();
      fetchProducts();
    } catch (err) {
      console.error('Error al guardar producto:', err);
      setErrorMsg(err.message || 'Error al guardar el producto. Verifique los datos.');
    }
  };

  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar el producto "${product.description}"?\n\nADVERTENCIA: Esto también eliminará el producto de cualquier nota de entrega (N.E.) donde haya sido utilizado.`)) {
      return;
    }
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      if (product.image_url) {
        try {
          const urlParts = product.image_url.split('/');
          const fileName = urlParts[urlParts.length - 1];
          if (fileName) {
            await supabase.storage.from('products').remove([fileName]);
          }
        } catch (imgErr) {
          console.warn('No se pudo eliminar la imagen del storage:', imgErr);
        }
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('product_id', product.id);
      if (itemsError) {
        console.warn('Error al eliminar order_items relacionados:', itemsError);
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);
      if (error) throw error;
      setSuccessMsg(`Producto "${product.description}" eliminado exitosamente (incluyendo referencias en N.E.).`);
      fetchProducts();
    } catch (err) {
      console.error('Error al eliminar producto:', err);
      setErrorMsg(err.message || 'Error al eliminar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickStockAdjustment = async (e) => {
    e.preventDefault();
    if (!adjustingStockProduct) return;
    try {
      let newStock = adjustingStockProduct.stock_current;
      const amount = parseInt(stockAdjustmentValue);
      if (isNaN(amount)) throw new Error('Cantidad inválida');
      if (stockAdjustmentType === 'add') {
        newStock += amount;
      } else if (stockAdjustmentType === 'subtract') {
        newStock = Math.max(0, newStock - amount);
      } else if (stockAdjustmentType === 'set') {
        newStock = Math.max(0, amount);
      }

      const { error } = await supabase
        .from('products')
        .update({ stock_current: newStock, updated_at: new Date() })
        .eq('id', adjustingStockProduct.id);
      if (error) throw error;
      setSuccessMsg('Inventario ajustado correctamente.');
      closeModals();
      fetchProducts();
    } catch (err) {
      setErrorMsg(err.message || 'Error al ajustar el stock.');
    }
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormCode(product.code);
    setFormDescription(product.description);
    setFormCategory(product.category);
    setFormPrice(product.price_usd);
    setFormStock(product.stock_current);
    setImagePreview(product.image_url || '');
    setFormImageFile(null);
    setShowAddModal(true);
  };

  const openNewModal = () => {
    setEditingProduct(null);
    setFormCode('');
    setFormDescription('');
    setFormCategory(activeCategory);
    setFormPrice('');
    setFormStock('');
    setImagePreview('');
    setFormImageFile(null);
    setShowAddModal(true);
  };

  const closeModals = () => {
    setShowAddModal(false);
    setEditingProduct(null);
    setAdjustingStockProduct(null);
    setStockAdjustmentValue('');
  };

  const filteredProducts = products.filter(
    (p) =>
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = async (withImages) => {
    setExportProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { data: allProducts, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      if (!allProducts || allProducts.length === 0) {
        setErrorMsg('No hay productos para exportar.');
        setExportProcessing(false);
        return;
      }

      const csvHeaders = ['code', 'description', 'category', 'price_usd', 'stock_current', 'image_url'];
      const csvRows = allProducts.map((p) => [
        p.code || '',
        p.description || '',
        p.category || '',
        p.price_usd || 0,
        p.stock_current || 0,
        p.image_url || '',
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      if (!withImages) {
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        setSuccessMsg('Inventario exportado exitosamente (sin imágenes).');
      } else {
        const zip = new JSZip();
        zip.file('inventario.csv', csvContent);
        const imageFolder = zip.folder('imagenes');
        const imagePromises = allProducts
          .filter((p) => p.image_url)
          .map(async (p) => {
            try {
              const response = await fetch(p.image_url);
              if (!response.ok) throw new Error('Fetch failed');
              const blob = await response.blob();
              const fileName = p.image_url.split('/').pop().split('?')[0];
              const safeName = fileName || `producto_${p.code}.jpg`;
              imageFolder.file(safeName, blob);
            } catch (err) {
              console.warn(`No se pudo descargar la imagen: ${p.image_url}`, err);
            }
          });
        await Promise.all(imagePromises);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `inventario_completo_${new Date().toISOString().split('T')[0]}.zip`;
        link.click();
        URL.revokeObjectURL(url);
        setSuccessMsg('Inventario exportado exitosamente (con imágenes).');
      }
      setShowExportModal(false);
    } catch (err) {
      console.error('Error al exportar:', err);
      setErrorMsg(err.message || 'Error al exportar el inventario.');
    } finally {
      setExportProcessing(false);
    }
  };

  const importFromCSV = async (csvContent, withImages, zipFile = null) => {
    setImportProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const lines = csvContent.split('\n').map((line) => line.replace(/\r$/, '')).filter((line) => line.trim());
      if (lines.length < 2) {
        throw new Error('El archivo CSV está vacío o no tiene datos válidos.');
      }

      const headers = lines[0].split(',').map((h) => h.replace(/^"|"$/g, '').trim());
      const productsToImport = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map((v) => v.replace(/^"|"$/g, '').trim());
        const product = {};
        headers.forEach((header, index) => {
          product[header] = values[index] || '';
        });
        if (product.code) {
          productsToImport.push(product);
        }
      }

      if (withImages && zipFile) {
        const zip = await JSZip.loadAsync(zipFile);
        const imageFolder = zip.folder('imagenes');
        if (imageFolder) {
          for (const product of productsToImport) {
            if (product.image_url) {
              const fileName = product.image_url.split('/').pop().split('?')[0];
              const imageFile = imageFolder.file(fileName);
              if (imageFile) {
                const imageBlob = await imageFile.async('blob');
                const fileExt = fileName.split('.').pop() || 'jpg';
                const newFileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const { error: uploadError } = await supabase.storage.from('products').upload(newFileName, imageBlob);
                if (!uploadError) {
                  const { data: publicUrlData } = supabase.storage.from('products').getPublicUrl(newFileName);
                  product.image_url = publicUrlData.publicUrl;
                }
              }
            }
          }
        }
      }

      let importedCount = 0;
      let updatedCount = 0;
      for (const product of productsToImport) {
        const { data: existingProduct } = await supabase.from('products').select('id').eq('code', product.code).single();
        if (existingProduct) {
          const { error } = await supabase
            .from('products')
            .update({
              description: product.description,
              category: product.category,
              price_usd: parseFloat(product.price_usd) || 0,
              stock_current: parseInt(product.stock_current) || 0,
              image_url: product.image_url || null,
              updated_at: new Date(),
            })
            .eq('id', existingProduct.id);
          if (error) {
            console.warn('Error al actualizar producto:', error);
          } else {
            updatedCount++;
          }
        } else {
          const { error } = await supabase.from('products').insert([
            {
              code: product.code,
              description: product.description,
              category: product.category || 'bombillos',
              price_usd: parseFloat(product.price_usd) || 0,
              stock_current: parseInt(product.stock_current) || 0,
              image_url: product.image_url || null,
            },
          ]);
          if (error) {
            console.warn('Error al insertar producto:', error);
          } else {
            importedCount++;
          }
        }
      }

      setSuccessMsg(`Importación completada: ${importedCount} productos nuevos creados, ${updatedCount} productos actualizados${withImages ? ' (con imágenes)' : ''}.`);
      setShowImportModal(false);
      setImportFile(null);
      setImportWithImages(false);
      fetchProducts();
    } catch (err) {
      console.error('Error al importar:', err);
      setErrorMsg(err.message || 'Error al importar el inventario.');
    } finally {
      setImportProcessing(false);
    }
  };

  const handleImportFile = async (e) => {
    if (e) e.preventDefault();
    if (!importFile) {
      setErrorMsg('Por favor seleccione un archivo.');
      return;
    }
    try {
      if (importWithImages) {
        if (!importFile.name.toLowerCase().endsWith('.zip')) {
          throw new Error('Para importar con imágenes debe seleccionar un archivo ZIP.');
        }
        const zip = await JSZip.loadAsync(importFile);
        const csvFile = zip.file('inventario.csv');
        if (!csvFile) {
          throw new Error('El archivo ZIP no contiene un archivo "inventario.csv". Asegúrese de que el ZIP fue generado por este sistema.');
        }
        const csvContent = await csvFile.async('string');
        await importFromCSV(csvContent, true, importFile);
      } else {
        if (!importFile.name.toLowerCase().endsWith('.csv')) {
          throw new Error('Para importar sin imágenes debe seleccionar un archivo CSV.');
        }
        const csvContent = await importFile.text();
        await importFromCSV(csvContent, false);
      }
    } catch (err) {
      console.error('Error al procesar archivo:', err);
      setErrorMsg(err.message || 'Error al procesar el archivo.');
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <style>{`
        @media (max-width: 768px) {
          .desktop-table { display: none !important; }
          .mobile-cards { display: block !important; }
          .submenu-text-full { display: none !important; }
          .submenu-text-short { display: inline !important; }
        }
        @media (min-width: 769px) {
          .desktop-table { display: block !important; }
          .mobile-cards { display: none !important; }
          .submenu-text-full { display: inline !important; }
          .submenu-text-short { display: none !important; }
        }
        .mobile-card {
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          padding: 16px;
          margin-bottom: 12px;
          border: 1px solid #e5e7eb;
        }
        .mobile-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .mobile-card-field {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .mobile-card-field:last-child { border-bottom: none; }
        .mobile-card-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
        }
        .mobile-card-value {
          font-size: 14px;
          color: #111827;
          font-weight: 500;
        }
        .mobile-card-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
        }
        .mobile-card-actions button {
          flex: 1;
          padding: 8px;
          border-radius: 6px;
          border: 1px solid;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package color="#dc2626" size={28} /> Gestión de Inventario
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Visualice y administre productos en tiempo real.</p>
        </div>
        {activeMainTab === 'inventory' && (
          <button onClick={openNewModal} style={{ backgroundColor: '#000000', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
            <Plus size={18} /> Registrar Producto
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}
      {successMsg && (
        <div style={{ padding: '12px', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={18} /> {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #e5e7eb', marginBottom: '24px', overflowX: 'auto' }}>
        {[
          { id: 'bombillos', label: 'Bombillos', labelShort: 'Bombillos', icon: Package },
          { id: 'fluidos', label: 'Fluidos', labelShort: 'Fluidos', icon: Package },
          { id: 'import_export', label: 'Importación/Exportación', labelShort: 'Imp./Exp.', icon: Archive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === 'import_export' ? activeMainTab === 'import_export' : activeMainTab === 'inventory' && activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'import_export') {
                  setActiveMainTab('import_export');
                } else {
                  setActiveMainTab('inventory');
                  setActiveCategory(tab.id);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', border: 'none', borderBottom: isActive ? '3px solid #dc2626' : '3px solid transparent', backgroundColor: 'transparent', color: isActive ? '#dc2626' : '#4b5563', fontWeight: isActive ? 'bold' : '500', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}
            >
              <Icon size={18} color={isActive ? '#dc2626' : '#4b5563'} />
              <span className="submenu-text-full">{tab.label}</span>
              <span className="submenu-text-short">{tab.labelShort}</span>
            </button>
          );
        })}
      </div>

      {activeMainTab === 'inventory' && (
        <>
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} size={20} />
            <input type="text" placeholder="Buscar por código o descripción del producto..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 40px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '14px', backgroundColor: '#ffffff' }} />
          </div>

          <div className="desktop-table" style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f3f4f6', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px' }}>Foto</th>
                  <th style={{ padding: '12px 16px' }}>Código</th>
                  <th style={{ padding: '12px 16px' }}>Descripción</th>
                  <th style={{ padding: '12px 16px' }}>Categoría</th>
                  <th style={{ padding: '12px 16px' }}>Precio ($)</th>
                  <th style={{ padding: '12px 16px' }}>Stock Actual</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Cargando inventario...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No se encontraron productos registrados en esta categoría.</td></tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '12px 16px' }}>
                        {p.image_url ? (
                          <img src={p.image_url} alt={p.code} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setSelectedImageModal(p.image_url)} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                            <ImageIcon size={20} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '600', color: '#111827' }}>{p.code}</td>
                      <td style={{ padding: '12px 16px', color: '#374151' }}>{p.description}</td>
                      <td style={{ padding: '12px 16px', textTransform: 'capitalize', color: '#4b5563' }}>{p.category}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 'bold', color: '#059669' }}>${Number(p.price_usd).toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: p.stock_current > 5 ? '#d1fae5' : '#fee2e2', color: p.stock_current > 5 ? '#065f46' : '#b91c1c', fontWeight: '600' }}>{p.stock_current} un.</span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                          <button type="button" onClick={() => openEditModal(p)} title="Editar Producto" style={{ padding: '6px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>
                            <Edit3 size={16} color="#374151" />
                          </button>
                          <button type="button" onClick={() => setAdjustingStockProduct(p)} title="Ajuste de Inventario" style={{ padding: '6px', backgroundColor: '#fef3c7', border: '1px solid #f59e0b', borderRadius: '4px', cursor: 'pointer' }}>
                            <Sliders size={16} color="#d97706" />
                          </button>
                          <button type="button" onClick={() => handleDeleteProduct(p)} title="Eliminar Producto" style={{ padding: '6px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '4px', cursor: 'pointer' }}>
                            <Trash2 size={16} color="#dc2626" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mobile-cards" style={{ display: 'none' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Cargando inventario...</div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No se encontraron productos registrados en esta categoría.</div>
            ) : (
              filteredProducts.map((p) => (
                <div key={p.id} className="mobile-card">
                  <div className="mobile-card-header">
                    {p.image_url ? (
                      <img src={p.image_url} alt={p.code} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' }} onClick={() => setSelectedImageModal(p.image_url)} />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#e5e7eb', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                        <ImageIcon size={24} />
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: '700', fontSize: '16px', color: '#111827', marginBottom: '4px' }}>{p.code}</div>
                      <div style={{ fontSize: '13px', color: '#6b7280' }}>{p.description}</div>
                    </div>
                  </div>
                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Categoría</span>
                    <span className="mobile-card-value" style={{ textTransform: 'capitalize' }}>{p.category}</span>
                  </div>
                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Precio</span>
                    <span className="mobile-card-value" style={{ color: '#059669', fontWeight: '700' }}>${Number(p.price_usd).toFixed(2)}</span>
                  </div>
                  <div className="mobile-card-field">
                    <span className="mobile-card-label">Stock</span>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: p.stock_current > 5 ? '#d1fae5' : '#fee2e2', color: p.stock_current > 5 ? '#065f46' : '#b91c1c', fontWeight: '600', fontSize: '13px' }}>{p.stock_current} un.</span>
                  </div>
                  <div className="mobile-card-actions">
                    <button type="button" onClick={() => openEditModal(p)} style={{ backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#374151' }}>
                      <Edit3 size={14} /> Editar
                    </button>
                    <button type="button" onClick={() => setAdjustingStockProduct(p)} style={{ backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#d97706' }}>
                      <Sliders size={14} /> Stock
                    </button>
                    <button type="button" onClick={() => handleDeleteProduct(p)} style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#dc2626' }}>
                      <Trash2 size={14} /> Eliminar
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeMainTab === 'import_export' && (
        <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Archive size={24} color="#dc2626" /> Importación y Exportación de Inventario
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px' }}>Gestione la importación y exportación de datos del inventario con o sin imágenes.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#f0fdf4', border: '2px solid #bbf7d0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#166534', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download size={20} /> Exportar Inventario
                </h3>
                <p style={{ color: '#15803d', fontSize: '14px', marginBottom: '16px' }}>Descargue todos los datos del inventario en formato CSV o ZIP con imágenes.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setShowExportModal(true)} style={{ padding: '12px 20px', backgroundColor: '#059669', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  <Download size={18} /> Exportar Datos
                </button>
              </div>
            </div>
            <div style={{ backgroundColor: '#eff6ff', border: '2px solid #bfdbfe', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e40af', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Upload size={20} /> Importar Inventario
                </h3>
                <p style={{ color: '#1d4ed8', fontSize: '14px', marginBottom: '16px' }}>Cargue datos del inventario desde un archivo CSV o ZIP con imágenes.</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button onClick={() => setShowImportModal(true)} style={{ padding: '12px 20px', backgroundColor: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
                  <Upload size={18} /> Importar Datos
                </button>
              </div>
            </div>
          </div>
          <div style={{ padding: '16px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>Información Importante:</h4>
            <ul style={{ color: '#6b7280', fontSize: '13px', lineHeight: '1.6', paddingLeft: '20px', margin: 0 }}>
              <li>Al exportar sin imágenes, se genera un archivo CSV con todos los datos del inventario.</li>
              <li>Al exportar con imágenes, se genera un archivo ZIP que contiene el CSV y todas las imágenes.</li>
              <li>Al importar sin imágenes, se actualizan o crean productos desde un archivo CSV.</li>
              <li>Al importar con imágenes, se procesa un archivo ZIP que contiene el CSV y las imágenes asociadas.</li>
              <li>Los productos existentes se actualizan según su código único.</li>
              <li>Los productos nuevos se crean automáticamente.</li>
            </ul>
          </div>
        </div>
      )}

      {showExportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '450px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Download size={20} color="#059669" /> Exportar Inventario
              </h2>
              <button type="button" onClick={() => setShowExportModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>¿Desea exportar con imágenes o sin imágenes?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button onClick={() => exportToCSV(false)} disabled={exportProcessing} style={{ padding: '14px 20px', backgroundColor: '#f0fdf4', color: '#166534', border: '2px solid #bbf7d0', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: exportProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                <FileText size={18} /> {exportProcessing ? 'Procesando...' : 'Sin Imágenes (CSV)'}
              </button>
              <button onClick={() => exportToCSV(true)} disabled={exportProcessing} style={{ padding: '14px 20px', backgroundColor: '#eff6ff', color: '#1e40af', border: '2px solid #bfdbfe', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: exportProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                <Archive size={18} /> {exportProcessing ? 'Procesando...' : 'Con Imágenes (ZIP)'}
              </button>
            </div>
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', fontSize: '12px', color: '#6b7280' }}>
              <strong>Nota:</strong> La exportación con imágenes puede tardar más tiempo dependiendo de la cantidad de productos.
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Upload size={20} color="#2563eb" /> Importar Inventario
              </h2>
              <button type="button" onClick={() => { setShowImportModal(false); setImportFile(null); setImportWithImages(false); }} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '20px', textAlign: 'center', fontWeight: '600' }}>¿Desea importar con imágenes o sin imágenes?</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <button onClick={() => { setImportWithImages(false); document.getElementById('import-file-input').click(); }} disabled={importProcessing} style={{ padding: '14px 20px', backgroundColor: importWithImages === false && importFile ? '#f0fdf4' : '#f9fafb', color: importWithImages === false && importFile ? '#166534' : '#374151', border: importWithImages === false && importFile ? '2px solid #bbf7d0' : '2px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: importProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                <FileText size={18} /> Sin Imágenes (CSV)
              </button>
              <button onClick={() => { setImportWithImages(true); document.getElementById('import-file-input').click(); }} disabled={importProcessing} style={{ padding: '14px 20px', backgroundColor: importWithImages === true && importFile ? '#eff6ff' : '#f9fafb', color: importWithImages === true && importFile ? '#1e40af' : '#374151', border: importWithImages === true && importFile ? '2px solid #bfdbfe' : '2px solid #e5e7eb', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: importProcessing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s' }}>
                <Archive size={18} /> Con Imágenes (ZIP)
              </button>
            </div>
            <input type="file" id="import-file-input" accept={importWithImages ? '.zip' : '.csv'} onChange={(e) => { if (e.target.files && e.target.files[0]) { setImportFile(e.target.files[0]); } }} style={{ display: 'none' }} />
            {importFile && (
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '6px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Check size={16} color="#059669" />
                <span style={{ fontSize: '13px', color: '#166534', fontWeight: '600' }}>Archivo seleccionado: {importFile.name}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" onClick={() => { setShowImportModal(false); setImportFile(null); setImportWithImages(false); }} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
              <button type="button" onClick={handleImportFile} disabled={importProcessing || !importFile} style={{ padding: '10px 20px', backgroundColor: importProcessing || !importFile ? '#9ca3af' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: importProcessing || !importFile ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {importProcessing ? 'Procesando...' : 'Importar'}
              </button>
            </div>
            <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#fef2f2', borderRadius: '6px', fontSize: '12px', color: '#991b1b' }}>
              <strong>Advertencia:</strong> La importación actualizará los productos existentes según su código único y creará los nuevos.
            </div>
          </div>
        </div>
      )}

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>{editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}</h2>
              <button type="button" onClick={closeModals} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Categoría</label>
                <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: '#fff' }}>
                  <option value="bombillos">Bombillos</option>
                  <option value="fluidos">Fluidos</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Código Único</label>
                <input type="text" required placeholder="Ej. BOM-001" value={formCode} onChange={(e) => setFormCode(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Descripción y Especificaciones</label>
                <textarea required rows={2} placeholder="Nombre y detalles del producto..." value={formDescription} onChange={(e) => setFormDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Precio ($)</label>
                  <input type="number" step="0.01" min="0" required placeholder="0.00" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                </div>
                {!editingProduct && (
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Stock Inicial</label>
                    <input type="number" min="0" required placeholder="0" value={formStock} onChange={(e) => setFormStock(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
                  </div>
                )}
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Foto del Producto (Única)</label>
                {!imagePreview ? (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', padding: '12px 16px', backgroundColor: '#f8fafc', color: '#111827', border: '2px dashed #d1d5db', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <Upload size={18} color="#dc2626" />
                    <span>Seleccionar Imagen...</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files && e.target.files[0]) { const file = e.target.files[0]; setFormImageFile(file); setImagePreview(URL.createObjectURL(file)); e.target.value = null; } }} />
                  </label>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb' }}>
                    <img src={imagePreview} alt="Vista previa" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }} />
                    <div style={{ flex: 1, fontSize: '13px', color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{formImageFile ? formImageFile.name : 'Imagen actual del producto'}</div>
                    <button type="button" onClick={() => { setFormImageFile(null); setImagePreview(''); if (editingProduct) { setEditingProduct({ ...editingProduct, image_url: null }); } }} style={{ background: '#fee2e2', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#b91c1c' }}>
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={closeModals} style={{ padding: '10px 16px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#dc2626', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {adjustingStockProduct && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '400px', padding: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>Ajuste de Inventario</h2>
              <button type="button" onClick={closeModals} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} color="#6b7280" />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
              Producto: <strong>{adjustingStockProduct.description}</strong>
              <br />
              Stock Actual: <span style={{ color: '#059669', fontWeight: 'bold' }}>{adjustingStockProduct.stock_current} unidades</span>
            </p>
            <form onSubmit={handleQuickStockAdjustment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Tipo de Ajuste</label>
                <select value={stockAdjustmentType} onChange={(e) => setStockAdjustmentType(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  <option value="add">Incrementar Stock (+)</option>
                  <option value="subtract">Decrementar Stock (-)</option>
                  <option value="set">Establecer Cantidad Exacta</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '6px', color: '#374151' }}>Cantidad</label>
                <input type="number" min="0" required placeholder="Ingrese cantidad" value={stockAdjustmentValue} onChange={(e) => setStockAdjustmentValue(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={closeModals} style={{ padding: '8px 14px', backgroundColor: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Cancelar</button>
                <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }}>Aplicar Ajuste</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedImageModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }} onClick={() => setSelectedImageModal(null)}>
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button type="button" onClick={() => setSelectedImageModal(null)} style={{ position: 'absolute', top: '-40px', right: '0', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <X size={28} />
            </button>
            <img src={selectedImageModal} alt="Ampliada" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain' }} />
          </div>
        </div>
      )}
    </div>
  );
}