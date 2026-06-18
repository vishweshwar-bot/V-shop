import React, { useState, useEffect } from 'react';
import apiRequest from '../utils/api';
import { Layers, Plus, Trash2, Edit2, Check, X, AlertCircle } from 'lucide-react';

const AdminCategoryListScreen = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Creation State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  // Editing State
  const [editId, setEditId] = useState('');
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await apiRequest('/categories');
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const createHandler = async (e) => {
    e.preventDefault();
    if (!newName.trim() || !newDescription.trim()) return;

    setLoadingCreate(true);
    setError('');
    try {
      await apiRequest('/categories', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          description: newDescription,
        }),
      });
      setNewName('');
      setNewDescription('');
      setShowAddForm(false);
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Category creation failed');
    } finally {
      setLoadingCreate(false);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? Products currently assigned to this category name will remain but will no longer point to an active category record.')) {
      try {
        await apiRequest(`/categories/${id}`, {
          method: 'DELETE',
        });
        fetchCategories();
      } catch (err) {
        alert(err.message || 'Category deletion failed');
      }
    }
  };

  const startEdit = (cat) => {
    setEditId(cat._id);
    setEditName(cat.name);
    setEditDescription(cat.description);
  };

  const cancelEdit = () => {
    setEditId('');
    setEditName('');
    setEditDescription('');
  };

  const updateHandler = async (e) => {
    e.preventDefault();
    if (!editName.trim() || !editDescription.trim()) return;

    setLoadingUpdate(true);
    setError('');
    try {
      await apiRequest(`/categories/${editId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: editName,
          description: editDescription,
        }),
      });
      setEditId('');
      setEditName('');
      setEditDescription('');
      fetchCategories();
    } catch (err) {
      setError(err.message || 'Category update failed');
    } finally {
      setLoadingUpdate(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }} className="text-gradient">
          <Layers size={28} /> Category Management
        </h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setError('');
          }}
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          <span>{showAddForm ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Creation Form */}
      {showAddForm && (
        <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', maxWidth: '600px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Create New Category</h3>
          <form onSubmit={createHandler}>
            <div className="form-group">
              <label htmlFor="cat-name">Category Name</label>
              <input
                type="text"
                id="cat-name"
                className="form-control"
                placeholder="e.g. Smart Home"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="cat-desc">Description</label>
              <textarea
                id="cat-desc"
                className="form-control"
                rows="3"
                placeholder="Briefly describe what this category contains..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loadingCreate}>
              <Check size={16} />
              <span>{loadingCreate ? 'Creating...' : 'Save Category'}</span>
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex-center" style={{ minHeight: '30vh' }}>
          <div className="spinner" />
        </div>
      ) : categories.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlignment: 'center' }}>
          No categories found. Create one above to get started.
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '24px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '12px 8px', width: '25%' }}>Category Name</th>
                <th style={{ padding: '12px 8px', width: '50%' }}>Description</th>
                <th style={{ padding: '12px 8px', width: '25%', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat._id}
                  style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  {editId === cat._id ? (
                    // Editing Row Form
                    <td colSpan="3" style={{ padding: '16px 8px' }}>
                      <form onSubmit={updateHandler} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-control"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            style={{ marginBottom: '8px' }}
                          />
                          <textarea
                            className="form-control"
                            rows="2"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            required
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                          <button type="submit" className="btn btn-primary" style={{ padding: '8px 12px' }} disabled={loadingUpdate}>
                            <Check size={16} />
                          </button>
                          <button type="button" className="btn btn-secondary" style={{ padding: '8px 12px' }} onClick={cancelEdit}>
                            <X size={16} />
                          </button>
                        </div>
                      </form>
                    </td>
                  ) : (
                    // Display Row
                    <>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{cat.name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{cat.description}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => startEdit(cat)}
                            className="btn btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => deleteHandler(cat._id)}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 10px',
                              fontSize: '12px',
                              color: 'var(--danger-color)',
                              borderColor: 'rgba(239, 68, 68, 0.1)',
                              background: 'rgba(239, 68, 68, 0.03)',
                            }}
                          >
                            <Trash2 size={12} />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCategoryListScreen;
