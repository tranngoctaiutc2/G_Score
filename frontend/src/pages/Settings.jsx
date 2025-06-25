import React, { useState, useEffect } from 'react';
import apiInstance from '../utils/axios';

const GROUP_OPTIONS = {
  A00: ['Toán', 'Vật lý', 'Hóa học'],
  A01: ['Toán', 'Vật lý', 'Tiếng Anh'],
  B00: ['Toán', 'Hóa học', 'Sinh học'],
  C00: ['Ngữ văn', 'Lịch sử', 'Địa lý'],
  D01: ['Toán', 'Ngữ văn', 'Tiếng Anh'],
  D07: ['Toán', 'Hóa học', 'Tiếng Anh'],
  A02: ['Toán', 'Vật lý', 'Sinh học'],
  C01: ['Ngữ văn', 'Toán', 'Vật lý'],
  B08: ['Toán', 'Sinh học', 'Tiếng Anh'],
};

const STORAGE_KEY = 'export_form_state';

const Setting = () => {
  const [group, setGroup] = useState('A00');
  const [top, setTop] = useState('');
  const [idsInput, setIdsInput] = useState('');
  const [extraIdsInput, setExtraIdsInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const isUsingIdsOnly = idsInput.trim().length > 0;
  const isUsingTop = top.trim().length > 0;

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGroup(parsed.group || 'A00');
      setTop(parsed.top || '');
      setIdsInput(parsed.idsInput || '');
      setExtraIdsInput(parsed.extraIdsInput || '');
    }
  }, []);

  useEffect(() => {
    const state = { group, top, idsInput, extraIdsInput };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [group, top, idsInput, extraIdsInput]);

  const validateInputs = () => {
    const newErrors = [];

    if (isUsingTop && !isUsingIdsOnly) {
      if (!/^\d+$/.test(top)) {
        newErrors.push('Top phải là số nguyên từ 1 đến 50');
      } else {
        const value = parseInt(top, 10);
        if (value <= 0 || value > 50) {
          newErrors.push('Top phải nằm trong khoảng từ 1 đến 50');
        }
      }

      if (extraIdsInput.trim()) {
        const ids = extraIdsInput.split(',').map(id => id.trim());
        const invalid = ids.filter(id => !/^\d{8}$/.test(id));
        if (invalid.length > 0) {
          newErrors.push('Mỗi mã SBD bổ sung phải gồm đúng 8 chữ số');
        }
      }
    }

    if (isUsingIdsOnly) {
      const ids = idsInput.split(',').map(id => id.trim());
      const invalid = ids.filter(id => !/^\d{8}$/.test(id));
      if (invalid.length > 0) {
        newErrors.push('Mỗi mã SBD phải gồm đúng 8 chữ số');
      }
    }

    if (!isUsingIdsOnly && !isUsingTop) {
      newErrors.push('Bạn cần chọn 1 trong 2 cách xuất: Top hoặc theo SBD.');
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  useEffect(() => {
    validateInputs();
  }, [top, idsInput, extraIdsInput]);

  const handleTopChange = (val) => {
    setTop(val);
    if (val.trim()) setIdsInput('');
  };

  const handleIdsChange = (val) => {
    setIdsInput(val);
    if (val.trim()) {
      setTop('');
      setExtraIdsInput('');
    }
  };

  const handleExport = async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (isUsingIdsOnly) {
        idsInput
          .split(',')
          .map(i => i.trim())
          .forEach(id => params.append('ids', id));
      } else {
        params.append('group', group);
        params.append('top', top);
        if (extraIdsInput.trim()) {
          extraIdsInput
            .split(',')
            .map(i => i.trim())
            .forEach(id => params.append('ids', id));
        }
      }

      const res = await apiInstance.get(`/export-excel/?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `diem_thi_${isUsingIdsOnly ? 'sbd' : group}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi khi xuất Excel:', err);
      alert('Xuất Excel thất bại!');
    }
    setLoading(false);
  };


  return (
    <div className="container mt-4">
      {loading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 9999 }}
        >
          <div className="text-white fs-4">
            <i className="fas fa-spinner fa-spin me-2"></i>
            Đang xuất Excel, vui lòng chờ...
          </div>
        </div>
      )}

      <h3>📥 Cài đặt xuất Excel</h3>
      <hr />

      <div className="mb-4">
        <h5>📌 Cách 1: Xuất theo Top khối + SBD bổ sung</h5>

        <label className="form-label">Khối thi:</label>
        <select
          className="form-select mb-2"
          value={group}
          onChange={e => setGroup(e.target.value)}
          disabled={loading || isUsingIdsOnly}
        >
          {Object.keys(GROUP_OPTIONS).map(g => (
            <option key={g} value={g}>{g} – {GROUP_OPTIONS[g].join(', ')}</option>
          ))}
        </select>

        <label className="form-label">Số lượng Top (1–50):</label>
        <input
          type="text"
          className="form-control mb-2"
          placeholder="VD: 10"
          value={top}
          onChange={e => handleTopChange(e.target.value)}
          disabled={loading || isUsingIdsOnly}
        />

        <label className="form-label">Mã SBD bổ sung (8 chữ số, cách nhau dấu phẩy):</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="VD: 12345678, 23456789"
          value={extraIdsInput}
          onChange={e => setExtraIdsInput(e.target.value)}
          disabled={loading || isUsingIdsOnly}
        />
      </div>

      <div className="mb-4">
        <h5>📌 Cách 2: Xuất theo danh sách mã số báo danh</h5>
        <label className="form-label">Danh sách mã SBD (8 chữ số, cách nhau dấu phẩy):</label>
        <textarea
          className="form-control"
          rows={2}
          placeholder="VD: 12345678, 23456789"
          value={idsInput}
          onChange={e => handleIdsChange(e.target.value)}
          disabled={loading || isUsingTop}
        />
      </div>

      {errors.length > 0 && (
        <div className="alert alert-danger">
          {errors.map((err, idx) => (
            <div key={idx}><i className="fas fa-exclamation-triangle me-2"></i>{err}</div>
          ))}
        </div>
      )}

      <button
        className="btn btn-success"
        onClick={handleExport}
        disabled={loading || errors.length > 0}
      >
        <i className="fas fa-file-excel me-2"></i>
        {loading ? 'Đang xuất...' : 'Xuất Excel'}
      </button>
    </div>
  );
};

export default Setting;
