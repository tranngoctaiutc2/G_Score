import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer, Cell
} from 'recharts';
import apiInstance from '../utils/axios';
import { getCache, setCache } from '../utils/cache';
import '@fortawesome/fontawesome-free/css/all.min.css';

const COLORS = ['#2c7be5', '#54ca76', '#f4c22b', '#e63757', '#6f42c1', '#20c997', '#fd7e14', '#6610f2', '#e83e8c', '#17a2b8'];

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

const SUBJECT_FIELD_MAP = {
  'Toán': 'math',
  'Vật lý': 'physics',
  'Hóa học': 'chemistry',
  'Tiếng Anh': 'foreign_language',
  'Ngữ văn': 'literature',
  'Lịch sử': 'history',
  'Địa lý': 'geography',
  'Sinh học': 'biology',
};

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [top, setTop] = useState(10);
  const [group, setGroup] = useState('A00');

  const fetchTopGroup = async (topValue = top, groupValue = group) => {
    setLoading(true);
    try {
      const res = await apiInstance.get(`/top/?top=${topValue}&group=${groupValue}`);
      const formatted = res.data.map((s, index) => ({
        ...s,
        name: `Thí sinh ${s.candidate_id}`,
        fill: COLORS[index % COLORS.length],
      }));
      setData(formatted);
      setCache(`top_group_${groupValue}_${topValue}`, formatted);
    } catch (err) {
      console.error('Lỗi khi gọi API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = getCache(`top_group_${group}_${top}`);
    if (cached) {
      setData(cached);
    } else {
      fetchTopGroup(top, group);
    }
  }, [top, group]);

  const minScore = Math.min(...data.map(d => d.total_score), 0);
  const maxScore = Math.max(...data.map(d => d.total_score), 30);
  const yDomain = [Math.floor(minScore * 10) / 10 - 0.1, Math.ceil(maxScore * 10) / 10 + 0.1];
  const yTicks = [];
  for (let i = yDomain[0]; i <= yDomain[1]; i += 0.5) {
    yTicks.push(Number(i.toFixed(2)));
  }

  const groupSubjects = GROUP_OPTIONS[group]?.join(', ') || '';

  return (
    <div className="container mt-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-3">
        <h2>🏆 Top {top} thí sinh khối {group}</h2>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <label htmlFor="group-select" className="form-label mb-0">Khối:</label>
          <select
            id="group-select"
            className="form-select"
            style={{ width: '120px' }}
            value={group}
            onChange={(e) => setGroup(e.target.value)}
          >
            {Object.keys(GROUP_OPTIONS).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          <label htmlFor="top-select" className="form-label mb-0">Top:</label>
          <select
            id="top-select"
            className="form-select"
            style={{ width: '100px' }}
            value={top}
            onChange={(e) => setTop(Number(e.target.value))}
          >
            {[10, 20, 30].map(num => (
              <option key={num} value={num}>Top {num}</option>
            ))}
          </select>

          <button className="btn btn-primary" onClick={() => fetchTopGroup(top, group)} disabled={loading}>
            <i className="fas fa-sync-alt me-2"></i>
            {loading ? 'Đang tải...' : 'Refresh'}
          </button>
        </div>
      </div>

      <p><strong>Khối {group} gồm các môn:</strong> {groupSubjects}</p>

      {loading && <p>⏳ Đang tải dữ liệu, vui lòng chờ...</p>}

      {!loading && data.length > 0 && (
        <>
          <h5 className="mt-4">📊 Biểu đồ cột theo tổng điểm</h5>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data} margin={{ bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} height={80} />
              <YAxis domain={yDomain} ticks={yTicks} allowDecimals={true} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total_score" name="Tổng điểm" fill="#000">
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <h5 className="mt-4">📋 Danh sách chi tiết</h5>
          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead>
                <tr>
                  <th>Top</th>
                  <th>Mã thí sinh</th>
                  {GROUP_OPTIONS[group].map((subject, i) => (
                    <th key={i}>{subject}</th>
                  ))}
                  <th>Tổng điểm</th>
                </tr>
              </thead>
              <tbody>
                {data.map((s, idx) => (
                  <tr key={s.candidate_id}>
                    <td>{idx + 1}</td>
                    <td>{s.candidate_id}</td>
                    {GROUP_OPTIONS[group].map((subject, i) => {
                      const field = SUBJECT_FIELD_MAP[subject];
                      return <td key={i}>{s[field] ?? '-'}</td>;
                    })}
                    <td>{s.total_score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
