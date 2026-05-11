'use client';

import { useState } from 'react';

interface FieldDef {
  name: string;
  labelAr: string;
  labelEn: string;
  type: 'text' | 'email' | 'url' | 'number' | 'date' | 'textarea' | 'select';
  required: boolean;
  options?: string[];
}

interface Template {
  id: string;
  code: string;
  titleAr: string;
  titleEn: string;
  category: string;
  schema: string; // JSON string
}

interface DocumentFormProps {
  template: Template;
  onSuccess?: (doc: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export default function DocumentForm({ template, onSuccess, onCancel }: DocumentFormProps) {
  const fields: FieldDef[] = JSON.parse(template.schema);
  const [formData, setFormData]   = useState<Record<string, string>>({});
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    for (const field of fields) {
      if (field.required && !formData[field.name]?.trim()) {
        setError(`الحقل "${field.labelAr}" مطلوب`);
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateCode: template.code, data: formData }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'فشل الإرسال');

      onSuccess?.(json.document);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FieldDef) => {
    const base =
      'w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/30 ' +
      'focus:outline-none focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm';

    if (field.type === 'textarea') {
      return (
        <textarea
          id={`field-${field.name}`}
          rows={3}
          className={base + ' resize-none'}
          placeholder={field.labelEn}
          value={formData[field.name] || ''}
          onChange={e => handleChange(field.name, e.target.value)}
          required={field.required}
        />
      );
    }

    if (field.type === 'select' && field.options) {
      return (
        <select
          id={`field-${field.name}`}
          className={base + ' cursor-pointer'}
          value={formData[field.name] || ''}
          onChange={e => handleChange(field.name, e.target.value)}
          required={field.required}
        >
          <option value="">— اختر —</option>
          {field.options.map(opt => (
            <option key={opt} value={opt} className="bg-gray-900">{opt}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        id={`field-${field.name}`}
        type={field.type}
        className={base}
        placeholder={field.labelEn}
        value={formData[field.name] || ''}
        onChange={e => handleChange(field.name, e.target.value)}
        required={field.required}
      />
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-white/10">
        <span className="px-2 py-1 text-xs font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
          {template.code}
        </span>
        <div>
          <h3 className="text-white font-bold">{template.titleAr}</h3>
          <p className="text-white/40 text-xs">{template.titleEn}</p>
        </div>
      </div>

      {/* Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map(field => (
          <div
            key={field.name}
            className={field.type === 'textarea' ? 'md:col-span-2' : ''}
          >
            <label
              htmlFor={`field-${field.name}`}
              className="block text-xs font-medium text-white/60 mb-1.5"
            >
              {field.labelAr}
              {field.required && <span className="text-red-400 mr-1">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          ⚠️ {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold
                     hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all text-sm shadow-lg shadow-cyan-500/20"
        >
          {loading ? 'جاري الإرسال...' : '📤 إرسال المستند'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-white/10 text-white/60 hover:text-white
                       hover:border-white/20 transition-all text-sm"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}
