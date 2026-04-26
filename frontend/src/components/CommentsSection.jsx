import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { deleteComment } from '../services/commentsApi';
import { isAuthenticated } from '../services/auth';

function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// fetchComments(entityId) → axios response with { comments }
// addComment(entityId, text) → axios response with { comment }
// onDelete() → optional callback fired after any successful deletion
function CommentsSection({ entityId, currentUserId, isAdmin, fetchComments, addComment, onDelete }) {
  const [comments,   setComments]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [text,       setText]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError,  setFormError]  = useState('');
  const [deleteErr,  setDeleteErr]  = useState('');
  const textareaRef = useRef(null);
  const loggedIn = isAuthenticated();

  useEffect(() => {
    fetchComments(entityId)
      .then(({ data }) => setComments(data.comments))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entityId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) { setFormError('Comment cannot be empty.'); return; }
    setSubmitting(true);
    setFormError('');
    try {
      const { data } = await addComment(entityId, text.trim());
      setComments(prev => [data.comment, ...prev]);
      setText('');
      if (textareaRef.current) textareaRef.current.focus();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to post comment.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(commentId) {
    setDeleteErr('');
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      onDelete?.();
    } catch (err) {
      setDeleteErr(err.response?.data?.error || 'Failed to delete comment.');
    }
  }

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ margin: '0 0 1rem', fontSize: '1.2rem' }}>
        Comments {!loading && `(${comments.length})`}
      </h2>

      {loggedIn ? (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '0.6rem' }}>
                <textarea
                  ref={textareaRef}
                  className="form-textarea"
                  rows={3}
                  placeholder="Write a comment…"
                  value={text}
                  onChange={e => { setText(e.target.value); setFormError(''); }}
                  style={{ resize: 'vertical' }}
                />
              </div>
              {formError && (
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#DC2626' }}>{formError}</p>
              )}
              <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
                {submitting ? 'Posting…' : 'Post comment'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <p style={{ marginBottom: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <Link to="/login" style={{ color: 'var(--primary)' }}>Log in</Link> to leave a comment.
        </p>
      )}

      {deleteErr && (
        <p style={{ color: '#DC2626', fontSize: '0.85rem', marginBottom: '0.75rem' }}>{deleteErr}</p>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading comments…</p>
      ) : comments.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No comments yet. Be the first!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {comments.map(comment => (
            <div key={comment.id} className="card">
              <div className="card-body" style={{ padding: '0.9rem 1.1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{comment.username}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtDate(comment.created_at)}</span>
                  </div>
                  {comment.user_id === currentUserId && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem', color: '#DC2626', flexShrink: 0 }}
                      onClick={() => handleDelete(comment.id)}
                    >
                      Delete
                    </button>
                  )}
                  {isAdmin && comment.user_id !== currentUserId && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.78rem', padding: '0.15rem 0.5rem', color: '#DC2626', flexShrink: 0, opacity: 0.75 }}
                      title="Remove as admin"
                      onClick={() => handleDelete(comment.id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CommentsSection;
