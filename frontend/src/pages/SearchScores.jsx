import React, { useState } from 'react';
import apiInstance from '../utils/axios';

const subjectLabels = {
  math: 'Toán',
  literature: 'Ngữ Văn',
  foreign_language: 'Ngoại Ngữ',
  physics: 'Vật Lý',
  chemistry: 'Hóa Học',
  biology: 'Sinh Học',
  history: 'Lịch Sử',
  geography: 'Địa Lý',
  civic_education: 'Giáo Dục Công Dân',
};

const SearchScores = () => {
  const [candidateId, setCandidateId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const validateInput = (id) => /^[0-9]{8}$/.test(id);

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setCandidateId(value);
    setIsValid(validateInput(value));
    setSubmitError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setScoreData(null);
    setSubmitError('');

    setLoading(true);
    try {
      const response = await apiInstance.get('check/', {
        params: { candidate_id: candidateId },
      });
      setScoreData(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSubmitError('Không tìm thấy học sinh');
      } else {
        setSubmitError('Đã xảy ra lỗi khi tra cứu');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-3">🔍 Tra cứu điểm thi</h2>

      <form onSubmit={handleSubmit} noValidate className="mb-4">
        <div className="mb-3">
          <label htmlFor="candidateId" className="form-label">Mã số báo danh</label>
          <input
            type="text"
            id="candidateId"
            className={`form-control ${candidateId && !isValid ? 'is-invalid' : ''}`}
            value={candidateId}
            onChange={handleChange}
            placeholder="Ví dụ: 01000001"
          />
          {!isValid && candidateId && (
            <div className="invalid-feedback">
              Mã số báo danh phải gồm đúng 8 chữ số, không chứa chữ cái, ký tự đặc biệt hoặc khoảng trắng.
            </div>
          )}
        </div>

        <button type="submit" className="btn btn-primary" disabled={!isValid || loading}>
          {loading ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {submitError && <div className="alert alert-danger">{submitError}</div>}

      {scoreData && (
        <div className="card">
          <div className="card-header">
            Kết quả: <strong>{scoreData.candidate_id}</strong>
          </div>
          <div className="card-body">
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr>
                  <th>Môn học</th>
                  <th>Điểm</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(subjectLabels).map(([key, label]) => {
                  const value = scoreData[key];
                  if (value == null) return null;
                  return (
                    <tr key={key}>
                      <td>{label}</td>
                      <td>{value}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {scoreData.foreign_language_code && (
              <div className="mt-2">
                Mã ngoại ngữ: <strong>{scoreData.foreign_language_code}</strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchScores;
