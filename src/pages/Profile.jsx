import { useAuth0 } from '@auth0/auth0-react';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function Profile() {
  const { user, isAuthenticated, isLoading, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    phone_number: '',
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [points, setPoints] = useState(user?.app_metadata?.external_points || user?.['https://contentful-app.com/external_points'] || 0);
  const [loadingPoints, setLoadingPoints] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/');
    }
    if (user) {
      setFormData({
        name: user.name || '',
        nickname: user.nickname || '',
        phone_number: user.phone_number || '',
        bio: user.user_metadata?.bio || user['https://contentful-app.com/bio'] || ''
      });
      fetchPoints(user.sub);
    }
  }, [isLoading, isAuthenticated, navigate, user]);

  const fetchPoints = async (userId) => {
    if (!userId) return;
    setLoadingPoints(true);
    try {
      // The user ID might contain pipe characters (auth0|...), so we encode it
      const encodedId = encodeURIComponent(userId);
      const response = await fetch(`https://auth-0-points-demo-integration.free.beeceptor.com/points/${encodedId}`);
      const data = await response.json();
      const pointsValue = data.points || data.value || data.score || 0;
      setPoints(pointsValue);

      // Sync to Auth0 app_metadata via our proxy
      try {
        const token = await getAccessTokenSilently();
        await fetch('/api/sync-points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ points: pointsValue })
        });
        console.log('Points synced to Auth0 profile successfully');
      } catch (syncErr) {
        console.warn('Point sync to Auth0 failed:', syncErr);
      }
    } catch (err) {
      console.error('Error fetching points:', err);
      setPoints('N/A');
    } finally {
      setLoadingPoints(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      const token = await getAccessTokenSilently();
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Update failed');
      
      setMessage({ type: 'success', text: 'Profile updated successfully! Refresh to see changes.' });
      setIsEditing(false);
    } catch (err) {
      console.error('Update error:', err);
      setMessage({ type: 'error', text: 'Failed to update profile. Ensure the proxy server is running.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="container loading"><span className="loader"></span></div>;
  }

  if (!user) return null;

  const visitCount = user['https://contentful-app.com/visit_count'] || 
                     user.app_metadata?.visit_count || 0;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <Link to="/" className="btn-back" style={{ marginBottom: 0 }}>← Back to Articles</Link>
        <button 
          className={`btn-auth ${isEditing ? 'btn-logout' : 'btn-login'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>
      
      {message && (
        <div className={`alert alert-${message.type}`} style={{ marginBottom: '2rem' }}>
          {message.text}
        </div>
      )}

      <div className="card profile-card">
        <div className="profile-header">
          <img src={user.picture} alt={user.name} className="profile-large-avatar" />
          <div className="profile-title-group">
            {isEditing ? (
              <input 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange}
                className="edit-input title-input"
              />
            ) : (
              <h1>{user.name}</h1>
            )}
            <p className="profile-email">{user.email}</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="profile-badge">Visit Count: {visitCount}</span>
              <span className="profile-badge badge-points">
                {loadingPoints ? 'Updating Points...' : `Loyalty Points: ${points}`}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-details">
          <section className="profile-section">
            <h2>Public Information</h2>
            
            <div className="detail-item">
              <label>Nickname</label>
              {isEditing ? (
                <input 
                  type="text" 
                  name="nickname" 
                  value={formData.nickname} 
                  onChange={handleInputChange}
                  className="edit-input"
                />
              ) : (
                <span>{user.nickname || 'Not set'}</span>
              )}
            </div>

            <div className="detail-item">
              <label>Bio</label>
              {isEditing ? (
                <textarea 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleInputChange}
                  className="edit-input edit-textarea"
                />
              ) : (
                <span>{user.user_metadata?.bio || user['https://contentful-app.com/bio'] || 'No bio yet...'}</span>
              )}
            </div>
          </section>

          <section className="profile-section">
            <h2>Contact & Meta</h2>
            <div className="detail-item">
              <label>Phone Number</label>
              {isEditing ? (
                <>
                  <input 
                    type="text" 
                    name="phone_number" 
                    placeholder="+15551234567"
                    value={formData.phone_number} 
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                  <small style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Format: + [Country Code] [Number]
                  </small>
                </>
              ) : (
                <span>{user.phone_number || 'Not set'}</span>
              )}
            </div>
            
            <div className="detail-item">
              <label>Account Type</label>
              <span>{user['https://contentful-app.com/role'] || 'Reader'}</span>
            </div>
          </section>
        </div>

        {isEditing && (
          <div style={{ marginTop: '3rem', textAlign: 'right' }}>
            <button 
              className="btn-auth btn-login" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
