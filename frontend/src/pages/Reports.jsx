import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import apiInstance from '../utils/axios';
import { getCache, setCache } from '../utils/cache';

const subjectOptions = [
  { key: 'math', label: 'Toán' },
  { key: 'literature', label: 'Ngữ Văn' },
  { key: 'foreign_language', label: 'Ngoại Ngữ' },
  { key: 'physics', label: 'Vật Lý' },
  { key: 'chemistry', label: 'Hóa Học' },
  { key: 'biology', label: 'Sinh Học' },
  { key: 'history', label: 'Lịch Sử' },
  { key: 'geography', label: 'Địa Lý' },
  { key: 'civic_education', label: 'GDCD' },
];

const COLORS = ['#2c7be5', '#54ca76', '#f4c22b', '#e63757'];

const Reports = () => {
  const [selectedSubject, setSelectedSubject] = useState('math');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatData = (levels) => [
    { name: '≥ 8 điểm', value: levels['>=8'], fill: COLORS[0] },
    { name: '6 - 7.99 điểm', value: levels['6-8'], fill: COLORS[1] },
    { name: '4 - 5.99 điểm', value: levels['4-6'], fill: COLORS[2] },
    { name: '< 4 điểm', value: levels['<4'], fill: COLORS[3] },
  ];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`/report/by-subject/?subject=${selectedSubject}`);
      const formatted = formatData(res.data.levels);
      setData(formatted);
      setCache(`report_${selectedSubject}`, formatted);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getCache(`report_${selectedSubject}`);
    if (cached) {
      setData(cached);
    } else {
      fetchReport();
    }
  }, [selectedSubject]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">📊 Thống kê theo từng môn học</h2>

      <div className="mb-3 d-flex align-items-center gap-3">
        <select
          className="form-select w-auto"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={loading}
        >
          {subjectOptions.map((subj) => (
            <option key={subj.key} value={subj.key}>{subj.label}</option>
          ))}
        </select>
        <button
          className="btn btn-primary"
          onClick={fetchReport}
          disabled={loading}
        >
          {loading ? 'Đang tải...' : 'Gửi yêu cầu'}
        </button>
      </div>

      {loading && <p>⏳ Đang tải dữ liệu, vui lòng chờ...</p>}

      {data && !loading && (
        <>
          <h5 className="mt-4">📈 Biểu đồ cột</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Số lượng">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <h5 className="mt-4">🥧 Biểu đồ tròn</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
};

export default Reports;
